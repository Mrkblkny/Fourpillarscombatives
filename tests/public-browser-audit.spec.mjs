// Read-only public mobile and desktop audits across the full FPC website.
// These are browser-level layout/navigation checks, not authenticated account QA.
import {test,expect} from '@playwright/test';

const base='https://fourpillarscombatives.com';
const pages=['/','/about','/lessons','/pricing','/programs','/training',
  '/private-lessons','/womens-self-defense','/seminars',
  '/personal-training','/contact'];
const portalPages=['/online-training/','/online-training/community/',
  '/online-training/admin/'];
const viewports={
  smallMobile:{width:320,height:720},
  mobile:{width:390,height:844},
  tablet:{width:768,height:1024},
  desktop:{width:1365,height:900}
};

async function checkResponsive(page,label){
  const dimensions=await page.evaluate(()=>({
    page:document.documentElement.scrollWidth,
    viewport:document.documentElement.clientWidth
  }));
  expect(dimensions.page-dimensions.viewport,
    label+' must not scroll horizontally').toBeLessThanOrEqual(4);
}
for(const [viewportName,viewport] of Object.entries(viewports)){
  test.describe(viewportName+' public site layout',()=>{
    test.use({viewport,colorScheme:'dark'});
    for(const path of pages){
      test(path+' marketing page shows readable layout and no script crash',async({page})=>{
        const errors=[];
        page.on('pageerror',error=>errors.push(error.message));
        const response=await page.goto(base+path,{waitUntil:'domcontentloaded'});
        expect(response?.status()).toBe(200);
        await expect(page.locator('main#main')).toBeVisible();
        await expect(page.locator('h1').first()).toBeVisible();
        await expect(page.locator('a.skip-link')).toHaveAttribute('href','#main');
        await page.waitForLoadState('load');
        await checkResponsive(page,viewportName+' '+path);
        expect(errors,viewportName+' '+path+' browser errors').toEqual([]);
      });
    }
    for(const path of portalPages){
      test(path+' portal route loads without sideways overflow',async({page})=>{
        const errors=[];
        page.on('pageerror',error=>errors.push(error.message));
        const response=await page.goto(base+path,{waitUntil:'domcontentloaded'});
        expect(response?.status()).toBe(200);
        await page.waitForLoadState('load');
        await checkResponsive(page,viewportName+' '+path);
        const title=await page.title();
        expect(title).toMatch(/Four Pillars Combatives/);
        expect(errors,viewportName+' '+path+' browser errors').toEqual([]);
      });
    }
    test('member Community markup contains no moderator item or administration menu',async({page})=>{
      await page.goto(base+'/online-training/community/',{waitUntil:'domcontentloaded'});
      const nav=page.locator('#sectionNav');
      await expect(nav).toHaveCount(1);
      await expect(nav).not.toContainText('ADMINISTRATION');
      await expect(nav.locator('[data-screen="admin"]')).toHaveCount(0);
      await expect(page.locator('#screen-admin')).toHaveCount(1); // admin-only iframe entry point
    });
    test('Admin Dashboard keeps moderation accessible behind sign-in',async({page})=>{
      await page.goto(base+'/online-training/admin/',{waitUntil:'domcontentloaded'});
      await expect(page.locator('#adminPanel')).toBeHidden();
      await expect(page.locator('#communityHubFrame')).not.toHaveAttribute('src',/embed=admin/);
      await expect(page.locator('#openCommunityModerationPanel')).toHaveCount(1);
    });
  });
}

