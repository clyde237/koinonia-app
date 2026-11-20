/** @jsxImportSource react */
import React, { useState, useMemo, useRef, useEffect, type ComponentRef } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Alert,
  BackHandler,
  Clipboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Highlighter,
  Music,
  Search,
  Share2,
  Sparkles,
  X,
} from 'lucide-react-native';
import {
  BIBLE_BOOKS,
  DAILY_BIBLE_PASSAGE,
  adjacentChapter,
  formatBibleReference,
  getBibleBook,
  getChapterVerses,
  normalizeBibleText,
  type BibleBook,
  type BiblePassage,
  type BibleVerse,
  type Testament,
} from '../data/bible';
import { loadBibleHighlights, loadBiblePosition, saveBibleHighlights, saveBiblePosition } from '../lib/bible-library';
import { controls, fonts, homeTheme as c } from '../lib/theme';
import { BibleSearch } from './BibleSearch';
import { FiligraneWatermark } from './FiligraneWatermark';

export type FontSizeMode = 'small' | 'medium' | 'large' | 'xlarge';

export const BIBLE_FONT_SIZES: Record<FontSizeMode, { text: number; line: number; label: string }> = {
  small: { text: 15, line: 24, label: '15px' },
  medium: { text: 17, line: 27, label: '17px' },
  large: { text: 19, line: 30, label: '19px' },
  xlarge: { text: 22, line: 34, label: '22px' },
};

type Props = {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onOpenNotifications?: () => void;
  readerId?: string;
  initialPassage?: BiblePassage;
  navHeight?: number;
  fontSizeMode?: FontSizeMode;
  onDetailOpenChange?: (open: boolean) => void;
};

const DEFAULT_PASSAGE = { bookId: DAILY_BIBLE_PASSAGE.bookId, chapter: DAILY_BIBLE_PASSAGE.chapter };

type LoadedChapter = {
  key: string;
  verses: BibleVerse[];
};

