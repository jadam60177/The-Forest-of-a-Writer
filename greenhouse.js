/* 🪴 마감의 숲 · 온실 (greenhouse.js, 10-25)
   index.html 다음에 불러와요. 서버 함수는 greenhouse.sql (get_gh · get_gh_of · gh_open · gh_bg · gh_buy · gh_place · gh_move · gh_remove)
   그림은 gh/ 폴더 (가구 = gh/코드.webp · 배경 = gh/bg_*.webp)
   칸 없이 배경 위에 스티커처럼 놓아요. x = 가운데(0~1), y = 발끝(0~1, 걸이는 윗부분). 작은 화분은 테이블·선반 위(on)에 올라가요 */
(()=>{
const css = document.createElement('style'); css.textContent = `
.gh-box{display:flex;flex-direction:column;gap:.7rem}
.gh-box .gh-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.4rem}
.gh-box .gh-head h3{margin:0}
.gh-stage{position:relative;width:100%;aspect-ratio:1691/930;border-radius:16px;overflow:hidden;background:#cfe0c4 center/cover no-repeat;
  border:3px solid #6E4A2E;box-shadow:0 8px 22px rgba(0,0,0,.25);container-type:inline-size;user-select:none;-webkit-user-select:none}
.gh-stage.edit{touch-action:none}
.gh-it{position:absolute;transform-origin:50% 100%}
.gh-stage.edit .gh-it{cursor:grab;touch-action:none}
.gh-it img{display:block;width:100%;height:auto;pointer-events:none;filter:drop-shadow(0 .5cqw .45cqw rgba(50,30,10,.28))}
.gh-it.flip img{transform:scaleX(-1)}
.gh-it.sel img{filter:drop-shadow(0 0 .25cqw #fff) drop-shadow(0 0 .5cqw #F2B544) drop-shadow(0 .5cqw .45cqw rgba(50,30,10,.28))}
.gh-it.host img{filter:drop-shadow(0 0 .3cqw #FFF6C8) drop-shadow(0 0 .8cqw #F2B544)}
.gh-it.drag{cursor:grabbing}
.gh-tools{position:absolute;display:flex;gap:3px;padding:3px;background:#FFF9EC;border:2px solid #6E4A2E;border-radius:999px;box-shadow:0 4px 10px rgba(0,0,0,.25);z-index:5000;transform:translate(-50%,-115%);white-space:nowrap}
.gh-tools button{font-family:"Jua",sans-serif;font-size:.85rem;border:0;background:transparent;color:#3D2A1A;border-radius:999px;padding:.3rem .6rem;cursor:pointer}
.gh-tools button:hover{background:#FFE7A8}
.gh-tools .del{color:#9A3B2A}
.gh-chips{display:flex;flex-wrap:wrap;gap:.35rem}
.gh-chip{font-family:"Jua",sans-serif;font-size:.88rem;border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:999px;padding:.28rem .8rem;cursor:pointer}
.gh-chip small{opacity:.7;font-size:.75rem}
.gh-chip.on{background:#F2B544;border-color:#F2B544;color:#3A2400}
.gh-chip.lock{border-style:dashed}
.gh-tray{display:grid;grid-template-columns:repeat(auto-fill,minmax(108px,1fr));gap:.5rem}
.gh-card{border:1px solid var(--line);background:var(--panel, rgba(255,255,255,.05));border-radius:14px;padding:.45rem .35rem .5rem;display:flex;flex-direction:column;align-items:center;gap:.15rem;cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none;position:relative}
.gh-card:hover{border-color:#F2B544}
.gh-card .pic{height:70px;display:flex;align-items:flex-end;justify-content:center}
.gh-card img{max-height:70px;max-width:86px;pointer-events:none}
.gh-card b{font-family:"Jua",sans-serif;font-weight:400;font-size:.84rem;text-align:center;line-height:1.2;word-break:keep-all}
.gh-card .pr{font-size:.75rem;opacity:.85}
.gh-card .have{position:absolute;top:.3rem;right:.35rem;font-family:"Jua",sans-serif;font-size:.75rem;background:#5E7F45;color:#FFF9EC;border-radius:999px;padding:0 .45rem}
.gh-fly{position:fixed;pointer-events:none;z-index:9999;opacity:.9;transform:translate(-50%,-85%)}
.gh-fly img{width:100%;filter:drop-shadow(0 6px 8px rgba(0,0,0,.3))}
.gh-fold{border:1px solid var(--line);border-radius:14px;padding:.55rem .8rem}
.gh-fold > summary{cursor:pointer;font-family:"Jua",sans-serif;font-size:1.02rem;list-style:none;display:flex;flex-wrap:wrap;align-items:center;gap:.4rem}
.gh-fold > summary::-webkit-details-marker{display:none}
.gh-fold > summary::before{content:"▸";transition:transform .2s}
.gh-fold[open] > summary::before{transform:rotate(90deg)}
.gh-fold[open] > .gh-chips{margin-bottom:.5rem}
.gh-door{text-align:center;padding:1rem;border:1px dashed var(--line);border-radius:16px}
.gh-door .gh-stage{margin:0 auto .8rem;max-width:640px;filter:saturate(.8)}
.gh-box .small{font-size:.82rem;opacity:.8}
@media (max-width:600px){.gh-tools button{font-size:.75rem;padding:.25rem .45rem}.gh-tray{grid-template-columns:repeat(auto-fill,minmax(92px,1fr))}}
`; document.head.appendChild(css);

const AR = 1691/930;   // 배경 가로/세로
// w: 맨 앞에 놓였을 때 온실 너비 대비 크기 · a: 그림 세로/가로 · surf: 화분 올리는 층(아래에서부터 높이 비율, 가로 범위)
const DEF = [
  ['monstera','몬스테라 화분',.17,'pot'],['rubber','떡갈고무나무',.115,'pot'],['succulent','다육이 삼단 선반',.16,'pot'],['geranium','제라늄 화분',.1,'pot',1],['terrarium','유리 돔 테라리움',.075,'pot',1],
  ['p_cherry','벚꽃 분재 화분',.075,'pot',1],['p_monstera2','받침대 몬스테라',.09,'pot',1],['p_hydrangea','푸른 수국 화분',.085,'pot',1],['p_urn','대리석 꽃덩굴 화분',.085,'pot',1],
  ['p_bamboo','대나무 사각 화분',.075,'pot',1],['p_lotus','연꽃 수반',.1,'pot',1],['p_tangerine','귤나무 항아리',.09,'pot',1],['p_bellflower','요정 종꽃 화분',.08,'pot',1],['p_lily','받침대 스파티필름',.08,'pot',1],
  ['p_olive','올리브나무 화분',.09,'pot',1],['p_areca','받침대 아레카야자',.08,'pot',1],['p_clematis','클레마티스 오벨리스크',.08,'pot'],['p_pine','소나무 분재',.11,'pot',1],
  ['p_hydrangea2','분홍 수국 화분',.09,'pot',1],['p_whitelily','백합 화병',.075,'pot',1],['p_wisteria2','등나무 트렐리스',.09,'pot'],['p_monstera3','몬스테라 둥근 화분',.1,'pot',1],['p_orange','오렌지나무 청화 화분',.085,'pot',1],
  ['p_olive2','은잎 올리브 화분',.085,'pot',1],['p_bamboo2','대나무 격자 상자',.085,'pot',1],['p_lavender','라벤더 화병',.08,'pot',1],['p_lemon','레몬나무 화분',.09,'pot',1],['p_bird','받침대 극락조',.085,'pot',1],
  ['p_hydrangea3','보석 받침 수국',.08,'pot',1],['p_cherry2','벚꽃 분재 수반',.1,'pot',1],['p_calla','칼라 백합 화병',.075,'pot',1],['p_lampwist','등불 등나무',.07,'pot'],['p_lotus2','분홍 연꽃 수반',.1,'pot',1],
  ['fern','행잉 고사리 바구니',.13,'hang'],['ivy','늘어진 아이비 화분',.085,'hang'],['h_wisteria','등나무 걸이 화분',.085,'hang'],['h_pothos','스킨답서스 걸이 화분',.075,'hang'],
  ['longtable','긴 원목 테이블',.26,'table',0,[[.78,.04,.96],[.35,.1,.9]]],['stool','철제 화분 스툴',.055,'table',0,[[.9,.15,.85]]],['glasstable','라탄 유리 티테이블',.1,'table',0,[[.77,.1,.9],[.32,.2,.8]]],
  ['bench','정원사 작업대',.24,'table',0,[[.655,.04,.96]]],['potbench','걸이 달린 작업대',.2,'table',0,[[.66,.05,.95],[.24,.1,.9]]],['planterbox','원목 화분 상자',.19,'table',0,[[.9,.06,.94],[.34,.1,.9]]],
  ['openshelf','원목 삼단 선반',.15,'table',0,[[.94,.08,.88],[.65,.12,.85],[.29,.12,.85]]],['ironstand','철제 삼단 스탠드',.11,'table',0,[[.71,.2,.8],[.45,.15,.85],[.19,.12,.88]]],
  ['watering','물뿌리개와 양동이',.14,'misc',1],['rocker','고리버들 흔들의자',.16,'misc'],
].map(([k,n,w,cat,small,surf])=>({k, n, w, cat, small:!!small, hang:cat==='hang', surf: surf ? surf.map(([h,a,b])=>({h, span:[a,b]})) : null}));
const SIZE = {"bench":[437,362],"fern":[304,420],"geranium":[257,307],"glasstable":[264,249],"h_pothos":[193,380],"h_wisteria":[193,380],"ironstand":[202,412],"ivy":[203,420],"longtable":[577,209],"monstera":[345,420],"openshelf":[235,304],"p_areca":[238,380],"p_bamboo":[241,380],"p_bamboo2":[214,380],"p_bellflower":[265,380],"p_bird":[239,380],"p_calla":[253,380],"p_cherry":[221,380],"p_cherry2":[278,380],"p_clematis":[185,380],"p_hydrangea":[292,367],"p_hydrangea2":[272,380],"p_hydrangea3":[255,380],"p_lampwist":[194,380],"p_lavender":[204,380],"p_lemon":[268,380],"p_lily":[249,380],"p_lotus":[285,380],"p_lotus2":[294,380],"p_monstera2":[251,380],"p_monstera3":[294,380],"p_olive":[236,380],"p_olive2":[230,380],"p_orange":[223,380],"p_pine":[351,380],"p_tangerine":[256,380],"p_urn":[278,380],"p_whitelily":[211,380],"p_wisteria2":[252,380],"planterbox":[395,251],"potbench":[443,373],"rocker":[324,370],"rubber":[231,420],"stool":[155,322],"succulent":[331,412],"terrarium":[191,281],"watering":[326,212]};
const byK = Object.fromEntries(DEF.map(d=>[d.k,d]));
const BGS = [
  {k:'bg_sun', n:'☀️ 햇살 정원', floor:.66}, {k:'bg_glass', n:'🪵 나무 유리 온실', floor:.74}, {k:'bg_sakura', n:'🌸 벚꽃 한옥 온실', floor:.66},
  {k:'bg_city', n:'🏙️ 도심 온실', floor:.66}, {k:'bg_magic', n:'🏰 마법 성곽 온실', floor:.66}, {k:'bg_med', n:'🏛️ 지중해 테라스', floor:.68}];
const bgOf = k => BGS.find(b=>b.k===k) || BGS[0];
const CEIL = [.02, .2];
const CATS = [['pot','🪴 화분'],['hang','🪝 걸이 화분'],['table','🪵 테이블·선반'],['misc','🧺 소품']];
const IMGV = 1, img = k => `gh/${k}.webp?v=${IMGV}`;
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const esc2 = s => (typeof esc==='function' ? esc(s) : String(s));

/* ---------- 자리 계산 (그림 크기만으로 정해져서 그림이 늦게 떠도 안 흔들려요) ---------- */
function layout(items, bg){
  const F = [bgOf(bg).floor, 1], byId = Object.fromEntries(items.map(i=>[i.id, i])), out = {};
  const depth = it => { const d = byK[it.code]; if(!d || d.hang) return 1; return .62 + .38*clamp((it.y-F[0])/(F[1]-F[0]), 0, 1); };
  const base = it => { const d = byK[it.code]; return {w: d.w*(+it.s||1)*depth(it)}; };
  items.forEach(it=>{ const d = byK[it.code]; if(!d) return; const host = it.on && byK[(byId[it.on]||{}).code] ? byId[it.on] : null;
    if(host) return;
    const w = base(it).w; out[it.id] = {x:it.x, y:it.y, w, z: d.hang ? 3000 : Math.round(it.y*1000), hang:d.hang}; });
  items.forEach(it=>{ const d = byK[it.code]; if(!d) return; const t = it.on ? byId[it.on] : null, T = t && out[t.id]; if(!T) return;
    const td = byK[t.code], S = (td.surf||[])[it.lv||0] || (td.surf||[])[0]; if(!S){ return; }
    const sz = SIZE[t.code] || [1,1], th = T.w * sz[1]/sz[0] * AR;     // 테이블 높이 (온실 높이 비율)
    const w = d.w*(+it.s||1)*depth(t), x = T.x + (+it.ox||0)*T.w, y = T.y - th*S.h;
    out[it.id] = {x, y, w, z: T.z + 1 + (it.lv||0), on:true}; });
  return out;
}
function itemsHTML(items, bg, sel){
  const L = layout(items, bg);
  return items.filter(it=>L[it.id]).map(it=>{ const p = L[it.id], d = byK[it.code];
    const pos = p.hang ? `top:${(p.y*100).toFixed(2)}%` : `bottom:${((1-p.y)*100).toFixed(2)}%`;
    return `<div class="gh-it ${it.f?'flip':''} ${sel===it.id?'sel':''}" data-ghid="${it.id}" style="width:${(p.w*100).toFixed(2)}%;left:${((p.x-p.w/2)*100).toFixed(2)}%;${pos};z-index:${p.z}" aria-label="${esc2(d.n)}"><img src="${img(it.code)}" alt="" draggable="false" loading="lazy"></div>`; }).join('');
}
// 이웃 집 구경 (보기만)
window.GH_viewHTML = G => `<div class="gh-stage" style="background-image:url(${img(G.bg||'bg_sun')})">${itemsHTML(G.items||[], G.bg)}</div>`;

/* ---------- 내 온실 ---------- */
let GH = null, CAT = 'pot', SEL = null, busy2 = false, FOLD = true;
try{ FOLD = localStorage.getItem('majam-ghfold') !== '0'; }catch(e){}
try{ CAT = localStorage.getItem('majam-ghcat') || 'pot'; }catch(e){}
const box = () => document.getElementById('ghBox');
async function refresh(){ try{ GH = api.gh ? await api.gh() : null; }catch(e){ GH = null; } }
function take(r){ const x = Array.isArray(r) ? r[0] : r; if(x && (x.open!==undefined)) GH = x; if(GH && GH.coins!=null && typeof ME!=='undefined' && ME) ME.coins = GH.coins; }
window.GH_refresh = refresh;
window.GH_render = render;

function render(force){
  const b = box(); if(!b) return;
  if(D || C) return;   // 끄는 중엔 다시 그리지 않아요
  const key = JSON.stringify([GH, CAT, SEL, FOLD, typeof ME!=='undefined' && ME ? ME.coins : 0]);
  if(!force && b._k === key && b.firstChild) return; b._k = key;
  if(!GH){ b.innerHTML = `<p class="small">🪴 온실을 불러오는 중이에요…</p>`; refresh().then(()=>{ if(GH) render(); else b.innerHTML = `<p class="small">🪴 온실을 아직 열 수 없어요. 숲지기가 준비 중이에요.</p>`; }); return; }
  if(!GH.open){
    b.innerHTML = `<div class="gh-box"><div class="gh-door"><div class="gh-stage" style="background-image:url(${img('bg_sun')})"></div>
      <h3 style="margin:.2rem 0">🪴 나만의 유리 온실</h3>
      <p class="small" style="margin:.3rem 0 .8rem">햇살 드는 온실에 화분·테이블·선반을 원하는 자리에 놓아 꾸며요.<br>작은 화분은 테이블과 선반 위에도 올라가요. 배경도 바꿔 끼울 수 있어요.</p>
      <button class="pull" type="button" data-ghopen ${ME.coins < (GH.price||500) ? 'disabled' : ''}>🪴 온실 문 열기 · 🪙 ${(GH.price||500).toLocaleString()}</button></div></div>`;
    return;
  }
  const inv = GH.inv || {}, prices = GH.prices || {}, bgs = GH.bgs || ['bg_sun'], n = (GH.items||[]).length;
  b.innerHTML = `<div class="gh-box">
    <div class="gh-head"><h3>🪴 우리 집 온실 <span class="small">가구 ${n} / ${GH.max_items||80}</span></h3><span class="small">🪙 ${ME.coins.toLocaleString()}</span></div>
    <div class="gh-stage edit" id="ghStage" style="background-image:url(${img(GH.bg)})">${itemsHTML(GH.items||[], GH.bg, SEL)}</div>
    <div class="gh-chips" aria-label="온실 배경">${BGS.map(x=>{ const own = bgs.includes(x.k);
      return `<button class="gh-chip ${GH.bg===x.k?'on':''} ${own?'':'lock'}" type="button" data-ghbg="${x.k}">${x.n}${own?'':` <small>🪙 ${(GH.bg_price||300).toLocaleString()}</small>`}</button>`; }).join('')}</div>
    <p class="small" style="margin:0">가구를 끌어서 옮기고, 누르면 뒤집기·크기·창고로 넣기를 할 수 있어요. 아래(앞)에 둘수록 크게 보여요. 작은 화분을 테이블·선반 위로 끌면 반짝이고, 놓으면 그 위에 올라가요.</p>
    <details class="gh-fold" ${FOLD?'':'open'}><summary>🧺 온실 가구 바구니 <span class="small">${DEF.length}종 · 창고 ${Object.values(inv).reduce((a,b)=>a+b,0)}개 · ${FOLD?'눌러서 펼치기':'눌러서 접기'}</span></summary>
    <p class="small" style="margin:.4rem 0">창고에 있는 건 끌어서 놓고, 없는 건 눌러서 사요</p>
    <div class="gh-chips">${CATS.map(([k,nm])=>`<button class="gh-chip ${CAT===k?'on':''}" type="button" data-ghcat="${k}">${nm} <small>${DEF.filter(d=>d.cat===k).length}</small></button>`).join('')}</div>
    <div class="gh-tray">${DEF.filter(d=>d.cat===CAT).map(d=>{ const have = inv[d.k]||0;
      return `<div class="gh-card" data-ghk="${d.k}" role="button" tabindex="0" aria-label="${esc2(d.n)}">${have?`<span class="have">창고 ${have}</span>`:''}<div class="pic"><img src="${img(d.k)}" alt="" loading="lazy" draggable="false"></div><b>${esc2(d.n)}</b>
        <span class="pr">${have ? (d.hang?'천장에 걸어요':d.surf?'위에 화분을 올려요':d.small?'테이블에도 올려요':'바닥에 놓아요') : `🪙 ${(prices[d.k]||0).toLocaleString()}`}</span></div>`; }).join('')}</div>
    </details>
  </div>`;
  b.querySelector('.gh-fold')?.addEventListener('toggle', ev=>{ FOLD = !ev.target.open; try{ localStorage.setItem('majam-ghfold', FOLD?'1':'0'); }catch(_){}
    const sm = ev.target.querySelector('summary .small'); if(sm) sm.textContent = sm.textContent.replace(/눌러서 (펼치기|접기)/, FOLD?'눌러서 펼치기':'눌러서 접기'); });
  tools();
}
function itemById(id){ return (GH.items||[]).find(i=>i.id===id); }
function tools(){
  const st = document.getElementById('ghStage'); if(!st) return; st.querySelector('.gh-tools')?.remove();
  if(!SEL) return; const el = st.querySelector(`[data-ghid="${SEL}"]`); if(!el){ SEL = null; return; }
  const r = el.getBoundingClientRect(), s = st.getBoundingClientRect();
  const t = document.createElement('div'); t.className = 'gh-tools';
  t.innerHTML = `<button data-gha="flip" type="button">↔ 뒤집기</button><button data-gha="up" type="button">＋ 크게</button><button data-gha="down" type="button">－ 작게</button><button data-gha="del" class="del" type="button">🧺 창고로</button>`;
  st.appendChild(t);
  t.style.left = clamp(r.left + r.width/2 - s.left, 120, s.width-120)+'px'; t.style.top = Math.max(r.top - s.top, 44)+'px';
}
function redraw(){ const st = document.getElementById('ghStage'); if(!st) return render(); st.querySelectorAll('.gh-it').forEach(x=>x.remove()); st.insertAdjacentHTML('beforeend', itemsHTML(GH.items||[], GH.bg, SEL)); tools(); }
async function save(it){   // 옮긴 걸 서버에 (실패하면 다시 불러와요)
  const L = layout(GH.items, GH.bg)[it.id] || {};
  try{ take(await api.ghMove(it.id, it.on ? L.x : it.x, it.on ? L.y : it.y, it.f?1:0, +it.s||1, it.on||null, +it.ox||0, it.lv||0)); }
  catch(e){ toast('⚠️ ' + (e.message||e)); await refresh(); }
  redraw();
}
// 손끝 아래 테이블 층 찾기
function tableAt(cx, cy, meId){
  const st = document.getElementById('ghStage'); if(!st) return null; let best = null;
  (GH.items||[]).filter(t=>byK[t.code] && byK[t.code].surf && !t.on && t.id!==meId).forEach(t=>{
    const el = st.querySelector(`[data-ghid="${t.id}"]`); if(!el) return; const r = el.getBoundingClientRect(), d = byK[t.code];
    d.surf.forEach((S, lv)=>{ const sy = r.bottom - r.height*S.h, x0 = r.left + r.width*S.span[0], x1 = r.left + r.width*S.span[1];
      const up = lv===0 ? r.height*.5 : r.height*.16, dist = Math.abs(cy - sy);
      if(cx>=x0 && cx<=x1 && cy >= sy - up && cy <= sy + Math.max(r.height*.1, 14) && (!best || t.y > best.t.y || (t===best.t && dist < best.dist))) best = {t, r, lv, S, dist}; }); });
  return best;
}
function glow(id){ document.querySelectorAll('#ghStage .gh-it').forEach(x=>x.classList.toggle('host', +x.dataset.ghid===id)); }
function floorPos(cx, cy, d){
  const s = document.getElementById('ghStage').getBoundingClientRect(), F = bgOf(GH.bg).floor;
  const x = clamp((cx - s.left)/s.width, .03, .97), y = (cy - s.top)/s.height;
  return {x, y: d.hang ? clamp(y, CEIL[0], CEIL[1]) : clamp(y, F, 1)};
}

/* ---------- 끌기 (무대 안) ---------- */
let D = null;
document.addEventListener('pointerdown', e=>{
  const el = e.target.closest && e.target.closest('#ghStage .gh-it'); if(!el || !GH || busy2) return;
  const it = itemById(+el.dataset.ghid); if(!it) return; e.preventDefault();
  const r = el.getBoundingClientRect(), d = byK[it.code];
  const ax = r.left + r.width/2, ay = d.hang ? r.top : r.bottom;
  D = {it, el, d, dx:e.clientX-ax, dy:e.clientY-ay, sx:e.clientX, sy:e.clientY, moved:false, was:JSON.stringify([it.x,it.y,it.on,it.ox,it.lv])};
  try{ el.setPointerCapture(e.pointerId); }catch(_){}
});
document.addEventListener('pointermove', e=>{
  if(!D) return; if(!D.moved && Math.hypot(e.clientX-D.sx, e.clientY-D.sy) < 5) return;
  if(!D.moved){ D.moved = true; SEL = null; document.querySelector('#ghStage .gh-tools')?.remove(); }
  const {it, d} = D, cx = e.clientX - D.dx, cy = e.clientY - D.dy;
  const T = d.small ? tableAt(cx, cy, it.id) : null;
  if(T){ if(!it.on && (+it.s||1)===1) it.s = T.t && byK[T.t.code].surf.length>2 ? .5 : .7; it.on = T.t.id; it.lv = T.lv; it.ox = clamp((cx - (T.r.left + T.r.width/2))/T.r.width, T.S.span[0]-.5, T.S.span[1]-.5); }
  else { it.on = null; Object.assign(it, floorPos(cx, cy, d)); }
  // 바로 그 자리에 그려요 (테이블이면 위에 올린 것도 같이)
  const st = document.getElementById('ghStage'), L = layout(GH.items, GH.bg);
  (GH.items||[]).forEach(x=>{ const p = L[x.id], el = st.querySelector(`[data-ghid="${x.id}"]`); if(!p || !el) return;
    el.style.width = (p.w*100)+'%'; el.style.left = ((p.x-p.w/2)*100)+'%'; el.style.zIndex = p.z;
    if(p.hang){ el.style.top = (p.y*100)+'%'; el.style.bottom = ''; } else { el.style.bottom = ((1-p.y)*100)+'%'; el.style.top = ''; } });
  D.el.classList.add('drag'); glow(T ? T.t.id : null);
});
const dragEnd = ()=>{
  if(!D) return; const {it, moved, was} = D; D.el.classList.remove('drag'); D = null; glow(null);
  if(!moved){ SEL = SEL===it.id ? null : it.id; redraw(); return; }
  if(JSON.stringify([it.x,it.y,it.on,it.ox,it.lv])===was) return redraw();
  SEL = it.id; save(it);
};
document.addEventListener('pointerup', dragEnd); document.addEventListener('pointercancel', dragEnd);

/* ---------- 바구니에서 끌어 놓기 ---------- */
let C = null;
document.addEventListener('pointerdown', e=>{
  const c = e.target.closest && e.target.closest('#ghBox .gh-card'); if(!c || !GH || !GH.open) return;
  const d = byK[c.dataset.ghk]; if(!d) return;
  if(!((GH.inv||{})[d.k] > 0)) return;   // 창고에 없으면 눌러서 사기 (click)
  e.preventDefault(); C = {d, sx:e.clientX, sy:e.clientY, fly:null};
});
document.addEventListener('pointermove', e=>{
  if(!C) return; if(!C.fly && Math.hypot(e.clientX-C.sx, e.clientY-C.sy) < 6) return;
  const st = document.getElementById('ghStage'); if(!st) return;
  if(!C.fly){ C.fly = document.createElement('div'); C.fly.className = 'gh-fly'; C.fly.innerHTML = `<img src="${img(C.d.k)}" alt="">`; document.body.appendChild(C.fly);
    C.fly.style.width = (st.getBoundingClientRect().width*C.d.w*.85)+'px'; }
  C.fly.style.left = e.clientX+'px'; C.fly.style.top = e.clientY+'px';
  glow(C.d.small ? ((tableAt(e.clientX, e.clientY+12, null)||{}).t||{}).id : null);
});
const cardEnd = e=>{
  if(!C) return; const {d, fly} = C; C = null; glow(null);
  const st = document.getElementById('ghStage'); if(!st) return; const s = st.getBoundingClientRect();
  let cx, cy;
  if(fly){ fly.remove(); if(e.clientX<s.left || e.clientX>s.right || e.clientY<s.top || e.clientY>s.bottom) return; cx = e.clientX; cy = e.clientY + 12; }
  else { cx = s.left + s.width/2; cy = s.top + s.height*(d.hang ? .07 : .9); st.scrollIntoView({block:'nearest', behavior:'smooth'}); }
  place(d, cx, cy);
};
document.addEventListener('pointerup', cardEnd); document.addEventListener('pointercancel', ()=>{ if(C && C.fly) C.fly.remove(); C = null; glow(null); });
function place(d, cx, cy){
  const T = d.small ? tableAt(cx, cy, null) : null, p = floorPos(cx, cy - (d.hang ? 30 : 0), d);
  const on = T ? T.t.id : null, ox = T ? clamp((cx - (T.r.left + T.r.width/2))/T.r.width, T.S.span[0]-.5, T.S.span[1]-.5) : 0;
  const sc = T ? (byK[T.t.code].surf.length>2 ? .5 : .7) : 1;
  act(async()=>{ const r = await api.ghPlace(d.k, p.x, p.y, 0, sc, on, ox, T ? T.lv : 0); take(r);
    const mine = (GH.items||[]).filter(i=>i.code===d.k); SEL = mine.length ? mine[mine.length-1].id : null; render(); });
}

/* ---------- 누르기 ---------- */
document.addEventListener('click', e=>{
  if(!e.target.closest('#ghBox')) return;
  if(e.target.closest('[data-ghopen]')) return act(async()=>{
    if(!(await ask(`🪙 ${(GH.price||500).toLocaleString()}코인으로 온실 문을 열까요?\n☀️ 햇살 정원 온실이 생기고, 화분과 테이블로 꾸밀 수 있어요.`))) return;
    take(await api.ghOpen()); typeof renderTop==='function' && renderTop(); render(); typeof petParty==='function' && petParty('🪴', '온실 문이 열렸어요!\n\n화분을 사서 원하는 자리에 놓아 보세요.\n작은 화분은 테이블과 선반 위에도 올라가요.'); });
  const cat = e.target.closest('[data-ghcat]'); if(cat){ CAT = cat.dataset.ghcat; try{ localStorage.setItem('majam-ghcat', CAT); }catch(_){} render(); return; }
  const bg = e.target.closest('[data-ghbg]');
  if(bg) return act(async()=>{ const k = bg.dataset.ghbg, b = bgOf(k), own = (GH.bgs||[]).includes(k); if(GH.bg===k) return;
    if(!own && !(await ask(`${b.n} 배경을 🪙 ${(GH.bg_price||300).toLocaleString()}코인에 살까요?\n한 번 사면 언제든 무료로 바꿔 끼울 수 있어요. 놓아둔 가구는 그대로예요.`))) return;
    take(await api.ghBg(k)); typeof renderTop==='function' && renderTop(); render(); });
  const a = e.target.closest('[data-gha]');
  if(a && SEL){ const it = itemById(SEL); if(!it) return; const k = a.dataset.gha;
    if(k==='del') return act(async()=>{ take(await api.ghRemove(it.id)); SEL = null; render(); });
    if(k==='flip') it.f = it.f ? 0 : 1;
    if(k==='up') it.s = Math.min(1.5, +((+it.s||1)+.1).toFixed(2));
    if(k==='down') it.s = Math.max(.4, +((+it.s||1)-.1).toFixed(2));
    redraw(); save(it); return; }
  const card = e.target.closest('.gh-card');
  if(card){ const d = byK[card.dataset.ghk]; if(!d || ((GH.inv||{})[d.k] > 0)) return;
    const price = (GH.prices||{})[d.k] || 0;
    return act(async()=>{
      if(!QUIETGH() && !(await ask(`「${d.n}」을(를) 🪙 ${price.toLocaleString()}코인에 살까요?\n산 가구는 온실 창고에 들어가요. 끌어다 놓으면 돼요.`))) return;
      take(await api.ghBuy(d.k, 1)); typeof renderTop==='function' && renderTop(); render(); if(!QUIETGH()) toast(`🪴 「${d.n}」이(가) 온실 창고에 들어왔어요`); }); }
  if(e.target.id==='ghStage'){ SEL = null; tools(); redraw(); }
});
const QUIETGH = () => typeof QUIET==='function' && QUIET();
window.addEventListener('resize', ()=>{ if(document.getElementById('ghStage')) tools(); });
})();
