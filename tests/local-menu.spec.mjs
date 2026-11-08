import {test,expect} from '@playwright/test';

const base='http://127.0.0.1:8765';
const sizes=[
  {width:390,height:844},
  {width:768,height:1024},
  {width:1200,height:850}
];

for(const viewport of sizes){
  test.describe('Locally built website: menu at '+viewport.width+'px',()=>{
    test.use({viewport,colorScheme:'dark'});
    test('mobile menu opens after scrolling and permits Training dropdown',async({page})=>{
      const errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      await page.goto(base+'/',{waitUntil:'domcontentloaded'});
      await page.evaluate(()=>window.scrollTo(0,Math.floor(document.body.scrollHeight*0.6)));
      await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(250);
      const before=await page.evaluate(()=>scrollY);
      const toggle=page.locator('.menu-toggle');
      await expect(toggle).toBeVisible();
      const header=await page.locator('.site-header').boundingBox();
      expect(header.y).toBeGreaterThanOrEqual(-2);
      await toggle.click();
      await expect(page.locator('.nav-links')).toHaveClass(/open/);
      const after=await page.evaluate(()=>scrollY);
      expect(Math.abs(after-before)).toBeLessThan(5);
      const nav=page.locator('.nav-links');
      await expect(nav).toBeVisible();
      await nav.locator('summary').click();
      await expect(nav.locator('.nav-dropdown')).toHaveAttribute('open','');
      await page.keyboard.press('Escape');
      await expect(nav).not.toHaveClass(/open/);
      await expect(toggle).toHaveAttribute('aria-expanded','false');
      expect(errors).toEqual([]);
    });
  });
}

test.describe('Locally built website: motion-free assistant',()=>{
  test.use({viewport:{width:390,height:844},colorScheme:'dark'});
  test('assistant minimizes and remembers an unsent question',async({page})=>{
    await page.clock.install();
    await page.goto(base+'/',{waitUntil:'domcontentloaded'});
    const launcher=page.locator('#fpc-chat-launch');
    const panel=page.locator('#fpc-chat-panel');
    await expect(launcher).toBeVisible();
    await expect(panel).toBeHidden();
    await page.clock.runFor(11_000);
    await expect(launcher).toHaveClass(/is-compact/);
    await launcher.click();
    await expect(panel).toBeVisible();
    const question=page.locator('#fpc-chat-question');
    await question.fill('Do you offer private lessons?');
    await page.clock.runFor(41_000);
    await expect(panel).toBeHidden();
    await launcher.click();
    await expect(question).toHaveValue('Do you offer private lessons?');
    const state=await page.evaluate(()=>{
      const card=document.querySelector('.growth-service-card');
      return {
        hero:getComputedStyle(document.querySelector('.hero-wrap')).animationName,
        transition:getComputedStyle(card).transitionDuration,
        scroll:getComputedStyle(document.documentElement).scrollBehavior,
        panelHeight:document.querySelector('#fpc-chat-panel').getBoundingClientRect().height
      };
    });
    expect(state.hero).toBe('none');
    expect(state.transition).toBe('0s');
    expect(state.scroll).toBe('auto');
    expect(state.panelHeight).toBeLessThan(460);
  });
});
