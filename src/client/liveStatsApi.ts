import {
  parseBoard,
  parseSummary,
  REQUEST_TIMEOUT_MS,
  type LiveBoard,
  type LiveSummary,
} from './liveStats';

/** The slice of `fetch` the client needs; tests pass a fake. */
export type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

/** Builds an abort signal that fires after `ms`; tests pass a fake. */
export type TimeoutSignalFactory = (ms: number) => AbortSignal;

export interface LiveStatsApiOptions {
  /** `https://<ref>.supabase.co`, no trailing slash. */
  readonly projectUrl: string;
  /** The publishable key — sent as `apikey`, never as a bearer token. */
  readonly publishableKey: string;
  readonly fetch: FetchLike;
  readonly timeoutSignal: TimeoutSignalFactory;
  readonly timeoutMs?: number;
}

/**
 * A failed request. `retryable` separates "try again on the next tick"
 * (network errors, timeouts, 5xx — e.g. a paused or restarting project) from
 * "stop now" (4xx — a bad or revoked key, missing functions, the free tier's
 * 402 once a quota is exhausted, or a response we cannot parse).
 */
export class LiveStatsRequestError extends Error {
  override readonly name = 'LiveStatsRequestError';
  readonly status: number | null;
  readonly retryable: boolean;

  constructor(message: string, status: number | null, retryable: boolean) {
    super(message);
    this.status = status;
    this.retryable = retryable;
  }
}

/** Anything that is not a classified request error is a transport failure. */
export function isRetryable(error: unknown): boolean {
  return error instanceof LiveStatsRequestError ? error.retryable : true;
}

interface RpcCall {
  readonly method: 'GET' | 'POST';
  readonly name: string;
  readonly query?: Readonly<Record<string, string>>;
  readonly body?: Readonly<Record<string, unknown>>;
  readonly keepalive?: boolean;
}

/**
 * Talks to the four PostgREST functions from `docs/supabase/live-stats.sql`
 * with nothing but `fetch`: no SDK, no WebSocket, no runtime dependency
 * (ADR 0022). Reads use GET (the functions are STABLE); writes use POST.
 */
export class LiveStatsApi {
  readonly #base: string;
  readonly #key: string;
  readonly #fetch: FetchLike;
  readonly #timeoutSignal: TimeoutSignalFactory;
  readonly #timeoutMs: number;

  constructor(options: LiveStatsApiOptions) {
    this.#base = `${options.projectUrl}/rest/v1/rpc/`;
    this.#key = options.publishableKey;
    this.#fetch = options.fetch;
    this.#timeoutSignal = options.timeoutSignal;
    this.#timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;
  }

  /** Checks this tab in (counting a view when `newView`); returns the page summary. */
  async heartbeat(viewerId: string, path: string, newView: boolean): Promise<LiveSummary> {
    const json = await this.#json({
      method: 'POST',
      name: 'kp_heartbeat',
      body: { p_viewer: viewerId, p_path: path, p_new_view: newView },
    });
    return this.#parse(parseSummary, json);
  }

  /** Reads the page summary without counting anything. */
  async summary(path: string): Promise<LiveSummary> {
    const json = await this.#json({ method: 'GET', name: 'kp_summary', query: { p_path: path } });
    return this.#parse(parseSummary, json);
  }

  /** Reads the `/live/` board. */
  async board(): Promise<LiveBoard> {
    const json = await this.#json({ method: 'GET', name: 'kp_board' });
    return this.#parse(parseBoard, json);
  }

  /**
   * Tells the server this tab is gone. Fire-and-forget: it never rejects, and
   * `keepalive` lets it outlive the page. If it is lost anyway, the tab simply
   * stops counting 90 s after its last heartbeat.
   */
  async leave(viewerId: string): Promise<void> {
    try {
      await this.#send({
        method: 'POST',
        name: 'kp_leave',
        body: { p_viewer: viewerId },
        keepalive: true,
      });
    } catch {
      // Best effort by design.
    }
  }

  #parse<T>(parser: (value: unknown) => T, json: unknown): T {
    try {
      return parser(json);
    } catch (error) {
      throw new LiveStatsRequestError(
        `unexpected response shape: ${error instanceof Error ? error.message : 'unknown'}`,
        null,
        false,
      );
    }
  }

  async #json(call: RpcCall): Promise<unknown> {
    const response = await this.#send(call);
    try {
      return (await response.json()) as unknown;
    } catch {
      throw new LiveStatsRequestError(
        `${call.name}: response was not JSON`,
        response.status,
        false,
      );
    }
  }

  async #send(call: RpcCall): Promise<Response> {
    const query = call.query === undefined ? '' : `?${new URLSearchParams(call.query).toString()}`;
    const headers: Record<string, string> = { apikey: this.#key, Accept: 'application/json' };
    const init: RequestInit = {
      method: call.method,
      headers,
      cache: 'no-store',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal: this.#timeoutSignal(this.#timeoutMs),
    };
    if (call.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(call.body);
    }
    if (call.keepalive === true) {
      init.keepalive = true;
    }
    const response = await this.#fetch(`${this.#base}${call.name}${query}`, init);
    if (!response.ok) {
      throw new LiveStatsRequestError(
        `${call.name}: HTTP ${String(response.status)}`,
        response.status,
        response.status >= 500 || response.status === 408,
      );
    }
    return response;
  }
}
