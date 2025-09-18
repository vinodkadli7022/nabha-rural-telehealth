// Minimal IndexedDB helper with graceful localStorage fallback
export type StoreName = "records" | "appointments" | "inventory";

const DB_NAME = "nabha-health-db";
const DB_VERSION = 1;

function hasIndexedDB() {
  return typeof indexedDB !== "undefined";
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("records")) db.createObjectStore("records", { keyPath: "id" });
      if (!db.objectStoreNames.contains("appointments")) db.createObjectStore("appointments", { keyPath: "id" });
      if (!db.objectStoreNames.contains("inventory")) db.createObjectStore("inventory", { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Fallback using localStorage per-store arrays
function lsKey(store: StoreName) {
  return `${DB_NAME}:${store}`;
}

function lsReadAll<T>(store: StoreName): T[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(lsKey(store));
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function lsWriteAll<T>(store: StoreName, data: T[]) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(lsKey(store), JSON.stringify(data));
  } catch {}
}

export async function putItem<T extends { id: string }>(store: StoreName, value: T): Promise<void> {
  if (!hasIndexedDB()) {
    const all = lsReadAll<T>(store);
    const idx = all.findIndex((x) => x.id === value.id);
    if (idx >= 0) all[idx] = value; else all.push(value);
    lsWriteAll(store, all);
    return;
  }
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAll<T>(store: StoreName): Promise<T[]> {
  if (!hasIndexedDB()) return lsReadAll<T>(store);
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve((req.result as T[]) || []);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteItem(store: StoreName, id: string): Promise<void> {
  if (!hasIndexedDB()) {
    const all = lsReadAll<any>(store).filter((x) => x.id !== id);
    lsWriteAll(store, all);
    return;
  }
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}