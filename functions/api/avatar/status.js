import { getAvatarStatus } from '../../../src/server/avatar/avatarService.mjs';
import { statusResponse } from '../../../src/server/security/paidEndpointGuard.mjs';
export async function onRequestGet(context) { return statusResponse(context.request, context.env, getAvatarStatus(context.env)); }
