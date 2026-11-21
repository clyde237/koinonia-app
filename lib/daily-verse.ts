import { BIBLE_BOOKS, getBibleBook } from '../data/bible';
import { getChapterVerses } from '../data/bible-corpus';

function getApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }
  try {
    // Dynamic require so tests and environments without expo-constants run cleanly
    const Constants = require('expo-constants');
    const host = Constants?.expoConfig?.hostUri?.split(':')[0] ?? Constants?.default?.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
    return (typeof __DEV__ !== 'undefined' && __DEV__) ? `http://${host}:3000` : '';
  } catch {
    return '';
  }
}

export type DailyVerse = {
  date: string;
  id?: number;
  bookId: string;
  chapter: number;
  number: number;
  text: string;
  bookName: string;
  bookAbbr?: string;
  testament?: 'AT' | 'NT';
};

/**
 * Liste sélectionnée de passages bibliques édifiants (Louis Segond 1910)
 * servant de générateur hors-ligne déterministe pour le verset du jour.
 */
export const CURATED_OFFLINE_PASSAGES: Array<{ bookId: string; chapter: number; verse: number }> = [
  { bookId: 'jean', chapter: 15, verse: 4 },
  { bookId: 'psaumes', chapter: 23, verse: 1 },
  { bookId: 'jean', chapter: 3, verse: 16 },
  { bookId: 'proverbes', chapter: 3, verse: 5 },
  { bookId: 'romains', chapter: 8, verse: 28 },
  { bookId: 'philippiens', chapter: 4, verse: 13 },
  { bookId: 'esaie', chapter: 40, verse: 31 },
  { bookId: 'jeremie', chapter: 29, verse: 11 },
  { bookId: 'matthieu', chapter: 11, verse: 28 },
  { bookId: 'psaumes', chapter: 119, verse: 105 },
  { bookId: 'josue', chapter: 1, verse: 9 },
  { bookId: 'romains', chapter: 12, verse: 2 },
  { bookId: 'galates', chapter: 5, verse: 22 },
  { bookId: 'ephesiens', chapter: 2, verse: 10 },
  { bookId: '2corinthiens', chapter: 5, verse: 17 },
  { bookId: 'hebreux', chapter: 11, verse: 1 },
  { bookId: '1pierre', chapter: 5, verse: 7 },
  { bookId: 'psaumes', chapter: 46, verse: 2 },
  { bookId: 'matthieu', chapter: 6, verse: 33 },
  { bookId: 'psaumes', chapter: 91, verse: 1 },
  { bookId: '1corinthiens', chapter: 13, verse: 4 },
  { bookId: 'jean', chapter: 14, verse: 27 },
  { bookId: 'colossiens', chapter: 3, verse: 23 },
  { bookId: 'psaumes', chapter: 27, verse: 1 },
  { bookId: 'proverbes', chapter: 4, verse: 23 },
  { bookId: 'jacques', chapter: 1, verse: 5 },
  { bookId: 'romains', chapter: 8, verse: 31 },
  { bookId: 'psaumes', chapter: 37, verse: 4 },
  { bookId: '1thessaloniciens', chapter: 5, verse: 16 },
  { bookId: 'esaie', chapter: 41, verse: 10 },
  { bookId: 'psaumes', chapter: 121, verse: 2 },
  { bookId: 'psaumes', chapter: 103, verse: 2 },
  { bookId: 'lamentations', chapter: 3, verse: 22 },
  { bookId: '2timothee', chapter: 1, verse: 7 },
  { bookId: 'psaumes', chapter: 34, verse: 9 },
  { bookId: 'jean', chapter: 8, verse: 12 },
  { bookId: 'romains', chapter: 15, verse: 13 },
  { bookId: 'psaumes', chapter: 118, verse: 24 },
  { bookId: 'apocalypse', chapter: 21, verse: 4 },
  { bookId: 'jean', chapter: 1, verse: 1 },
];

const memoryCache = new Map<string, DailyVerse>();

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

async function getStoredVerse(dateKey: string): Promise<DailyVerse | null> {
  const rawKey = `koinonia_daily_verse_${dateKey}`;
  const key = sanitizeKey(rawKey);
  try {
    const ss = await getSecureStore();
    if (ss) {
      const val = await ss.getItemAsync(key);
      if (val) {
        return JSON.parse(val) as DailyVerse;
      }
    }
  } catch {
    // secure store unavailable or parse error
  }
  return null;
}

