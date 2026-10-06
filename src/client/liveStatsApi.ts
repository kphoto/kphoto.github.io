import {
  parseBoard,
  parseSummary,
  REQUEST_TIMEOUT_MS,
  type LiveBoard,
  type LiveSummary,
} from './liveStats.ts';

export type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

export type TimeoutSignalFactory = (ms: number) => AbortSignal;

export interface LiveStatsApiOptions {
  readonly projectUrl: string;

  readonly publishableKey: string;
  readonly fetch: FetchLike;
  readonly timeoutSignal: TimeoutSignalFactory;
  readonly timeoutMs?: number;
}

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

  async heartbeat(viewerId: string, path: string, newView: boolean): Promise<LiveSummary> {
    const json = await this.#json({
      method: 'POST',
      name: 'kp_heartbeat',
      body: { p_viewer: viewerId, p_path: path, p_new_view: newView },
    });
    return this.#parse(parseSummary, json);
  }

  async summary(path: string): Promise<LiveSummary> {
    const json = await this.#json({ method: 'GET', name: 'kp_summary', query: { p_path: path } });
    return this.#parse(parseSummary, json);
  }

  async board(): Promise<LiveBoard> {
    const json = await this.#json({ method: 'GET', name: 'kp_board' });
    return this.#parse(parseBoard, json);
  }

  async leave(viewerId: string): Promise<void> {
    try {
      await this.#send({
        method: 'POST',
        name: 'kp_leave',
        body: { p_viewer: viewerId },
        keepalive: true,
      });
    } catch {}
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
