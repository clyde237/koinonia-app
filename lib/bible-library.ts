import { getBibleBook, type BiblePassage } from '../data/bible';

const memoryStore = new Map<string, string>();

let secureStoreModule: typeof import('expo-secure-store') | null | undefined;

async function getSecureStore() {
  if (secureStoreModule === undefined) {
    try {
      secureStoreModule = await import('expo-secure-store');
    } catch {
      secureStoreModule = null;
    }
  }
  return secureStoreModule;
}

function sanitizeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function getStoredItem(rawKey: string): Promise<string | null> {
  const key = sanitizeKey(rawKey);
  try {
    const ss = await getSecureStore();
    if (ss) {
      const val = await ss.getItemAsync(key);
      if (val !== null) return val;
    }
    return memoryStore.get(key) ?? null;
  } catch {
    return memoryStore.get(key) ?? null;
  }
}

async function setStoredItem(rawKey: string, value: string): Promise<void> {
  const key = sanitizeKey(rawKey);
  memoryStore.set(key, value);
  try {
    const ss = await getSecureStore();
    if (ss) {
      await ss.setItemAsync(key, value);
    }
  } catch {
    // In-memory fallback is already recorded
  }
}

async function removeStoredItem(rawKey: string): Promise<void> {
  const key = sanitizeKey(rawKey);
  memoryStore.delete(key);
  try {
    const ss = await getSecureStore();
    if (ss) {
      await ss.deleteItemAsync(key);
    }
  } catch {
    // In-memory fallback is already cleared
  }
}

export async function loadBiblePosition(readerId: string): Promise<BiblePassage | undefined> {
  const saved = await getStoredItem(`bible_${readerId}_position`);
  if (!saved) return;
  try {
    const value = JSON.parse(saved) as Partial<BiblePassage> | null;
    if (!value || typeof value.bookId !== 'string' || typeof value.chapter !== 'number') return;
    const book = getBibleBook(value.bookId);
    if (book && Number.isInteger(value.chapter) && value.chapter > 0 && value.chapter <= book.chaptersCount) {
      return { bookId: value.bookId, chapter: value.chapter };
    }
  } catch {
    return;
  }
}

export function saveBiblePosition(readerId: string, { bookId, chapter }: BiblePassage): Promise<void> {
  return setStoredItem(`bible_${readerId}_position`, JSON.stringify({ bookId, chapter }));
}

export async function loadBibleHighlights(readerId: string, bookId: string, chapter: number): Promise<Set<number>> {
  const saved = await getStoredItem(`bible_${readerId}_${bookId}_${chapter}_highlights`);
  if (!saved) return new Set<number>();
  try {
    const values: unknown = JSON.parse(saved);
    return new Set<number>(Array.isArray(values) ? values.filter(value => Number.isInteger(value) && value > 0) : []);
  } catch {
    return new Set<number>();
  }
}

export function saveBibleHighlights(
  readerId: string,
  bookId: string,
  chapter: number,
  verses: ReadonlySet<number>
): Promise<void> {
  const key = `bible_${readerId}_${bookId}_${chapter}_highlights`;
  return verses.size ? setStoredItem(key, JSON.stringify([...verses])) : removeStoredItem(key);
}

export function loadBibleFontSize(readerId: string): Promise<string | null> {
  return getStoredItem(`bible_${readerId}_font`);
}

export function saveBibleFontSize(readerId: string, size: string): Promise<void> {
  return setStoredItem(`bible_${readerId}_font`, size);
}
