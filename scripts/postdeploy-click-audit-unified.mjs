#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const lane = process.argv[2] || 'public';
const timeoutMs = Number(process.env.CLICK_AUDIT_TIMEOUT_MS || 30000);

if (lane !== 'public') {
  const out = path.resolve(
    'artifacts/diagnostics/click-audit',
    `${Date.now()}-${lane}`,
  );
  await fs.mkdir(out, { recursive: true });

  const notApplicable = {
    repo: 'west-peek-pitch-lab',
    lane,
    verdict: 'NOT_APPLICABLE',
    reason:
      'Pitch Lab is a public no-auth product with no roles or tenants.',
    generatedAt: new Date().toISOString(),
  };

  await fs.writeFile(
    path.join(out, 'summary.json'),
    JSON.stringify(notApplicable, null, 2),
  );

  console.log(`${lane} click audit: NOT APPLICABLE`);
  process.exit(0);
}

const base =
  process.env.POSTDEPLOY_BASE_URL ||
  process.env.PITCH_LAB_DEPLOY_URL ||
  process.env.SMOKE_BASE_URL ||
  process.env.PLAYWRIGHT_BASE_URL;

if (
  !base ||
  !/^https:\/\//.test(base) ||
  /localhost|127\.0\.0\.1|example\.com/i.test(base)
) {
  throw new Error(
    'Explicit non-placeholder HTTPS POSTDEPLOY_BASE_URL, PITCH_LAB_DEPLOY_URL, SMOKE_BASE_URL, or PLAYWRIGHT_BASE_URL required',
  );
}

const manifest = JSON.parse(
  await fs.readFile('config/postdeploy-public-proof-manifest.json', 'utf8'),
);

validateManifest(manifest);

const runId =
  process.env.PROOF_RUN_ID ||
  `${manifest.repo}-public-${new Date()
    .toISOString()
    .replace(/[-:.]/g, '')}`;

const out = path.resolve('artifacts/diagnostics/click-audit', runId);
await fs.mkdir(out, { recursive: true });

const viewportMap = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 375, height: 667 },
};

const browser = await chromium.launch({
  headless: process.env.PLAYWRIGHT_HEADED !== '1',
});

const results = [];
const globalConsole = [];
const globalFailed = [];
const globalHttp = [];

