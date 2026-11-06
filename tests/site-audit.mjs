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

const js=read('assets/site.js');
assert.match(js,/const url = '\/online-training\/'/, 'Navigation must use same-domain training path');
assert.ok(!js.includes('four-pillars-online-training.pages.dev'), 'Old Pages URL present in navigation');
assert.ok(read('index.html').includes('href="/online-training/"'), 'Homepage training link must use the same domain');
const contact=read('contact.html');
assert.match(contact,/<form[^>]+action="https:\/\/formspree\.io\/f\/mljjagkr"[^>]*id="inquiry-form"/i);
assert.match(js,/fetch\('https:\/\/formspree\.io\/f\/mljjagkr'/);
assert.ok(!/<script[^>]+@formspree\\/ajax/.test(contact), 'Two competing Formspree handlers not allowed');
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
