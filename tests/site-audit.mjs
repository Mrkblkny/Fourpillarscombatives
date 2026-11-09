// Four Pillars Combatives: static page and navigation smoke tests.
// Run with: node tests/site-audit.mjs
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const root=resolve('.');
const pages=['index','lessons','pricing','womens-self-defense','private-lessons',
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
  assert.ok(html.includes('href="/assets/tactical.css?v=20261109-fixed-header"'),
    file+': header fix stylesheet must have a fresh asset URL');
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
assert.doesNotMatch(home,/fpc-member-login/,
  'Homepage must not duplicate Member Login outside the navigation');
const siteJs=read('assets/site.js');
assert.match(siteJs,/member\.textContent = 'Member Login'/,
  'Main navigation should use exactly one Member Login');
assert.match(siteJs,/member\.href = '\/online-training\/\?login=1'/,
  'Member Login should open the actual sign-in form');
assert.ok(!siteJs.includes('Online Member Login & Dashboard'),
  'The footer must not repeat Member Login');
assert.match(home,/class="fpc-online-start" aria-label="How online training works"/,
  'Homepage must explain joining, using video/PDF lessons, and authorized community access');
assert.match(home,/Free account|free account/i,'Homepage must mention free registration');
assert.match(home,/Free Community Hub access:/,
  'Homepage must clearly advertise free community access');
assert.match(home,/Events &amp; Seminars, Private Messaging, and Find Training Partners/,
  'Homepage must name the three free Community Hub features');
assert.match(siteJs,/document\.addEventListener\('pointerdown'/,
  'Mobile navigation should dismiss when someone taps outside the open menu');
assert.match(siteJs,/const closeSubmenus=\(\)=>\{/,
  'Closing mobile navigation should reset any expanded Training menu');
assert.match(siteJs,/nav\.querySelectorAll\('details\.nav-dropdown\[open\]'\)/,
  'Expanded training submenus should be closed on navigation changes');
assert.match(siteJs,/if\(!nav\.classList\.contains\('open'\)\)closeSubmenus\(\)/,
  'Closing the hamburger menu should also collapse nested training options');
assert.match(siteJs,/nav\.classList\.remove\('open'\)/,
  'Outside-click close must collapse the mobile menu');



 
// Old blog links reported in Google Search Console (Nov 7) should lead to
// matching current material, not a generic homepage or a new account login.
const legacyRedirects=new Map([
  ['/blog/f/why-choose-eskrima-for-real-world-defense','/private-lessons#eskrima-private-lessons'],
  ['/blog/f/skill-fades-without-use-train-consistently','/training#skill-is-perishable'],
  ['/blog/f/eskrima-vs-bjj-why-weapons-training-wins','/training#combat-sports-vs-self-defense'],
  ['/f/why-train-for-self-defense','/training'],
  ['/blog/f/why-you-must-train-for-everything-in-self-defense','/training#curriculum-skills'],
  ['/blog/f/training-for-self-defense-why-it-has-to-be-different','/training#combat-sports-vs-self-defense'],
  ['/blog/f/is-weapon-defense-useless-why-you-should-train','/training#close-range-and-firearms'],
  ['/four-pillars-combatives-1','/'],
  ['/four-pillars-combatives','/'],
  ['/page/Programs','/programs'],
  ['/full-list-of-our-programs','/programs'],
  ['/blog/f/scenario-training-key-to-real-world-self-defense','/training#curriculum-skills']
]);
const redirects=read('_redirects');
for(const [source,target] of legacyRedirects){
  assert.ok(redirects.split('\n').some(line=>line===source+' '+target+' 301'),
    'Missing specific 301 redirect for '+source);
  const [destination,hash]=target.split('#');
  const page=destination==='/'?'index.html':destination.slice(1)+'.html';
  assert.ok(existsSync(resolve(root,page)),'Missing new destination '+destination);
  if(hash) assert.ok(idsFor.get(page)?.has(hash),
    'Legacy blog redirects must point to an existing current section: '+target);
}
assert.doesNotMatch(redirects,/^\/m\/(?:account|create|reset)\s/m,
  'Legacy account URLs must not be redirected to unrelated new membership accounts');
console.log('PASS: 12 retired URLs map to relevant current pages; old account routes unchanged.');

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
assert.match(read('index.html'), /href="\/online-training\/admin\/">Admin Login<\/a>/, 'Homepage footer must have one Admin Login');
assert.match(js, /link\.textContent = 'Admin Login'/, 'Other pages must use the same footer Admin Login label');
assert.ok(!js.includes("className = 'nav-admin-login'"), 'Admin Login must not be injected into the mobile navigation');
assert.ok(!read('assets/styles.css').includes('.nav-links.open .nav-admin-login'),
  'Admin Login must not appear in the mobile navigation');
for(const name of pages){
  const html=read(name+'.html');
  const header=(html.split('<header')[1]||'').split('</header>')[0];
  assert.ok(!header.includes('/online-training/admin/'),name+': admin link belongs in footer only');
}
const homepage=read('index.html');
const allPrices=read('pricing.html');
assert.match(homepage,/06 \/ ONLINE TRAINING · PUBLIC BETA/,'Online Training must appear in What We Offer');
assert.match(homepage,/07 \/ LIVE VIDEO PRIVATE LESSONS/,'Live video lessons must appear in What We Offer');
assert.match(read('programs.html'),/07 \/ LIVE VIDEO PRIVATE LESSONS/,'Programs must show live video lessons');
assert.match(allPrices,/id="live-video"/,'Pricing must include live video lesson anchor');
assert.match(allPrices,/id="online-memberships"/,'Pricing must include the separate online training memberships');
assert.match(allPrices,/id="online-memberships-heading">ONLINE <span class="red">TRAINING\.<\/span>/,'Pricing should use the approved short Online Training name');
assert.match(allPrices,/id="foundingCurrentPrice"/,'Founding price should be shown from live public config');
assert.match(allPrices,/id="vipCurrentPrice"/,'VIP price should be shown from live public config');
assert.match(allPrices,/Events &amp; Seminars, Private Messaging, and Find Training Partners/,'Free pricing card should list all three Community benefits');
assert.match(read('assets/site.js'),/updatePublicPrice\('foundingCurrentPrice'/,'Founding price should use the public config response');
assert.match(read('assets/site.js'),/updatePublicPrice\('vipCurrentPrice'/,'VIP price should use the public config response');
assert.match(read('assets/marketing.css'),/\.online-pricing-card \.btn/,'Pricing card buttons should have dedicated mobile-safe layout');
assert.match(allPrices,/\$25/,'Pricing must include published video lesson rate');
assert.match(read('sitemap.xml'),/fourpillarscombatives\.com\/pricing/,'Sitemap must include pricing page');
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
assert.doesNotMatch(homepage,/Medical lessons coming soon during public beta/i,
  'Do not describe the live medical curriculum as entirely coming soon');
assert.match(homepage,/Additional medical lessons and handouts will be published as they are ready/,
  'Medical curriculum must describe additions during public beta');
assert.match(homepage,/Recognize danger\. Avoid unnecessary confrontation\. Defend yourself when necessary\. Provide emergency care when needed\. Get Home Safe\./,
  'Homepage must include the approved philosophy');
assert.match(homepage,/<li><span>02<\/span>Empty-Hand Fighting in a Weapons Environment<\/li>/,
  'Online Training preview on homepage must show Section 2 full title');
assert.ok(homepage.includes('id="online-member-community"'), 'Homepage must describe community features');
for(const term of ['Paid-member discussions','Included with free registration',
  'Membership-based access','Free, admin-assigned Member, Founding, and VIP accounts',
  'One paid membership is enough']){
  assert.ok(homepage.includes(term), 'Homepage missing essential community explanation '+term);
}
assert.match(homepage,/Your signed-in account shows only the features available to you/,
  'Homepage must describe permission-controlled community navigation');
assert.match(homepage,/opted-in training partners by general area/,
  'Homepage must describe opt-in partner privacy and general-area discovery');
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
assert.match(js,/event\.key==='Escape'&&nav\.classList\.contains\('open'\)/,
  'Escape should close the mobile navigation at every scroll position');
assert.match(js,/toggle\.setAttribute\('aria-label',open\?'Close menu':'Open menu'\)/,
  'Mobile menu must update its accessible button label when opening or closing');
assert.doesNotMatch(js,/document\.body\.classList\.toggle\('menu-open'/,
  'Opening navigation must never lock body overflow and break sticky navigation');
const css=read('assets/styles.css');
assert.match(css,/body\.menu-open\{overflow:visible\}/,
  'Body overflow must remain stable when the mobile menu opens');
assert.doesNotMatch(js,/IntersectionObserver/,
  'Scroll-reveal animations must remain removed');
assert.doesNotMatch(css,/@keyframes fpc-entrance/,
  'Main site motion effects must remain removed');
assert.match(css,/animation:none!important/,
  'Static interface should disable animations');
assert.match(read('index.html'),/Founding and VIP prices increase by tier; check current options/, 'Homepage should not show an outdated starting price when current tier is higher');
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
