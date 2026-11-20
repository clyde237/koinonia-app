/** @jsxImportSource react */
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import {
  BIBLE_BOOKS,
  formatBibleReference,
  getBibleBook,
  getChapterVerses,
  normalizeBibleText,
  parseBibleReference,
  searchOfflineBible,
  type BibleBook,
  type BiblePassage,
  type BibleVerse,
} from '../data/bible';
import { controls, fonts, type ThemeColors } from '../lib/theme';
import { useTheme } from '../lib/ThemeContext';
import { SearchBar } from './SearchBar';

type Props = {
  database?: unknown;
  book: BibleBook;
  chapter: number;
  verses: BibleVerse[];
  inset: number;
  onOpen: (passage: BiblePassage) => void;
};

type Result = { passage: BiblePassage; verse?: BibleVerse };
type SearchPage = { items: Result[]; next: number | null; error?: string };

function referenceFor({ bookId, chapter, verse }: BiblePassage) {
  return formatBibleReference(getBibleBook(bookId)!, chapter, verse ? [verse] : []);
}

export function BibleSearch({ book, chapter, verses, inset, onOpen }: Props) {
  const { isDark, colors: c } = useTheme();
  const s = useMemo(() => createBibleSearchStyles(c, isDark), [c, isDark]);
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<'bible' | 'chapter'>('bible');
  const [page, setPage] = useState<SearchPage>();
  const [pageError, setPageError] = useState(false);
  const request = useRef(0);
  const input = query.trim();

  function loadGlobalPage(text: string): SearchPage {
    const hits = searchOfflineBible(text, { limit: 50 });
    const items = hits.map(hit => ({
      passage: { bookId: hit.bookId, chapter: hit.chapter, verse: hit.number },
      verse: { number: hit.number, text: hit.text },
    }));
    return { items, next: null };
  }

  useEffect(() => {
    const id = ++request.current;
    setPage(undefined);
    setPageError(false);
    if (!input) return;

    function runSearch(): SearchPage {
      if (scope === 'chapter') {
        const text = normalizeBibleText(input);
        const matches = /^\d+$/.test(text)
          ? verses.filter(verse => verse.number === Number(text))
          : verses.filter(verse => normalizeBibleText(verse.text).includes(text));
        return { items: matches.map(verse => ({ passage: { bookId: book.id, chapter, verse: verse.number }, verse })), next: null };
      }

      const passage = parseBibleReference(input);
      if (!passage) return loadGlobalPage(input);
      if (!passage.verse) return { items: [{ passage }], next: null };
      const passageVerses = getChapterVerses(passage.bookId, passage.chapter);
      const verse = passageVerses.find(entry => entry.number === passage.verse);
      return { items: verse ? [{ passage, verse }] : [{ passage }], next: null };
    }

    const delay = setTimeout(() => {
      try {
        const result = runSearch();
        if (request.current === id) setPage(result);
      } catch {
        if (request.current === id) setPage({ items: [], next: null, error: 'La recherche est momentanément indisponible.' });
      }
    }, scope === 'chapter' ? 0 : 150);

    return () => {
      clearTimeout(delay);
      request.current++;
    };
  }, [input, scope, book, chapter, verses]);

  const emptyText = !input
    ? scope === 'bible' ? 'Saisissez un mot ou une référence, par exemple Jean 3:16.' : 'Saisissez un mot ou un numéro de verset.'
    : page?.error ?? 'Aucun passage trouvé.';

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.controls}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={scope === 'bible' ? 'Un mot ou une référence (ex: Jean 3:16)' : `Dans ${book.name} ${chapter}`}
          autoFocus
        />
        <View style={s.scopes} accessibilityRole="tablist">
          {(['bible', 'chapter'] as const).map(option => (
            <Pressable
              key={option}
              accessibilityRole="tab"
              accessibilityState={{ selected: scope === option }}
              onPress={() => setScope(option)}
              style={({ pressed }) => [s.scope, scope === option && s.selected, pressed && s.pressed]}
            >
              <Text style={[s.scopeText, scope === option && s.accent]}>{option === 'bible' ? 'Toute la Bible' : 'Ce chapitre'}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={page?.items}
        keyExtractor={(item, index) => `${item.passage.bookId}:${item.passage.chapter}:${item.passage.verse ?? 0}:${index}`}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[s.list, { paddingBottom: inset + 24 }]}
        ListEmptyComponent={<Text style={s.empty}>{emptyText}</Text>}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              Keyboard.dismiss();
              onOpen(item.passage);
            }}
            style={({ pressed }) => [s.row, pressed && s.pressed]}
          >
            <View style={s.rowBody}>
              <Text style={s.reference}>{referenceFor(item.passage)}</Text>
              {item.verse && <Text numberOfLines={2} style={s.snippet}>{item.verse.text}</Text>}
            </View>
            <ChevronRight size={18} color={c.muted} />
          </Pressable>
        )}
      />
    </KeyboardAvoidingView>
  );
}

function createBibleSearchStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
  root: { flex: 1, backgroundColor: c.surface },
  controls: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: isDark ? c.moonlightBorder : c.divider },
  scopes: { flexDirection: 'row', gap: 8, marginTop: 10 },
  scope: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: isDark ? c.surfaceRaised : c.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 38,
  },
  selected: { backgroundColor: c.mint },
  pressed: { opacity: 0.75 },
  scopeText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: c.muted,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  accent: { color: c.action, fontFamily: fonts.bold },
  list: { paddingHorizontal: 16, paddingTop: 8 },
  empty: { textAlign: 'center', fontFamily: fonts.body, color: c.muted, marginTop: 40, paddingHorizontal: 24, fontSize: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: isDark ? c.moonlightBorder : c.divider,
    minHeight: controls.touchSize,
  },
  rowBody: { flex: 1, marginRight: 12 },
  reference: { fontFamily: fonts.bold, fontSize: 15, color: c.text, marginBottom: 2 },
  snippet: { fontFamily: fonts.body, fontSize: 13, color: c.muted, lineHeight: 18 },
  });
}
