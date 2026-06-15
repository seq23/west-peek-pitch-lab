import { test, expect } from '@playwright/test';
const PROFILE='west-peek-pitch-lab.founder-profile.v1';
const ANSWERS='west-peek-pitch-lab.phase3.answers.v1';
const AI_CARD='west-peek-pitch-lab.phase4.ai-story-card.v1';
const SHARE='west-peek-pitch-lab.phase7.share-status.v1';
const DECK='west-peek-pitch-lab.deck-context.v1';
const TAKES='west-peek-pitch-lab.practice-out-loud.takes.v2';
const SELECTED='west-peek-pitch-lab.practice-out-loud.selected.v2';
const seeded={
  [PROFILE]:{name:'Persistence Founder',email:'persist@example.com',companyName:'PersistCo'},
  [ANSWERS]:{what_building:'A sufficiently complete persisted founder answer for runtime proof.'},
  [DECK]:{deck_provided:false,deck_context_used:false},
  [AI_CARD]:{status:'ai_story_card_ready',storyCard:{oneLinePitch:'A persistent story card',companySummary:'Persistent summary',proofTraction:'Persistent proof'}},
  [SHARE]:{ok:true,reviewStatus:'pending_network_review',contactCreated:false,intakeId:'proof-intake-persist'},
  [TAKES]:{takes:[{id:'take-persist',transcript:'Persisted transcript',durationSeconds:42}]},
  [SELECTED]:{id:'take-persist',selectedWithConsent:true,selectedAt:'2026-06-15T00:00:00.000Z'}
};
const SEED_MARKER='west-peek-pitch-lab-proof-seeded';
async function seed(page){
  await page.addInitScript(({values,marker})=>{
    if(sessionStorage.getItem(marker)==='1') return;
    for(const [k,v] of Object.entries(values)) localStorage.setItem(k,JSON.stringify(v));
    sessionStorage.setItem(marker,'1');
  },{values:seeded,marker:SEED_MARKER});
}

test.describe('Pitch Lab persistence, refresh, isolation, and deletion proof',()=>{
  test('confirmed Story Card and receipt survive refresh and route re-entry',async({page})=>{
    await seed(page);await page.goto('/thank-you');
    await expect(page.locator('[data-thank-you-status]')).toContainText('pending_network_review');
    await page.reload();
    await expect(page.locator('[data-thank-you-status]')).toContainText('pending_network_review');
    await page.goto('/story-card');
    const values=await page.evaluate((keys)=>Object.fromEntries(keys.map(k=>[k,JSON.parse(localStorage.getItem(k)||'null')])),[PROFILE,ANSWERS,AI_CARD,SHARE,DECK,TAKES,SELECTED]);
    expect(values[PROFILE].email).toBe('persist@example.com');
    expect(values[AI_CARD].storyCard.oneLinePitch).toBe('A persistent story card');
    expect(values[SHARE].intakeId).toBe('proof-intake-persist');
  });

  test('fresh browser context does not inherit another founder session',async({browser})=>{
    const a=await browser.newContext();const p1=await a.newPage();await seed(p1);await p1.goto('/story-card');expect(await p1.evaluate(()=>localStorage.length)).toBeGreaterThan(0);await a.close();
    const b=await browser.newContext();const p2=await b.newPage();await p2.goto('/thank-you');await expect(p2.locator('[data-thank-you-status]')).toContainText('No confirmed submission found');expect(await p2.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('west-peek-pitch-lab.')).length)).toBe(0);await b.close();
  });

  test('Delete My Info clears every local Pitch Lab key and remains cleared after refresh and re-entry',async({page})=>{
    await seed(page);await page.goto('/delete-my-info');
    await expect(page.locator('[data-delete-local-summary]')).toContainText('Pitch Lab data item');
    await page.getByRole('button',{name:'Clear local Pitch Lab data'}).click();
    await expect(page.locator('[data-delete-local-result]')).toContainText('Local Pitch Lab data cleared');
    expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('west-peek-pitch-lab.')))).toEqual([]);
    await page.reload();await expect(page.locator('[data-delete-local-summary]')).toContainText('No Pitch Lab data is stored');
    await page.goto('/thank-you');await expect(page.locator('[data-thank-you-status]')).toContainText('No confirmed submission found');
    await page.goto('/story-card');expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('west-peek-pitch-lab.')).length)).toBe(0);
  });
});
