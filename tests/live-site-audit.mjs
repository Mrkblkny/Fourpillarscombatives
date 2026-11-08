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
  assert.ok(text.includes('class="skip-link" href="#main"'),path+': skip to content is missing');
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
    assert.ok(text.includes('Programs &amp; services · Pearl, Jackson Metro &amp; online'),
      'Programs page must describe offered services accurately');
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
    assert.ok(text.includes('id="online-member-community"'),
      'Live homepage is missing the newly published community overview');
    assert.ok(text.includes('Free, admin-assigned Member, Founding, and VIP accounts') &&
      text.includes('Your account shows only the community features enabled for your membership'),
      'Live homepage must describe the current membership-based community access');
    assert.match(text,/Founding and VIP prices increase by tier; check current options/);
    assert.match(text,/Additional medical lessons and handouts will be published as they are ready/,
      'Live homepage must have current public-beta medical curriculum copy');
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
// Read-only cross-app checks: the new member shell, Community Hub, and
// admin UI must resolve. None of these checks signs in or changes records.
const {text:trainingHtml}=await get('/online-training/');
// Verify the latest public menu, not the earlier two-login marketing header.
const trainingHeader=trainingHtml.split('<header class="site-header">')[1]?.split('</header>')[0]||'';
const trainingMobile=trainingHtml.split('<nav id="mobileNav"')[1]?.split('</nav>')[0]||'';
assert.match(trainingHeader,/id="accountButton"[^>]*>Member Login<\/button>/,
  'Training header must offer one Member Login');
assert.ok(!trainingHeader.includes('id="headerClaim"'),
  'The redundant free signup header button must not return');
assert.ok(trainingMobile.includes('href="#membership">Membership</a>')&&
  trainingMobile.includes('id="mobileLogin"')&&
  !trainingMobile.includes('VIP Founding Membership'),
  'Mobile training navigation must use the current simplified menu');
assert.match(trainingHtml,/class="member-community-nav-link" data-member-community-link href="\.\/community\/" hidden/,
  'Member dashboard must include a permission-gated fifth Community Hub tab');
assert.match(trainingHtml,/id="memberAccountPanel"/);
assert.match(trainingHtml,/id="memberUpdatesPanel"/);
assert.match(trainingHtml,/id="memberUnifiedProfile"/,'My Account must contain a shared profile panel');
assert.match(trainingHtml,/id="memberProfileForm"/,'Profile editor must live in My Account');
assert.match(trainingHtml,/id="memberHeroInitials"/,'Member home must have initials');
assert.match(trainingHtml,/id="memberAccountInitials"/,'Account must have initials');
assert.match(trainingHtml,/id="memberProfileSaveButton"[^>]*>Save Changes<\/button>/,
  'One coordinated Account Save Changes must remain available');
assert.match(trainingHtml,/New lessons and PDF handouts are being added during public beta/,
  'Beta curriculum must not claim published lessons are still coming soon');
assert.doesNotMatch(trainingHtml,/id="memberProfilePhotoPanel"|id="memberProfilePhotoUpload"|id="memberProfilePhotoFile"/,
  'Profile photo upload controls must not return after initials-only rollout');
const {text:communityHtml}=await get('/online-training/community/');
assert.match(communityHtml,/Member Community \| Four Pillars Combatives/);
assert.match(communityHtml,/href="\.\.\/">← Member Dashboard<\/a>/);
assert.match(communityHtml,/name="robots" content="noindex,nofollow"/);
assert.match(communityHtml,/href="\.\.\/\?tab=account" target="_top"/,
  'Community must point to one Member Dashboard profile editor');
assert.doesNotMatch(communityHtml,/id="profileForm"|id="avatarFile"|id="uploadAvatar"/,
  'Community must not expose a second profile editor or photo upload');
assert.doesNotMatch(communityHtml,/>ADMINISTRATION<\/p>|id="adminNav"|data-screen="admin"/,
  'Member Community must never display a moderator/admin navigation entry');
const {text:adminHtml}=await get('/online-training/admin/');
assert.match(adminHtml,/id="tab-preview"/);
assert.match(adminHtml,/id="adminPreviewTier"/);
assert.match(adminHtml,/id="memberUpdateForm"/);
assert.match(adminHtml,/id="memberGrantEditor"/,
  'Admin dashboard must retain per-member access editor');
assert.match(adminHtml,/id="memberFeatureMatrix"/,
  'Admin dashboard must retain membership feature matrix');
assert.match(adminHtml,/id="openCommunityModerationPanel"/,
  'Community moderation must be available inside the protected Admin Dashboard');
assert.match(adminHtml,/id="adminNeedsAttention"/,
  'Owner Needs Attention queue must include reports, student requests and video feedback');
assert.match(adminHtml,/name="robots" content="noindex,nofollow"/);
for(const path of ['/online-training/api/updates',
  '/online-training/api/admin/lessons',
  '/online-training/api/admin/updates',
  '/online-training/api/admin/access',
  '/online-training/api/student-requests',
  '/online-training/api/admin/attention']){
  const response=await fetch(root+path,{cache:'no-store',signal:AbortSignal.timeout(15000)});
  assert.equal(response.status,401,path+' must deny unsigned anonymous requests');
}
console.log('PASS: member five-tab navigation, Community Hub, Admin Preview, protected API endpoints.');

const {text:configText}=await get('/online-training/api/config');
const data=JSON.parse(configText);
assert.ok(data.founding && Object.keys(data.founding).sort().join(',')==='tier,tierProgressPercent',
  'Public API must expose only current tier and percent, not purchase counts or inventory');
assert.ok(data.vip && !Object.hasOwn(data.vip,'purchases'), 'VIP public API must not expose purchases');
assert.ok(!Object.hasOwn(data.founding,'verifiedPurchases'), 'Founding purchase totals must remain private');
assert.equal(typeof data.enrollmentOpen,'boolean');
assert.ok(data.offer.price===null || /^\$\d+\.99$/.test(data.offer.price),
  'Public offer must have current one-time tier price or be sold out');
console.log('PASS: '+pages.length+' live website pages, sitemap, public beta pricing UI, protected founder inventory.');
