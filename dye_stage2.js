/* 마감의 숲 · 광장 2단계 보따리 / 부분 염색 (2026-10-26)
 * 기존 보따리의 서버 확률, 도감, 별조각을 건드리지 않는 독립 확장입니다. */
const DYE_PAINTS = [
 ['rose','벚꽃 우유','#D9A7B3','common'],['apricot','살구 크림','#DEB49A','common'],
 ['vanilla','바닐라 버터','#E5CF99','common'],['sage','안개 세이지','#A0B6A0','common'],
 ['mint','호수 민트','#9AC4BD','common'],['lavender','라벤더 밀크','#B9ACCD','rare'],
 ['mistblue','안개 블루','#92ACC4','rare'],['cocoa','장미 코코아','#B78D94','rare'],
 ['walnut','오래된 월넛','#806B5C','rare'],['night','한밤의 남색','#566782','legend'],
 ['silver','달빛 은회색','#C9CDD0','legend'],['ebony','별빛 흑단','#484550','legend']
].map(([code,name,hex,rarity])=>({code,name,hex,rarity}));
const DYE_SKY = {code:'sky',name:'기본 하늘색',hex:'#A9D0DE',rarity:'basic'};
const dyeOf = code => DYE_PAINTS.find(x=>x.code===code);
const dyeTone = t => String(t||'').startsWith('dy_') ? String(t).slice(3) : 'sky';
let DYE_STAGE = 1, DYE_BAG = 'paint', DYE_STATE = {open:false,furniture_open:false,paints:[]};
let DYE_RESULTS = [], DYE_EDIT = null;

function dyeArt(t=''){
  const key = dyeOf(dyeTone(t)) ? dyeTone(t) : 'sky', src = 'furn/armchair.webp';
  return '<span class="dye-art" aria-label="염색 가능 소파">'
    + '<img src="'+src+'" alt="" draggable="false" style="filter:url(#dyeTone_'+key+')">'
    + ['left','right','legs','rim'].map(k=>'<img class="dye-wood-'+k+'" src="'+src+'" alt="" draggable="false">').join('')
    + '</span>';
}
(function installDyeArt(){
  const css = String.raw`
    .gacha-stage-tabs{display:flex;gap:.5rem;flex-wrap:wrap;margin:0 0 .8rem}
    .gacha-stage-tabs button,.dye-box-tabs button{border:1px solid var(--line);background:var(--panel);color:var(--ink);border-radius:999px;padding:.48rem .95rem;font:inherit;cursor:pointer}
    .gacha-stage-tabs button.on,.dye-box-tabs button.on{background:linear-gradient(#FFDC86,#F2AA45);border-color:#F2C065;color:#3A2600}
    .dye-board{padding:1rem;border-radius:16px;background:var(--panel);border:1px solid var(--line);margin:.4rem 0 1.2rem}
    .dye-box-tabs{display:flex;gap:.5rem;flex-wrap:wrap;margin:.5rem 0 1rem}
    .dye-box-tabs button:disabled{opacity:.65;cursor:default}
    .dye-color-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:.55rem;margin-top:.8rem}
    .dye-color-card{padding:.65rem;border:1px solid var(--line);border-radius:12px;background:rgba(150,150,170,.07);display:flex;flex-direction:column;align-items:center;gap:.3rem}
    .dye-color-card .swatch{width:46px;height:40px;border:1px solid rgba(0,0,0,.15);border-radius:10px;display:grid;place-items:center}
    .dye-color-card.locked .swatch{background:rgba(130,130,155,.24)!important}
    .dye-color-card b{font-size:.82rem}.dye-color-card small{color:var(--muted);text-align:center}
    .dye-result{margin:.7rem 0;padding:.65rem;background:rgba(255,205,90,.13);border-radius:12px;line-height:1.7}
    .dye-editor-swatches{display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:.5rem;margin:1rem 0}
    .dye-editor-swatches button{display:flex;flex-direction:column;gap:.2rem;align-items:center;padding:.5rem;border:1px solid var(--line);border-radius:10px;background:var(--panel);color:var(--ink);font:inherit;cursor:pointer}
    .dye-editor-swatches button.on{outline:2px solid #FFCE5C}.dye-editor-swatches button:disabled{opacity:.5}
    .dye-editor-swatches .chip{width:48px;height:30px;border-radius:8px;border:1px solid rgba(0,0,0,.12)}
    .dye-art{position:relative;display:block;width:100%;height:100%;min-height:1.9rem;aspect-ratio:240/221}
    .dye-art>img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none}
    .dye-art .dye-wood-left{clip-path:polygon(0 34%,32% 34%,32% 93%,0 93%)}
    .dye-art .dye-wood-right{clip-path:polygon(68% 34%,100% 34%,100% 93%,68% 93%)}
    .dye-art .dye-wood-legs{clip-path:polygon(0 79%,100% 79%,100% 100%,0 100%)}
    .dye-art .dye-wood-rim{clip-path:polygon(12% 0,88% 0,88% 9%,12% 9%)}
    .furn>.dye-art{position:absolute;left:2px;top:2px;width:calc(100% - 4px);height:calc(100% - 4px)}
    .item .em .dye-art,.cell .em .dye-art{display:inline-block;width:52px;height:48px;vertical-align:middle;min-height:0}
  `;
  const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
  const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255);
  const defs=[DYE_SKY,...DYE_PAINTS].map(d=>{
    const c=hex(d.hex),tab=i=>[(c[i]*.3),(c[i]*.7),(c[i]*.95),(c[i]+(1-c[i])*.45)].map(v=>v.toFixed(3)).join(' ');
    return '<filter id="dyeTone_'+d.code+'" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer>'
      +[0,1,2].map((i)=>'<feFunc'+['R','G','B'][i]+' type="table" tableValues="'+tab(i)+'"/>').join('')
      +'</feComponentTransfer></filter>';
  }).join('');
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('aria-hidden','true');svg.style.cssText='position:absolute;width:0;height:0;overflow:hidden';
  svg.innerHTML=defs;document.body.prepend(svg);
})();

