export type Testament = 'AT' | 'NT';

export type BibleBook = {
  id: string;
  code: string;
  name: string;
  abbr: string;
  testament: Testament;
  chaptersCount: number;
};

export type BibleVerse = {
  number: number;
  text: string;
};

export type BiblePassage = {
  bookId: string;
  chapter: number;
  verse?: number;
};

export const DAILY_BIBLE_PASSAGE = { bookId: 'jean', chapter: 15, verse: 4 } satisfies BiblePassage;

/** Les 66 livres du canon biblique (Louis Segond 1910) */
export const BIBLE_BOOKS: BibleBook[] = [
  // Ancien Testament (39 livres)
  { id: 'genese', code: 'GEN', name: 'Genèse', abbr: 'Gn', testament: 'AT', chaptersCount: 50 },
  { id: 'exode', code: 'EXO', name: 'Exode', abbr: 'Ex', testament: 'AT', chaptersCount: 40 },
  { id: 'levitique', code: 'LEV', name: 'Lévitique', abbr: 'Lv', testament: 'AT', chaptersCount: 27 },
  { id: 'nombres', code: 'NUM', name: 'Nombres', abbr: 'Nb', testament: 'AT', chaptersCount: 36 },
  { id: 'deuteronome', code: 'DEU', name: 'Deutéronome', abbr: 'Dt', testament: 'AT', chaptersCount: 34 },
  { id: 'josue', code: 'JOS', name: 'Josué', abbr: 'Jos', testament: 'AT', chaptersCount: 24 },
  { id: 'juges', code: 'JDG', name: 'Juges', abbr: 'Jg', testament: 'AT', chaptersCount: 21 },
  { id: 'ruth', code: 'RUT', name: 'Ruth', abbr: 'Rt', testament: 'AT', chaptersCount: 4 },
  { id: '1samuel', code: '1SA', name: '1 Samuel', abbr: '1S', testament: 'AT', chaptersCount: 31 },
  { id: '2samuel', code: '2SA', name: '2 Samuel', abbr: '2S', testament: 'AT', chaptersCount: 24 },
  { id: '1rois', code: '1KI', name: '1 Rois', abbr: '1R', testament: 'AT', chaptersCount: 22 },
  { id: '2rois', code: '2KI', name: '2 Rois', abbr: '2R', testament: 'AT', chaptersCount: 25 },
  { id: '1chroniques', code: '1CH', name: '1 Chroniques', abbr: '1Ch', testament: 'AT', chaptersCount: 29 },
  { id: '2chroniques', code: '2CH', name: '2 Chroniques', abbr: '2Ch', testament: 'AT', chaptersCount: 36 },
  { id: 'esdras', code: 'EZR', name: 'Esdras', abbr: 'Esd', testament: 'AT', chaptersCount: 10 },
  { id: 'nehemie', code: 'NEH', name: 'Néhémie', abbr: 'Né', testament: 'AT', chaptersCount: 13 },
  { id: 'esther', code: 'EST', name: 'Esther', abbr: 'Est', testament: 'AT', chaptersCount: 10 },
  { id: 'job', code: 'JOB', name: 'Job', abbr: 'Jb', testament: 'AT', chaptersCount: 42 },
  { id: 'psaumes', code: 'PSA', name: 'Psaumes', abbr: 'Ps', testament: 'AT', chaptersCount: 150 },
  { id: 'proverbes', code: 'PRO', name: 'Proverbes', abbr: 'Pr', testament: 'AT', chaptersCount: 31 },
  { id: 'ecclesiaste', code: 'ECC', name: 'Ecclésiaste', abbr: 'Ec', testament: 'AT', chaptersCount: 12 },
  { id: 'cantique', code: 'SNG', name: 'Cantique des Cantiques', abbr: 'Ct', testament: 'AT', chaptersCount: 8 },
  { id: 'esaie', code: 'ISA', name: 'Ésaïe', abbr: 'És', testament: 'AT', chaptersCount: 66 },
  { id: 'jeremie', code: 'JER', name: 'Jérémie', abbr: 'Jér', testament: 'AT', chaptersCount: 52 },
  { id: 'lamentations', code: 'LAM', name: 'Lamentations', abbr: 'Lm', testament: 'AT', chaptersCount: 5 },
  { id: 'ezechiel', code: 'EZK', name: 'Ézéchiel', abbr: 'Éz', testament: 'AT', chaptersCount: 48 },
  { id: 'daniel', code: 'DAN', name: 'Daniel', abbr: 'Da', testament: 'AT', chaptersCount: 12 },
  { id: 'osee', code: 'HOS', name: 'Osée', abbr: 'Os', testament: 'AT', chaptersCount: 14 },
  { id: 'joel', code: 'JOL', name: 'Joël', abbr: 'Jl', testament: 'AT', chaptersCount: 3 },
  { id: 'amos', code: 'AMO', name: 'Amos', abbr: 'Am', testament: 'AT', chaptersCount: 9 },
  { id: 'abdias', code: 'OBA', name: 'Abdias', abbr: 'Ab', testament: 'AT', chaptersCount: 1 },
  { id: 'jonas', code: 'JON', name: 'Jonas', abbr: 'Jon', testament: 'AT', chaptersCount: 4 },
  { id: 'michee', code: 'MIC', name: 'Michée', abbr: 'Mi', testament: 'AT', chaptersCount: 7 },
  { id: 'nahum', code: 'NAM', name: 'Nahum', abbr: 'Na', testament: 'AT', chaptersCount: 3 },
  { id: 'habacuc', code: 'HAB', name: 'Habacuc', abbr: 'Ha', testament: 'AT', chaptersCount: 3 },
  { id: 'sophonie', code: 'ZEP', name: 'Sophonie', abbr: 'So', testament: 'AT', chaptersCount: 3 },
  { id: 'aggee', code: 'HAG', name: 'Aggée', abbr: 'Ag', testament: 'AT', chaptersCount: 2 },
  { id: 'zacharie', code: 'ZEC', name: 'Zacharie', abbr: 'Za', testament: 'AT', chaptersCount: 14 },
  { id: 'malachie', code: 'MAL', name: 'Malachie', abbr: 'Ml', testament: 'AT', chaptersCount: 4 },

  // Nouveau Testament (27 livres)
  { id: 'matthieu', code: 'MAT', name: 'Matthieu', abbr: 'Mt', testament: 'NT', chaptersCount: 28 },
  { id: 'marc', code: 'MRK', name: 'Marc', abbr: 'Mc', testament: 'NT', chaptersCount: 16 },
  { id: 'luc', code: 'LUK', name: 'Luc', abbr: 'Lc', testament: 'NT', chaptersCount: 24 },
  { id: 'jean', code: 'JHN', name: 'Jean', abbr: 'Jn', testament: 'NT', chaptersCount: 21 },
  { id: 'actes', code: 'ACT', name: 'Actes des Apôtres', abbr: 'Ac', testament: 'NT', chaptersCount: 28 },
  { id: 'romains', code: 'ROM', name: 'Romains', abbr: 'Rm', testament: 'NT', chaptersCount: 16 },
  { id: '1corinthiens', code: '1CO', name: '1 Corinthiens', abbr: '1Co', testament: 'NT', chaptersCount: 16 },
  { id: '2corinthiens', code: '2CO', name: '2 Corinthiens', abbr: '2Co', testament: 'NT', chaptersCount: 13 },
  { id: 'galates', code: 'GAL', name: 'Galates', abbr: 'Ga', testament: 'NT', chaptersCount: 6 },
  { id: 'ephesiens', code: 'EPH', name: 'Éphésiens', abbr: 'Ép', testament: 'NT', chaptersCount: 6 },
  { id: 'philippiens', code: 'PHP', name: 'Philippiens', abbr: 'Ph', testament: 'NT', chaptersCount: 4 },
  { id: 'colossiens', code: 'COL', name: 'Colossiens', abbr: 'Col', testament: 'NT', chaptersCount: 4 },
  { id: '1thessaloniciens', code: '1TH', name: '1 Thessaloniciens', abbr: '1Th', testament: 'NT', chaptersCount: 5 },
  { id: '2thessaloniciens', code: '2TH', name: '2 Thessaloniciens', abbr: '2Th', testament: 'NT', chaptersCount: 3 },
  { id: '1timothee', code: '1TI', name: '1 Timothée', abbr: '1Tm', testament: 'NT', chaptersCount: 6 },
  { id: '2timothee', code: '2TI', name: '2 Timothée', abbr: '2Tm', testament: 'NT', chaptersCount: 4 },
  { id: 'tite', code: 'TIT', name: 'Tite', abbr: 'Tt', testament: 'NT', chaptersCount: 3 },
  { id: 'philemon', code: 'PHM', name: 'Philémon', abbr: 'Phm', testament: 'NT', chaptersCount: 1 },
  { id: 'hebreux', code: 'HEB', name: 'Hébreux', abbr: 'Hé', testament: 'NT', chaptersCount: 13 },
  { id: 'jacques', code: 'JAS', name: 'Jacques', abbr: 'Jc', testament: 'NT', chaptersCount: 5 },
  { id: '1pierre', code: '1PE', name: '1 Pierre', abbr: '1P', testament: 'NT', chaptersCount: 5 },
  { id: '2pierre', code: '2PE', name: '2 Pierre', abbr: '2P', testament: 'NT', chaptersCount: 3 },
  { id: '1jean', code: '1JN', name: '1 Jean', abbr: '1Jn', testament: 'NT', chaptersCount: 5 },
  { id: '2jean', code: '2JN', name: '2 Jean', abbr: '2Jn', testament: 'NT', chaptersCount: 1 },
  { id: '3jean', code: '3JN', name: '3 Jean', abbr: '3Jn', testament: 'NT', chaptersCount: 1 },
  { id: 'jude', code: 'JUD', name: 'Jude', abbr: 'Jude', testament: 'NT', chaptersCount: 1 },
  { id: 'apocalypse', code: 'REV', name: 'Apocalypse', abbr: 'Ap', testament: 'NT', chaptersCount: 22 },
];

