/**
 * Shared base-URL resolution for the browser-driven QA scripts.
 *
 * Why this exists: these scripts used to default to `:3001`, which contradicted
 * the documented default dev port (`:3000`, see AGENTS.md). Every script picked
 * its own env var name too, so overriding the port meant reading each script
 * to find out which one it honoured.
 *
 * Precedence: explicit `--url` flag > `QA_BASE_URL` > `AUDIT_BASE` /
 * `BASE_URL` (legacy names, still honoured) > `http://localhost:3000`.
 */

const DEFAULT_PORT = 3000;

function pickFlag(flag) {
  const argv = process.argv;
  const i = argv.indexOf(flag);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : undefined;
}

/**
 * Resolves the base URL and validates the dev server is actually answering,
 * so a wrong port fails with a message that names the port instead of a bare
 * Playwright `ERR_CONNECTION_REFUSED`.
 *
 * @param {string} scriptName caller name, used in the error message
 * @returns {Promise<string>} the base URL without a trailing slash
 */
export async function resolveBase(scriptName) {
  const base =
    pickFlag("--url") ||
    process.env.QA_BASE_URL ||
    process.env.AUDIT_BASE ||
    process.env.BASE_URL ||
    `http://localhost:${DEFAULT_PORT}`;

  const url = base.replace(/\/$/, "");

  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok && res.status >= 500) {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (error) {
    throw new Error(
      `${scriptName}: no dev server answering at ${url}\n` +
        `  Start one with: pnpm dev --port ${DEFAULT_PORT}\n` +
        `  Or point this run elsewhere: --url http://localhost:<port>\n` +
        `  (understood: QA_BASE_URL, AUDIT_BASE, BASE_URL)\n` +
        `  Cause: ${error.message}`
    );
  }

  return url;
}