/* real server calls: use the already-authenticated client from index.html */
const _dyeRpc=async (fn,args)=>{
  const client=window.FOREST_SUPABASE?.();
  if(!client)throw new Error('로그인이 아직 준비되지 않았어요');
  const {data,error}=await client.rpc(fn,args||{});
  if(error)throw new Error(error.message||'염색공방 서버에 연결하지 못했어요');
  return data;
};
const dyeMock = async (kind, args={})=>{
  const st=api.st;
  st.dyeWallet ||= {};
  const plaza=(await api.plazaExpansion())||[];
  const open=!!plaza.find(b=>b.code==='dyeworkshop'&&b.built_at);
  const furnOpen=!!plaza.find(b=>b.code==='campfire_2'&&b.built_at);
  if(kind==='state')return {open,furniture_open:furnOpen,paints:Object.entries(st.dyeWallet).map(([code,uses])=>({code,uses}))};
  if(kind==='pull'){
    const n=args.p_count,bag=args.p_kind,price=(bag==='paint'?100:250)*(n===10?9:1);
    if(!(bag==='paint'?open:furnOpen))throw new Error('아직 열리지 않은 보따리예요');
    if(st.me.coins<price)throw new Error('코인이 부족해요');
    st.me.coins-=price;
    return Array.from({length:n},()=>{
      if(bag==='sofa'){st.inv.dye_armchair=(st.inv.dye_armchair||0)+1;return {code:'dye_armchair',rarity:'rare'};}
      const r=Math.random()*100,rank=r<70?'common':r<95?'rare':'legend',pool=DYE_PAINTS.filter(d=>d.rarity===rank);
      const d=pool[Math.floor(Math.random()*pool.length)];st.dyeWallet[d.code]=(st.dyeWallet[d.code]||0)+10;
      return {code:d.code,rarity:rank};
    });
  }
  if(kind==='recharge'){
    const code=args.p_color;
    if(st.dyeWallet[code]==null)throw new Error('먼저 이 색을 뽑아 주세요');
    if(st.me.coins<200)throw new Error('코인이 부족해요');
    st.me.coins-=200;return st.dyeWallet[code]+=10;
  }
  if(kind==='paint'){
    const f=st.placed.find(p=>String(p.id)===String(args.p_id)&&p.item_code==='dye_armchair');
    if(!f)throw new Error('소파를 찾지 못했어요');
    if(args.p_color==='sky'){f.tint=null;return;}
    const code=args.p_color;if(!dyeOf(code))throw new Error('알 수 없는 색이에요');
    if(f.tint==='dy_'+code)return;
    if(!(st.dyeWallet[code]>0))throw new Error('물감이 부족해요');
    st.dyeWallet[code]--;f.tint='dy_'+code;
  }
};
api.dyeStageState=()=>DEMO?dyeMock('state'):_dyeRpc('dye_stage_state');
api.dyeStagePull=(kind,count)=>DEMO?dyeMock('pull',{p_kind:kind,p_count:count}):_dyeRpc('dye_stage_pull',{p_kind:kind,p_count:count});
api.dyeStageRecharge=code=>DEMO?dyeMock('recharge',{p_color:code}):_dyeRpc('dye_stage_recharge',{p_color:code});
api.dyeStagePaint=(id,color)=>DEMO?dyeMock('paint',{p_id:String(id),p_color:color}):_dyeRpc('dye_stage_paint',{p_id:String(id),p_color:color});

