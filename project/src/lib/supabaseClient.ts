import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './BoltDatabase.js';

type Keys = { url: string; anon: string; source: 'BoltDatabase' | '.env' };

function readKeys(): Keys {
  const url = SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || '';
  const anon = SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const source: Keys['source'] = SUPABASE_URL ? 'BoltDatabase' : '.env';

  if (!url || !anon) {
    console.error('[supabase] Clés manquantes — vérifie BoltDatabase.js ou tes variables .env');
  }

  return { url, anon, source };
}

let client: SupabaseClient | null = null;
let last: Keys | null = null;

function ensureClient(): SupabaseClient {
  const cur = readKeys();

  if (!client || !last || cur.url !== last.url || cur.anon !== last.anon) {
    client = createClient(cur.url, cur.anon, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'x-application-name': 'dalil-tounes'
        }
      }
    });

    if (import.meta.env.VITE_DEBUG_SEARCH === '1') {
      console.info(
        `[supabase] client (re)initialisé depuis ${cur.source}: ${cur.url.slice(0, 40)}…`
      );
    }

    last = cur;
  }

  return client!;
}

export const supabaseUrl = SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

// --- Debug logging (optionnel mais utile) ---

type SearchLog = {
  ts: string;
  page: string;
  component?: string;
  scope?: string;
  type: 'rpc' | 'select';
  endpoint: string;
  payload: any;
  durationMs: number;
  rowCount?: number;
  error?: string;
};

const listeners = new Set<(items: SearchLog[]) => void>();
const logs: SearchLog[] = [];

function pushLog(e: SearchLog) {
  logs.unshift(e);
  logs.splice(200);
  listeners.forEach((fn) => fn(logs));
}

export const DebugSearch = {
  enabled: import.meta.env.VITE_DEBUG_SEARCH === '1',
  get: () => logs,
  on: (fn: (items: SearchLog[]) => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export async function rpcLog<T = any>(
  name: string,
  params: Record<string, any>,
  meta?: { page?: string; component?: string; scope?: string }
) {
  const t0 = performance.now();
  const { data, error } = await ensureClient().rpc(name, params);

  pushLog({
    ts: new Date().toISOString(),
    page: meta?.page ?? (typeof window !== 'undefined' ? location.pathname : ''),
    component: meta?.component,
    scope: meta?.scope,
    type: 'rpc',
    endpoint: `/rest/v1/rpc/${name}`,
    payload: params,
    durationMs: Math.round(performance.now() - t0),
    rowCount: Array.isArray(data) ? data.length : undefined,
    error: error?.message,
  });

  return { data, error };
}

export async function selectLikeLog<T = any>(
  table: string,
  column: string,
  like: string,
  limit = 8,
  meta?: { page?: string; component?: string; scope?: string }
) {
  const t0 = performance.now();
  const { data, error } = await ensureClient()
    .from(table)
    .select('*')
    .ilike(column, like)
    .limit(limit);

  pushLog({
    ts: new Date().toISOString(),
    page: meta?.page ?? (typeof window !== 'undefined' ? location.pathname : ''),
    component: meta?.component,
    scope: meta?.scope,
    type: 'select',
    endpoint: `/rest/v1/${table}`,
    payload: { select: '*', ilike: { [column]: like }, limit },
    durationMs: Math.round(performance.now() - t0),
    rowCount: Array.isArray(data) ? data.length : undefined,
    error: error?.message,
  });

  return { data: (data ?? []) as T[], error };
}

// ✅ On exporte maintenant un client simple, sans Proxy ni bind compliqué
export const supabase: SupabaseClient = ensureClient();
export default supabase;


