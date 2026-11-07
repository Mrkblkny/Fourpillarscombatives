// Four Pillars Combatives: static page and navigation smoke tests.
// Run with: node tests/site-audit.mjs
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const root=resolve('.');
const pages=['index','lessons','womens-self-defense','private-lessons',
  'personal-training','programs','training','seminars','about','contact'];
const routes=new Map(pages.map(p=>['/'+(p==='index'?'':p), p+'.html']));
routes.set('/', 'index.html');
const idsFor=new Map();
const read=p=>readFileSync(resolve(root,p),'utf8');

for (const name of pages) {
  const file=name+'.html', html=read(file);
  assert.match(html,/<html[^>]*lang="en"/i,file+': missing language');
  assert.match(html,/<title>[^<]+<\/title>/i,file+': missing title');
  assert.match(html,/name="description"/i,file+': missing SEO description');
  assert.match(html,/(?:href="https:\/\/fourpillarscombatives\.com[^"]*"[^>]*rel="canonical"|rel="canonical"[^>]*href="https:\/\/fourpillarscombatives\.com[^"]*")/i,file+': missing canonical');
  assert.match(html, /<h1\b/i,file+': missing main heading');
  assert.match(html,/facebook-header-link/,file+': missing header Facebook icon');
  assert.match(html,/class="nav-online" href="\/online-training\/"/,file+': online training must be visible in navigation');
  assert.match(html,/Online Training — Free Registration/,file+': online training must be available in footer');
  if(name!=='index')assert.match(html,/online-site-ribbon/,file+': online training announcement must be present');
  assert.match(html,/https:\/\/www\.facebook\.com\/FourPillarsCombatives\//,file+': missing Facebook link');
  assert.match(html,/src="assets\/site\.js(?:\?[^"]*)?"/i,file+': missing site JavaScript');
  const ids=[...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,file+': duplicate element IDs');
  idsFor.set(file,new Set(ids));
}

