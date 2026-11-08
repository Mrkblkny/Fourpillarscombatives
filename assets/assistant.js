// Accessible public-site training guide. No account login, recording or
// localStorage required. Visitors' questions are never persisted here.
import {assistantSuggestedQuestions,guidedAnswer} from './assistant-knowledge.js';

const by=(tag,className='',text='')=>{
  const node=document.createElement(tag);
  if(className)node.className=className;
  if(text)node.textContent=text;
  return node;
};
function safeLink(link){
  if(!link||typeof link.href!=='string'||!/^\/(?!\/)/.test(link.href))return null;
  const url=new URL(link.href,location.origin);
  if(url.origin!==location.origin||url.pathname.startsWith('/api/'))return null;
  return {url:url.pathname+url.search+url.hash,label:String(link.label||'Learn more').slice(0,75)};
}
function messageInto(list,text,who='assistant',links=[]){
  const item=by('div','fpc-chat-msg fpc-chat-'+who);
  const content=by('p','',text);item.append(content);
  if(who==='assistant'){
    for(const raw of links.slice(0,2)){
      const link=safeLink(raw);
      if(!link)continue;
      const a=by('a','fpc-chat-link',link.label+' →');
      a.href=link.url;item.append(a);
    }
  }
  list.append(item);
  list.scrollTop=list.scrollHeight;
  return item;
}
export function mountVisitorAssistant(){
  if(document.getElementById('fpc-visitor-assistant'))return;
  const root=by('aside','fpc-visitor-assistant');root.id='fpc-visitor-assistant';
  const launcher=by('button','fpc-chat-launch','Ask about training');
  launcher.type='button';launcher.id='fpc-chat-launch';launcher.setAttribute('aria-expanded','false');
  launcher.setAttribute('aria-controls','fpc-chat-panel');
  launcher.setAttribute('aria-label','Open Four Pillars training assistant');
  const panel=by('section','fpc-chat-panel');panel.id='fpc-chat-panel';panel.hidden=true;
  panel.setAttribute('aria-label','Four Pillars visitor training assistant');
  const header=by('header','fpc-chat-head');
  const heading=by('div','fpc-chat-heading');
  heading.append(by('strong','','Four Pillars Training Guide'),by('span','','Answers about our services'));
  const close=by('button','fpc-chat-close','−');close.type='button';
  close.setAttribute('aria-label','Minimize training assistant');close.title='Minimize';
  header.append(heading,close);
  const history=by('div','fpc-chat-history');history.id='fpc-chat-history';
  history.setAttribute('role','log');history.setAttribute('aria-live','polite');
  history.setAttribute('aria-relevant','additions');
  messageInto(history,'Welcome! Ask about classes, private training, workshops or Online Training. I can point you to the right page.');
  const suggestions=by('div','fpc-chat-suggestions');
  const form=by('form','fpc-chat-form');
  const prompt=by('label','fpc-chat-label','Your question');prompt.htmlFor='fpc-chat-question';
  const input=by('textarea','fpc-chat-input');input.id='fpc-chat-question';input.rows=2;
  input.maxLength=240;input.placeholder='e.g. What do private lessons cost?';input.required=true;
  const submit=by('button','fpc-chat-submit','Ask');submit.type='submit';
  const row=by('div','fpc-chat-entry');row.append(input,submit);
  form.append(prompt,row);
  const note=by('p','fpc-chat-privacy','Public business questions only. Please do not enter private or sensitive information. For booking, use our contact form.');
  panel.append(header,history,suggestions,form,note);
  root.append(launcher,panel);document.body.append(root);
  // Automatically collapse a large open panel after one minute of inactivity.
  // Keep any unsent draft and the entire conversation when minimized.
  // Never interrupt a pending request or somebody actively entering a question.
  const IDLE_MINIMIZE_MS=60_000;
  const COMPACT_LAUNCH_MS=15_000;
  let busy=false;
  let idleTimer=null;
  let compactTimer=null;
  function updateLauncher(compact){
    launcher.classList.toggle('is-compact',compact);
    launcher.textContent=compact?'?':panel.hidden?'Ask about training':'Close guide';
    launcher.title=compact?'Ask about training':'';
  }
  function scheduleCompactLauncher(){
    clearTimeout(compactTimer);
    if(!panel.hidden)return;
    compactTimer=setTimeout(()=>{
      if(panel.hidden)updateLauncher(true);
    },COMPACT_LAUNCH_MS);
  }
  function setOpen(open,{compactOnClose=false}={}){
    clearTimeout(idleTimer);
    clearTimeout(compactTimer);
    idleTimer=null;
    compactTimer=null;
    panel.hidden=!open;
    launcher.setAttribute('aria-expanded',String(open));
    launcher.setAttribute('aria-label',
      open?'Minimize Four Pillars training assistant':'Open Four Pillars training assistant');
    updateLauncher(!open && compactOnClose);
    if(open){
      input.focus();
      scheduleIdleMinimize();
    }else{
      if(panel.contains(document.activeElement))launcher.focus();
      if(!compactOnClose)scheduleCompactLauncher();
    }
  }
  function scheduleIdleMinimize(){
    clearTimeout(idleTimer);
    idleTimer=null;
    if(panel.hidden)return;
    idleTimer=setTimeout(()=>{
      if(panel.hidden)return;
      // Inactivity is based on activity events, not whether a draft exists.
      // Preserve unsent text, but don't let an abandoned draft cover the page.
      if(busy){
        scheduleIdleMinimize();
        return;
      }
      setOpen(false,{compactOnClose:true});
    },IDLE_MINIMIZE_MS);
  }
  launcher.addEventListener('click',()=>setOpen(panel.hidden,{compactOnClose:true}));
  close.addEventListener('click',()=>setOpen(false,{compactOnClose:true}));
  scheduleCompactLauncher();
  for(const eventName of ['input','keydown','pointerdown','scroll']){
    panel.addEventListener(eventName,scheduleIdleMinimize,{
      passive:eventName==='scroll'||eventName==='pointerdown'
    });
  }
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!panel.hidden){setOpen(false);}
  });
  async function ask(question){
    if(busy)return;
    const clean=String(question||'').trim().slice(0,240);
    if(!clean)return;
    busy=true;submit.disabled=true;input.disabled=true;
    suggestions.hidden=true;
    messageInto(history,clean,'visitor');
    input.value='';
    const typing=messageInto(history,'Looking up our training information…');
    let payload;
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),11000);
    try{
      const response=await fetch('/api/visitor-assistant',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({question:clean}),signal:controller.signal,
        credentials:'omit',cache:'no-store'
      });
      if(!response.ok)throw Error('Assistant endpoint unavailable');
      const result=await response.json();
      if(typeof result.answer!=='string'||!result.answer.trim())throw Error('Empty assistant reply');
      payload={answer:result.answer.slice(0,1000),
        links:Array.isArray(result.links)?result.links:[],mode:result.mode};
    }catch{
      payload=guidedAnswer(clean);
      payload.mode='guided';
    }finally{clearTimeout(timeout);}
    typing.remove();
    messageInto(history,payload.answer,'assistant',payload.links);
    if(payload.mode==='ai')messageInto(history,'AI-generated information: please confirm availability and current pricing with the instructor.');
    busy=false;submit.disabled=false;input.disabled=false;
    if(!panel.hidden){
      input.focus();
      scheduleIdleMinimize();
    }
  }
  form.addEventListener('submit',event=>{event.preventDefault();void ask(input.value);});
  input.addEventListener('keydown',event=>{
    if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){
      event.preventDefault();if(!busy)void ask(input.value);
    }
  });
  for(const question of assistantSuggestedQuestions){
    const button=by('button','fpc-chat-suggestion',question);
    button.type='button';button.addEventListener('click',()=>void ask(question));
    suggestions.append(button);
  }
}
