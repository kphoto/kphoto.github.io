import { describe, expect, it } from 'vitest';
import { REQUEST_TIMEOUT_MS } from './liveStats';
import { isRetryable, LiveStatsApi, LiveStatsRequestError, type FetchLike } from './liveStatsApi';

interface Call {
  readonly url: string;
  readonly init: RequestInit;
}

const summaryJson = { siteNow: 2, siteViews1h: 3, siteViews24h: 4, pageNow: 1, pageViews24h: 5 };

function setup(respond: (call: Call) => Response | Promise<Response>) {
  const calls: Call[] = [];
  const timeouts: number[] = [];
  const signal = new AbortController().signal;
  const fetch: FetchLike = (url, init) => {
    const call = { url, init };
    calls.push(call);
    return Promise.resolve(respond(call));
  };
  const api = new LiveStatsApi({
    projectUrl: 'https://ref.supabase.co',
    publishableKey: 'sb_publishable_k',
    fetch,
    timeoutSignal: (ms) => {
      timeouts.push(ms);
      return signal;
    },
  });
  return { api, calls, timeouts, signal };
}

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

/** The JSON body a call sent (every POST here sends a JSON string). */
function bodyOf(call: Call | undefined): unknown {
  const body = call?.init.body;
  if (typeof body !== 'string') {
    throw new Error('expected a JSON string body');
  }
  return JSON.parse(body);
}

function headersOf(call: Call | undefined): Record<string, string> {
  return (call?.init.headers ?? {}) as Record<string, string>;
}

describe('LiveStatsApi requests', () => {
  it('heartbeat POSTs the viewer, path and view flag to kp_heartbeat', async () => {
    const { api, calls } = setup(() => json(summaryJson));
    await expect(api.heartbeat('uuid-1', '/blog/a/', true)).resolves.toEqual(summaryJson);
    const [call] = calls;
    expect(call?.url).toBe('https://ref.supabase.co/rest/v1/rpc/kp_heartbeat');
    expect(call?.init.method).toBe('POST');
    expect(bodyOf(call)).toEqual({
      p_viewer: 'uuid-1',
      p_path: '/blog/a/',
      p_new_view: true,
    });
    expect(headersOf(call)['Content-Type']).toBe('application/json');
  });

  it('summary GETs kp_summary with the path URL-encoded', async () => {
    const { api, calls } = setup(() => json(summaryJson));
    await api.summary('/blog/a/');
    expect(calls[0]?.url).toBe(
      'https://ref.supabase.co/rest/v1/rpc/kp_summary?p_path=%2Fblog%2Fa%2F',
    );
    expect(calls[0]?.init.method).toBe('GET');
    expect(calls[0]?.init.body).toBeUndefined();
    expect(headersOf(calls[0])['Content-Type']).toBeUndefined();
  });

  it('board GETs kp_board and validates the rows', async () => {
    const { api, calls } = setup(() =>
      json({
        siteNow: 1,
        siteViews1h: 1,
        siteViews24h: 1,
        pages: [{ path: '/a/', now: 1, views1h: 1, views24h: 1 }],
      }),
    );
    const board = await api.board();
    expect(calls[0]?.url).toBe('https://ref.supabase.co/rest/v1/rpc/kp_board');
    expect(board.pages).toHaveLength(1);
  });

  it('sends the publishable key as apikey only — never as a bearer token', async () => {
    const { api, calls } = setup(() => json(summaryJson));
    await api.summary('/');
    const headers = headersOf(calls[0]);
    expect(headers.apikey).toBe('sb_publishable_k');
    expect(headers.Authorization).toBeUndefined();
    expect(headers.Accept).toBe('application/json');
  });

  it('sends no cookies, no referrer and bypasses the HTTP cache', async () => {
    const { api, calls } = setup(() => json(summaryJson));
    await api.summary('/');
    expect(calls[0]?.init.credentials).toBe('omit');
    expect(calls[0]?.init.referrerPolicy).toBe('no-referrer');
    expect(calls[0]?.init.cache).toBe('no-store');
  });

  it('bounds every request with the default timeout signal', async () => {
    const { api, calls, timeouts, signal } = setup(() => json(summaryJson));
    await api.summary('/');
    expect(timeouts).toEqual([REQUEST_TIMEOUT_MS]);
    expect(calls[0]?.init.signal).toBe(signal);
  });

  it('honours a custom timeout', async () => {
    const timeouts: number[] = [];
    const api = new LiveStatsApi({
      projectUrl: 'https://ref.supabase.co',
      publishableKey: 'k',
      fetch: () => Promise.resolve(json(summaryJson)),
      timeoutSignal: (ms) => {
        timeouts.push(ms);
        return new AbortController().signal;
      },
      timeoutMs: 1234,
    });
    await api.summary('/');
    expect(timeouts).toEqual([1234]);
  });
});

