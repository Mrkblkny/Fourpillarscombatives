// Live verification of all public FPC pages and the linked Online Training portal.
// No admin credentials, mutations, purchases or private user data are used.
import assert from 'node:assert/strict';
const root='https://fourpillarscombatives.com';
const pages=['/','/about','/lessons','/programs','/training','/private-lessons',
  '/womens-self-defense','/seminars','/personal-training','/contact'];
async function get(path){
  const response=await fetch(root+path,{redirect:'follow',signal:AbortSignal.timeout(15000)});
  assert.equal(response.status,200,path+' returned HTTP '+response.status);
  const text=await response.text();
  return {response,text};
}
for(const path of pages){
  const {text}=await get(path);
  assert.match(text,/<title>[^<]+<\/title>/,path+': page title missing');
  assert.ok(text.includes('class="nav-online"'),path+': Online Training navigation missing');
  assert.ok(text.includes('href="/online-training/"'),path+': Online Training link missing');
  assert.ok(text.includes('Online Training — Free Registration'),path+': footer link missing');
  assert.ok(text.includes('facebook-header-link'),path+': Facebook header link missing');
  if(path!=='/'){
    assert.ok(text.includes('online-site-ribbon'),path+': Online Training announcement missing');
    assert.ok(text.includes('PUBLIC BETA · TRAIN FROM ANYWHERE'),
      path+': marketing must remain beta after checkout opens');
  }
  if(path==='/programs'){
    assert.ok(text.includes('Six ways to train'), 'Programs page must list six choices');
    assert.ok(text.includes('06 / ONLINE TRAINING · PUBLIC BETA'),
      'Programs page must include the Online Training course');
  }
  if(path==='/' || path==='/training'){
    assert.ok(!text.includes('<h3>WEAPONS FIGHTING</h3>'),
      path+': Section 3 uses the shorter Weapons title');
    assert.ok(!text.includes('<h3>EMPTY-HAND FIGHTING</h3>'),
      path+': Section 2 must reference a weapons environment');
  }
  if(path==='/'){
    assert.match(text,/Public Beta \/ Four Pillars Combatives Online/, 'Homepage must say Public Beta');
    assert.match(text,/Empty-Hand Fighting in a Weapons Environment/);
    assert.match(text,/Founding Lifetime Memberships from \$199\.99/);
  }
  console.log('OK',path);
}
const {text:js}=await get('/assets/site.js');
assert.ok(js.includes('PUBLIC BETA — ONLINE TRAINING ENROLLMENT OPEN'),
  'Enrolling customers must still see Public Beta across the main website');
assert.ok(!js.includes('first 50 founding memberships'),
  'Main website must not display tier inventory numbers');
const {text:sitemap}=await get('/sitemap.xml');
assert.ok(sitemap.includes('https://fourpillarscombatives.com/online-training/'),
  'Training portal URL must appear in sitemap');
const {text:portal}=await get('/online-training/');
assert.ok(portal.includes('id="betaLaunchNotice"'));
assert.ok(portal.includes('Price increases with each founding tier.'));
assert.ok(!portal.includes('id="founderProgressTrack"'));
const {text:configText}=await get('/online-training/api/config');
const data=JSON.parse(configText);
assert.ok(data.founding && Object.keys(data.founding).length===1
  && Object.hasOwn(data.founding,'tier'),
  'Public API must expose only the tier, not seats remaining or allocated');
assert.equal(typeof data.enrollmentOpen,'boolean');
assert.equal(data.offer.price,'$199.99');
console.log('PASS: '+pages.length+' live website pages, sitemap, public beta pricing UI, protected founder inventory.');
