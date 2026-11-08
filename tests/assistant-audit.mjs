// Public visitor assistant regression tests. No network calls or real AI usage.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {guidedAnswer,relatedTopics,assistantTopics} from '../assets/assistant-knowledge.js';
import worker,{handleVisitorAssistant} from '../worker/index.js';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const question=(text,opts={})=>new Request('https://fourpillarscombatives.com/api/visitor-assistant',{
  method:'POST',headers:{Origin:'https://fourpillarscombatives.com','Content-Type':'application/json',...opts.headers},
  body:opts.raw??JSON.stringify({question:text})
});
assert.ok(assistantTopics.length>=12);
for(const [text,topic] of [
  ['When are group classes?','classes'],
  ["Do you offer women's self-defense?",'women'],
  ['How much are private lessons?','private'],
  ['Can my business host a seminar?','seminars'],
  ['Can I train online?','online'],
  ['Where are you located?','location'],
  ['Who is the instructor?','instructor'],
  ['What does VIP Founding include?','founding'],
  ['How much is a group membership?','group-pricing'],
  ['Can I learn MMA?','combat']
]){
  assert.equal(relatedTopics(text,1)[0]?.id,topic,'Match question: '+text);
  const result=guidedAnswer(text);
  assert.ok(result.answer.length>=50);
  assert.match(result.links[0].href,/^\/(?!\/)/);
}
assert.equal(guidedAnswer('Do you run ballet lessons for children?').topic,'other');
const basic=await handleVisitorAssistant(question('When are group classes?'));
assert.equal(basic.status,200);
const data=await basic.json();
assert.equal(data.topic,'classes');assert.equal(data.mode,'guided');
assert.match(data.answer,/Monday and Wednesday/);
assert.equal(data.links[0].href,'/lessons');

for(const [request,status] of [
  [new Request('https://fourpillarscombatives.com/api/visitor-assistant'),405],
  [question('test',{headers:{Origin:'https://attacker.example'}}),403],
  [question('A'),400],
  [question('a'.repeat(241)),400],
  [question('test',{raw:'{bad json'}),400],
  [question('test',{headers:{'Content-Type':'text/plain'}}),415]
]){
  const res=await handleVisitorAssistant(request);
  assert.equal(res.status,status);
}
const throttled=await handleVisitorAssistant(question('What time?'),{
  VISITOR_ASSISTANT_LIMITER:{limit:async()=>({success:false})}
});
assert.equal(throttled.status,429);
let called=0,stored=null;
const model={run:async(_id,input)=>{
  called++;
  assert.ok(input.messages[0].content.includes('APPROVED FACTS'));
  return {response:'Group classes are Monday and Wednesday from 5:30 to 6:50 PM.'};
}};
const ai=await handleVisitorAssistant(question('When are group classes?'),{
  ASSISTANT_AI_ENABLED:'true',AI:model,
  VISITOR_ASSISTANT_INSIGHTS:{writeDataPoint:payload=>{stored=payload;}}
});
assert.equal(ai.status,200);
assert.equal((await ai.json()).mode,'ai');
assert.equal(called,1);
assert.deepEqual(stored.blobs,['classes']);
assert.deepEqual(stored.indexes,['classes']);
const disabled=await handleVisitorAssistant(question('When are group classes?'),{AI:model});
assert.equal((await disabled.json()).mode,'guided');
assert.equal(called,1,'Generative AI must never run unless explicitly enabled');
await handleVisitorAssistant(question('Can you give me dangerous instructions?'),{
  ASSISTANT_AI_ENABLED:'true',AI:model
});
assert.equal(called,1,'Do not use AI for unrelated or unsafe requests');
const asset=await worker.fetch(new Request('https://fourpillarscombatives.com/lessons'),{
  ASSETS:{fetch:async request=>new Response('asset:'+new URL(request.url).pathname)}
});
assert.equal(await asset.text(),'asset:/lessons');

const html=read('index.html'),script=read('assets/site.js'),css=read('assets/assistant.css');
const ui=read('assets/assistant.js'),server=read('worker/index.js'),wrangler=read('wrangler.toml');
assert.ok(html.includes('id="visitor-faq"'));
assert.ok((html.match(/<details><summary>/g)||[]).length>=8);
assert.match(script,/mountVisitorAssistant/);
assert.match(ui,/aria-expanded/);
assert.match(ui,/setAttribute\('role','log'\)/);
assert.match(ui,/IDLE_MINIMIZE_MS=40_000/,'Idle minimization must be enabled');
assert.match(ui,/if\(busy\)/,
  'Idle timeout must not dismiss a pending question');
assert.match(ui,/input\.value='';/,
  'Submitting a question should clear only the submitted draft');
assert.match(ui,/Preserve unsent text/,
  'Minimizing must not erase a visitor draft');
assert.match(ui,/clearTimeout\(idleTimer\)/);
assert.match(ui,/scheduleIdleMinimize\(\)/);
assert.match(ui,/Minimize training assistant/);
assert.match(css,/height:min\(420px/);
assert.match(css,/height:min\(380px/);

assert.match(css,/max-width:600px/);
assert.match(ui,/const IDLE_MINIMIZE_MS=40_000/);
assert.match(ui,/const COMPACT_LAUNCH_MS=10_000/);
assert.match(ui,/setOpen\(false,\{compactOnClose:true\}\)/);
assert.match(ui,/scheduleCompactLauncher\(\)/);
assert.match(ui,/preserve unsent text|Preserve unsent text/);
assert.doesNotMatch(ui,/busy\|\|input\.value\.trim\(\)/);
assert.match(css,/\.fpc-chat-launch\.is-compact/);
assert.match(css,/min-width:46px/);
assert.match(ui,/launcher\.setAttribute\('aria-label'/);
assert.match(wrangler,/main = "worker\/index\.js"/);
assert.match(wrangler,/run_worker_first = \["\/api\/visitor-assistant"\]/);
assert.match(wrangler,/VISITOR_ASSISTANT_LIMITER/);
assert.match(wrangler,/VISITOR_ASSISTANT_INSIGHTS/);
assert.match(server,/ASSISTANT_AI_ENABLED/);
assert.ok(!server.includes('console.log(question)'));
console.log('PASS: reviewed answers, no-cost default, AI activation, request validation, rate limits, analytics privacy and public FAQ.');