let checked=0;
for(const name of pages) {
  const file=name+'.html',html=read(file);
  const links=[...html.matchAll(/\b(?:href|src|action)=["']([^"'<>]+)["']/g)].map(m=>m[1]);
  for(let raw of links) {
    raw=raw.replaceAll('&amp;','&');
    if(!raw || raw.startsWith('#')) {
      const id=raw.slice(1); if(id)assert.ok(idsFor.get(file).has(id),file+': missing local anchor '+raw);
      continue;
    }
    if(/^(https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(raw))continue;
    const parts=raw.split('#'),pathAndQuery=parts[0],anchor=parts[1]||'';
    const withoutQuery=pathAndQuery.split('?')[0];
    if(withoutQuery.startsWith('/online-training'))continue; // served by dedicated Cloudflare Worker
    const target=routes.get(withoutQuery)||withoutQuery.replace(/^\//,'');
    assert.ok(existsSync(resolve(root,target)),file+': broken local link '+raw);
    if(anchor && idsFor.has(target))
      assert.ok(idsFor.get(target).has(anchor),file+': missing anchor '+raw);
    checked++;
  }
}


const programs=read('programs.html');
assert.match(programs,/Six ways to train/,'Program directory should include Online Training');
assert.match(programs,/06 \/ ONLINE TRAINING · PUBLIC BETA/,'Online Training should be a sixth program');
assert.match(programs,/Founding lifetime prices rise by tier/,'Program link must explain pricing progression');
for(const name of pages.filter(x=>x!=='index')){
  assert.match(read(name+'.html'),/PUBLIC BETA · TRAIN FROM ANYWHERE/,
    name+': keep beta clear even when paid enrollment is live');
}
for(const name of ['index','training']){
  const html=read(name+'.html');
  assert.ok(!html.includes('<h3>WEAPONS FIGHTING</h3>'),name+': Section 3 must be Weapons Fighting & Weapon Defense');
  assert.ok(!html.includes('<h3>EMPTY-HAND FIGHTING</h3>'),name+': Section 2 must mention a weapons environment');
  assert.match(html,/<h3>EMPTY-HAND FIGHTING IN A WEAPONS ENVIRONMENT<\/h3>/,
    name+': Section 2 must use the full approved title');
}

const js=read('assets/site.js');
assert.match(js,/const url = '\/online-training\/'/, 'Navigation must use same-domain training path');
assert.ok(!js.includes('four-pillars-online-training.pages.dev'), 'Old Pages URL present in navigation');
assert.ok(read('index.html').includes('href="/online-training/"'), 'Homepage training link must use the same domain');
assert.match(read('index.html'), /href="\/online-training\/admin\/">Online Training Admin Login<\/a>/, 'Homepage footer must expose the admin login');
assert.match(js, /Online Training Admin Login/, 'Other pages must receive the footer admin link');
assert.ok(!js.includes("className = 'nav-admin-login'"), 'Admin Login must not be injected into the mobile navigation');
assert.ok(!read('assets/styles.css').includes('.nav-links.open .nav-admin-login'),
  'Admin Login must not appear in the mobile navigation');
for(const name of pages){
  const html=read(name+'.html');
  const header=(html.split('<header')[1]||'').split('</header>')[0];
  assert.ok(!header.includes('/online-training/admin/'),name+': admin link belongs in footer only');
}
const homepage=read('index.html');
const firearmSection=read('training.html').split('id="close-range-and-firearms"')[1]?.split('id="combat-sports-vs-self-defense"')[0]||'';
assert.match(firearmSection,/CAN YOU FIGHT WITHOUT IT—AND WITH IT AT CLOSE RANGE\?/,
  'Firearm section must address both empty-hand fighting and close-range risk while armed');
assert.match(homepage,/physical contact happens while you are armed at close range/,
  'Homepage must explain close-range safety and weapon risks as well as empty-hand skills');
assert.match(homepage,/offensive and defensive fighting skills at different combat ranges/,
  'Homepage should describe empty-hand skills across combat ranges');
const curriculumHtml=read('training.html');
assert.match(curriculumHtml,/wrestling, clinch fighting, and ground fighting/,
  'Curriculum must describe striking, wrestling and ground fighting');
assert.match(curriculumHtml,/preventing an attacker from accessing weapons/,
  'Curriculum must include the approved weapons awareness description');
assert.match(curriculumHtml,/Emergency Medical &amp; Trauma Care/i,
  'Curriculum must include Section 5');
assert.match(homepage,/FIVE SECTIONS/,
  'Homepage must advertise five sections');
assert.match(homepage,/Recognize danger\. Avoid unnecessary confrontation\. Defend yourself when necessary\. Provide emergency care when needed\. Get Home Safe\./,
  'Homepage must include the approved philosophy');
assert.match(homepage,/<li><span>02<\/span>Empty-Hand Fighting in a Weapons Environment<\/li>/,
  'Online Training preview on homepage must show Section 2 full title');
assert.ok(homepage.includes('id="online-member-community"'), 'Homepage must describe community features');
for(const term of ['Discussion forums and member feed','Interest groups','Member profiles and photos',
  'Opt-in private messages','Training challenges','Events and seminars',
  'Instructor video feedback requests','Community moderation','Exclusive VIP discussion',
  'Opt-in training partner finder','permanent VIP Founding Member badge']){
  assert.ok(homepage.includes(term), 'Homepage missing community feature '+term);
}
assert.match(homepage,/optionally opt in to the training-partner finder/,
  'Free members should see training-partner privacy benefits');
assert.match(read('programs.html'),/a permanent verified VIP Founding Member badge/,
  'Programs should explain the permanent verified VIP badge');
for(const tier of ['PUBLIC · EVERYONE','REGISTERED · FREE','STANDARD · PAID','VIP · PAID'])
  assert.ok(homepage.includes(tier), 'Homepage missing entitlement tier '+tier);
assert.match(homepage,/the community features currently enabled for Founding members/,
  'Main website must not promise every feature when the administrator controls per-tier access');
assert.ok(!homepage.includes('and all standard community features.'),
  'Avoid promises that conflict with the administrator-controlled member access matrix');
assert.match(js,/vipOpen=Boolean\(data\.vip\?\.enrollmentOpen\)/,
  'Public pricing ticker must consider VIP as well as Founding availability');
assert.match(js,/const choices=\[/,
  'Public beta page should list whichever paid enrollment options are currently open');
assert.ok(!js.includes('Paid lifetime access opens after final checkout setup'),
  'Do not show obsolete checkout-setup promises after enrollment is live');
assert.match(js,/if\(e\.key==='Escape'\).*?t\.setAttribute\('aria-label','Open menu'\)/,
  'Closing mobile menu with Escape must reset its accessible button label');
assert.match(read('index.html'),/Founding Lifetime Membership pricing begins at \$199\.99/, 'Homepage must disclose new founding price');
assert.match(read('sitemap.xml'),/fourpillarscombatives\.com\/online-training\//,'Sitemap must include online training');
const contact=read('contact.html');
assert.match(contact,/<form[^>]+action="https:\/\/formspree\.io\/f\/mljjagkr"[^>]*id="inquiry-form"/i);
assert.match(js,/fetch\('https:\/\/formspree\.io\/f\/mljjagkr'/);
assert.ok(!contact.includes('@formspree/ajax'), 'Two competing Formspree handlers not allowed');
const services=[...contact.matchAll(/<option[^>]*value="([^"]+)"[^>]*>/g)].map(m=>m[1]);
for (const name of pages) {
  const html=read(name+'.html');
  for (const hit of html.matchAll(/href="\/contact\?([^"]+)"/g)) {
    const url=new URL('https://fourpillarscombatives.com/contact?'+hit[1].replaceAll('&amp;','&'));
    const selected=url.searchParams.get('service');
    if(selected)assert.ok(services.includes(selected),name+': inquiry service not in form: '+selected);
  }
}
console.log('PASS: '+pages.length+' pages, '+checked+' internal URLs/assets, fragments, metadata, Facebook icons, training link, and inquiry routing.');
