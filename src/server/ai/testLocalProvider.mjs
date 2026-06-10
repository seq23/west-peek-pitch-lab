export function createTestLocalAiResponse(answers) {
  return {
    disclosure: 'AI Scooter is an AI storytelling coach inspired by Scooter Taylor. This is not the real-time human Scooter, not an investment decision, and not a guarantee of review, funding, intros, or a meeting.',
    critique: {
      whatIsClear: `The core build is visible: ${answers.what_building}`,
      whatIsConfusing: 'The current story may still need sharper customer specificity and a clearer business result.',
      whatSoundsGeneric: 'Any broad words like platform, community, or AI should be tied to a concrete painful moment.',
      needsStrongerProof: `The proof section should turn this into measurable traction: ${answers.proof_traction}`,
      likelyObjection: 'A skeptical listener may ask why this team wins now and why the customer must act soon.',
      betterStoryAngle: 'Lead with the painful moment, then show why the founder edge makes the solution believable.',
      suggestedNextQuestion: 'What is the single customer sentence that would make this impossible to ignore?'
    },
    storyCard: {
      oneLinePitch: `${answers.what_building} for ${answers.who_for}.`,
      companySummary: answers.what_building,
      customer: answers.who_for,
      problem: answers.painful_problem,
      solution: 'The solution should be framed as the shortest credible path from the painful moment to the better outcome.',
      proofTraction: answers.proof_traction,
      founderEdge: answers.founder_edge,
      whyNow: answers.why_now,
      biggestStoryGap: 'The story needs one crisp reason this is urgent now and not just interesting later.',
      biggestObjection: 'The biggest objection is whether the buyer feels enough pain to change behavior soon.',
      suggestedNextRelationships: answers.help_needed,
      nextSteps: 'Tighten the one-line pitch, add one proof point, and name the next relationship that creates leverage.'
    },
    storyStrengthSignals: [
      { category: 'Clarity', signal: 'Developing', guidance: 'Make the one-line pitch plain enough that someone outside the industry can repeat it.' },
      { category: 'Problem Urgency', signal: 'Developing', guidance: 'Name the painful moment and why the customer needs relief now.' },
      { category: 'Proof / Traction', signal: 'Needs Sharpening', guidance: 'Add one specific traction point: revenue, users, pilots, LOIs, waitlist, partnerships, or customer quote.' },
      { category: 'Founder Edge', signal: 'Developing', guidance: 'Connect the founder background to why this team can win.' },
      { category: 'Ask / Next Relationship', signal: 'Developing', guidance: 'Name the specific customer, operator, investor, advisor, or partner that would create momentum.' },
      { category: 'Memorability', signal: 'Developing', guidance: 'Add one phrase, contrast, or image that makes the story stick.' }
    ],
    warnings: ['This response is from the explicit local/test provider lane and is not a live Gemini response.']
  };
}
