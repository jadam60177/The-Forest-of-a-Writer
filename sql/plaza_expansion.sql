-- 마감의 숲: 염색공방(1단계 최종 건물) / 광장 2단계 증축 11개
-- 기존 get_plaza, give_to_plaza, shop_items, 가챠, 기념 광장 테이블은 변경하지 않습니다.
-- GitHub PR 병합 *전에* Supabase SQL Editor에서 실행하세요.

create table if not exists public.plaza_expansion_buildings (
  code text primary key,
  stage smallint not null check (stage in (1,2)),
  sort integer not null unique,
  goal integer not null check (goal > 0),
  raised integer not null default 0 check (raised >= 0 and raised <= goal),
  built_at timestamptz
);

create table if not exists public.plaza_expansion_contributions (
  code text not null references public.plaza_expansion_buildings(code),
  discord_id text not null,
  amount bigint not null default 0 check (amount >= 0),
  primary key (code,discord_id)
);

insert into public.plaza_expansion_buildings(code,stage,sort,goal) values
 ('dyeworkshop',1,11,15000),
 ('campfire_2',2,101,10000),
 ('postbox_2',2,102,12000),
 ('bakery_2',2,103,15000),
 ('florist_2',2,104,18000),
 ('lake_2',2,105,20000),
 ('bookstore_2',2,106,25000),
 ('teahouse_2',2,107,30000),
 ('shelter_2',2,108,35000),
 ('festival_2',2,109,40000),
 ('library_2',2,110,45000),
 ('memorial_2',2,111,50000)
on conflict(code) do nothing;

-- 기부·소유자 조회는 서버 함수를 통해서만 허용
revoke all on public.plaza_expansion_buildings from public, anon, authenticated;
revoke all on public.plaza_expansion_contributions from public, anon, authenticated;

create or replace function public.get_plaza_expansion()
returns jsonb
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
 v_id text;
 v_data jsonb;
begin
 if auth.uid() is null then raise exception '로그인이 필요해요'; end if;
 select i.provider_id into v_id from auth.identities i
  where i.user_id=auth.uid() and i.provider='discord' limit 1;
 if v_id is null then raise exception 'Discord 계정을 확인할 수 없어요'; end if;

 select coalesce(jsonb_agg(jsonb_build_object(
   'code',p.code,'stage',p.stage,'sort',p.sort,
   'goal',p.goal,'raised',p.raised,'built_at',p.built_at,
   'givers',(select count(*) from public.plaza_expansion_contributions c where c.code=p.code and c.amount>0),
   'my_amount',(select coalesce(c.amount,0) from public.plaza_expansion_contributions c where c.code=p.code and c.discord_id=v_id)
 ) order by p.sort), '[]'::jsonb) into v_data
 from public.plaza_expansion_buildings p;
 return v_data;
end $$;

create or replace function public.give_to_plaza_expansion(p_amount integer)
returns bigint
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
 v_id text;
 v_coins bigint;
 v_code text;
 v_goal integer;
 v_raised integer;
 v_stage smallint;
 v_pay integer;
 v_old jsonb;
 v_ready boolean;
begin
 if auth.uid() is null then raise exception '로그인이 필요해요'; end if;
 if p_amount is null or p_amount < 1 or p_amount > 100000000 then
   raise exception '1코인 이상 올바른 금액을 보내 주세요';
 end if;
 select i.provider_id into v_id from auth.identities i
   where i.user_id=auth.uid() and i.provider='discord' limit 1;
 if v_id is null then raise exception 'Discord 계정을 확인할 수 없어요'; end if;
 select m.coins into v_coins from public.members m
   where m.discord_id=v_id and not m.removed for update;
 if not found then raise exception '숲 주민만 공동 투자할 수 있어요'; end if;

 -- 기존 마을의 마지막 건물(동물 보호소) 완공 여부를 기존 읽기 함수로 확인합니다.
 -- get_plaza()가 JSON 배열을 반환하거나 TABLE 행을 반환하는 경우 둘 다 지원합니다.
 select coalesce(jsonb_agg(to_jsonb(g)), '[]'::jsonb) into v_old from public.get_plaza() g;
 if jsonb_array_length(v_old)=1 then
   if jsonb_typeof(v_old->0)='array' then v_old := v_old->0;
   elsif jsonb_typeof(v_old->0)='object' and (v_old->0) ? 'get_plaza' then
     v_old := (v_old->0)->'get_plaza';
   end if;
 end if;
 select exists (select 1 from jsonb_array_elements(v_old) x(value)
    where x.value->>'code'='shelter' and nullif(x.value->>'built_at','') is not null)
    into v_ready;
 if not v_ready then raise exception '광장 1단계의 기존 건물이 먼저 완공되어야 해요'; end if;

 select p.code,p.goal,p.raised,p.stage into v_code,v_goal,v_raised,v_stage
 from public.plaza_expansion_buildings p
 where p.built_at is null order by p.sort limit 1 for update;
 if not found then raise exception '광장이 모두 완공되었어요'; end if;
 if v_stage=2 and not exists (
   select 1 from public.plaza_expansion_buildings where code='dyeworkshop' and built_at is not null
 ) then raise exception '염색공방이 먼저 완공되어야 해요'; end if;

 v_pay := least(p_amount,v_goal-v_raised);
 if v_coins < v_pay then raise exception '코인이 부족해요'; end if;
 update public.members set coins=coins-v_pay where discord_id=v_id;
 update public.plaza_expansion_buildings
   set raised=raised+v_pay,
       built_at=case when raised+v_pay>=goal then now() else built_at end
   where code=v_code;
 insert into public.plaza_expansion_contributions(code,discord_id,amount)
   values(v_code,v_id,v_pay)
   on conflict(code,discord_id) do update
   set amount=public.plaza_expansion_contributions.amount+excluded.amount;
 return v_coins-v_pay;
end $$;

revoke all on function public.get_plaza_expansion() from public, anon;
revoke all on function public.give_to_plaza_expansion(integer) from public, anon;
grant execute on function public.get_plaza_expansion() to authenticated;
grant execute on function public.give_to_plaza_expansion(integer) to authenticated;
