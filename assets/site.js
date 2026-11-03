(()=>{const t=document.querySelector('.menu-toggle'),n=document.querySelector('.nav-links');if(!t||!n)return;t.addEventListener('click',()=>{const isOpen=n.classList.toggle('open');t.setAttribute('aria-expanded',String(isOpen));t.setAttribute('aria-label',isOpen?'Close menu':'Open menu');t.textContent=isOpen?'×':'☰';document.body.classList.toggle('menu-open',isOpen)});n.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{n.classList.remove('open');t.setAttribute('aria-expanded','false');t.setAttribute('aria-label','Open menu');t.textContent='☰';document.body.classList.remove('menu-open')}));document.addEventListener('keydown',e=>{if(e.key==='Escape'){n.classList.remove('open');t.setAttribute('aria-expanded','false');t.textContent='☰';document.body.classList.remove('menu-open')}})})();


// Contact form: prefill query parameters and preserve an optional copy-to-email fallback.
// The HTML form posts directly to FormSubmit; do not intercept submission here.
(() => {
  const form = document.querySelector('#inquiry-form');
  if (!form) return;
  const serviceField = document.querySelector('#inq-service');
  const messageField = document.querySelector('#inq-message');
  const status = document.querySelector('#form-status');
  const params = new URLSearchParams(window.location.search);
  const selected = params.get('service');
  if (selected && serviceField && Array.from(serviceField.options).some(o => o.value === selected)) {
    serviceField.value = selected;
  }
  const topic = params.get('topic');
  if (topic && topic.length < 120 && messageField) messageField.value = `I'm interested in ${topic}.`;
  const val = name => String(form.elements.namedItem(name)?.value || '').trim();
  function emailText() {
    return [
      'Hello Four Pillars Combatives,', '',
      'I would like information about: ' + val('service'), '',
      'MY CONTACT DETAILS',
      'Name: ' + val('name'),
      'Email: ' + val('email'),
      'Phone: ' + (val('phone') || 'Not provided'), '',
      'TRAINING DETAILS',
      'Number of participants: ' + (val('group') || 'Not specified'),
      'Preferred date: ' + (val('date') || 'Not specified'),
      'Preferred days/times: ' + (val('times') || 'Flexible / not specified'),
      'Training / event location: ' + (val('location') || 'Not specified'), '',
      'QUESTIONS OR GOALS',
      val('message') || 'Please contact me with information and availability.', '',
      'Thank you!'
    ].join('\n');
  }
  function showStatus(text) {
    if (status) { status.textContent = text; status.hidden = false; }
  }
  document.querySelector('#copy-inquiry')?.addEventListener('click', async () => {
    if (!form.reportValidity()) return;
    const content = 'To: info@fourpillarscombatives.com\nSubject: Four Pillars Combatives | ' + val('service') + ' Inquiry\n\n' + emailText();
    try {
      await navigator.clipboard.writeText(content);
      showStatus('Request copied. Open your email app, paste the details, and send your message.');
    } catch {
      showStatus('Unable to copy automatically. You can email info@fourpillarscombatives.com directly.');
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


// TrustedSite: floating trustmark. The badge is shown after TrustedSite
// validates the website and the site earns its Certified Secure status.
(() => {
  const trustedSiteUrl = 'https://cdn.ywxi.net/js/1.js';
  if (document.querySelector('script[src="' + trustedSiteUrl + '"]')) return;
  const trustmarkScript = document.createElement('script');
  trustmarkScript.src = trustedSiteUrl;
  trustmarkScript.async = true;
  document.body.appendChild(trustmarkScript);
})();


// Facebook: visible, consistent link on every website page.
// No additional image, stylesheet or HTML file is required.
(() => {
  if (document.getElementById('fpc-facebook-floating')) return;
  const link = document.createElement('a');
  link.id = 'fpc-facebook-floating';
  link.href = 'https://www.facebook.com/FourPillarsCombatives/';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', 'Visit Four Pillars Combatives on Facebook (opens in a new tab)');
  link.title = 'Follow Four Pillars Combatives on Facebook';
  link.textContent = 'f';
  Object.assign(link.style, {
    position: 'fixed',
    right: '18px',
    bottom: '88px',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: '#1877f2',
    color: '#ffffff',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontWeight: 'bold',
    fontSize: '34px',
    lineHeight: '1',
    textDecoration: 'none',
    boxShadow: '0 5px 18px rgba(0, 0, 0, .4)',
    zIndex: '99'
  });
  document.body.appendChild(link);
  const style = document.createElement('style');
  style.textContent = `
    #fpc-facebook-floating:hover {
      background-color: #1266d2 !important;
      transform: translateY(-2px);
    }
    #fpc-facebook-floating:focus-visible {
      outline: 3px solid white; outline-offset: 3px;
    }
    body.menu-open #fpc-facebook-floating { display: none !important; }
  `;
  document.head.appendChild(style);
})();
