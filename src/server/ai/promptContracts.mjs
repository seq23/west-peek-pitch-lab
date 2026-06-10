import { PHASE_4_AI_DISCLOSURE } from './aiSchema.mjs';
import { buildAiScooterSystemPrompt } from './aiScooterSystemPrompt.mjs';

export const SYSTEM_PROMPT = `${buildAiScooterSystemPrompt()}\n\nReturn strict JSON only. No markdown.`;

export function buildStoryCardPrompt(answers) {
  return {
    system: SYSTEM_PROMPT,
    user: `Review this founder pitch practice submission and return JSON with this exact shape:
{
  "disclosure": "${PHASE_4_AI_DISCLOSURE}",
  "critique": {
    "whatIsClear": "...",
    "whatIsConfusing": "...",
    "whatSoundsGeneric": "...",
    "needsStrongerProof": "...",
    "likelyObjection": "...",
    "betterStoryAngle": "...",
    "suggestedNextQuestion": "..."
  },
  "storyCard": {
    "oneLinePitch": "...",
    "companySummary": "...",
    "customer": "...",
    "problem": "...",
    "solution": "...",
    "proofTraction": "...",
    "founderEdge": "...",
    "whyNow": "...",
    "biggestStoryGap": "...",
    "biggestObjection": "...",
    "suggestedNextRelationships": "...",
    "nextSteps": "..."
  },
  "finalScooterSummary": {
    "script": "25-90 word AI Scooter final coaching summary for optional video follow-up. No guarantee language."
  },
  "storyStrengthSignals": [
    { "category": "Clarity", "signal": "Strong|Developing|Needs Sharpening", "guidance": "..." },
    { "category": "Problem Urgency", "signal": "Strong|Developing|Needs Sharpening", "guidance": "..." },
    { "category": "Proof / Traction", "signal": "Strong|Developing|Needs Sharpening", "guidance": "..." },
    { "category": "Founder Edge", "signal": "Strong|Developing|Needs Sharpening", "guidance": "..." },
    { "category": "Ask / Next Relationship", "signal": "Strong|Developing|Needs Sharpening", "guidance": "..." },
    { "category": "Memorability", "signal": "Strong|Developing|Needs Sharpening", "guidance": "..." }
  ],
  "warnings": []
}

Founder answers:
1. What are you building? ${answers.what_building}
2. Who is it for? ${answers.who_for}
3. What painful problem does it solve? ${answers.painful_problem}
4. Why now? ${answers.why_now}
5. Why are you/team the right people? ${answers.founder_edge}
6. Proof or traction? ${answers.proof_traction}
7. Needed help/relationships? ${answers.help_needed}

Write in warm, direct founder-coach language. Be useful, not hypey. Keep every field concise. Preserve uncertainty where proof is thin. Do not assign numeric scores or fundability ratings. Use Story Strength Signals only as qualitative coaching labels. Use relationship-routing language, not investment-review language.`
  };
}
