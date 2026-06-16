const body = document.body;

function setupMobileNavigation() {
  const toggle = document.querySelector('[data-mobile-nav-toggle]');
  const nav = document.querySelector('[data-primary-nav]');
  if (!toggle || !nav) return;
  const close = () => { toggle.setAttribute('aria-expanded', 'false'); nav.dataset.open = 'false'; };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    nav.dataset.open = String(!open);
  });
  nav.addEventListener('click', (event) => { if (event.target.closest('a')) close(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { close(); toggle.focus(); } });
}

function setupScooterStage() {
  const stage = document.querySelector('[data-scooter-stage]');
  const toggle = document.querySelector('[data-scooter-stage-toggle]');
  if (!stage || !toggle) return;
  let manualExpanded = false;
  const setCompact = (compact) => {
    stage.classList.toggle('is-compact', compact);
    toggle.setAttribute('aria-expanded', String(!compact));
    toggle.textContent = compact ? 'Expand Scooter' : 'Minimize Scooter';
  };
  const respondToScroll = () => {
    if (manualExpanded) return;
    const mobile = window.matchMedia('(max-width: 760px)').matches;
    setCompact(mobile || window.scrollY > 240);
  };
  toggle.addEventListener('click', () => {
    const compact = stage.classList.contains('is-compact');
    manualExpanded = compact;
    setCompact(!compact);
  });
  window.addEventListener('scroll', respondToScroll, { passive: true });
  window.addEventListener('resize', respondToScroll);
  respondToScroll();
}

function focusableWithin(element) {
  return [...element.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')];
}

function setupDraftSheet() {
  const trigger = document.querySelector('[data-story-draft-trigger]');
  const sheet = document.querySelector('[data-story-draft-sheet]');
  const closeButton = document.querySelector('[data-draft-sheet-close]');
  const backdrop = document.querySelector('[data-draft-sheet-backdrop]');
  if (!trigger || !sheet || !closeButton || !backdrop) return;
  let previousFocus = null;
  const open = () => {
    previousFocus = document.activeElement;
    sheet.hidden = false;
    backdrop.hidden = false;
    body.classList.add('draft-sheet-open');
    trigger.setAttribute('aria-expanded', 'true');
    closeButton.focus();
  };
  const close = () => {
    sheet.hidden = true;
    backdrop.hidden = true;
    body.classList.remove('draft-sheet-open');
    trigger.setAttribute('aria-expanded', 'false');
    (previousFocus || trigger).focus();
  };
  trigger.addEventListener('click', open);
  closeButton.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', (event) => {
    if (sheet.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key !== 'Tab') return;
    const focusable = focusableWithin(sheet);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
}

function mirrorDraftToSheet() {
  const preview = document.querySelector('[data-story-card-preview]');
  const sheetContent = document.querySelector('[data-story-card-sheet-content]');
  if (!preview || !sheetContent) return;
  sheetContent.innerHTML = preview.innerHTML;
}

document.addEventListener('pitchlab:draft-visibility', (event) => {
  const visible = event.detail?.visible === true;
  const trigger = document.querySelector('[data-story-draft-trigger]');
  if (trigger) trigger.hidden = !visible;
  mirrorDraftToSheet();
});

document.addEventListener('pitchlab:draft-updated', mirrorDraftToSheet);

setupMobileNavigation();
setupScooterStage();
setupDraftSheet();
