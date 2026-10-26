-- 마감의 숲: 서랍장 1종 색 변경 테스트 (2026-10-26)
-- 기존 set_rug_tint 함수에는 손대지 않습니다.
-- Supabase > SQL Editor에서 이 SQL을 한 번만 실행하세요.

alter table public.placements add column if not exists tint text;

create or replace function public.set_drawer_tint(p_id text, p_tint text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_discord_id text;
begin
  if auth.uid() is null then
    raise exception '로그인이 필요합니다';
  end if;

  -- 로그인한 Discord 계정의 실제 provider_id를 서버에서 확인합니다.
  -- 클라이언트가 보내는 소유자 정보는 신뢰하지 않습니다.
  select i.provider_id into v_discord_id
  from auth.identities as i
  where i.user_id = auth.uid() and i.provider = 'discord'
  limit 1;

  if v_discord_id is null then
    raise exception 'Discord 계정을 확인할 수 없습니다';
  end if;

  -- 원래 색(빈 문자열) 또는 기존 색상 프리셋 c1~c11 / h0~h359만 허용합니다.
  if coalesce(p_tint,'') <> '' and
     p_tint !~ '^(c([1-9]|10|11)|h([0-9]|[1-9][0-9]|[12][0-9]{2}|3[0-5][0-9]))$' then
    raise exception '허용되지 않은 색상입니다';
  end if;

  update public.placements as p
     set tint = nullif(p_tint,'')
   where p.id::text = p_id
     and p.discord_id = v_discord_id
     and p.item_code = 'drawer';

  if not found then
    raise exception '본인의 서랍장만 색을 바꿀 수 있습니다';
  end if;
end;
$$;

revoke all on function public.set_drawer_tint(text, text) from public, anon;
grant execute on function public.set_drawer_tint(text, text) to authenticated;
