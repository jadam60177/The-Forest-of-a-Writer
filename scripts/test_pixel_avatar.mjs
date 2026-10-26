// Run with: node scripts/test_pixel_avatar.mjs
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const atlas=readFileSync(new URL('../walk/pixel/avatar_atlas.png',import.meta.url));
assert.equal(atlas.subarray(0,8).toString('hex'),'89504e470d0a1a0a','PNG signature');
assert.equal(atlas.readUInt32BE(16),1128,'47 frames x 24px');
assert.equal(atlas.readUInt32BE(20),24,'frame height');

const pending=[];
const canvas={
  dataset:{body:'body_deep',outfit:'outfit_armor',hair:'hair_buns_pink',hat:'hat_crown'},
  getContext:()=>({
    clearRect:()=>{},drawImage:(...args)=>pending.push(args),
    set imageSmoothingEnabled(value){assert.equal(value,false);}
  })
};
const window={};
class FakeImage {
  set src(value){assert.match(value,/avatar_atlas[.]png/);this.onload?.();}
}
const context={window,Image:FakeImage,document:{querySelectorAll:()=>[canvas]},requestAnimationFrame:fn=>fn(),console};
vm.runInNewContext(readFileSync(new URL('../pixel_avatar.js',import.meta.url),'utf8'),context);
const p=window.PIXEL_AVATAR;
assert.equal(p.catalog.length,48,'47 sprite items + no hat option');
assert.equal(p.byCode.body_light.index,0);
assert.equal(p.byCode.hat_beanie.index,46);
assert.equal(p.byCode.hair_buns_pink.price,10);
assert.equal(p.byCode.outfit_armor.price,20);
assert.equal(p.byCode.hat_crown.price,20);
assert.equal(p.normalize({body:'oops'}).body,'body_light','reject unknown sprite ID');
assert.equal(p.normalize({hat:'invalid'}).hat,'hat_none');
assert.match(p.html({hat:'hat_none'}),/pixel-canvas/);
p.schedule();
assert.equal(pending.length,4,'body, outfit, hair and hat drawn');
assert.deepEqual(pending.map(x=>x[1]),[0,0,0,0]);
console.log('PASS: sprite atlas, outfit catalog, defaults and drawing');
