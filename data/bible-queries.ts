import { searchOfflineBible, type OfflineSearchHit } from './bible-corpus';
import { getChapterVerses, type BibleBook, type BibleVerse } from './bible';

export type BibleSearchHit = OfflineSearchHit;

export function readBibleChapter(_db: unknown, book: BibleBook, chapter: number): Promise<BibleVerse[]> {
  return Promise.resolve(getChapterVerses(book.id, chapter));
}

export function searchBibleText(
  _db: unknown,
  query: string,
  _after = 0
): Promise<{ hits: BibleSearchHit[]; next: number | null }> {
  const hits = searchOfflineBible(query, { limit: 40 });
  return Promise.resolve({ hits, next: null });
}
