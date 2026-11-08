// Read-only public mobile and desktop audits across the full FPC website.
// These are browser-level layout/navigation checks, not authenticated account QA.
import {test,expect} from '@playwright/test';

const base='https://fourpillarscombatives.com';
const pages=['/','/about','/lessons','/programs','/training',
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
  test('online training hamburger exposes membership links and closes on selection',async({page})=>{
    await page.goto(base+'/online-training/',{waitUntil:'domcontentloaded'});
    await page.locator('#menuToggle').click();
    await expect(page.locator('#mobileNav')).toBeVisible();
    await expect(page.locator('#mobileNav')).toContainText('Founding Membership');
    await page.locator('#mobileNav a[href="#faq"]').click();
    await expect(page.locator('#mobileNav')).toBeHidden();
    await checkResponsive(page,'training menu');
  });
});