const _refreshOriginalGacha=refreshGacha;
refreshGacha=async function(){
  await _refreshOriginalGacha();
  try{DYE_STATE=(await api.dyeStageState())||{open:false,furniture_open:false,paints:[]};}
  catch(e){DYE_STATE={open:false,furniture_open:false,paints:[]};}
};
function dyeUses(code){return (DYE_STATE.paints||[]).find(p=>p.code===code)?.uses ?? -1;}
function renderDyeStage(){
  const switcher=document.getElementById('gachaStageSwitch'),one=document.getElementById('gachaStageOne'),two=document.getElementById('gachaStageTwo');
  if(!switcher||!two)return;
  if(!DYE_STATE.open)DYE_STAGE=1;
  switcher.hidden=!DYE_STATE.open;
  switcher.innerHTML=DYE_STATE.open?'<button data-gacha-stage="1" class="'+(DYE_STAGE===1?'on':'')+'">🎁 1단계 보따리</button><button data-gacha-stage="2" class="'+(DYE_STAGE===2?'on':'')+'">🎨 2단계 보따리</button>':'';
  one.hidden=DYE_STAGE!==1;two.hidden=DYE_STAGE!==2;
  if(DYE_STAGE!==2)return;
  if(DYE_BAG==='sofa'&&!DYE_STATE.furniture_open)DYE_BAG='paint';
  const isPaint=DYE_BAG==='paint',p=isPaint?100:250;
  const tabs='<div class="dye-box-tabs"><button data-dye-bag="paint" class="'+(isPaint?'on':'')+'">🎨 염색공방 보따리</button>'
    +'<button data-dye-bag="sofa" class="'+(!isPaint?'on':'')+'" '+(DYE_STATE.furniture_open?'':'disabled')+'>'+(DYE_STATE.furniture_open?'🛋️ 모닥불 가구 보따리':'🔒 ???')+'</button></div>';
  const pulls='<div class="pull-row"><button class="pull" data-dye-pull="1" '+(ME.coins<p?'disabled':'')+'>한 번 열기 · 🪙 '+p+'</button><button class="pull ten" data-dye-pull="10" '+(ME.coins<p*9?'disabled':'')+'>열 번 열기 · 🪙 '+(p*9)+'</button></div>';
  const colors='<div class="dye-color-grid">'+DYE_PAINTS.map(d=>{
    const uses=dyeUses(d.code),have=uses>=0;
    return '<div class="dye-color-card '+(have?'':'locked')+'"><span class="swatch" style="'+(have?'background:'+d.hex:'')+'">'+(have?'':'❔')+'</span><b>'+(have?esc(d.name):'???')+'</b><small>'+(have?'남은 염색 '+uses+'회':'미수집')+'</small>'
      +(have?'<button class="mini" data-dye-recharge="'+d.code+'" '+(ME.coins<200?'disabled':'')+'>🪙 200 · 10회 충전</button>':'')+'</div>';
  }).join('')+'</div>';
  const sofa='<div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap"><div style="width:130px;height:118px">'+dyeArt()+'</div><div><b>🎨 하늘빛 염색 소파</b><p class="small">1칸 · 하늘색 기본 제공 · 나무 팔걸이와 다리는 염색되지 않아요.</p><p class="small">가방 '+(INV.dye_armchair||0)+'개 · 방에 배치 '+PLACED.filter(x=>x.item_code==='dye_armchair').length+'개</p></div></div>';
  two.innerHTML='<div class="dye-board"><h3>🎁 '+(isPaint?'염색공방 보따리':'모닥불 가구 보따리')+'</h3><p class="small">'
    +(isPaint?'완공된 염색공방의 비밀 보따리! 물감 12색 중 하나가 나와요. 첫 획득도, 중복도 10회씩 충전돼요.':'광장 모닥불 증축 보상! 처음에는 염색 가능한 1인 소파가 들어 있어요.')
    +'</p>'+tabs+pulls+'<p class="small">'+(isPaint?'일반 70% · 희귀 25% · 전설 5% · '+(DYE_STATE.paints||[]).length+'/12종':'지금은 소파 1종만 나와요 · 1회 뽑으면 1개 지급')+'</p>'
    +(DYE_RESULTS.length?'<div class="dye-result">'+DYE_RESULTS.map(esc).join(' · ')+'</div>':'')
    +(isPaint?colors:sofa)
    +'<p class="small">색상 확정 시 1회 사용, 같은 색 재선택은 무료예요. 하늘색으로 되돌리기도 무료! 이미 염색한 가구는 물감이 0회가 되어도 색이 유지돼요.</p></div>';
}
const _renderOriginalGacha=renderGacha;
renderGacha=function(){_renderOriginalGacha();renderDyeStage();};

