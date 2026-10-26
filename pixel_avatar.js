/* 마감의 숲 도트 아바타 렌더러
 * Jadewood Hero Base by jade (jjkittyy.itch.io), 사용·수정 허용 게임 에셋.
 * atlas: 원본의 24x24 idle_down_0 픽셀을 같은 순서로 가로로 배치.
 * 의상 추가: sprite 24x24를 atlas 오른쪽에 배치하고 catalog에 항목 등록.
 */
(function(){
  'use strict';
  const skins=[['light','밝은 피부'],['tan','살구 피부'],['brown','갈색 피부'],['deep','짙은 피부']];
  const outfits=[['tunic','기본 튜닉',0],['robe','마법 로브',15],['armor','기사 갑옷',20],['dress','드레스',15]];
  const styles=[['short','숏컷'],['long','긴 머리'],['ponytail','포니테일'],['bob','단발'],['spiky','뾰족머리'],['buns','양갈래 번']];
  const colors=[['brown','갈색'],['black','검정'],['blonde','금발'],['ginger','주황'],['pink','분홍'],['mint','민트']];
  const hats=[['wizard_hat','마법사 모자',17],['crown','왕관',20],['beanie','비니',12]];
  const catalog=[];
  skins.forEach(function(v){catalog.push({kind:'body',code:'body_'+v[0],name:v[1],price:0});});
  outfits.forEach(function(v){catalog.push({kind:'outfit',code:'outfit_'+v[0],name:v[1],price:v[2]});});
  styles.forEach(function(s){colors.forEach(function(c){
    const code='hair_'+s[0]+'_'+c[0];
    catalog.push({kind:'hair',code:code,name:s[1]+' · '+c[1],price:code==='hair_short_brown'?0:10});
  });});
  hats.forEach(function(v){catalog.push({kind:'hat',code:'hat_'+v[0],name:v[1],price:v[2]});});
  // hat_none 은 이미지가 없는 기본 선택지입니다.
  catalog.push({kind:'hat',code:'hat_none',name:'모자 없음',price:0,blank:true});
  const byCode=Object.fromEntries(catalog.map(function(it,i){it.index=it.blank?-1:i;return [it.code,it];}));
  const defaults={body:'body_light',outfit:'outfit_tunic',hair:'hair_short_brown',hat:'hat_none'};
  const art=new Image(); let artReady=false,scheduled=false;
  function normalize(look){
    const x=look||{}, next={};
    Object.keys(defaults).forEach(function(k){const id=x[k];next[k]=byCode[id]&&byCode[id].kind===k?id:defaults[k];});
    return next;
  }
  function html(look){
    const a=normalize(look); schedule();
    // normalize와 카탈로그에 등록된 고정 문자열만 data-*에 전달합니다.
    return '<span class="wc-body pixel-avatar"><canvas class="pixel-canvas" width="24" height="24" '+
      'data-body="'+a.body+'" data-outfit="'+a.outfit+'" data-hair="'+a.hair+'" data-hat="'+a.hat+
      '" role="img" aria-label="도트 아바타"></canvas></span>';
  }
  function drawAll(){
    if(!artReady) return;
    document.querySelectorAll('canvas.pixel-canvas').forEach(function(canvas){
      const ids=[canvas.dataset.body,canvas.dataset.outfit,canvas.dataset.hair,canvas.dataset.hat];
      const key=ids.join('/');
      if(canvas.dataset.drawn===key) return;
      const ctx=canvas.getContext('2d');if(!ctx)return;
      ctx.clearRect(0,0,24,24);ctx.imageSmoothingEnabled=false;
      ids.forEach(function(id){const entry=byCode[id];if(!entry||entry.index<0)return;
        ctx.drawImage(art,entry.index*24,0,24,24,0,0,24,24);
      });
      canvas.dataset.drawn=key;
    });
  }
  function schedule(){
    if(scheduled)return; scheduled=true;
    requestAnimationFrame(function(){scheduled=false;drawAll();});
  }
  art.onload=function(){artReady=true;schedule();};
  art.onerror=function(){console.warn('Jadewood 도트 아바타 이미지 로딩 실패');};
  art.src='walk/pixel/avatar_atlas.png?v=1';
  window.PIXEL_AVATAR={catalog:catalog,byCode:byCode,defaults:defaults,normalize:normalize,html:html,drawAll:drawAll,schedule:schedule};
})();
