/* ☕ 마감의 숲 · 음료 가판대 (stall.js, 10-24)
   index.html 다음에 불러와요. 서버 함수는 stall.sql (get_stall · stall_claim · stall_craft · stall_remove · stall_vow_start · stall_vow_claim).
   그림은 stall/ 폴더. 숫자는 stall.sql 맨 위 함수들과 아래 NUM 이 같아야 해요. */
(()=>{
const css = document.createElement('style'); css.textContent = `dialog.visit.stall-dlg{width:min(96vw,1120px);max-width:min(96vw,1120px);max-height:94vh;padding:1rem;overflow-y:auto}
@media (max-width:600px){ dialog.visit.stall-dlg{width:100vw;max-width:100vw;max-height:94vh;margin:auto 0 0;border-radius:22px 22px 0 0;padding:.8rem .7rem calc(.8rem + env(safe-area-inset-bottom,0px))} }
#stallDlg .s-head{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin-bottom:.6rem}
#stallDlg .s-head h3{margin:0;flex:1 1 auto}
#stallDlg .s-wallet{display:flex;gap:.4rem;flex-wrap:wrap;font-family:"Jua",sans-serif}
#stallDlg .s-wallet span{background:rgba(255,255,255,.08);border:1px solid var(--line);border-radius:999px;padding:.05rem .6rem}
#stallDlg .s-guide{border:1px dashed var(--line);border-radius:12px;padding:.4rem .8rem;margin:.6rem 0;font-size:.9rem}
#stallDlg .s-guide p{margin:.3rem 0}
#stallDlg .small{font-size:.82rem;color:var(--muted)}
#stallDlg .s-note{font-size:.82rem;color:var(--muted);margin:.2rem 0;grid-column:1/-1}
/* 🎪 무대 */
#stallDlg .s-stage{position:relative;container-type:inline-size;width:100%;aspect-ratio:1600/1195;border-radius:16px;overflow:hidden;
  background:url(stall/bg_day.webp) center/cover no-repeat,#9CC46A;box-shadow:0 8px 24px rgba(0,0,0,.25)}
#stallDlg .s-stage.night{background-image:url(stall/bg_night.webp)}
#stallDlg .s-sign{position:absolute;left:16%;width:25%;top:20.8%;height:8.4%;display:grid;place-items:center;text-align:center;font-family:"Jua",sans-serif;font-weight:400;color:#3B1F0B;font-size:2.5cqw;line-height:1.12;letter-spacing:.02em;border:0;background:none;padding:0;cursor:pointer;z-index:3;text-shadow:0 0 .35cqw #F6DEAF,0 0 .35cqw #F6DEAF,0 0 .2cqw #F6DEAF}
#stallDlg .s-sign:hover{color:#6A3510}
#stallDlg .s-sign .pen{font-size:1.2cqw;opacity:.7;margin-left:.3cqw}
#stallDlg .s-sign small{display:block;font-size:1.35cqw;color:#5A3416;margin-top:.2cqw}
#stallDlg .s-hud{position:absolute;top:1.6cqw;left:1.6cqw;right:1.6cqw;display:flex;gap:.8cqw;flex-wrap:wrap;align-items:center;z-index:8}
#stallDlg .s-pill{background:rgba(255,250,238,.92);color:#3A2A12;border-radius:999px;padding:.35cqw 1.2cqw;font-family:"Jua",sans-serif;font-size:max(12px,1.35cqw);box-shadow:0 2px 6px rgba(0,0,0,.18);border:0}
#stallDlg button.s-pill:hover{background:#FFE7A8}
#stallDlg .s-boxbtn.full{background:#FFD866;animation:sboxwob 2.4s ease-in-out infinite}
@keyframes sboxwob{0%,80%,100%{transform:rotate(0)}86%{transform:rotate(-4deg)}93%{transform:rotate(3deg)}}
#stallDlg .s-slot{position:absolute;bottom:39.9%;transform:translateX(-50%);z-index:2;border:0;background:none;padding:0;cursor:pointer}
#stallDlg .s-slot .drink{--u:.0152cqw}
#stallDlg .s-slot:hover .drink{filter:drop-shadow(0 0 .5cqw #FFE7A8)}
#stallDlg .s-empty{position:absolute;bottom:40.5%;transform:translateX(-50%);font-size:max(9px,.85cqw);color:rgba(255,240,210,.75);font-family:"Jua",sans-serif;z-index:2}
#stallDlg .s-stock{position:absolute;bottom:36.6%;transform:translateX(-50%);z-index:3;background:#FFF6E2;color:#4A3420;border:1.5px solid #8A6142;border-radius:999px;font-family:"Jua",sans-serif;font-size:max(10px,.95cqw);padding:0 .6cqw;white-space:nowrap;line-height:1.5}
#stallDlg .s-stock.ame{background:#3B2416;color:#FFE9C2;border-color:#3B2416}
#stallDlg .s-stock.out{opacity:.55}
#stallDlg .pop{animation:spop .5s ease}
@keyframes spop{0%{transform:translateX(-50%) translateY(-30%) scale(.8);opacity:0}60%{transform:translateX(-50%) translateY(4%) scale(1.06);opacity:1}100%{transform:translateX(-50%) scale(1)}}
#stallDlg .s-clerk{position:absolute;left:29.4%;bottom:39.2%;width:11cqw;transform:translateX(-50%);z-index:4;filter:drop-shadow(0 .4cqw .3cqw rgba(0,0,0,.25))}
#stallDlg .s-clerk.pet{width:16cqw;bottom:40.8%}
#stallDlg .s-fg{position:absolute;left:14.375%;top:58.41%;width:25.625%;height:14.39%;background:url(stall/fg_day.webp) 0 0/100% 100% no-repeat;z-index:5;pointer-events:none}
#stallDlg .s-stage.night .s-fg{background-image:url(stall/fg_night.webp)}
#stallDlg .s-clerk img{width:100%;display:block}
#stallDlg .s-clerk.jump{animation:sjump .55s ease-in-out}
@keyframes sjump{40%{transform:translateX(-50%) translateY(-22%)}70%{transform:translateX(-50%) translateY(0)}85%{transform:translateX(-50%) translateY(-6%)}}
#stallDlg .s-clerk .tag{position:absolute;left:50%;transform:translateX(-50%);bottom:100%;white-space:nowrap;font-family:"Jua",sans-serif;font-size:max(10px,.9cqw);background:rgba(58,42,18,.85);color:#FFE9C2;border-radius:999px;padding:0 .6cqw}
#stallDlg .s-coinpop{position:absolute;left:29.4%;bottom:58%;z-index:9;font-family:"Jua",sans-serif;font-size:max(14px,1.8cqw);color:#FFE070;text-shadow:0 .15cqw 0 #7A4A12,0 0 .5cqw rgba(0,0,0,.4);transform:translateX(-50%);animation:scoin 1.4s ease-out forwards;pointer-events:none;white-space:nowrap}
@keyframes scoin{0%{opacity:0;margin-bottom:-2cqw}15%{opacity:1;margin-bottom:0}100%{opacity:0;margin-bottom:6cqw}}
#stallDlg .s-guest{position:absolute;bottom:3%;height:16cqw;z-index:6;transform:translateX(-50%);transition-property:left;transition-timing-function:linear;pointer-events:none}
#stallDlg .s-guest > img{height:100%;width:auto;display:block;filter:drop-shadow(0 .5cqw .4cqw rgba(0,0,0,.25))}
#stallDlg .s-guest.walk > img{animation:sbob .32s ease-in-out infinite alternate}
#stallDlg .s-guest.left > img{transform:scaleX(-1)}
@keyframes sbob{to{translate:0 -3%}}
#stallDlg .s-say{position:absolute;left:50%;bottom:102%;transform:translateX(-50%);background:#FFF6E2;color:#4A3420;border:2px solid #8A6142;border-radius:1.2cqw;padding:.4cqw 1cqw;font-size:max(11px,1.25cqw);white-space:nowrap;box-shadow:0 .3cqw .6cqw rgba(0,0,0,.25)}
#stallDlg .s-say::after{content:"";position:absolute;left:50%;top:100%;margin-left:-.6cqw;border:.6cqw solid transparent;border-top-color:#8A6142}
#stallDlg .s-hand{position:absolute;right:-8%;bottom:30%;z-index:2}
#stallDlg .s-hand .drink{--u:.012cqw}
@media (prefers-reduced-motion:reduce){#stallDlg .s-guest.walk > img,#stallDlg .s-clerk.jump,#stallDlg .pop,#stallDlg .s-boxbtn.full{animation:none}}
/* 🥤 음료 그림 */
#stallDlg .drink{--u:.069cqw;position:relative;width:calc(var(--nw) * var(--u));aspect-ratio:var(--nw)/var(--nh)}
#stallDlg .drink > img.cup{position:absolute;inset:0;width:100%;height:100%;z-index:1;filter:drop-shadow(0 4px 4px rgba(0,0,0,.25))}
#stallDlg .drink img.front{position:absolute;inset:0;width:100%;height:100%;z-index:4;pointer-events:none}
#stallDlg .drink .liq{position:absolute;inset:0;z-index:3;-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;overflow:hidden}
#stallDlg .drink .lbody{position:absolute;left:0;right:0;bottom:0;overflow:hidden}
#stallDlg .drink .lbody::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent 14%,rgba(255,255,255,.32) 19%,rgba(255,255,255,.1) 27%,transparent 31%,transparent 70%,rgba(255,255,255,.14) 76%,transparent 82%);z-index:3}
#stallDlg .drink .lsurf{position:absolute;left:4%;right:4%;height:5%;border-radius:50%;transform:translateY(-50%);z-index:4}
#stallDlg .drink .rainbow{position:absolute;inset:0;mix-blend-mode:screen;opacity:.45;z-index:2;background:linear-gradient(115deg,transparent 20%,#FF8AD8 30%,#FFE070 40%,#7CF0C8 50%,#7AB8FF 60%,#C08CFF 70%,transparent 80%) 0 0/300% 100%;animation:sshim 4s linear infinite}
@keyframes sshim{to{background-position:-300% 0}}
#stallDlg .drink .bub{position:absolute;bottom:-6%;width:5%;aspect-ratio:1;border-radius:50%;border:1px solid rgba(255,255,255,.8);background:rgba(255,255,255,.25);animation:srise var(--d) linear var(--dl) infinite;z-index:2}
@keyframes srise{to{transform:translateY(-900%);opacity:0}}
#stallDlg .drink .pearl{position:absolute;width:11%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 35% 30%,#6A5040,#1E120C 70%);z-index:2}
#stallDlg .drink .scandy{position:absolute;font-size:calc(var(--nw) * var(--u) * .09);z-index:2;line-height:1}
#stallDlg .drink img.tpg{position:absolute;z-index:5;filter:drop-shadow(0 3px 3px rgba(0,0,0,.2))}
#stallDlg .drink .sfx{position:absolute;z-index:6;pointer-events:none;line-height:1;font-size:calc(var(--nw) * var(--u) * .1)}
#stallDlg .drink .sfx.spk{color:#FFE9A0;text-shadow:0 0 6px #C08CFF;animation:stw 2.2s ease-in-out var(--dl) infinite}
#stallDlg .drink .sfx.ember{width:4%;aspect-ratio:1;border-radius:50%;background:#FFB040;box-shadow:0 0 6px 2px rgba(255,90,30,.8);animation:sember 2.4s ease-out var(--dl) infinite}
#stallDlg .drink .sfx.feather{width:9%;aspect-ratio:1/2;border-radius:50% 50% 50% 50%/70% 70% 30% 30%;background:#FFFFFF;box-shadow:0 0 4px rgba(200,200,255,.8);animation:sfall 3.4s ease-in-out var(--dl) infinite}
#stallDlg .drink .sfx.petal{width:8%;aspect-ratio:3/2;border-radius:80% 0 80% 0;background:linear-gradient(135deg,#FFD6E6,#F48FBF);animation:sfall 3s linear var(--dl) infinite}
@keyframes stw{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1.1)}}
@keyframes sember{0%{opacity:0;transform:translateY(0)}20%{opacity:1}100%{opacity:0;transform:translateY(-60%) translateX(10%)}}
@keyframes sfall{0%{opacity:0;transform:translateY(-40%) rotate(0)}20%{opacity:1}100%{opacity:0;transform:translateY(120%) rotate(200deg)}}
@media (prefers-reduced-motion:reduce){#stallDlg .drink .rainbow,#stallDlg .drink .bub,#stallDlg .drink .sfx{animation:none}}
/* 🧰 만들기 */
#stallDlg .s-grid{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:12px;align-items:start;margin-top:12px}
@media (max-width:860px){ #stallDlg .s-grid{grid-template-columns:minmax(0,1fr)} }
#stallDlg .s-panel{border:1px solid var(--line);border-radius:14px;padding:12px;display:grid;gap:12px;min-width:0;background:rgba(255,255,255,.03)}
#stallDlg .s-panel h3{margin:0}
#stallDlg .s-step{display:grid;gap:8px}
#stallDlg .s-step > .lbl{font-family:"Jua",sans-serif;display:flex;gap:.5rem;align-items:baseline;flex-wrap:wrap}
#stallDlg .s-cups{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}
#stallDlg .s-cupbtn{border:2px solid var(--line);background:rgba(255,255,255,.06);color:var(--ink);border-radius:12px;padding:6px 2px;display:grid;justify-items:center;gap:2px;cursor:pointer}
#stallDlg .s-cupbtn img{height:52px;width:auto;object-fit:contain}
#stallDlg .s-cupbtn b{font-weight:400;font-family:"Jua",sans-serif;font-size:.88rem}
#stallDlg .s-cupbtn.on{border-color:#F2B544;box-shadow:0 0 0 2px #F2B544}
#stallDlg .s-itabs,#stallDlg .s-tops{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
#stallDlg .s-itab,#stallDlg .s-chip{border:1px solid var(--line);background:rgba(255,255,255,.06);color:var(--ink);border-radius:999px;padding:.3rem .85rem;font-family:"Jua",sans-serif;cursor:pointer}
#stallDlg .s-itab.on,#stallDlg .s-chip.on{background:#F2B544;border-color:#F2B544;color:#3A2400}
#stallDlg .s-chip:disabled{opacity:.45;cursor:not-allowed}
#stallDlg .s-ings{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:6px;max-height:320px;overflow-y:auto;padding:2px}
#stallDlg .s-ghead{grid-column:1/-1;font-family:"Jua",sans-serif;margin:.3rem 0 0;display:flex;gap:.4rem;align-items:center}
#stallDlg .s-ghead i{width:10px;height:10px;border-radius:50%}
#stallDlg .c-rare{background:#E8B54A} #stallDlg .s-ing.t-rare{box-shadow:inset 0 -3px 0 #E8B54A} #stallDlg .c-hell{background:#E0583A} #stallDlg .c-heaven{background:#E6D79A} #stallDlg .c-magic{background:#A88CF0} #stallDlg .c-fairy{background:#7FD69A}
#stallDlg .s-ing{border:1px solid var(--line);background:rgba(255,255,255,.06);color:var(--ink);border-radius:12px;padding:6px 3px;display:grid;justify-items:center;cursor:pointer}
#stallDlg .s-ing img{width:46px;height:46px;object-fit:contain}
#stallDlg .s-ing b{font-weight:400;font-size:.76rem;line-height:1.25;text-align:center}
#stallDlg .s-ing .pr{font-size:.7rem;color:var(--muted)}
#stallDlg .s-ing.t-hell{box-shadow:inset 0 -3px 0 #E0583A} #stallDlg .s-ing.t-heaven{box-shadow:inset 0 -3px 0 #E6D79A}
#stallDlg .s-ing.t-magic{box-shadow:inset 0 -3px 0 #A88CF0} #stallDlg .s-ing.t-fairy{box-shadow:inset 0 -3px 0 #7FD69A}
#stallDlg .s-ing:disabled{opacity:.45;cursor:not-allowed}
#stallDlg .s-slots{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
#stallDlg .s-slotb{height:64px;border:2px dashed var(--line);border-radius:12px;background:transparent;color:var(--ink);display:grid;place-items:center}
#stallDlg .s-slotb img{width:38px;height:38px;object-fit:contain}
#stallDlg .s-slotb.full{border-style:solid;border-color:#F2B544;background:rgba(255,255,255,.06);grid-template-rows:1fr auto;padding:4px 0;cursor:pointer}
#stallDlg .s-slotb.full span{font-size:.7rem;color:var(--muted)}
#stallDlg .s-result{display:grid;gap:8px;padding:10px;border-radius:14px;background:rgba(255,255,255,.06)}
#stallDlg .s-rtop{display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap}
#stallDlg .s-rinfo{flex:1 1 12rem;min-width:0;display:grid;gap:8px;justify-items:start}
#stallDlg .s-preview{width:130px;flex:none;container-type:inline-size;display:grid;place-items:end center;min-height:140px;padding-top:70px}
#stallDlg .s-preview .drink{--u:.26cqw}
#stallDlg .s-autoname{font-family:"Jua",sans-serif;font-size:1.3rem;line-height:1.25}
#stallDlg .s-found{display:inline-block;font-size:.8rem;background:#E8B54A;color:#3A2600;border-radius:999px;padding:0 .6rem;margin-left:.3rem;vertical-align:.2em}
#stallDlg .s-price b{font-family:"Jua",sans-serif;font-weight:400;color:#D9822B;font-size:1.05rem}
#stallDlg .s-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;width:100%}
#stallDlg .s-row input{flex:1 1 11rem;min-width:0;border:1px solid var(--line);background:var(--panel);color:var(--ink);border-radius:999px;padding:.45rem .9rem;font:inherit}
#stallDlg .s-make{border:0;border-radius:999px;padding:.55rem 1.2rem;background:#F2B544;color:#3A2400;font-family:"Jua",sans-serif;font-size:1.02rem;cursor:pointer;box-shadow:0 2px 0 #B07A1E}
#stallDlg .s-make:hover:not(:disabled){background:#FFC85A}
#stallDlg .s-make:disabled{opacity:.45;cursor:not-allowed}
/* ✒️ 서약 · 도감 */
#stallDlg .s-vow{display:grid;gap:8px}
#stallDlg .s-vowon{display:grid;gap:6px;padding:8px;border-radius:12px;background:rgba(255,255,255,.06)}
#stallDlg .s-bar{height:8px;border-radius:999px;background:rgba(255,255,255,.12);overflow:hidden}
#stallDlg .s-bar i{display:block;height:100%;background:#F2B544}
#stallDlg .s-vowbg{display:flex;gap:6px;flex-wrap:wrap}
#stallDlg .s-inv{display:flex;gap:6px;flex-wrap:wrap;font-size:.8rem}
#stallDlg .s-inv span{display:inline-flex;align-items:center;gap:2px;border:1px solid var(--line);border-radius:999px;padding:0 .5rem 0 .2rem}
#stallDlg .s-inv img{width:26px;height:26px;object-fit:contain}
#stallDlg .s-dex{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:6px;max-height:460px;overflow-y:auto;padding:2px}
#stallDlg .s-dx{border:1px solid var(--line);border-radius:12px;padding:26px 6px 8px;text-align:center;background:rgba(255,255,255,.05);display:grid;justify-items:center;align-content:end;gap:4px;font-size:.78rem;container-type:inline-size}
#stallDlg .s-dx .drink{--u:.3cqw}
#stallDlg .s-dx.no{opacity:.7}
#stallDlg .s-dx .q{font-family:"Jua",sans-serif;font-size:1.7rem;color:var(--muted);height:60px;display:grid;place-items:center}
#stallDlg .s-dx b{font-family:"Jua",sans-serif;font-weight:400;font-size:.84rem;line-height:1.25}
:root[data-mode="day"] #stallDlg .s-panel,:root[data-mode="day"] #stallDlg .s-result,:root[data-mode="day"] #stallDlg .s-vowon{background:rgba(255,255,255,.7)}
/* 🧾 영수증 */
dialog.visit.stall-rcpt{background:transparent!important;border:0;box-shadow:none!important;padding:0;max-width:min(92vw,360px);width:100%}
#stallRcpt .paper{background:#FFFDF4;color:#3A2E1E;border-radius:6px;padding:20px 18px 26px;box-shadow:0 14px 40px rgba(0,0,0,.35);
  background-image:repeating-linear-gradient(transparent 0 27px,rgba(120,90,40,.08) 27px 28px);
  -webkit-mask:radial-gradient(circle 6px at 50% 100%,transparent 98%,#000) 0 0/16px 100% repeat-x;mask:radial-gradient(circle 6px at 50% 100%,transparent 98%,#000) 0 0/16px 100% repeat-x}
#stallRcpt h3{margin:0;text-align:center;font-size:1.3rem;color:#3A2E1E}
#stallRcpt .when{text-align:center;font-size:.8rem;opacity:.7;margin:.1rem 0 .8rem}
#stallRcpt table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}
#stallRcpt td{padding:.3rem 0;border-bottom:1px dashed rgba(120,90,40,.35);font-size:.92rem}
#stallRcpt td:nth-child(2){text-align:center;width:3.5rem}
#stallRcpt td:last-child{text-align:right;width:4.5rem}
#stallRcpt .sum td{border-bottom:0;font-family:"Jua",sans-serif;font-size:1.1rem;padding-top:.6rem}
#stallRcpt .cap{font-size:.8rem;opacity:.8;margin:.6rem 0 0}
#stallRcpt .take{display:block;width:100%;margin-top:.9rem;border:0;border-radius:999px;padding:.6rem;background:#C86A2E;color:#fff;font-family:"Jua",sans-serif;font-size:1.05rem;cursor:pointer}
`; document.head.appendChild(css);
/* ---------- 잔 ---------- */
const CUPS = {
  coffee:  {name:'커피',   base:'커피',   w:280, h:270, fill:20, rim:[14,206,28], topSet:'mug',   price:2},
  tea:     {name:'차',     base:'차',     w:355, h:252, fill:30, rim:[30,285,30], topSet:'mug',   price:2},
  smoothie:{name:'스무디', base:'스무디', w:216, h:351, fill:11, rim:[18,198,28], topSet:'glass', price:4, thick:true},
  ade:     {name:'에이드', base:'에이드', w:218, h:354, fill:17, rim:[16,202,28], topSet:'glass', price:3, bubbles:true},
  isekai:  {name:'이세계', base:'비약',   w:185, h:496, fill:34, rim:null,        topSet:null,    price:5},
};
const TOPS = {ice:{name:'아이스크림', glass:[498,463], mug:[642,476], cost:4}, whip:{name:'휘핑크림', glass:[491,546], mug:[641,447], cost:3}};
const TOP_K = {glass:1.13, mug:1.09};

/* ---------- 재료 48종 ----------
   k: color(바탕색) · milk(위에 층으로 얹혀요) · sweet(살짝 물들이고 이름 앞에) · none(색 없음)
   r: 바탕색 우선순위 (초코 > 원두 > 차 > 과일) · t: 이세계 갈래 · p: 코인 · s: 💠 이세계 파편 */
const ING = {};
const add = (grp, rows) => rows.forEach(([code,name,w,c,k,r,p,t])=>ING[code]={code,name,w,c,k,r:r||0,p:p||0,t:t||'',grp});
add('basic', [
  ['bean','원두','커피','#3B2416','color',3,3], ['greentea','찻잎','녹차','#9DB04E','color',2,3], ['milk','우유','밀크','#F3E3CC','milk',0,2],
  ['ice','얼음','아이스','','none',0,1], ['choco','초코','초코','#55301E','color',4,3], ['honey','꿀','허니','#E8A93A','sweet',0,3],
  ['syrup','시럽','달콤한','#E9C77A','sweet',0,2], ['caramel','카라멜','카라멜','#C27A34','color',1,3], ['berry','딸기','딸기','#E2546A','color',1,3],
  ['lemon','레몬','레몬','#F2D24A','color',1,3], ['peach','복숭아','복숭아','#F4A07C','color',1,3], ['matcha','말차 가루','말차','#6E9E3A','color',2,4],
  ['mint','민트','민트','#8FD9B6','color',1,3], ['pearl','타피오카 펄','버블','','none',0,4], ['magic','마법 가루','은하','#7A55E0','color',0.5,6,'magic'],
]);
add('cafe', [
  ['grapefruit','자몽 청','자몽','#F06A5A','color',1,5], ['mango','망고 퓨레','망고','#F7B731','color',1,5], ['bluesyrup','블루베리 시럽','블루베리','#4B3FA8','color',1,5],
  ['yuja','유자 청','유자','#F4C83E','color',1,5], ['vanilla','바닐라 빈','바닐라','#EDE0C0','sweet',0,5], ['maple','메이플 시럽','메이플','#C7741E','sweet',0,5],
  ['blacksugar','흑당 소스','흑당','#4A2A16','color',1,5], ['cinnamon','시나몬 파우더','시나몬','#A0582C','sweet',0,4], ['blacktea','홍차 잎','홍차','#B9672A','color',2,5],
  ['rooibos','루이보스','루이보스','#B8452E','color',2,5], ['chamomile','캐모마일','캐모마일','#E8C35A','color',2,5], ['ginger','생강','진저','#E3C27A','color',1,5],
  ['earlgrey','얼그레이 시럽','얼그레이','#7A4A2A','color',2,5], ['grain','곡물 가루','미숫가루','#D9C3A0','color',1,4], ['condensed','연유','연유','#F5EBD6','milk',0,4],
  ['soda','탄산수','스파클링','','none',0,3],
]);
add('isekai', [
  ['h_flame','마왕의 불꽃 시럽','마왕 불꽃','#C8241E','color',2.5,0,'hell'], ['h_chili','칠리 파우더','칠리','#B83A1E','color',2.5,0,'hell'],
  ['h_lava','용암 사탕','용암','#E8521E','color',2.5,0,'hell'], ['h_darkchoco','어둠의 초코 청','어둠의 초코','#3A0E14','color',4.5,0,'hell'],
  ['v_feather','천사 깃털 슈가','깃털','#F4F4FA','sweet',0,0,'heaven'], ['v_milk','성스러운 밀크','성스러운','#FBF6EA','milk',0,0,'heaven'],
  ['v_marsh','구름 마시멜로','구름','','none',0,0,'heaven'], ['v_honey','은혜의 은빛 꿀','은빛','#D8D8E8','sweet',0,0,'heaven'],
  ['m_rune','룬 스타더스트','룬','#4A3FC8','color',2.5,0,'magic'], ['m_mana','마력 농축액','마력','#7A3FD6','color',2.5,0,'magic'],
  ['m_starcandy','은하수 별 사탕','별사탕','','none',0,0,'magic'], ['m_dimension','차원 비약 가루','차원','#8A4FE0','color',2.5,0,'magic'],
  ['f_dew','이슬방울 젤리','이슬','#8FD8F0','color',1.5,0,'fairy'], ['f_mint','숲의 민트 시럽','숲의 민트','#4FB85A','color',1.5,0,'fairy'],
  ['f_petal','요정 꽃잎','꽃잎','#F4A8D8','color',1.5,0,'fairy'], ['f_berry','영기 어린 열매','영기 열매','#6A5AC8','color',1.5,0,'fairy'],
]);
// 🌀 차원 상인 희귀 재료 (10-25) — 상인에게서만 사요. 그림은 merchant/ 폴더
add('isekai', [
  ['r_dragontear','용의 눈물','용의 눈물','#E8402A','color',3,0,'rare'], ['r_timeice','시간이 멈춘 얼음','시간 얼음','#BFE6F5','color',1,0,'rare'],
  ['r_starlight','병에 담긴 별빛','별빛','#2B2F6E','color',3.5,0,'rare'], ['r_phoenix','불사조 깃털','불사조','#F5762A','color',2.6,0,'rare'],
  ['r_moondrop','달빛 한 방울','달빛','#E8E8F4','milk',0,0,'rare'], ['r_cloud','병 속의 구름','구름','#F4F7FB','milk',0,0,'rare'],
  ['r_pearl','심해 진주','진주','#4FA8E8','color',2,0,'rare'], ['r_goldapple','황금 사과','황금 사과','#F2C230','color',1.5,0,'rare'],
]);
const TAGS = {hell:{name:'지옥',e:'🔥'}, heaven:{name:'천국',e:'🪽'}, magic:{name:'마법',e:'🔮'}, fairy:{name:'요정',e:'🌿'}, rare:{name:'차원 상인 희귀 재료',e:'✨'}};
const icoSrc = k => ING[k] && ING[k].t==='rare' ? `merchant/${k}.webp` : `stall/ing_${k}.webp`;
const MULT = ['', '', '더블', '트리플'];

/* ---------- 특제 레시피 ---------- */
const SPECIALS = [
  ['아메리카노','coffee',['bean'],''], ['카페 라테','coffee',['bean','milk'],''], ['카페 모카','coffee',['bean','choco','milk'],''],
  ['바닐라 라테','coffee',['bean','milk','vanilla'],''], ['아인슈페너','coffee',['bean'],'whip'], ['아포가토','coffee',['bean'],'ice'],
  ['연유 라테','coffee',['bean','condensed','ice'],''],
  ['흑당 버블 밀크티','tea',['blacksugar','milk','pearl'],''], ['로열 밀크티','tea',['blacktea','honey','milk'],''],
  ['복숭아 아이스티','tea',['blacktea','ice','peach'],''], ['따끈한 유자차','tea',['yuja'],''], ['꿀 생강차','tea',['ginger','honey'],''],
  ['더블 초코 휘핑 스무디','smoothie',['choco','choco','milk'],'whip'], ['딸기 우유 스무디','smoothie',['berry','milk'],''],
  ['미숫가루 라테','smoothie',['grain','honey','milk'],''], ['망고 요거 스무디','smoothie',['mango','milk'],'ice'],
  ['트리플 블루베리 에이드','ade',['bluesyrup','bluesyrup','bluesyrup'],''], ['자몽 에이드','ade',['grapefruit','soda'],''],
  ['레모네이드','ade',['lemon','soda','syrup'],''], ['모히토 에이드','ade',['lemon','mint','soda'],''],
  ['마감 직전 뇌를 태우는 맛','isekai',['h_chili','h_flame','h_lava'],''], ['천사의 숨결','isekai',['v_feather','v_honey','v_milk'],''],
  ['이세계 은하 별빛','isekai',['m_mana','m_rune','m_starcandy'],''], ['요정의 아침이슬','isekai',['f_dew','f_mint','f_petal'],''],
  ['새벽 4시의 각성 포션','isekai',['bean','bean','magic'],''], ['천국과 지옥 라테','coffee',['bean','h_flame','v_milk'],''],
  // 🌀 희귀 재료 숨은 레시피 (10-25, 순서 바꾸지 말고 뒤에만 추가)
  ['용의 숨결 에이드','ade',['r_dragontear','soda'],''], ['시간이 멈춘 아이스 라테','coffee',['bean','milk','r_timeice'],''],
  ['별을 삼킨 밤','isekai',['m_mana','r_starlight'],''], ['불사조의 마감 각성제','isekai',['bean','h_flame','r_phoenix'],''],
  ['달빛 밀크티','tea',['blacktea','r_moondrop'],''], ['구름 위 황금 사과 스무디','smoothie',['r_cloud','r_goldapple'],''],
].map(([name,cup,ings,top],i)=>({code:'sp'+i,name,cup,ings:[...ings].sort(),top}));
const keyOf = (cup,ings,top) => cup+'|'+[...ings].sort().join(',')+'|'+(top||'');
const SPECIAL_BY = Object.fromEntries(SPECIALS.map(s=>[keyOf(s.cup,s.ings,s.top), s]));


/* ---------- 색 ---------- */
const hex = h => [1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const toHex = a => '#'+a.map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');
const mix = (a,b,t) => a.map((v,i)=>v+(b[i]-v)*t);
function look(ings){
  const cnt = {}; ings.forEach(k=>cnt[k]=(cnt[k]||0)+1);
  const keys = Object.keys(cnt), colored = keys.filter(k=>ING[k].k==='color' && ING[k].r>0);
  const milks = keys.filter(k=>ING[k].k==='milk'), sweets = keys.filter(k=>ING[k].k==='sweet');
  const tags = new Set(keys.map(k=>ING[k].t).filter(Boolean));
  let col = null;
  if(colored.length){
    const top = Math.max(...colored.map(k=>ING[k].r)), win = colored.filter(k=>ING[k].r===top);
    let sum=[0,0,0], n=0; win.forEach(k=>{ const h = hex(ING[k].c); sum = sum.map((v,i)=>v+h[i]*cnt[k]); n+=cnt[k]; });
    col = sum.map(v=>v/n);
    sweets.forEach(k=>{ col = mix(col, hex(ING[k].c), .14); });
  } else if(cnt.magic) col = hex(ING.magic.c);
  let milk = null;
  if(milks.length){ milk = hex(ING[milks[0]].c); const m = milks.reduce((a,k)=>a+cnt[k],0); milk.n = m; }
  if(!col && !milk && sweets.length) col = hex(ING[sweets[0]].c);
  return {col: col && toHex(col), milk: milk && {c:toHex(milk), n:milk.n}, tags, cnt};
}

/* ---------- 이름 ---------- */
function autoName(cup, ings, top){
  if(!ings.length) return null;
  const sp = SPECIAL_BY[keyOf(cup,ings,top)]; if(sp) return {name:sp.name, special:sp};
  const cnt = {}, order = []; ings.forEach(k=>{ if(!cnt[k]) order.push(k); cnt[k]=(cnt[k]||0)+1; });
  const m = k => (MULT[cnt[k]] ? MULT[cnt[k]]+' ' : '');
  const pre = [], mid = [];
  let base = CUPS[cup].base;
  order.filter(k=>ING[k].k==='none' && k!=='pearl').forEach(k=>pre.push(m(k)+ING[k].w));
  order.filter(k=>ING[k].k==='sweet').forEach(k=>pre.push(m(k)+ING[k].w));
  order.filter(k=>ING[k].k==='color').sort((a,b)=>ING[b].r-ING[a].r).forEach(k=>{
    let w = ING[k].w;
    if(k==='bean' && cup==='coffee'){ if(cnt[k]>1) mid.push(MULT[cnt[k]]+' 샷'); return; }
    if((k==='blacktea'||k==='greentea') && cup==='tea') w = ING[k].w;
    mid.push(m(k)+w);
  });
  order.filter(k=>ING[k].k==='milk').forEach(k=>{
    if(cup==='coffee' && cnt.bean && k!=='v_milk') base = (k==='condensed' ? '연유 ' : '') + '라테';
    else mid.push(m(k)+ING[k].w);
  });
  if(cnt.pearl) mid.push('버블');
  if(top==='whip' || top==='both') mid.push('휘핑');
  let name = [...pre, ...mid, base].join(' ');
  if(top==='ice' || top==='both') name += ' 플로트';
  return {name};
}

/* ---------- 음료 그림 ---------- */
let uid = 0;
function drinkHTML(cup, ings, top){
  const C = CUPS[cup], L = look(ings), magic = L.tags.has('magic');
  let liq = '';
  if(L.col || L.milk){
    const base = L.col || L.milk.c, B = hex(base);
    const deep = toHex(mix(B,[0,0,0],.32)), mid = toHex(mix(B,[0,0,0],.08)), light = toHex(mix(B,[255,255,255],.38));
    let body = `linear-gradient(to bottom, ${base} 0%, ${mid} 45%, ${deep} 100%)`;
    if(magic) body = `linear-gradient(to bottom, ${base} 0%, #6A3BD6 45%, #2C1468 100%)`;
    let surf = `radial-gradient(ellipse at 50% 50%, ${light}, ${base} 62%, transparent 72%)`;
    if(L.col && L.milk){
      const mh = Math.min(48, 22 + L.milk.n*10), mc = L.milk.c;
      body = `linear-gradient(to bottom, ${mc} 0%, ${mc} ${mh-8}%, ${toHex(mix(hex(mc),B,.5))} ${mh}%, ${base} ${mh+8}%, ${magic?'#4A2BA8':deep} 100%)`;
      surf = `radial-gradient(ellipse at 50% 50%, #FFFFFF, ${mc} 62%, transparent 72%)`;
    } else if(magic) surf = 'radial-gradient(ellipse at 50% 50%, rgba(230,210,255,.95), rgba(180,140,255,.6) 60%, transparent 72%)';
    const bubs = (C.bubbles || L.cnt.soda) ? Array.from({length:8},(_,i)=>`<i class="bub" style="left:${14+i*10}%;--d:${(2.6+i%3*.8).toFixed(1)}s;--dl:-${(i*.7).toFixed(1)}s"></i>`).join('') : '';
    const pearls = L.cnt.pearl ? Array.from({length:9},(_,i)=>`<i class="pearl" style="left:${12+(i*9.5)%72}%;bottom:${3+(i%3)*5}%"></i>`).join('') : '';
    const candy = L.cnt.m_starcandy ? ['#FF8AD8','#FFE070','#7CF0C8','#7AB8FF','#C08CFF','#FFB070'].map((c,i)=>`<span class="scandy" style="left:${15+i*12}%;top:${20+(i*37)%60}%;color:${c}">★</span>`).join('') : '';
    liq = `<div class="liq" style="-webkit-mask-image:url(stall/liq_${cup}.webp);mask-image:url(stall/liq_${cup}.webp)">`
      + `<div class="lbody" style="top:${C.fill}%;background:${body}">${magic?'<div class="rainbow"></div>':''}${bubs}${pearls}${candy}</div>`
      + `<div class="lsurf" style="top:${C.fill}%;background:${surf}"></div></div>`
      + `<img class="front" src="stall/front_${cup}.webp" alt="">`;
  }
  let tp = '';
  if(top && C.topSet){
    const [x0,x1,ry] = C.rim, rw = x1-x0, cx = (x0+x1)/2, set = C.topSet;
    const place = (kind, w, bottomY) => { const [tw0,th0] = TOPS[kind][set], th = w*th0/tw0;
      return {html:`<img class="tpg" src="stall/${kind}_${set}.webp" alt="" style="left:${(cx-w/2)/C.w*100}%;width:${w/C.w*100}%;top:${(bottomY-th)/C.h*100}%">`, top:bottomY-th, h:th}; };
    const w1 = rw*TOP_K[set], rimBottom = ry + .12*rw;
    if(top==='both'){ const a = place('ice', w1, rimBottom), b = place('whip', w1*.78, a.top + a.h*.42); tp = a.html + b.html; }
    else tp = place(top, w1, rimBottom).html;
  }
  let fx = '';
  if(magic || L.tags.has('rare')) fx += [[-14,20],[104,34],[-8,64],[100,78],[46,-6]].map(([x,y],i)=>`<span class="sfx spk" style="left:${x}%;top:${y}%;--dl:-${i*.45}s">✦</span>`).join('');
  if(L.tags.has('hell')) fx += [10,30,55,75,90].map((x,i)=>`<span class="sfx ember" style="left:${x}%;top:${C.fill+10}%;--dl:-${i*.5}s"></span>`).join('');
  if(L.tags.has('heaven')) fx += [-10,30,80,105].map((x,i)=>`<span class="sfx feather" style="left:${x}%;top:${-10+i*8}%;--dl:-${i*.8}s"></span>`).join('');
  if(L.tags.has('fairy')) fx += [-12,20,70,102].map((x,i)=>`<span class="sfx petal" style="left:${x}%;top:${-5+i*10}%;--dl:-${i*.7}s"></span>`).join('');
  return `<div class="drink" style="--nw:${C.w};--nh:${C.h}">${liq}<img class="cup" src="stall/cup_${cup}.webp" alt="${C.name} 잔">${tp}${fx}</div>`;
}


/* ---------- 숫자 (stall.sql 과 같아야 해요) ---------- */
const NUM = {amePrice:3, ameCap:30, spCap:20, stock:10, saleMin:6, starP:.25, unit:50, vowEvery:30, vowMax:16};
const TOP_COST = {'':0, whip:3, ice:4, both:7};
window.STALL_NUM = NUM; window.STALL_ING = ING; window.STALL_CUPS = CUPS; window.STALL_TOP_COST = TOP_COST;
function costOf(cup, ings, top, inv){
  let per = 0, shard = 0; const use = {};
  let lack = false;
  ings.forEach(k=>{ const g = ING[k]; per += g.p; if(g.t){ const have = ((inv||{})[k]||0) - (use[k]||0); if(have>0) use[k] = (use[k]||0)+1; else if(g.t==='rare') lack = true; else shard += NUM.unit; } });
  per += TOP_COST[top||''] || 0;
  return {price: CUPS[cup].price + Math.round(per*1.15), coin: per*NUM.stock, shard, use, lack};
}

/* ---------- 상태 ---------- */
let ST = null, S = {cup:'coffee', ings:['bean','milk'], top:''}, tab = 'basic', queue = [], poll = null, gtimer = null, walking = 0;
const box = () => document.getElementById('stallBox');
const dlg = () => document.getElementById('stallDlg');
const q = sel => box().querySelector(sel);
const ico = k => `<img src="${icoSrc(k)}" alt="" loading="lazy">`;
const isNight = () => document.documentElement.getAttribute('data-mode') !== 'day';
function clerkImg(){
  try{ if(typeof PETS!=='undefined' && PETS && PETS.main){ const p = (PETS.all||PETS.pets||[]).find(x=>x.id===PETS.main);
    if(p){ const big = typeof petShowBig==='function' ? petShowBig(petLevel(p.affection), babyById(p.id)) : false;
      return {src:`pets/${p.code}${big?'_2':''}.webp`, name:p.name||'대표 펫', pet:true}; } } }catch(e){}
  return {src:'stall/guest_wolf.webp', name:'늑대 인형', pet:false};
}
function syncWallet(r){
  if(!r) return;
  if(typeof ME!=='undefined' && ME){ if(r.coins!=null) ME.coins = r.coins; if(r.stars!=null) ME.stars = r.stars; }
  if(typeof RIFT!=='undefined' && RIFT && r.shards!=null) RIFT.shards = r.shards;
  try{ renderTop(); }catch(e){}
}
function take(r){ ST = r; syncWallet(r); }

/* ---------- 그리기 ---------- */
const SHELF_X = [64.2, 72.1, 79.3, 86.6];
const AME = {name:'아메리카노', cup:'coffee', ings:['bean'], top:''};
function renderStage(pop){
  const st = q('.s-stage'); if(!st) return;
  st.classList.toggle('night', isNight());
  const slots = [AME, ...[1,2,3].map(n=>ST.slots.find(x=>x.slot===n)||null)], left = ST.ame_cap - ST.ame_sold;
  q('.s-shelf').innerHTML = SHELF_X.map((x,i)=>{ const m = slots[i];
    if(!m) return `<span class="s-empty" style="left:${x}%">빈 칸</span>`;
    const badge = i===0 ? `<span class="s-stock ame ${left<=0?'out':''}" style="left:${x}%">${left<=0?'오늘 품절':`${left}잔`}</span>` : `<span class="s-stock" style="left:${x}%">${m.stock}잔</span>`;
    return `<button class="s-slot ${pop===i?'pop':''}" type="button" style="left:${x}%" title="${esc(m.name)}${i===0?' · 늘 진열돼요':` · 🪙 ${m.price} · 눌러서 내리기`}" ${i?`data-sunshelf="${i}"`:''}>${drinkHTML(m.cup, m.ings, m.top)}</button>${badge}`; }).join('');
  const sp = ST.sp_cap - ST.sp_sold;
  q('.s-today').textContent = `오늘 남은 판매 · ☕ ${Math.max(0,left)}잔 · 🍹 ${Math.max(0,sp)}잔`;
  q('.s-boxbtn').innerHTML = `💰 돈통 ${(ST.box.coins||0).toLocaleString()}${ST.box.stars?` · ⭐ ${ST.box.stars}`:''}`;
  q('.s-boxbtn').classList.toggle('full', (ST.box.coins||0) > 0);
}
function renderWallet(){
  const w = q('.s-wallet'); if(!w) return;
  w.innerHTML = `<span>🪙 ${(ST.coins??0).toLocaleString()}</span><span>💠 ${(ST.shards??0).toLocaleString()}</span><span>⭐ ${(ST.stars??0).toLocaleString()}</span>`;
}
function renderMake(){
  const C = CUPS[S.cup]; if(!C.topSet) S.top = '';
  q('.s-cups').innerHTML = Object.entries(CUPS).map(([k,c])=>`<button class="s-cupbtn ${k===S.cup?'on':''}" type="button" data-scup="${k}" aria-pressed="${k===S.cup}"><img src="stall/cup_${k}.webp" alt=""><b>${c.name}</b></button>`).join('');
  q('.s-slots').innerHTML = [0,1,2].map(i=>{ const k = S.ings[i]; return k ? `<button class="s-slotb full" type="button" data-sslot="${i}" aria-label="${ING[k].name} 빼기">${ico(k)}<span>${ING[k].name} · 빼기</span></button>` : `<span class="s-slotb" aria-hidden="true"></span>`; }).join('');
  q('.s-itabs').innerHTML = [['basic','🥛 기본 재료'],['cafe','🍯 카페 재료'],['isekai','🌀 이세계 재료']].map(([k,n])=>`<button class="s-itab ${tab===k?'on':''}" type="button" data-stab="${k}">${n}</button>`).join('');
  const full = S.ings.length >= 3, inv = ST.inv || {};
  const btn = g => { const rare = g.t==='rare', left = (inv[g.code]||0) - S.ings.filter(k=>k===g.code).length;
    return `<button class="s-ing ${g.t?'t-'+g.t:''}" type="button" data-sing="${g.code}" ${full || (rare && left<=0) ?'disabled':''}>${ico(g.code)}<b>${g.name}</b><span class="pr">${rare ? (inv[g.code] ? `📦 ${inv[g.code]}개` : '🌀 상인 전용') : g.t ? (inv[g.code] ? `📦 ${inv[g.code]}개` : `💠 ${NUM.unit}`) : `🪙 ${g.p}`}</span></button>`; };
  const list = Object.values(ING).filter(g=>g.grp===tab);
  q('.s-ings').innerHTML = tab==='isekai'
    ? `<p class="s-note">이세계 재료 한 개로 10잔을 만들어요. 집필 서약으로 모은 재료(📦)를 먼저 쓰고, 없으면 💠 ${NUM.unit}로 사요.</p>`
      + Object.entries(TAGS).map(([t,T])=>`<div class="s-ghead"><i class="c-${t}"></i>${T.e} ${T.name}</div>` + list.filter(g=>g.t===t).map(btn).join('')).join('')
    : list.map(btn).join('');
  q('.s-tops').innerHTML = [['','없음'],['whip','휘핑크림'],['ice','아이스크림'],['both','둘 다']].map(([k,n])=>`<button class="s-chip ${S.top===k?'on':''}" type="button" data-stop="${k}" ${!C.topSet&&k?'disabled':''}>${n}</button>`).join('')
    + (!C.topSet ? `<span class="small">이세계 병에는 토핑을 못 얹어요</span>` : '');
  const nm = autoName(S.cup, S.ings, S.top), dex = new Set(ST.dex||[]);
  q('.s-autoname').innerHTML = nm ? `${esc(nm.name)}${nm.special ? `<span class="s-found">${dex.has(nm.special.code)?'📖 특제 레시피':'✨ 새 특제 레시피!'}</span>` : ''}` : '<span class="small">재료를 하나 이상 넣어 주세요</span>';
  const P = costOf(S.cup, S.ings, S.top, inv), free = Object.values(P.use).reduce((a,b)=>a+b,0);
  q('.s-price').innerHTML = nm ? `한 잔 🪙 <b>${P.price}</b> · ${NUM.stock}잔 재료비 🪙 ${P.coin}${P.shard?` + 💠 ${P.shard}`:''}${free?` · 📦 서약 재료 ${free}개 사용`:''}${S.ings.some(k=>ING[k].t)?' · 팔릴 때 가끔 ⭐':''}` : '';
  const empty = [1,2,3].find(n=>!ST.slots.some(x=>x.slot===n));
  const b = q('.s-make'); b.disabled = !nm || P.lack; b.textContent = empty ? `🍹 ${NUM.stock}잔 만들어 진열` : '진열대가 꽉 찼어요';
  q('.s-preview').innerHTML = drinkHTML(S.cup, S.ings, S.top);
}
function renderVow(){
  const V = ST.vow || {}, own = (ST.bgs||[]).filter(b=>TAGS[b]), T = V.bg && TAGS[V.bg];
  const inv = Object.entries(ST.inv||{}).filter(([,n])=>n>0);
  q('.s-vow').innerHTML = `<h3>✒️ 집필 서약</h3>
    <p class="s-note">아공간에서 연 테마 배경 하나를 골라 서약해 두면, 작업실에서 ${V.every||NUM.vowEvery}분 일할 때마다 그 세계의 재료가 하나씩 쌓여요. (한 번에 최대 ${V.max||NUM.vowMax}개)</p>
    ${T ? `<div class="s-vowon"><b>${T.e} ${T.name} 서약 중</b><div class="s-bar"><i style="width:${Math.round((V.mins||0)/(V.every||30)*100)}%"></i></div>
        <span class="small">다음 재료까지 ${(V.every||30)-(V.mins||0)}분 · 받을 재료 ${V.ready||0}개</span>
        <button class="mini ask-yes" type="button" data-svowclaim ${V.ready?'':'disabled'}>🎁 재료 받기${V.ready?` · ${V.ready}개`:''}</button></div>` : ''}
    <div class="s-vowbg">${own.length ? own.filter(b=>b!==V.bg).map(b=>`<button class="mini" type="button" data-svow="${b}">${TAGS[b].e} ${TAGS[b].name}${V.bg?'로 바꾸기':' 서약하기'}</button>`).join('')
      : `<span class="small">아직 연 테마 배경이 없어요. 이세계 → 아공간에서 지옥 · 천국 · 마법 · 요정 배경을 열면 서약할 수 있어요.</span>`}</div>
    ${V.bg && own.length>1 ? `<p class="small">배경을 바꾸면 그동안 쌓인 재료는 먼저 받고 새로 시작해요.</p>` : ''}
    ${inv.length ? `<div class="s-inv">${inv.map(([k,n])=>`<span title="${esc(ING[k]?.name||k)}">${ico(k)}×${n}</span>`).join('')}</div>` : ''}`;
}
function renderDex(){
  const have = new Set(ST.dex||[]);
  q('.s-dexn').textContent = `${SPECIALS.filter(s=>have.has(s.code)).length} / ${SPECIALS.length}`;
  q('.s-dex').innerHTML = SPECIALS.map(s=> have.has(s.code)
    ? `<div class="s-dx">${drinkHTML(s.cup, s.ings, s.top)}<b>${esc(s.name)}</b></div>`
    : `<div class="s-dx no"><span class="q">？</span><b>？？？</b><span class="small">${CUPS[s.cup].name} 잔</span></div>`).join('');
}
function signText(){ return (ST && ST.sign) || `${(typeof ME!=='undefined'&&ME&&ME.display_name)||'나'}의 가판대`; }
function renderSign(){ const b = q('.s-sign'); if(b) b.innerHTML = `<div>${esc(signText())}<span class="pen">✏️</span><small>오늘의 특제 음료</small></div>`; }
function renderAll(){ renderSign(); renderWallet(); renderStage(); renderMake(); renderVow(); renderDex(); }

function shell(){
  const c = clerkImg();
  box().innerHTML = `<div class="s-head"><h3>☕ 내 음료 가판대</h3><span class="s-wallet"></span><button class="mini" type="button" data-sguide>📖 안내</button><button class="mini" type="button" data-sclose>닫기</button></div>
    <div class="s-stage">
      <button class="s-sign" type="button" data-ssign title="눌러서 가판대 이름 바꾸기"></button>
      <div class="s-hud"><button class="s-pill s-boxbtn" type="button" data-sbox></button><span class="s-pill s-today"></span></div>
      <div class="s-shelf"></div>
      <div class="s-clerk ${c.pet?'pet':''}"><img src="${c.src}" alt="점원 ${esc(c.name)}"><span class="tag">점원 · ${esc(c.name)}</span></div><div class="s-fg" aria-hidden="true"></div>
      <div class="s-street"></div>
    </div>
    <div class="s-guide" hidden>
      <p>🍹 음료를 만들어 선반에 올려 두면, 가판대를 닫아도 손님이 와서 사 가요 (평균 6분에 한 잔). 돌아와서 <b>💰 돈통</b>을 정산하면 코인이 들어와요.</p>
      <p>☕ 첫 칸 아메리카노는 재료 없이 늘 팔려요 (한 잔 🪙 ${NUM.amePrice} · 하루 ${NUM.ameCap}잔). 특제 음료는 하루 ${NUM.spCap}잔까지 팔리고, 다 팔면 남은 시간은 아메리카노가 채워요.</p>
      <p>🌀 이세계 재료가 든 음료는 팔릴 때 가끔 ⭐ 별조각을 남겨요. 정해진 조합을 맞히면 📖 특제 레시피 도감에 올라가요.</p>
    </div>
    <div class="s-grid">
      <section class="s-panel">
        <div class="s-step"><div class="lbl">잔 고르기</div><div class="s-cups"></div></div>
        <div class="s-step"><div class="lbl">재료 넣기 <span class="small">최대 3개 · 같은 재료를 겹치면 더블, 트리플</span></div><div class="s-slots"></div><div class="s-itabs"></div><div class="s-ings"></div></div>
        <div class="s-step"><div class="lbl">토핑 <span class="small">둘 다 고르면 아이스크림 위에 휘핑</span></div><div class="s-tops"></div></div>
        <div class="s-result"><div class="s-rtop"><div class="s-preview"></div><div class="s-rinfo">
          <div class="s-autoname"></div><div class="s-price small"></div>
          <div class="s-row"><input class="s-name" maxlength="16" placeholder="✏️ 이름을 직접 지어도 돼요" autocomplete="off"><button class="s-make" type="button"></button></div>
          <button class="mini" type="button" data-sreset>잔 비우기</button></div></div></div>
      </section>
      <aside class="s-panel"><div class="s-vow"></div>
        <h3>📖 특제 레시피 도감 <span class="small s-dexn"></span></h3><div class="s-dex"></div></aside>
    </div>`;
}

/* ---------- 손님 ---------- */
const GUESTS = [
  {img:'bear', lines:['오늘도 한 잔 하고 원고 써야지!','배낭에 넣어 가도 되죠?','따뜻하다~']},
  {img:'rabbit', lines:['교정지 보면서 마실게요.','깔끔한 맛이네요.','오탈자는 없겠죠? 음료 말이에요!']},
  {img:'elf', lines:['숲 냄새가 나요!','이거 마시면 키 커져요?','마법 같아요!']},
  {img:'wolf', lines:['마감 전에 한 잔이면 충분하죠.','원고는요? …아, 음료 먼저.','작가님 가판대라니, 감동입니다.']},
  {img:'demon', lines:['고향의 맛이군…','이쪽 세계 음료도 나쁘지 않아.','흠, 다음에 또 오지.']},
];
const TAG_LINES = {
  hell:['음료가 왜 이렇게 매워요?!','잠이 0.1초 만에 깼습니다.','마감 직전 뇌를 태우는 맛!'],
  heaven:['마음이 정화되는 기분이에요.','오늘은 왠지 탈고할 수 있을 것 같아요.','구름 위를 걷는 맛!'],
  magic:['컵 안에서 은하수가 도는데요?!','마력이 넘쳐서 오타가 안 나요.','반짝반짝해요!'],
  fairy:['풀잎 이슬 맛이 나요.','요정이 손짓하는 것 같아요.','숲속 아침 같아요!'],
  rare:['이건… 다른 차원의 맛이에요!','한 모금에 원고 세 화가 써질 것 같아요.','상인 고양이가 두고 간 그 재료죠?'],
  ame:['역시 마감의 기본은 아아지.','생명수 감사합니다.','오늘도 아아 한 잔.'],
  look:['뭐 마실까~ 고민되네요.','다음에 꼭 사러 올게요!','메뉴 구경만 할게요~','오, 여기 새로 생겼네?'],
};
const pick = a => a[Math.floor(Math.random()*a.length)];
function lineFor(g, d){
  if(!d) return pick(TAG_LINES.look);
  if(d.name==='아메리카노') return pick(TAG_LINES.ame);
  const tags = [...new Set((d.ings||[]).map(k=>ING[k]?.t).filter(Boolean))];
  if(tags.length && Math.random()<.75) return pick(TAG_LINES[pick(tags)]);
  return Math.random()<.5 ? pick(g.lines) : `${d.name} 한 잔 주세요!`;
}
function spawnGuest(){
  const street = q('.s-street'); if(!street || document.hidden || walking >= 2) return;
  const d = queue.shift() || null; if(!d && Math.random()<.35) return;
  const g = pick(GUESTS), el = document.createElement('div'), from = Math.random()<.5;
  el.className = 's-guest walk' + (from ? '' : ' left');
  el.innerHTML = `<img src="stall/guest_${g.img}.webp" alt="">`;
  el.style.left = from ? '-10%' : '110%'; street.appendChild(el); walking++;
  const stopX = 62 + Math.random()*16, dur = s => { el.style.transitionDuration = s+'s'; };
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ dur(3.6); el.style.left = stopX+'%'; }));
  setTimeout(()=>{
    el.classList.remove('walk');
    el.insertAdjacentHTML('beforeend', `<span class="s-say">${esc(lineFor(g,d))}</span>${d?`<span class="s-hand">${drinkHTML(d.cup,d.ings,d.top)}</span>`:''}`);
    if(d){ const c = q('.s-clerk'); if(c){ c.classList.remove('jump'); void c.offsetWidth; c.classList.add('jump'); }
      const p = document.createElement('span'); p.className = 's-coinpop'; p.textContent = `+🪙 ${d.coin}${d.star?' ⭐':''}`;
      q('.s-stage').appendChild(p); setTimeout(()=>p.remove(), 1500); }
    setTimeout(()=>{ el.querySelector('.s-say')?.remove(); el.classList.add('walk'); el.classList.toggle('left', !from); dur(3.6); el.style.left = from ? '112%' : '-12%';
      setTimeout(()=>{ el.remove(); walking--; }, 3700); }, 2600);
  }, 3650);
}

