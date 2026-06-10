import { generatePitchStoryCard } from '../../../src/server/ai/aiService.mjs';

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

export async function onRequestPost(context) {
  const payload = await readJson(context.request);
  if (!payload || typeof payload !== 'object') {
    return json({ status: 'invalid_request', aiEnhanced: false, shareEnabled: false, errors: { body: 'Expected JSON body.' } }, 400);
  }
  const result = await generatePitchStoryCard({ env: context.env, answers: payload.answers, fetchImpl: fetch });
  return json(result.body, result.httpStatus);
}

export async function onRequestGet() {
  return json({
    status: 'method_not_allowed',
    aiEnhanced: false,
    shareEnabled: false,
    message: 'Use POST with founder answers. This endpoint never returns placeholder AI output.'
  }, 405);
}
