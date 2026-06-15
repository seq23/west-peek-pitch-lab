const PITCH_LAB_PREFIX = 'west-peek-pitch-lab.';

export function listPitchLabKeys(storage = localStorage) {
  const keys = [];
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (key && key.startsWith(PITCH_LAB_PREFIX)) keys.push(key);
  }
  return keys.sort();
}

export function clearPitchLabLocalData(storage = localStorage) {
  const keys = listPitchLabKeys(storage);
  for (const key of keys) storage.removeItem(key);
  return { removed: keys, remaining: listPitchLabKeys(storage) };
}

export function hydrateDeleteMyInfo() {
  const root = document.querySelector('[data-delete-my-info-root]');
  if (!root) return;
  const count = listPitchLabKeys().length;
  root.innerHTML = `<section class="session-card" aria-labelledby="delete-local-title">
    <h2 id="delete-local-title">Clear this browser’s Pitch Lab data</h2>
    <p data-delete-local-summary>${count ? `${count} Pitch Lab data item${count === 1 ? '' : 's'} stored in this browser.` : 'No Pitch Lab data is stored in this browser.'}</p>
    <p>This removes founder profile, pitch answers, optional context, rehearsal metadata, Story Card, consent state, and confirmed receipt state stored locally. It does not silently claim to delete a remote West Peek record.</p>
    <div class="actions"><button type="button" class="button primary" data-clear-pitch-lab-data ${count ? '' : 'disabled'}>Clear local Pitch Lab data</button></div>
    <div data-delete-local-result aria-live="polite"></div>
  </section>`;
  const button = root.querySelector('[data-clear-pitch-lab-data]');
  button?.addEventListener('click', () => {
    const result = clearPitchLabLocalData();
    root.querySelector('[data-delete-local-result]').innerHTML = result.remaining.length === 0
      ? `<div class="boundary-card"><h3>Local Pitch Lab data cleared.</h3><p>${result.removed.length} item${result.removed.length === 1 ? '' : 's'} removed. Refreshing or reopening this browser will not restore them.</p></div>`
      : `<div class="boundary-card"><h3>Local deletion incomplete.</h3><p>${result.remaining.length} Pitch Lab item${result.remaining.length === 1 ? '' : 's'} remain.</p></div>`;
    button.disabled = result.remaining.length === 0;
    root.querySelector('[data-delete-local-summary]').textContent = result.remaining.length === 0 ? 'No Pitch Lab data is stored in this browser.' : `${result.remaining.length} Pitch Lab data items remain.`;
  });
}

hydrateDeleteMyInfo();
