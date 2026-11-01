(()=>{const t=document.querySelector('.menu-toggle'),n=document.querySelector('.nav-links');if(!t||!n)return;t.addEventListener('click',()=>{const isOpen=n.classList.toggle('open');t.setAttribute('aria-expanded',String(isOpen));t.setAttribute('aria-label',isOpen?'Close menu':'Open menu');t.textContent=isOpen?'×':'☰';document.body.classList.toggle('menu-open',isOpen)});n.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{n.classList.remove('open');t.setAttribute('aria-expanded','false');t.setAttribute('aria-label','Open menu');t.textContent='☰';document.body.classList.remove('menu-open')}));document.addEventListener('keydown',e=>{if(e.key==='Escape'){n.classList.remove('open');t.setAttribute('aria-expanded','false');t.textContent='☰';document.body.classList.remove('menu-open')}})})();


// Assemble a readable inquiry email without a third-party form service.
(() => {
  const form = document.querySelector('#inquiry-form');
  if (!form) return;
  const serviceField = document.querySelector('#inq-service');
  const messageField = document.querySelector('#inq-message');
  const status = document.querySelector('#form-status');
  const params = new URLSearchParams(window.location.search);
  const selected = params.get('service');
  if (selected && Array.from(serviceField.options).some(o => o.value === selected)) serviceField.value = selected;
  const topic = params.get('topic');
  if (topic && topic.length < 120) messageField.value = `I'm interested in ${topic}.`;
  const val = name => String(form.elements.namedItem(name)?.value || '').trim();
  function emailText() {
    return [
      'Hello Four Pillars Combatives,',
      '',
      'I would like information about: ' + val('service'),
      '',
      'MY CONTACT DETAILS',
      'Name: ' + val('name'),
      'Email: ' + val('email'),
      'Phone: ' + (val('phone') || 'Not provided'),
      '',
      'TRAINING DETAILS',
      'Number of participants: ' + (val('group') || 'Not specified'),
      'Preferred date: ' + (val('date') || 'Not specified'),
      'Preferred days/times: ' + (val('times') || 'Flexible / not specified'),
      'Training / event location: ' + (val('location') || 'Not specified'),
      '',
      'QUESTIONS OR GOALS',
      val('message') || 'Please contact me with information and availability.',
      '',
      'Thank you!'
    ].join('\n');
  }
  function showStatus(text) { status.textContent = text; status.hidden = false; }
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const subject = 'FPC Availability Request | ' + val('service');
    const url = 'mailto:info@fourpillarscombatives.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(emailText());
    showStatus('Your email app should open with your request ready. Review the details and tap Send there. If it does not open, use Copy request instead.');
    window.location.href = url;
  });
  document.querySelector('#copy-inquiry')?.addEventListener('click', async () => {
    if (!form.reportValidity()) return;
    const content = 'To: info@fourpillarscombatives.com\nSubject: Four Pillars Combatives | ' + val('service') + ' Inquiry\n\n' + emailText();
    try {
      await navigator.clipboard.writeText(content);
      showStatus('Request copied. Open your email app, create a new message, paste the request, and tap Send.');
    } catch {
      showStatus('Your browser could not copy the request. Use Open email to send request, or email info@fourpillarscombatives.com directly.');
    }
  });
})();


// Month view of recurring Monday and Wednesday classes; this is not a live availability calendar.
(() => {
  const grid=document.getElementById('fpc-calendar');
  const label=document.getElementById('calendar-month');
  if (!grid || !label) return;
  const today=new Date();
  let yr=today.getFullYear(),mo=today.getMonth();
  const weekdays=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const fmt=new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric'});
  function draw(){
    const first=new Date(yr,mo,1), last=new Date(yr,mo+1,0);
    label.textContent=fmt.format(first);
    grid.replaceChildren();
    for(const name of weekdays){const el=document.createElement('span');el.className='weekday-name';el.textContent=name;grid.appendChild(el)}
    for(let i=0;i<first.getDay();i++){const el=document.createElement('span');el.className='calendar-empty';el.setAttribute('aria-hidden','true');grid.appendChild(el)}
    for(let n=1;n<=last.getDate();n++){
      const d=new Date(yr,mo,n),dayNum=d.getDay(),isClassDay=dayNum===1||dayNum===3;
      const el=document.createElement('div');el.className='calendar-day'+(isClassDay?' class-day':'');
      if(yr===today.getFullYear()&&mo===today.getMonth()&&n===today.getDate())el.classList.add('today');
      const time=document.createElement('time');time.dateTime=[yr,String(mo+1).padStart(2,'0'),String(n).padStart(2,'0')].join('-');time.textContent=n;el.appendChild(time);
      if(isClassDay){
        const a=document.createElement('a');
        const dateLabel=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(d);
        const dayName=dayNum===1?'Monday':'Wednesday';
        const q=new URLSearchParams({service:'Group Classes',topic:'the '+dayName+' class on '+dateLabel});
        a.href='contact.html?'+q.toString()+'#inquire';a.textContent='5:30–6:50';a.setAttribute('aria-label','Ask about '+dayName+' class on '+dateLabel+', 5:30 to 6:50 PM');el.appendChild(a);
      }
      grid.appendChild(el);
    }
  }
  document.getElementById('calendar-prev')?.addEventListener('click',()=>{mo--;if(mo<0){mo=11;yr--}draw()});
  document.getElementById('calendar-next')?.addEventListener('click',()=>{mo++;if(mo>11){mo=0;yr++}draw()});
  draw();
})();
