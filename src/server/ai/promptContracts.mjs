import { PHASE_4_AI_DISCLOSURE } from './aiSchema.mjs';
import { SCOOTER_MVP_V1_MEDIA_CONTRACT } from '../../runtime/scooterMediaContract.mjs';
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
    "script": "AI Scooter final coaching summary for the required MVP talking-avatar moment. Comfort range ${SCOOTER_MVP_V1_MEDIA_CONTRACT.scriptGuidance.final_summary.comfortRangeWords} words; review above ${SCOOTER_MVP_V1_MEDIA_CONTRACT.scriptGuidance.final_summary.reviewAboveWords} words. Specific, warm, direct, no guarantee language."
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

Stay strictly inside the Pitch Lab subject matter: pitch clarity, customer/problem/solution, traction/proof, founder edge, why now, ask/relationship routing, rehearsal feedback, and Founder Story Packet readiness. Redirect unrelated topics instead of answering them. Write in warm, direct founder-coach language. Be useful, not hypey. Keep fields concise without sounding clipped. Preserve uncertainty where proof is thin. Do not assign numeric scores or fundability ratings. Use Story Strength Signals only as qualitative coaching labels. Use relationship-routing language, not investment-review language. The finalScooterSummary is a speaking script: 2–5 short sentences, no full essay unless the founder context genuinely requires one extra sentence, no filler, no "as an AI", no legal/tax/securities/investment advice, and no promises of funding, review, meetings, introductions, acceptance, response, or follow-up.`
  };
}
