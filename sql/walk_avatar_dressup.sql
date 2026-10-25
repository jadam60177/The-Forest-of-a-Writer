-- 마감의 숲 · Jadewood 도트 아바타용 Supabase SQL
-- 이 파일은 자동 적용되지 않습니다. PR 병합 전 Supabase SQL Editor에서 실행해 주세요.
-- 기존 walk.sql/set_walk_look 컬럼은 변경하지 않습니다.
-- 보안: 코인 차감 및 구매 소유권 검증은 SECURITY DEFINER RPC에서만 처리됩니다.

create table if not exists public.walk_avatar_profiles (
  discord_id text primary key,
  body text not null default 'body_light',
  outfit text not null default 'outfit_tunic',
  hair text not null default 'hair_short_brown',
  hat text not null default 'hat_none',
  updated_at timestamptz not null default now()
);
create table if not exists public.walk_avatar_purchases (
  discord_id text not null,
  item_code text not null,
  purchased_at timestamptz not null default now(),
  primary key (discord_id, item_code)
);
alter table public.walk_avatar_profiles enable row level security;
alter table public.walk_avatar_purchases enable row level security;
revoke all on public.walk_avatar_profiles from anon, authenticated;
revoke all on public.walk_avatar_purchases from anon, authenticated;

-- 로그인 사용자가 연결한 Discord identity에서 ID를 가져옵니다.
-- 사용자가 직접 고칠 수 있는 user_metadata는 신뢰하지 않습니다.
create or replace function public.walk_avatar_identity() returns text
language sql stable security definer set search_path = ''
as $$
  select coalesce(i.identity_data->>'provider_id', i.identity_data->>'sub', i.identity_data->>'id')
  from auth.identities i
  where i.user_id = auth.uid() and i.provider = 'discord'
  limit 1
$$;
revoke all on function public.walk_avatar_identity() from public, anon, authenticated;

create or replace function public.walk_avatar_mine() returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_id text := public.walk_avatar_identity();
  v_look public.walk_avatar_profiles%rowtype;
  v_coins integer;
  v_owned jsonb;
begin
  if v_id is null then raise exception 'Discord 로그인이 필요해요'; end if;
  select m.coins into v_coins from public.members m
    where m.discord_id = v_id and not m.removed;
  if not found then raise exception '숲 주민 계정을 확인할 수 없어요'; end if;

  insert into public.walk_avatar_profiles(discord_id) values (v_id)
    on conflict(discord_id) do nothing;
  select * into v_look from public.walk_avatar_profiles where discord_id = v_id;
  select coalesce(jsonb_agg(p.item_code order by p.item_code),'[]'::jsonb)
    into v_owned from public.walk_avatar_purchases p where p.discord_id = v_id;
  return jsonb_build_object('look',jsonb_build_object(
    'body',v_look.body,'outfit',v_look.outfit,'hair',v_look.hair,'hat',v_look.hat),
    'owned',v_owned,'coins',v_coins);
end $$;

-- 아이템 가격은 서버에 고정합니다. 클라이언트의 가격/잔액은 믿지 않습니다.
create or replace function public.walk_avatar_buy(p_code text) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_id text := public.walk_avatar_identity();
  v_price integer;
  v_coins integer;
begin
  if v_id is null then raise exception 'Discord 로그인이 필요해요'; end if;
  v_price := case
    when p_code ~ '^hair_(short|long|ponytail|bob|spiky|buns)_(brown|black|blonde|ginger|pink|mint)$'
      and p_code <> 'hair_short_brown' then 1
    when p_code = 'outfit_robe' then 3
    when p_code = 'outfit_armor' then 5
    when p_code = 'outfit_dress' then 3
    when p_code = 'hat_beanie' then 2
    when p_code = 'hat_wizard_hat' then 4
    when p_code = 'hat_crown' then 5
    else null end;
  if v_price is null then raise exception '구매할 수 없는 의상이에요'; end if;
  select m.coins into v_coins from public.members m
    where m.discord_id = v_id and not m.removed for update;
  if not found then raise exception '숲 주민 계정을 확인할 수 없어요'; end if;

  if exists(select 1 from public.walk_avatar_purchases p
     where p.discord_id = v_id and p.item_code = p_code) then
    return jsonb_build_object('already_owned',true,'coins',v_coins);
  end if;
  if v_coins < v_price then raise exception '코인이 부족해요'; end if;
  update public.members set coins = coins - v_price where discord_id = v_id;
  insert into public.walk_avatar_purchases(discord_id,item_code) values(v_id,p_code);
  return jsonb_build_object('already_owned',false,'cost',v_price,'coins',v_coins-v_price);
end $$;

create or replace function public.walk_avatar_wear(
  p_body text, p_outfit text, p_hair text, p_hat text
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_id text := public.walk_avatar_identity();
begin
  if v_id is null then raise exception 'Discord 로그인이 필요해요'; end if;
  if not exists(select 1 from public.members m where m.discord_id=v_id and not m.removed)
    then raise exception '숲 주민 계정을 확인할 수 없어요'; end if;
  if p_body not in ('body_light','body_tan','body_brown','body_deep')
    or p_outfit not in ('outfit_tunic','outfit_robe','outfit_armor','outfit_dress')
    or p_hair !~ '^hair_(short|long|ponytail|bob|spiky|buns)_(brown|black|blonde|ginger|pink|mint)$'
    or p_hat not in ('hat_none','hat_wizard_hat','hat_crown','hat_beanie')
  then raise exception '올바르지 않은 아바타 아이템이에요'; end if;
  if exists (
    select 1 from (values (p_outfit,'outfit_tunic'),(p_hair,'hair_short_brown'),(p_hat,'hat_none'))
      as x(code,free_code)
    where x.code<>x.free_code and not exists(
      select 1 from public.walk_avatar_purchases p
      where p.discord_id=v_id and p.item_code=x.code)
  ) then raise exception '구매하지 않은 옷은 착용할 수 없어요'; end if;
  insert into public.walk_avatar_profiles(discord_id,body,outfit,hair,hat,updated_at)
    values(v_id,p_body,p_outfit,p_hair,p_hat,now())
    on conflict(discord_id) do update set body=excluded.body,
      outfit=excluded.outfit,hair=excluded.hair,hat=excluded.hat,updated_at=now();
  return jsonb_build_object('body',p_body,'outfit',p_outfit,'hair',p_hair,'hat',p_hat);
end $$;

revoke all on function public.walk_avatar_mine() from public, anon;
revoke all on function public.walk_avatar_buy(text) from public, anon;
revoke all on function public.walk_avatar_wear(text,text,text,text) from public, anon;
grant execute on function public.walk_avatar_mine() to authenticated;
grant execute on function public.walk_avatar_buy(text) to authenticated;
grant execute on function public.walk_avatar_wear(text,text,text,text) to authenticated;