/* ---------- 영수증 ---------- */
function ago(iso){ if(!iso) return ''; const m = Math.max(1, Math.round((Date.now()-Date.parse(iso))/6e4)), h = Math.floor(m/60), d = Math.floor(h/24);
  return d ? `${d}일 ${h%24}시간` : h ? `${h}시간${m%60?` ${m%60}분`:''}` : `${m}분`; }
function showReceipt(){
  const B = ST.box || {}; if(!B.coins && !B.stars){ toast('아직 돈통이 비어 있어요'); return; }
  const lines = Object.entries(B.lines||{}).sort((a,b)=>(a[0]==='아메리카노')-(b[0]==='아메리카노'));
  const ame = B.lines?.['아메리카노']?.n || 0, all = lines.reduce((a,[,x])=>a+x.n,0);
  document.getElementById('stallPaper').innerHTML = `<h3>🧾 가판대 영수증</h3><p class="when">${B.since?`지난 정산 뒤 ${ago(B.since)} 동안`:''}</p>
    <table>${lines.map(([nm,x])=>`<tr><td>${esc(nm)}</td><td>${x.n}잔</td><td>🪙 ${x.coin}</td></tr>`).join('')}
    <tr class="sum"><td>합계</td><td>${all}잔</td><td>🪙 ${B.coins}</td></tr></table>
    <p class="cap">특제 음료 ${all-ame}잔, 아메리카노 ${ame}잔이 팔렸어요.${B.stars?` 이세계 손님이 ⭐ 별조각 ${B.stars}개를 두고 갔어요!`:''}</p>
    <button class="take" type="button" id="stallTake">정산금 받기 · 🪙 ${B.coins}${B.stars?` · ⭐ ${B.stars}`:''}</button>`;
  const R = document.getElementById('stallRcpt'); if(!R.open) R.showModal();
  document.getElementById('stallTake').onclick = ()=>act(async()=>{ const r = await api.stallClaim(); take(r); R.close(); renderAll();
    toast(`🪙 ${r.coins}코인${r.stars?`과 ⭐ ${r.stars}개`:''}를 받았어요!`); });
}

