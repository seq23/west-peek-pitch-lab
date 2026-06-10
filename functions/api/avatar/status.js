import { getAvatarStatus } from '../../../src/server/avatar/avatarService.mjs';
function json(body, status = 200) { return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } }); }
export async function onRequestGet(context) { return json(getAvatarStatus(context.env)); }
