import { LOCKED_PITCH_LAB_COPY } from './lockedCopy.mjs';
import { DISCLOSURE_COPY } from './disclaimerModel.mjs';

export const DISCLOSURES = {
  aiScooter: LOCKED_PITCH_LAB_COPY.aiDisclosure,
  privacy: 'Pitch Lab is designed to let founders practice before sharing. Founder answers stay private unless explicit Founder Story Card share consent is given. Local camera practice stays in the browser by default.',
  noGuarantee: 'Sharing a Founder Story Card with West Peek will not guarantee investment, investment review, review, funding, introductions, acceptance, meetings, a response, or follow-up.',
  consent: 'Profile capture and sharing are separate actions. West Peek network sharing requires explicit consent and only creates a pending network review state after confirmation.',
  footer: DISCLOSURE_COPY.footerShort,
  profileGate: DISCLOSURE_COPY.profileGate,
  deckUpload: DISCLOSURE_COPY.deckUpload,
  cameraPractice: DISCLOSURE_COPY.cameraPractice,
  storyCard: DISCLOSURE_COPY.storyCard,
  shareConsent: DISCLOSURE_COPY.shareConsent,
  firstAiScooterMessage: DISCLOSURE_COPY.firstAiScooterMessage,
  thankYou: DISCLOSURE_COPY.thankYou
};