try {
  for (const scenario of manifest.scenarios) {
    for (const viewportName of scenario.viewports || ['desktop', 'mobile']) {
      const viewport = viewportMap[viewportName];

      if (!viewport) {
        throw new Error(`Unknown viewport "${viewportName}"`);
      }

      const context = await browser.newContext({ viewport });

      await context.addInitScript((seed) => {
        const marker = '__west_peek_click_audit_seeded__';

        if (sessionStorage.getItem(marker) !== '1') {
          for (const [key, value] of Object.entries(seed || {})) {
            localStorage.setItem(key, JSON.stringify(value));
          }

          sessionStorage.setItem(marker, '1');
        }
      }, scenario.storage_seed || {});

      await context.tracing.start({
        screenshots: true,
        snapshots: true,
        sources: true,
      });

      const page = await context.newPage();
      const consoleErrors = [];
      const failedRequests = [];
      const httpErrors = [];
      const actionResults = [];

      page.on('console', (message) => {
        if (message.type() !== 'error') return;

        const entry = {
          scenario: scenario.id,
          viewport: viewportName,
          text: message.text(),
        };

        consoleErrors.push(entry);
        globalConsole.push(entry);
      });

      page.on('requestfailed', (request) => {
        if (/\/cdn-cgi\/rum(?:\?|$)/i.test(request.url())) return;

        const entry = {
          scenario: scenario.id,
          viewport: viewportName,
          url: request.url(),
          error: request.failure()?.errorText || 'unknown',
        };

        failedRequests.push(entry);
        globalFailed.push(entry);
      });

      page.on('response', (response) => {
        if (response.status() < 400) return;

        const entry = {
          scenario: scenario.id,
          viewport: viewportName,
          url: response.url(),
          status: response.status(),
        };

        httpErrors.push(entry);
        globalHttp.push(entry);
      });

      let status = 'PASS';
      let error = '';

      try {
        const response = await page.goto(
          new URL(scenario.path, base).toString(),
          {
            waitUntil: 'networkidle',
            timeout: timeoutMs,
          },
        );

        if (!response || response.status() >= 400) {
          throw new Error(`HTTP ${response?.status() ?? 'none'}`);
        }

        await assertExpected(
          page,
          scenario.expected || {},
          timeoutMs,
        );

        for (const [index, action] of (scenario.actions || []).entries()) {
          if (!actionAppliesToViewport(action, viewportName)) continue;

          const startedAt = Date.now();

          await runAction(page, action, timeoutMs);

          actionResults.push({
            index,
            type: action.type,
            viewport: viewportName,
            status: 'PASS',
            durationMs: Date.now() - startedAt,
          });
        }

        assertFinalPath(page, scenario.final_path);
        await assertRenderSafety(page);

        if (consoleErrors.length) {
          throw new Error(
            `console errors: ${consoleErrors
              .map((entry) => entry.text)
              .join(' | ')}`,
          );
        }

        if (failedRequests.length) {
          throw new Error(
            `failed requests: ${failedRequests
              .map((entry) => entry.url)
              .join(' | ')}`,
          );
        }

        if (httpErrors.length) {
          throw new Error(
            `HTTP errors: ${httpErrors
              .map((entry) => `${entry.status} ${entry.url}`)
              .join(' | ')}`,
          );
        }
      } catch (caught) {
        status = 'FAIL';
        error = String(caught?.message || caught);
      }

      const screenshotPath = path.join(
        out,
        `${viewportName}-${scenario.id}.png`,
      );

      try {
        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
        });
      } catch (screenshotError) {
        if (!error) {
          error = `screenshot failed: ${String(
            screenshotError?.message || screenshotError,
          )}`;
          status = 'FAIL';
        }
      }

      const geometry = await safeGeometry(page);

      results.push({
        scenarioId: scenario.id,
        path: scenario.path,
        viewport: viewportName,
        status,
        error,
        finalUrl: page.url(),
        screenshotPath,
        actionResults,
        consoleErrors,
        failedRequests,
        httpErrors,
        geometry,
      });

      await context.tracing.stop({
        path: path.join(
          out,
          `trace-${viewportName}-${scenario.id}.zip`,
        ),
      });

      await context.close();
    }
  }
} finally {
  await browser.close();
}

const expectedChecks = manifest.scenarios.reduce(
  (total, scenario) =>
    total + (scenario.viewports?.length || 2),
  0,
);

const failedResults = results.filter(
  (result) => result.status !== 'PASS',
);

const passedChecks = results.length - failedResults.length;

const summary = {
  schema_version: '2.1',
  runId,
  repo: manifest.repo,
  lane: 'public',
  targetUrl: base,
  scenarioCount: manifest.scenarios.length,
  expectedChecks,
  actualChecks: results.length,
  passedChecks,
  failedChecks: failedResults.length,
  failedScenarioIds: failedResults.map(
    (result) => `${result.viewport}:${result.scenarioId}`,
  ),
  verdict:
    failedResults.length || results.length !== expectedChecks
      ? 'FAIL'
      : 'PASS',
  generatedAt: new Date().toISOString(),
};

await Promise.all([
  fs.writeFile(
    path.join(out, 'summary.json'),
    JSON.stringify(summary, null, 2),
  ),
  fs.writeFile(
    path.join(out, 'scenario-results.json'),
    JSON.stringify(results, null, 2),
  ),
  fs.writeFile(
    path.join(out, 'console-errors.json'),
    JSON.stringify(globalConsole, null, 2),
  ),
  fs.writeFile(
    path.join(out, 'failed-requests.json'),
    JSON.stringify(globalFailed, null, 2),
  ),
  fs.writeFile(
    path.join(out, 'http-errors.json'),
    JSON.stringify(globalHttp, null, 2),
  ),
  fs.writeFile(
    path.join(out, 'final-verdict.txt'),
    `${summary.verdict}\n`,
  ),
]);

