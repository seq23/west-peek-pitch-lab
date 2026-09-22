/**
 * Pitch Lab -> West Peek master network sheet.
 *
 * THE OWNER'S DECISION, 22 Sep 2026: "pitch lab is meant to be a lead gen
 * engine. so add pitchlab for sure."
 *
 * THIS REVERSES A PREVIOUS DELIBERATE POSITION, and the reversal is the point,
 * so nobody re-derives the old one from the code around it. Pitch Lab was
 * built to keep a founder practising a pitch OUT of the fund's contacts tab:
 * everything went to Network OS's `intake_queue` for human review, and
 * `networkOsClient.mjs` still carries a CONTACT_AUTO_CREATE_GUARD that refuses
 * the response if the pitch-lab door reports it made a contact. That guard was
 * right for the door it guards, and it stays. What changed is the product
 * question, not the safety one: the owner's position is that a founder who
 * comes through Pitch Lab is a lead, and leads belong in the network.
 *
 * SO BOTH PATHS RUN. The signed `intake_queue` handoff is untouched - a
 * working path is never removed to add a new one, and the queue is still where
 * human review happens. This module adds a SECOND, independent call to the
 * Network OS site-form door, which appends or updates a `contacts` row.
 *
 * FAILURE SEMANTICS. The founder's flow never fails because of this call. It
 * returns a status string and never throws, and the caller reports it as
 * `sheet` rather than letting it change the outcome the founder sees.
 *
 * Rows are tagged so their source is obvious in the sheet itself: `form` is
 * `pitch_lab_profile` or `pitch_lab_share`, which Network OS turns into the
 * tags, the relationship_type ("Website form - pitch lab / pitch_lab_...") and
 * created_by (`site_form:pitch lab:pitch_lab_...`).
 */

/** How long the sheet write may take before the founder's flow stops waiting. */
const DEFAULT_TIMEOUT_MS = 5000;

export function getSiteFormIntakeConfig(env = {}) {
  return {
    intakeUrl: String(env.WP_NETWORK_OS_INTAKE_URL || '').trim(),
    sharedSecret: String(env.WP_NETWORK_OS_INTAKE_SECRET || '').trim(),
    timeoutMs: Number(env.NETWORK_OS_TIMEOUT_MS || DEFAULT_TIMEOUT_MS)
  };
}

/**
 * Add one founder to the master network sheet.
 *
 * `form` must be `pitch_lab_profile` or `pitch_lab_share` so the row says which
 * step of Pitch Lab the person reached.
 *
 * Returns one of: 'ok' | 'failed' | 'not_configured' | 'invalid'.
 */
export async function addFounderToNetworkSheet({ founder = {}, form, submissionId, context = '' }, env = {}, fetchImpl = fetch) {
  const config = getSiteFormIntakeConfig(env);
  const email = String(founder.email || '').trim().toLowerCase();

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'invalid';
  if (!['pitch_lab_profile', 'pitch_lab_share'].includes(form)) return 'invalid';

  if (!config.intakeUrl || config.sharedSecret.length < 16) {
    console.error('pitch lab sheet write not configured', JSON.stringify({ form, has_url: Boolean(config.intakeUrl), has_secret: config.sharedSecret.length >= 16 }));
    return 'not_configured';
  }

  const submission = String(submissionId || '').trim() || `pitchlab_${Date.now()}_${crypto.randomUUID()}`;
  const payload = {
    submission_id: submission,
    host: 'pitch lab',
    form,
    email,
    name: String(founder.name || '').trim(),
    company: String(founder.company_name || founder.company || '').trim(),
    lead_source: 'pitch_lab',
    message: String(context || '').trim()
  };

  const website = String(founder.website || '').trim();
  if (website) payload.founder_website = website;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const response = await fetchImpl(config.intakeUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-wp-network-os-intake-secret': config.sharedSecret,
        'x-wp-network-os-submission-id': submission
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || data?.ok !== true) {
      console.error('pitch lab sheet write failed', JSON.stringify({ form, status: response.status, error_code: data?.error_code || '' }));
      return 'failed';
    }
    return 'ok';
  } catch (error) {
    console.error('pitch lab sheet write threw', JSON.stringify({ form, error: String(error).slice(0, 200) }));
    return 'failed';
  } finally {
    clearTimeout(timeout);
  }
}
