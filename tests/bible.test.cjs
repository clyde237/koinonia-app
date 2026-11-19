const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');

require.extensions['.ts'] = (loadedModule, file) => {
  loadedModule._compile(
    ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText,
    file
  );
};

const bible = require('../data/bible.ts');
const { getChapterVerses, searchOfflineBible } = require('../data/bible-corpus.ts');
const library = require('../lib/bible-library.ts');

test('all 66 books and 1189 chapters are completely present with 31170 verses', () => {
  assert.equal(bible.BIBLE_BOOKS.length, 66);

  let chaptersCount = 0;
  let versesCount = 0;

  for (const book of bible.BIBLE_BOOKS) {
    for (let c = 1; c <= book.chaptersCount; c++) {
      const verses = getChapterVerses(book.id, c);
      assert.ok(verses.length > 0, `Missing verses for ${book.name} ${c}`);
      assert.equal(verses[0].number, 1);
      assert.equal(verses.at(-1).number, verses.length);
      chaptersCount++;
      versesCount += verses.length;
    }
  }

  assert.equal(chaptersCount, 1189);
  assert.equal(versesCount, 31170);

  // Check landmark passages
  const gen1 = getChapterVerses('genese', 1);
  assert.equal(gen1[0].text, 'Au commencement, Dieu créa les cieux et la terre.');

  const jean15 = getChapterVerses('jean', 15);
  assert.equal(jean15.length, 27);
  assert.match(jean15[4].text, /Je suis le cep, vous êtes les sarments/);

  const ps119 = getChapterVerses('psaumes', 119);
  assert.equal(ps119.length, 176);

  const apoc22 = getChapterVerses('apocalypse', 22);
  assert.equal(apoc22.length, 21);
  assert.equal(apoc22.at(-1).text, 'Que la grâce du Seigneur Jésus soit avec tous!');
});

test('references and navigation respect canonical book boundaries', () => {
  assert.deepEqual(bible.parseBibleReference('Ésaïe 40:31'), { bookId: 'esaie', chapter: 40, verse: 31 });
  assert.deepEqual(bible.parseBibleReference('1 Co 13.4'), { bookId: '1corinthiens', chapter: 13, verse: 4 });
  assert.deepEqual(bible.parseBibleReference('Jn.3:16'), { bookId: 'jean', chapter: 3, verse: 16 });
  assert.deepEqual(bible.parseBibleReference('Jude 3'), { bookId: 'jude', chapter: 1, verse: 3 });
  assert.equal(bible.parseBibleReference('Jean 22:1'), undefined);
  assert.equal(bible.parseBibleReference('Jean 3:0'), undefined);

  assert.equal(bible.adjacentChapter({ bookId: 'genese', chapter: 1 }, -1), undefined);
  assert.equal(bible.adjacentChapter({ bookId: 'apocalypse', chapter: 22 }, 1), undefined);
  assert.deepEqual(bible.adjacentChapter({ bookId: 'genese', chapter: 50 }, 1), { bookId: 'exode', chapter: 1 });
  assert.deepEqual(bible.adjacentChapter({ bookId: 'exode', chapter: 1 }, -1), { bookId: 'genese', chapter: 50 });

  assert.equal(bible.formatBibleReference(bible.getBibleBook('jean'), 15, [2, 3, 5, 7, 8]), 'Jean 15:2–3, 5, 7–8');
});

test('offline search finds key scripture without errors', () => {
  const hits = searchOfflineBible('cep sarments');
  assert.ok(hits.length > 0);
  const foundJn15 = hits.some(h => h.bookId === 'jean' && h.chapter === 15 && h.number === 5);
  assert.ok(foundJn15, 'Should find Jean 15:5');

  const empty = searchOfflineBible('unmotinexistantxyz987');
  assert.equal(empty.length, 0);
});

test('reading position, highlights and font size can be saved and reloaded', async () => {
  await library.saveBiblePosition('reader-test', { bookId: 'romains', chapter: 8 });
  const pos = await library.loadBiblePosition('reader-test');
  assert.deepEqual(pos, { bookId: 'romains', chapter: 8 });

  await library.saveBibleFontSize('reader-test', 'large');
  const size = await library.loadBibleFontSize('reader-test');
  assert.equal(size, 'large');

  await library.saveBibleHighlights('reader-test', 'romains', 8, new Set([28, 31]));
  const highlights = await library.loadBibleHighlights('reader-test', 'romains', 8);
  assert.deepEqual([...highlights], [28, 31]);

  await library.saveBibleHighlights('reader-test', 'romains', 8, new Set());
  const cleared = await library.loadBibleHighlights('reader-test', 'romains', 8);
  assert.equal(cleared.size, 0);
});
