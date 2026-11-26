/**
 * 브라우저 저장소 래퍼.
 * - 텍스트 데이터(후기·제보): localStorage
 * - 사진 Blob: IndexedDB (localStorage 5MB 한도를 피하기 위해)
 * Supabase로 교체 시 이 파일은 사용하지 않게 됩니다.
 */
import { createStore, del, get, set, type UseStore } from 'idb-keyval';
import { StorageQuotaError } from '../contracts';

const PREFIX = 'iwm:';
export const IDB_URL_SCHEME = 'idb:';

export const isBrowser = () => typeof window !== 'undefined';

export function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      throw new StorageQuotaError();
    }
    throw e;
  }
}

export function storageKey(key: string) {
  return PREFIX + key;
}

let photoStore: UseStore | null = null;
function getPhotoStore() {
  if (!photoStore) photoStore = createStore('ian-world-map', 'photos');
  return photoStore;
}

/** 한 번 만든 objectURL 재사용 (메모리 누수 방지) */
const objectUrlCache = new Map<string, string>();

export async function savePhotoBlob(id: string, blob: Blob): Promise<string> {
  try {
    await set(id, blob, getPhotoStore());
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      throw new StorageQuotaError();
    }
    throw e;
  }
  return IDB_URL_SCHEME + id;
}

/** "idb:<id>" → 화면에 쓸 수 있는 blob: URL. 그 외 URL은 그대로 반환 */
export async function resolvePhotoUrl(url: string): Promise<string> {
  if (!url.startsWith(IDB_URL_SCHEME)) return url;
  const id = url.slice(IDB_URL_SCHEME.length);
  const cached = objectUrlCache.get(id);
  if (cached) return cached;
  const blob = await get<Blob>(id, getPhotoStore());
  if (!blob) return '';
  const objectUrl = URL.createObjectURL(blob);
  objectUrlCache.set(id, objectUrl);
  return objectUrl;
}

export async function deletePhotoBlob(url: string): Promise<void> {
  if (!url.startsWith(IDB_URL_SCHEME)) return;
  const id = url.slice(IDB_URL_SCHEME.length);
  const cached = objectUrlCache.get(id);
  if (cached) URL.revokeObjectURL(cached);
  objectUrlCache.delete(id);
  await del(id, getPhotoStore());
}

export function newId(): string {
  if (isBrowser() && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