/* ---------- 열기 · 닫기 ---------- */
async function refresh(first){
  const r = await api.stall(); take(r);
  const sold = r.sold || [];
  if(first){ if(sold.length) setTimeout(showReceipt, 400); }
  else queue.push(...sold.slice(-6));
  renderAll();
}
async function openStall(){
  const D = dlg(); if(!api.stall){ toast('잠시 뒤 다시 해 주세요'); return; }
  try{ const r = await api.stall(); ST = r; }catch(e){ toast(/schema cache|function/.test(e.message||'') ? '가판대 준비 중이에요 (숲지기가 stall.sql 을 넣으면 열려요)' : (e.message||'잠시 뒤 다시 해 주세요')); return; }
  take(ST); shell(); renderAll(); D.showModal();
  if((ST.sold||[]).length && (ST.box.coins||ST.box.stars)) setTimeout(showReceipt, 500);
  clearInterval(poll); clearInterval(gtimer); queue = []; walking = 0;
  poll = setInterval(()=>{ if(D.open && !document.hidden) refresh(false).catch(()=>{}); }, DEMO ? 10e3 : 60e3);
  gtimer = setInterval(()=>{ if(D.open) spawnGuest(); }, 5200); setTimeout(spawnGuest, 900);
}
function closeStall(){ clearInterval(poll); clearInterval(gtimer); dlg().close(); }

