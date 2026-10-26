/* 마감의 숲 | 작업실 V4 파츠 엔진. 기존 5인 착석·출석 RPC를 변경하지 않습니다. */
(function(w){
'use strict';
var SIZE=[480,620],DIR='studio/assets/wardrobe/',cache=new Map(),local=new Map(),done=new Map();
var sb=null,me=null,updated=function(){},peopleCache={key:'',when:0,looks:{}};
var catalog={hair:new Set(['bob']),outfit:new Set(['pajamas']),eyes:new Set(['round'])};
var fallback={hair:'bob',outfit:'pajamas',eyes:'round',hairColor:null,outfitColor:null},look=Object.assign({},fallback),seq=0;
function el(id){return document.getElementById(id);}
function clean(v){var r=Object.assign({},fallback);v=v||{};['hair','outfit','eyes'].forEach(function(k){if(/^[a-z0-9_]{1,40}$/.test(v[k]))r[k]=v[k];});['hairColor','outfitColor'].forEach(function(k){if(typeof v[k]==='string'&&/^#[a-f0-9]{6}$/i.test(v[k]))r[k]=v[k].toLowerCase();});return r;}
function add(name,file){name=String(name).replace(/^.*?(dye_masks\/)/,'dye_masks/');if(!name.startsWith('dye_masks/'))name=name.split('/').pop();if(name.endsWith('_dye_mask.png')&&!name.startsWith('dye_masks/'))name='dye_masks/'+name;if(!/^[a-z0-9_\/.-]+\.png$/i.test(name)||file.size>20000000)return;var old=local.get(name);if(old)URL.revokeObjectURL(old);local.set(name,URL.createObjectURL(file));cache.delete(name);done.clear();var m=name.match(/^hair_([a-z0-9_]+)_back_(?:standing|seated)\.png$/);if(m)catalog.hair.add(m[1]);m=name.match(/^outfit_([a-z0-9_]+)_(?:standing|seated)\.png$/);if(m)catalog.outfit.add(m[1]);m=name.match(/^face_([a-z0-9_]+)_(?:standing|seated)\.png$/);if(m)catalog.eyes.add(m[1]);}
function img(name,optional){
if(!cache.has(name))cache.set(name,new Promise(function(ok,no){var i=new Image();i.onload=function(){i.naturalWidth===480&&i.naturalHeight===620?ok(i):no(Error('480×620 규격 오류: '+name));};i.onerror=function(){no(Error('에셋 누락: '+name));};i.src=local.get(name)||DIR+name;}).catch(function(e){if(optional)return null;throw e;}));
return cache.get(name);
}
function tinted(base,mask,hex){
if(!mask||!hex)return base;
var c=document.createElement('canvas');c.width=480;c.height=620;var x=c.getContext('2d',{willReadFrequently:true});x.drawImage(base,0,0);
var v=x.getImageData(0,0,480,620);x.clearRect(0,0,480,620);x.drawImage(mask,0,0);var m=x.getImageData(0,0,480,620).data,p=v.data,color=[1,3,5].map(function(n){return parseInt(hex.slice(n,n+2),16);});
for(var j=0;j<p.length;j+=4){if(!p[j+3]||!m[j+3])continue;var lum=(.2126*p[j]+.7152*p[j+1]+.0722*p[j+2])/255;var strength=Math.min(.82,m[j+3]/255*.82*Math.max(.12,lum));var shade=Math.max(.42,Math.min(1.30,.47+lum));for(var k=0;k<3;k++)p[j+k]=Math.round(p[j+k]*(1-strength)+Math.min(255,color[k]*shade)*strength);}
x.putImageData(v,0,0);return c;
}
async function layer(ctx,name,color){var i=await img(name);var mask=color?await img('dye_masks/'+name.replace(/\.png$/,'_dye_mask.png'),true).catch(function(){return null;}):null;ctx.drawImage(tinted(i,mask,color),0,0);}
function original(style,pose){return w.StudioCore&&w.StudioCore.sprite?w.StudioCore.sprite(style||'bob',pose):'';}
async function render(spec,pose,originalStyle){
pose=pose==='standing'?'standing':'seated';var a=clean(spec),key=JSON.stringify([a,pose]);if(done.has(key))return done.get(key);
var paths=['hair_'+a.hair+'_back_'+pose+'.png','body_base_'+pose+'.png','outfit_'+a.outfit+'_'+pose+'.png','face_'+a.eyes+'_'+pose+'.png','hair_'+a.hair+'_front_'+pose+'.png'];
try{
await Promise.all(paths.map(function(n){return img(n);}));
var c=document.createElement('canvas');c.width=480;c.height=620;var ctx=c.getContext('2d');
await layer(ctx,paths[0],a.hairColor);await layer(ctx,paths[1],null);await layer(ctx,paths[2],a.outfitColor);await layer(ctx,paths[3],null);await layer(ctx,paths[4],a.hairColor);
var url=c.toDataURL('image/png');done.set(key,url);return url;
}catch(e){return original(originalStyle||'bob',pose);}
}
function label(text){if(el('wdFeedback'))el('wdFeedback').textContent=text;}
function select(id,values,value){var node=el(id);if(!node)return;node.replaceChildren();Array.from(values).sort().forEach(function(k){var o=document.createElement('option');o.value=k;o.textContent={bob:'밤색 단발',pajamas:'줄무늬 잠옷',round:'기본 눈'}[k]||k;node.append(o);});node.value=values.has(value)?value:Array.from(values)[0];}
function updateInputs(){select('wdHair',catalog.hair,look.hair);select('wdOutfit',catalog.outfit,look.outfit);select('wdEyes',catalog.eyes,look.eyes);if(el('wdHairColor'))el('wdHairColor').value=look.hairColor||'#795c48';if(el('wdOutfitColor'))el('wdOutfitColor').value=look.outfitColor||'#b6af9e';if(el('wdHairDye'))el('wdHairDye').checked=!!look.hairColor;if(el('wdOutfitDye'))el('wdOutfitDye').checked=!!look.outfitColor;}
function getChoice(){return clean({hair:el('wdHair')&&el('wdHair').value,outfit:el('wdOutfit')&&el('wdOutfit').value,eyes:el('wdEyes')&&el('wdEyes').value,hairColor:el('wdHairDye')&&el('wdHairDye').checked?el('wdHairColor').value:null,outfitColor:el('wdOutfitDye')&&el('wdOutfitDye').checked?el('wdOutfitColor').value:null});}
async function preview(){
var token=++seq,pose=el('wdPose')?el('wdPose').value:'standing',src=await render(getChoice(),pose,'bob');if(token!==seq)return;
var c=el('wardrobeCanvas');if(!c)return;var im=new Image();
im.onload=function(){if(token!==seq)return;var cx=c.getContext('2d');cx.clearRect(0,0,480,620);cx.drawImage(im,0,0,480,620);};
im.src=src;label('모든 필수 파츠가 있으면 새 의상이 적용되고, 누락된 파츠가 있으면 기존 완성형 아바타를 표시합니다.');
}
async function save(){
if(!sb||!me){label('로그인 후 저장해 주세요.');return;}
var x=getChoice();try{
var r=await sb.rpc('studio_wardrobe_save',{p_hair:x.hair,p_outfit:x.outfit,p_eyes:x.eyes,p_hair_color:x.hairColor,p_outfit_color:x.outfitColor});
if(r.error)throw r.error;look=clean(r.data||x);peopleCache.when=0;done.clear();label('작업실 착용 정보가 서버에 저장됐습니다.');updated();
}catch(e){label('착용 저장 실패: SQL 및 권한을 확인해 주세요. '+(e.message||e));}
}
function connect(opt){
sb=opt.sb;me=opt.user;updated=typeof opt.updated==='function'?opt.updated:function(){};
if(!sb||!me)return;sb.rpc('studio_wardrobe_get').then(function(r){if(r.error)throw r.error;look=clean(r.data||{});updateInputs();preview();}).catch(function(){label('옷장 SQL 적용 전입니다. 기존 작업실은 그대로 동작합니다.');});
}
async function getMany(ids,client){
if(!client||!ids.length)return {};
ids=Array.from(new Set(ids.map(String))).slice(0,100);var key=ids.join('|'),now=Date.now();
if(peopleCache.key===key&&now-peopleCache.when<20000)return peopleCache.looks;
try{var r=await client.rpc('studio_wardrobe_many',{p_ids:ids});if(r.error)throw r.error;var obj={};(Array.isArray(r.data)?r.data:[]).forEach(function(x){if(x.id)obj[String(x.id)]=clean(x);});peopleCache={key:key,when:now,looks:obj};return obj;}catch(e){return {};}
}
async function validate(){
var names=['hair_bob_back_standing.png','hair_bob_front_standing.png','hair_bob_back_seated.png','hair_bob_front_seated.png','outfit_pajamas_standing.png','outfit_pajamas_seated.png','body_base_standing.png','body_base_seated.png','face_round_standing.png','face_round_seated.png'];
var bad=[];for(var n of names){try{await img(n);}catch(e){bad.push(n);}}
label(bad.length?'필수 파츠 '+bad.length+'개 누락: '+bad.join(', '):'기본 서기/앉기 파츠 규격 검사 통과');
}
function mount(){
var lab=el('wardrobeLab');if(!lab)return;
var fields=lab.querySelector('.wardrobe-fields'),actions=lab.querySelector('.wardrobe-actions');if(!fields||!actions)return;
var addon=document.createElement('div');addon.className='wardrobe-v4-dye';
addon.innerHTML='<label>머리 염색 <input type="color" id="wdHairColor" value="#795c48"></label><label><input id="wdHairDye" type="checkbox"> 머리색 적용</label><label>의상 염색 <input type="color" id="wdOutfitColor" value="#b6af9e"></label><label><input id="wdOutfitDye" type="checkbox"> 의상색 적용</label>';
fields.insertBefore(addon,actions);
var inp=document.createElement('input');inp.type='file';inp.id='wdImport';inp.accept='.png,image/png';inp.multiple=true;inp.setAttribute('aria-label','압축 해제한 에셋 PNG 선택');actions.prepend(inp);
inp.addEventListener('change',async function(){var count=0;for(var f of inp.files){if(!f.name.toLowerCase().endsWith('.png'))continue;var part=f.webkitRelativePath||f.name;add(part,f);count++;}updateInputs();await preview();label('PNG '+count+'개를 임시로 불러왔습니다. 서버 주민에게 공개하려면 에셋을 저장소에 업로드해야 합니다.');});
var b=document.createElement('button');b.textContent='작업실에 착용 저장';b.type='button';actions.append(b);b.addEventListener('click',save);
['wdHair','wdOutfit','wdEyes','wdPose','wdHairColor','wdOutfitColor','wdHairDye','wdOutfitDye'].forEach(function(id){if(el(id))el(id).addEventListener('change',preview);});
if(el('wdCheck')){el('wdCheck').textContent='필수 파츠 검사';el('wdCheck').onclick=validate;}
if(el('wdSave')){el('wdSave').onclick=function(){var a=document.createElement('a');a.href=el('wardrobeCanvas').toDataURL('image/png');a.download='studio_v4_preview.png';a.click();};}
updateInputs();preview();
}
w.StudioWardrobeV4={render,connect,getMany,normalize:clean,preview};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})(window);