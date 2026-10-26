-- 마감의 숲 · 광장 2단계 염색약 12종 / 첫 염색 소파 보따리
-- 실행: GitHub PR 병합 전에 Supabase SQL Editor에서 전체 실행
-- 기존 보따리, 복권, 광장 공동 투자 함수 및 확률은 변경하지 않습니다.

create table if not exists public.dye_wallet(
  discord_id text not null,
  color_code text not null,
  uses integer not null default 0 check(uses >= 0),
  primary key(discord_id,color_code)
);
revoke all on public.dye_wallet from public, anon, authenticated;

-- 새 가구도 기존 가방/집 배치 로직으로 다룰 수 있도록 등록합니다.
-- active=false: 상점에서 별도 판매하지 않음 (2단계 보따리에서만 지급)
insert into public.shop_items(code,emoji,name,price,w,h,active,category)
values('dye_armchair','🛋️','🎨 하늘빛 염색 소파',0,1,1,false,'furniture')
on conflict(code) do nothing;

create or replace function public.dye_stage_state()
returns jsonb
language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_id text; v_open boolean; v_furniture boolean; v_paints jsonb; v_owned integer;
begin
  if auth.uid() is null then raise exception '로그인이 필요해요'; end if;
  select i.provider_id into v_id from auth.identities i
   where i.user_id=auth.uid() and i.provider='discord' limit 1;
  if v_id is null or not exists(select 1 from public.members m where m.discord_id=v_id and not m.removed)
  then raise exception '숲 주민만 이용할 수 있어요'; end if;
  select exists(select 1 from public.plaza_expansion_buildings where code='dyeworkshop' and built_at is not null) into v_open;
  select exists(select 1 from public.plaza_expansion_buildings where code='campfire_2' and built_at is not null) into v_furniture;
  select coalesce(jsonb_agg(jsonb_build_object('code',w.color_code,'uses',w.uses)), '[]'::jsonb)
   into v_paints from public.dye_wallet w where w.discord_id=v_id;
  select coalesce(sum(qty),0) into v_owned from public.inventory
    where discord_id=v_id and item_code='dye_armchair';
  return jsonb_build_object('open',v_open,'furniture_open',v_furniture,'paints',v_paints,'sofa_bag',v_owned);
end;
$$;

create or replace function public.dye_stage_pull(p_kind text,p_count integer)
returns jsonb
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_id text; v_balance bigint; v_price integer; v_total integer; v_i integer;
  v_code text; v_rarity text; v_r double precision; v_pool text[];
  v_out jsonb:='[]'::jsonb; v_required text;
begin
  if auth.uid() is null then raise exception '로그인이 필요해요'; end if;
  if coalesce(p_count,0) not in (1,10) or coalesce(p_kind,'') not in ('paint','sofa') then
    raise exception '보따리 종류나 횟수가 올바르지 않아요'; end if;
  select i.provider_id into v_id from auth.identities i
   where i.user_id=auth.uid() and i.provider='discord' limit 1;
  if v_id is null then raise exception 'Discord 계정을 확인할 수 없어요'; end if;
  v_required := case when p_kind='paint' then 'dyeworkshop' else 'campfire_2' end;
  if not exists(select 1 from public.plaza_expansion_buildings
    where code=v_required and built_at is not null) then
    raise exception '아직 열리지 않은 보따리예요'; end if;
  v_price := case when p_kind='paint' then 100 else 250 end;
  v_total := case when p_count=10 then v_price*9 else v_price end;
  select m.coins into v_balance from public.members m
    where m.discord_id=v_id and not m.removed for update;
  if not found then raise exception '숲 주민만 이용할 수 있어요'; end if;
  if v_balance < v_total then raise exception '코인이 부족해요'; end if;
  update public.members set coins=coins-v_total where discord_id=v_id;
  for v_i in 1..p_count loop
    if p_kind='paint' then
      v_r := random()*100;
      if v_r < 70 then
        v_rarity:='common';
        v_pool:=array['rose','apricot','vanilla','sage','mint'];
      elsif v_r < 95 then
        v_rarity:='rare';
        v_pool:=array['lavender','mistblue','cocoa','walnut'];
      else
        v_rarity:='legend';
        v_pool:=array['night','silver','ebony'];
      end if;
      v_code:=v_pool[1+floor(random()*array_length(v_pool,1))::integer];
      insert into public.dye_wallet(discord_id,color_code,uses)
        values(v_id,v_code,10)
        on conflict(discord_id,color_code) do update set uses=public.dye_wallet.uses+10;
    else
      v_code:='dye_armchair'; v_rarity:='rare';
      insert into public.inventory(discord_id,item_code,qty)
        values(v_id,v_code,1)
        on conflict(discord_id,item_code) do update set qty=public.inventory.qty+1;
    end if;
    v_out:=v_out || jsonb_build_array(jsonb_build_object('code',v_code,'rarity',v_rarity));
  end loop;
  return v_out;
