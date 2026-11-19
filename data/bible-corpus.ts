import { BibleVerse, BIBLE_BOOKS, normalizeBibleText } from './bible';

type ChapterMap = Record<string, BibleVerse[]>;

const LOADERS: Record<string, () => ChapterMap> = {
  genese: () => require('./bible-corpus/genese.json'),
  exode: () => require('./bible-corpus/exode.json'),
  levitique: () => require('./bible-corpus/levitique.json'),
  nombres: () => require('./bible-corpus/nombres.json'),
  deuteronome: () => require('./bible-corpus/deuteronome.json'),
  josue: () => require('./bible-corpus/josue.json'),
  juges: () => require('./bible-corpus/juges.json'),
  ruth: () => require('./bible-corpus/ruth.json'),
  '1samuel': () => require('./bible-corpus/1samuel.json'),
  '2samuel': () => require('./bible-corpus/2samuel.json'),
  '1rois': () => require('./bible-corpus/1rois.json'),
  '2rois': () => require('./bible-corpus/2rois.json'),
  '1chroniques': () => require('./bible-corpus/1chroniques.json'),
  '2chroniques': () => require('./bible-corpus/2chroniques.json'),
  esdras: () => require('./bible-corpus/esdras.json'),
  nehemie: () => require('./bible-corpus/nehemie.json'),
  esther: () => require('./bible-corpus/esther.json'),
  job: () => require('./bible-corpus/job.json'),
  psaumes: () => require('./bible-corpus/psaumes.json'),
  proverbes: () => require('./bible-corpus/proverbes.json'),
  ecclesiaste: () => require('./bible-corpus/ecclesiaste.json'),
  cantique: () => require('./bible-corpus/cantique.json'),
  esaie: () => require('./bible-corpus/esaie.json'),
  jeremie: () => require('./bible-corpus/jeremie.json'),
  lamentations: () => require('./bible-corpus/lamentations.json'),
  ezechiel: () => require('./bible-corpus/ezechiel.json'),
  daniel: () => require('./bible-corpus/daniel.json'),
  osee: () => require('./bible-corpus/osee.json'),
  joel: () => require('./bible-corpus/joel.json'),
  amos: () => require('./bible-corpus/amos.json'),
  abdias: () => require('./bible-corpus/abdias.json'),
  jonas: () => require('./bible-corpus/jonas.json'),
  michee: () => require('./bible-corpus/michee.json'),
  nahum: () => require('./bible-corpus/nahum.json'),
  habacuc: () => require('./bible-corpus/habacuc.json'),
  sophonie: () => require('./bible-corpus/sophonie.json'),
  aggee: () => require('./bible-corpus/aggee.json'),
  zacharie: () => require('./bible-corpus/zacharie.json'),
  malachie: () => require('./bible-corpus/malachie.json'),
  matthieu: () => require('./bible-corpus/matthieu.json'),
  marc: () => require('./bible-corpus/marc.json'),
  luc: () => require('./bible-corpus/luc.json'),
  jean: () => require('./bible-corpus/jean.json'),
  actes: () => require('./bible-corpus/actes.json'),
  romains: () => require('./bible-corpus/romains.json'),
  '1corinthiens': () => require('./bible-corpus/1corinthiens.json'),
  '2corinthiens': () => require('./bible-corpus/2corinthiens.json'),
  galates: () => require('./bible-corpus/galates.json'),
  ephesiens: () => require('./bible-corpus/ephesiens.json'),
  philippiens: () => require('./bible-corpus/philippiens.json'),
  colossiens: () => require('./bible-corpus/colossiens.json'),
  '1thessaloniciens': () => require('./bible-corpus/1thessaloniciens.json'),
  '2thessaloniciens': () => require('./bible-corpus/2thessaloniciens.json'),
  '1timothee': () => require('./bible-corpus/1timothee.json'),
  '2timothee': () => require('./bible-corpus/2timothee.json'),
  tite: () => require('./bible-corpus/tite.json'),
  philemon: () => require('./bible-corpus/philemon.json'),
  hebreux: () => require('./bible-corpus/hebreux.json'),
  jacques: () => require('./bible-corpus/jacques.json'),
  '1pierre': () => require('./bible-corpus/1pierre.json'),
  '2pierre': () => require('./bible-corpus/2pierre.json'),
  '1jean': () => require('./bible-corpus/1jean.json'),
  '2jean': () => require('./bible-corpus/2jean.json'),
  '3jean': () => require('./bible-corpus/3jean.json'),
  jude: () => require('./bible-corpus/jude.json'),
  apocalypse: () => require('./bible-corpus/apocalypse.json'),
};

const cache = new Map<string, ChapterMap>();

export function getBookChapters(bookId: string): ChapterMap | null {
  const normalizedId = bookId.toLowerCase();
  const cached = cache.get(normalizedId);
  if (cached) return cached;
  const loader = LOADERS[normalizedId];
  if (!loader) return null;
  try {
    const data = loader();
    cache.set(normalizedId, data);
    return data;
  } catch {
    return null;
  }
}

/**
 * Récupère les versets d'un chapitre donné directement depuis le corpus hors-ligne.
 * Temps d'exécution quasi-instantané (0ms), aucune requête réseau, aucun module natif requis.
 */
export function getChapterVerses(bookId: string, chapter: number): BibleVerse[] {
  const chapters = getBookChapters(bookId);
  if (!chapters) return [];
  const list = chapters[String(chapter)] || [];
  return list;
}

export type OfflineSearchHit = BibleVerse & {
  bookId: string;
  bookName: string;
  bookAbbr: string;
  chapter: number;
};

/**
 * Recherche textuelle hors-ligne dans la Bible
 */
export function searchOfflineBible(
  query: string,
  options: { testament?: 'AT' | 'NT'; bookId?: string; limit?: number } = {}
): OfflineSearchHit[] {
  const rawTerms = normalizeBibleText(query).split(/\s+/).filter(Boolean);
  if (!rawTerms.length) return [];

  const limit = options.limit ?? 30;
  const hits: OfflineSearchHit[] = [];

  const booksToSearch = BIBLE_BOOKS.filter(b => {
    if (options.testament && b.testament !== options.testament) return false;
    if (options.bookId && b.id !== options.bookId) return false;
    return true;
  });

  for (const book of booksToSearch) {
    const chapters = getBookChapters(book.id);
    if (!chapters) continue;

    for (let c = 1; c <= book.chaptersCount; c++) {
      const verses = chapters[String(c)];
      if (!verses) continue;

      for (const verse of verses) {
        const normText = normalizeBibleText(verse.text);
        const matchesAll = rawTerms.every(term => normText.includes(term));
        if (matchesAll) {
          hits.push({
            number: verse.number,
            text: verse.text,
            bookId: book.id,
            bookName: book.name,
            bookAbbr: book.abbr,
            chapter: c,
          });
          if (hits.length >= limit) {
            return hits;
          }
        }
      }
    }
  }

  return hits;
}