export function normalizeBibleText(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/œ/g, 'oe');
}

export function getBibleBook(id: string) {
  return BIBLE_BOOKS.find(book => book.id === id);
}

export function adjacentChapter(passage: BiblePassage, direction: -1 | 1): BiblePassage | undefined {
  const index = BIBLE_BOOKS.findIndex(book => book.id === passage.bookId);
  if (index === -1) return;
  const book = BIBLE_BOOKS[index];
  const chapter = passage.chapter + direction;
  if (chapter >= 1 && chapter <= book.chaptersCount) return { bookId: book.id, chapter };
  const adjacentBook = BIBLE_BOOKS[index + direction];
  if (adjacentBook) {
    return { bookId: adjacentBook.id, chapter: direction === 1 ? 1 : adjacentBook.chaptersCount };
  }
}

export function parseBibleReference(input: string): BiblePassage | undefined {
  const match = /^(.+?\p{L}|\p{L})\.?\s*(\d{1,3})(?:\s*[:.,]\s*(\d{1,3}))?$/u.exec(input.trim());
  if (!match) return;
  const bookName = normalizeBibleText(match[1]).replace(/\s+/g, '');
  const book = BIBLE_BOOKS.find(entry => [entry.id, entry.code, entry.name, entry.abbr]
    .some(name => normalizeBibleText(name).replace(/\s+/g, '') === bookName));
  if (!book) return;

  const chapter = Number(match[2]);
  const verse = match[3] === undefined ? undefined : Number(match[3]);
  if (book.chaptersCount === 1 && chapter > 1 && verse === undefined) {
    return { bookId: book.id, chapter: 1, verse: chapter };
  }
  if (chapter >= 1 && chapter <= book.chaptersCount && verse !== 0) {
    return { bookId: book.id, chapter, verse };
  }
}

export function formatBibleReference(book: BibleBook, chapter: number, numbers: readonly number[]) {
  const spans: { start: number; end: number }[] = [];
  for (const number of numbers) {
    const last = spans.at(-1);
    if (last && last.end + 1 === number) last.end = number;
    else spans.push({ start: number, end: number });
  }
  const verses = spans.map(({ start, end }) => start === end ? `${start}` : `${start}–${end}`).join(', ');
  return `${book.name} ${chapter}${verses ? `:${verses}` : ''}`;
}

export { getChapterVerses, searchOfflineBible, type OfflineSearchHit } from './bible-corpus';