end;
$$;

create or replace function public.dye_stage_recharge(p_color text)
returns integer
language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_id text; v_balance bigint; v_uses integer;
begin
  if auth.uid() is null then raise exception '로그인이 필요해요'; end if;
  select i.provider_id into v_id from auth.identities i
    where i.user_id=auth.uid() and i.provider='discord' limit 1;
  if v_id is null then raise exception 'Discord 계정 정보가 없어요'; end if;
  select coins into v_balance from public.members where discord_id=v_id and not removed for update;
  if not found then raise exception '숲 주민만 이용할 수 있어요'; end if;
  if not exists(select 1 from public.dye_wallet where discord_id=v_id and color_code=p_color) then
    raise exception '먼저 보따리에서 이 색상을 얻어야 해요'; end if;
  if v_balance < 200 then raise exception '충전에는 200코인이 필요해요'; end if;
  update public.members set coins=coins-200 where discord_id=v_id;
  update public.dye_wallet set uses=uses+10 where discord_id=v_id and color_code=p_color returning uses into v_uses;
  return v_uses;
end;
$$;

create or replace function public.dye_stage_paint(p_id text,p_color text)
returns void
language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_id text; v_plid bigint; v_current text;
begin
  if auth.uid() is null then raise exception '로그인이 필요해요'; end if;
  select i.provider_id into v_id from auth.identities i
    where i.user_id=auth.uid() and i.provider='discord' limit 1;
  if v_id is null then raise exception 'Discord 계정을 확인할 수 없어요'; end if;
  if p_id is null or p_id !~ '^[0-9]{1,18}$' then raise exception '가구 번호가 잘못되었어요'; end if;
  v_plid:=p_id::bigint;
  select coalesce(p.tint,'') into v_current from public.placements p
    where p.id=v_plid and p.discord_id=v_id and p.item_code='dye_armchair'
    for update;
  if not found then raise exception '본인의 염색 소파만 색을 바꿀 수 있어요'; end if;
  if p_color = 'sky' then
    update public.placements set tint=null where id=v_plid and discord_id=v_id;
    return;
  end if;
  if p_color not in ('rose','apricot','vanilla','sage','mint',
       'lavender','mistblue','cocoa','walnut','night','silver','ebony') then
    raise exception '알 수 없는 염색약입니다'; end if;
  if v_current='dy_'||p_color then return; end if; -- 같은 색 재선택은 무료
  update public.dye_wallet set uses=uses-1
    where discord_id=v_id and color_code=p_color and uses > 0;
  if not found then raise exception '염색약이 부족해요. 충전하거나 보따리에서 뽑아 주세요'; end if;
  update public.placements set tint='dy_'||p_color where id=v_plid and discord_id=v_id;
end;
$$;

revoke all on function public.dye_stage_state() from public, anon;
revoke all on function public.dye_stage_pull(text,integer) from public, anon;
revoke all on function public.dye_stage_recharge(text) from public, anon;
revoke all on function public.dye_stage_paint(text,text) from public, anon;
grant execute on function public.dye_stage_state() to authenticated;
grant execute on function public.dye_stage_pull(text,integer) to authenticated;
grant execute on function public.dye_stage_recharge(text) to authenticated;
grant execute on function public.dye_stage_paint(text,text) to authenticated;
