-- 마감의 숲 · 10-12 새 가구 3개 + 주방 조리대 교체
-- Supabase SQL Editor 에 통째로 붙여 넣고 Run 한 번이면 돼요. (두 번 돌려도 괜찮아요)

-- 1) 새 가구 4개 (모두 2×2칸, 가구 탭)
insert into shop_items (code, emoji, name, price, w, h, active, category, sort)
select v.code, v.emoji, v.name, v.price, 2, 2, true, 'furniture',
       (select coalesce(max(sort), 0) from shop_items) + v.n
from (values
  (1, 'draftdesk',   '✏️', '창작용 제도 책상',   420),
  (2, 'windowbed',   '🛋️', '창가 소파 베드',     520),
  (3, 'coffeebar',   '☕', '심야 홈 카페 바',    480),
  (4, 'cookstation', '🍳', '요리용 주방 조리대', 400)
) as v(n, code, emoji, name, price)
where not exists (select 1 from shop_items s where s.code = v.code);

-- 2) 예전 조리대는 상점에서만 내려요 (이미 산 주민은 그대로 갖고 있고, 되팔기도 돼요)
update shop_items set active = false where code = 'kitchen';

notify pgrst, 'reload schema';
