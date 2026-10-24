/* 🌀 마감의 숲 · 차원 상인 (merchant.js, 10-25)
   index.html 다음에 불러와요. 서버 함수는 merchant.sql (get_merchant · merch_haggle · merch_buy · merch_equip · get_merch_of).
   그림은 merchant/ 폴더. 일주일에 한 번 랜덤한 날 와서 종류별로 2가지씩 팔아요(경쟁 없음). 흥정은 그날 한 번. */
(()=>{
/* ---------- 물건 (merchant.sql merch_item 과 값이 같아야 해요) ---------- */
const SZ = {"acc_angel":[240,128],"acc_backpack":[236,240],"acc_bat":[240,94],"acc_bow":[240,214],"acc_broom":[185,240],"acc_cape":[240,209],"acc_chef":[240,217],"acc_collar":[240,203],"acc_crown":[240,171],"acc_earmuff":[240,213],"acc_fairy":[240,191],"acc_flower":[240,144],"acc_glasses":[240,102],"acc_heart":[240,98],"acc_pirate":[240,139],"acc_scarf":[239,240],"acc_sprout":[240,165],"acc_wizhat":[240,175],
  "g_cloud":[208,250],"g_crystal":[248,340],"g_fish":[205,253],"g_fox":[257,340],"g_gargoyle":[290,340],"g_ink":[251,340],"g_lava":[174,294],"g_owl":[306,340],"g_robot":[173,268],"g_tree":[221,288]};
const ITEMS = {
  g_gargoyle:{kind:'guard',name:'꼬마 가고일',price:3000}, g_fox:{kind:'guard',name:'그림자 여우',price:3000}, g_crystal:{kind:'guard',name:'수정 골렘',price:3000},
  g_ink:{kind:'guard',name:'잉크 방울 정령',price:3000}, g_owl:{kind:'guard',name:'졸린 올빼미 기사',price:3000}, g_tree:{kind:'guard',name:'새싹 나무 정령',price:3000},
  g_lava:{kind:'guard',name:'용암 꼬마 골렘',price:3000}, g_cloud:{kind:'guard',name:'먹구름 아기',price:3000}, g_robot:{kind:'guard',name:'태엽 로봇',price:3000}, g_fish:{kind:'guard',name:'물방울 정령',price:3000},
  s_whale:{kind:'sky',name:'별자리 고래',price:1200}, s_island:{kind:'sky',name:'떠다니는 섬',price:1200}, s_aurora:{kind:'sky',name:'오로라 리본',price:1000}, s_moon:{kind:'sky',name:'구름 위 초승달',price:1000},
  s_meteor:{kind:'sky',name:'별똥별',price:900}, s_jelly:{kind:'sky',name:'빛 해파리',price:900}, s_cranes:{kind:'sky',name:'종이학 떼',price:800}, s_butterfly:{kind:'sky',name:'나비 소용돌이',price:800},
  acc_crown:{kind:'acc',slot:'head',name:'왕관',price:500,s:.62,o:.3}, acc_wizhat:{kind:'acc',slot:'head',name:'마법사 모자',price:400,s:1.05,o:.22},
  acc_pirate:{kind:'acc',slot:'head',name:'해적 모자',price:400,s:1.1,o:.28}, acc_chef:{kind:'acc',slot:'head',name:'요리사 모자',price:350,s:.72,o:.2},
  acc_flower:{kind:'acc',slot:'head',name:'꽃관',price:350,s:.95,o:.55}, acc_earmuff:{kind:'acc',slot:'head',name:'귀마개',price:350,s:1.15,o:.42},
  acc_bow:{kind:'acc',slot:'head',name:'리본',price:300,s:.42,o:.55,dx:.3}, acc_sprout:{kind:'acc',slot:'head',name:'새싹 핀',price:300,s:.34,o:.12},
  acc_glasses:{kind:'acc',slot:'face',name:'동그란 안경',price:300,s:1.4}, acc_heart:{kind:'acc',slot:'face',name:'하트 선글라스',price:350,s:1.4},
  acc_scarf:{kind:'acc',slot:'neck',name:'줄무늬 목도리',price:350,s:1.5,o:.22}, acc_collar:{kind:'acc',slot:'neck',name:'방울 목걸이',price:300,s:1.1,o:.35},
  acc_angel:{kind:'acc',slot:'back',name:'천사 날개',price:500,s:1.3}, acc_bat:{kind:'acc',slot:'back',name:'박쥐 날개',price:500,s:1.25},
  acc_fairy:{kind:'acc',slot:'back',name:'요정 날개',price:500,s:1.05}, acc_cape:{kind:'acc',slot:'back',name:'빨간 망토',price:450,s:.85,cape:true},
  acc_backpack:{kind:'acc',slot:'back',name:'모험가 배낭',price:450,s:.5,dx:.34},
  acc_broom:{kind:'acc',slot:'hand',name:'마녀 빗자루',price:400,s:1},
  r_dragontear:{kind:'ing',name:'용의 눈물',price:150}, r_timeice:{kind:'ing',name:'시간이 멈춘 얼음',price:150}, r_starlight:{kind:'ing',name:'병에 담긴 별빛',price:150},
  r_phoenix:{kind:'ing',name:'불사조 깃털',price:150}, r_moondrop:{kind:'ing',name:'달빛 한 방울',price:150}, r_cloud:{kind:'ing',name:'병 속의 구름',price:150},
  r_pearl:{kind:'ing',name:'심해 진주',price:150}, r_goldapple:{kind:'ing',name:'황금 사과',price:150},
};
window.MERCH_ITEMS = ITEMS;
// 파수꾼마다 소품 자리 (그림 가로·세로에 대한 비율): 머리 위(hx,ht,hw) · 눈(ey,ew) · 목(ny,nw) · 등(by,bw) · 손(hdx,hdy)
const ANC = {
  g_gargoyle:{hx:.5,ht:.12,hw:.62,ey:.40,ew:.40,ny:.55,nw:.40,by:.62,bw:.95,hdx:.22,hdy:.78},
  g_fox:{hx:.47,ht:.16,hw:.6,ey:.47,ew:.42,ny:.64,nw:.38,by:.66,bw:.85,hdx:.25,hdy:.83},
  g_crystal:{hx:.5,ht:.05,hw:.82,ey:.42,ew:.55,ny:.70,nw:.38,by:.74,bw:.8,hdx:.18,hdy:.78},
  g_ink:{hx:.5,ht:.2,hw:.6,ey:.52,ew:.55,ny:.72,nw:.5,by:.6,bw:.95,hdx:.1,hdy:.73},
  g_owl:{hx:.5,ht:.09,hw:.7,ey:.43,ew:.58,ny:.57,nw:.45,by:.6,bw:1,hdx:.12,hdy:.65},
  g_tree:{hx:.5,ht:.12,hw:.62,ey:.48,ew:.4,ny:.63,nw:.35,by:.62,bw:.9,hdx:.18,hdy:.63},
  g_lava:{hx:.5,ht:.2,hw:.72,ey:.52,ew:.5,ny:.70,nw:.45,by:.7,bw:.95,hdx:.12,hdy:.75},
  g_cloud:{hx:.5,ht:.12,hw:.72,ey:.45,ew:.38,ny:.62,nw:.45,by:.65,bw:.95,hdx:.12,hdy:.70},
  g_robot:{hx:.5,ht:.12,hw:.75,ey:.44,ew:.55,ny:.63,nw:.42,by:.7,bw:.9,hdx:.14,hdy:.82},
  g_fish:{hx:.47,ht:.16,hw:.6,ey:.45,ew:.42,ny:.6,nw:.35,by:.62,bw:.9,hdx:.2,hdy:.75},
};
const SLOTS = [['head','머리'],['face','얼굴'],['neck','목'],['back','등'],['hand','손']];
const KINDS = [['guard','🛡️ 파수꾼','한 사람에 한 마리 · 아공간 농장을 지켜요 · 바꿀 때도 같은 값'],['sky','✨ 하늘 장식','아공간 배경 위를 천천히 떠다녀요'],['acc','🎩 파수꾼 꾸미기','머리 · 얼굴 · 목 · 등 · 손에 하나씩'],['ing','🧪 희귀 재료','가판대용 · 1개 = 10잔 · 한 번에 3개까지']];
const SAY = ['냥… 오늘 하루만 머물다 갈 거다냥.','다른 차원에서 귀한 물건을 잔뜩 가져왔다냥.','흥정은 한 번만이다냥. 신중하게 고르라냥.','파편만 받는다냥. 코인은 이 차원 돈이라 안 받는다냥.'];
const src = c => `merchant/${c}.webp`;
const pct = v => (v*100).toFixed(2)+'%';

/* ---------- 파수꾼 + 소품 그리기 ---------- */
function guardHTML(st, cls=''){
  if(!st || !st.guard || !ANC[st.guard]) return '';
  const g = st.guard, A = ANC[g], [gw,gh] = SZ[g], back = [], front = [];
  SLOTS.forEach(([slot])=>{ const c = st[slot], it = ITEMS[c]; if(!it || !SZ[c]) return;
    const [aw,ah] = SZ[c], hf = w => w * (ah/aw) * (gw/gh);   // 소품 높이 (파수꾼 높이에 대한 비율)
    let w, l, t, z = 'front';
    if(slot==='head'){ w = A.hw*it.s; l = A.hx - w/2 + (it.dx||0)*A.hw; t = A.ht - hf(w)*(1-it.o); }
    else if(slot==='face'){ w = A.ew*it.s; l = A.hx - w/2; t = A.ey - hf(w)/2; }
    else if(slot==='neck'){ w = A.nw*it.s; l = A.hx - w/2; t = A.ny - hf(w)*it.o; }
    else if(slot==='back'){ w = A.bw*it.s; l = A.hx - w/2 + (it.dx||0); t = it.cape ? A.ny - hf(w)*.12 : A.by - hf(w)/2 - (it.dx ? 0 : .06); z = 'back'; }
    else { w = .46*it.s; l = A.hdx - w*.72; t = A.hdy - hf(w)*.4; }
    (z==='back' ? back : front).push(`<img class="mg-acc ${slot}" src="${src(c)}" alt="" draggable="false" style="left:${pct(l)};top:${pct(t)};width:${pct(w)}">`);
  });
  return `<span class="mguard ${cls}" title="${esc(ITEMS[g].name)}"><span class="mg-in" style="aspect-ratio:${gw}/${gh}">${back.join('')}<img class="mg-body" src="${src(g)}" alt="${esc(ITEMS[g].name)}" draggable="false">${front.join('')}</span></span>`;
}
function skyHTML(st){ const c = st && st.sky; if(!c || !ITEMS[c]) return '';
  return `<div class="msky" aria-hidden="true"><img class="msky-${c}" src="${src(c)}" alt="" draggable="false"></div>`; }
window.merchGuardHTML = guardHTML;
window.merchSkyHTML = skyHTML;

/* ---------- 상태 ---------- */
window.MERCH = null;
let deco = 'head';
// 접기 (10-25) — 스크롤 길어지는 판은 접을 수 있게. 브라우저마다 기억해요
const mFolded = () => { try{ return localStorage.getItem('majam-merch-fold')==='1'; }catch(e){ return false; } };
async function refreshMerch(){ if(!api.merchant) return; try{ window.MERCH = await api.merchant(); }catch(e){ return; }
  syncShards(window.MERCH); renderMerch(); renderDeco(); try{ if(typeof renderVoid==='function' && VOID && VOID.open) renderVoid(); }catch(e){} }
window.refreshMerch = refreshMerch;
function syncShards(r){ if(r && r.shards!=null && typeof RIFT!=='undefined' && RIFT) RIFT.shards = r.shards; }
function take(r){ window.MERCH = r; syncShards(r); renderMerch(); renderDeco(); try{ if(typeof refreshVoid==='function') refreshVoid().then(()=>{ try{ renderVoid(); renderRift(); }catch(e){} }); }catch(e){} }

/* ---------- 이세계 탭 상인 판 ---------- */
function cardHTML(o){
  const it = ITEMS[o.code]; if(!it) return '';
  const M = window.MERCH, st = M.state || {}, owned = new Set(M.owned||[]);
  const price = o.pct ? Math.round(o.price*(100-o.pct)/100) : o.price;
  const have = it.kind==='guard' ? st.guard===o.code : it.kind==='ing' ? o.bought >= M.ing_max : owned.has(o.code);
  const label = o.refused ? '😾 흥, 안 팔아!' : have ? (it.kind==='guard' ? '🛡️ 함께 있어요' : it.kind==='ing' ? '오늘은 다 샀어요' : '✅ 가지고 있어요')
    : it.kind==='guard' && st.guard ? `🔁 바꾸기 · 💠 ${price.toLocaleString()}` : `💠 ${price.toLocaleString()}${it.kind==='ing'?` · ${o.bought}/${M.ing_max}`:''}`;
  const art = it.kind==='guard' ? `<span class="mc-guard">${guardHTML({guard:o.code})}</span>` : `<img src="${src(o.code)}" alt="" loading="lazy" draggable="false">`;
  return `<div class="mcard k-${it.kind} ${o.refused?'refused':''}"><div class="mc-art">${art}</div>
    <b>${esc(it.name)}</b>${it.slot ? `<span class="small">${SLOTS.find(s=>s[0]===it.slot)[1]}</span>` : ''}
    ${o.pct ? `<span class="mc-disc"><s>💠 ${o.price.toLocaleString()}</s> −${o.pct}%</span>` : ''}
    <button class="mini ask-yes" type="button" data-mbuy="${o.code}" ${o.refused||have?'disabled':''}>${label}</button>
    ${!M.haggled && !have ? `<button class="mini" type="button" data-mhaggle="${o.code}">🤝 흥정하기</button>` : ''}</div>`;
}
function renderMerch(){
  const box = document.getElementById('merchBox'); if(!box) return;
  const M = window.MERCH; if(!M){ box.hidden = true; return; }
  box.hidden = false;
  const st = M.state || {}, has = st.guard || (M.owned||[]).length;
  const decoBtn = has ? `<button class="mini" type="button" data-mdeco>🎀 파수꾼 · 하늘 장식 꾸미기</button>` : '';
  if(!M.open){
    box.innerHTML = `<div class="merch off"><img class="m-cat" src="${src('merchant')}" alt="" draggable="false"><div class="m-txt"><h3>🌀 차원 상인</h3>
      <p class="small">${M.gone ? '이번 주에는 이미 다녀갔어요. 다음 주 어느 날 또 불쑥 나타날 거예요.' : '이번 주 어느 날 불쑥 나타날 거예요. 오면 우편함과 디코로 알려 드려요.'}</p>${decoBtn}</div></div>`;
    return;
  }
  const groups = KINDS.map(([k,t,sub])=>{ const os = (M.offers||[]).filter(o=>o.kind===k); if(!os.length) return '';
    return `<div class="m-row"><h4>${t} <span class="small">${sub}</span></h4><div class="m-cards">${os.map(cardHTML).join('')}</div></div>`; }).join('');
  const say = SAY[new Date().getDate() % SAY.length];
  box.innerHTML = `<div class="merch on"><div class="m-top"><img class="m-cat" src="${src('merchant')}" alt="차원 상인" draggable="false">
      <div class="m-txt"><h3>🌀 차원 상인이 왔어요! <span class="small">오늘 하루만</span></h3>
      <button class="mini m-fold" type="button" data-mfold aria-expanded="${!mFolded()}">${mFolded() ? '펼치기 ▾' : '접기 ▴'}</button><p class="m-say">“${esc(say)}”</p>
      <p class="small">💠 이세계 파편만 받아요 · 흥정은 오늘 한 번 ${M.haggled ? '(이미 했어요)' : '(물건 하나 골라서)'} · <b>💠 ${(M.shards||0).toLocaleString()}</b></p>${decoBtn}
      ${!M.has_void ? `<p class="small">🔮 파수꾼과 하늘 장식은 아공간 문을 연 뒤에 데려갈 수 있어요</p>` : ''}</div></div>
    ${mFolded() ? `<p class="small m-foldnote">물건 ${(M.offers||[]).length}가지를 접어 뒀어요 · 펼치기를 누르면 보여요</p>` : groups}</div>`;
}

/* ---------- 꾸미기 창 ---------- */
function renderDeco(){
  const d = document.getElementById('merchDeco'); if(!d || !d.open) return;
  const M = window.MERCH || {}, st = M.state || {}, owned = (M.owned||[]).filter(c=>ITEMS[c]);
  const sky = owned.filter(c=>ITEMS[c].kind==='sky');
  const slotItems = s => owned.filter(c=>ITEMS[c].slot===s);
  const chip = (slot, c) => `<button class="mchip ${st[slot]===c?'on':''}" type="button" data-mequip="${slot}" data-code="${c}"><img src="${src(c)}" alt="" loading="lazy"><span>${esc(ITEMS[c].name)}</span></button>`;
  const off = slot => `<button class="mchip off ${!st[slot]?'on':''}" type="button" data-mequip="${slot}" data-code="">빼기</button>`;
  document.getElementById('merchDecoBody').innerHTML = `
    <div class="md-stage" style="--vbg:${typeof voidBgCSS==='function' && typeof VOID!=='undefined' && VOID ? voidBgCSS(VOID.bg) : '#2A1650'}">${skyHTML(st)}
      ${st.guard ? guardHTML(st, 'big') : `<p class="md-empty">아직 파수꾼이 없어요.<br><span class="small">차원 상인이 오면 💠 3,000으로 데려올 수 있어요.</span></p>`}</div>
    <div class="md-side">
      <h4>✨ 하늘 장식</h4><div class="md-row">${sky.length ? off('sky') + sky.map(c=>chip('sky',c)).join('') : '<span class="small">상인에게서 사면 여기 생겨요</span>'}</div>
      ${st.guard ? `<div class="md-tabs">${SLOTS.map(([s,n])=>`<button class="mchip ${deco===s?'on':''}" type="button" data-mdecotab="${s}">${n}${st[s]?' ✓':''}</button>`).join('')}</div>
      <div class="md-row">${slotItems(deco).length ? off(deco) + slotItems(deco).map(c=>chip(deco,c)).join('') : '<span class="small">이 자리에 쓸 소품이 아직 없어요</span>'}</div>` : ''}
    </div>`;
}

/* ---------- 누르기 ---------- */
document.addEventListener('click', e=>{
  if(e.target.closest('[data-mfold]')){ try{ localStorage.setItem('majam-merch-fold', mFolded() ? '0' : '1'); }catch(e){} renderMerch(); return; }
  if(e.target.closest('[data-mdeco]')){ const d = document.getElementById('merchDeco'); if(!d.open) d.showModal(); renderDeco(); return; }
  if(e.target.closest('[data-mdecoclose]')){ document.getElementById('merchDeco').close(); return; }
  const dt = e.target.closest('[data-mdecotab]'); if(dt){ deco = dt.dataset.mdecotab; renderDeco(); return; }
  const eq = e.target.closest('[data-mequip]');
  if(eq) return act(async()=>{ take(await api.merchEquip(eq.dataset.mequip, eq.dataset.code||'')); });
  const hg = e.target.closest('[data-mhaggle]');
  if(hg) return act(async()=>{ const it = ITEMS[hg.dataset.mhaggle];
    if(!(await ask(`🤝 「${it.name}」 값을 흥정해 볼까요?\n흥정은 오늘 한 번뿐이에요.\n깎아 줄 수도, 그대로일 수도… 기분 상하면 「흥, 안 팔아!」 할 수도 있어요.`))) return;
    const r = await api.merchHaggle(hg.dataset.mhaggle); take(r);
    if(r.refused) petParty('😾', `「흥, 안 팔아!」\n\n상인이 삐졌어요.\n오늘은 「${it.name}」을 살 수 없어요…`);
    else if(r.pct) petParty('😸', `「좋아, 깎아 주지냥!」\n\n「${it.name}」 💠 ${r.pct}% 할인!\n오늘 하루 이 값으로 살 수 있어요.`);
    else toast('😺 「그 값이 딱 맞다냥.」 값은 그대로예요'); });
  const by = e.target.closest('[data-mbuy]');
  if(by) return act(async()=>{ const c = by.dataset.mbuy, it = ITEMS[c], o = (window.MERCH.offers||[]).find(x=>x.code===c), st = window.MERCH.state || {};
    const price = o && o.pct ? Math.round(o.price*(100-o.pct)/100) : it.price;
    const msg = it.kind==='guard' ? (st.guard ? `🔁 지금 파수꾼 「${ITEMS[st.guard].name}」은 다른 차원으로 돌아가고\n「${it.name}」이 새로 와요.\n씌워 둔 소품은 그대로 옮겨져요.\n\n💠 ${price.toLocaleString()}을 낼까요?` : `🛡️ 「${it.name}」을 파수꾼으로 데려올까요?\n💠 ${price.toLocaleString()} · 아공간 농장을 지켜요`)
      : `💠 ${price.toLocaleString()}으로 「${it.name}」을 살까요?`;
    if(!(await ask(msg))) return;
    const r = await api.merchBuy(c); take(r);
    if(it.kind==='guard') petParty('🛡️', `「${it.name}」이 파수꾼이 됐어요!\n\n🔮 아공간 마물 농장을 지키고 있어요.\n🎀 꾸미기에서 소품을 씌워 줄 수 있어요.`);
    else if(it.kind==='sky') toast(`✨ 「${it.name}」이 아공간 하늘에 떠올랐어요!`);
    else if(it.kind==='acc') toast(`🎩 「${it.name}」을 파수꾼에게 씌웠어요! (꾸미기에서 바꿀 수 있어요)`);
    else toast(`🧪 「${it.name}」 1개가 가판대 재료함에 들어갔어요 (10잔치)`); });
});
document.addEventListener('click', e=>{ if(e.target.closest('.tabs [data-tab="isekai"]')) setTimeout(refreshMerch, 50); });
setTimeout(refreshMerch, 2500); setInterval(()=>{ if(!document.hidden) refreshMerch(); }, 5*60e3);

/* ---------- 모양 ---------- */
const css = document.createElement('style'); css.textContent = `
#merchBox{margin:0 0 1rem}
.merch{border-radius:18px;padding:1rem;background:linear-gradient(135deg,rgba(60,30,110,.55),rgba(25,20,60,.55));border:1px solid rgba(200,170,255,.45);box-shadow:0 0 24px rgba(160,120,255,.25)}
:root[data-mode="day"] .merch{background:linear-gradient(135deg,rgba(235,225,255,.92),rgba(255,248,235,.92));border-color:#C9B5F0}
.merch.off{display:flex;gap:.8rem;align-items:center;padding:.6rem .9rem}
.merch.off .m-cat{width:64px;filter:grayscale(.7) opacity(.7)}
.merch .m-top{display:flex;gap:1rem;align-items:center;flex-wrap:wrap}
.merch.on .m-cat{width:min(150px,32vw);filter:drop-shadow(0 6px 10px rgba(0,0,0,.35));animation:mbob 3s ease-in-out infinite}
@keyframes mbob{50%{transform:translateY(-4px) rotate(-1deg)}}
.merch .m-fold{position:absolute;top:0;right:0}
.merch .m-foldnote{margin:.6rem 0 0}
.merch .m-txt{position:relative;padding-right:5.5rem;flex:1 1 14rem;min-width:0;display:grid;gap:.35rem;justify-items:start}
.merch h3{margin:0}.merch h4{margin:.9rem 0 .4rem}
.merch .m-say{margin:0;font-family:"Jua",sans-serif;font-size:1.05rem}
.m-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.6rem}
.mcard{border:1px solid var(--line);border-radius:14px;padding:.6rem;display:grid;justify-items:center;gap:.3rem;text-align:center;background:rgba(255,255,255,.05)}
:root[data-mode="day"] .mcard{background:rgba(255,255,255,.75)}
.mcard.refused{opacity:.55}
.mcard .mc-art{height:110px;display:grid;place-items:center;width:100%}
.mcard .mc-art > img{max-height:100px;max-width:100%;object-fit:contain;filter:drop-shadow(0 3px 4px rgba(0,0,0,.3))}
.mcard.k-guard .mc-art{height:130px}
.mcard .mc-guard .mguard{width:96px}
.mcard b{font-family:"Jua",sans-serif;font-weight:400}
.mc-disc{font-size:.8rem;color:#E0607A}
.mguard{display:inline-block;width:100%}
.mguard .mg-in{position:relative;display:block;width:100%}
.mguard .mg-body{position:relative;z-index:2;width:100%;display:block;filter:drop-shadow(0 4px 4px rgba(0,0,0,.3))}
.mguard .mg-acc{position:absolute;z-index:3;height:auto;pointer-events:none}
.mguard .mg-acc.back{z-index:1}
.vfarm .mguard.farm{position:absolute;left:87%;bottom:7%;width:15%;max-width:150px;transform:translateX(-50%);z-index:95;animation:mguard 4s ease-in-out infinite}
@keyframes mguard{50%{transform:translateX(-50%) translateY(-2px)}}
.vfarm .mguard.farm::after{content:"🛡️ 파수꾼";position:absolute;left:50%;bottom:-1.3em;transform:translateX(-50%);font-size:.7rem;white-space:nowrap;background:rgba(30,20,60,.7);color:#F3E8FF;border-radius:999px;padding:0 .5em}
.msky{position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:inherit;z-index:0}
.msky img{position:absolute;top:6%;width:min(30%,260px);opacity:.92;filter:drop-shadow(0 0 10px rgba(200,180,255,.5));animation:msky 70s linear infinite}
.msky img.msky-s_island,.msky img.msky-s_moon{top:4%;animation:msky 120s linear infinite, mbob 5s ease-in-out infinite}
.msky img.msky-s_meteor{animation:mmeteor 14s ease-in infinite}
@keyframes msky{from{left:-32%}to{left:105%}}
@keyframes mmeteor{0%{left:90%;top:-30%;opacity:0}8%{opacity:1}40%{left:-30%;top:40%;opacity:0}100%{left:-30%;top:40%;opacity:0}}
.void-stage > .room{position:relative;z-index:1}
@media (prefers-reduced-motion:reduce){.msky img{animation:none;left:60%}.merch.on .m-cat,.vfarm .mguard.farm{animation:none}}
dialog.merch-deco{width:min(94vw,820px);max-width:min(94vw,820px)}
.md-wrap{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:1rem;align-items:start}
@media (max-width:640px){.md-wrap{grid-template-columns:minmax(0,1fr)}}
.md-stage{position:relative;border-radius:16px;min-height:300px;background:var(--vbg);display:grid;place-items:end center;padding:1.2rem;overflow:hidden}
.md-stage .mguard.big{width:min(220px,60%);position:relative;z-index:2}
.md-stage .msky img{animation:none;left:6%;top:5%;width:42%}
.md-empty{color:#F3E8FF;text-align:center;align-self:center;z-index:2}
.md-side h4{margin:.2rem 0 .4rem}
.md-row,.md-tabs{display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.7rem}
.mchip{display:inline-flex;gap:.3rem;align-items:center;border:1px solid var(--line);background:rgba(255,255,255,.06);color:var(--ink);border-radius:12px;padding:.25rem .55rem;cursor:pointer;font-size:.85rem}
.mchip img{width:34px;height:34px;object-fit:contain}
.mchip.on{border-color:#E8B54A;box-shadow:0 0 0 2px #E8B54A}
:root[data-mode="day"] .mchip{background:rgba(255,255,255,.8)}
`; document.head.appendChild(css);
})();
