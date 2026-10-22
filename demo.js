/* 🧪 마감의 숲 · 미리보기용 가짜 서버 (demo.js, 10-22 정리)
   index.html 의 SUPABASE 주소가 비어 있을 때(미리보기)만 불러와요. 진짜 숲 주민들은 이 파일을 받지 않아요.
   index.html 의 상수·함수를 그대로 써요 — index.html 과 같은 판으로 같이 올려 주세요. */
function makeDemoApi(){
  const st = {
    me:{discord_id:'me', display_name:'나', avatar_url:'', is_admin:true, coins:30, stars:0, room_blocks:0, room_names:['거실'], total_minutes:0, in_voice:false, today_minutes:0, house_color:Math.floor(Math.random()*10), seeds:3, tour_done:false},
    others:[
      ['moon','달빛작가',62,true,95,0],['cat','고양이손',7,false,0,75],['dl','마감요정',185,true,210,0],
      ['green','초록펜',18,false,0,20],['dawn','새벽두시',128,false,0,36],['owl','야행성',2,true,30,0],
      ['pencil','연필깎이',255,false,12,1],['bread','구름빵',41,false,0,63],
    ].map(([discord_id,display_name,h,in_voice,today_minutes,away])=>({discord_id,display_name,total_minutes:Math.round(h*60),in_voice,today_minutes,away,removed:false,house_color:Math.floor(Math.random()*10)})),
    plaza: PLAZA_DEFAULT.map((b,i)=>({...b, raised: i===0?b.goal: i===1?1350:0, built_at: i===0?new Date(Date.now()-5*86400e3).toISOString():null,
      givers: new Set(i===0?['moon','dl','green','dawn','pencil','bread']: i===1?['moon','dl','owl','cat','pencil']:[]), mine:0})),
    coll:new Set(), cabs:{}, otherCabs:{}, raidDay:'', raidOwners:[],
    raidNotes:[{thief_name:'달빛작가', success:true}, {thief_name:'고양이손', success:false}], garden:[], gdex:{}, inv:{}, placed:[], nextId:1, otherRooms:{}, gifts:[], events:[], evId:1, noteId:3,
    notes:[
      {id:2, discord_id:'moon', category:'가구 요청', body:'숲에 버섯 가구 있으면 좋겠어요 🍄 움막이랑 잘 어울릴 것 같아요!', created_at:new Date(Date.now()-3600e3).toISOString(), read:false, members:{display_name:'달빛작가'}},
      {id:1, discord_id:'dl', category:'건의', body:'담당자 대사에 \'수정고 부탁드려요\'도 넣어 주세요 ㅋㅋㅋ', created_at:new Date(Date.now()-86400e3).toISOString(), read:true, members:{display_name:'마감요정'}},
    ],
  };
  try{ const raw = localStorage.getItem('majam-forest-demo'); if(raw){ const s=JSON.parse(raw); Object.assign(st.me, s.me, {in_voice:false}); st.inv=s.inv||{}; st.placed=s.placed||[]; st.nextId=s.nextId||1; st.coll=new Set(s.coll||[]); st.cabs=s.cabs||{}; st.garden=s.garden||[]; st.gdex=s.gdex||{}; st.fdex=s.fdex||{}; st.fpend=s.fpend||[]; st.fpid=s.fpid||1; st.net=s.net||null; st.fday=s.fday||''; st.fused=s.fused||0; st.pt=s.pt||null; st.looks=s.looks||null; st.lotto=s.lotto||null; st.isk=s.isk||null; st.vd=s.vd||null; } }catch(e){}
  const persist = () => { try{ localStorage.setItem('majam-forest-demo', JSON.stringify({me:st.me, inv:st.inv, placed:st.placed, nextId:st.nextId, coll:[...st.coll], cabs:st.cabs, garden:st.garden, gdex:st.gdex, fdex:st.fdex, fpend:st.fpend, fpid:st.fpid, net:st.net, fday:st.fday, fused:st.fused, pt:st.pt, looks:st.looks, lotto:st.lotto, isk:st.isk, vd:st.vd})); }catch(e){} };
  DEFAULT_SHOP.forEach(it=>{ if(it.unlock_by && st.plaza.find(b=>b.code===it.unlock_by && b.built_at)) it.active=true; });
  const item = code => DEFAULT_SHOP.find(s=>s.code===code);
  const fail = msg => { throw new Error(msg); };
  return {
    st,
    async init(){ return {status:'ok'}; },
    async login(){}, async logout(){ toast('미리보기에서는 나갈 수 없어요'); },
    async me(){ return {...st.me}; },
    async village(){
      return [
        {...st.me, decay:0, removed:false},
        ...st.others.filter(o=>!o.removed || o.justRemoved).map(o=>({...o, decay:o.in_voice?0:decayOf(o.away)})),
      ];
    },
    async shop(){ return DEFAULT_SHOP.filter(s=>s.active); },
    boxOpen(code){ const b=GACHA_BOXES.find(x=>x.code===code); return !!b && (!b.unlock_by || !!st.plaza.find(p=>p.code===b.unlock_by && p.built_at)); },
    async gachaBoxes(){ return GACHA_BOXES.map(b=>({...b, unlocked:this.boxOpen(b.code)})); },
    async gacha(){ return GACHA_DEFAULT.map(({category, ...it})=>({...it, rarity:it.gacha_rarity, box:it.gacha_box, owned:st.coll.has(it.code)})); },
    async pull(box, n){
      if(!this.boxOpen(box)) fail('아직 열 수 없는 보따리예요');
      const price = n===10 ? PULL10_PRICE : PULL_PRICE;
      if(st.me.coins<price) fail('코인이 부족해요');
      st.me.coins-=price; st.me.stars=(st.me.stars||0)+n;
      const out=[];
      for(let i=0;i<n;i++){
        const x=Math.random()*100, r = x<RARITY.legend.rate?'legend': x<RARITY.legend.rate+RARITY.rare.rate?'rare':'common';
        const pool=GACHA_DEFAULT.filter(g=>g.gacha_box===box && g.gacha_rarity===r), it=pool[Math.floor(Math.random()*pool.length)];
        st.inv[it.code]=(st.inv[it.code]||0)+1; st.coll.add(it.code); out.push({item_code:it.code, rarity:r});
      }
      persist(); return out;
    },
    outside(code){ return st.placed.filter(p=>p.item_code===code).length + Object.values(st.cabs).flat().filter(x=>x.item_code===code).length; },
    async dismantle(code, qty){
      const it=GACHA_DEFAULT.find(g=>g.code===code); if(!it) fail('보따리 소품이 아니에요');
      const keep = this.outside(code)>0 ? 0 : 1;
      if(!(qty>=1) || (st.inv[code]||0) - qty < keep) fail('바꿀 수 있는 중복이 없어요');
      st.inv[code]-=qty; st.me.stars=(st.me.stars||0)+qty*RARITY[it.gacha_rarity].dup; persist(); return st.me.stars;
    },
    async dismantleAll(){
      GACHA_DEFAULT.forEach(it=>{ const keep = this.outside(it.code)>0 ? 0 : 1, d = Math.max(0,(st.inv[it.code]||0)-keep);
        if(d){ st.inv[it.code]-=d; st.me.stars=(st.me.stars||0)+d*RARITY[it.gacha_rarity].dup; } });
      persist(); return st.me.stars;
    },
    async exchange(code){
      const it=GACHA_DEFAULT.find(g=>g.code===code); if(!it) fail('보따리 소품이 아니에요');
      if(!this.boxOpen(it.gacha_box)) fail('아직 열 수 없는 보따리예요');
      const cost=RARITY[it.gacha_rarity].cost;
      if((st.me.stars||0)<cost) fail('별조각이 부족해요');
      st.me.stars-=cost; st.inv[code]=(st.inv[code]||0)+1; st.coll.add(code); persist(); return st.me.stars;
    },
    async plaza(){
      return st.plaza.map(b=>({code:b.code, emoji:b.emoji, name:b.name, goal:b.goal, sort:b.sort, about:b.about,
        raised:b.raised, built_at:b.built_at, givers:b.givers.size, my_amount:b.mine}));
    },
    async givePlaza(amount){
      const b = st.plaza.find(x=>!x.built_at); if(!b) fail('광장이 다 지어졌어요');
      if(!(amount>=1)) fail('1코인 이상 보내 주세요');
      const amt = Math.min(amount, b.goal-b.raised);
      if(st.me.coins<amt) fail('코인이 부족해요');
      st.me.coins-=amt; b.raised+=amt; b.mine+=amt; b.givers.add('me');
      if(b.raised>=b.goal){ b.built_at=new Date().toISOString(); DEFAULT_SHOP.forEach(it=>{ if(it.unlock_by===b.code) it.active=true; }); }
      persist(); return {coins:st.me.coins, used:amt};
    },
    plazaNeighbor(){
      const b = st.plaza.find(x=>!x.built_at); if(!b) return null;
      const o = st.others[Math.floor(Math.random()*st.others.length)];
      const amt = Math.min([10,20,30,50][Math.floor(Math.random()*4)], b.goal-b.raised);
      b.raised+=amt; b.givers.add(o.discord_id);
      if(b.raised>=b.goal){ b.built_at=new Date().toISOString(); DEFAULT_SHOP.forEach(it=>{ if(it.unlock_by===b.code) it.active=true; }); }
      return b;
    },
    async inventory(){ return {...st.inv}; },
    async placements(id){
      if(id==='me') return st.placed.map(p=>({...p}));
      if(!st.otherRooms[id]){
        const o = st.others.find(x=>x.discord_id===id); o.blocks ??= Math.floor(Math.random()*3);
        o.rooms ??= Math.random()<.6 ? ['거실','침실'] : ['거실'];
        const cur = roomOf(o.total_minutes, o.blocks);
        const plan = [['cabinet','bed','desk','plant','books','candle','cat','coffee'], ['bed','teddy','moonlamp','shelf','frame']];
        const list=[]; let n=1; st.otherCabs[id] = {};
        o.rooms.forEach((_,room)=>{
          const inRoom=[];
          for(const code of plan[room]){
            const it=item(code);
            for(let tries=0;tries<30;tries++){
              const r=Math.floor(Math.random()*cur.rows), c=Math.floor(Math.random()*cur.cols);
              if(canPlaceIn(inRoom,r,c,it.w,it.h,cur,code)){
                const f={id:n++,item_code:code,r,c,w:it.w,h:it.h,room}; inRoom.push(f); list.push(f);
                if(CAPACITY[code]){
                  const pool = GACHA_DEFAULT.filter(g=>g.w===1&&g.h===1);
                  const k = 2+Math.floor(Math.random()*(CAPACITY[code]-1));
                  st.otherCabs[id][f.id] = Array.from({length:k},(_,slot)=>({placement_id:f.id, slot, item_code:pool[Math.floor(Math.random()*pool.length)].code}));
                }
                break;
              }
            }
          }
        });
        st.otherRooms[id]=list;
      }
      return st.otherRooms[id];
    },
    async cabinets(owner, ids){
      const src = owner==='me' ? st.cabs : (st.otherCabs[owner]||{});
      return ids.flatMap(pid => (src[pid]||[]).map(x=>({...x, placement_id:pid})));
    },
    async cabPut(pid, code){
      const f = st.placed.find(p=>p.id===pid); if(!f || !CAPACITY[f.item_code]) fail('내 진열장이 아니에요');
      const it = item(code); if(!it || it.w!==1 || it.h!==1 || CAPACITY[code] || catOf(it)!=='accessory') fail('1칸짜리 소품만 올릴 수 있어요');
      if(!(st.inv[code]>0)) fail('가방에 없는 소품이에요');
      const arr = st.cabs[pid] ||= [];
      let slot = 0; while(arr.some(x=>x.slot===slot)) slot++;
      if(slot >= CAPACITY[f.item_code]) fail('진열장이 꽉 찼어요');
      st.inv[code]--; arr.push({placement_id:pid, slot, item_code:code}); persist();
    },
    async cabTake(pid, slot){
      const arr = st.cabs[pid]||[], k = arr.findIndex(x=>x.slot===slot); if(k<0) fail('빈 칸이에요');
      const [x] = arr.splice(k,1); st.inv[x.item_code]=(st.inv[x.item_code]||0)+1; persist();
    },
    async addRoom(name){
      const n = st.me.room_names.length; if(n>=MAX_ROOMS) fail('방은 4개까지 만들 수 있어요');
      const price = st.me.room_coupon>0 ? Math.floor(ROOM_PRICE(n)/2) : ROOM_PRICE(n); if(st.me.coins<price) fail('코인이 부족해요'); if(st.me.room_coupon>0) st.me.room_coupon--;
      st.me.coins-=price; st.me.room_names=[...st.me.room_names, name]; persist(); return st.me.coins;
    },
    async renameRoom(k, name){ st.me.room_names=[...st.me.room_names]; st.me.room_names[k]=name; persist(); },
    async house(id){
      const o = st.others.find(x=>x.discord_id===id);
      o.dex ??= 5+Math.floor(Math.random()*40);
      o.legs ??= GACHA_DEFAULT.filter(g=>g.gacha_rarity==='legend').filter(()=>Math.random()<.25).map(g=>g.code);
      return {room_blocks:o.blocks||0, room_names:o.rooms||['거실'], dex_have:o.dex, dex_total:GACHA_DEFAULT.length, legends:o.legs};
    },
    async buy(code){
      const it=item(code); if(!it || !it.active || !isLive(it)) fail('상점에 없는 가구예요');
      if(st.me.coins<it.price) fail('코인이 부족해요');
      st.me.coins-=it.price; st.inv[code]=(st.inv[code]||0)+1; persist(); return st.me.coins;
    },
    async sell(code){
      const sp = sellPrice(code); if(!sp) fail('상점 가구만 팔 수 있어요');
      if(!(st.inv[code]>0)) fail('가방에 없는 가구예요');
      st.inv[code]--; st.me.coins+=sp; persist(); return st.me.coins;
    },
    async sellMany(items){   // 🧺 [{code, qty}] — 하나라도 안 되면 아무것도 안 팔아요
      let add = 0;
      for(const {code,qty} of items){ const sp = sellPrice(code); if(!sp) fail('상점 가구만 팔 수 있어요');
        if(!(qty>0) || (st.inv[code]||0) < qty) fail(`${itemOf(code).name}${jo(itemOf(code).name,'이','가')} 가방에 모자라요`); add += sp*qty; }
      items.forEach(({code,qty})=>{ st.inv[code]-=qty; }); st.me.coins+=add; persist(); return st.me.coins;
    },
    async place(code,r,c,rot,room=0){
      const it=item(code); let w=it.w,h=it.h; if((rot||0)%2) [w,h]=[h,w];
      const cur=roomOf(st.me.total_minutes, st.me.room_blocks);
      if(!(st.inv[code]>0)) fail('가방에 없는 가구예요');
      if(!canPlaceIn(st.placed.filter(p=>(p.room||0)===room),r,c,w,h,cur,code)) fail(`여기엔 ${w}×${h}칸 자리가 없어요`);
      st.inv[code]--; st.placed.push({id:st.nextId++,item_code:code,r,c,w,h,room,rot:rot||0}); persist();
    },
    async setTint(id, t){
      const p = st.placed.find(x=>x.id===id); if(!p) fail('내 방에 깔린 러그가 아니에요');
      if(!isRug(p.item_code)) fail('러그만 색을 바꿀 수 있어요'); p.tint = t || null; persist();
    },
    async remove(id){
      const i=st.placed.findIndex(p=>p.id===id); if(i<0) fail('내 가구가 아니에요');
      const [p]=st.placed.splice(i,1); st.inv[p.item_code]=(st.inv[p.item_code]||0)+1;
      (st.cabs[p.id]||[]).forEach(x=>{ st.inv[x.item_code]=(st.inv[x.item_code]||0)+1; }); delete st.cabs[p.id]; persist();
    },
    async houseStyles(){ if(!st.hsOthers){ const ks = Object.keys(HOUSE_STYLES).filter(k=>!HOUSE_STYLES[k].limited); st.hsOthers = {}; st.others.forEach((o,i)=>{ if(i%2===0) st.hsOthers[o.discord_id] = ks[(i/2)%ks.length]; }); }
      return Object.entries(st.hsOthers).map(([discord_id, house_style])=>({discord_id, house_style})); },
    async buyHouseStyle(k){ st.me.house_styles = st.me.house_styles || ['basic']; if(st.me.house_styles.includes(k)) fail('이미 갖고 있는 스타일이에요');
      if(st.me.coins < STYLE_PRICE) fail('코인이 부족해요'); st.me.coins -= STYLE_PRICE; st.me.house_styles = [...st.me.house_styles, k]; st.me.house_style = k; persist(); return st.me.coins; },
    async setHouseStyle(k){ st.me.house_style = k; persist(); },
    async houseLooks(){ if(!st.looks){ st.looks = {}; st.others.forEach((o,i)=>{ if(i===2 && stageIdx(o.total_minutes)>1) st.looks[o.discord_id] = 1; }); }
      return Object.entries(st.looks).map(([discord_id, house_look])=>({discord_id, house_look})); },
    async setHouseLook(k){ st.looks = st.looks || {}; if(k!=null && (k<0 || k>=stageIdx(st.me.total_minutes))) fail('이미 지나온 집 모양만 고를 수 있어요');
      if(k==null) delete st.looks.me; else st.looks.me = k; persist(); },
    fstate(){ if(!st.fl){ const t = new Date().toISOString();
        st.fl = [{to:'dl',kind:'basket',at:t},{to:'dl',kind:'bouquet',at:t},{to:'dl',kind:'small',at:t},{to:'dl',kind:'small',at:t},{to:'dl',kind:'bouquet',at:t},
                 {to:'moon',kind:'small',at:t},{to:'moon',kind:'small',at:t},{to:'me',kind:'bouquet',at:t,from:'달빛작가',note:'오늘도 화이팅!',fresh:true}]; } },
    async sendFlowers(to, kind, note){ this.fstate(); const g = FLOWER_GIFTS.find(x=>x.kind===kind); if(!g) fail('없는 꽃이에요');
      if(to==='me') fail('우리 집에는 보낼 수 없어요'); if(st.me.coins<g.price) fail('코인이 부족해요');
      st.me.coins -= g.price; st.fl.push({to, kind, at:new Date().toISOString(), note}); persist(); return st.me.coins; },   // (미리보기: 이웃 코인은 따로 없어요)
    async flowersOn(){ this.fstate(); const by = {}; st.fl.filter(f=>Date.now()-new Date(f.at)<864e5).forEach(f=>{ const o = by[f.to] ||= {discord_id:f.to, small:0, bouquet:0, basket:0}; o[f.kind]++; }); return Object.values(by); },
    async flowerNotices(){ this.fstate(); return st.fl.filter(f=>f.to==='me' && f.fresh).map(f=>({sender:f.from||'이웃', kind:f.kind, note:f.note||null})); },
    async flowerNoticesSeen(){ st.fl.forEach(f=>{ f.fresh=false; }); },
    boardState(){ if(!st.board){ const h = 3600e3;
        st.board = [{id:3, discord_id:null, author:'담당자', body:'🔥 광장 모닥불 완공! 다 같이 벽돌을 나른 덕분이에요', kind:'news', created_at:new Date(Date.now()-30*h).toISOString()},
          {id:2, discord_id:'dl', author:'마감요정', body:'오늘 3화 마감 성공!! 다들 화이팅', kind:'post', created_at:new Date(Date.now()-2*h).toISOString()},
          {id:1, discord_id:'moon', author:'달빛작가', body:'철수네 집 송아지 2마리 태어남 (아님) 우리 집 고양이 들어옴', kind:'post', created_at:new Date(Date.now()-.3*h).toISOString()}];
        st.bid = 4;
        st.bans = [{id:1, discord_id:'moon', author:'달빛작가', body:'달빛작가 1권 완결 했어요!!', emoji:'🎊', ends_at:new Date(Date.now()+20*h).toISOString(), hearts:new Set(['dl','owl'])}];
        st.banId = 2; } },
    async board(){ this.boardState(); return st.board.map(p=>({...p, mine:p.discord_id==='me'})).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)); },
    async postBoard(body){ this.boardState(); const v=(body||'').trim().slice(0,BOARD_LEN); if(!v) fail('내용을 적어 주세요');
      st.board.push({id:st.bid++, discord_id:'me', author:st.me.display_name, body:v, kind:'post', created_at:new Date().toISOString()}); },
    async deleteBoard(id){ this.boardState(); st.board = st.board.filter(p=>p.id!==id); },
    async banners(){ this.boardState(); const n=Date.now(); return st.bans.filter(b=>new Date(b.ends_at)>n).map(b=>({id:b.id, author:b.author, author_id:b.discord_id, body:b.body, emoji:b.emoji, ends_at:b.ends_at, hearts:b.hearts.size, hearted:b.hearts.has('me'), mine:b.discord_id==='me'})).sort((a,b)=>b.id-a.id); },
    async hangBanner(body, emoji){ this.boardState(); const v=(body||'').trim().slice(0,BANNER_LEN); if(!v) fail('현수막에 적을 말을 적어 주세요');
      st.bans.push({id:st.banId++, discord_id:'me', author:st.me.display_name, body:v, emoji, ends_at:new Date(Date.now()+24*3600e3).toISOString(), hearts:new Set()}); persist(); return st.me.coins; },
    async heartBanner(id){ this.boardState(); const b=st.bans.find(x=>x.id===id); if(!b) fail('이미 내려간 현수막이에요');
      if(b.discord_id==='me') fail('내 현수막은 누를 수 없어요'); if(b.hearts.has('me')) fail('이미 하트를 눌렀어요');
      b.hearts.add('me'); st.me.coins += BANNER_HEART_COIN; persist(); return st.me.coins; },
    async deleteBanner(id){ this.boardState(); st.bans = st.bans.filter(b=>b.id!==id); },
    tick2(){
      const t = st.tree = st.tree || {no:1, color:['water','blossom','moon','gold','maple'][Math.floor(Math.random()*5)], goal:1800, reward:700, poured:1210, givers:new Set(['moon','dl','green','dawn','pencil']), mine:0};
      const m = st.me; if(m.dropMark==null){ m.dropMark = m.total_minutes; m.drops = m.drops||0; m.floatMark = Date.now(); m.floatWait = 4; m.floatToday = 0; }
      const w = Math.floor((m.total_minutes - m.dropMark)/TREE_WORK_MIN); if(w>0){ m.drops += w; m.dropMark += w*TREE_WORK_MIN; }
      const h = Math.floor((Date.now()-m.floatMark)/(15*60e3)); if(h>0){ m.floatWait = Math.min(TREE_FLOAT_MAX, TREE_FLOAT_DAY - m.floatToday, m.floatWait + h); m.floatMark += h*15*60e3; }   // (10-20) 미리보기는 15분마다 1개
      if(m.floatDay!==this.fday()){ m.floatDay = this.fday(); m.floatToday = 0; m.floatWait = 1 + Math.floor(Math.random()*2); }
      return t;
    },
    async tree(){ const t = this.tick2(), m = st.me;
      return {tree_no:t.no, color:t.color, goal:t.goal, poured:t.poured, reward:t.reward, givers:t.givers.size, my_poured:t.mine, drops:m.drops, float_wait:m.floatWait, float_today:m.floatToday}; },
    async catchDrop(){ this.tick2(); const m = st.me;
      if(m.floatToday>=TREE_FLOAT_DAY) fail('오늘은 물방울을 다 주웠어요. 새벽 12시에 다시 떠요');
      if(m.floatWait<1) fail('지금은 떠 있는 물방울이 없어요');
      m.floatWait--; m.floatToday++; m.drops++; m.coins += TREE_DROP_COIN; persist();
      return {drops:m.drops, coins:m.coins, float_wait:m.floatWait, float_today:m.floatToday}; },
    async pourDrops(n){ const t = this.tick2(), m = st.me;
      const amt = Math.min(n, m.drops, t.goal - t.poured); if(!(amt>=1)) fail('주머니에 물방울이 없어요');
      m.drops -= amt; t.poured += amt; t.mine += amt; t.givers.add('me'); let grown = false;
      if(st.isk){ const e = st.isk.eggs.find(x=>x.set_at); if(e) e.fed = Math.min(RIFT_NEED, e.fed + amt); }   // 🌀 맡긴 알 정화
      if(t.poured>=t.goal){ grown = true; if(t.mine>=TREE_REWARD_DROPS){ m.coins += t.reward; st.gifts.push({id:Date.now(), amount:t.reward, reason:'🌳 세계수가 다 자랐어요'}); }
        const cs = Object.keys(TREE_COLORS).filter(c=>c!==t.color);
        st.tree = {no:t.no+1, color:cs[Math.floor(Math.random()*cs.length)], goal:t.goal, reward:t.reward, poured:0, givers:new Set(), mine:0}; }
      persist(); return {poured:t.poured, goal:t.goal, drops:m.drops, grown}; },
    fday(){ return new Date(Date.now()+9*3600e3).toISOString().slice(0,10); },
    async fishing(){
      const lake = !!st.plaza.find(b=>b.code==='lake' && b.built_at);
      if(st.fday!==this.fday()){ st.fday=this.fday(); st.fused=0; st.fextra=0; }
      return {lake_open:lake, cast_at: st.net?new Date(st.net).toISOString():null,
        ready_in: st.net ? Math.max(0, Math.ceil((st.net + NET_WAIT_MIN*60e3 - Date.now())/1000)) : null, used: st.fused||0, extra: st.fextra||0};
    },
    async buyNet(){
      const s = await this.fishing(), k = s.extra;
      if(!s.lake_open) fail('광장에 호숫가가 지어지면 낚시할 수 있어요');
      if(k >= NET_EXTRA_PRICE.length) fail('오늘은 어망을 더 살 수 없어요. 새벽 12시에 다시 와요');
      if(s.used < HAUL_PER_DAY + k) fail('아직 오늘 걷을 어망이 남아 있어요');
      if(st.me.coins < NET_EXTRA_PRICE[k]) fail('코인이 부족해요');
      st.me.coins -= NET_EXTRA_PRICE[k]; st.fextra = k+1; persist(); return st.me.coins;
    },
    async fishDex(){ const d = st.fdex||{}; return FISH_DEFAULT.map(f=>({...f, have:!!d[f.code], caught:d[f.code]?d[f.code].caught:0, best_cm:d[f.code]?d[f.code].best:null})); },
    async fishPending(){ return (st.fpend||[]).slice(); },
    bstate(){ const d = this.fday(); st.bait = st.bait || {inv:{}, day:null, legendBought:0, net:null};
      if(st.bait.day!==d){ st.bait.day = d; st.bait.legendBought = 0; } return st.bait; },
    async baits(){ const B = this.bstate(); return {inv:{...B.inv}, legend_today:B.legendBought, in_net: st.net ? B.net : null}; },
    async buyBait(code){ const b = baitOf(code), B = this.bstate(); if(!b) fail('없는 미끼예요');
      if(b.daily && B.legendBought>=b.daily) fail('전설 미끼는 하루에 1개만 살 수 있어요');
      if(st.me.coins < b.price) fail('코인이 부족해요');
      st.me.coins -= b.price; B.inv[code] = (B.inv[code]||0)+1; if(b.daily) B.legendBought++; persist(); return st.me.coins; },
    async giveTreat(owner, petName, kind){ const t = TREATS.find(x=>x.kind===kind); if(!t) fail('없는 간식이에요');
      if(st.me.coins < t.price) fail('코인이 부족해요');
      st.me.coins -= t.price; st.treats = st.treats||{}; const k = this.fday()+'|'+owner+'|'+petName, first = !st.treats[k];
      st.treats[k] = (st.treats[k]||0)+1; persist(); return {coins:st.me.coins, first}; },
    async treatNotices(){ return []; },
    async treatNoticesSeen(){},
    async castNet(bait){
      const s = await this.fishing();
      if(!s.lake_open) fail('광장에 호숫가가 지어지면 낚시할 수 있어요');
      if(st.net) fail('어망이 이미 물에 들어가 있어요');
      if(s.used>=HAUL_PER_DAY+s.extra) fail('오늘 낚시는 끝났어요. 새벽 12시에 다시 와요');
      const B = this.bstate();
      if(bait){ if(!baitOf(bait)) fail('없는 미끼예요'); if(!(B.inv[bait]>0)) fail('그 미끼가 없어요'); B.inv[bait]--; }
      B.net = bait || null; st.net = Date.now(); persist();
    },
    async haulNet(){
      const s = await this.fishing();
      if(!st.net) fail('먼저 어망을 던져 주세요');
      if(s.ready_in>0) fail('아직 물고기가 안 들었어요. 조금만 더 기다려요');
      if(s.used>=HAUL_PER_DAY+s.extra) fail('오늘 낚시는 끝났어요. 새벽 12시에 다시 와요');
      const bait = this.bstate().net || 'none', rate = BAIT_RATE[bait] || BAIT_RATE.none; st.bait.net = null;
      st.net = null; st.fused = (st.fused||0)+1; st.fdex = st.fdex||{}; st.fpend = st.fpend||[]; st.fpid = st.fpid||1;
      const n = Math.random()<.4 ? 2 : 1, out = [];
      for(let i=0;i<n;i++){
        const x = Math.random()*100, tier = x<rate.legend?'legend':x<rate.legend+rate.rare?'rare':'common';
        const pool = FISH_DEFAULT.filter(f=>f.tier===tier), f = pool[Math.floor(Math.random()*pool.length)];
        const lo = bait==='chubby' ? BAIT_MIN_UP : 0, size = Math.round((f.min_cm + (f.max_cm-f.min_cm)*(lo + (1-lo)*Math.pow(Math.random(),1.6)))*10)/10;
        const d = st.fdex[f.code], kind = !d ? 'new' : size>d.best ? 'record' : 'normal', reward = FISH_REWARD[tier][kind];
        st.fdex[f.code] = {caught:(d?d.caught:0)+1, best:Math.max(d?d.best:0, size)};
        let pending_id = null;
        if(tier==='legend'){ pending_id = st.fpid++; st.fpend.push({id:pending_id, fish:f.code, size_cm:size, reward}); }
        else st.me.coins += reward;
        out.push({fish:f.code, size_cm:size, kind, reward, pending_id, coins:st.me.coins});
      }
      persist(); return out;
    },
    async resolveLegend(id, tribute){
      const k = (st.fpend||[]).findIndex(p=>p.id===id); if(k<0) fail('이미 정한 물고기예요');
      const p = st.fpend.splice(k,1)[0];
      if(tribute){ const c = TRIBUTE[p.fish]; st.inv[c] = (st.inv[c]||0)+1; } else st.me.coins += p.reward;
      persist(); return {coins:st.me.coins, item: tribute ? TRIBUTE[p.fish] : null};
    },
    async fishBest(id){
      const o = st.others.find(x=>x.discord_id===id); if(!o) return null;
      if(o.fishBest===undefined){ const f = FISH_DEFAULT.filter(f=>f.tier!=='legend')[Math.floor(Math.random()*26)];
        o.fishBest = Math.random()<.7 ? {fish:f.code, best_cm:Math.round((f.min_cm+(f.max_cm-f.min_cm)*Math.random())*10)/10, have:3+Math.floor(Math.random()*12)} : null; }
      return o.fishBest;
    },
    gview(plots, minutes){
      return plots.map(x=>{ const f = FLOWERS_DEFAULT.find(z=>z.code===x.flower), g = Math.max(0, minutes-x.planted), need = GTIER[f.tier].grow;
        const stage = g>=need ? 'bloom' : g>=GARDEN_BUD ? 'bud' : g>=GARDEN_SPROUT ? 'sprout' : 'seed';
        return {slot:x.slot, grown:g, stage, hint: stage==='bud'||stage==='bloom' ? f.hint : null, flower: stage==='bloom' ? f.code : null, tier: stage==='bloom' ? f.tier : null}; });
    },
    roll(){ const x = Math.random()*100, t = x<GTIER_RATE.secret ? 'secret' : x<GTIER_RATE.secret+GTIER_RATE.garden ? 'garden' : 'wild';
      const pool = FLOWERS_DEFAULT.filter(f=>f.tier===t); return pool[Math.floor(Math.random()*pool.length)].code; },
    async garden(id){
      if(id==='me') return this.gview(st.garden, st.me.total_minutes);
      const o = st.others.find(x=>x.discord_id===id); if(!o) return [];
      if(!o.garden){ const n = gardenSlots(o.total_minutes); o.garden = [];
        for(let k=0;k<n;k++) if(Math.random()<.75) o.garden.push({slot:k, flower:this.roll(), planted:o.total_minutes-Math.floor(Math.random()*700)}); }
      return this.gview(o.garden, o.total_minutes);
    },
    async gardenDex(){ return FLOWERS_DEFAULT.map(f=>({...f, have:!!st.gdex[f.code], harvested:st.gdex[f.code]||0})); },
    async buySeeds(n){
      if(!st.plaza.find(b=>b.code==='florist' && b.built_at)) fail('광장에 꽃집이 지어져야 씨앗을 살 수 있어요');
      if(st.me.coins < n*SEED_PRICE) fail('코인이 부족해요');
      st.me.coins -= n*SEED_PRICE; st.me.seeds = (st.me.seeds||0)+n; persist(); return st.me.coins;
    },
    async plant(slot){
      if(slot<0 || slot>=gardenSlots(st.me.total_minutes)+(st.me.garden_bonus||0)) fail('아직 열리지 않은 화단이에요');
      if(st.garden.some(x=>x.slot===slot)) fail('이미 뭔가 자라고 있어요');
      if(!((st.me.seeds||0)>0)) fail('씨앗이 없어요');
      st.me.seeds--; st.garden.push({slot, flower:this.roll(), planted:st.me.total_minutes}); persist();
    },
    async harvest(slot){
      const k = st.garden.findIndex(x=>x.slot===slot); if(k<0) fail('빈 화단이에요');
      const x = st.garden[k], f = FLOWERS_DEFAULT.find(z=>z.code===x.flower), t = GTIER[f.tier];
      if(st.me.total_minutes - x.planted < t.grow) fail('아직 덜 자랐어요');
      st.garden.splice(k,1); const is_new = !st.gdex[f.code]; st.gdex[f.code] = (st.gdex[f.code]||0)+1;
      st.me.coins += t.reward; persist(); return {flower:f.code, reward:t.reward, is_new, coins:st.me.coins};
    },
    pstate(){ if(!st.pt){ st.pt = {slots:1, dex:[], pets:[], nid:1, traces:0};
        const kinds = ['shiba','black','fox','penguin','bunny','bichon','dragon'];
        st.others.forEach((o,i)=>{ if(i%3!==2) o.pet = {pet_code:kinds[i%kinds.length], name:petOf(kinds[i%kinds.length]).name, level:[2,6,1,7,3,5,8][i%7], sad:o.away>=PET_SAD_DAYS}; }); }
      const t = this.fday(); st.pt.pets.forEach(p=>{ if(p.day!==t){ p.day=t; p.fed=p.patted=p.played=0; } }); return st.pt; },
    shelterBuilt(){ return !!st.plaza.find(b=>b.code==='shelter' && b.built_at); },
    async pets(){ const P = this.pstate(); return {open:this.shelterBuilt(), slots:P.slots, traces:P.traces||0, dex:P.dex.slice(), pets:P.pets.map(p=>({...p}))}; },
    async openPetDex(code){ const P = this.pstate(), s = petOf(code), price = PET_TIER[s.tier].open;
      if(s.tier==='fairy'){ if(!this.shelterBuilt()) fail('광장에 동물 보호소가 지어지면 열 수 있어요'); if(P.dex.includes(code)) fail('이미 열린 칸이에요'); if(!(P.traces>0)) fail('요정의 흔적이 있어야 열 수 있어요'); P.traces--; P.dex.push(code); persist(); return st.me.coins; }
      if(!this.shelterBuilt()) fail('광장에 동물 보호소가 지어지면 열 수 있어요'); if(P.dex.includes(code)) fail('이미 열린 칸이에요');
      if(st.me.coins<price) fail('코인이 부족해요'); st.me.coins-=price; P.dex.push(code); persist(); return st.me.coins; },
    async adoptPet(code, name){ const P = this.pstate(), s = petOf(code), price = PET_TIER[s.tier].adopt;
      if(!P.dex.includes(code)) fail('먼저 도감 칸을 열어 주세요'); const lodge = P.pets.filter(x=>!x.lodge).length>=P.slots;   // 마당이 꽉 차면 숙소로 (10-13)
      if(st.me.coins<price) fail('코인이 부족해요'); st.me.coins-=price;
      P.pets.push({id:P.nid++, code, name:(name||s.name).slice(0,10), affection:0, last_cared:new Date().toISOString(), fed:0, patted:0, played:0, day:this.fday(), event_at:new Date().toISOString(), lodge}); persist(); return st.me.coins; },
    async lodgePet(id, inLodge){ const P = this.pstate(), p = P.pets.find(x=>x.id===id); if(!p) fail('내 펫이 아니에요');
      if(!inLodge && p.lodge && P.pets.filter(x=>!x.lodge).length>=P.slots) fail('마당이 꽉 찼어요. 먼저 다른 친구를 숙소에 보내 주세요');
      p.lodge = !!inLodge; if(inLodge && P.main===id) P.main = null; if(!inLodge) p.last_cared = new Date().toISOString(); persist(); },
    async buyPetSlot(){ const P = this.pstate(); if(P.slots>=PET_MAX) fail(`펫은 ${PET_MAX}마리까지 키울 수 있어요`);
      const price = PET_SLOT_PRICE[P.slots]; if(st.me.coins<price) fail('코인이 부족해요'); st.me.coins-=price; P.slots++; persist(); return st.me.coins; },
    async carePet(id, kind){ const P = this.pstate(), p = P.pets.find(x=>x.id===id), c = PET_CARE[kind]; if(!p) fail('내 펫이 아니에요'); if(p.lodge) fail('숙소에 있는 친구는 마당으로 데려와야 돌볼 수 있어요');
      if((p[c.key]||0)>=c.max) fail('오늘은 충분히 했어요. 새벽 12시에 다시 할 수 있어요');
      const o = petLevel(p.affection); p[c.key]=(p[c.key]||0)+1; p.affection+=c.gain; p.last_cared=new Date().toISOString();
      const n = petLevel(p.affection), reward = n>o ? n*20 : 0, trace = o<10 && n>=10; st.me.coins+=reward; if(trace) P.traces=(P.traces||0)+1; persist();
      return {affection:p.affection, level:n, level_up:n>o, reward, coins:st.me.coins, trace}; },
    async petEvent(id, choice){ const P = this.pstate(), p = P.pets.find(x=>x.id===id); if(!p) fail('내 펫이 아니에요'); if(p.lodge) fail('숙소에 있는 친구는 마당으로 데려와야 산책할 수 있어요');
      if(new Date(p.event_at)>Date.now()) fail('아직 산책 갈 시간이 아니에요');
      const r = Math.random(), lv = petLevel(p.affection), pool = ['letter','envelope','ribbon','yarn','socks','mapleleaf']; let out;
      if(choice===0) out = r<.7?{kind:'seeds',amount:1+Math.floor(Math.random()*2)}: r<.95?{kind:'coins',amount:20}:{kind:'item',item:'clover'};
      else if(choice===1) out = r<.7?{kind:'stars',amount:2+Math.floor(Math.random()*3)}: r<.95?{kind:'coins',amount:30}:{kind:'item',item:'turtle'};
      else out = r<.8?{kind:'coins',amount:15+Math.floor(Math.random()*46)}: r<.97?{kind:'item',item:pool[Math.floor(Math.random()*pool.length)]}:{kind:'coins',amount:200};
      if(out.kind==='coins'){ out.amount += lv*2; st.me.coins += out.amount; }
      else if(out.kind==='seeds') st.me.seeds = (st.me.seeds||0)+out.amount;
      else if(out.kind==='stars') st.me.stars = (st.me.stars||0)+out.amount;
      else { st.inv[out.item] = (st.inv[out.item]||0)+1; st.coll.add(out.item); }
      let tr = (Math.random()<0.02?1:0) + (lv<10 && petLevel(p.affection+2)>=10 ? 1 : 0); if(tr) P.traces=(P.traces||0)+tr; out.trace = tr;
      p.affection += 2; p.last_cared = new Date().toISOString(); p.event_at = new Date(Date.now()+PET_EVENT_HOURS*3600e3).toISOString(); persist();
      return {...out, coins:st.me.coins}; },
    async renamePet(id, name){ const p = this.pstate().pets.find(x=>x.id===id); if(p) p.name = name.slice(0,10); persist(); },
    async petsOn(){ const P = this.pstate(), out = st.others.filter(o=>o.pet && !o.removed).map(o=>({discord_id:o.discord_id, ...o.pet}));
      const yp = P.pets.filter(x=>!x.lodge), mp = yp.find(x=>x.id===P.main) || yp[0];
      if(mp) out.push({discord_id:'me', pet_code:mp.code, name:mp.name, sad:petMood(mp)==='sad', level:petLevel(mp.affection)}); return out; },
    async mainPet(){ const P = this.pstate(), yp = P.pets.filter(x=>!x.lodge), mp = yp.find(x=>x.id===P.main) || yp[0]; return mp ? mp.id : null; },
    async setMainPet(id){ const P = this.pstate(); if(!P.pets.some(x=>x.id===id && !x.lodge)) fail('마당에 있는 친구만 대표로 정할 수 있어요'); P.main = id; persist(); },
    async petBabies(){ const P = this.pstate(); return P.pets.filter(x=>x.baby).map(x=>({id:x.id, discord_id:'me', pet_code:x.code, name:x.name})); },
    async setPetBaby(id, v){ const P = this.pstate(), x = P.pets.find(y=>y.id===id); if(!x) fail('내 펫이 아니에요'); x.baby = !!v; persist(); },
    async petsOf(id){ this.pstate(); const o = st.others.find(x=>x.discord_id===id); return o && o.pet ? [{...o.pet}] : []; },
    // 🗺️ 숲 산책 (10-13) — 미리보기는 이 브라우저에만 저장
    wstate(){ let w; try{ w = JSON.parse(localStorage.getItem('majam-demo-walk2')||'null'); }catch(e){} return w || {char:'w1', hair:'#4A3226', top:'#9EE0CC', bot:'#5A78A8'}; },
    async walkMine(){ return this.wstate(); },
    async walkSetLook(l){ try{ localStorage.setItem('majam-demo-walk2', JSON.stringify({char:l.char, hair:l.hair, top:l.top, bot:l.bot})); }catch(e){} },
    // ❄️ 겨울 행사 (10-20) — 미리보기는 이 브라우저에만 저장
    wstate(){ if(!st.winter) st.winter = {total:0, mine:0, after:0, got:[], force:false}; return st.winter; },
    async winter(){ const W = this.wstate(), lib = st.plaza.find(b=>b.code==='library'), goal = 30000;
      let start = null;
      if(W.force) start = Date.now() - 1000;
      else if(lib && lib.built_at){ const k = new Date(new Date(lib.built_at).getTime() + 9*3600e3); k.setUTCHours(0,0,0,0); start = k.getTime() + 864e5 - 9*3600e3; }
      const state = start==null ? 'wait' : Date.now() < start ? 'soon' : 'open';
      return {code:'winter26', goal, state, starts_at: start && new Date(start).toISOString(), ends_at:'2027-01-01T00:00:00+09:00',
        total:W.total, givers: W.total ? 1 + Math.floor(W.total/2500) : 0, tiers:[.25,.5,.75,1].filter(f=>W.total >= Math.ceil(goal*f)).length,
        revealed: W.total >= goal, my_total:W.mine, my_after:W.after, need:{plate:100, style:1000, after:500}, got:[...W.got]}; },
    async giveWinter(n){ const W = this.wstate(), w = await this.winter(); if(w.state!=='open') fail('지금은 겨울 행사 기간이 아니에요');
      if(!(n>=1)) fail('1코인 이상 보내 주세요'); if(st.me.coins < n) fail('코인이 부족해요');
      st.me.coins -= n; const before = W.total; W.total += n; W.mine += n; W.after += Math.max(0, Math.min(n, before + n - 30000));
      const fresh = [];
      if(W.mine >= 100 && !W.got.includes('plate')){ W.got.push('plate'); st.me.nameplates = [...new Set([...(st.me.nameplates||['wood']), 'snow'])]; fresh.push('plate'); }
      if(W.mine >= 1000 && !W.got.includes('style')){ W.got.push('style'); st.me.house_styles = [...new Set([...(st.me.house_styles||['basic']), 'winter26'])]; fresh.push('style'); }
      if(W.after >= 500 && !W.got.includes('pet')){ W.got.push('pet'); const P = this.pstate(); if(!P.dex.includes('icefairy26')) P.dex.push('icefairy26');
        P.pets.push({id:P.nid++, code:'icefairy26', name:'얼음 요정', affection:0, last_cared:new Date().toISOString(), fed:0, patted:0, played:0, day:this.fday(), event_at:new Date().toISOString(), lodge: P.pets.filter(x=>!x.lodge).length >= P.slots}); fresh.push('pet'); }
      persist(); return {coins:st.me.coins, total:W.total, my_total:W.mine, my_after:W.after, new:fresh}; },
    async setNameplate(k){ if(k!=='wood' && !(st.me.nameplates||[]).includes(k)) fail('아직 없는 이름표예요'); st.me.nameplate = k; persist(); },
    async nameplates(){ return (st.winter && st.winter.total >= 100) ? st.others.filter((o,i)=>i%3===1).map(o=>({discord_id:o.discord_id, nameplate:'snow'})) : []; },
    // 🌸 꽃 전시 (10-14 ⑤) — 미리보기는 이 브라우저에만 저장
    fsget(){ try{ return JSON.parse(localStorage.getItem('majam-demo-fshow')||'[]'); }catch(e){ return []; } },
    fsset(a){ try{ localStorage.setItem('majam-demo-fshow', JSON.stringify(a)); }catch(e){} },
    async flowerShowMine(){ return this.fsget().map(c=>({code:c, harvested:st.gdex[c]||0})); },
    async flowerShowOf(id){ const o = st.others.find(x=>x.discord_id===id); if(!o) return [];
      const k = [...String(id)].reduce((a,c)=>a+c.charCodeAt(0),0), pool = FLOWERS_DEFAULT.filter((f,i)=>(i+k)%5===0).slice(0, 3+k%6);
      return pool.map(f=>({code:f.code, harvested:FSHOW_NEED[f.tier]+k%9})); },
    async flowerShowAdd(code){ const a = this.fsget(), f = FLOWERS_DEFAULT.find(x=>x.code===code), n = st.gdex[code]||0;
      if(!f) fail('없는 꽃이에요'); if(a.includes(code)) fail('이미 전시 중이에요'); if(a.length>=FSHOW_MAX) fail(`전시대에는 ${FSHOW_MAX}송이까지 놓을 수 있어요`);
      if(n < FSHOW_NEED[f.tier]) fail(`${f.name}${jo(f.name,'은','는')} ${FSHOW_NEED[f.tier]}번 수확하면 전시할 수 있어요`);
      a.push(code); this.fsset(a); },
    async flowerShowRemove(code){ this.fsset(this.fsget().filter(c=>c!==code)); },
    // 🐠 어항 (10-13) — 미리보기는 이 브라우저에만 저장
    tstate(){ let t; try{ t = JSON.parse(localStorage.getItem('majam-demo-tank')||'null'); }catch(e){} return t || {skin:'sand', skins:['sand'], fish:[]}; },
    tsave(t){ try{ localStorage.setItem('majam-demo-tank', JSON.stringify(t)); }catch(e){} },
    async tankMine(){ const t = this.tstate(), d = st.fdex||{}; return {skin:t.skin, skins:t.skins.slice(), fish:t.fish.map(c=>({code:c, caught:d[c]?d[c].caught:0, best_cm:d[c]?d[c].best:null}))}; },
    async tankOf(id){ const o = st.others.find(x=>x.discord_id===id); if(!o) return {skin:'sand', fish:[]};
      const k = [...String(id)].reduce((a,c)=>a+c.charCodeAt(0),0), pool = FISH_DEFAULT.filter((f,i)=>(i+k)%4===0).slice(0, 2+k%5);
      return {skin: k%2 ? 'castle' : 'sand', fish: pool.map(f=>({code:f.code, caught:TANK_NEED[f.tier]+k%7, best_cm:Math.round((f.min_cm+(f.max_cm-f.min_cm)*.7)*10)/10}))}; },
    async tankAdd(code){ const t = this.tstate(), f = FISH_DEFAULT.find(x=>x.code===code), d = (st.fdex||{})[code];
      if(!f) fail('없는 물고기예요'); if(t.fish.includes(code)) fail('이미 어항에 있어요'); if(t.fish.length>=TANK_MAX) fail(`어항에는 ${TANK_MAX}마리까지 넣을 수 있어요`);
      if(!d || d.caught < TANK_NEED[f.tier]) fail(`${f.name}${jo(f.name,'은','는')} ${TANK_NEED[f.tier]}번 잡으면 넣을 수 있어요`);
      t.fish.push(code); this.tsave(t); },
    async tankRemove(code){ const t = this.tstate(); t.fish = t.fish.filter(c=>c!==code); this.tsave(t); },
    async tankBuySkin(code){ const t = this.tstate(), k = TANK_SKINS.find(x=>x.code===code); if(!k) fail('없는 어항이에요'); if(t.skins.includes(code)) fail('이미 있는 어항이에요');
      if(st.me.coins<k.price) fail('코인이 부족해요'); st.me.coins-=k.price; persist(); t.skins.push(code); t.skin = code; this.tsave(t); return st.me.coins; },
    async tankSetSkin(code){ const t = this.tstate(); if(!t.skins.includes(code)) fail('먼저 어항을 사 주세요'); t.skin = code; this.tsave(t); },
    async finishTour(){ if(st.me.tour_done) return st.me.coins; st.me.tour_done = true; st.me.coins += TOUR_GIFT; persist(); return st.me.coins; },
    async logTab(t){ st.tabStat = st.tabStat || {}; const d = this.fday(); (st.tabStat[d] ||= {})[t] = (st.tabStat[d][t]||0)+1; },
    async tabStats(days){   // 미리보기용 가짜 기록 + 이 브라우저에서 연 것
      const out = [], base = {enter:14,village:13,home:9,road:3,plaza:6,lotto:8,tree:5,lake:7,pet:4,gacha:6,shop:5,mail:7,coinlog:2,visit:4};
      for(let k=0;k<days;k++){ const d = new Date(Date.now()+9*3600e3-k*864e5).toISOString().slice(0,10);
        Object.entries(base).forEach(([t,n])=>{ const v = Math.max(0, Math.round(n*(.6+((k*7+t.length*3)%9)/10))) + (((st.tabStat||{})[d]||{})[t]||0); if(v) out.push({d, tab_name:t, cnt:v}); }); }
      return out;
    },
    async adminList(){
      return st.others.filter(o=>!o.removed).map(o=>({discord_id:o.discord_id, display_name:o.display_name, total_minutes:o.total_minutes, in_voice:o.in_voice, away_days:o.in_voice?0:o.away})).sort((a,b)=>b.away_days-a.away_days);
    },
    async paint(k){
      if(st.me.house_color===k) fail('이미 그 색이에요');
      if(st.me.coins<PAINT_PRICE) fail('코인이 부족해요');
      st.me.coins-=PAINT_PRICE; st.me.house_color=k; persist();
    },
    async adminGift(id, amount, reason){
      if(id==='me'){ st.me.coins+=amount; st.gifts.push({id:Date.now(), amount, reason}); persist(); }
    },
    async adminGiftAll(amount, reason){ st.me.coins+=amount; st.gifts.push({id:Date.now(), amount, reason}); persist(); return st.others.length + 1; },
    async myGifts(){ return st.gifts.splice(0); },
    async streak(){ st.stk ??= {streak:4, best:9, today_done:false}; return {...st.stk}; },
    streakTick(){   // 미리보기: 오늘 처음 작업실 시간이 쌓이면 출석
      st.stk ??= {streak:4, best:9, today_done:false}; if(st.stk.today_done) return;
      const n = st.stk.streak + 1, g = 2*((n-1)%14); st.stk = {streak:n, best:Math.max(st.stk.best,n), today_done:true};
      if(g>0){ st.me.coins += g; st.gifts.push({id:Date.now(), amount:g, reason:`🔥 연속 출석 ${n}일째`}); }
    },
    async coinLog(){   // 미리보기용 가짜 내역
      const now = Date.now(), h = 3600e3, d = 24*h; let bal = Math.max(st.me.coins, 1500);
      const rows = [[0.2*h,'🎧 작업실 적립',42],[0.5*h,'🎁 보따리 열기',-450],[2*h,'🎣 낚시',60],[3*h,'💐 꽃 받기',2],[5*h,'🛒 상점에서 사기',-220],
        [d+2*h,'🎧 작업실 적립',185],[d+4*h,'🧱 광장에 벽돌 보내기',-100],[d+5*h,'🌸 꽃 수확',100],[d+7*h,'💧 물방울 줍기',40],[2*d+3*h,'🎉 축하 코인',100],[2*d+6*h,'🎧 작업실 적립',230]];
      return rows.map(([ago,reason,delta])=>{ const r = {delta, balance:bal, reason, created_at:new Date(now-ago).toISOString(), day:new Date(now-ago+9*h).toISOString().slice(0,10)}; bal -= delta; return r; });
    },
    async raidStatus(){
      const today = new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'});
      if(st.raidDay!==today){ st.raidDay=today; st.raidOwners=[]; }
      return {used: st.raidOwners.length, owners: st.raidOwners.slice()};
    },
    async raid(owner){
      const s0 = await this.raidStatus();
      if(owner==='me') fail('우리 집은 서리할 수 없어요');
      if(s0.used>=RAID_PER_DAY) fail('오늘 서리는 다 했어요');
      if(s0.owners.includes(owner)) fail('오늘은 이 집 마당을 이미 다녀왔어요');
      st.raidOwners.push(owner);
      const success = Math.random()<.5, amount = success ? 1+Math.floor(Math.random()*5) : 0;
      st.me.coins += amount; persist();
      return {success, amount, coins: st.me.coins};
    },
    async raidNotices(){ return st.raidNotes.splice(0); },
    async raidSeen(){},
    async events(){ const n=Date.now(); st.events=st.events.filter(e=>new Date(e.ends_at)>n); return st.events.slice().sort((a,b)=>new Date(a.starts_at)-new Date(b.starts_at)); },
    async addEvent(name,mult,start,end){ st.events.push({id:st.evId++, name, multiplier:mult, starts_at:start, ends_at:end}); },
    async deleteEvent(id){ st.events=st.events.filter(e=>e.id!==id); },
    async sendNote(cat, body){ st.notes.unshift({id:st.noteId++, discord_id:'me', category:cat, body, created_at:new Date().toISOString(), read:false, members:{display_name:st.me.display_name}}); },
    async notes(){ return st.notes.slice(); },
    async readNote(id){ const n=st.notes.find(x=>x.id===id); if(n) n.read=true; },
    async deleteNote(id){ st.notes=st.notes.filter(x=>x.id!==id); },
    async giftsSeen(){},
    async adminClear(id){ const o=st.others.find(x=>x.discord_id===id); o.removed=true; o.justRemoved=true; o.in_voice=false; },
    // 🎟️ 복권
    lstate(){ st.lotto = st.lotto || {day:'', n:0, dex:[]}; if(st.lotto.day!==this.fday()){ st.lotto.day = this.fday(); st.lotto.n = 0; } return st.lotto; },
    lweek(){ const wk = Math.floor((Date.now() - Date.parse('2026-10-09T00:00:00+09:00'))/604800e3), cyc = Math.max(1, Math.ceil(LOTTO_FURN.length/LOTTO_WEEK_N)), c = Math.floor(wk/cyc), k = wk%cyc;
      const h = t => { let x = 2166136261; for(const ch of t){ x ^= ch.charCodeAt(0); x = Math.imul(x, 16777619); } return x>>>0; };
      return LOTTO_FURN.map(x=>x.code).sort((a,b)=>h(a+':'+c)-h(b+':'+c)).slice(k*LOTTO_WEEK_N, (k+1)*LOTTO_WEEK_N); },
    async lotto(){ const L = this.lstate(); return {plays_today:L.n, week:this.lweek(), dex:[...L.dex], free:st.lfree||0, limit:LOTTO_PER_DAY+(st.me.lotto_bonus||0)}; },
    async playLottoFree(){ const L = this.lstate(); if(!(st.lfree>0)) fail('공짜 복권이 없어요. 산책로에서 주워 보세요!');
      st.lfree--; const n0 = L.n, lim = LOTTO_PER_DAY+(st.me.lotto_bonus||0); if(L.n>=lim) L.n = lim-1; st.me.coins += LOTTO_PRICE;
      const r = await this.playLotto(); L.n = n0; persist(); return {...r, plays_today:n0, free:st.lfree, is_free:true}; },
    // 🗺️ 산책로 분실물 (미리보기: 2분마다 1개)
    wlstate(){ const now = Date.now();
      st.wloot = st.wloot || {items:[], last: now - 3*120e3, n:1, day:'', today:0};
      const W = st.wloot; if(W.day!==this.fday()){ W.day = this.fday(); W.today = 0; }
      const k = Math.floor((now - W.last)/120e3);
      if(k>0){ for(let i=0;i<Math.min(k, WLOOT_MAX - W.items.filter(x=>!x.bonus).length);i++){ const [x,y] = wlootSpot(W.items); W.items.push({id:W.n++, x, y, look:WLOOT_LOOKS[Math.floor(Math.random()*WLOOT_LOOKS.length)]}); } W.last += k*120e3; }
      return W; },
    async adminLootDrop(n, x, y){ const W = this.wlstate(); n = Math.max(1, Math.min(30, n|0));
      for(let i=0;i<n;i++){ let p; if(x==null) p = wlootSpot(W.items); else { for(let t=0;t<40;t++){ p = [Math.max(4,Math.min(96,+(x+Math.random()*20-10).toFixed(1))), Math.max(16,Math.min(94,+(y+Math.random()*16-8).toFixed(1)))]; if(!WALK_PLOTS.some(([px,py])=>Math.abs(p[0]-px)<10.5 && p[1]>py-17 && p[1]<py+7)) break; } }
        W.items.push({id:W.n++, x:p[0], y:p[1], look:WLOOT_LOOKS[Math.floor(Math.random()*WLOOT_LOOKS.length)], bonus:true}); }
      persist(); return n; },
    async walkLoot(){ const W = this.wlstate(); return {items:W.items.map(x=>({...x})), today:W.today, max:WLOOT_DAY, next_at:new Date(W.last+120e3).toISOString()}; },
    async walkLootPick(id, x, y){ const W = this.wlstate();
      const l = W.items.find(i=>i.id===id); if(!l) fail('앗, 다른 작가님이 먼저 주워 갔어요!');
      if(!l.bonus && W.today>=WLOOT_DAY) fail(`오늘은 분실물을 다 주웠어요 (하루 ${WLOOT_DAY}개). 새벽 12시에 다시 주울 수 있어요`);
      if(Math.abs(x-l.x)>7 || Math.abs(y-l.y)>10) fail('조금 더 가까이 가서 주워 주세요');
      const r = Math.random(); let kind, amount;
      if(r<.47){ kind='coin'; amount=10+Math.floor(Math.random()*31); } else if(r<.67){ kind='drop'; amount=wlootMany(); } else if(r<.82){ kind='ticket'; amount=wlootMany(); } else if(r<.95){ kind='lotto'; amount=1; } else if(r<.98){ kind='bait'; amount=1; } else { kind='jackpot'; amount=100; }
      if(kind==='bait'){ st.bait = st.bait || {inv:{}, day:null, legendBought:0, net:null}; st.bait.inv = st.bait.inv || {}; st.bait.inv.legend = (st.bait.inv.legend||0)+1; }
      if(kind==='drop') st.me.drops = (st.me.drops||0)+amount;
      if(kind==='lotto') st.lfree = (st.lfree||0)+1;
      if(kind==='ticket'){ const B = this.bossState(); if(B.dmg<B.max_hp) B.tickets += amount; else { kind='ticketcoin'; amount=20; } }
      if(['coin','jackpot','ticketcoin'].includes(kind)) st.me.coins += amount;
      W.items = W.items.filter(i=>i.id!==id); if(!l.bonus) W.today++; persist();
      return {kind, amount, look:l.look, coins:st.me.coins, today:W.today}; },
    async playLotto(){ const L = this.lstate();
      if(L.n>=LOTTO_PER_DAY+(st.me.lotto_bonus||0)) fail('오늘 복권은 다 긁었어요. 새벽 12시에 다시 채워져요');
      if(st.me.coins<LOTTO_PRICE) fail('코인이 부족해요');
      L.n++; st.me.coins -= LOTTO_PRICE; const paid = st.me.coins;
      const r = Math.random()*100; let kind = 'miss', amount = 0, item = null, dup = false;
      if(r<5) kind='furn'; else if(r<8){ kind='x10'; amount=300; } else if(r<14){ kind='x5'; amount=150; } else if(r<27){ kind='back'; amount=30; }
      else if(r<37){ kind='stars'; amount=2; } else if(r<46){ kind='seed'; amount=1; } else if(r<53){ kind='bait'; amount=1; }
      if(kind==='furn'){ const w = this.lweek(); item = w[Math.floor(Math.random()*w.length)];
        if(L.dex.includes(item)){ dup = true; amount = LOTTO_DUP_COIN; } else { L.dex.push(item); st.inv[item] = (st.inv[item]||0)+1; } }
      if(['x10','x5','back'].includes(kind) || dup) st.me.coins += amount;
      if(kind==='stars') st.me.stars = (st.me.stars||0)+amount;
      if(kind==='seed') st.me.seeds = (st.me.seeds||0)+amount;
      if(kind==='bait'){ st.bait = st.bait || {inv:{}, day:null, legendBought:0, net:null}; st.bait.inv.shiny = (st.bait.inv.shiny||0)+1; }
      persist(); return {kind, amount, item, dup, coins:st.me.coins, coins_paid:paid, plays_today:L.n}; },
    // ☕ 광장 간식차 (10-12 밤)
    tlive(){ const now = Date.now(); st.truckDone = [...(st.truckDone||[]), ...(st.trucks||[]).filter(t=>Date.parse(t.ends_at)<=now)]; st.trucks = (st.trucks||[]).filter(t=>Date.parse(t.ends_at)>now); return st.trucks; },
    async truckReport(){ this.tlive(); const mine = (st.truckDone||[]).filter(t=>t.caller==='me' && !t.reported); mine.forEach(t=>t.reported=true); persist(); return mine.map(t=>({kind:t.kind, ends_at:t.ends_at, n:t.claims.length})); },
    async trucks(){ return this.tlive().map(t=>({id:t.id, kind:t.kind, caller_name:t.caller_name, ends_at:t.ends_at, claimers:t.claims.map(c=>c.name), my_reward:(t.claims.find(c=>c.id==='me')||{}).reward ?? null})); },
    async callTruck(kind){
      if(!TRUCK_KIND[kind]) fail('없는 차예요');
      if(this.tlive().some(t=>t.kind===kind)) fail(`${TRUCK_KIND[kind].name}가 이미 광장에 와 있어요`);
      if(st.me.coins < TRUCK_KIND[kind].price) fail('코인이 부족해요');
      st.me.coins -= TRUCK_KIND[kind].price;
      const t = {id:Date.now(), kind, caller:'me', caller_name:st.me.display_name, ends_at:truckMidnight(), claims:[]};
      (st.others||[]).filter(o=>!o.removed).slice(0,2).forEach(o=>t.claims.push({id:o.discord_id, name:o.display_name, reward:kind==='coffee'?TRUCK_COFFEE:20}));
      st.trucks = [...this.tlive(), t]; persist(); return {coins:st.me.coins};
    },
    async claimTruck(id){
      const t = this.tlive().find(x=>x.id===id); if(!t) fail('차가 벌써 떠났어요');
      if(t.claims.some(c=>c.id==='me')) fail('오늘은 이미 받았어요');
      const reward = t.kind==='coffee' ? TRUCK_COFFEE : dessertRoll();
      t.claims.push({id:'me', name:st.me.display_name, reward}); st.me.coins += reward; persist();
      return {reward, coins:st.me.coins};
    },
    // ⚔️ 이번 주 괴물 (미리보기)
    bossState(){
      const wk = Math.max(0, bossWeek());
      if(!st.bossS || st.bossS.week!==wk){ const p = st.bossS;
        st.bossS = {week:wk, monster:(wk===0 ? 'slump' : MONSTERS[Math.floor(Math.random()*MONSTERS.length)].code),   /* (10-22) 괴물은 매주 랜덤 */ max_hp:15000, dmg:3050, att:new Set(['moon','dl','green','dawn','owl']), my:0, coins:0, dex:p?p.dex:[], tickets:p?Math.min(24, p.tickets||0):3, fuel:p?(p.fuel||0):20}; }   // 공격권은 다음 주로 넘어가요 (최대 24장)
      return st.bossS;
    },
    async bossTrade(item, kind){ const B = this.bossState(); st.bitems = st.bitems || {}; let n = 0;
      if(kind==='ticket' && B.dmg>=B.max_hp) fail('이번 주 괴물이 쉬는 중이라 공격권으로는 못 바꿔요. 코인으로 바꿔 주세요');
      Object.keys(st.bitems).forEach(c=>{ if((!item || c===item) && st.bitems[c]>1){ n += st.bitems[c]-1; st.bitems[c] = 1; } });
      if(!n) fail('바꿀 수 있는 겹친 수집품이 없어요');
      if(kind==='coin') st.me.coins += BOSS_TRADE_COIN*n; else B.tickets += n;
      persist(); return {kind, n, coins:st.me.coins, tickets:B.tickets}; },
    async season(){ const m = st.seasonMode||'auto', mo = new Date().getMonth()+1; return {mode:m, season: m==='on' ? 'winter' : m==='off' ? '' : ([12,1,2].includes(mo) ? 'winter' : '')}; },
    async adminSeason(m){ st.seasonMode = m; persist(); return this.season(); },
    async myWeek(wk){ const B = this.bossState(), now = Date.now(), st0 = new Date(now - 3*864e5).toISOString(), en = new Date(now + 4*864e5).toISOString();   // 미리보기용 예시
      if(wk!=null && wk<0) return {skip:true, from:'2026-10-30T00:00:00+09:00'};
      return wk==null ? {week_no:2, starts_at:st0, ends_at:en, done:false, mins:742, prev_mins:610, hits:(B.hits||0)+38, damage:(B.my||0)+266, coins:(B.coins||0)+250, monster:B.monster, kills:(B.lv||1)-1, eggs:2, hatched:1, bps:1, drops:null}
        : {week_no:1, starts_at:new Date(now - 10*864e5).toISOString(), ends_at:st0, done:true, mins:610, prev_mins:null, hits:52, damage:390, coins:410, monster:'slump', kills:3, eggs:1, hatched:1, bps:0, drops:null}; },
    async boss(){ const B = this.bossState(); return {ends_at:new Date(B.week===0 ? Date.parse('2026-10-30T00:00:00+09:00') : lottoWeekEnds()).toISOString(), monster:B.monster, max_hp:B.max_hp, hp:B.max_hp-B.dmg, attackers:B.att.size, my_damage:B.my, my_hits:B.lvHits||0, week_hits:B.hits||0, reward_hits:BOSS_REWARD_HITS, lv:B.lv||1, lv_coin:BOSS_LV_COIN, lv_shards:BOSS_LV_SHARDS, my_coins:B.coins||0, tickets:B.tickets, fuel:B.fuel, dex:[...B.dex], items:{...(st.bitems||{})}}; },
    async bossHit(code, n){
      const B = this.bossState(), w = weaponOf(code), m = monsterOf(B.monster);
      if(B.dmg>=B.max_hp) fail('이번 주 괴물은 벌써 쓰러졌어요');
      if(!weaponOpen(w, st.me.total_minutes)) fail('아직 못 쓰는 무기예요');
      n = Math.min(n|0, B.tickets); if(n<1) fail('공격권이 없어요');
      const each = weaponDmg(w, m); let used = 0, dealt = 0;
      while(used<n && B.dmg<B.max_hp){ used++; const d = Math.min(each, B.max_hp-B.dmg); B.dmg += d; dealt += d; }
      B.tickets -= used; B.my += dealt; B.hits = (B.hits||0) + used; B.lvHits = (B.lvHits||0) + used; B.att.add('me');
      st.bitems = st.bitems || {}; const set = (BOSS_ITEMS[m.code]||[]).map(r=>r[0]), drops = [];
      const give = fresh => { if(!set.length) return null; const pool = fresh && set.some(c=>!st.bitems[c]) ? set.filter(c=>!st.bitems[c]) : set; const c = pool[Math.floor(Math.random()*pool.length)]; st.bitems[c] = (st.bitems[c]||0)+1; return c; };
      for(let k=0;k<used;k++) if(Math.random()<BOSS_DROP){ const c = give(false); if(c) drops.push(c); }
      let coins = 0, lucky = 0;
      for(let k=0;k<used;k++){ if(Math.random()<BOSS_LUCKY){ coins += BOSS_LUCKY_COIN; lucky++; } else coins += BOSS_HIT_COIN[0] + Math.floor(Math.random()*(BOSS_HIT_COIN[1]-BOSS_HIT_COIN[0]+1)); }
      st.me.coins += coins; B.coins = (B.coins||0) + coins;
      const down = B.dmg>=B.max_hp, L = B.lv||1, myLv = B.lvHits||0, rewarded = myLv >= BOSS_REWARD_HITS; let kill_item = null; if(down && rewarded && L===1) kill_item = give(true);
      if(down && rewarded && L>1){ st.me.coins += BOSS_LV_COIN; this.iskState().shards += BOSS_LV_SHARDS; st.gifts.push({id:Date.now(), amount:BOSS_LV_COIN, reason:`⭐ Lv.${L} ${m.name} 토벌`}); }
      if(down && rewarded && L===1){ if(!B.dex.includes(m.code)) B.dex.push(m.code); st.me.coins += BOSS_REWARD; st.gifts.push({id:Date.now(), amount:BOSS_REWARD, reason:`⚔️ ${m.name} 토벌`}); persist(); }
      const isekai = this.iskHit(used, B.max_hp-B.dmg);
      let next_hp = null; if(down){ B.base = B.base || B.max_hp; B.lv = L + 1; next_hp = Math.round(B.base * (1 + BOSS_LV_UP*L) / 100) * 100; B.max_hp = next_hp; B.dmg = 0; B.lvHits = 0; }
      persist(); return {each, used, dealt, hp: down ? 0 : B.max_hp-B.dmg, down, drops, kill_item, coins, lucky, isekai, my_hits:myLv, reward_hits:BOSS_REWARD_HITS, got_reward:rewarded, lv:L, next_lv: down ? L+1 : null, next_hp, lv_coin:BOSS_LV_COIN, lv_shards:BOSS_LV_SHARDS};
    },
    // 🌀 균열 너머 (미리보기) — isekai.sql 과 같은 규칙
    iskState(){ if(!st.isk) st.isk = {open:false, shards:0, eggs:[], nid:1}; if(!st.isk.ev) st.isk.ev = []; if(!st.isk.gifts) st.isk.gifts = []; return st.isk; },
    // 🔮 아공간 (미리보기)
    vdJson(){ const V = st.vd, P = this.pstate(), I = this.iskState(); if(!V) return {open:false, price:VOID_OPEN_PRICE, shards:I.shards};
      const farm_pets = [...new Set(P.pets.filter(p=>/^isk_/.test(p.code)).map(p=>p.code))].sort();
      const cl = V.cap_lv||0, rl = V.rate_lv||0;
      return {open:true, cols:V.cols, rows:V.rows, bg:V.bg, bgs:[...V.bgs], public:V.pub, items:V.items.map(x=>({...x})), farm_pets, farm_at:V.farm_at, farm_rate:VOID_FARM_RATE+rl, farm_cap:VOID_FARM_CAP+4*cl,
        cap_lv:cl, rate_lv:rl, cap_price:[300,500,800][cl] ?? null, rate_price:[500,800][rl] ?? null, fx:V.fx||'', fxs:[...(V.fxs||[])], fx_price:VOID_FX_PRICE, stars:st.me.stars||0,
        max_cols:VOID_MAX_C, max_rows:VOID_MAX_R, grow_price:V.cols*V.rows*10, bg_price:VOID_BG_PRICE,
        catalog:VCAT.map(f=>({...f})), sets:this.vdSets(), bps:[...(V.bps||[])], vinv:{...(V.vinv||{})}, bp_saved:V.bp_gauge||0, bp_need:60, bp_dup:50,
        snack_from:V.snack_from||null, snack_until:V.snack_until||null, snack_today:V.snack_day===new Date().toDateString(), snack_price:100, snack_hours:6, coins:st.me.coins}; },
    vdSets(){ const V = st.vd; if(!V) return []; const placed = new Set(V.items.map(x=>x.item_code));
      return [...new Set(VCAT.map(f=>f.theme))].filter(t=>{ const s = VCAT.filter(f=>f.theme===t && f.in_set && f.active!==false); return s.length && s.every(f=>placed.has(f.code)); }); },
    vdRollBp(){ const V = st.vd, themes = [...new Set(VCAT.filter(f=>f.active!==false).map(f=>f.theme))];
      let th = V.bg; if(!themes.includes(th) || Math.random() >= .5){ const o = themes.filter(t=>t!==V.bg); th = o[Math.floor(Math.random()*o.length)] || themes[0]; }
      const pool = VCAT.filter(f=>f.theme===th && f.active!==false), f = pool[Math.floor(Math.random()*pool.length)];
      V.bps = V.bps||[]; const dup = V.bps.includes(f.code); if(dup) this.iskState().shards += 50; else V.bps.push(f.code); return {code:f.code, theme:th, dup}; },
    async voidCraft(code){ const V = st.vd, f = vfurnOf(code); if(!f) fail('없는 가구예요'); if(!(V.bps||[]).includes(code)) fail('📜 도안이 아직 없어요');
      V.vinv = V.vinv||{}; if(f.max_own && (V.vinv[code]||0) + V.items.filter(x=>x.item_code===code).length >= f.max_own) fail(`「${f.name}」은(는) ${f.max_own}개까지만 가질 수 있어요`);
      this.vdPay(f.price); V.vinv[code] = (V.vinv[code]||0)+1; persist(); return this.vdJson(); },
    async voidSnack(){ const V = st.vd, today = new Date().toDateString(); if(V.snack_day===today) fail('오늘 간식은 벌써 줬어요. 새벽 12시에 다시 줄 수 있어요');
      if((st.me.coins||0) < 100) fail('코인이 부족해요 (🪙 100개 필요)'); st.me.coins -= 100;
      V.snack_from = new Date().toISOString(); V.snack_until = new Date(Date.now()+6*36e5).toISOString(); V.snack_day = today; persist(); return this.vdJson(); },
    async winterPick(k){ const W = st.winter || {}; W.pick = k; if(k==='lotto') st.me.lotto_bonus = (st.me.lotto_bonus||0)+3; else if(k==='room') st.me.room_coupon = (st.me.room_coupon||0)+1; else st.me.garden_bonus = (st.me.garden_bonus||0)+1; persist(); return null; },
    async checkPlates(){ const have = new Set(st.me.nameplates||['wood']), fresh = [], g = st.coll.size;
      [[100,'ribbon'],[200,'starlight'],[300,'jewel'],[400,'rainbow'],[500,'goldleaf']].forEach(([n,k])=>{ if(g>=n && !have.has(k)) fresh.push(k); });
      const P = this.pstate(); if(['isk_ink','isk_clock','isk_paper','isk_reject','isk_blank','isk_scrap','isk_sleep','isk_game','isk_vamp'].every(c=>P.dex.includes(c)) && !have.has('isekai')) fresh.push('isekai');
      if(fresh.length){ st.me.nameplates = [...have, ...fresh]; persist(); } return {fresh}; },
    vdStar(n){ if((st.me.stars||0) < n) fail(`⭐ 별조각이 모자라요 (⭐ ${n}개 필요)`); st.me.stars -= n; },
    async voidFx(fx){ const V = st.vd; V.fxs = V.fxs||[]; if(fx && !V.fxs.includes(fx)){ this.vdPay(VOID_FX_PRICE); V.fxs.push(fx); } V.fx = fx||''; persist(); return this.vdJson(); },
    async voidFarmUp(kind){ const V = st.vd; if(kind==='cap'){ const p = [300,500,800][V.cap_lv||0]; if(p==null) fail('바구니는 이미 제일 커요'); this.vdPay(p); V.cap_lv = (V.cap_lv||0)+1; }
      else { const p = [500,800][V.rate_lv||0]; if(p==null) fail('간식 그릇은 이미 가득이에요'); this.vdPay(p); V.rate_lv = (V.rate_lv||0)+1; } persist(); return this.vdJson(); },
    async riftStarFeed(id, n){ const I = this.iskState(), e = I.eggs.find(x=>x.id===id); if(!e || !e.set_at) fail('먼저 세계수에 맡겨 주세요');
      n = Math.min(n, RIFT_NEED - e.fed); if(n<1) fail('이미 정화가 끝났어요'); this.vdStar(n*STAR_PER_DROP); e.fed += n; persist(); return this.rift(); },
    vdPay(n){ const I = this.iskState(); if(I.shards < n) fail(`💠 이세계 파편이 모자라요 (💠 ${n}개 필요)`); I.shards -= n; },
    async void(){ return this.vdJson(); },
    async voidOf(id){ return id==='me' && st.vd ? this.vdJson() : null; },
    async voidOpen(){ if(st.vd) fail('이미 아공간이 있어요'); this.vdPay(VOID_OPEN_PRICE); st.vd = {cols:4, rows:4, bg:'base', bgs:['base'], pub:false, items:[], nid:1, farm_at:new Date().toISOString()}; persist(); return this.vdJson(); },
    async voidGrow(dir){ const V = st.vd; if(!V) fail('먼저 아공간 문을 열어 주세요');
      if(dir==='col' ? V.cols>=VOID_MAX_C : V.rows>=VOID_MAX_R) fail('더 넓힐 수 없어요'); this.vdPay(V.cols*V.rows*10); if(dir==='col') V.cols++; else V.rows++; persist(); return this.vdJson(); },
    async voidBg(bg){ const V = st.vd; if(!(bg in VOID_BGS)) fail('없는 배경이에요'); if(!V.bgs.includes(bg)){ this.vdPay(VOID_BG_PRICE); V.bgs.push(bg); } V.bg = bg; persist(); return this.vdJson(); },
    async voidPublic(on){ st.vd.pub = !!on; persist(); return this.vdJson(); },
    async voidPlace(code, r, c, rot, w, h, layer){ const V = st.vd, vf = isVoidFurn(code); V.vinv = V.vinv||{};
      if(!vf && !isLegendFurn(code)) fail('아공간에는 🔮 아공간 가구와 👑 전설 가구만 놓을 수 있어요');
      if(vf ? !(V.vinv[code]>0) : !(st.inv[code]>0)) fail(vf ? '아공간 창고에 없는 가구예요' : '가방에 없는 가구예요');
      if(r<0||c<0||c+w>V.cols||r+h>V.rows) fail(`여기엔 ${w}×${h}칸 자리가 없어요`);
      const ly = layer==='floor' ? 'floor' : 'furniture';
      if(V.items.some(f=>f.layer===ly && r<f.r+f.h && f.r<r+h && c<f.c+f.w && f.c<c+w)) fail(`여기엔 ${w}×${h}칸 자리가 없어요`);
      if(vf) V.vinv[code]--; else st.inv[code]--; V.items.push({id:V.nid++, item_code:code, r, c, w, h, rot:rot||0, layer:ly}); persist(); return this.vdJson(); },
    async voidRemove(id){ const V = st.vd, f = V.items.find(x=>x.id===id); if(!f) fail('내 가구가 아니에요'); V.items = V.items.filter(x=>x!==f);
      if(isVoidFurn(f.item_code)){ V.vinv = V.vinv||{}; V.vinv[f.item_code] = (V.vinv[f.item_code]||0)+1; } else st.inv[f.item_code] = (st.inv[f.item_code]||0)+1; persist(); return this.vdJson(); },
    async voidCollect(){ const j = this.vdJson(), n = j.farm_pets.length; if(!n) fail('농장에서 놀 이세계 마물이 아직 없어요. 알을 부화시켜 보세요');
      const gain = voidFarmReady(j) || n*6;   /* 미리보기는 바로 받아 볼 수 있게 */ const I = this.iskState(); I.shards += gain;
      const f = voidFarmHours(j); let g = (st.vd.bp_gauge||0) + (f.hrs + f.boost) * n + 60;   /* 미리보기는 받을 때마다 도안 1장 더 */
      const bps = []; while(g >= 60 && bps.length < 20){ g -= 60; bps.push(this.vdRollBp()); }
      st.vd.bp_gauge = g; st.vd.farm_at = new Date().toISOString(); persist();
      return {gain, shards:I.shards, pets:n, bps, dup_shards:bps.filter(b=>b.dup).length*50, boosted:f.boost>0}; },
    iskMult(){ const n = Date.now(); return Math.max(1, ...this.iskState().ev.filter(e=>Date.parse(e.starts_at)<=n && Date.parse(e.ends_at)>n).map(e=>e.mult)); },
    async adminShards(id, amount, reason){ const I = this.iskState(); if(!(amount>=1)) fail('파편 개수를 적어 주세요');
      if(!id || id==='*' || id==='me'){ I.shards += amount; I.gifts.push({amount, reason, at:new Date().toISOString()}); }
      persist(); return (!id || id==='*') ? 1 + st.others.filter(o=>!o.removed).length : 1; },
    async shardEventAdd(name, mult, start, end){ const I = this.iskState(); I.ev.push({id:I.nid++, name:name||`💠 파편 ${mult}배 이벤트`, mult, starts_at:start, ends_at:end}); persist(); return I.nid; },
    async shardEventDel(id){ const I = this.iskState(); I.ev = I.ev.filter(e=>e.id!==id); persist(); },
    iskHit(used, hp){ const I = this.iskState(); let now = false;
      if(!I.open){ if(hp > RIFT_OPEN_HP) return {open:false}; I.open = true; now = true; }
      let sh = 0, big = 0; const eggs = [];
      const mult = this.iskMult();
      for(let k=0;k<used;k++){ if(Math.random()<RIFT_BIG_P){ sh += 100*mult; big++; } else sh += (10 + Math.floor(Math.random()*31))*mult;
        if(Math.random()<RIFT_EGG_P){ const kind = ['punk','reject','rest'][Math.floor(Math.random()*3)]; eggs.push(kind); I.eggs.push({id:I.nid++, kind, got_at:new Date().toISOString(), set_at:null, fed:0}); } }
      I.shards += sh; persist(); return {open:true, opened_now:now, shards:sh, big, eggs, mult}; },
    async rift(){ const I = this.iskState();
      if(!I.open){ const B = this.bossState(); if(B.max_hp - B.dmg <= RIFT_OPEN_HP){ I.open = true; persist(); } }
      const gifts = I.gifts.splice(0), events = I.ev.filter(e=>Date.parse(e.ends_at)>Date.now()).map(e=>({...e})); if(gifts.length) persist();
      if(!I.open) return {open:false, gifts, events, mult:this.iskMult(), shards:I.shards};
      return {open:true, need:RIFT_NEED, dup_shards:RIFT_DUP, shards:I.shards, gifts, events, mult:this.iskMult(), eggs:I.eggs.map(e=>({...e})).sort((a,b)=>(a.set_at?0:1)-(b.set_at?0:1) || a.id-b.id)}; },
    async riftSetEgg(id){ const I = this.iskState(), e = I.eggs.find(x=>x.id===id); if(!e) fail('없는 알이에요');
      if(e.set_at) fail('이미 세계수가 정화하고 있어요'); if(I.eggs.some(x=>x.set_at)) fail('세계수에는 알을 하나씩만 맡길 수 있어요');
      e.set_at = new Date().toISOString(); e.fed = 0; persist(); return this.rift(); },
    async riftHatch(id){ const I = this.iskState(), e = I.eggs.find(x=>x.id===id); if(!e) fail('없는 알이에요');
      if(!e.set_at || e.fed < RIFT_NEED) fail('아직 정화가 덜 됐어요. 세계수에 물방울을 더 부어 주세요');
      const pool = RIFT_EGGS[e.kind].pets, code = pool[Math.floor(Math.random()*pool.length)], s = petOf(code), P = this.pstate();
      const dup = P.dex.includes(code) || P.pets.some(p=>p.code===code); let lodge = false;
      if(dup) I.shards += RIFT_DUP;
      else { P.dex.push(code); lodge = P.pets.filter(x=>!x.lodge).length >= P.slots;
        P.pets.push({id:P.nid++, code, name:s.name.split(' ').pop().slice(0,10), affection:0, last_cared:new Date().toISOString(), fed:0, patted:0, played:0, day:this.fday(), event_at:new Date().toISOString(), lodge}); }
      I.eggs = I.eggs.filter(x=>x.id!==id); persist();
      return {pet:code, name:s.name, dup, gain:dup?RIFT_DUP:0, lodge, shards:I.shards}; },
    // 미리보기 전용
    tick(){
      { const B = this.bossState(); if(st.me.in_voice && B.tickets<BOSS_TICKET_MAX && B.dmg<B.max_hp){ const lit = 1 + st.others.filter(o=>o.in_voice && !o.removed).length; B.fuel += bossFire(lit);
          while(B.fuel>=BOSS_TICKET_FUEL && B.tickets<BOSS_TICKET_MAX){ B.fuel -= BOSS_TICKET_FUEL; B.tickets++; } if(B.tickets>=BOSS_TICKET_MAX) B.fuel = 0; } }
      if(st.me.in_voice){ this.streakTick(); st.me.total_minutes++; st.me.coins+=currentMult(); st.me.today_minutes++; persist(); }
      st.others.forEach(o=>{ if(o.in_voice && !o.removed){ o.today_minutes++; o.total_minutes++; } });
    },
    shuffle(){
      const pool=st.others.filter(o=>!o.removed && o.away<14);
      const o=pool[Math.floor(Math.random()*pool.length)]; if(!o) return null;
      o.in_voice=!o.in_voice; if(o.in_voice) o.away=0; return o;
    },
  };
}
