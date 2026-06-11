export function formatStoryCardForClipboard(card, { title = 'Pitch Story Card', storyStrengthSignals = [] } = {}) {
  const lines = [title, ''];
  const fields = [
    ['One-line pitch', card?.oneLinePitch],
    ['Company summary', card?.companySummary],
    ['Customer / who it helps', card?.customer || card?.whoItHelps],
    ['Problem', card?.problem],
    ['Solution', card?.solution],
    ['Proof / traction', card?.proofTraction || card?.tractionProof],
    ['Founder edge', card?.founderEdge],
    ['Why now', card?.whyNow],
    ['Additional context', card?.additionalContext],
    ['Biggest story gap', card?.biggestStoryGap],
    ['Biggest objection', card?.biggestObjection],
    ['Suggested next relationships', card?.suggestedNextRelationships || card?.suggestedPeopleOrRelationships],
    ['Next steps', card?.nextSteps || card?.suggestedNextSteps]
  ];
  for (const [label, value] of fields) if (String(value || '').trim()) lines.push(`${label}: ${String(value).trim()}`);
  if (storyStrengthSignals.length) {
    lines.push('', 'Story Strength Snapshot:');
    for (const item of storyStrengthSignals) lines.push(`- ${item.category}: ${item.signal} — ${item.guidance}`);
  }
  return lines.join('\n');
}

export async function copyTextToClipboard(text) {
  if (!navigator?.clipboard?.writeText) return { ok: false, reason: 'Clipboard API is unavailable.' };
  try {
    await navigator.clipboard.writeText(text);
    return { ok: true };
  } catch {
    return { ok: false, reason: 'Copy failed. You can still select and copy the card manually.' };
  }
}
