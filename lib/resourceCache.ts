type Entry = { value: unknown; expiresAt: number };
const values = new Map<string, Entry>();
const pending = new Map<string, Promise<unknown>>();

export async function cachedResource<T>(key: string, loader: () => Promise<T>, ttlMs = 30_000): Promise<T> {
  const current = values.get(key);
  if (current && current.expiresAt > Date.now()) return current.value as T;
  const existing = pending.get(key);
  if (existing) return existing as Promise<T>;
  const request = loader().then((value) => { values.set(key, { value, expiresAt: Date.now() + ttlMs }); return value; }).finally(() => pending.delete(key));
  pending.set(key, request);
  return request;
}

export function invalidateResource(prefix: string) {
  for (const key of values.keys()) if (key.startsWith(prefix)) values.delete(key);
}

export function clearResourceCache() { values.clear(); pending.clear(); }
