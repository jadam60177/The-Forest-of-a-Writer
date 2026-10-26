-- Studio wardrobe V4: separate optional storage. Existing studio_live_*, coin and inactivity logic unchanged.
create table if not exists public.studio_wardrobe_v4 (
 player_id text primary key,
 hair text not null default 'bob' check (hair ~ '^[a-z0-9_]{1,40}$'),
 outfit text not null default 'pajamas' check (outfit ~ '^[a-z0-9_]{1,40}$'),
 eyes text not null default 'round' check (eyes ~ '^[a-z0-9_]{1,40}$'),
 hair_color text check (hair_color is null or hair_color ~ '^#[a-fA-F0-9]{6}$'),
 outfit_color text check (outfit_color is null or outfit_color ~ '^#[a-fA-F0-9]{6}$'),
 updated_at timestamptz not null default now()
);
alter table public.studio_wardrobe_v4 enable row level security;
revoke all on public.studio_wardrobe_v4 from public, anon, authenticated;

create or replace function public.studio_wardrobe_save(
 p_hair text,p_outfit text,p_eyes text,p_hair_color text default null,p_outfit_color text default null
) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare v_me jsonb; v_id text; v_row public.studio_wardrobe_v4%rowtype;
begin
 select to_jsonb(public.studio_live_me()) into v_me;
 v_id:=nullif(btrim(v_me->>'id'),'');
 if v_id is null then raise exception 'studio authentication required' using errcode='28000';end if;
 if p_hair is null or p_hair !~ '^[a-z0-9_]{1,40}$'
   or p_outfit is null or p_outfit !~ '^[a-z0-9_]{1,40}$'
   or p_eyes is null or p_eyes !~ '^[a-z0-9_]{1,40}$'
   or (p_hair_color is not null and p_hair_color !~ '^#[a-fA-F0-9]{6}$')
   or (p_outfit_color is not null and p_outfit_color !~ '^#[a-fA-F0-9]{6}$')
 then raise exception 'invalid wardrobe item' using errcode='22023';end if;
 insert into public.studio_wardrobe_v4(player_id,hair,outfit,eyes,hair_color,outfit_color)
 values(v_id,p_hair,p_outfit,p_eyes,lower(p_hair_color),lower(p_outfit_color))
 on conflict(player_id) do update set hair=excluded.hair,outfit=excluded.outfit,eyes=excluded.eyes,
   hair_color=excluded.hair_color,outfit_color=excluded.outfit_color,updated_at=now()
 returning * into v_row;
 return jsonb_build_object('id',v_row.player_id,'hair',v_row.hair,'outfit',v_row.outfit,'eyes',v_row.eyes,
   'hairColor',v_row.hair_color,'outfitColor',v_row.outfit_color);
end;$$;

create or replace function public.studio_wardrobe_get() returns jsonb
 language plpgsql security definer set search_path=public,pg_temp as $$
declare v_me jsonb; v_id text; v_result jsonb;
begin
 select to_jsonb(public.studio_live_me()) into v_me;
 v_id:=nullif(btrim(v_me->>'id'),'');
 if v_id is null then raise exception 'studio authentication required' using errcode='28000';end if;
 select jsonb_build_object('id',player_id,'hair',hair,'outfit',outfit,'eyes',eyes,
   'hairColor',hair_color,'outfitColor',outfit_color) into v_result
 from public.studio_wardrobe_v4 where player_id=v_id;
 return coalesce(v_result,jsonb_build_object('hair','bob','outfit','pajamas','eyes','round'));
end;$$;

create or replace function public.studio_wardrobe_many(p_ids text[]) returns jsonb
 language plpgsql security definer set search_path=public,pg_temp as $$
declare v_me jsonb; v_result jsonb;
begin
 select to_jsonb(public.studio_live_me()) into v_me;
 if nullif(btrim(v_me->>'id'),'') is null then
    raise exception 'studio authentication required' using errcode='28000';end if;
 if p_ids is null or cardinality(p_ids)>100 then
    raise exception 'invalid user list' using errcode='22023';end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',player_id,'hair',hair,'outfit',outfit,
   'eyes',eyes,'hairColor',hair_color,'outfitColor',outfit_color)),'[]'::jsonb) into v_result
 from public.studio_wardrobe_v4 where player_id=any(p_ids);
 return v_result;
end;$$;
revoke all on function public.studio_wardrobe_save(text,text,text,text,text) from public,anon;
revoke all on function public.studio_wardrobe_get() from public,anon;
revoke all on function public.studio_wardrobe_many(text[]) from public,anon;
grant execute on function public.studio_wardrobe_save(text,text,text,text,text) to authenticated;
grant execute on function public.studio_wardrobe_get() to authenticated;
grant execute on function public.studio_wardrobe_many(text[]) to authenticated;
