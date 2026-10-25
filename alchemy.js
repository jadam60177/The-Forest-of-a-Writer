/* 🧪 마감의 숲 · 마감 극복 연금술 (alchemy.js, 10-25)
   index.html 다음에 불러와요. 서버 함수는 alchemy.sql (get_alc · alc_brew)
   괴물을 때리면 그 괴물 재료가 모이고(트리거), 재료 1개 + 💠 파편으로 극복 아이템을 연성해요. 도감에는 최고 수량만 남아요.
   배경: alc/cauldron.webp (없으면 보랏빛 그라데이션). 솥 그림에는 글자·버튼을 넣지 않고 여기서 얹어요 */
(()=>{
const css = document.createElement('style'); css.textContent = `
dialog.visit.alc-dlg{width:min(96vw,980px);max-width:min(96vw,980px);max-height:94vh;padding:1rem;overflow-y:auto}
@media (max-width:600px){ dialog.visit.alc-dlg{width:100vw;max-width:100vw;max-height:94vh;margin:auto 0 0;border-radius:22px 22px 0 0;padding:.8rem .7rem calc(.8rem + env(safe-area-inset-bottom,0px))} }
#alcDlg .a-head{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin-bottom:.6rem}
#alcDlg .a-head h3{margin:0;flex:1 1 auto}
#alcDlg .a-pill{font-family:"Jua",sans-serif;background:rgba(255,255,255,.08);border:1px solid var(--line);border-radius:999px;padding:.08rem .7rem;font-size:.9rem;white-space:nowrap}
#alcDlg .a-btn{font-family:"Jua",sans-serif;border:2px solid #6A4C9C;background:#F3EDFF;color:#3A2560;border-radius:999px;padding:.35rem .9rem;cursor:pointer}
#alcDlg .a-btn:disabled{opacity:.45;cursor:default}
#alcDlg .small{font-size:.82rem;color:var(--muted)}
#alcDlg .a-stage{position:relative;width:100%;aspect-ratio:16/10;border-radius:18px;overflow:hidden;container-type:inline-size;
  background:url(alc/cauldron.webp?v=1) center 62%/cover no-repeat,radial-gradient(60% 55% at 50% 60%,#8B5BD6 0%,#4B2A86 45%,#1E1238 100%);border:2px solid #4B2A86}
#alcDlg .a-stage .swirl{position:absolute;inset:-20%;background:conic-gradient(from 0deg,rgba(190,140,255,.0),rgba(190,140,255,.35),rgba(120,200,255,.0),rgba(190,140,255,.35),rgba(190,140,255,0));
  animation:aSpin 18s linear infinite;mix-blend-mode:screen;opacity:.5;pointer-events:none}
#alcDlg .a-stage.brewing .swirl{animation-duration:1.2s;opacity:.95}
@keyframes aSpin{to{transform:rotate(1turn)}}
#alcDlg .a-mid{position:absolute;left:50%;bottom:7%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:1cqw;width:min(92%,560px)}
#alcDlg .a-mat{display:flex;align-items:center;gap:1.2cqw;background:rgba(20,10,40,.62);color:#F3EDFF;border:1px solid rgba(220,200,255,.45);border-radius:999px;padding:.6cqw 1.8cqw;font-size:max(12px,1.7cqw);backdrop-filter:blur(3px)}
#alcDlg .a-mat img{width:max(26px,4.2cqw);height:auto}
#alcDlg .a-brew{font-family:"Jua",sans-serif;font-size:max(15px,2.4cqw);border:0;border-radius:999px;padding:1cqw 4cqw;cursor:pointer;color:#2A1650;
  background:linear-gradient(#FFF4C6,#F2C24C);box-shadow:0 0 2.4cqw rgba(255,214,110,.7),0 .5cqw 1cqw rgba(0,0,0,.35)}
#alcDlg .a-brew:disabled{filter:grayscale(.6);opacity:.65;cursor:default;box-shadow:none}
#alcDlg .a-why{font-size:max(11px,1.45cqw);color:#E9DFFF;text-shadow:0 1px 2px rgba(0,0,0,.6);text-align:center}
#alcDlg .a-res{position:absolute;left:50%;top:9%;transform:translateX(-50%);text-align:center;color:#fff;pointer-events:none;width:90%}
#alcDlg .a-res .card{display:inline-flex;flex-direction:column;align-items:center;gap:.4cqw;background:rgba(255,250,240,.94);color:#3A2560;border-radius:2cqw;padding:1.4cqw 3cqw;box-shadow:0 0 3cqw rgba(255,230,160,.6);animation:aPop .5s ease}
#alcDlg .a-res .card.rare{box-shadow:0 0 3.6cqw rgba(140,200,255,.9)}
#alcDlg .a-res .card.legend{box-shadow:0 0 5cqw rgba(255,210,90,1),0 0 9cqw rgba(255,150,220,.6);background:linear-gradient(#FFF9E3,#FFE9B8)}
#alcDlg .a-res .em{font-size:max(30px,6cqw);line-height:1}
#alcDlg .a-res .nm{font-family:"Jua",sans-serif;font-size:max(15px,2.5cqw)}
#alcDlg .a-res .q{font-family:"Jua",sans-serif;font-size:max(14px,2.2cqw);color:#8A3FBF}
#alcDlg .a-res .tag{font-size:max(11px,1.5cqw);font-family:"Jua",sans-serif}
@keyframes aPop{0%{transform:scale(.6);opacity:0}70%{transform:scale(1.08);opacity:1}100%{transform:scale(1)}}
#alcDlg .a-bosses{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:.4rem;margin:.7rem 0}
@media (max-width:640px){ #alcDlg .a-bosses{grid-template-columns:repeat(4,minmax(0,1fr))} #alcDlg .a-stage{aspect-ratio:4/4.4} #alcDlg .a-res{top:5%} #alcDlg .a-mid{bottom:5%;gap:2cqw} #alcDlg .a-mat{font-size:3.3cqw;padding:1.2cqw 3cqw} #alcDlg .a-brew{font-size:4.6cqw;padding:2cqw 7cqw} #alcDlg .a-res .card{padding:2.4cqw 5cqw;border-radius:4cqw} #alcDlg .a-res .nm{font-size:4.4cqw} #alcDlg .a-res .q{font-size:4cqw} #alcDlg .a-res .tag{font-size:2.8cqw} #alcDlg .a-why{font-size:2.8cqw} }
#alcDlg .a-boss{display:flex;flex-direction:column;align-items:center;gap:.15rem;border:1px solid var(--line);border-radius:14px;padding:.35rem .2rem;background:rgba(255,255,255,.04);cursor:pointer;color:var(--ink);font:inherit}
#alcDlg .a-boss.on{border-color:#A27BE0;background:rgba(162,123,224,.18)}
#alcDlg .a-boss img{width:46px;height:40px;object-fit:contain}
#alcDlg .a-boss b{font-family:"Jua",sans-serif;font-weight:400;font-size:.78rem;text-align:center;line-height:1.2;word-break:keep-all}
#alcDlg .a-boss .n{font-size:.75rem;color:var(--muted)}
#alcDlg details.a-fold{border:1px solid var(--line);border-radius:14px;padding:.55rem .8rem;margin-top:.6rem}
#alcDlg details.a-fold > summary{cursor:pointer;font-family:"Jua",sans-serif;font-size:1.02rem;list-style:none}
#alcDlg details.a-fold > summary::-webkit-details-marker{display:none}
#alcDlg details.a-fold > summary::before{content:"▸ "}
#alcDlg details.a-fold[open] > summary::before{content:"▾ "}
#alcDlg .a-tabs{display:flex;flex-wrap:wrap;gap:.3rem;margin:.6rem 0}
#alcDlg .a-tabs button{font-family:"Jua",sans-serif;font-size:.82rem;border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:999px;padding:.2rem .7rem;cursor:pointer}
#alcDlg .a-tabs button.on{background:#A27BE0;border-color:#A27BE0;color:#fff}
#alcDlg .a-dex{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.45rem}
#alcDlg .a-dx{display:flex;gap:.5rem;align-items:center;border:1px solid var(--line);border-radius:12px;padding:.45rem .55rem;background:rgba(255,255,255,.04)}
#alcDlg .a-dx .em{font-size:1.6rem;width:2rem;text-align:center}
#alcDlg .a-dx b{font-family:"Jua",sans-serif;font-weight:400;font-size:.88rem;display:block;line-height:1.25;word-break:keep-all}
#alcDlg .a-dx .bst{font-size:.78rem;color:var(--muted)}
#alcDlg .a-dx.rare{border-color:#7FB2E6}
#alcDlg .a-dx.legend{border-color:#E8B84A;background:rgba(255,214,110,.12)}
#alcDlg .a-dx.no{opacity:.55}
#alcDlg .a-dx.no .em{color:#A27BE0}
#alcDlg .a-recent{display:flex;flex-direction:column;gap:.25rem;margin-top:.5rem;font-size:.86rem}
.alc-door{display:flex;align-items:center;gap:1rem;margin:0 0 1rem;padding:.8rem 1.1rem;border-radius:18px;border:2px solid #8A65C9;width:100%;text-align:left;cursor:pointer;font:inherit;
  background:linear-gradient(135deg,#2C1A52,#4B2A86);color:#F3EDFF;box-shadow:0 6px 16px rgba(30,10,60,.35)}
.alc-door:hover{transform:translateY(-2px)}
.alc-door .ic{font-size:2.6rem}
.alc-door b{font-family:"Jua",sans-serif;font-weight:400;font-size:1.25rem;display:block}
.alc-door span{font-size:.88rem;opacity:.9;line-height:1.5}
@media (prefers-reduced-motion:reduce){#alcDlg .a-stage .swirl{animation:none}}
`; document.head.appendChild(css);

const TIER = {common:'일반', rare:'✨ 희귀', legend:'👑 전설'};
let A = null, PICK = null, BOSS_TAB = null, RES = null, busyA = false, timer = null;
try{ PICK = localStorage.getItem('majam-alcpick'); }catch(_){}
const e = s => (typeof esc==='function' ? esc(s) : String(s ?? ''));
const box = () => document.getElementById('alcBox');
const fmtQ = (b, q, unit) => b==='short' ? `${(q*100).toLocaleString()}${unit}` : `${q}${unit}`;   // 분량 부족은 100자 단위
const left = iso => { if(!iso) return ''; const s = Math.max(0, Math.round((Date.parse(iso)-Date.now())/1000)); return `${Math.floor(s/60)}분 ${String(s%60).padStart(2,'0')}초`; };
function take(r){ const x = Array.isArray(r) ? r[0] : r; if(x && x.bosses) A = x; if(A && typeof RIFT!=='undefined' && RIFT){ RIFT.shards = A.shards; } }

function render(){
  const b = box(); if(!b) return;
  if(!A){ b.innerHTML = `<p class="small">🧪 연금술 솥에 불을 지피는 중이에요…</p>`; return; }
  if(!PICK || !A.bosses.some(x=>x.code===PICK)) PICK = (A.bosses.find(x=>x.qty>0) || A.bosses[0]).code;
  if(!BOSS_TAB) BOSS_TAB = PICK;
  const B = A.bosses.find(x=>x.code===PICK), canFull = A.today < A.max;
  const why = A.today >= A.max ? '오늘은 다 연성했어요. 0시에 다시 열려요'
    : A.charges <= 0 ? `연성 기회 충전 중 · ${left(A.next_at)} 뒤에 1번`
    : B.qty <= 0 ? `${B.name} 재료가 없어요. 이세계에서 ${B.name} 괴물을 때리면 모여요`
    : A.shards < A.cost ? `💠 파편이 모자라요 (💠 ${A.cost} 필요)` : '';
  const found = A.items.filter(i=>i.best!=null).length;
  b.innerHTML = `<div class="a-head"><h3>🧪 마감 극복 연금술</h3>
      <span class="a-pill">💠 ${(A.shards||0).toLocaleString()}</span><span class="a-pill">오늘 ${A.today}/${A.max}</span>
      <span class="a-pill">⚗️ 기회 ${A.charges}/${A.max}${A.charges<A.max && A.next_at ? ` · <span data-anext>${left(A.next_at)}</span>` : ''}</span>
      <button class="a-btn" type="button" data-aclose aria-label="닫기">✕</button></div>
    <div class="a-stage" id="alcStage"><div class="swirl"></div>
      <div class="a-res" id="alcRes">${RES ? resHTML(RES) : ''}</div>
      <div class="a-mid"><div class="a-mat"><img src="monster/${B.code}.webp?v=2" alt=""><span>${B.emoji} ${e(B.mat)} <b>${B.qty}</b>개 · 1개 + 💠 ${A.cost}</span></div>
        <button class="a-brew" type="button" data-abrew ${why?'disabled':''}>🔥 연성하기</button>${why ? `<div class="a-why">${e(why)}</div>` : ''}</div></div>
    <div class="a-bosses">${A.bosses.map(x=>`<button class="a-boss ${x.code===PICK?'on':''}" type="button" data-apick="${x.code}"><img src="monster/${x.code}.webp?v=2" alt=""><b>${e(x.mat)}</b><span class="n">${x.qty}개</span></button>`).join('')}</div>
    <p class="small" style="margin:0">괴물을 한 대 때릴 때마다 그 괴물의 재료가 1개 모여요. 연성 기회는 ${A.every}분마다 1번 충전되고 ${A.max}번까지 쌓여요. 하루에 ${A.max}번까지 연성할 수 있어요. 꽝은 없어요!</p>
    <details class="a-fold" ${typeof localStorage!=='undefined' && (()=>{ try{ return localStorage.getItem('majam-alcdex')==='1'; }catch(_){ return false; } })() ? 'open' : ''} data-adexfold><summary>📖 극복 도감 <span class="small">${found} / ${A.items.length}종 · 최고 수량을 겨뤄요</span></summary>
      <div class="a-tabs">${A.bosses.map(x=>{ const n = A.items.filter(i=>i.boss===x.code && i.best!=null).length; return `<button type="button" class="${x.code===BOSS_TAB?'on':''}" data-atab="${x.code}">${e(x.name)} ${n}/10</button>`; }).join('')}</div>
      <div class="a-dex">${A.items.filter(i=>i.boss===BOSS_TAB).map(i=>i.best!=null
        ? `<div class="a-dx ${i.tier}"><span class="em">${i.emoji}</span><span><b>${e(i.name)}</b><span class="bst">${TIER[i.tier]} · 최고 ${fmtQ(i.boss, i.best, i.unit)} · ${i.times}번</span></span></div>`
        : `<div class="a-dx no ${i.tier==='legend'?'legend':''}"><span class="em">？</span><span><b>???</b><span class="bst">${i.tier==='common'?'아직 못 찾았어요':TIER[i.tier]}</span></span></div>`).join('')}</div></details>
    ${A.recent.length ? `<details class="a-fold"><summary>🕘 최근 연성 <span class="small">${A.recent.length}번</span></summary><div class="a-recent">${A.recent.map(r=>`<span>${r.emoji} ${e(r.name)} ${fmtQ(r.item.split('_')[0], r.qty, r.unit)} <span class="small">${TIER[r.tier]}</span></span>`).join('')}</div></details>` : ''}`;
}
function resHTML(r){
  const tag = r.first ? '✨ 새로운 극복 아이템 발견!' : r.record ? `🏆 새로운 최고 기록! (전 기록 ${fmtQ(r.boss, r.old_best, r.unit)})` : `최고 기록은 ${fmtQ(r.boss, Math.max(r.old_best||0, r.qty), r.unit)}이에요`;
  return `<div class="card ${r.tier}"><span class="em">${r.emoji}</span><span class="nm">${e(r.name)}</span><span class="q">${fmtQ(r.boss, r.qty, r.unit)} 획득!</span><span class="tag">${TIER[r.tier]} · ${tag}</span></div>`;
}
async function open(){
  const d = document.getElementById('alcDlg'); if(!d) return;
  if(!d.open) d.showModal(); A = null; RES = null; render();
  try{ take(await api.alc()); }catch(err){ box().innerHTML = `<p class="small">🧪 연금술 솥이 아직 식어 있어요. 숲지기가 준비 중이에요.<br><span style="opacity:.6">${e(err.message||err)}</span></p>`; return; }
  render();
  clearInterval(timer); timer = setInterval(()=>{ if(!d.open){ clearInterval(timer); return; } const el = document.querySelector('[data-anext]'); if(el && A) el.textContent = left(A.next_at);
    if(A && A.next_at && Date.parse(A.next_at) <= Date.now()) api.alc().then(r=>{ take(r); render(); }).catch(()=>{}); }, 1000);
}
window.ALC_open = open;
document.addEventListener('click', ev=>{
  const t = ev.target;
  if(t.closest && t.closest('[data-alcopen]')){ open(); return; }
  if(!t.closest || !t.closest('#alcDlg')) return;
  if(t.closest('[data-aclose]')){ document.getElementById('alcDlg').close(); return; }
  const pk = t.closest('[data-apick]'); if(pk){ PICK = pk.dataset.apick; BOSS_TAB = PICK; RES = null; try{ localStorage.setItem('majam-alcpick', PICK); }catch(_){} render(); return; }
  const tb = t.closest('[data-atab]'); if(tb){ BOSS_TAB = tb.dataset.atab; render(); return; }
  if(t.closest('[data-abrew]')){
    if(busyA) return; busyA = true;
    const st = document.getElementById('alcStage'); st && st.classList.add('brewing'); const rs = document.getElementById('alcRes'); if(rs) rs.innerHTML = '';
    const fin = ()=>{ busyA = false; };
    (async()=>{
      try{
        const [r] = await Promise.all([api.alcBrew(PICK), new Promise(res=>setTimeout(res, 1100))]);
        const x = Array.isArray(r) ? r[0] : r; RES = x; take(x.state); BOSS_TAB = x.boss; render();
        if(x.tier==='legend' && typeof petParty==='function') petParty('👑', `전설의 극복 아이템!\n${x.emoji} ${x.name} ${fmtQ(x.boss, x.qty, x.unit)}`);
      }catch(err){ toast('⚠️ ' + (err.message||err)); try{ take(await api.alc()); }catch(_){} RES = null; render(); }
      finally{ fin(); }
    })();
    return;
  }
});
document.addEventListener('toggle', ev=>{ if(ev.target && ev.target.matches && ev.target.matches('[data-adexfold]')){ try{ localStorage.setItem('majam-alcdex', ev.target.open?'1':'0'); }catch(_){} } }, true);
})();