describe('LiveStatsApi.leave', () => {
  it('POSTs kp_leave with keepalive so it can outlive the page', async () => {
    const { api, calls } = setup(() => new Response(null, { status: 204 }));
    await api.leave('uuid-1');
    expect(calls[0]?.url).toBe('https://ref.supabase.co/rest/v1/rpc/kp_leave');
    expect(calls[0]?.init.keepalive).toBe(true);
    expect(bodyOf(calls[0])).toEqual({ p_viewer: 'uuid-1' });
  });

  it('never rejects, whatever happens', async () => {
    const failing = setup(() => {
      throw new TypeError('Failed to fetch');
    });
    await expect(failing.api.leave('x')).resolves.toBeUndefined();
    const erroring = setup(() => json({}, 500));
    await expect(erroring.api.leave('x')).resolves.toBeUndefined();
  });

  it('is the only call that uses keepalive', async () => {
    const { api, calls } = setup(() => json(summaryJson));
    await api.heartbeat('u', '/', false);
    expect(calls[0]?.init.keepalive).toBeUndefined();
  });
});

describe('LiveStatsApi errors', () => {
  async function failureOf(response: Response): Promise<LiveStatsRequestError> {
    const { api } = setup(() => response);
    try {
      await api.summary('/');
    } catch (error) {
      if (error instanceof LiveStatsRequestError) {
        return error;
      }
      throw error;
    }
    throw new Error('expected a failure');
  }

  it.each([500, 502, 503, 504, 540, 408])('HTTP %i is retryable', async (status) => {
    const error = await failureOf(json({}, status));
    expect(error.status).toBe(status);
    expect(error.retryable).toBe(true);
    expect(isRetryable(error)).toBe(true);
  });

  // 400 invalid input, 401/403 bad or revoked key, 402 free-tier quota
  // exhausted, 404 functions missing (never applied, or torn down), 405 a
  // write over GET, 429 rate limited: none of these fixes itself in 30 s.
  it.each([400, 401, 402, 403, 404, 405, 429])('HTTP %i is not retryable', async (status) => {
    const error = await failureOf(json({ code: 'x' }, status));
    expect(error.retryable).toBe(false);
    expect(isRetryable(error)).toBe(false);
  });

  it('treats a non-JSON body as a permanent failure', async () => {
    const error = await failureOf(new Response('<html>oops</html>', { status: 200 }));
    expect(error.retryable).toBe(false);
    expect(error.message).toContain('not JSON');
  });

  it('treats a wrong-shaped body as a permanent failure', async () => {
    const error = await failureOf(json({ siteNow: 'lots' }));
    expect(error.retryable).toBe(false);
    expect(error.message).toContain('unexpected response shape');
  });

  it('lets transport errors through, which count as retryable', async () => {
    const { api } = setup(() => {
      throw new TypeError('Failed to fetch');
    });
    const error: unknown = await api.summary('/').catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(TypeError);
    expect(isRetryable(error)).toBe(true);
    expect(isRetryable(new DOMException('timed out', 'TimeoutError'))).toBe(true);
  });
});
