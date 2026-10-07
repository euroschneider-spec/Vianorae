import { test,expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const copy={
  en:{settings:'Reading settings',close:'Close reading settings',size:'Text size',theme:'Appearance',full:'Complete guide in text',heading:'Your complete visit guide',steps:'Step by step',sound:'You can use this site without sound.'},
  ro:{settings:'Setări de lectură',close:'Închide setările de lectură',size:'Mărimea textului',theme:'Aspect',full:'Ghid complet în text',heading:'Ghidul complet al vizitei',steps:'Pas cu pas',sound:'Poți folosi acest site fără sunet.'},
  de:{settings:'Leseeinstellungen',close:'Leseeinstellungen schließen',size:'Textgröße',theme:'Darstellung',full:'Vollständiger Guide als Text',heading:'Ihr vollständiger Besuchs-Guide',steps:'Schritt für Schritt',sound:'Sie können diese Website ohne Ton nutzen.'},
};
for(const locale of ['en','ro','de'] as const) {
  const t=copy[locale];
  test(`${locale}: reading panel opens beside the image, manages keyboard focus and closes with Escape`,async({page})=>{
    await page.goto(`/${locale}`);const trigger=page.locator('.hero-reading');
    await expect(trigger).toHaveAccessibleName(t.settings);await trigger.focus();await page.keyboard.press('Enter');
    const dialog=page.getByRole('dialog',{name:t.settings,exact:true});await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel(t.size,{exact:true})).toBeFocused();
    for(let i=0;i<9;i++){await page.keyboard.press('Tab');expect(await dialog.evaluate(node=>node.contains(document.activeElement))).toBe(true);}
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();expect(result.violations).toEqual([]);
    await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(trigger).toBeFocused();
    await page.goto(`/${locale}/contact`);await page.locator('.header-reading').click();await expect(dialog).toBeVisible();
    await dialog.getByRole('button',{name:t.close,exact:true}).click();await expect(page.locator('.header-reading')).toBeFocused();
  });
  test(`${locale}: complete text guide contains all steps and remains usable without audio or images`,async({page})=>{
    await page.goto(`/${locale}/example-guide`);await expect(page.locator('main').getByText(t.sound,{exact:false})).toBeVisible();
    const description=await page.locator('.guide-content>p').first().innerText();
    await page.getByRole('button',{name:t.full,exact:true}).focus();await page.keyboard.press('Enter');
    await expect(page.getByRole('heading',{name:t.heading,exact:true})).toBeFocused();
    await expect(page.locator('.guide-text-steps>li')).toHaveCount(5);await expect(page.locator('.guide-text-view')).toContainText(description);
    await expect(page.locator('.guide-text-view dl')).toHaveCount(5);await expect(page.locator('.guide-text-view h4')).toHaveCount(10);
    await expect(page.locator('.guide-info-text')).toHaveCount(3);await expect(page.locator('main audio,main video,main iframe')).toHaveCount(0);
    await expect(page.locator('.guide-text-view img')).toHaveCount(0);
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();expect(result.violations).toEqual([]);
    await page.setViewportSize({width:320,height:800});await page.evaluate(()=>document.documentElement.style.fontSize='32px');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
    await page.getByRole('button',{name:t.steps,exact:true}).click();await expect(page.locator('.guide-content>h2')).toBeFocused();await expect(page.locator('.guide-image')).toBeVisible();
  });
}
test('reading panel repositions on resize and reflows with enlarged text',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto('/de');await page.locator('.hero-reading').click();
  const dialog=page.getByRole('dialog',{name:copy.de.settings,exact:true});
  await page.setViewportSize({width:320,height:800});await page.evaluate(()=>document.documentElement.style.fontSize='32px');
  await expect.poll(async()=>dialog.evaluate(node=>{const rect=node.getBoundingClientRect();return rect.left>=0 && rect.right<=window.innerWidth && node.scrollWidth<=node.clientWidth;})).toBe(true);
  await dialog.getByLabel(copy.de.theme,{exact:true}).selectOption('dark');
  const result=await new AxeBuilder({page}).withTags(['wcag2aa','wcag21aa','wcag22aa']).analyze();expect(result.violations).toEqual([]);
  await dialog.getByRole('button',{name:copy.de.close,exact:true}).click();
});
test('text guide uses the saved local draft and retains the current step when switching views',async({page})=>{
  await page.goto('/en/dashboard/builder');await page.getByLabel('Zone title',{exact:true}).first().fill('Saved text entrance');await page.getByRole('button',{name:'Save draft',exact:true}).click();
  await page.goto('/en/dashboard/preview');await page.getByRole('button',{name:'Next step',exact:true}).click();
  await page.getByRole('button',{name:copy.en.full,exact:true}).click();await expect(page.locator('.guide-text-view')).toContainText('Saved text entrance');
  await page.getByRole('button',{name:copy.en.steps,exact:true}).click();await expect(page.getByRole('heading',{name:'Reception & the foyer',exact:true})).toBeFocused();
});
test('reading controls are visible before the footer and screenshots document the new views',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto('/ro');await page.locator('.hero-reading').click();
  await page.screenshot({path:'docs/reading-panel-preview.png'});await page.keyboard.press('Escape');
  await page.goto('/ro/example-guide');await page.getByRole('button',{name:copy.ro.full,exact:true}).click();
  await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.screenshot({path:'docs/text-guide-preview.png',fullPage:true});
});
