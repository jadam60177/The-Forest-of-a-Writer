/* 📚 마감의 숲 · 담당자의 수상한 출판사 (publisher.js, 10-25)
   index.html 다음에 불러와요. 서버 함수는 publisher.sql
   (get_pub · pub_draw · pub_reroll · pub_retitle · pub_keep · pub_publish · pub_discard · get_pub_shops · get_pub_shop · pub_buy · pub_report_seen · pub_skin)
   그림은 pub/ 폴더. 안 산 책의 키워드는 서버가 아예 보내지 않아요 (화면에서 숨기는 게 아니에요) */
(()=>{
const css = document.createElement('style'); css.textContent = `
dialog.visit.pub-dlg{width:min(96vw,1120px);max-width:min(96vw,1120px);max-height:94vh;padding:1rem;overflow-y:auto}
@media (max-width:600px){ dialog.visit.pub-dlg{width:100vw;max-width:100vw;max-height:94vh;margin:auto 0 0;border-radius:22px 22px 0 0;padding:.8rem .7rem calc(.8rem + env(safe-area-inset-bottom,0px))} }
#pubDlg .p-head{display:flex;gap:.6rem;align-items:center;flex-wrap:wrap;margin-bottom:.5rem}
#pubDlg .p-head h3{margin:0;flex:1 1 auto}
#pubDlg .p-coin{font-family:"Jua",sans-serif;background:rgba(255,255,255,.08);border:1px solid var(--line);border-radius:999px;padding:.05rem .7rem}
#pubDlg .small{font-size:.82rem;color:var(--muted)}
#pubDlg .p-wolf{display:flex;align-items:flex-end;gap:.6rem;margin:.2rem 0 .7rem}
#pubDlg .p-wolf img{width:78px;height:auto;flex:none;filter:drop-shadow(0 3px 4px rgba(0,0,0,.25))}
#pubDlg .p-say{position:relative;background:#FFF7E3;color:#5A3A22;border:2px solid #6E4A2E;border-radius:14px;padding:.45rem .75rem;font-size:.92rem;line-height:1.45;word-break:keep-all;margin-bottom:1.1rem}
#pubDlg .p-say::before{content:"";position:absolute;left:-9px;bottom:14px;border:8px solid transparent;border-right-color:#6E4A2E;border-left:0}
#pubDlg .p-tabs{display:flex;flex-wrap:wrap;gap:.35rem;margin-bottom:.7rem}
#pubDlg .p-tab{font-family:"Jua",sans-serif;border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:999px;padding:.35rem .9rem;cursor:pointer}
#pubDlg .p-tab.on{background:#F2B544;border-color:#F2B544;color:#3A2400}
#pubDlg .p-tab .n{font-size:.75rem;opacity:.75}
#pubDlg .p-btn{font-family:"Jua",sans-serif;border:2px solid #6E4A2E;background:#FFF7E3;color:#4A2E14;border-radius:999px;padding:.35rem .9rem;cursor:pointer}
#pubDlg .p-btn:hover:not(:disabled){background:#FFE7A8}
#pubDlg .p-btn:disabled{opacity:.45;cursor:default}
#pubDlg .p-btn.big{font-size:1.1rem;padding:.6rem 1.4rem}
#pubDlg .p-btn.warn{border-color:#9A3B2A;color:#8A2A1A}
#pubDlg .p-row{display:flex;flex-wrap:wrap;gap:.4rem;align-items:center}
/* 📝 책상 */
#pubDlg .p-desk{display:grid;grid-template-columns:minmax(0,190px) minmax(0,1fr);gap:1rem;align-items:start}
@media (max-width:640px){ #pubDlg .p-desk{grid-template-columns:1fr} #pubDlg .p-desk .p-cover{max-width:170px;margin:0 auto} }
#pubDlg .p-kws{display:flex;flex-direction:column;gap:.35rem}
#pubDlg .p-kw{display:grid;grid-template-columns:4.2rem minmax(0,1fr) auto auto;gap:.4rem;align-items:center;border:1px solid var(--line);border-radius:12px;padding:.3rem .5rem;background:rgba(255,255,255,.04)}
#pubDlg .p-kw .l{font-size:.8rem;color:var(--muted)}
#pubDlg .p-kw .v{font-family:"Jua",sans-serif;font-size:1.02rem;word-break:keep-all}
#pubDlg .p-kw .lock{border:0;background:none;font-size:1.05rem;cursor:pointer;padding:.1rem .3rem;border-radius:8px}
#pubDlg .p-kw.locked{border-color:#F2B544;background:rgba(242,181,68,.12)}
#pubDlg .p-kw .re{font-size:.8rem;padding:.2rem .6rem}
#pubDlg .p-empty{text-align:center;padding:1.2rem .5rem;border:1px dashed var(--line);border-radius:16px}
/* 📕 표지 */
#pubDlg .p-cover{position:relative;aspect-ratio:3/4.3;border-radius:6px 12px 12px 6px;padding:12% 10% 10% 14%;display:flex;flex-direction:column;justify-content:space-between;
  box-shadow:inset 7px 0 0 rgba(0,0,0,.18),inset 9px 0 0 rgba(255,255,255,.15),0 6px 14px rgba(0,0,0,.3);color:var(--ct);background:linear-gradient(160deg,var(--c1),var(--c2));overflow:hidden}
#pubDlg .p-cover::after{content:"";position:absolute;inset:6% 7% 6% 11%;border:1.5px solid var(--ct);border-radius:4px;opacity:.45;pointer-events:none}
#pubDlg .p-cover .pub{font-size:.62rem;letter-spacing:.12em;opacity:.8;text-align:center}
#pubDlg .p-cover .ti{font-family:"Jua",sans-serif;font-size:1.05rem;line-height:1.3;text-align:center;word-break:keep-all;text-wrap:balance}
#pubDlg .p-cover .orn{text-align:center;font-size:1.1rem;opacity:.8}
#pubDlg .p-cover .au{font-size:.7rem;text-align:center;opacity:.85}
/* 📚 책장 */
#pubDlg .p-shelf{position:relative;width:100%;aspect-ratio:1600/891;border-radius:16px;overflow:hidden;background:#6E4A2E center/cover no-repeat;container-type:inline-size;border:3px solid #6E4A2E}
#pubDlg .p-spine{position:absolute;padding:0;border:0;background:none;cursor:pointer;transform-origin:50% 100%;transition:transform .15s}
#pubDlg .p-spine img{display:block;width:100%;height:100%;filter:drop-shadow(.15cqw 0 .15cqw rgba(0,0,0,.35))}
#pubDlg .p-spine:hover,#pubDlg .p-spine:focus-visible{transform:translateY(-6%);outline:none}
#pubDlg .p-spine.bought::after{content:"✓";position:absolute;left:50%;top:-1.4cqw;transform:translateX(-50%);font-size:1.2cqw;background:#5E7F45;color:#fff;border-radius:999px;padding:0 .35cqw;line-height:1.5}
#pubDlg .p-spine.new::after{content:"NEW";position:absolute;left:50%;top:-1.4cqw;transform:translateX(-50%);font-size:.9cqw;background:#C2453A;color:#fff;border-radius:999px;padding:0 .35cqw;line-height:1.5}
#pubDlg .p-pager{display:flex;justify-content:center;align-items:center;gap:.6rem;margin:.5rem 0}
#pubDlg .p-skins{display:flex;flex-wrap:wrap;gap:.35rem;margin:.5rem 0}
#pubDlg .p-skins button{font-family:"Jua",sans-serif;font-size:.85rem;border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:999px;padding:.25rem .75rem;cursor:pointer}
#pubDlg .p-skins button.on{background:#F2B544;border-color:#F2B544;color:#3A2400}
#pubDlg .p-skins button.lock{border-style:dashed}
#pubDlg details.p-fold{border:1px solid var(--line);border-radius:14px;padding:.55rem .8rem;margin-top:.7rem}
#pubDlg details.p-fold > summary{cursor:pointer;font-family:"Jua",sans-serif;font-size:1.02rem;list-style:none}
#pubDlg details.p-fold > summary::-webkit-details-marker{display:none}
#pubDlg details.p-fold > summary::before{content:"▸ "}
#pubDlg details.p-fold[open] > summary::before{content:"▾ "}
#pubDlg .p-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:.6rem;margin-top:.6rem}
#pubDlg .p-mini{display:flex;flex-direction:column;gap:.35rem;align-items:stretch}
#pubDlg .p-mini .p-cover{padding:14% 10% 10% 15%}
#pubDlg .p-mini .p-cover .ti{font-size:.88rem}
#pubDlg .p-mini button.open{border:0;background:none;padding:0;cursor:pointer;text-align:left}
#pubDlg .p-shops{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.6rem}
#pubDlg .p-shopcard{display:flex;gap:.6rem;align-items:center;border:1px solid var(--line);border-radius:14px;padding:.6rem .7rem;cursor:pointer;background:rgba(255,255,255,.04);text-align:left;color:var(--ink);font:inherit}
#pubDlg .p-shopcard:hover{border-color:#F2B544}
#pubDlg .p-shopcard .ic{font-size:1.8rem}
#pubDlg .p-shopcard b{font-family:"Jua",sans-serif;font-weight:400;font-size:1.02rem;display:block}
/* 📖 펼친 책 */
#pubOpen{position:fixed;inset:0;z-index:2000;background:rgba(20,14,8,.55);display:grid;place-items:center;padding:1rem}
#pubOpen[hidden]{display:none}
#pubOpen .bk{position:relative;width:min(94vw,880px);aspect-ratio:1400/740;background:url(pub/openbook.webp) center/100% 100% no-repeat;container-type:inline-size;filter:drop-shadow(0 12px 24px rgba(0,0,0,.45))}
#pubOpen .pg{position:absolute;top:13%;bottom:13%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#5A3A22;gap:1.2cqw;overflow:hidden}
#pubOpen .pg.l{left:12%;width:32%}
#pubOpen .pg.r{left:56%;width:32%}
#pubOpen .pg .pub{font-size:1.35cqw;letter-spacing:.15em;opacity:.75}
#pubOpen .pg .ti{font-family:"Jua",sans-serif;font-size:3cqw;line-height:1.35;word-break:keep-all;text-wrap:balance}
#pubOpen .pg hr{width:70%;border:0;border-top:1.5px solid rgba(110,74,46,.4);margin:.4cqw 0}
#pubOpen .pg .meta{font-size:1.5cqw;opacity:.85;line-height:1.6}
#pubOpen .pg .lk{font-size:4cqw;opacity:.7}
#pubOpen .pg h4{margin:0;font-family:"Jua",sans-serif;font-weight:400;font-size:2.3cqw}
#pubOpen .kwl{display:grid;grid-template-columns:auto 1fr;gap:.6cqw 1.4cqw;text-align:left;font-size:1.8cqw;width:100%}
#pubOpen .kwl dt{opacity:.65}
#pubOpen .kwl dd{margin:0;font-family:"Jua",sans-serif;font-size:2cqw}
#pubOpen .buy{font-family:"Jua",sans-serif;font-size:1.8cqw;border:0;background:#2E2018;color:#FFF3DC;border-radius:999px;padding:.9cqw 2.4cqw;cursor:pointer}
#pubOpen .buy:disabled{opacity:.5}
#pubOpen .acts{display:flex;gap:1cqw;flex-wrap:wrap;justify-content:center}
#pubOpen .acts button{font-family:"Jua",sans-serif;font-size:1.45cqw;border:1.5px solid #6E4A2E;background:#FFF7E3;color:#4A2E14;border-radius:999px;padding:.5cqw 1.4cqw;cursor:pointer}
#pubOpen .x{position:absolute;right:1%;top:-5.5cqw;font-size:2.4cqw;border:0;background:#FFF7E3;color:#4A2E14;border-radius:999px;width:4.6cqw;height:4.6cqw;cursor:pointer}
#pubOpen .stamp{position:absolute;right:9%;bottom:12%;width:12cqw;transform:rotate(-12deg);opacity:.9;pointer-events:none}
@media (max-width:600px){ #pubOpen{padding:.3rem} #pubOpen .bk{width:99vw} #pubOpen .pg{top:11%;bottom:11%;gap:1.6cqw} #pubOpen .pg.l{left:10%;width:35%} #pubOpen .pg.r{left:54%;width:37%} #pubOpen .pg .ti{font-size:4.6cqw} #pubOpen .kwl{font-size:3cqw;gap:.8cqw 1.6cqw} #pubOpen .kwl dd{font-size:3.3cqw} #pubOpen .pg h4{font-size:3.4cqw} #pubOpen .buy{font-size:3.4cqw;padding:1.4cqw 3cqw} #pubOpen .acts button{font-size:2.8cqw} #pubOpen .pg .meta{font-size:2.8cqw} #pubOpen .pg .pub{font-size:2.4cqw} #pubOpen .x{width:7cqw;height:7cqw;font-size:3.4cqw;top:-8cqw} #pubOpen .stamp{width:15cqw} }
/* 🧾 판매 보고서 */
#pubRcpt .paper{position:relative;background:#FFFDF6;color:#3B2A1A;border-radius:6px;padding:1.2rem 1.1rem 1.4rem;font-family:"Gowun Dodum","Jua",sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.3);
  background-image:repeating-linear-gradient(transparent 0 26px,rgba(110,74,46,.08) 26px 27px)}
#pubRcpt h3{margin:0 0 .2rem;text-align:center;font-family:"Jua",sans-serif}
#pubRcpt .when{text-align:center;font-size:.8rem;opacity:.7;margin:0 0 .8rem}
#pubRcpt table{width:100%;border-collapse:collapse;font-size:.92rem}
#pubRcpt td{padding:.3rem .2rem;border-bottom:1px dashed rgba(110,74,46,.3);vertical-align:top}
#pubRcpt td.n{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
#pubRcpt .sum td{font-family:"Jua",sans-serif;border-bottom:0;padding-top:.6rem}
#pubRcpt .cap{font-size:.82rem;opacity:.8;margin:.8rem 0 0;line-height:1.5}
#pubRcpt .stampimg{position:absolute;right:.6rem;bottom:2.6rem;width:118px;transform:rotate(-14deg);opacity:.92;pointer-events:none}
#pubRcpt .take{display:block;margin:1rem auto 0;font-family:"Jua",sans-serif;border:0;background:#2E2018;color:#FFF3DC;border-radius:999px;padding:.45rem 1.4rem;cursor:pointer}
/* 🏛️ 광장 입구 */
.pub-door{display:flex;align-items:center;gap:1rem;margin:0 0 1rem;padding:.8rem 1.1rem;border-radius:18px;border:2px solid #C9A46A;
  background:linear-gradient(135deg,#FFF6E2,#F3E0BC);color:#4A2E14;cursor:pointer;font:inherit;text-align:left;width:100%;box-shadow:0 6px 16px rgba(60,40,10,.25);transition:transform .15s,box-shadow .15s}
.pub-door:hover{transform:translateY(-2px);box-shadow:0 10px 22px rgba(60,40,10,.3)}
.pub-door img{width:150px;max-width:32%;height:auto;flex:none;filter:drop-shadow(0 4px 6px rgba(0,0,0,.3))}
.pub-door b{font-family:"Jua",sans-serif;font-weight:400;font-size:1.3rem;display:block;color:#3B2410;margin-bottom:.2rem}
.pub-door span{font-size:.9rem;color:#6A4A2A;line-height:1.5}
.pub-door .go{display:inline-block;margin-top:.45rem;font-family:"Jua",sans-serif;font-size:.92rem;background:#2E2018;color:#FFF3DC;border-radius:999px;padding:.25rem .9rem}
`; document.head.appendChild(css);

const KW = [['world','🌍 세계관'],['top','🗡️ 공'],['bottom','🌸 수'],['rel','💞 관계'],['event','⚡ 사건'],['mood','🌙 분위기']];
// 표지 색 (낮은 채도) — 0 현대 · 1 판타지 · 2 동양 · 3 가이드/근미래 · 4 오메가/뒷세계 · 5 서양
const COVERS = [{c1:'#EFE3CC',c2:'#D8C6A4',ct:'#2F3A5C',o:'☕'},{c1:'#5D4F86',c2:'#3E5E6B',ct:'#F2E3B6',o:'✦'},{c1:'#3E4246',c2:'#7E95A3',ct:'#EDE6D6',o:'❀'},
                {c1:'#6E88A8',c2:'#BFC8D2',ct:'#1F2E44',o:'◇'},{c1:'#C9A3B2',c2:'#8E7A8C',ct:'#3B2233',o:'❦'},{c1:'#7A3A3A',c2:'#4E2A2A',ct:'#F0D9A8',o:'♛'}];
// 책장 스킨: 칸(가로 %) · 줄(위·아래 %) — 그림 1600×891 기준
const SKINS = {
  wood:   {n:'🪵 원목 서점',  bays:[[12.6,32.3],[35.7,64.3],[67.7,87.5]], rows:[[20,26.9],[28.8,38.1],[40,49.3],[51.2,59.6],[62.1,70]]},
  magic:  {n:'🔮 마법 서점',  bays:[[18.2,35.4],[39.2,60.8],[65.2,82.4]], rows:[[22.4,29.6],[30.8,40.1],[41.4,50.5],[51.9,60.9]]},
  classic:{n:'🏛️ 고전 서재',  bays:[[18.6,35.7],[40.2,59.8],[64.2,81.7]], rows:[[19.2,26.6],[27.8,37.1],[38.5,47.9],[49.5,59.6]]},
  hanok:  {n:'🏮 한옥 책방',  bays:[[19.6,34],[37.6,62.6],[66.1,80.9]], rows:[[21.6,29],[31.6,39.4],[41.4,50.6],[51.9,60.2]]},
  modern: {n:'🌿 달빛 서점',  bays:[[17,34.7],[38.8,62.4],[66.6,85.7]], rows:[[20.6,29.1],[30.5,39.6],[41,49.6],[51.2,60.4]]},
};
const SKIN_KEYS = Object.keys(SKINS);
const SPINES = [[56,240],[58,240],[51,240],[61,240],[64,240],[57,240],[53,240],[58,240],[51,240],[58,240],[53,240],[56,240],[57,240],[61,240],[70,240],[60,240],[62,240],[55,240],[59,240],[52,240],[57,240],[62,240],[60,240],[59,240],[65,240],[62,240],[67,240],[70,240],[63,240],[69,240],[58,240]];
const AR = 1600/891, V = 1;
const spineOf = n => ((((+n||1)-1) % SPINES.length) + SPINES.length) % SPINES.length;
const e = s => (typeof esc==='function' ? esc(s) : String(s ?? ''));
const day = iso => { if(!iso) return ''; const d = new Date(iso); return `${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()}`; };
const WOLF = {
  desk0:['원고요? 아뇨, 제가 이미 출간해 뒀습니다만.','오늘의 소재 뽑기, 해 보시겠어요? 마감보다는 즐거울 거예요.','소재가 막혔다고요? 늑대의 감을 믿어 보세요.'],
  desk1:['오, 이건 팔리겠는데요? 표지는 제가 알아서 했습니다.','마음에 안 드는 키워드는 🔄 다시 뽑으세요. 🔒 자물쇠를 걸면 안 바뀌어요.','제목이 별로면 ✏️ 제목만 다시! 세 번까진 서비스예요.'],
  shop:['작가님 서가 참 근사하네요. 진열은 제가 했습니다.','책등을 누르면 펼쳐 볼 수 있어요.'],
  street:['다른 작가님들 신간이 나왔어요. 제목만 보고 골라 보세요!','한 권에 🪙 10. 펼치면 숨은 소재가 보여요.'],
  bought:['사 모은 책들이에요. 언제든 다시 펼쳐 볼 수 있어요.'],
};
const pick = a => a[Math.floor(Math.random()*a.length)];

let P = null, TAB = 'desk', SHOP = null, PAGE = 0, SHOPS = null, LOCKS = {}, busyP = false;
try{ TAB = localStorage.getItem('majam-pubtab') || 'desk'; LOCKS = JSON.parse(localStorage.getItem('majam-publocks')||'{}'); }catch(_){}
const saveLocks = () => { try{ localStorage.setItem('majam-publocks', JSON.stringify(LOCKS)); }catch(_){} };
const dlg = () => document.getElementById('pubDlg'), box = () => document.getElementById('pubBox');
const take = r => { const x = Array.isArray(r) ? r[0] : r; if(x && x.keep_max!==undefined) P = x; if(P && P.coins!=null && typeof ME!=='undefined' && ME){ ME.coins = P.coins; } typeof renderTop==='function' && renderTop(); };
const run = fn => (typeof act==='function') ? act(async()=>{ if(busyP) return; busyP = true; try{ await fn(); } finally { busyP = false; } }) : fn();

function coverHTML(b, small){
  const c = COVERS[(+b.cover||0) % COVERS.length];
  return `<div class="p-cover" style="--c1:${c.c1};--c2:${c.c2};--ct:${c.ct}"><div class="pub">마감의 숲 출판사</div><div class="ti">${e(b.title)}</div><div class="orn">${c.o}</div>${small?'':`<div class="au">${e(b.author||'')}</div>`}</div>`;
}
function wolfHTML(k){ return `<div class="p-wolf"><img src="pub/wolf.webp?v=${V}" alt="담당자 늑대"><div class="p-say">${e(pick(WOLF[k]))}</div></div>`; }

/* ---------- 📚 책장 그리기 ---------- */
// 책들을 칸마다 왼쪽부터 꽂아요: 가운데 칸 → 왼쪽 → 오른쪽 순으로 한 줄씩
function slotsOf(skin){
  const S = SKINS[skin] || SKINS.wood, out = [];
  S.rows.forEach(([t,b])=>{
    const rh = b - t, h = rh*.93;                  // 책 높이 (세로 %)
    [1,0,2].forEach(bi=>{ const [x0,x1] = S.bays[bi]; out.push({x0:x0+.5, x1:x1-.5, top:b-h, h, bottom:b}); });
  });
  return out;
}
function layoutBooks(books, skin){
  const slots = slotsOf(skin), pages = []; let page = [], si = 0, x = slots[0].x0;
  books.forEach(bk=>{
    const sp = SPINES[spineOf(bk.spine)];
    for(;;){
      const s = slots[si], w = s.h * (sp[0]/sp[1]) / AR * 1.35;   // 책등을 조금 통통하게   // 가로 % = 세로 % × 비율 ÷ 화면비
      if(x + w <= s.x1){ page.push({bk, left:x, top:s.top, w, h:s.h}); x += w + .12; break; }
      si++; if(si >= slots.length){ pages.push(page); page = []; si = 0; } x = slots[si].x0;
    }
  });
  if(page.length || !pages.length) pages.push(page);
  return pages;
}
function shelfHTML(books, skin, opts={}){
  const pages = layoutBooks(books, skin); PAGE = Math.min(PAGE, pages.length-1);
  const cur = pages[PAGE] || [];
  return `<div class="p-shelf" style="background-image:url(pub/skin_${skin||'wood'}.webp?v=${V})">${cur.map(p=>{ const k = spineOf(p.bk.spine)+1;
      return `<button class="p-spine ${opts.bought && opts.bought.has(p.bk.id)?'bought':''} ${opts.newIds && opts.newIds.has(p.bk.id)?'new':''}" type="button" data-pbook="${p.bk.id}" title="${e(p.bk.title)}" style="left:${p.left.toFixed(2)}%;top:${p.top.toFixed(2)}%;width:${p.w.toFixed(2)}%;height:${p.h.toFixed(2)}%"><img src="pub/spine_${k}.webp?v=${V}" alt="${e(p.bk.title)}" draggable="false" loading="lazy"></button>`; }).join('')}</div>
    ${pages.length>1 ? `<div class="p-pager"><button class="p-btn" type="button" data-ppage="-1" ${PAGE<=0?'disabled':''}>◀ 앞 책장</button><span class="small">${PAGE+1} / ${pages.length}</span><button class="p-btn" type="button" data-ppage="1" ${PAGE>=pages.length-1?'disabled':''}>다음 책장 ▶</button></div>` : ''}`;
}

/* ---------- 화면 ---------- */
function render(){
  const b = box(); if(!b) return;
  if(!P){ b.innerHTML = `<p class="small">📚 출판사 문을 여는 중이에요…</p>`; return; }
  const tabs = [['desk','📝 집필 책상'],['mine','📚 내 서점', P.shelf.length],['street','🏪 숲 서점 거리'],['bought','📖 산 책', P.bought.length]];
  let body = '';
  if(TAB==='desk') body = deskHTML();
  else if(TAB==='mine') body = mineHTML();
  else if(TAB==='street') body = streetHTML();
  else body = boughtHTML();
  b.innerHTML = `<div class="p-head"><h3>📚 담당자의 수상한 출판사</h3>${P.report && P.report.length ? `<button class="p-btn" type="button" data-preport>🧾 판매 보고서 ${P.report.reduce((a,x)=>a+x.new,0)}권</button>` : ''}<span class="p-coin">🪙 ${(P.coins||0).toLocaleString()}</span><button class="p-btn" type="button" data-pclose aria-label="닫기">✕</button></div>
    <div class="p-tabs">${tabs.map(([k,n,c])=>`<button class="p-tab ${TAB===k?'on':''}" type="button" data-ptab="${k}">${n}${c?` <span class="n">${c}</span>`:''}</button>`).join('')}</div>${body}`;
}
function deskHTML(){
  const d = P.desk;
  if(!d) return wolfHTML('desk0') + `<div class="p-empty"><p style="margin:.2rem 0 .8rem">세계관 · 공 · 수 · 관계 · 사건 · 분위기<br>여섯 가지 소재가 한 번에 나오고, 담당자가 제목과 표지까지 붙여 줘요.</p>
    <button class="p-btn big" type="button" data-pdraw ${P.coins < P.draw_price ? 'disabled' : ''}>🎲 소재 뽑기 · 🪙 ${P.draw_price}</button>
    <p class="small" style="margin:.8rem 0 0">뽑은 소재는 📚 서점에 진열하거나, 📦 보관함(${P.kept.length}/${P.keep_max}권)에 넣거나, 🗑️ 버릴 수 있어요.<br>실제 원고를 쓰라는 게 아니에요. 마음 가는 대로 굴려 보세요!</p></div>`;
  const L = LOCKS[d.id] || {};
  return wolfHTML('desk1') + `<div class="p-desk"><div>${coverHTML(d)}<p class="small" style="text-align:center;margin:.4rem 0 0">${e(d.title)}</p></div>
    <div><div class="p-kws">${KW.map(([k,l])=>`<div class="p-kw ${L[k]?'locked':''}"><span class="l">${l}</span><span class="v">${e(d.kw[k])}</span>
        <button class="lock" type="button" data-plock="${k}" title="${L[k]?'자물쇠 풀기':'이 키워드 고정'}" aria-label="${L[k]?'자물쇠 풀기':'고정하기'}">${L[k]?'🔒':'🔓'}</button>
        <button class="p-btn re" type="button" data-preroll="${k}" ${L[k] || P.coins < P.reroll_price ? 'disabled' : ''}>🔄 🪙 ${P.reroll_price}</button></div>`).join('')}</div>
      <p class="small" style="margin:.5rem 0">🔄 다시 뽑으면 그 칸만 바뀌고 제목도 새로 붙어요. 세계관을 바꾸면 안 어울리게 된 키워드는 공짜로 같이 바뀌어요.</p>
      <div class="p-row"><button class="p-btn" type="button" data-pretitle ${d.title_left<=0?'disabled':''}>✏️ 제목만 다시 (무료 ${d.title_left}번)</button></div>
      <div class="p-row" style="margin-top:.7rem"><button class="p-btn big" type="button" data-ppub="${d.id}">📚 서점에 진열</button><button class="p-btn" type="button" data-pkeep="${d.id}">📦 보관함에 넣기</button><button class="p-btn warn" type="button" data-pdiscard="${d.id}">🗑️ 버리기</button></div></div></div>`;
}
function mineHTML(){
  const skins = P.skins || ['wood'];
  return wolfHTML('shop') + `<div class="p-skins">${SKIN_KEYS.map(k=>{ const own = skins.includes(k);
      return `<button type="button" class="${P.skin===k?'on':''} ${own?'':'lock'}" data-pskin="${k}">${SKINS[k].n}${own?'':` · 🪙 ${P.skin_price}`}</button>`; }).join('')}</div>
    ${P.shelf.length ? shelfHTML(P.shelf, P.skin, {newIds:new Set((P.report||[]).map(x=>x.id))}) : `<div class="p-empty">아직 진열한 책이 없어요. 📝 집필 책상에서 소재를 뽑아 진열해 보세요!</div>`}
    <p class="small" style="margin:.4rem 0 0">진열한 책 ${P.shelf.length}권 · 팔린 부수 ${P.shelf.reduce((a,x)=>a+(x.sold||0),0)}권 · 책등을 누르면 펼쳐져요</p>
    <details class="p-fold" ${P.kept.length && !(P.shelf.length) ? 'open' : ''}><summary>📦 비공개 보관함 <span class="small">${P.kept.length} / ${P.keep_max}권</span></summary>
      ${P.kept.length ? `<div class="p-list">${P.kept.map(b=>`<div class="p-mini"><button class="open" type="button" data-pbook="${b.id}">${coverHTML(b, true)}</button>
        <div class="p-row"><button class="p-btn" type="button" data-ppub="${b.id}" style="font-size:.8rem">📚 진열</button><button class="p-btn warn" type="button" data-pdiscard="${b.id}" style="font-size:.8rem">🗑️</button></div></div>`).join('')}</div>`
      : `<p class="small">보관한 소재가 없어요.</p>`}</details>`;
}
function streetHTML(){
  if(SHOP) return wolfHTML('street') + `<div class="p-row" style="margin-bottom:.5rem"><button class="p-btn" type="button" data-pstreet>← 서점 거리로</button><b style="font-family:Jua,sans-serif">${e(SHOP.name||'')}님의 서점</b><span class="small">${SHOP.books.length}권</span></div>
    ${SHOP.books.length ? shelfHTML(SHOP.books.map(x=>x.book), SHOP.skin, {bought:new Set(SHOP.books.filter(x=>x.bought).map(x=>x.book.id))}) : `<div class="p-empty">아직 진열한 책이 없는 서점이에요.</div>`}
    <p class="small">책등을 눌러 제목을 보고, 🪙 ${P.buy_price}에 사면 숨은 소재가 펼쳐져요. ✓ 표시는 이미 산 책이에요.</p>`;
  if(!SHOPS){ loadShops(); return wolfHTML('street') + `<p class="small">서점 거리를 둘러보는 중이에요…</p>`; }
  const me = typeof meId==='function' ? meId() : null, list = SHOPS.filter(s=>s.id!==me);
  return wolfHTML('street') + (list.length ? `<div class="p-shops">${list.map(s=>`<button class="p-shopcard" type="button" data-pshop="${e(s.id)}"><span class="ic">📚</span><span><b>${e(s.name)}님의 서점</b><span class="small">진열 ${s.books}권${s.bought?` · 내가 산 책 ${s.bought}권`:''}</span></span></button>`).join('')}</div>`
    : `<div class="p-empty">아직 책을 진열한 이웃이 없어요. 첫 번째 서점이 되어 보세요!</div>`);
}
function boughtHTML(){
  return wolfHTML('bought') + (P.bought.length ? `<div class="p-list">${P.bought.map(b=>`<div class="p-mini"><button class="open" type="button" data-pbook="${b.id}">${coverHTML(b)}</button><span class="small">${e(b.author||'')} · ${day(b.published_at)}</span></div>`).join('')}</div>`
    : `<div class="p-empty">아직 산 책이 없어요. 🏪 숲 서점 거리에서 제목이 끌리는 책을 골라 보세요!</div>`);
}
async function loadShops(){ try{ SHOPS = (await api.pubShops()) || []; }catch(err){ SHOPS = []; } if(TAB==='street') render(); }

/* ---------- 📖 펼친 책 ---------- */
function findBook(id){
  const all = [P.desk, ...P.shelf, ...P.kept, ...P.bought].filter(Boolean);
  const mine = all.find(b=>b.id===id); if(mine) return {b:mine, full:true, mine: !P.bought.some(x=>x.id===id)};
  const s = SHOP && SHOP.books.find(x=>x.book.id===id); if(s) return {b:s.book, full:!!s.book.kw, mine:false, bought:s.bought};
  return null;
}
function openBook(id){
  const f = findBook(id); if(!f) return; const b = f.b, el = document.getElementById('pubOpen');
  const isMine = f.mine && b.owner === (typeof meId==='function' ? meId() : b.owner);
  const right = b.kw
    ? `<h4>📜 숨은 소재</h4><dl class="kwl">${KW.map(([k,l])=>`<dt>${l}</dt><dd>${e(b.kw[k])}</dd>`).join('')}</dl>
       ${isMine ? `<div class="acts">${b.state==='shelf' ? `<button type="button" data-pkeep="${b.id}">📦 보관함으로 내리기</button>` : b.state==='kept' ? `<button type="button" data-ppub="${b.id}">📚 진열하기</button>` : ''}${b.state!=='desk'?`<button type="button" data-pdiscard="${b.id}">🗑️ 버리기</button>`:''}</div>` : ''}`
    : `<div class="lk">🔒</div><h4>비밀 소재</h4><div class="meta">이 책에는 어떤 이야기가 담겨 있을까요?</div><button class="buy" type="button" data-pbuy="${b.id}" ${P.coins < P.buy_price ? 'disabled' : ''}>🪙 ${P.buy_price}로 펼쳐 보기</button>${P.coins < P.buy_price ? '<div class="meta">코인이 모자라요</div>' : ''}`;
  el.innerHTML = `<div class="bk" role="dialog" aria-label="${e(b.title)}"><button class="x" type="button" data-pobclose aria-label="닫기">✕</button>
    <div class="pg l"><div class="pub">마감의 숲 출판사</div><div class="ti">${e(b.title)}</div><hr><div class="meta">저자 · ${e(b.author||'')} 작가님<br>${b.published_at ? `${day(b.published_at)} 출간` : '아직 출간 전'}${b.state==='shelf' || b.sold ? `<br>📈 판매 ${b.sold||0}부` : ''}</div></div>
    <div class="pg r">${right}</div>${b.kw && !isMine && (f.bought || P.bought.some(x=>x.id===b.id)) ? `<img class="stamp" src="pub/stamp_approve.webp?v=${V}" alt="">` : ''}</div>`;
  el.hidden = false;
}
const closeBook = () => { const el = document.getElementById('pubOpen'); if(el){ el.hidden = true; el.innerHTML = ''; } };

/* ---------- 🧾 판매 보고서 ---------- */
function showReport(){
  const R = P.report || []; if(!R.length) return;
  const tot = R.reduce((a,x)=>a+x.new,0), d = document.getElementById('pubRcpt');
  document.getElementById('pubPaper').innerHTML = `<h3>🧾 담당자의 판매 보고서</h3><p class="when">${day(new Date().toISOString())} · 마감의 숲 출판사</p>
    <table>${R.map(x=>`<tr><td>${e(x.title)}</td><td class="n">+${x.new}부</td><td class="n">누적 ${x.sold}부</td></tr>`).join('')}
    <tr class="sum"><td>합계</td><td class="n">+${tot}부</td><td></td></tr></table>
    <p class="cap">이웃 작가님들이 작가님의 책을 펼쳐 봤어요. 판매 대금은 담당자가 원고료 대신… 아, 아닙니다. 명예는 작가님 것이에요!</p>
    <img class="stampimg" src="pub/stamp_sold.webp?v=${V}" alt="판매 완료 도장">
    <button class="take" type="button" id="pubRcptOk">확인했어요</button>`;
  if(!d.open) d.showModal();
  document.getElementById('pubRcptOk').onclick = ()=>run(async()=>{ take(await api.pubReportSeen()); d.close(); render(); });
}

/* ---------- 열기 ---------- */
async function open(ownerId){
  const d = dlg(); if(!d) return;
  if(!d.open) d.showModal();
  P = null; render();
  try{ take(await api.pub()); }catch(err){ box().innerHTML = `<p class="small">📚 출판사를 아직 열 수 없어요. 숲지기가 준비 중이에요.<br><span style="opacity:.6">${e(err.message||err)}</span></p>`; return; }
  SHOPS = null; SHOP = null; PAGE = 0;
  if(ownerId){ TAB = 'street'; await openShop(ownerId); }
  render();
  if(P.report && P.report.length) setTimeout(showReport, 300);
}
async function openShop(id){ try{ SHOP = await api.pubShop(id); PAGE = 0; }catch(err){ toast('⚠️ ' + (err.message||err)); } }
window.PUB_open = open;

document.addEventListener('click', ev=>{
  const t = ev.target;
  if(t.closest && t.closest('[data-pubopen]')){ ev.preventDefault(); open(); return; }
  const pv = t.closest && t.closest('[data-pubvisit]'); if(pv){ document.getElementById('visit')?.close(); open(pv.dataset.pubvisit); return; }
  if(t.closest('#pubOpen')){
    if(t.closest('[data-pobclose]') || t.id==='pubOpen'){ closeBook(); return; }
  }
  if(!t.closest('#pubDlg, #pubOpen')) return;
  if(t.closest('[data-pclose]')){ dlg().close(); return; }
  const tb = t.closest('[data-ptab]'); if(tb){ TAB = tb.dataset.ptab; PAGE = 0; if(TAB==='street'){ SHOP = null; SHOPS = null; } try{ localStorage.setItem('majam-pubtab', TAB); }catch(_){} render(); return; }
  if(t.closest('[data-preport]')){ showReport(); return; }
  const pg = t.closest('[data-ppage]'); if(pg){ PAGE += +pg.dataset.ppage; render(); return; }
  const bk = t.closest('[data-pbook]'); if(bk){ openBook(+bk.dataset.pbook); return; }
  if(t.closest('[data-pstreet]')){ SHOP = null; SHOPS = null; PAGE = 0; render(); return; }
  const sh = t.closest('[data-pshop]'); if(sh) return run(async()=>{ await openShop(sh.dataset.pshop); render(); });
  if(t.closest('[data-pdraw]')) return run(async()=>{
    if(!(typeof QUIET==='function' && QUIET()) && !(await ask(`🪙 ${P.draw_price}코인으로 소재를 뽑을까요?`))) return;
    take(await api.pubDraw()); render(); });
  const lk = t.closest('[data-plock]'); if(lk && P.desk){ const id = P.desk.id, k = lk.dataset.plock; LOCKS[id] = LOCKS[id] || {}; LOCKS[id][k] = !LOCKS[id][k]; saveLocks(); render(); return; }
  const rr = t.closest('[data-preroll]'); if(rr) return run(async()=>{ const k = rr.dataset.preroll; if((LOCKS[P.desk.id]||{})[k]) return;
    take(await api.pubReroll(k)); render(); });
  if(t.closest('[data-pretitle]')) return run(async()=>{ take(await api.pubRetitle()); render(); });
  const pb = t.closest('[data-ppub]'); if(pb) return run(async()=>{
    if(!(await ask('이 책을 서점에 진열할까요?\n진열하면 제목과 소재는 더 바꿀 수 없어요. 이웃은 제목만 보고 🪙 10에 살 수 있어요.'))) return;
    const id = +pb.dataset.ppub; take(await api.pubPublish(id)); delete LOCKS[id]; saveLocks(); closeBook(); render(); toast('📚 서점에 새 책이 꽂혔어요!'); });
  const kp = t.closest('[data-pkeep]'); if(kp) return run(async()=>{ const id = +kp.dataset.pkeep; take(await api.pubKeep(id)); closeBook(); render(); toast('📦 보관함에 넣었어요'); });
  const dc = t.closest('[data-pdiscard]'); if(dc) return run(async()=>{
    if(!(await ask('이 소재를 버릴까요?\n쓴 코인은 돌아오지 않아요. (이미 산 이웃은 계속 볼 수 있어요)'))) return;
    const id = +dc.dataset.pdiscard; take(await api.pubDiscard(id)); delete LOCKS[id]; saveLocks(); closeBook(); render(); });
  const sk = t.closest('[data-pskin]'); if(sk) return run(async()=>{ const k = sk.dataset.pskin; if(P.skin===k) return;
    if(!(P.skins||[]).includes(k) && !(await ask(`${SKINS[k].n} 꾸미기를 🪙 ${P.skin_price}에 살까요?\n한 번 사면 언제든 바꿔 끼울 수 있어요.`))) return;
    take(await api.pubSkin(k)); render(); });
  const by = t.closest('[data-pbuy]'); if(by) return run(async()=>{ const id = +by.dataset.pbuy;
    if(!(await ask(`🪙 ${P.buy_price}코인으로 이 책을 살까요?\n숨은 소재가 펼쳐지고, 📖 산 책에 계속 남아요.`))) return;
    const r = await api.pubBuy(id), x = Array.isArray(r) ? r[0] : r;
    if(x && x.coins!=null){ P.coins = x.coins; if(typeof ME!=='undefined' && ME) ME.coins = x.coins; typeof renderTop==='function' && renderTop(); }
    if(SHOP){ const s = SHOP.books.find(y=>y.book.id===id); if(s){ s.book = x.book; s.bought = true; } }
    try{ take(await api.pub()); }catch(_){}
    render(); openBook(id); });
});
document.addEventListener('keydown', ev=>{ if(ev.key==='Escape'){ const el = document.getElementById('pubOpen'); if(el && !el.hidden){ ev.preventDefault(); closeBook(); } } });
})();