document.addEventListener('click', e=>{
  if(e.target.closest('#stallGo')){ openStall(); return; }
  const D = dlg(); if(!D || !D.open || !D.contains(e.target)) return;
  if(e.target.closest('[data-sclose]')){ closeStall(); return; }
  if(e.target.closest('[data-ssign]')){ askText('가판대 이름을 지어 주세요 (10자까지)', signText()).then(v=>{ if(v==null) return; v = String(v).trim().slice(0,10);
      act(async()=>{ take(await api.stallSign(v)); renderSign(); toast(v ? `🪧 「${v}」 간판을 걸었어요` : '🪧 간판을 처음 이름으로 돌렸어요'); }); }); return; }
  if(e.target.closest('[data-sguide]')){ const g = q('.s-guide'); g.hidden = !g.hidden; return; }
  if(e.target.closest('[data-sbox]')){ showReceipt(); return; }
  const c = e.target.closest('[data-scup]'); if(c){ S.cup = c.dataset.scup; renderMake(); return; }
  const g = e.target.closest('[data-sing]'); if(g && S.ings.length < 3){ S.ings.push(g.dataset.sing); renderMake(); return; }
  const s = e.target.closest('[data-sslot]'); if(s){ S.ings.splice(+s.dataset.sslot, 1); renderMake(); return; }
  const t = e.target.closest('[data-stop]'); if(t){ S.top = t.dataset.stop; renderMake(); return; }
  const tb = e.target.closest('[data-stab]'); if(tb){ tab = tb.dataset.stab; renderMake(); return; }
  if(e.target.closest('[data-sreset]')){ S.ings = []; S.top = ''; q('.s-name').value = ''; renderMake(); return; }
  const u = e.target.closest('[data-sunshelf]'); if(u){ const n = +u.dataset.sunshelf, d = ST.slots.find(x=>x.slot===n); if(!d) return;
    askYes(`「${d.name}」을 진열대에서 내릴까요?\n남은 ${d.stock}잔은 사라져요.`, async()=>{ take(await api.stallRemove(n)); renderAll(); toast('진열대에서 내렸어요'); }); return; }
  if(e.target.closest('.s-make')){ const nm = autoName(S.cup, S.ings, S.top); if(!nm) return;
    const slot = [1,2,3].find(n=>!ST.slots.some(x=>x.slot===n)); if(!slot){ toast('진열대가 꽉 찼어요.\n선반 음료를 눌러 하나 내린 뒤 올려 주세요'); return; }
    const name = q('.s-name').value.trim() || nm.name, P = costOf(S.cup, S.ings, S.top, ST.inv);
    askYes(`「${name}」 ${NUM.stock}잔을 만들까요?\n재료비 🪙 ${P.coin}${P.shard?` + 💠 ${P.shard}`:''} · 한 잔 🪙 ${P.price}에 팔아요`, async()=>{
      const was = new Set(ST.dex||[]); take(await api.stallCraft(slot, S.cup, S.ings, S.top, name, nm.special?.code)); q('.s-name').value = '';
      renderAll(); renderStage(slot);
      toast(nm.special && !was.has(nm.special.code) ? `✨ 새 특제 레시피 「${nm.special.name}」 발견!` : `🍹 「${name}」 ${NUM.stock}잔을 선반에 올렸어요`); });
    return; }
  const v = e.target.closest('[data-svow]'); if(v){ const T = TAGS[v.dataset.svow];
    askYes(`${T.e} ${T.name} 세계에 집필 서약을 할까요?\n작업실에서 ${NUM.vowEvery}분 일할 때마다 ${T.name} 재료가 하나씩 쌓여요.`, async()=>{ take(await api.stallVowStart(v.dataset.svow)); renderAll(); toast(`✒️ ${T.name} 서약을 시작했어요`); }); return; }
  if(e.target.closest('[data-svowclaim]')) return act(async()=>{ const r = await api.stallVowClaim(); take(r); renderAll();
    toast('🎁 ' + Object.entries(r.got||{}).map(([k,n])=>`${ING[k]?.name||k} ${n}개`).join(', ') + ' 받았어요!'); });
});
function askYes(msg, fn){ ask(msg).then(ok=>{ if(ok) act(fn); }); }
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && dlg()?.open){ clearInterval(poll); clearInterval(gtimer); } });

})();