async function saveStoredVerse(dateKey: string, verse: DailyVerse): Promise<void> {
  const rawKey = `koinonia_daily_verse_${dateKey}`;
  const key = sanitizeKey(rawKey);
  try {
    const ss = await getSecureStore();
    if (ss) {
      await ss.setItemAsync(key, JSON.stringify(verse));
    }
  } catch {
    // non-blocking
  }
}

/**
 * Calcule un hachage d'entier 32-bit stable pour une chaîne de date YYYY-MM-DD.
 */
export function hashDateString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Retourne la date courante au format local 'YYYY-MM-DD'.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Génère instantanément et de façon déterministe un verset du jour
 * à partir du corpus local Louis Segond 1910 sans aucune dépendance réseau.
 */
export function getOfflineDailyVerse(dateStr?: string): DailyVerse {
  const dateKey = dateStr || getTodayDateString();
  const index = hashDateString(dateKey) % CURATED_OFFLINE_PASSAGES.length;
  const target = CURATED_OFFLINE_PASSAGES[index];

  const verses = getChapterVerses(target.bookId, target.chapter);
  const found = verses.find(v => v.number === target.verse);
  const book = getBibleBook(target.bookId);

  if (found && book) {
    return {
      date: dateKey,
      bookId: target.bookId,
      chapter: target.chapter,
      number: target.verse,
      text: found.text,
      bookName: book.name,
      bookAbbr: book.abbr,
      testament: book.testament,
    };
  }

  // Secours absolu garanti : Jean 15.4
  return {
    date: dateKey,
    bookId: 'jean',
    chapter: 15,
    number: 4,
    text: 'Demeurez en moi, et je demeurerai en vous. Comme le sarment ne peut de lui-même porter du fruit, s’il ne demeure attaché au cep, ainsi vous ne le pouvez non plus, si vous ne demeurez en moi.',
    bookName: 'Jean',
    bookAbbr: 'Jn',
    testament: 'NT',
  };
}

/**
 * Formate le texte du verset prêt pour le partage natif (Share).
 */
export function formatShareDailyVerse(verse: DailyVerse): string {
  const cleanText = verse.text.trim();
  const ref = `${verse.bookName} ${verse.chapter}.${verse.number}`;
  return `« ${cleanText} »\n${ref} (Louis Segond 1910)\n\nKoinonia · Verset du jour`;
}

/**
 * Récupère le verset du jour :
 * 1. Vérifie le cache mémoire.
 * 2. Tente d'appeler l'API koinonia-api (GET /api/bible/daily?date=...).
 * 3. Si l'API répond, met en cache persistant et retourne.
 * 4. Si échec ou hors-ligne, lit le cache persistant ou génère le verset hors-ligne.
 */
export async function fetchDailyVerse(dateStr?: string): Promise<DailyVerse> {
  const dateKey = dateStr || getTodayDateString();

  if (memoryCache.has(dateKey)) {
    return memoryCache.get(dateKey)!;
  }

  // 1. Tenter l'API distante si configurée
  const apiUrl = getApiUrl();
  if (apiUrl) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      const res = await fetch(`${apiUrl}/api/bible/daily?date=${dateKey}`, {
        signal: controller.signal,
        headers: {
          'X-Koinonia-Client': 'mobile',
        },
      });

      if (res.ok) {
        const data = (await res.json()) as DailyVerse;
        if (data && data.text && data.bookId && data.chapter && data.number) {
          memoryCache.set(dateKey, data);
          await saveStoredVerse(dateKey, data);
          return data;
        }
      }
    } catch {
      // Ignorer l'erreur réseau et passer au stockage / secours hors-ligne
    } finally {
      clearTimeout(timer);
    }
  }

  // 2. Tenter le stockage local persistant
  const stored = await getStoredVerse(dateKey);
  if (stored) {
    memoryCache.set(dateKey, stored);
    return stored;
  }

  // 3. Fallback déterministe hors-ligne immédiat
  const fallback = getOfflineDailyVerse(dateKey);
  memoryCache.set(dateKey, fallback);
  await saveStoredVerse(dateKey, fallback);
  return fallback;
}
