const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');

// Hook TypeScript compilation for CommonJS tests
require.extensions['.ts'] = (loadedModule, file) => {
  loadedModule._compile(
    ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText,
    file
  );
};

const {
  getOfflineDailyVerse,
  formatShareDailyVerse,
  fetchDailyVerse,
  CURATED_OFFLINE_PASSAGES,
  hashDateString,
  getTodayDateString,
} = require('../lib/daily-verse.ts');
const { getChapterVerses } = require('../data/bible-corpus.ts');
const { getBibleBook } = require('../data/bible.ts');

test('all curated offline passages exist in the Bible corpus and have valid text', () => {
  assert.ok(CURATED_OFFLINE_PASSAGES.length >= 30, 'Should have at least 30 curated passages');

  for (const item of CURATED_OFFLINE_PASSAGES) {
    const book = getBibleBook(item.bookId);
    assert.ok(book, `Book ${item.bookId} must exist`);
    assert.ok(item.chapter >= 1 && item.chapter <= book.chaptersCount, `Chapter ${item.chapter} out of range for ${book.name}`);

    const verses = getChapterVerses(item.bookId, item.chapter);
    assert.ok(verses.length > 0, `Chapter ${book.name} ${item.chapter} must have verses`);

    const verse = verses.find(v => v.number === item.verse);
    assert.ok(verse, `Verse ${item.bookId} ${item.chapter}:${item.verse} must exist in corpus`);
    assert.ok(typeof verse.text === 'string' && verse.text.length > 0, `Verse text must not be empty`);
  }
});

test('getOfflineDailyVerse generates deterministic verse for a given date', () => {
  const v1 = getOfflineDailyVerse('2026-11-21');
  const v2 = getOfflineDailyVerse('2026-11-21');

  assert.equal(v1.date, '2026-11-21');
  assert.equal(v1.bookId, v2.bookId);
  assert.equal(v1.chapter, v2.chapter);
  assert.equal(v1.number, v2.number);
  assert.equal(v1.text, v2.text);
  assert.equal(v1.bookName, v2.bookName);
  assert.ok(v1.text.length > 10, 'Verse text should be meaningful');
});

test('different dates cycle through different passages', () => {
  const dates = [
    '2026-01-01',
    '2026-02-14',
    '2026-03-20',
    '2026-04-12',
    '2026-05-01',
    '2026-06-21',
    '2026-07-14',
    '2026-08-15',
  ];

  const uniquePassages = new Set(
    dates.map(d => {
      const v = getOfflineDailyVerse(d);
      return `${v.bookId}_${v.chapter}_${v.number}`;
    })
  );

  // We should have multiple distinct verses across dates
  assert.ok(uniquePassages.size > 1, 'Different dates must produce distinct verses');
});

test('formatShareDailyVerse produces clean message with citation and branding', () => {
  const verse = {
    date: '2026-11-21',
    bookId: 'jean',
    chapter: 15,
    number: 4,
    text: 'Demeurez en moi, et je demeurerai en vous.',
    bookName: 'Jean',
    bookAbbr: 'Jn',
    testament: 'NT',
  };

  const formatted = formatShareDailyVerse(verse);
  assert.ok(formatted.includes('« Demeurez en moi, et je demeurerai en vous. »'));
  assert.ok(formatted.includes('Jean 15.4 (Louis Segond 1910)'));
  assert.ok(formatted.includes('Koinonia · Verset du jour'));
});

test('fetchDailyVerse returns valid verse even offline or without network', async () => {
  const verse = await fetchDailyVerse('2026-11-21');
  assert.ok(verse);
  assert.equal(verse.date, '2026-11-21');
  assert.ok(verse.text);
  assert.ok(verse.bookName);
  assert.ok(verse.chapter > 0);
  assert.ok(verse.number > 0);
});