document.addEventListener('click',e=>{
 const stage=e.target.closest('[data-gacha-stage]');
 if(stage){DYE_STAGE=+stage.dataset.gachaStage;DYE_RESULTS=[];renderGacha();return;}
 const bag=e.target.closest('[data-dye-bag]');
 if(bag){DYE_BAG=bag.dataset.dyeBag;DYE_RESULTS=[];renderGacha();return;}
 const pull=e.target.closest('[data-dye-pull]');
 if(pull)return act(async()=>{
   const count=+pull.dataset.dyePull,kind=DYE_BAG;
   const res=await api.dyeStagePull(kind,count);
   DYE_RESULTS=(Array.isArray(res)?res:[]).map(r=>kind==='paint'?(dyeOf(r.code)?.name||'마법 물감'):'하늘빛 염색 소파');
   await Promise.all([refreshMine(),refreshGacha()]);
   renderTop();renderGacha();renderBag();toast('🎁 보따리를 열었어요!');
 });
 const rech=e.target.closest('[data-dye-recharge]');
 if(rech)return act(async()=>{
   const d=dyeOf(rech.dataset.dyeRecharge);
   if(!d||!(await ask('🎨 '+d.name+' 물감을 🪙 200코인에 10회 충전할까요?')))return;
   await api.dyeStageRecharge(d.code);await Promise.all([refreshMine(),refreshGacha()]);
   renderTop();renderGacha();toast('🎨 '+d.name+' 10회 충전!');
 });
});

/* 전용 가구 미리보기: 원본 소파는 유지하고 색이 변하는 부분만 합성 */
const _openOldTint=openTint;
openTint=function(f){if(f&&f.item_code==='dye_armchair')return openDyeEditor(f);return _openOldTint(f);};
const editor=document.createElement('dialog');editor.className='visit ask tint-dlg';editor.id='dyeFurnitureDlg';
editor.innerHTML='<h3 style="margin:0 0 .3rem">🎨 염색 가능한 가구</h3><p class="small">소파는 천 부분만 바뀌고 나무 팔걸이와 다리는 그대로예요. 미리보기는 무료!</p>'
  +'<div class="dye-editor-swatches" id="dyeFurnitureSwatches"></div>'
  +'<div id="dyeFurniturePreview" style="width:110px;height:105px;margin:.5rem auto"></div>'
  +'<p class="small" id="dyeFurnitureNotice" style="text-align:center"></p>'
  +'<div style="display:flex;gap:.5rem;justify-content:flex-end"><button class="mini" id="dyeFurnitureCancel">취소</button><button class="mini ask-yes" id="dyeFurnitureSave">🎨 염색하기</button></div>';
document.body.append(editor);
function openDyeEditor(f){DYE_EDIT={f,color:dyeTone(f.tint)};drawDyeEditor();editor.showModal();}
function drawDyeEditor(){
 if(!DYE_EDIT)return;
 const cur=DYE_EDIT.color;
 document.getElementById('dyeFurnitureSwatches').innerHTML=[DYE_SKY,...DYE_PAINTS].map(d=>{
   const uses=d.code==='sky'?null:dyeUses(d.code),can=d.code==='sky'||uses>0;
   return '<button data-dye-choose="'+d.code+'" class="'+(cur===d.code?'on':'')+'" '+(can?'':'disabled')+'><span class="chip" style="background:'+d.hex+'"></span><span>'+esc(d.name)+'</span><small>'+(d.code==='sky'?'무료':uses<0?'미수집':uses+'회')+'</small></button>';
 }).join('');
 document.getElementById('dyeFurniturePreview').innerHTML=dyeArt(cur==='sky'?'':'dy_'+cur);
 document.getElementById('dyeFurnitureNotice').textContent=cur==='sky'?'기본 하늘색은 무료예요.':'색상을 확정하면 물감 1회를 사용해요.';
 document.getElementById('dyeFurnitureSave').disabled=cur!=='sky'&&dyeUses(cur)<=0&&dyeTone(DYE_EDIT.f.tint)!==cur;
}
editor.addEventListener('click',e=>{
 const b=e.target.closest('[data-dye-choose]');if(b&&DYE_EDIT){DYE_EDIT.color=b.dataset.dyeChoose;drawDyeEditor();return;}
 if(e.target.closest('#dyeFurnitureCancel')){DYE_EDIT=null;editor.close();return;}
 if(e.target.closest('#dyeFurnitureSave'))return act(async()=>{
   if(!DYE_EDIT)return;const {f,color}=DYE_EDIT;
   await api.dyeStagePaint(f.id,color);await Promise.all([refreshMine(),refreshGacha()]);
   DYE_EDIT=null;editor.close();renderMyHouse();renderGacha();renderTop();toast('🎨 소파 염색 완료!');
 });
});
