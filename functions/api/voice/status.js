import { getVoiceStatus } from '../../../src/server/voice/voiceService.mjs';
import { statusResponse } from '../../../src/server/security/paidEndpointGuard.mjs';
export async function onRequestGet(context) { return statusResponse(context.request, context.env, getVoiceStatus(context.env)); }