console.log(
  `public click audit: ${summary.verdict} ` +
    `(${passedChecks}/${expectedChecks} passed; ` +
    `${failedResults.length} failed)`,
);

process.exit(summary.verdict === 'PASS' ? 0 : 1);

function validateManifest(input) {
  if (!input || typeof input !== 'object') {
    throw new Error('Click-audit manifest must be an object');
  }

  if (!input.repo || typeof input.repo !== 'string') {
    throw new Error('Click-audit manifest requires repo');
  }

  if (!Array.isArray(input.scenarios) || !input.scenarios.length) {
    throw new Error(
      'Click-audit manifest requires at least one scenario',
    );
  }

  const ids = new Set();

  for (const scenario of input.scenarios) {
    if (!scenario.id || typeof scenario.id !== 'string') {
      throw new Error('Every click-audit scenario requires id');
    }

    if (ids.has(scenario.id)) {
      throw new Error(
        `Duplicate click-audit scenario id "${scenario.id}"`,
      );
    }

    ids.add(scenario.id);

    if (!scenario.path || typeof scenario.path !== 'string') {
      throw new Error(
        `Scenario "${scenario.id}" requires path`,
      );
    }

    for (const action of scenario.actions || []) {
      if (!action.type || typeof action.type !== 'string') {
        throw new Error(
          `Scenario "${scenario.id}" has an action without type`,
        );
      }

      if (
        action.viewports &&
        (!Array.isArray(action.viewports) ||
          action.viewports.some(
            (viewport) => !['desktop', 'mobile'].includes(viewport),
          ))
      ) {
        throw new Error(
          `Scenario "${scenario.id}" has invalid action viewports`,
        );
      }
    }
  }
}

function actionAppliesToViewport(action, viewportName) {
  return (
    !action.viewports ||
    action.viewports.includes(viewportName)
  );
}

function assertFinalPath(page, expectedPath) {
  if (!expectedPath) return;

  const actual = normalizePath(new URL(page.url()).pathname);
  const expected = normalizePath(expectedPath);

  if (actual !== expected) {
    throw new Error(
      `final path mismatch: expected "${expected}", got "${actual}"`,
    );
  }
}

async function assertExpected(page, expected, timeout) {
  if (expected.heading) {
    await page
      .getByRole('heading', {
        name: exactAccessibleNameRegex(expected.heading),
      })
      .first()
      .waitFor({
        state: 'visible',
        timeout,
      });
  }

  if (expected.text) {
    await waitForVisibleText(page, expected.text, timeout);
  }
}

async function runAction(page, action, timeout) {
  switch (action.type) {
    case 'clickLink': {
      const locator = page
        .getByRole('link', {
          name: exactAccessibleNameRegex(action.name),
        })
        .first();

      await locator.waitFor({
        state: 'visible',
        timeout,
      });

      await locator.click({ timeout });

      if (action.wait_for_idle !== false) {
        await page.waitForLoadState('networkidle', {
          timeout,
        });
      }

      return;
    }

    case 'clickButton': {
      const locator = page
        .getByRole('button', {
          name: exactAccessibleNameRegex(action.name),
        })
        .first();

      await locator.waitFor({
        state: 'visible',
        timeout,
      });

      await locator.click({ timeout });
      return;
    }

    case 'fill': {
      const role = action.role || 'textbox';
      const locator = page
        .getByRole(role, {
          name: exactAccessibleNameRegex(action.label),
        })
        .first();

      await locator.waitFor({
        state: 'visible',
        timeout,
      });

      await locator.fill(action.value, { timeout });
      return;
    }

    case 'check': {
      const role = action.role || 'checkbox';
      const locator = page
        .getByRole(role, {
          name: exactAccessibleNameRegex(action.label),
        })
        .first();

      await locator.waitFor({
        state: 'visible',
        timeout,
      });

      await locator.check({ timeout });
      return;
    }

    case 'reload':
      await page.reload({
        waitUntil: 'networkidle',
        timeout,
      });
      return;

    case 'assertText':
      await waitForVisibleText(page, action.value, timeout);
      return;

    case 'assertRole': {
      const locator = page
        .getByRole(action.role, {
          name: exactAccessibleNameRegex(action.name),
        })
        .first();

      await locator.waitFor({
        state: 'visible',
        timeout,
      });

      return;
    }

    default:
      throw new Error(
        `UNSUPPORTED_SAFE_ACTION: ${action.type}`,
      );
  }
}

