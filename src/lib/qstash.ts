/**
 * QStash client — used to reliably enqueue background HTTP jobs.
 *
 * In development, QStash can't reach localhost, so we fall back to a direct
 * fetch() call (which works fine in the persistent Node.js dev server).
 *
 * In production (Vercel), every call goes through QStash, which guarantees
 * delivery even after the originating Lambda has returned its response.
 */

import { Client } from "@upstash/qstash";

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? "ownyourcode-internal";

export const isDev = process.env.NODE_ENV !== "production";

/** Lazy singleton — avoids module-level throw when QSTASH_TOKEN is missing. */
let _qstash: Client | null = null;
function getQStash(): Client {
  if (!_qstash) {
    const token = process.env.QSTASH_TOKEN;
    if (!token) {
      throw new Error(
        "[qstash] QSTASH_TOKEN env var is not set. Add it to Vercel environment variables.",
      );
    }
    _qstash = new Client({ token });
  }
  return _qstash;
}

/**
 * Enqueue a POST job to one of our internal API routes.
 * - Production: uses QStash (guaranteed delivery, retries)
 * - Development: uses direct fetch (QStash can't reach localhost)
 */
export async function enqueueJob(
  url: string,
  body: Record<string, unknown>,
  opts: { retries?: number; delaySeconds?: number } = {},
): Promise<void> {
  if (isDev) {
    // Development: fire-and-forget direct fetch (persists in the long-lived Node process)
    void fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": INTERNAL_SECRET,
      },
      body: JSON.stringify(body),
    }).catch((e) =>
      console.error(`[enqueueJob] dev direct fetch failed for ${url}:`, e),
    );
    return;
  }

  // Production: enqueue via QStash (survives Lambda freeze)
  await getQStash().publishJSON({
    url,
    body,
    headers: {
      "x-internal-secret": INTERNAL_SECRET,
    },
    retries: opts.retries ?? 3,
    ...(opts.delaySeconds ? { delay: opts.delaySeconds } : {}),
  });
}

