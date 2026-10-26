/* node tests/studio-v5-smoke.cjs — external dependencies: none */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'studio_v5_showcase.html'),'utf8');
const qa=fs.readFileSync(path.join(root,'studio/qa-v5.js'),'utf8');
function check(label,fn){try{fn();console.log('PASS',label);}catch(e){console.error('FAIL',label,e.message);process.exitCode=1;}}
const i=html.indexOf('/* Shared pure selection logic.');
const j=html.indexOf('</script>',i);
assert(i>=0&&j>i,'StudioCore source not found');
const ctx={};vm.runInNewContext(html.slice(i,j),ctx,{timeout:1500});
const C=ctx.StudioCore;
check('V5 keeps official OAuth/RPC and 5-seat system',()=>{
 assert(html.includes("studio_live_me"));assert(html.includes("studio_live_people"));
 assert(html.includes("studio_live_enter"));assert(html.includes("studio_live_leave"));
 assert.equal(C.MY_SLOT,3);assert.equal(C.OTHER_SLOTS.length,4);
});
check('two Discord users receive distinct chairs within one browser view',()=>{
 const r=C.choose([{id:'A',style:'bob'},{id:'B',style:'pink'}],'A',501);
 assert.equal(r.count,2);assert.equal(r.seats.filter(Boolean).length,2);
 assert.equal(r.seats[C.MY_SLOT].id,'A');
 assert.equal(new Set(r.seats.filter(Boolean).map(p=>p.id)).size,2);
});
check('same-hour refresh keeps occupied seat positions',()=>{
 const users=['A','B','C','D','E','F'].map(id=>({id,style:'bob'}));
 const first=C.choose(users,'A',502);
 const second=C.choose(users,'A',502,first.selection,first.history);
 assert.deepEqual(Array.from(first.selection.ids),Array.from(second.selection.ids));
 assert.equal(first.seats.filter(Boolean).length,5);
 assert.equal(first.count,6);
});
check('departure releases a seat and another resident can occupy it',()=>{
 const users=['A','B','C','D','E','F'].map(id=>({id,style:'bob'}));
 const first=C.choose(users,'A',503);
 const gone=first.seats.filter(Boolean).find(p=>p.id!=='A').id;
 const later=C.choose(users.filter(p=>p.id!==gone),'A',503,first.selection,first.history);
 assert.equal(later.count,5);
 assert.equal(later.seats.filter(Boolean).length,5);
 assert(!later.seats.some(p=>p&&p.id===gone));
});
check('hour change never duplicates a resident',()=>{
 const users=['A','B','C','D','E','F','G'].map(id=>({id,style:'bob'}));
 const one=C.choose(users,'A',504);
 const two=C.choose(users,'A',505,one.selection,one.history);
 assert.equal(two.count,7);
 assert.equal(new Set(two.seats.filter(Boolean).map(p=>p.id)).size,5);
 assert.equal(two.seats[C.MY_SLOT].id,'A');
});
check('QA only on explicit query; no SQL writes or credential collection',()=>{
 assert(html.includes('studio/qa-v5.js'));
 assert(qa.includes("get('qa')!=='1'"));
 assert(!qa.includes('service_role'));
 assert(!qa.includes('studio_live_set_style'));
 assert(!qa.includes("auth.getSession"));
});
check('late refresh result safely ignored after leave',()=>{
 assert(html.includes('if(!state.connected||leaving)return;'));
});
console.log(process.exitCode?'Some checks failed.':'All studio V5 static/seat checks passed.');