test.describe('mobile public menus',()=>{
  test.use({viewport:viewports.mobile,colorScheme:'dark'});
  test('Online Training pricing cards keep text above usable buttons on mobile',async({page})=>{
    await page.goto(base+'/pricing',{waitUntil:'load'});
    await expect(page.locator('#online-memberships-heading')).toContainText('ONLINE');
    const cards=page.locator('#online-memberships .online-pricing-card');
    await expect(cards).toHaveCount(3);
    for(const card of await cards.all()){
      const positions=await card.evaluate(node=>{
        const description=node.querySelector('p')?.getBoundingClientRect();
        const action=node.querySelector('a.btn')?.getBoundingClientRect();
        const container=node.getBoundingClientRect();
        return description&&action?{
          spacing:action.top-description.bottom,
          actionWithin:action.bottom<=container.bottom+2,
          actionWidth:action.width,
          cardWidth:container.width
        }:null;
      });
      expect(positions).not.toBeNull();
      expect(positions.spacing,'Text must not overlap CTA').toBeGreaterThanOrEqual(8);
      expect(positions.actionWithin,'CTA must stay inside its card').toBe(true);
      expect(positions.actionWidth,'CTA needs a usable width').toBeGreaterThan(160);
      expect(positions.actionWidth,'CTA should not exceed card width').toBeLessThanOrEqual(positions.cardWidth+2);
    }
    await checkResponsive(page,'mobile Online Training pricing');
  });
  test('main website hamburger opens and closes with Escape',async({page})=>{
    await page.goto(base+'/',{waitUntil:'domcontentloaded'});
    const toggle=page.locator('.menu-toggle');
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded','true');
    await expect(page.locator('.nav-links')).toHaveClass(/open/);
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded','false');
    await checkResponsive(page,'main menu');
  });
  test('one Member Login in main menu opens real sign-in, Admin Login stays in footer',async({page})=>{
    await page.goto(base+'/',{waitUntil:'domcontentloaded'});
    const menu=page.locator('#navigation');
    await expect(menu.locator('[data-fpc-member-login]')).toHaveCount(1);
    await expect(menu.locator('a[href="/online-training/admin/"]')).toHaveCount(0);
    await expect(page.locator('footer a[href="/online-training/admin/"]')).toHaveCount(1);
    await expect(page.locator('footer a[data-fpc-member-login]')).toHaveCount(0);
    await page.locator('.menu-toggle').click();
    const member=menu.locator('[data-fpc-member-login]');
    await expect(member).toHaveText('Member Login');
    await expect(member).toHaveAttribute('href','/online-training/?login=1');
    await member.click();
    await expect(page).toHaveURL(/\/online-training\/\?login=1/);
    await expect(page.locator('#accountView')).toBeVisible({timeout:30000});
    await expect(page.locator('#authForm')).toBeVisible();
    await expect(page.locator('#mobileLogin')).toHaveText('Member Login');
    await checkResponsive(page,'direct Member Login');
  });
  test('online training hamburger exposes membership links and closes on selection',async({page})=>{
    await page.goto(base+'/online-training/',{waitUntil:'domcontentloaded'});
    await page.locator('#menuToggle').click();
    await expect(page.locator('#mobileNav')).toBeVisible();
    await expect(page.locator('#mobileNav')).toContainText('Membership');
    await expect(page.locator('#mobileNav')).not.toContainText('VIP Founding Membership');
    await expect(page.locator('#headerClaim')).toHaveCount(0);
    await page.locator('#mobileNav a[href="#faq"]').click();
    await expect(page.locator('#mobileNav')).toBeHidden();
    await checkResponsive(page,'training menu');
  });
});


// Verify the entire real visitor conversion path after both Cloudflare
// deployments. No account is submitted and no purchase is attempted.
test.describe('Live free registration entry',()=>{
  test.use({viewport:viewports.mobile,colorScheme:'dark'});
  test('main website free account CTA reaches the signup form without another sales page',async({page})=>{
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base+'/',{waitUntil:'domcontentloaded'});
    const cta=page.locator('#online-training .fpc-online-actions a.btn');
    await expect(cta).toHaveAttribute('href','/online-training/?register=1');
    await expect(page.locator('#online-training .fpc-online-compare'))
      .toHaveAttribute('href','/online-training/#membership');
    await cta.click();
    await expect(page).toHaveURL(/\\/online-training\\/\\?register=1$/);
    await expect(page.locator('#accountView')).toBeVisible({timeout:30000});
    await expect(page.locator('#signupNameField')).toBeVisible();
    await expect(page.locator('#signupNoCardNotice')).toBeVisible();
    await expect(page.locator('#authSubmit')).toHaveText('Create account');
    await checkResponsive(page,'free registration');
    expect(errors).toEqual([]);
  });
});

