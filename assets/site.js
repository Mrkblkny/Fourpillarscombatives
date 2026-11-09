// Keep an unobtrusive admin sign-in link in the public footer on every page.
// This is navigation only; all administrator APIs independently require authorization.
(() => {
  const links = document.querySelector('.site-footer .footer-links');
  if (!links || links.querySelector('a[href="/online-training/admin/"]')) return;
  const link = document.createElement('a');
  link.href = '/online-training/admin/';
  link.textContent = 'Admin Login';
  links.appendChild(link);
})();

// Read only the public training status. Keep marketing honest before and after
// launch without hard-coding whether sales are open on every website page.
(() => {
  const banners=[...document.querySelectorAll('.online-site-ribbon')];
  const badge=document.querySelector('.fpc-online-copy .eyebrow');
  const membership=document.querySelector('.fpc-online-membership');
  const note=document.querySelector('.fpc-online-note');
  const link=document.querySelector('.fpc-online-copy .btn');
  if(!banners.length && !membership) return;
  fetch('/online-training/api/config',{cache:'no-store'})
    .then(response=>response.ok?response.json():null)
    .then(data=>{
      if(!data || typeof data.enrollmentOpen!=='boolean')return;
      const isOpen=Boolean(data.enrollmentOpen);
      const vipOpen=Boolean(data.vip?.enrollmentOpen);
      const foundingPrice=typeof data.offer?.price==='string'?data.offer.price:null;
      const vipPrice=typeof data.vip?.price==='string'?data.vip.price:null;
      // Pricing page: the public API is the only source for current tier prices.
      // Show a safe fallback when sales are paused or an offer is unavailable.
      const updatePublicPrice=(id,open,price,soldOut)=>{
        const element=document.getElementById(id);
        if(!element)return;
        const valid=typeof price==='string'&&/^\$\d[\d,]*\.\d{2}$/.test(price);
        element.textContent=open?(valid?price:'See live price'):(soldOut?'Sold out':'Enrollment not open');
      };
      updatePublicPrice('foundingCurrentPrice',isOpen,foundingPrice,Boolean(data.lifetimeSoldOut));
      updatePublicPrice('vipCurrentPrice',vipOpen,vipPrice,Boolean(data.vip?.soldOut));
      const choices=[
        isOpen?'Founding '+(foundingPrice||'membership')+' one time':null,
        vipOpen?'VIP '+(vipPrice||'membership')+' one time':null
      ].filter(Boolean);
      const enrollmentOpen=choices.length>0;
      const offerText=choices.join(' · ');
      for(const banner of banners){
        const copy=banner.querySelector('span');
        const cta=banner.querySelector('a');
        if(copy)copy.textContent=enrollmentOpen
          ?'PUBLIC BETA — ONLINE TRAINING ENROLLMENT OPEN. Free registration is available. '+offerText+'. Founding and VIP prices rise by tier.'
          :'PUBLIC BETA — TRAIN FROM ANYWHERE. Free registration is open; see the portal for current Founding and VIP membership availability.';
        if(cta)cta.textContent=enrollmentOpen?'View Membership & Enroll ↗':'Explore Online Training ↗';
      }
      if(membership)membership.textContent=enrollmentOpen
        ?'Public Beta · Free Registration · '+offerText+' · Prices rise by tier'
        :'Public Beta · Free registration available now · Check current Founding and VIP enrollment in the portal';
      if(badge)badge.textContent=enrollmentOpen
        ?'Public Beta · Online Training Enrollment Open / Four Pillars Combatives'
        :'Public Beta / Four Pillars Combatives Online';
      if(note)note.textContent=enrollmentOpen
        ?'Choose one paid membership—not both. '+offerText+'. Prices increase by tier. The training library remains in beta as lessons are added.'
        :'Create a free student account now. Review Founding and VIP options and current enrollment status in the portal. New lessons and PDFs are added during beta.';
      if(link)link.textContent=enrollmentOpen?'View Online Training & Enroll ↗':'Explore Online Training & Register Free ↗';
    })
    .catch(()=>{ /* Stay with static safe pre-launch copy if unavailable. */ });
})();

