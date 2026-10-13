// ─────────────────────────────────────────────────────────────────────────────
// character-store — IndexedDB persistence for imported character cards.
//
// Cards (JSON + avatar) can be large; keep them out of localStorage. Settings
// only store activeCharacterId.
// ─────────────────────────────────────────────────────────────────────────────

import type { CharacterCard } from "@/lib/types";

const DB_NAME = "openchat-characters";
const DB_VERSION = 1;
const STORE = "characters";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(
      new Error("Character storage is unavailable (e.g. private browsing)."),
    );
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(request.error ?? new Error("IndexedDB open failed"));
    });
  }
  return dbPromise;
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const store = tx.objectStore(STORE);
        const request = fn(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () =>
          reject(request.error ?? new Error("IndexedDB request failed"));
      }),
  );
}

export async function listCharacters(): Promise<CharacterCard[]> {
  try {
    const all = await runTransaction<CharacterCard[]>("readonly", (store) =>
      store.getAll(),
    );
    return (all ?? []).sort((a, b) => b.importedAt - a.importedAt);
  } catch {
    return [];
  }
}

export async function getCharacter(id: string): Promise<CharacterCard | null> {
  try {
    const result = await runTransaction<CharacterCard | undefined>(
      "readonly",
      (store) => store.get(id),
    );
    return result ?? null;
  } catch {
    return null;
  }
}

export async function putCharacter(card: CharacterCard): Promise<void> {
  await runTransaction("readwrite", (store) => store.put(card));
}

export async function deleteCharacter(id: string): Promise<void> {
  try {
    await runTransaction("readwrite", (store) => store.delete(id));
  } catch {
    /* ignore */
  }
}