// The assistant is supplementary. It must not cover the page with an
// uncloseable modal, overflow narrow phones or send payment/member actions.
for(const [name,viewport] of [['phone',viewports.mobile],['desktop',viewports.desktop]]){
  test.describe(name+' public visitor training assistant',()=>{
    test.use({viewport,colorScheme:'dark'});
    test('opens, answers from approved public info and closes by Escape',async({page})=>{
      await page.goto(base+'/',{waitUntil:'domcontentloaded'});
      const launcher=page.locator('#fpc-chat-launch');
      await expect(launcher).toBeVisible({timeout:30000});
      await expect(launcher).toHaveAttribute('aria-expanded','false');
      await launcher.click();
      await expect(page.locator('#fpc-chat-panel')).toBeVisible();
      await expect(launcher).toHaveAttribute('aria-expanded','true');
      await page.locator('.fpc-chat-suggestion',{hasText:'When are group classes?'}).click();
      await expect(page.locator('#fpc-chat-history')).toContainText('Monday and Wednesday',{timeout:16000});
      await expect(page.locator('#fpc-chat-history a[href="/lessons"]')).toBeVisible();
      await checkResponsive(page,name+' assistant');
      await page.keyboard.press('Escape');
      await expect(page.locator('#fpc-chat-panel')).toBeHidden();
      await expect(launcher).toHaveAttribute('aria-expanded','false');
      await expect(page.locator('#visitor-faq details')).toHaveCount(8);
    });
  });
}

test.describe('public assistant backend',()=>{
  test.use({viewport:viewports.desktop});
  test('live same-origin API returns a reviewed answer without requiring a login',async({page})=>{
    await page.goto(base+'/',{waitUntil:'domcontentloaded'});
    const result=await page.evaluate(async()=>{
      const reply=await fetch('/api/visitor-assistant',{
        method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({question:'When are group classes?'})
      });
      const payload=await reply.json().catch(()=>({}));
      return {status:reply.status,answer:payload.answer,topic:payload.topic};
    });
    expect(result.status).toBe(200);
    expect(result.topic).toBe('classes');
    expect(result.answer).toMatch(/Monday and Wednesday/);
  });
});