// Keep Online Training discovery separate from the ONE member sign-in link.
// All Free, Member, Founding and VIP accounts use this same secure portal.
// Admin Login appears ONLY in the footer, never in the navigation.
(() => {
  const nav = document.querySelector('.nav-links');
  if (!nav) return;
  const url = '/online-training/';
  let training = Array.from(nav.querySelectorAll('a')).find(a => a.getAttribute('href') === url);
  if (!training) {
    training = document.createElement('a');
    training.href = url;
    training.textContent = 'Online Training';
    training.setAttribute('data-fpc-online-training', '');
    const instructorLink = Array.from(nav.children).find(el =>
      el.matches('a[href="/about"],a[href="about.html"]'));
    nav.insertBefore(training, instructorLink || nav.querySelector('.nav-cta'));
  }
  if (!nav.querySelector('a[data-fpc-member-login]')) {
    const member = document.createElement('a');
    member.href = '/online-training/?login=1';
    member.textContent = 'Member Login';
    member.className = 'nav-member-login';
    member.setAttribute('data-fpc-member-login', '');
    training.after(member);
  }
})();

// Keep mobile navigation usable at any scroll position. Do not lock the body
// when opening a menu: changing body overflow can break sticky headers on phones.
(() => {
  const toggle=document.querySelector('.menu-toggle');
  const nav=document.querySelector('.nav-links');
  if(!toggle||!nav)return;
  const setMenuOpen=open=>{
    nav.classList.toggle('open',open);
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Close menu':'Open menu');
    toggle.textContent=open?'×':'☰';
    if(!open)nav.querySelectorAll('details.nav-dropdown[open]').forEach(group=>{group.open=false;});
  };
  toggle.addEventListener('click',()=>setMenuOpen(!nav.classList.contains('open')));
  nav.addEventListener('click',event=>{
    if(event.target.closest('a'))setMenuOpen(false);
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&nav.classList.contains('open')){setMenuOpen(false);toggle.focus();}
  });
  window.addEventListener('resize',()=>{
    if(window.innerWidth>1380&&nav.classList.contains('open'))setMenuOpen(false);
  });
})();


