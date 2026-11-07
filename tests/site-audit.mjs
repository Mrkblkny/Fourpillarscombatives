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
  assert.ok(!html.includes('<h3>WEAPONS FIGHTING</h3>'),name+': Section 3 must be named Weapons');
  assert.ok(!html.includes('<h3>EMPTY-HAND FIGHTING</h3>'),name+': Section 2 must mention a weapons environment');
}

const js=read('assets/site.js');
assert.match(js,/const url = '\/online-training\/'/, 'Navigation must use same-domain training path');
assert.ok(!js.includes('four-pillars-online-training.pages.dev'), 'Old Pages URL present in navigation');
assert.ok(read('index.html').includes('href="/online-training/"'), 'Homepage training link must use the same domain');
assert.match(read('index.html'), /href="\/online-training\/admin\/">Online Training Admin Login<\/a>/, 'Homepage footer must expose the admin login');
assert.match(js, /Online Training Admin Login/, 'Other pages must receive the footer admin link');
assert.match(js, /className = 'nav-admin-login'/, 'Main mobile navigation must include Admin Login');
assert.match(js, /link\.href = '\/online-training\/admin\/'/, 'Mobile Admin Login must point to the protected portal');
assert.match(read('assets/styles.css'), /\.nav-links\.open \.nav-admin-login\{display:block\}/, 'Mobile Admin Login must be visible when menu opens');
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