async function waitForVisibleText(page, value, timeout) {
  const pattern = flexibleTextRegex(value);
  const deadline = Date.now() + timeout;
  let lastCount = 0;

  while (Date.now() < deadline) {
    const locator = page.getByText(pattern);
    lastCount = await locator.count();

    for (let index = 0; index < lastCount; index += 1) {
      try {
        if (await locator.nth(index).isVisible()) return;
      } catch {
        // The DOM may have changed between count() and isVisible().
      }
    }

    await page.waitForTimeout(100);
  }

  throw new Error(
    `Timed out waiting for visible text "${value}" ` +
      `(matched ${lastCount} hidden or detached element(s))`,
  );
}

async function assertRenderSafety(page) {
  const result = await page.evaluate(() => {
    const viewportWidth =
      document.documentElement.clientWidth;

    const overflow =
      document.documentElement.scrollWidth > viewportWidth;

    const controls = [
      ...document.querySelectorAll(
        'a[href],button,input,select,textarea',
      ),
    ]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);

        return (
          style.visibility !== 'hidden' &&
          style.display !== 'none' &&
          rect.width > 0 &&
          rect.height > 0
        );
      })
      .map((element) => {
        const rect = element.getBoundingClientRect();

        return {
          tag: element.tagName,
          text: (
            element.innerText ||
            element.getAttribute('aria-label') ||
            ''
          ).slice(0, 80),
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
          offscreen:
            rect.right < 0 || rect.left > viewportWidth,
        };
      });

    return {
      overflow,
      controls,
    };
  });

  if (result.overflow) {
    throw new Error(
      'UI_DISPLAY_NORMALIZATION_FAILED: horizontal overflow',
    );
  }

  if (result.controls.some((control) => control.offscreen)) {
    throw new Error(
      'UI_DISPLAY_NORMALIZATION_FAILED: offscreen control',
    );
  }

  const body = await page.locator('body').innerText();

  if (/<script|<div|�|\{\s*"[^"]+"\s*:/i.test(body)) {
    throw new Error(
      'UI_DISPLAY_NORMALIZATION_FAILED: raw payload marker',
    );
  }
}

async function safeGeometry(page) {
  try {
    return await page.evaluate(() => ({
      viewport: {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      },
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      controls: [
        ...document.querySelectorAll(
          'a[href],button,input,select,textarea',
        ),
      ].map((element) => {
        const rect = element.getBoundingClientRect();

        return {
          tag: element.tagName,
          label: (
            element.innerText ||
            element.getAttribute('aria-label') ||
            ''
          ).slice(0, 80),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        };
      }),
    }));
  } catch {
    return null;
  }
}

function exactAccessibleNameRegex(value) {
  return new RegExp(
    `^${escapeRegex(value).replace(/\s+/g, '\\s+')}$`,
    'i',
  );
}

function flexibleTextRegex(value) {
  return new RegExp(
    escapeRegex(value).replace(/\s+/g, '\\s+'),
    'i',
  );
}

function escapeRegex(value) {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  );
}

function normalizePath(value) {
  const normalized = String(value || '/').replace(/\/+$/, '');
  return normalized || '/';
}