// Contact form: a single first-party AJAX submit handler handles Formspree responses.
// A network failure means delivery is unconfirmed, not necessarily unsuccessful.
// HTML POST action remains a fallback when JavaScript is disabled.
(() => {
  const form = document.getElementById('inquiry-form');
  if (!form) return;
  const serviceField = document.getElementById('inq-service');
  const messageField = document.getElementById('inq-message');
  const status = document.getElementById('form-status');
  const emailButton = document.getElementById('email-inquiry-fallback');
  const params = new URLSearchParams(window.location.search);
  const selected = params.get('service');
  if (selected && serviceField && Array.from(serviceField.options).some(o => o.value === selected)) {
    serviceField.value = selected;
  }
  const topic = params.get('topic');
  if (topic && topic.length < 120 && messageField) {
    messageField.value = `I'm interested in ${topic}.`;
  }

  // Only this handler submits the inquiry via JavaScript. Do not also initialize @formspree/ajax.
  const submitButton = form.querySelector('button[type="submit"]');
  let isSending = false;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (isSending || !form.reportValidity()) return;
    isSending = true;
    const oldLabel = submitButton ? submitButton.innerHTML : '';
    if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Sending inquiry…'; }
    showStatus('Sending your inquiry. Please do not press Send again.');
    try {
      const response = await fetch('https://formspree.io/f/mljjagkr', {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      // The HTTP status is authoritative. Never treat an optional JSON parse failure as failed delivery.
      if (response.ok) {
        showStatus('Your inquiry was submitted successfully. Thank you! We will contact you soon.');
        form.reset();
      } else if (response.status >= 400 && response.status < 500) {
        showStatus('Formspree could not accept this submission (error ' + response.status + '). Please check your information or use the email option below.', true);
      } else {
        showStatus('We could not confirm your submission (server error ' + response.status + '). It may already have arrived. Please check before trying again.', true);
      }
    } catch (error) {
      // A request may reach Formspree even when the confirmation is blocked or lost.
      showStatus('We could not verify delivery because the confirmation did not reach your browser. Your inquiry MAY have been received. Please check before submitting again, or use the email option below.', true);
    } finally {
      isSending = false;
      if (submitButton) { submitButton.disabled = false; submitButton.innerHTML = oldLabel; }
    }
  });

  const val = name => String(form.elements.namedItem(name)?.value || '').trim();
  function emailText() {
    return [
      'Hello Four Pillars Combatives,', '',
      'I would like information about: ' + val('service'), '',
      'MY CONTACT DETAILS',
      'Name: ' + val('name'),
      'Email: ' + val('email'),
      'Phone: ' + (val('phone') || 'Not provided'), '',
      'Organization / group: ' + (val('organization') || 'Not provided'),
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
  function showStatus(message, isError = false) {
    if (!status) return;
    status.textContent = message;
    status.hidden = false;
    status.setAttribute('data-error', String(isError));
    status.setAttribute('role', isError ? 'alert' : 'status');
  }
  emailButton?.addEventListener('click', () => {
    if (!form.reportValidity()) return;
    const subject = 'Four Pillars Combatives | ' + val('service') + ' Inquiry';
    const href = 'mailto:info@fourpillarscombatives.com?subject=' +
      encodeURIComponent(subject) + '&body=' + encodeURIComponent(emailText());
    showStatus('Opening your email app. Tap Send there to finish submitting your inquiry.');
    window.location.href = href;
  });

  document.getElementById('copy-inquiry')?.addEventListener('click', async () => {
    if (!form.reportValidity()) return;
    const content = 'To: info@fourpillarscombatives.com\nSubject: Four Pillars Combatives | ' +
      val('service') + ' Inquiry\n\n' + emailText();
    try {
      await navigator.clipboard.writeText(content);
      showStatus('Inquiry copied. Paste it into an email to info@fourpillarscombatives.com and send.');
    } catch {
      showStatus('Unable to copy automatically. Please use the email button or call 601-213-7419.', true);
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
        a.href='/contact?'+q.toString()+'#inquire';a.textContent='5:30–6:50';a.setAttribute('aria-label','Ask about '+dayName+' class on '+dateLabel+', 5:30 to 6:50 PM');el.appendChild(a);
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


;


// On phones, dismiss the navigation when someone taps outside it.
// Escape and in-menu link clicks are already handled by the main menu listener.
(() => {
  const toggle=document.querySelector('.menu-toggle');
  const nav=document.querySelector('.nav-links');
  if(!toggle||!nav)return;
  document.addEventListener('pointerdown',event=>{
    if(!nav.classList.contains('open')||nav.contains(event.target)||toggle.contains(event.target))return;
    nav.classList.remove('open');
    nav.querySelectorAll('details.nav-dropdown[open]').forEach(group=>{group.open=false;});
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label','Open menu');
    toggle.textContent='☰';
    
  });
})();


// Keep the mobile navigation predictable when returning to a page or selecting a
// different section. A previously opened Training submenu must not persist.
(() => {
  const toggle=document.querySelector('.menu-toggle');
  const nav=document.querySelector('.nav-links');
  if(!toggle||!nav)return;
  const closeSubmenus=()=>{
    nav.querySelectorAll('details.nav-dropdown[open]').forEach(menu=>{menu.open=false;});
  };
  toggle.addEventListener('click',()=>{
    if(!nav.classList.contains('open'))closeSubmenus();
  });
  nav.addEventListener('click',event=>{
    if(event.target.closest('a'))closeSubmenus();
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape')closeSubmenus();
  });
})();


// Visitor training assistant: one unobtrusive entry point on public site pages.
// Never mount on the separate Online Training, Community or Admin applications.
(() => {
  if(location.pathname.startsWith('/online-training/'))return;
  const css=document.createElement('link');
  css.rel='stylesheet';css.href='/assets/assistant.css?v=20261109-ux-audit';
  document.head.appendChild(css);
  import('/assets/assistant.js?v=20261109-ux-audit')
    .then(module=>module.mountVisitorAssistant())
    .catch(()=>{ /* A loading error must never interfere with site navigation. */ });
})();

