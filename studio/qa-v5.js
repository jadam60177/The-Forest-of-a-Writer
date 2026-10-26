/* 마감의 숲 공동작업실 V5 — 본계/부계 실전 확인용. ?qa=1에서만 활성화.
 * 기존 서버 RPC/코인/5좌석 로직 변경 없음. 신상 식별 정보 저장하지 않음. */
(()=>{
'use strict';
if(new URLSearchParams(location.search).get('qa')!=='1')return;
const $=id=>document.getElementById(id);
const style=document.createElement('style');
style.textContent='#studioQaV5{position:fixed;z-index:99999;right:12px;bottom:12px;width:min(350px,calc(100vw - 24px));max-height:75vh;overflow:auto;background:#faf9f2;color:#354b3c;border:1px solid #b5c7b3;border-radius:16px;box-shadow:0 8px 28px #172e2138;font:13px/1.5 system-ui,"Malgun Gothic",sans-serif;padding:15px;box-sizing:border-box}#studioQaV5 *{box-sizing:border-box}#studioQaV5 h2{font-size:15px;margin:0 0 4px}#studioQaV5 p{font-size:11px;color:#718074;margin:3px 0 10px}#studioQaV5 .qa-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}#studioQaV5 .qa-cell{padding:8px;background:#eaf0e7;border-radius:10px}#studioQaV5 .qa-cell b{display:block;font-size:18px}#studioQaV5 pre{background:#fff;border-radius:10px;padding:10px;white-space:pre-wrap;font:12px/1.7 system-ui,"Malgun Gothic",sans-serif}#studioQaV5 button{padding:7px 10px;background:white;color:#355441;border:1px solid #b8c8b4;border-radius:9px;cursor:pointer;font:inherit}#studioQaV5 .qa-actions{display:flex;flex-wrap:wrap;gap:6px}#studioQaV5[data-folded=true] .qa-detail{display:none}#studioQaV5 .qa-head{display:flex;justify-content:space-between;gap:10px;align-items:center}';
document.head.append(style);
const box=document.createElement('aside');box.id='studioQaV5';
box.innerHTML='<div class="qa-head"><h2>🌳 작업실 V5 · 2계정 검수</h2><button type="button" id="qaFold">접기</button></div><div class="qa-detail"><p>서버 데이터 변경 없이 확인합니다. 기록에 계정 이름·ID·토큰은 포함되지 않아요.</p><div class="qa-grid"><div class="qa-cell">온라인<b id="qaOnline">–</b></div><div class="qa-cell">착석 인원<b id="qaSeated">–</b></div><div class="qa-cell">좌석<b id="qaSlots">–</b></div><div class="qa-cell">내 캐릭터<b id="qaSelf">–</b></div></div><pre id="qaStatus">점검 중…</pre><div class="qa-actions"><button type="button" id="qaRefresh">새로 갱신</button><button type="button" id="qaRecord">현재 상태 기록</button><button type="button" id="qaExport">익명 기록 내보내기</button></div></div>';
document.body.append(box);
const logs=[];let errors=0,last='',pending=null;
function record(){
 const spots=[...document.querySelectorAll('#spots .spot')];
 const occupied=spots.filter(s=>!s.classList.contains('empty')).length;
 const own=spots.filter(s=>s.querySelector('.name.mine')).length;
 const images=spots.flatMap(s=>[...s.querySelectorAll('img')]);
 const broken=images.filter(im=>im.complete&&im.naturalWidth===0).length;
 const match=($('onlineLabel')?.textContent||'').match(/(\d+)\s*명/);
 const online=match?Number(match[1]):null;
 const loggedIn=!!$('myLine')&&!$('myLine').classList.contains('hidden');
 const mode=($('modeText')?.textContent||'').trim().slice(0,50);
 const connected=($('detailsText')?.textContent||'').match(/Realtime:\s*([^\n]+)/)?.[1]||'확인 중';
 const obj={at:new Date().toISOString(),online,occupied,slots:spots.length,own,loggedIn,broken,mode,connected,network:navigator.onLine?'online':'offline',errors};
 const signature=JSON.stringify([online,occupied,spots.length,own,loggedIn,broken,mode,connected,obj.network,errors]);
 if(signature!==last){logs.push(obj);last=signature;if(logs.length>100)logs.shift();}
 $('qaOnline').textContent=online??'–';$('qaSeated').textContent=occupied;
 $('qaSlots').textContent=spots.length+'/5';$('qaSelf').textContent=loggedIn?(own===1?'정상':'확인 필요'):'로그인 전';
 const expected=online===null?null:Math.min(5,online);
 const checks=[
 (spots.length===5?'✓':'!')+' 5개 좌석',
 (expected===null||!loggedIn||occupied===expected?'✓':'!')+' 서버 인원과 좌석 일치',
 (!loggedIn||own===1?'✓':'!')+' 내 자리 표시',
 (broken===0?'✓':'!')+' 손상 이미지 '+broken+'장',
 '상태: '+(mode||'대기'),
 '실시간: '+connected,
 '연결: '+obj.network+' / 오류 '+errors+'회'
 ];
 $('qaStatus').textContent=checks.join('\n');
 return obj;
}
function schedule(){clearTimeout(pending);pending=setTimeout(record,180);}
$('qaFold').addEventListener('click',()=>{const closed=box.dataset.folded!=='true';box.dataset.folded=String(closed);$('qaFold').textContent=closed?'펼치기':'접기';});
$('qaRefresh').addEventListener('click',()=>{$('refresh')?.click();schedule();setTimeout(record,2000);});
$('qaRecord').addEventListener('click',()=>{const s=record();logs.push({...s,manual:true});$('qaRecord').textContent='기록 완료 ✓';});
$('qaExport').addEventListener('click',async()=>{
 record();const payload=JSON.stringify({tool:'studio-v5-qa',exportedAt:new Date().toISOString(),logs},null,2);
 try{await navigator.clipboard.writeText(payload);$('qaExport').textContent='복사 완료 ✓';}
 catch{const url=URL.createObjectURL(new Blob([payload],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='studio-v5-anonymous-qa.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
});
window.addEventListener('error',()=>{errors++;schedule();});window.addEventListener('online',schedule);window.addEventListener('offline',schedule);
for(const id of ['spots','modeText','onlineLabel','detailsText','myLine']){const t=$(id);if(t)new MutationObserver(schedule).observe(t,{childList:true,subtree:true,characterData:true,attributes:id==='myLine'});}
setInterval(record,10000);record();
})();