import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import sharp from 'sharp';

const env={...process.env,VIANORAE_TEST_FIXTURE:'1',VIANORAE_SUPABASE_PROJECT_REF:'vianorae-fixture',NEXT_PUBLIC_SUPABASE_URL:'https://vianorae-fixture.supabase.co',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fixture',VIANORAE_WORKSPACE_ENABLED:'1'};
const children=[];let browser;let checks=0;
function start(command,args,extra={},log='/tmp/vianorae-workspace-test.log') {
  const child=spawn(command,args,{env:{...env,...extra},stdio:['ignore','pipe','pipe']});children.push(child);
  const output=createWriteStream(log);child.stdout.pipe(output);child.stderr.pipe(output);return child;
}
async function ready(url) {
  for(let i=0;i<120;i++) {
    try {if((await fetch(url)).ok) return;} catch {}
    await new Promise(resolve=>setTimeout(resolve,500));
  }
  throw new Error(`Test service did not start: ${url}`);
}
async function check(name,fn){await fn();checks++;console.log(`PASS ${name}`);}
const base='http://localhost:3011';
async function login(page,owner=1) {
  await page.goto(`${base}/en/login`);await page.getByLabel('Work email',{exact:true}).fill(`owner${owner}@example.test`);
  await page.getByLabel('Password',{exact:true}).fill('Fixture-only-passphrase-123');
  await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.waitForURL('**/en/account');
}
const saved=page=>expect(page.locator('.status-message')).toContainText('Draft saved online');
const save=async page=>{await page.getByRole('button',{name:'Save online',exact:true}).click();await saved(page);};
try {
  if(!process.argv.includes('--skip-build')) {
    const build=start('npm',['run','build'],{},'/tmp/vianorae-workspace-build.log');
    const code=await new Promise(resolve=>build.on('exit',resolve));assert.equal(code,0,'Fixture build failed; inspect /tmp/vianorae-workspace-build.log');
  }
  start('node',['scripts/workspace-fixture.mjs'],{},'/tmp/vianorae-workspace-fixture.log');
  await ready('http://127.0.0.1:3012/health');
  start('node',['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3011'],{NODE_OPTIONS:`${process.env.NODE_OPTIONS || ''} --import ${process.cwd()}/scripts/workspace-fixture-fetch.mjs`},'/tmp/vianorae-workspace-server.log');
  await ready(`${base}/en/login`);browser=await chromium.launch();
  const context=await browser.newContext();const page=await context.newPage();
  await check('unauthenticated workspace redirects to sign in and photo API returns 401',async()=>{
    await page.goto(`${base}/en/workspace`);await expect(page).toHaveURL(/\/en\/login$/);
    assert.equal((await context.request.get(`${base}/api/workspace/photos?key=anything`)).status(),401);
  });
  await check('verified owner signs in and opens their organisation workspace',async()=>{
    await login(page);await page.getByRole('link',{name:'Organisation workspace',exact:true}).click();
    await expect(page.getByText('Fixture museum 1',{exact:true})).toBeVisible();
    await page.getByRole('link',{name:'Create a location',exact:true}).click();
  });
  await check('new zone requires initial save before private photo upload',async()=>{
    await expect(page.locator('input[type=file]')).toBeDisabled();
    await page.getByLabel('Location name',{exact:true}).fill('Fixture Gallery');await page.getByLabel('City',{exact:true}).fill('Example city');
    await page.getByLabel('Zone title',{exact:true}).fill('Main entrance');
    await page.locator('.builder-zone').getByLabel('Short description',{exact:true}).fill('A step-free entrance, checked by the venue.');
    await save(page);await page.waitForURL(/\/en\/workspace\/[0-9a-f-]{36}$/);await expect(page.locator('input[type=file]')).toBeEnabled();
  });
  const editUrl=page.url();
  await check('saved draft and sensory data survive a full reload',async()=>{
    await page.getByLabel('Sound',{exact:true}).selectOption('moderate');await save(page);await page.reload();
    await expect(page.getByLabel('Location name',{exact:true})).toHaveValue('Fixture Gallery');
    await expect(page.getByLabel('Sound',{exact:true})).toHaveValue('moderate');
  });
  const png=await sharp({create:{width:1900,height:1100,channels:3,background:'#668878'}}).png().toBuffer();
  await check('PNG upload is converted into a private WebP and requires attribution',async()=>{
    await page.locator('input[type=file]').setInputFiles({name:'fixture.png',mimeType:'image/png',buffer:png});
    await expect(page.getByText('Photograph uploaded privately.',{exact:false})).toBeVisible();
    await page.getByLabel('Image description (alternative text)',{exact:true}).fill('Fictional green entrance illustration');
    await page.getByLabel('Image rights / credit',{exact:true}).fill('VIANORAE test fixture');
    await page.getByLabel('Date photographed',{exact:true}).fill('2026-10-01');await save(page);
  });
  let photoPath;
  await check('private photo download is resized and metadata-free',async()=>{
    photoPath=await page.locator('.draft-photo').getAttribute('src');const response=await context.request.get(`${base}${photoPath}`);
    assert.equal(response.status(),200);assert.match(response.headers()['cache-control'],/private.*no-store/);
    const info=await sharp(await response.body()).metadata();assert.equal(info.format,'webp');assert.equal(info.width,1600);assert.equal(info.exif,undefined);assert.equal(info.xmp,undefined);
  });
  await check('saved preview reads persisted photograph and description',async()=>{
    await page.getByRole('link',{name:'Preview saved draft',exact:true}).click();
    await expect(page.getByText('A step-free entrance, checked by the venue.',{exact:true})).toBeVisible();
    await expect(page.getByRole('img',{name:'Fictional green entrance illustration'})).toBeVisible();
    assert.match((await context.request.get(page.url())).headers()['cache-control'],/private.*no-store/);
  });
  await check('private preview offers reading controls and narrates only saved organisation content',async()=>{
    await expect(page.locator('.guide-reading')).toBeVisible();
    await page.evaluate(()=>{
      let current=null;const spoken=[];
      Object.defineProperty(window,'__privateSpeech',{value:{spoken,finish:()=>{let count=0;while(current&&count++<100){const next=current;current=null;next.onend?.({});}}},configurable:true});
      Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[{lang:'en-GB',name:'Fixture English',default:true,localService:true,voiceURI:'fixture'}],speak:utterance=>{current=utterance;spoken.push(utterance.text);},cancel:()=>{current=null;},pause:()=>{},resume:()=>{}},configurable:true});
      Object.defineProperty(window,'SpeechSynthesisUtterance',{value:class{constructor(text){this.text=text;}},configurable:true});
    });
    const audio=page.locator('main .read-aloud');await audio.getByRole('button',{name:'Read aloud',exact:true}).click();
    await page.evaluate(()=>window.__privateSpeech.finish());await expect(audio.getByRole('status')).toHaveText('Reading finished.');
    const spoken=await page.evaluate(()=>window.__privateSpeech.spoken.join('\n'));
    assert.match(spoken,/Fixture Gallery/);assert.match(spoken,/A step-free entrance, checked by the venue/);assert.match(spoken,/Fictional green entrance illustration/);assert.match(spoken,/Sound: Moderate/);assert.doesNotMatch(spoken,/Willow Museum|Willow Square/);
  });
  const second=await browser.newContext();const secondPage=await second.newPage();await login(secondPage);await secondPage.goto(editUrl);
  await check('a separate browser session sees the saved draft and photo',async()=>{
    await expect(secondPage.getByLabel('Zone title',{exact:true})).toHaveValue('Main entrance');
    await expect(secondPage.getByLabel('Image rights / credit',{exact:true})).toHaveValue('VIANORAE test fixture');
    await expect(secondPage.getByLabel('Date photographed',{exact:true})).toHaveValue('2026-10-01');
  });
  await page.goto(editUrl);
  await check('concurrent stale save preserves unsaved text and does not overwrite the newer revision',async()=>{
    await page.getByLabel('Location name',{exact:true}).fill('Latest fixture name');await save(page);
    await secondPage.getByLabel('Location name',{exact:true}).fill('Unsaved conflicting name');
    await secondPage.getByRole('button',{name:'Save online',exact:true}).click();
    await expect(secondPage.locator('.status-message[role=alert]')).toContainText('Someone saved a newer version');
    await expect(secondPage.getByLabel('Location name',{exact:true})).toHaveValue('Unsaved conflicting name');
    await page.reload();await expect(page.getByLabel('Location name',{exact:true})).toHaveValue('Latest fixture name');
  });
  await check('unsaved navigation can be cancelled',async()=>{
    let seen=false;secondPage.once('dialog',async dialog=>{seen=true;await dialog.dismiss();});
    await secondPage.getByRole('link',{name:'All locations',exact:true}).click();assert.equal(seen,true);await expect(secondPage).toHaveURL(editUrl);
  });
  const other=await browser.newContext();const otherPage=await other.newPage();await login(otherPage,2);
  await check('another organisation cannot read the place, preview or private photo',async()=>{
    const place=await otherPage.goto(editUrl);assert.equal(place.status(),404);
    const preview=await otherPage.goto(`${editUrl}/preview`);assert.equal(preview.status(),404);
    assert.equal((await other.request.get(`${base}${photoPath}`)).status(),404);
    await otherPage.goto(`${base}/en/workspace`);await expect(otherPage.getByText('No locations yet.',{exact:false})).toBeVisible();
  });
  await check('malformed images are rejected without replacing the saved photo',async()=>{
    const response=await context.request.post(`${base}/api/workspace/photos`,{multipart:{placeId:editUrl.split('/').at(-1),zoneId:photoPath.split('%2F')[2],file:{name:'bad.webp',mimeType:'image/webp',buffer:Buffer.from('not an image')}}});
    assert.equal(response.status(),400);await page.reload();await expect(page.getByLabel('Image rights / credit',{exact:true})).toHaveValue('VIANORAE test fixture');
  });
  await check('step reorder and removal persist without deleting zone history',async()=>{
    await page.getByRole('button',{name:'Add a zone',exact:true}).click();
    const zone=page.locator('.builder-zone').nth(1);await zone.getByLabel('Zone title',{exact:true}).fill('Quiet room');
    await zone.getByLabel('Short description',{exact:true}).fill('A fictional quiet room.');
    await zone.getByRole('button',{name:'Move earlier: Quiet room',exact:true}).click();await save(page);await page.reload();
    await expect(page.locator('.builder-zone').first().getByLabel('Zone title',{exact:true})).toHaveValue('Quiet room');
    await page.locator('.builder-zone').first().getByRole('button',{name:'Remove this step: Quiet room',exact:true}).click();await save(page);await page.reload();
    assert.equal(await page.locator('.builder-zone').count(),1);
  });
  await check('Romanian descriptions and photo alternative text persist separately from English',async()=>{
    await page.goto(editUrl.replace('/en/','/ro/'));
    await page.getByLabel('Numele locației',{exact:true}).fill('Galerie fictivă');
    await page.getByLabel('Titlul zonei',{exact:true}).fill('Intrarea principală');
    await page.locator('.builder-zone').getByLabel('Descriere scurtă',{exact:true}).fill('O intrare fictivă fără trepte.');
    await page.getByLabel('Descrierea imaginii (text alternativ)',{exact:true}).fill('Ilustrație fictivă a intrării');
    await page.getByRole('button',{name:'Salvează online',exact:true}).click();
    await expect(page.locator('.status-message')).toContainText('Draft salvat online');await page.reload();
    await expect(page.getByLabel('Numele locației',{exact:true})).toHaveValue('Galerie fictivă');
    await page.goto(editUrl);await expect(page.getByLabel('Location name',{exact:true})).toHaveValue('Latest fixture name');
    await expect(page.getByLabel('Image description (alternative text)',{exact:true})).toHaveValue('Fictional green entrance illustration');
  });
  for(const locale of ['en','ro','de']) {
    await check(`${locale.toUpperCase()} online editor passes automated WCAG A/AA checks and narrow-screen reflow`,async()=>{
      await page.goto(editUrl.replace('/en/',`/${locale}/`));
      const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();assert.deepEqual(audit.violations,[]);
      await page.setViewportSize({width:320,height:800});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'Horizontal overflow');
      await page.addStyleTag({content:'html { font-size: 200%; }'});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'200% text overflow');
      await page.setViewportSize({width:1280,height:900});
    });
  }
  await page.goto(editUrl);await page.screenshot({path:'docs/online-builder-preview.png',fullPage:true});
  await check('detaching a photo persists while retaining the private file',async()=>{
    await page.getByRole('button',{name:'Detach photograph from draft',exact:true}).click();await save(page);await page.reload();
    await expect(page.getByText('No photograph attached.',{exact:true})).toBeVisible();
    assert.equal((await context.request.get(`${base}${photoPath}`)).status(),200);
  });
  await check('sign out clears access to the saved workspace and photo',async()=>{
    await page.goto(`${base}/en/account`);await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.waitForURL('**/en/login');
    assert.equal((await context.request.get(`${base}${photoPath}`)).status(),401);
    await page.goto(editUrl);await expect(page).toHaveURL(/\/en\/login$/);
  });
  console.log(`${checks} online workspace checks passed (real migrations; simulated Auth/Storage HTTP).`);
} finally {
  if(browser) await browser.close();for(const child of children) if(child.exitCode===null) child.kill('SIGTERM');
}
