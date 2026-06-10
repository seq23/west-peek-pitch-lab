import { createAiRequestPayload, createAiUnavailableResponse, validateAiRequest, validateAiResponseShape } from './aiSchema.mjs';
import { callStoryCardWithRouter } from './llmRouter.mjs';

function getEnv(env, key, fallback = '') {
  return String(env?.[key] ?? fallback).trim();
}

export async function generatePitchStoryCard({ env = {}, answers = {}, fetchImpl = fetch } = {}) {
  const maxInputChars = Number(getEnv(env, 'LLM_MAX_INPUT_CHARS', '12000')) || 12000;
  const requestValidation = validateAiRequest(answers, { maxInputChars });
  if (!requestValidation.ok) {
    return {
      ok: false,
      httpStatus: 400,
      body: {
        status: 'invalid_pitch_answers',
        aiEnhanced: false,
        shareEnabled: false,
        errors: requestValidation.errors
      }
    };
  }

  let provider;
  let raw;
  let providerAttempts = [];
  try {
    const routed = await callStoryCardWithRouter({ env, answers: requestValidation.answers, fetchImpl });
    provider = routed.provider;
    raw = routed.raw;
    providerAttempts = routed.attempts;
  } catch (error) {
    return {
      ok: false,
      httpStatus: 503,
      body: {
        ...createAiUnavailableResponse(error instanceof Error ? error.message : 'LLM provider failed safely.'),
        providerAttempts: Array.isArray(error?.attempts) ? error.attempts : []
      }
    };
  }

  const shape = validateAiResponseShape(raw, requestValidation.answers);
  if (!shape.ok) {
    return {
      ok: false,
      httpStatus: 502,
      body: {
        ...createAiUnavailableResponse('The AI response did not match the required Pitch Story Card schema.'),
        schemaErrors: shape.errors
      }
    };
  }

  return {
    ok: true,
    httpStatus: 200,
    body: {
      ...shape.value,
      provider,
      providerAttempts,
      inputSummary: createAiRequestPayload(answers).totalInputChars
    }
  };
}

export async function analyzePitch({ env = {}, answers = {}, fetchImpl = fetch } = {}) {
  const result = await generatePitchStoryCard({ env, answers, fetchImpl });
  if (!result.ok) return result;
  return {
    ok: true,
    httpStatus: 200,
    body: {
      status: 'ai_pitch_critique_ready',
      aiEnhanced: true,
      shareEnabled: false,
      disclosure: result.body.disclosure,
      critique: result.body.critique,
      warnings: result.body.warnings,
      provider: result.body.provider
    }
  };
}
