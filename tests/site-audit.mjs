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
  const description=html.match(/<meta content="([^"]+)" name="description"\/>/i)?.[1];
  assert.ok(description && description.length<=180,file+': overly long SEO description');
  assert.ok(html.includes('<meta content="'+description+'" property="og:description"/>'),
    file+': social description should match the SEO description');

  assert.match(html,/(?:href="https:\/\/fourpillarscombatives\.com[^"]*"[^>]*rel="canonical"|rel="canonical"[^>]*href="https:\/\/fourpillarscombatives\.com[^"]*")/i,file+': missing canonical');
  assert.match(html, /<h1\b/i,file+': missing main heading');
  assert.match(html,/<a class="skip-link" href="#main">Skip to main content<\/a>/,
    file+': missing keyboard skip navigation');
  assert.match(html,/<main id="main">/i,file+': keyboard skip target missing');
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


const home=read('index.html');
assert.match(home,/class="btn btn-outline fpc-member-login" href="\/online-training\/"/,
  'Homepage must offer a clear sign-in path for existing Online Training members');
const siteJs=read('assets/site.js');
assert.match(siteJs,/Online Member Login & Dashboard/,
  'All main-site footers should provide a named Online Training login link');
assert.match(siteJs,/link\.href='\/online-training\/'/,
  'Member login must target the existing protected portal');
assert.match(home,/class="fpc-online-start" aria-label="How online training works"/,
  'Homepage must explain joining, using video/PDF lessons, and authorized community access');
assert.match(home,/Free account|free account/i,'Homepage must mention free registration');
assert.match(home,/Community features depend on your membership permissions/,
  'Homepage must explain feature permissions without promising universal access');
assert.match(siteJs,/document\.addEventListener\('pointerdown'/,
  'Mobile navigation should dismiss when someone taps outside the open menu');
assert.match(siteJs,/nav\.classList\.remove\('open'\)/,
  'Outside-click close must collapse the mobile menu');


const programs=read('programs.html');
assert.match(programs,/Programs &amp; services · Pearl, Jackson Metro &amp; online/,'Program directory must distinguish offered programs and training formats');
assert.match(programs,/06 \/ ONLINE TRAINING · PUBLIC BETA/,'Online Training should be a sixth program');
assert.match(programs,/Founding lifetime prices rise by tier/,'Program link must explain pricing progression');
assert.match(programs,/Women’s self-defense is a specialized program we offer/,
  'Women’s self-defense must be described as an offered program, not a training format');
assert.match(programs,/02 \/ WOMEN’S SELF-DEFENSE PROGRAM/,
  'Women’s self-defense program card must be labeled correctly');
assert.ok(!programs.includes('Six ways to train')&&!programs.includes('Explore six training options'),
  'Program directory must not label all offered services as ways to train');
assert.match(read('about.html'),/EXPLORE WHAT <span class="red">WE OFFER\.<\/span>/,
  'Instructor page should describe services as offerings rather than training formats');
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
assert.match(homepage,/Programs, services &amp; training formats/,
  'Homepage must distinguish offerings from training formats');
assert.match(homepage,/Women’s self-defense is available by request/,
  'Homepage must explain how the women’s self-defense program is offered');
assert.match(homepage,/02 \/ WOMEN’S SELF-DEFENSE PROGRAM/,
  'Homepage must label women’s self-defense as a specialized program');
assert.ok(!homepage.includes('<span class="eyebrow">Ways to train</span>'),
  'Homepage must not classify women’s self-defense as a training format');

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
const seminarsHtml=read('seminars.html');
assert.ok(!/Train the four sections/i.test(seminarsHtml),
  'Seminars must not describe the current five-section curriculum as four sections');
assert.match(seminarsHtml,/five-section Four Pillars Combatives self-defense curriculum/,
  'Seminars should accurately describe their relationship to the five-section curriculum');
const aboutHtml=read('about.html');
assert.ok(!aboutHtml.includes('instructor since 1996'),
  'Do not confuse training since 1996 with teaching since 1996 in SEO metadata');
assert.match(aboutHtml,/trained in martial arts since 1996/,
  'About SEO metadata must accurately reflect experience');
assert.match(homepage,/FIVE SECTIONS/,
  'Homepage must advertise five sections');
assert.match(homepage,/Recognize danger\. Avoid unnecessary confrontation\. Defend yourself when necessary\. Provide emergency care when needed\. Get Home Safe\./,
  'Homepage must include the approved philosophy');
assert.match(homepage,/<li><span>02<\/span>Empty-Hand Fighting in a Weapons Environment<\/li>/,
  'Online Training preview on homepage must show Section 2 full title');
assert.ok(homepage.includes('id="online-member-community"'), 'Homepage must describe community features');
for(const term of ['Community discussions','Training partners &amp; activities',
  'Membership-based access','Free, admin-assigned Member, Founding, and VIP accounts',
  'One paid membership is enough']){
  assert.ok(homepage.includes(term), 'Homepage missing essential community explanation '+term);
}
assert.match(homepage,/Your account shows only the community features enabled for your membership/,
  'Homepage must describe permission-controlled community navigation');
assert.match(homepage,/Opt into the member directory/,
  'Homepage must describe optional directory and partner privacy');
assert.match(read('programs.html'),/a permanent verified VIP Founding Member badge/,
  'Programs should explain the permanent verified VIP badge');
assert.ok(homepage.indexOf('Programs, services &amp; training formats')<homepage.indexOf('id="online-training"'),
  'In-person training choices should be presented before the online beta promotion');
assert.ok(!homepage.includes('and all standard community features.'),
  'Avoid promising unrestricted access to administrator-controlled member features');
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
