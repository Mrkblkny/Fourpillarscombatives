// Public, reviewed answers for the Four Pillars Combatives visitor assistant.
// Update these entries when services or prices change. Never include private
// member records or unpublished student-only lessons in this public file.
export const assistantTopics=Object.freeze([
  {
    id:'start', title:'Getting started',
    keywords:['start','begin','beginner','new','first class','free intro','try a lesson','sign up','join','where do i start'],
    answer:'You can start with a group self-defense class, a private lesson, or a free introductory lesson for local residents. Contact us with your goals and we will confirm the location and available training times before scheduling.',
    href:'/contact?service=Free+Intro+Lesson#inquire',linkText:'Ask about an introductory lesson'
  },
  {
    id:'classes',title:'Group classes and schedule',
    keywords:['group class','weekly','schedule','class time','monday','wednesday','when are classes','regular class','training day'],
    answer:'Four Pillars Combatives offers regular self-defense group classes on Monday and Wednesday from 5:30 to 6:50 PM in the Pearl, Mississippi area. Please contact us to confirm the meeting location and space before attending.',
    href:'/lessons',linkText:'See classes and current schedule'
  },
  {
    id:'group-pricing',title:'Group membership and pricing',
    keywords:['membership cost','monthly','group price','membership price','price for class','class cost','group membership','$75','contract'],
    answer:'Group self-defense memberships start at $75 per month. The website explains available terms and what the membership covers. Private lessons, personal training and workshops are booked separately. Confirm current terms and space with us before enrolling.',
    href:'/pricing',linkText:'See group membership details'
  },
  {
    id:'private',title:'Private lessons',
    keywords:['private lesson','one-on-one','individual','personal lesson','private coaching','semi-private','two people','small group','friends','family'],
    answer:'Private lessons are booked by appointment and can be tailored to self-defense, MMA, Eskrima or other approved training goals. A single 60-minute one-person lesson starts at $40. Two-person and small-group sessions are available; ask us to confirm times and package options.',
    href:'/private-lessons',linkText:'Explore private lessons'
  },
  {
    id:'women',title:"Women's self-defense",
    keywords:['women','woman','female','girls','womens self defense','ladies','self defense workshop for women'],
    answer:"Women's self-defense is available only through seminars, workshops, and private lessons by request—not a separate martial-arts training style, weekly women-only class, or independent small-group program. It covers awareness, boundaries, escape, and personal safety. Women are also welcome in regular self-defense classes.",
    href:'/womens-self-defense',linkText:"Explore women's self-defense"
  },
  {
    id:'seminars',title:'Seminars and workshops',
    keywords:['seminar','workshop','corporate','business','church','organization','retreat','host','travel','out of town','law enforcement','military'],
    answer:'We offer custom local and traveling seminars or workshops for individuals, martial arts schools, businesses, churches, community groups and professionals. Topics and duration are built around the group. Contact us with the location, group size and training goals for a proposal.',
    href:'/seminars',linkText:'Explore seminars and workshops'
  },
  {
    id:'video-coaching',title:'Live Video Private Lessons',
    keywords:['live video','video private','zoom lesson','live online lesson','virtual private lesson','video coaching','online private','remote coaching'],
    answer:'Live one-on-one video private lessons cost $25 per 60-minute session, by appointment. This is personal instruction and is separate from the Online Training lesson library.',
    href:'/pricing#live-video',linkText:'Live video lesson prices'
  },
  {
    id:'online',title:'Online Training and free registration',
    keywords:['online','remote','video lesson','pdf','course','virtual','training library','learn from home','online account','free register'],
    answer:'Four Pillars Combatives Online Training is in PUBLIC BETA. Visitors can create a free student account and view published free lessons. Founding Lifetime and VIP Founding options offer additional access and benefits. New lessons and PDFs are added during beta; see the portal for current availability and pricing.',
    href:'/online-training/',linkText:'Explore Online Training'
  },
  {
    id:'founding',title:'Founding and VIP Online Training',
    keywords:['founding','vip','lifetime','paid online','founder','premium','founding price','vip price','vip founder'],
    answer:'Online Training offers Free, Founding Lifetime and VIP Founding options during PUBLIC BETA. VIP includes the standard Founding benefits, so you do not need to purchase both. Prices increase by tier and availability can change; check the live enrollment page for current details.',
    href:'/online-training/#membership',linkText:'Compare online membership options'
  },
  {
    id:'combat',title:'MMA and combat sports',
    keywords:['mma','boxing','muay thai','wrestling','grappling','jiu jitsu','bjj','combat sports','fight training','competition'],
    answer:'MMA and combat-sports coaching are available by request through private lessons and appropriate workshops or seminars. Four Pillars uses combat-sports skills as part of its broader self-defense approach, while distinguishing competition training from escaping real-world danger.',
    href:'/private-lessons#combat-sports',linkText:'Ask about combat-sports coaching'
  },
  {
    id:'eskrima',title:'Eskrima training',
    keywords:['eskrima','fma','filipino martial arts','stick','knife','weapons class','weapons training'],
    answer:'Eskrima and weapons-related training are available by request in private lessons and suitable workshops or seminars. Training emphasizes responsible, lawful practice and how weapons awareness fits within practical self-defense. Ask about the appropriate format for your goals.',
    href:'/private-lessons',linkText:'Ask about Eskrima lessons'
  },
  {
    id:'fitness',title:'Personal training and fitness',
    keywords:['fitness','personal trainer','weight training','strength','conditioning','mobility','exercise','get in shape','trainer'],
    answer:'Personal training and fitness/conditioning instruction are available by appointment. We can help you discuss strength, endurance, mobility and practical fitness goals and choose a suitable session format.',
    href:'/personal-training',linkText:'Explore personal training'
  },
  {
    id:'curriculum',title:'The five-section self-defense curriculum',
    keywords:['curriculum','five sections','5 sections','awareness','medical','trauma care','course content','what will i learn','self-defense approach'],
    answer:'The full self-defense curriculum has five sections: (1) Environmental & Situational Awareness, (2) Empty-Hand Fighting in a Weapons Environment, (3) Weapons Fighting & Weapon Defense, (4) Fitness & Attributes Training, and (5) Emergency Medical & Trauma Care. The aim is to recognize danger, avoid unnecessary confrontation, defend yourself when necessary, provide emergency care when needed, and get home safe.',
    href:'/training',linkText:'View the self-defense curriculum'
  },
  {
    id:'location',title:'Location and service area',
    keywords:['where','location','address','pearl','mississippi','jackson','brandon','flowood','ridgeland','madison','near me','drive to','training place','visit'],
    answer:'Four Pillars Combatives is based in Pearl, Mississippi, and serves the Jackson Metro area. Training may take place in arranged indoor or outdoor locations. We confirm the location when you contact us—please do not assume a public walk-in storefront.',
    href:'/contact',linkText:'Ask about training locations'
  },
  {
    id:'instructor',title:'About the instructor',
    keywords:['instructor','coach','mark','who teaches','experience','credentials','background','who is teaching'],
    answer:'Four Pillars Combatives is led by Mark, who has trained in martial arts since 1996. His background includes boxing, wrestling, Muay Thai, MMA, submission grappling, Eskrima, U.S. Army and Navy service, and security work. He is also a personal trainer.',
    href:'/about',linkText:'Meet the instructor'
  },
  {
    id:'contact',title:'Contact and booking',
    keywords:['contact','book','appointment','availability','email','call','phone','message','reserve','schedule a session','register for classes'],
    answer:'Contact us to ask questions or request training. You can use the website form, email info@fourpillarscombatives.com, or call 601-213-7419. The form is an inquiry rather than an instant booking; we confirm availability, locations and details before scheduling.',
    href:'/contact#inquire',linkText:'Send a training inquiry'
  }
]);
export const assistantSuggestedQuestions=Object.freeze([
  'When are group classes?',
  'Do you offer women\'s self-defense?',
  'How much are private lessons?',
  'Can I train online?'
]);
const commonWords=new Set(['the','and','for','with','that','this','what','where','when','does','can','you','your','are','how','much','cost','about','there','have','offer','available','their','they','from','four','pillars','combatives','training','please','tell','me','want','need','into','of','to','in','is','a','an','i','we','do','on','it','at','by','as']);
const normalize=text=>String(text||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const terms=text=>normalize(text).split(/\s+/).filter(word=>word.length>2&&!commonWords.has(word));
export function relatedTopics(question,limit=3){
  const query=normalize(question),tokens=terms(question);
  if(!query)return [];
  const scored=assistantTopics.map(topic=>{
    let score=0;
    for(const keyword of topic.keywords){
      const normalized=normalize(keyword);
      if(normalized && query.includes(normalized))score+=normalized.includes(' ')?9:5;
    }
    const topicTokens=new Set(terms(topic.title+' '+topic.keywords.join(' ')));
    for(const token of tokens)if(topicTokens.has(token))score+=2;
    return {topic,score};
  }).filter(item=>item.score>=5).sort((a,b)=>b.score-a.score);
  return scored.slice(0,limit).map(item=>item.topic);
}
export function guidedAnswer(question){
  const topic=relatedTopics(question,1)[0];
  return topic
    ?{answer:topic.answer,links:[{href:topic.href,label:topic.linkText}],topic:topic.id}
    :{answer:'I can help with classes, private lessons, women\'s self-defense, seminars, fitness, Eskrima and Online Training. For a question that needs a personal answer, contact Four Pillars Combatives and we will be glad to help.',links:[{href:'/contact#inquire',label:'Ask the instructor'}],topic:'other'};
}