export function BibleScreen({
  onBack,
  onOpenProfile,
  onOpenNotifications,
  readerId = 'default_reader',
  initialPassage,
  navHeight = 80,
  fontSizeMode = 'medium',
  onDetailOpenChange,
}: Props) {
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const compact = width < 370;
  const gutter = compact ? 16 : 20;

  const [activeTab, setActiveTab] = useState<'bible' | 'cantiques'>('bible');
  const [passage, setPassage] = useState<BiblePassage | undefined>(initialPassage);
  const [loadedChapter, setLoadedChapter] = useState<LoadedChapter>();
  const [failedChapter, setFailedChapter] = useState<string>();
  const [retry, setRetry] = useState(0);

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTestament, setPickerTestament] = useState<Testament>('NT');
  const [pickerSearch, setPickerSearch] = useState('');
  const [stepInPicker, setStepInPicker] = useState<'book' | 'chapter'>('book');
  const [tempBookForChapter, setTempBookForChapter] = useState<BibleBook>();
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [highlights, setHighlights] = useState<ReadonlySet<number>>(new Set());
  const [savingHighlights, setSavingHighlights] = useState(false);
  const [notice, setNotice] = useState<string>();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const targetVerseRef = useRef<ComponentRef<typeof View>>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mounted = useRef(true);
  const savingRef = useRef(false);
  const scrollTarget = useRef<number | undefined>(initialPassage?.verse);

  const currentBook = getBibleBook(passage?.bookId ?? DEFAULT_PASSAGE.bookId)!;
  const selectedBookId = currentBook.id;
  const selectedChapter = passage?.chapter ?? DEFAULT_PASSAGE.chapter;
  const chapterKey = `${selectedBookId}:${selectedChapter}`;
  const activeChapter = loadedChapter?.key === chapterKey ? loadedChapter : undefined;
  const previousPassage = passage && adjacentChapter(passage, -1);
  const nextPassage = passage && adjacentChapter(passage, 1);
  const currentChapterRef = useRef(chapterKey);
  currentChapterRef.current = chapterKey;

  useEffect(() => {
    if (initialPassage) return;
    let active = true;
    loadBiblePosition(readerId).catch(() => undefined).then(saved => {
      if (active) setPassage(saved ?? DEFAULT_PASSAGE);
    });
    return () => { active = false; };
  }, [readerId, initialPassage]);

  const hasPassage = Boolean(passage);
  useEffect(() => {
    if (!hasPassage) return;
    let active = true;
    setFailedChapter(undefined);

    try {
      const verses = getChapterVerses(selectedBookId, selectedChapter);
      if (!verses || !verses.length) {
        if (active) setFailedChapter(chapterKey);
        return;
      }
      if (active) {
        setLoadedChapter({ key: chapterKey, verses });
      }

      loadBibleHighlights(readerId, selectedBookId, selectedChapter)
        .catch(() => new Set<number>())
        .then(savedHighlights => {
          if (!active) return;
          setHighlights(savedHighlights);
        });

      saveBiblePosition(readerId, { bookId: selectedBookId, chapter: selectedChapter }).catch(() => {});
    } catch {
      if (active) setFailedChapter(chapterKey);
    }

    return () => { active = false; };
  }, [chapterKey, currentBook, hasPassage, readerId, retry, selectedBookId, selectedChapter]);

  const detailOpen = isPickerOpen || isSearchVisible || selectedVerses.length > 0 || activeTab === 'cantiques';
  useEffect(() => {
    onDetailOpenChange?.(detailOpen);
    return () => onDetailOpenChange?.(false);
  }, [detailOpen, onDetailOpenChange]);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; clearTimeout(noticeTimer.current); };
  }, []);

  const goBack = () => {
    if (isSearchVisible) setIsSearchVisible(false);
    else if (selectedVerses.length) setSelectedVerses([]);
    else if (activeTab === 'cantiques') setActiveTab('bible');
    else if (onBack) onBack();
    else return false;
    return true;
  };

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', goBack);
    return () => handler.remove();
  }, [isSearchVisible, selectedVerses.length, activeTab, onBack]);

  const openPassage = (target: BiblePassage) => {
    scrollTarget.current = target.verse;
    clearTimeout(noticeTimer.current);
    if (!target.verse) scrollRef.current?.scrollTo({ y: 0, animated: false });
    setPassage(target);
    setActiveTab('bible');
    setSelectedVerses([]);
    setNotice(undefined);
    setIsSearchVisible(false);
    setIsPickerOpen(false);
  };

  const scrollToTargetVerse = () => {
    const content = scrollRef.current?.getInnerViewRef();
    const verse = scrollTarget.current;
    if (!content || verse === undefined) return;
    targetVerseRef.current?.measureLayout(content, (_x, y) => {
      if (scrollTarget.current !== verse) return;
      scrollTarget.current = undefined;
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: false });
    }, () => {});
  };

  const openPicker = () => {
    setPickerTestament(currentBook.testament);
    setPickerSearch('');
    setStepInPicker('book');
    setTempBookForChapter(currentBook);
    setIsPickerOpen(true);
  };

  const toggleVerseSelection = (number: number) => {
    if (savingRef.current) return;
    setSelectedVerses(previous => previous.includes(number)
      ? previous.filter(verse => verse !== number)
      : [...previous, number]);
  };

  const getSelectedVersesText = () => {
    const verses = activeChapter?.verses.filter(verse => selectedVerses.includes(verse.number));
    if (!verses?.length) return '';
    const text = verses.map(verse => `${verse.number}. ${verse.text}`).join('\n');
    const reference = formatBibleReference(currentBook, selectedChapter, verses.map(verse => verse.number));
    return `« ${text} »\n${reference} (Louis Segond 1910)\nKoinonia`;
  };

  const showNotice = (text: string) => {
    clearTimeout(noticeTimer.current);
    setNotice(text);
    AccessibilityInfo.announceForAccessibility(text);
    noticeTimer.current = setTimeout(() => setNotice(undefined), 2500);
  };

  const handleShareSelected = async () => {
    const text = getSelectedVersesText();
    if (!text) return;
    try {
      await Share.share({ message: text });
    } catch {
      Alert.alert('Partage indisponible', 'Veuillez réessayer.');
    }
  };

  const handleCopySelected = () => {
    const text = getSelectedVersesText();
    if (!text) return;
    try {
      Clipboard.setString(text);
      showNotice('Passage copié.');
    } catch {
      Alert.alert('Copie indisponible', 'Veuillez réessayer.');
    }
  };

  const allHighlighted = selectedVerses.every(verse => highlights.has(verse));

  const handleHighlightSelected = async () => {
    if (!selectedVerses.length || savingRef.current) return;
    savingRef.current = true;
    setSavingHighlights(true);
    const next = new Set(highlights);
    for (const verse of selectedVerses) {
      if (allHighlighted) next.delete(verse);
      else next.add(verse);
    }

    try {
      await saveBibleHighlights(readerId, selectedBookId, selectedChapter, next);
      if (mounted.current && currentChapterRef.current === chapterKey) {
        setHighlights(next);
        setSelectedVerses([]);
        showNotice(allHighlighted ? 'Surlignage retiré.' : 'Passage surligné.');
      }
    } catch {
      if (mounted.current) Alert.alert('Surlignage indisponible', 'Veuillez réessayer.');
    } finally {
      savingRef.current = false;
      if (mounted.current) setSavingHighlights(false);
    }
  };

  const booksInPicker = useMemo(() => {
    const search = normalizeBibleText(pickerSearch).replace(/\s+/g, '');
    return BIBLE_BOOKS.filter(book => search
      ? [book.name, book.abbr, book.code].some(label => normalizeBibleText(label).replace(/\s+/g, '').includes(search))
      : book.testament === pickerTestament);
  }, [pickerTestament, pickerSearch]);

  const activeFont = BIBLE_FONT_SIZES[fontSizeMode];

  return (
    <View style={s.root}>
      <FiligraneWatermark opacity={0.15} />
      {/* Top Header */}
      <View style={[s.header, fontScale > 1.3 && s.headerWrapped, { paddingHorizontal: gutter }]}>
        <View style={s.headerLeft}>
          {onBack && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isSearchVisible ? 'Retour à la lecture' : 'Retour'}
              onPress={goBack}
              style={({ pressed }) => [s.iconBtn, pressed && s.pressed]}
            >
              <ArrowLeft size={22} color={c.text} strokeWidth={1.5} />
            </Pressable>
          )}
          <View style={s.headerTitleBlock}>
            <Text accessibilityRole="header" style={s.pageTitle}>La Bible</Text>
            <View style={s.versionTag}>
              <Text style={s.versionTagText}>Louis Segond 1910</Text>
            </View>
          </View>
        </View>

        <View style={s.headerRight}>
          {activeTab === 'bible' && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isSearchVisible ? 'Fermer la recherche de versets' : 'Rechercher un verset'}
              accessibilityState={{ expanded: isSearchVisible, disabled: !activeChapter }}
              disabled={!activeChapter}
              onPress={() => { setSelectedVerses([]); setIsSearchVisible(prev => !prev); }}
              style={({ pressed }) => [
                s.iconBtn,
                isSearchVisible && s.iconBtnActive,
                !activeChapter && s.disabled,
                pressed && s.pressed,
              ]}
            >
              <Search size={20} color={isSearchVisible ? c.action : c.text} strokeWidth={1.5} />
            </Pressable>
          )}

          {onOpenNotifications && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={onOpenNotifications}
              style={({ pressed }) => [s.iconBtn, pressed && s.pressed]}
            >
              <Bell size={20} color={c.text} strokeWidth={1.5} />
            </Pressable>
          )}

          {onOpenProfile && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mon profil"
              onPress={onOpenProfile}
              style={({ pressed }) => [s.avatarBtn, pressed && s.pressed]}
            >
              <Text style={s.avatarInitials}>K</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Main Tabs: « Bible » & « Cantiques » */}
      <View style={[s.tabBarContainer, { paddingHorizontal: gutter }]}>
        <View style={s.tabBar}>
          <Pressable
            accessibilityRole="tab"
            accessibilityLabel="Onglet Bible"
            accessibilityState={{ selected: activeTab === 'bible' }}
            onPress={() => setActiveTab('bible')}
            style={({ pressed }) => [
              s.tabButton,
              activeTab === 'bible' && s.tabButtonActive,
              pressed && s.pressed,
            ]}
          >
            <BookOpen size={17} color={activeTab === 'bible' ? c.action : c.muted} strokeWidth={1.5} />
            <Text style={[s.tabLabel, activeTab === 'bible' && s.tabLabelActive]}>
              Bible
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="tab"
            accessibilityLabel="Onglet Cantiques, bientôt disponible"
            accessibilityState={{ selected: activeTab === 'cantiques' }}
            onPress={() => { setActiveTab('cantiques'); setIsSearchVisible(false); setSelectedVerses([]); }}
            style={({ pressed }) => [
              s.tabButton,
              activeTab === 'cantiques' && s.tabButtonActive,
              pressed && s.pressed,
            ]}
          >
            <Music size={17} color={activeTab === 'cantiques' ? c.action : c.muted} strokeWidth={1.5} />
            <Text style={[s.tabLabel, activeTab === 'cantiques' && s.tabLabelActive]}>
              Cantiques
            </Text>
            <View style={s.upcomingBadge}>
              <Text style={s.upcomingBadgeText}>Bientôt</Text>
            </View>
          </Pressable>
        </View>
      </View>

      {activeTab === 'bible' && !isSearchVisible && (selectedVerses.length > 0 || notice) && (
        <View style={{ paddingHorizontal: gutter }}>
          {/* Verses Selection Bar (Contextual) */}
          {selectedVerses.length > 0 && (
            <View style={[s.selectionBar, s.cardShadow]}>
              <View style={s.selectionInfo}>
                <View style={s.selectionCountBadge}>
                  <Text style={s.selectionCountText}>{selectedVerses.length}</Text>
                </View>
                <Text style={s.selectionLabel}>
                  {selectedVerses.length === 1 ? 'Verset sélectionné' : 'Versets sélectionnés'}
                </Text>
              </View>

              <View style={s.selectionActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Copier les versets sélectionnés"
                  onPress={handleCopySelected}
                  style={({ pressed }) => [s.selectionActionBtn, pressed && s.pressed]}
                >
                  <Copy size={17} color={c.action} strokeWidth={1.5} />
                  <Text style={s.selectionActionBtnText}>Copier</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Partager les versets sélectionnés"
                  onPress={handleShareSelected}
                  style={({ pressed }) => [s.selectionActionBtn, pressed && s.pressed]}
                >
                  <Share2 size={17} color={c.action} strokeWidth={1.5} />
                  <Text style={s.selectionActionBtnText}>Partager</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={allHighlighted ? 'Retirer le surlignage' : 'Surligner les versets sélectionnés'}
                  accessibilityState={{ busy: savingHighlights, disabled: savingHighlights }}
                  disabled={savingHighlights}
                  onPress={handleHighlightSelected}
                  style={({ pressed }) => [s.selectionActionBtn, pressed && s.pressed]}
                >
                  <Highlighter size={17} color={c.action} strokeWidth={1.5} />
                  <Text style={s.selectionActionBtnText}>{allHighlighted ? 'Retirer' : 'Surligner'}</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Désélectionner tout"
                  onPress={() => setSelectedVerses([])}
                  style={({ pressed }) => [s.selectionCloseBtn, pressed && s.pressed]}
                >
                  <X size={18} color={c.muted} strokeWidth={1.5} />
                </Pressable>
              </View>
            </View>
          )}

          {/* Copy Toast Alert */}
          {notice && (
            <View style={s.toastAlert}>
              <Check size={16} color="white" strokeWidth={2} />
              <Text style={s.toastAlertText}>{notice}</Text>
            </View>
          )}

        </View>
      )}

      {activeTab === 'bible' && isSearchVisible && activeChapter ? (
        <BibleSearch
          book={currentBook}
          chapter={selectedChapter}
          verses={activeChapter.verses}
          inset={Math.max(insets.bottom, 16)}
          onOpen={openPassage}
        />
      ) : activeTab === 'bible' ? (
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            s.scrollContent,
            { paddingHorizontal: gutter, paddingBottom: navHeight + Math.max(insets.bottom, 16) + 72 },
          ]}
        >
          {/* Passage Selector Bar */}
          <View style={[s.selectorCard, s.cardShadow, fontScale > 1.4 && s.selectorCardStacked]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Sélectionner un livre et un chapitre. Actuellement : ${currentBook.name} chapitre ${selectedChapter}`}
              disabled={!passage}
              onPress={openPicker}
              style={({ pressed }) => [s.selectorTrigger, pressed && s.pressed]}
            >
              <View style={s.selectorInfo}>
                <View style={s.testamentBadge}>
                  <Text style={s.testamentBadgeText}>
                    {currentBook.testament === 'AT' ? 'Ancien Testament' : 'Nouveau Testament'}
                  </Text>
                </View>
                <View style={s.bookNameRow}>
                  <Text style={s.selectedBookTitle}>
                    {currentBook.name} <Text style={s.selectedChapterNumber}>{selectedChapter}</Text>
                  </Text>
                  <ChevronDown size={20} color={c.action} strokeWidth={1.5} style={s.dropdownIcon} />
                </View>
              </View>
            </Pressable>

            <View style={[s.quickNavControls, fontScale > 1.4 && s.quickNavControlsStacked]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Chapitre précédent"
                accessibilityState={{ disabled: !previousPassage }}
                disabled={!previousPassage}
                onPress={() => { if (previousPassage) openPassage(previousPassage); }}
                style={({ pressed }) => [s.navArrowBtn, !previousPassage && s.disabled, pressed && s.pressed]}
              >
                <ChevronLeft size={20} color={c.text} strokeWidth={controls.iconStroke} />
              </Pressable>
              <View style={s.navDivider} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Chapitre suivant"
                accessibilityState={{ disabled: !nextPassage }}
                disabled={!nextPassage}
                onPress={() => { if (nextPassage) openPassage(nextPassage); }}
                style={({ pressed }) => [s.navArrowBtn, !nextPassage && s.disabled, pressed && s.pressed]}
              >
                <ChevronRight size={20} color={c.text} strokeWidth={controls.iconStroke} />
              </Pressable>
            </View>
          </View>

          {/* Scripture Reading Paper Card */}
          <View style={[s.scriptureCard, s.cardShadow]}>
            {/* Chapter Header */}
            <View style={s.chapterHeadingBox}>
              <Text style={s.chapterSubheading}>
                {currentBook.testament === 'AT' ? 'ANCIEN TESTAMENT' : 'NOUVEAU TESTAMENT'}
              </Text>
              <Text accessibilityRole="header" textBreakStrategy="balanced" style={s.chapterTitle}>
                {currentBook.name} {selectedChapter}
              </Text>
            </View>

            {/* Verses Stream */}
            {failedChapter === chapterKey ? (
              <View style={s.emptySearchResult}>
                <Text accessibilityLiveRegion="polite" style={s.emptySearchText}>Ce chapitre est momentanément indisponible.</Text>
                <Pressable accessibilityRole="button" onPress={() => setRetry(value => value + 1)} style={s.resetSearchBtn}>
                  <Text style={s.resetSearchBtnText}>Réessayer</Text>
                </Pressable>
              </View>
            ) : !activeChapter ? (
              <ActivityIndicator color={c.action} accessibilityLabel="Chargement du chapitre" style={s.chapterLoading} />
            ) : (
              <View style={s.versesList}>
                {activeChapter.verses.map(verse => {
                  const isSelected = selectedVerses.includes(verse.number);
                  const isHighlighted = highlights.has(verse.number);
                  const isTarget = passage?.verse === verse.number;
                  return (
                    <Pressable
                      key={`${chapterKey}:${verse.number}`}
                      ref={isTarget ? targetVerseRef : undefined}
                      onLayout={isTarget ? scrollToTargetVerse : undefined}
                      collapsable={!isTarget}
                      accessibilityRole="button"
                      accessibilityLabel={`Verset ${verse.number}${isHighlighted ? ', surligné' : ''}. ${verse.text}`}
                      accessibilityHint={isSelected ? 'Désélectionne le verset' : 'Sélectionne le verset'}
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => toggleVerseSelection(verse.number)}
                      style={({ pressed }) => [
                        s.verseRow,
                        isHighlighted && s.verseRowHighlighted,
                        isTarget && s.verseRowTarget,
                        isSelected && s.verseRowSelected,
                        pressed && s.verseRowPressed,
                      ]}
                    >
                      <View style={[s.verseNumberPill, { width: 28 * fontScale }, isSelected && s.verseNumberPillSelected]}>
                        <Text style={[s.verseNumberText, isSelected && s.verseNumberTextSelected]}>
                          {verse.number}
                        </Text>
                      </View>
                      <Text
                        textBreakStrategy="highQuality"
                        lineBreakStrategyIOS="push-out"
                        style={[
                          s.verseText,
                          {
                            fontSize: activeFont.text,
                            lineHeight: activeFont.line,
                          },
                        ]}
                      >
                        {verse.text}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* Hint footer */}
            <View style={s.readingHintBox}>
              <Text style={s.readingHintText}>
                Touchez un verset pour le copier, le partager ou le surligner.
              </Text>
            </View>
          </View>

          {/* Next / Prev Chapter Navigation Buttons */}
          <View style={s.chapterNavFooter}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Chapitre précédent"
              accessibilityState={{ disabled: !previousPassage }}
              disabled={!previousPassage}
              onPress={() => { if (previousPassage) openPassage(previousPassage); }}
              style={({ pressed }) => [s.chapterNavFooterBtn, !previousPassage && s.disabled, pressed && s.pressed]}
            >
              <ChevronLeft size={18} color={c.action} strokeWidth={1.8} />
              <Text numberOfLines={1} style={s.chapterNavFooterBtnText}>Précédent</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Chapitre suivant"
              accessibilityState={{ disabled: !nextPassage }}
              disabled={!nextPassage}
              onPress={() => { if (nextPassage) openPassage(nextPassage); }}
              style={({ pressed }) => [
                s.chapterNavFooterBtn,
                s.chapterNavFooterBtnPrimary,
                !nextPassage && s.disabled,
                pressed && s.pressed,
              ]}
            >
              <Text numberOfLines={1} style={[s.chapterNavFooterBtnText, s.chapterNavFooterBtnTextPrimary]}>
                Suivant
              </Text>
              <ChevronRight size={18} color="white" strokeWidth={1.8} />
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        /* TAB 2: CANTIQUES (À VENIR) */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            s.scrollContent,
            { paddingHorizontal: gutter, paddingBottom: navHeight + Math.max(insets.bottom, 16) + 72 },
          ]}
        >
          {/* Hero Banner for Cantiques */}
          <View style={[s.cantiquesHero, s.cardShadow]}>
            <LinearGradient
              colors={['#0F3835', '#006B65']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.cantiquesHeroGradient}
            >
              <View style={s.cantiquesHeroHeader}>
                <View style={s.cantiquesIconBubble}>
                  <Music size={28} color="white" strokeWidth={1.5} />
                </View>
                <View style={s.cantiquesTag}>
                  <Sparkles size={13} color={c.amber} strokeWidth={1.5} />
                  <Text style={s.cantiquesTagText}>Prochainement</Text>
                </View>
              </View>

              <Text style={s.cantiquesHeroTitle}>Recueil de Cantiques</Text>
              <Text style={s.cantiquesHeroSubtitle}>
                Chants d’assemblée, louanges, hymnes spirituels et adorations pour nourrir votre intimité avec le Seigneur.
              </Text>
            </LinearGradient>
          </View>

          {/* Features Preview Card */}
          <View style={[s.cantiquesFeaturesCard, s.cardShadow]}>
            <Text style={s.cantiquesSectionTitle}>Ce qui arrive dans Koinonia :</Text>

            <View style={s.featureItem}>
              <View style={s.featureIconBox}>
                <Text style={s.featureItemBullet}>1</Text>
              </View>
              <View style={s.featureTextBox}>
                <Text style={s.featureTitle}>Paroles intégrales et numérotées</Text>
                <Text style={s.featureDesc}>
                  Accédez instantanément aux chants par leurs numéros traditionnels ou leurs titres (Sur les Ailes de la Foi, Chants de Victoire, etc.).
                </Text>
              </View>
            </View>

            <View style={s.featureItem}>
              <View style={s.featureIconBox}>
                <Text style={s.featureItemBullet}>2</Text>
              </View>
              <View style={s.featureTextBox}>
                <Text style={s.featureTitle}>Recherche instantanée et thématique</Text>
                <Text style={s.featureDesc}>
                  Trouvez des chants par thèmes : Adoration, Foi et confiance, Combat de la prière, Grâce et Sang de Jésus.
                </Text>
              </View>
            </View>

            <View style={s.featureItem}>
              <View style={s.featureIconBox}>
                <Text style={s.featureItemBullet}>3</Text>
              </View>
              <View style={s.featureTextBox}>
                <Text style={s.featureTitle}>Partage dans vos communautés</Text>
                <Text style={s.featureDesc}>
                  Partagez les paroles d’un cantique directement au sein de vos groupes de prière et d’intercession.
                </Text>
              </View>
            </View>
          </View>

          {/* Devotional Note */}
          <View style={s.devotionalQuoteBox}>
            <Text style={s.devotionalQuoteText}>
              « Entretenez-vous par des psaumes, par des hymnes, et par des cantiques spirituels, chantant et célébrant de tout votre cœur les louanges du Seigneur. »
            </Text>
            <Text style={s.devotionalQuoteRef}>Éphésiens 5.19</Text>
          </View>
        </ScrollView>
      )}

      {/* MODAL: BOOK & CHAPTER PICKER */}
      <Modal
        visible={isPickerOpen}
        animationType="slide"
        transparent
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => {
          if (stepInPicker === 'chapter') {
            setStepInPicker('book');
          } else {
            setIsPickerOpen(false);
          }
        }}
      >
        <KeyboardAvoidingView style={s.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer le sélecteur"
            onPress={() => setIsPickerOpen(false)}
            style={s.modalScrim}
          />

          <View
            accessibilityViewIsModal
            style={[
              s.modalSheet,
              { paddingBottom: Math.max(insets.bottom, 24), height: '85%' },
            ]}
          >
            {/* Sheet Handle */}
            <View style={s.sheetHandle} />

            {/* Modal Header */}
            <View style={s.modalHeader}>
              {stepInPicker === 'chapter' ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Retour au choix du livre"
                  onPress={() => setStepInPicker('book')}
                  style={({ pressed }) => [s.modalBackBtn, pressed && s.pressed]}
                >
                  <ArrowLeft size={20} color={c.text} strokeWidth={1.5} />
                  <Text style={s.modalBackBtnText}>Livres</Text>
                </Pressable>
              ) : (
                <View style={s.modalTitleBox}>
                  <Text style={s.modalTitle}>Choisir un livre</Text>
                  <Text style={s.modalSubtitle}>Louis Segond 1910</Text>
                </View>
              )}

              {stepInPicker === 'chapter' && tempBookForChapter && (
                <View style={s.modalTitleBox}>
                  <Text style={s.modalTitle}>{tempBookForChapter.name}</Text>
                  <Text style={s.modalSubtitle}>Sélectionnez un chapitre</Text>
                </View>
              )}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fermer"
                onPress={() => setIsPickerOpen(false)}
                style={({ pressed }) => [s.modalCloseBtn, pressed && s.pressed]}
              >
                <X size={20} color={c.text} strokeWidth={1.5} />
              </Pressable>
            </View>

            {/* STEP 1: CHOOSE BOOK */}
            {stepInPicker === 'book' ? (
              <View style={s.pickerBody}>
                {/* Testament Switcher */}
                <View style={s.testamentSwitchRow}>
                  <Pressable
                    accessibilityRole="tab"
                    accessibilityLabel="Ancien Testament, 39 livres"
                    accessibilityState={{ selected: pickerTestament === 'AT' }}
                    onPress={() => { setPickerSearch(''); setPickerTestament('AT'); }}
                    style={[
                      s.testamentSwitchBtn,
                      pickerTestament === 'AT' && s.testamentSwitchBtnActive,
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        s.testamentSwitchBtnText,
                        pickerTestament === 'AT' && s.testamentSwitchBtnTextActive,
                      ]}
                    >
                      Ancien (39)
                    </Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="tab"
                    accessibilityLabel="Nouveau Testament, 27 livres"
                    accessibilityState={{ selected: pickerTestament === 'NT' }}
                    onPress={() => { setPickerSearch(''); setPickerTestament('NT'); }}
                    style={[
                      s.testamentSwitchBtn,
                      pickerTestament === 'NT' && s.testamentSwitchBtnActive,
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        s.testamentSwitchBtnText,
                        pickerTestament === 'NT' && s.testamentSwitchBtnTextActive,
                      ]}
                    >
                      Nouveau (27)
                    </Text>
                  </Pressable>
                </View>

                {/* Filter Input */}
                <View style={s.pickerSearchBox}>
                  <Search size={18} color={c.muted} strokeWidth={1.5} style={s.pickerSearchIcon} />
                  <TextInput
                    value={pickerSearch}
                    onChangeText={setPickerSearch}
                    accessibilityLabel="Rechercher un livre"
                    placeholder="Rechercher un livre"
                    placeholderTextColor={c.muted}
                    style={s.pickerSearchInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {pickerSearch.length > 0 && (
                    <Pressable accessibilityRole="button" accessibilityLabel="Effacer la recherche de livre" onPress={() => setPickerSearch('')} style={s.pickerSearchClear}>
                      <X size={16} color={c.muted} />
                    </Pressable>
                  )}
                </View>

                {/* Books Scrollable List */}
                <ScrollView
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                  style={s.booksScrollView}
                  contentContainerStyle={s.booksListContainer}
                >
                  {booksInPicker.length === 0 && (
                    <Text accessibilityLiveRegion="polite" style={s.emptySearchText}>Aucun livre trouvé.</Text>
                  )}
                  {booksInPicker.map(book => {
                    const isCurrent = book.id === selectedBookId;
                    return (
                      <Pressable
                        key={book.id}
                        accessibilityRole="button"
                        accessibilityLabel={`${book.name}, ${book.chaptersCount} chapitres`}
                        onPress={() => { setTempBookForChapter(book); setStepInPicker('chapter'); }}
                        style={({ pressed }) => [
                          s.bookRowItem,
                          isCurrent && s.bookRowItemActive,
                          pressed && s.pressed,
                        ]}
                      >
                        <View style={s.bookRowLeft}>
                          <View style={[s.bookAbbrBadge, isCurrent && s.bookAbbrBadgeActive]}>
                            <Text style={[s.bookAbbrText, isCurrent && s.bookAbbrTextActive]}>
                              {book.abbr}
                            </Text>
                          </View>
                          <Text style={[s.bookRowName, isCurrent && s.bookRowNameActive]}>
                            {book.name}
                          </Text>
                        </View>
                        <View style={s.bookRowRight}>
                          <Text style={s.bookRowChaptersCount}>
                            {book.chaptersCount} chap.
                          </Text>
                          <ChevronRight size={18} color={isCurrent ? c.action : c.muted} strokeWidth={1.5} />
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            ) : (
              /* STEP 2: CHOOSE CHAPTER */
              <View style={s.pickerBody}>
                {tempBookForChapter && (
                  <ScrollView
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={s.chapterGridContainer}
                  >
                    {Array.from({ length: tempBookForChapter.chaptersCount }, (_, i) => i + 1).map(num => {
                      const isCurrentChapter = tempBookForChapter.id === selectedBookId && num === selectedChapter;
                      return (
                        <Pressable
                          key={num}
                          accessibilityRole="button"
                          accessibilityLabel={`Chapitre ${num}`}
                          onPress={() => openPassage({ bookId: tempBookForChapter.id, chapter: num })}
                          style={({ pressed }) => [
                            s.chapterGridItem,
                            isCurrentChapter && s.chapterGridItemActive,
                            pressed && s.pressed,
                          ]}
                        >
                          <Text
                            style={[
                              s.chapterGridItemText,
                              isCurrentChapter && s.chapterGridItemTextActive,
                            ]}
                          >
                            {num}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.canvas },
  pressed: { opacity: controls.pressedOpacity },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: c.divider,
    backgroundColor: c.canvas,
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerWrapped: {
    flexWrap: 'wrap',
    gap: 8,
  },
  headerTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  pageTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 24,
    color: c.text,
  },
  versionTag: {
    alignSelf: 'flex-start',
    backgroundColor: c.mint,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  versionTagText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: c.action,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: controls.touchSize,
    height: controls.touchSize,
    borderRadius: 24,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: {
    backgroundColor: c.mint,
    borderColor: c.action,
  },
  avatarBtn: {
    width: controls.touchSize,
    height: controls.touchSize,
    borderRadius: 24,
    backgroundColor: c.mint,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: c.action,
  },

  /* Top tabs (Bible vs Cantiques) */
  tabBarContainer: {
    paddingTop: 10,
    paddingBottom: 6,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: c.surface,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: c.divider,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    minWidth: 0,
    minHeight: controls.touchSize,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: c.mint,
  },
  tabLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: c.muted,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: c.action,
    fontFamily: fonts.bold,
  },
  upcomingBadge: {
    backgroundColor: c.amber,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  upcomingBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: '#3B2900',
  },

  /* Content */
  scrollContent: {
    paddingTop: 12,
  },
  disabled: { opacity: 0.42 },
  chapterLoading: { marginVertical: 24 },

  /* Selector Card */
  selectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.divider,
    marginBottom: 14,
    overflow: 'hidden',
  },
  selectorCardStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  cardShadow: {
    shadowColor: '#17302B',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  selectorTrigger: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    minHeight: controls.touchSize,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectorInfo: {
    marginRight: 8,
  },
  testamentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: c.canvas,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  testamentBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: c.muted,
  },
  bookNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  selectedBookTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: c.text,
    flexShrink: 1,
  },
  selectedChapterNumber: {
    color: c.action,
  },
  dropdownIcon: {
    marginTop: 2,
  },
  quickNavControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.canvas,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.divider,
    marginRight: 12,
  },
  quickNavControlsStacked: { alignSelf: 'flex-end', marginBottom: 12 },
  navArrowBtn: {
    width: controls.touchSize,
    height: controls.touchSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navDivider: {
    width: 1,
    height: 22,
    backgroundColor: c.divider,
  },

  /* Verses Selection Bar */
  selectionBar: {
    backgroundColor: c.action,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectionCountBadge: {
    backgroundColor: 'white',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionCountText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: c.action,
  },
  selectionLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: 'white',
  },
  selectionActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  selectionActionBtn: {
    minHeight: controls.touchSize,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  selectionActionBtnText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: c.action,
  },
  selectionCloseBtn: {
    width: controls.touchSize,
    height: controls.touchSize,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },

  /* Toast Notification */
  toastAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E6247',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
    alignSelf: 'center',
  },
  toastAlertText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: 'white',
  },

  /* Scripture Card */
  scriptureCard: {
    backgroundColor: c.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: c.divider,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 16,
  },
  chapterHeadingBox: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomColor: c.divider,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chapterSubheading: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: c.muted,
    marginBottom: 4,
  },
  chapterTitle: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: c.text,
  },

  /* Verses List */
  versesList: {
    gap: 12,
  },
  verseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    minHeight: controls.touchSize,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  verseRowSelected: {
    backgroundColor: '#E7F2F0',
    borderLeftColor: c.action,
  },
  verseRowHighlighted: { backgroundColor: '#FAEFD0' },
  verseRowTarget: { borderColor: c.action, borderWidth: 1 },
  verseRowPressed: {
    backgroundColor: '#F3F7F6',
  },
  verseNumberPill: {
    paddingVertical: 2,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseNumberPillSelected: {
    backgroundColor: c.action,
    borderRadius: 6,
  },
  verseNumberText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: c.action,
  },
  verseNumberTextSelected: {
    color: 'white',
  },
  verseText: {
    flex: 1,
    fontFamily: fonts.body,
    color: c.text,
  },

  readingHintBox: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: c.divider,
    alignItems: 'center',
  },
  readingHintText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: c.muted,
    textAlign: 'center',
  },

  /* Empty search */
  emptySearchResult: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptySearchText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: c.muted,
    textAlign: 'center',
    marginBottom: 12,
  },
  resetSearchBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: c.mint,
  },
  resetSearchBtnText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: c.action,
  },

  /* Chapter Navigation Footer Buttons */
  chapterNavFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  chapterNavFooterBtn: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.divider,
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderRadius: 14,
    minHeight: 48,
  },
  chapterNavFooterBtnPrimary: {
    backgroundColor: c.action,
    borderColor: c.action,
  },
  chapterNavFooterBtnText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: c.action,
  },
  chapterNavFooterBtnTextPrimary: {
    color: 'white',
  },

  /* Cantiques Tab Screen */
  cantiquesHero: {
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 18,
  },
  cantiquesHeroGradient: {
    padding: 22,
  },
  cantiquesHeroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cantiquesIconBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cantiquesTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  cantiquesTagText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: c.amber,
  },
  cantiquesHeroTitle: {
    fontFamily: fonts.bold,
    fontSize: 26,
    lineHeight: 32,
    color: 'white',
    marginBottom: 8,
  },
  cantiquesHeroSubtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: '#DCECE9',
  },

  cantiquesFeaturesCard: {
    backgroundColor: c.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: c.divider,
    padding: 20,
    marginBottom: 16,
  },
  cantiquesSectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: c.text,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 16,
  },
  featureIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: c.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureItemBullet: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: c.action,
  },
  featureTextBox: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: c.text,
    marginBottom: 3,
  },
  featureDesc: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: c.muted,
  },

  devotionalQuoteBox: {
    backgroundColor: '#F3EFE6',
    borderRadius: 16,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: c.amber,
  },
  devotionalQuoteText: {
    fontFamily: fonts.heading,
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
    color: '#4B3F2F',
    marginBottom: 6,
  },
  devotionalQuoteRef: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: '#8A6D3B',
    textAlign: 'right',
  },

  /* MODAL: Book & Chapter Picker */
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(17, 34, 30, 0.45)',
  },
  modalScrim: {
    ...StyleSheet.absoluteFill,
  },
  modalSheet: {
    backgroundColor: c.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    minHeight: '60%',
    paddingTop: 12,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1DDD9',
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: c.divider,
  },
  modalTitleBox: {
    flex: 1,
  },
  modalTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: c.text,
  },
  modalSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: c.muted,
  },
  modalCloseBtn: {
    width: controls.touchSize,
    height: controls.touchSize,
    borderRadius: 24,
    backgroundColor: c.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 10,
  },
  modalBackBtnText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: c.action,
  },

  pickerBody: {
    flex: 1,
    paddingTop: 12,
  },
  testamentSwitchRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: c.canvas,
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: c.divider,
    marginBottom: 12,
    gap: 4,
  },
  testamentSwitchBtn: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 9,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  testamentSwitchBtnActive: {
    backgroundColor: c.action,
  },
  testamentSwitchBtnText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: c.muted,
  },
  testamentSwitchBtnTextActive: {
    fontFamily: fonts.bold,
    color: 'white',
  },

  pickerSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: c.canvas,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.divider,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 10,
  },
  pickerSearchIcon: {
    marginRight: 8,
  },
  pickerSearchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: c.text,
    paddingVertical: 0,
  },
  pickerSearchClear: {
    padding: 4,
  },

  booksScrollView: {
    flex: 1,
  },
  booksListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  bookRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F3',
  },
  bookRowItemActive: {
    backgroundColor: c.mint,
  },
  bookRowLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookAbbrBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: c.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: c.divider,
  },
  bookAbbrBadgeActive: {
    backgroundColor: c.action,
    borderColor: c.action,
  },
  bookAbbrText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: c.action,
  },
  bookAbbrTextActive: {
    color: 'white',
  },
  bookRowName: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 15,
    color: c.text,
  },
  bookRowNameActive: {
    color: c.action,
  },
  bookRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookRowChaptersCount: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: c.muted,
  },

  /* Chapters grid */
  chapterGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
    justifyContent: 'flex-start',
  },
  chapterGridItem: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: c.canvas,
    borderWidth: 1,
    borderColor: c.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterGridItemActive: {
    backgroundColor: c.action,
    borderColor: c.action,
  },
  chapterGridItemText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: c.text,
  },
  chapterGridItemTextActive: {
    color: 'white',
  },
});