// Check the actual reported failure: at substantial scroll depth, opening
// the menu must not modify page scroll position or hide the sticky header.
for(const [label,viewport] of [
  ['phone after scroll',{width:390,height:844}],
  ['tablet after scroll',{width:768,height:1024}],
  ['wide navigation after scroll',{width:1200,height:800}]
]){
  test.describe(label,()=>{
    test.use({viewport,colorScheme:'dark'});
    test('hamburger works midway down the homepage and closes predictably',async({page})=>{
      // Wait for layout-affecting assets before testing scroll stability.
      // A late font/image load can adjust scroll anchoring by hundreds of pixels,
      // which is unrelated to opening the navigation menu.
      await page.goto(base+'/',{waitUntil:'load'});
      await page.evaluate(async()=>{
        await document.fonts?.ready;
        await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      });
      await page.evaluate(()=>window.scrollTo(0,Math.floor(document.body.scrollHeight*0.55)));
      await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeGreaterThan(300);
      const previousY=await page.evaluate(()=>window.scrollY);
      const toggle=page.locator('.menu-toggle');
      // Confirm the header is already onscreen, avoiding Playwright's own
      // scroll-to-click behavior from being mistaken for a site menu jump.
      const headerBefore=await page.locator('.site-header').boundingBox();
      expect(headerBefore).not.toBeNull();
      expect(headerBefore.y).toBeGreaterThanOrEqual(-3);
      expect(headerBefore.y).toBeLessThan(6);
      await expect(toggle).toBeVisible();
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded','true');
      await expect(page.locator('.nav-links')).toHaveClass(/open/);
      const layout=await page.evaluate(()=>{
        const header=document.querySelector('.site-header').getBoundingClientRect();
        const menu=document.querySelector('.nav-links').getBoundingClientRect();
        return {headerTop:header.top,menuTop:menu.top,menuBottom:menu.bottom,y:window.scrollY};
      });
      expect(layout.headerTop).toBeGreaterThanOrEqual(-3);
      expect(layout.menuTop).toBeGreaterThanOrEqual(0);
      expect(layout.menuBottom).toBeGreaterThan(layout.menuTop);
      expect(Math.abs(layout.y-previousY)).toBeLessThan(6);
      const training=page.locator('.nav-dropdown summary');
      await training.click();
      await expect(page.locator('.nav-dropdown')).toHaveAttribute('open','');
      await page.keyboard.press('Escape');
      await expect(page.locator('.nav-links')).not.toHaveClass(/open/);
      await expect(toggle).toHaveAttribute('aria-expanded','false');
      await checkResponsive(page,label);
    });
  });
}
test.describe('Static website, no scroll-reveal animations',()=>{
  test.use({viewport:viewports.mobile,colorScheme:'dark'});
  test('headings and cards remain visible without JS reveal states',async({page})=>{
    await page.goto(base+'/',{waitUntil:'domcontentloaded'});
    const card=page.locator('.growth-service-card').first();
    await card.scrollIntoViewIfNeeded();
    await expect(card).toBeVisible();
    await expect(card).not.toHaveClass(/fpc-motion-pending/);
    const state=await page.evaluate(()=>{
      const card=document.querySelector('.growth-service-card');
      return {
        animation:getComputedStyle(card).animationName,
        transition:getComputedStyle(card).transitionDuration,
        scrolling:getComputedStyle(document.documentElement).scrollBehavior
      };
    });
    expect(state.animation).toBe('none');
    expect(state.transition).toBe('0s');
    expect(state.scrolling).toBe('auto');
  });
});
test.describe('Visitor assistant auto-minimization',()=>{
  test.use({viewport:viewports.mobile,colorScheme:'dark'});
  test('Minimizes after idle time, keeps conversation and preserves unfinished drafts',async({page})=>{
    await page.clock.install();
    await page.goto(base+'/',{waitUntil:'domcontentloaded'});
    const launcher=page.locator('#fpc-chat-launch');
    const panel=page.locator('#fpc-chat-panel');
    await expect(launcher).toBeVisible({timeout:30000});
    await launcher.click();
    await expect(panel).toBeVisible();
    const loadedCode=await page.evaluate(async()=>{
      const response=await fetch('/assets/assistant.js?v=20261108-compact',{cache:'no-store'});
      const code=await response.text();
      return {
        status:response.status,
        hasIdleTimer:code.includes('IDLE_MINIMIZE_MS=40_000'),
        hasCompactLauncher:code.includes('COMPACT_LAUNCH_MS=10_000')
      };
    });
    expect(loadedCode.status).toBe(200);
    expect(loadedCode.hasIdleTimer).toBe(true);
    expect(loadedCode.hasCompactLauncher).toBe(true);
    await page.clock.runFor(41_000);
    await expect(panel).toBeHidden();
    await expect(launcher).toHaveAttribute('aria-expanded','false');
    await launcher.click();
    await expect(panel).toBeVisible();
    await expect(page.locator('#fpc-chat-history')).toContainText('Welcome! Ask about classes');
    const draft=page.locator('#fpc-chat-question');
    await draft.fill('I would like to ask about');
    await page.clock.runFor(41_000);
    await expect(panel).toBeHidden();
    await launcher.click();
    await expect(panel).toBeVisible();
    await expect(draft).toHaveValue('I would like to ask about');
    await draft.fill('');
    await page.clock.runFor(41_000);
    await expect(panel).toBeHidden();
    await checkResponsive(page,'auto-minimized training assistant');
  });
});


test.describe('Visitor assistant stays unobtrusive on mobile',()=>{
  test.use({viewport:viewports.mobile,colorScheme:'dark'});
  test('shrinks when idle, auto-minimizes a draft and restores it on reopen',async({page})=>{
    await page.clock.install();
    await page.goto(base+'/',{waitUntil:'domcontentloaded'});
    const launcher=page.locator('#fpc-chat-launch');
    const panel=page.locator('#fpc-chat-panel');
    await expect(launcher).toBeVisible({timeout:30000});
    await page.clock.runFor(11_000);
    await expect(launcher).toHaveClass(/is-compact/);
    await expect(launcher).toHaveAttribute('aria-label','Open Four Pillars training assistant');
    await launcher.click();
    await expect(panel).toBeVisible();
    const draft=page.locator('#fpc-chat-question');
    await draft.fill('Can I arrange a private lesson?');
    await page.clock.runFor(41_000);
    await expect(panel).toBeHidden();
    await expect(launcher).toHaveClass(/is-compact/);
    await launcher.click();
    await expect(panel).toBeVisible();
    await expect(draft).toHaveValue('Can I arrange a private lesson?');
    await checkResponsive(page,'compact assistant with saved draft');
  });
});
