/** @jsxImportSource react */
import React, { useState, useMemo, useRef, useEffect, type ComponentRef } from 'react';
import {
  AccessibilityInfo,
  Alert,
  BackHandler,
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Minus,
  Music,
  Plus,
  Search,
  Share2,
  Sparkles,
  Type,
  X,
} from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { SearchBar } from './SearchBar';
import {
  BIBLE_BOOKS,
  BibleBook,
  BibleVerse,
  Testament,
  getChapterVerses,
} from '../data/bible';
import { fonts, homeTheme as c } from '../lib/theme';

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
  initialBookId?: string;
  initialChapter?: number;
  navHeight?: number;
  fontSizeMode?: FontSizeMode;
  onDetailOpenChange?: (open: boolean) => void;
};

export function BibleScreen({
  onBack,
  onOpenProfile,
  onOpenNotifications,
  initialBookId = 'jean',
  initialChapter = 15,
  navHeight = 80,
  fontSizeMode = 'medium',
  onDetailOpenChange,
}: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const compact = width < 370;
  const gutter = compact ? 16 : 20;

  // Active top tab: Bible ou Cantiques
  const [activeTab, setActiveTab] = useState<'bible' | 'cantiques'>('bible');

  // Book & Chapter State
  const [selectedBookId, setSelectedBookId] = useState<string>(initialBookId);
  const [selectedChapter, setSelectedChapter] = useState<number>(initialChapter);

  // Selector modal
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTestament, setPickerTestament] = useState<Testament>('NT');
  const [pickerSearch, setPickerSearch] = useState('');
  const [stepInPicker, setStepInPicker] = useState<'book' | 'chapter'>('book');
  const [tempBookForChapter, setTempBookForChapter] = useState<BibleBook | null>(null);

  // Quick search in chapter
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Verse multi-selection
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  // Current active book object
  const currentBook = useMemo(() => {
    return BIBLE_BOOKS.find(b => b.id === selectedBookId) || BIBLE_BOOKS[34]; // default to Jean
  }, [selectedBookId]);

  // Current verses
  const rawVerses = useMemo(() => {
    return getChapterVerses(selectedBookId, selectedChapter);
  }, [selectedBookId, selectedChapter]);

  // Filtered verses if search is active
  const displayedVerses = useMemo(() => {
    if (!searchQuery.trim()) return rawVerses;
    const q = searchQuery.toLowerCase().trim();
    return rawVerses.filter(v => v.text.toLowerCase().includes(q) || String(v.number) === q);
  }, [rawVerses, searchQuery]);

  // Notify parent of modal opening to adjust navigation if needed
  useEffect(() => {
    onDetailOpenChange?.(isPickerOpen);
  }, [isPickerOpen, onDetailOpenChange]);

  // Handle hardware back button
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isPickerOpen) {
        if (stepInPicker === 'chapter') {
          setStepInPicker('book');
          return true;
        }
        setIsPickerOpen(false);
        return true;
      }
      if (selectedVerses.length > 0) {
        setSelectedVerses([]);
        return true;
      }
      if (activeTab === 'cantiques') {
        setActiveTab('bible');
        return true;
      }
      if (onBack) {
        onBack();
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [isPickerOpen, stepInPicker, selectedVerses, activeTab, onBack]);

  // Clear selection on chapter change
  const navigateToChapter = (newChapter: number, newBookId?: string) => {
    const bookToUse = newBookId ? BIBLE_BOOKS.find(b => b.id === newBookId) || currentBook : currentBook;
    const targetBookId = bookToUse.id;
    const boundedChapter = Math.max(1, Math.min(newChapter, bookToUse.chaptersCount));

    setSelectedBookId(targetBookId);
    setSelectedChapter(boundedChapter);
    setSelectedVerses([]);
    setSearchQuery('');
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const handlePrevChapter = () => {
    if (selectedChapter > 1) {
      navigateToChapter(selectedChapter - 1);
    } else {
      // Aller au dernier chapitre du livre précédent
      const currentIndex = BIBLE_BOOKS.findIndex(b => b.id === currentBook.id);
      if (currentIndex > 0) {
        const prevBook = BIBLE_BOOKS[currentIndex - 1];
        navigateToChapter(prevBook.chaptersCount, prevBook.id);
      }
    }
  };

  const handleNextChapter = () => {
    if (selectedChapter < currentBook.chaptersCount) {
      navigateToChapter(selectedChapter + 1);
    } else {
      // Aller au premier chapitre du livre suivant
      const currentIndex = BIBLE_BOOKS.findIndex(b => b.id === currentBook.id);
      if (currentIndex < BIBLE_BOOKS.length - 1) {
        const nextBook = BIBLE_BOOKS[currentIndex + 1];
        navigateToChapter(1, nextBook.id);
      }
    }
  };

  // Open picker modal
  const openPicker = () => {
    setPickerTestament(currentBook.testament);
    setPickerSearch('');
    setStepInPicker('book');
    setTempBookForChapter(currentBook);
    setIsPickerOpen(true);
  };

  const selectBookInPicker = (book: BibleBook) => {
    setTempBookForChapter(book);
    setStepInPicker('chapter');
  };

  const selectChapterInPicker = (chapter: number) => {
    if (tempBookForChapter) {
      setSelectedBookId(tempBookForChapter.id);
      setSelectedChapter(chapter);
      setSelectedVerses([]);
      setSearchQuery('');
      setIsPickerOpen(false);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  // Verse selection toggle
  const toggleVerseSelection = (verseNumber: number) => {
    setSelectedVerses(prev => {
      if (prev.includes(verseNumber)) {
        return prev.filter(n => n !== verseNumber);
      } else {
        return [...prev, verseNumber].sort((a, b) => a - b);
      }
    });
  };

  // Formatter for selected verses
  const getSelectedVersesText = () => {
    if (selectedVerses.length === 0) return '';
    const verses = rawVerses.filter(v => selectedVerses.includes(v.number));
    const textFormatted = verses.map(v => `${v.number}. ${v.text}`).join('\n');
    const range = selectedVerses.length === 1
      ? `${currentBook.name} ${selectedChapter}.${selectedVerses[0]}`
      : `${currentBook.name} ${selectedChapter}.${selectedVerses[0]}-${selectedVerses[selectedVerses.length - 1]}`;
    return `« ${textFormatted} »\n— ${range} (Louis Segond 1910)\nKoinonia · La Parole de Dieu`;
  };

  // Share action
  const handleShareSelected = async () => {
    const text = getSelectedVersesText();
    if (!text) return;
    try {
      await Share.share({ message: text });
    } catch {
      Alert.alert('Erreur', 'Impossible d’ouvrir le partage sur cet appareil.');
    }
  };

  // Copy action
  const handleCopySelected = () => {
    const text = getSelectedVersesText();
    if (!text) return;
    // Show toast notification
    setCopiedNotification('Passage copié avec succès !');
    setTimeout(() => {
      setCopiedNotification(null);
    }, 2500);
  };

  // Books filtered in picker modal
  const booksInPicker = useMemo(() => {
    let list = BIBLE_BOOKS.filter(b => b.testament === pickerTestament);
    if (pickerSearch.trim()) {
      const q = pickerSearch.toLowerCase().trim();
      list = list.filter(b => b.name.toLowerCase().includes(q) || b.abbr.toLowerCase().includes(q));
    }
    return list;
  }, [pickerTestament, pickerSearch]);

  const activeFont = BIBLE_FONT_SIZES[fontSizeMode];

  return (
    <View style={s.root}>
      {/* Top Header */}
      <View style={[s.header, { paddingHorizontal: gutter }]}>
        <View style={s.headerLeft}>
          {onBack && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retour à l’accueil"
              onPress={onBack}
              style={({ pressed }) => [s.iconBtn, pressed && s.pressed]}
            >
              <ArrowLeft size={22} color={c.text} strokeWidth={1.5} />
            </Pressable>
          )}
          <View>
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
              accessibilityLabel="Rechercher un verset"
              onPress={() => setIsSearchVisible(prev => !prev)}
              style={({ pressed }) => [
                s.iconBtn,
                isSearchVisible && s.iconBtnActive,
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
            <Text numberOfLines={1} style={[s.tabLabel, activeTab === 'bible' && s.tabLabelActive]}>
              Bible
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="tab"
            accessibilityLabel="Onglet Cantiques"
            accessibilityState={{ selected: activeTab === 'cantiques' }}
            onPress={() => setActiveTab('cantiques')}
            style={({ pressed }) => [
              s.tabButton,
              activeTab === 'cantiques' && s.tabButtonActive,
              pressed && s.pressed,
            ]}
          >
            <Music size={17} color={activeTab === 'cantiques' ? c.action : c.muted} strokeWidth={1.5} />
            <Text numberOfLines={1} style={[s.tabLabel, activeTab === 'cantiques' && s.tabLabelActive]}>
              Cantiques
            </Text>
            <View style={s.upcomingBadge}>
              <Text style={s.upcomingBadgeText}>Bientôt</Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* TAB 1: BIBLE READER */}
      {activeTab === 'bible' ? (
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            s.scrollContent,
            { paddingHorizontal: gutter, paddingBottom: navHeight + Math.max(insets.bottom, 16) + 72 },
          ]}
        >
          {/* Quick Chapter Search Bar (when toggled) */}
          {isSearchVisible && (
            <View style={s.searchContainer}>
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                onClear={() => setSearchQuery('')}
                placeholder={`Rechercher dans ${currentBook.name} ${selectedChapter}…`}
                autoFocus
              />
            </View>
          )}

          {/* Passage Selector Bar */}
          <View style={[s.selectorCard, s.cardShadow]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Sélectionner un livre et un chapitre. Actuellement : ${currentBook.name} chapitre ${selectedChapter}`}
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

              <View style={s.quickNavControls}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Chapitre précédent"
                  onPress={handlePrevChapter}
                  style={({ pressed }) => [s.navArrowBtn, pressed && s.pressed]}
                >
                  <ChevronLeft size={20} color={c.text} strokeWidth={1.5} />
                </Pressable>
                <View style={s.navDivider} />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Chapitre suivant"
                  onPress={handleNextChapter}
                  style={({ pressed }) => [s.navArrowBtn, pressed && s.pressed]}
                >
                  <ChevronRight size={20} color={c.text} strokeWidth={1.5} />
                </Pressable>
              </View>
            </Pressable>
          </View>

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
          {copiedNotification && (
            <View style={s.toastAlert}>
              <Check size={16} color="white" strokeWidth={2} />
              <Text style={s.toastAlertText}>{copiedNotification}</Text>
            </View>
          )}

          {/* Scripture Reading Paper Card */}
          <View style={[s.scriptureCard, s.cardShadow]}>
            {/* Chapter Header */}
            <View style={s.chapterHeadingBox}>
              <Text style={s.chapterSubheading}>
                {currentBook.testament === 'AT' ? 'ANCIEN TESTAMENT' : 'NOUVEAU TESTAMENT'}
              </Text>
              <Text style={s.chapterTitle}>
                {currentBook.name} {selectedChapter}
              </Text>
              <View style={s.headingDivider} />
            </View>

            {/* Verses Stream */}
            {displayedVerses.length === 0 ? (
              <View style={s.emptySearchResult}>
                <Text style={s.emptySearchText}>
                  Aucun verset ne correspond à « {searchQuery} » dans ce chapitre.
                </Text>
                <Pressable onPress={() => setSearchQuery('')} style={s.resetSearchBtn}>
                  <Text style={s.resetSearchBtnText}>Effacer la recherche</Text>
                </Pressable>
              </View>
            ) : (
              <View style={s.versesList}>
                {displayedVerses.map(verse => {
                  const isSelected = selectedVerses.includes(verse.number);
                  return (
                    <Pressable
                      key={verse.number}
                      accessibilityRole="button"
                      accessibilityLabel={`Verset ${verse.number}. ${isSelected ? 'Sélectionné. Taper pour désélectionner.' : 'Taper pour sélectionner.'}`}
                      onPress={() => toggleVerseSelection(verse.number)}
                      style={({ pressed }) => [
                        s.verseRow,
                        isSelected && s.verseRowSelected,
                        pressed && s.verseRowPressed,
                      ]}
                    >
                      <View style={[s.verseNumberPill, isSelected && s.verseNumberPillSelected]}>
                        <Text style={[s.verseNumberText, isSelected && s.verseNumberTextSelected]}>
                          {verse.number}
                        </Text>
                      </View>
                      <Text
                        style={[
                          s.verseText,
                          {
                            fontSize: activeFont.text,
                            lineHeight: activeFont.line,
                          },
                          isSelected && s.verseTextSelected,
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
                Touchez un verset pour le sélectionner, le copier ou le partager.
              </Text>
            </View>
          </View>

          {/* Next / Prev Chapter Navigation Buttons */}
          <View style={s.chapterNavFooter}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Chapitre précédent"
              onPress={handlePrevChapter}
              style={({ pressed }) => [s.chapterNavFooterBtn, pressed && s.pressed]}
            >
              <ChevronLeft size={18} color={c.action} strokeWidth={1.8} />
              <Text numberOfLines={1} style={s.chapterNavFooterBtnText}>Précédent</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Chapitre suivant"
              onPress={handleNextChapter}
              style={({ pressed }) => [
                s.chapterNavFooterBtn,
                s.chapterNavFooterBtnPrimary,
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
        <View style={s.modalOverlay}>
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
              { paddingBottom: Math.max(insets.bottom, 24) },
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
                    onPress={() => setPickerTestament('AT')}
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
                    onPress={() => setPickerTestament('NT')}
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
                    placeholder="Rechercher un livre (ex: Jean, Ps)…"
                    placeholderTextColor={c.muted}
                    style={s.pickerSearchInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {pickerSearch.length > 0 && (
                    <Pressable onPress={() => setPickerSearch('')} style={s.pickerSearchClear}>
                      <X size={16} color={c.muted} />
                    </Pressable>
                  )}
                </View>

                {/* Books Scrollable List */}
                <ScrollView
                  showsVerticalScrollIndicator={true}
                  style={s.booksScrollView}
                  contentContainerStyle={s.booksListContainer}
                >
                  {booksInPicker.map(book => {
                    const isCurrent = book.id === selectedBookId;
                    return (
                      <Pressable
                        key={book.id}
                        accessibilityRole="button"
                        accessibilityLabel={`${book.name}, ${book.chaptersCount} chapitres`}
                        onPress={() => selectBookInPicker(book)}
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
                          onPress={() => selectChapterInPicker(num)}
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
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.canvas },
  pressed: { opacity: 0.8 },

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
    width: 38,
    height: 38,
    borderRadius: 19,
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
    width: 38,
    height: 38,
    borderRadius: 19,
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
    flexDirection: 'row',
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
  searchContainer: {
    marginBottom: 12,
  },

  /* Selector Card */
  selectorCard: {
    backgroundColor: c.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.divider,
    marginBottom: 14,
    overflow: 'hidden',
  },
  cardShadow: {
    shadowColor: '#17302B',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  selectorTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectorInfo: {
    flex: 1,
    minWidth: 0,
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
  },
  navArrowBtn: {
    width: 40,
    height: 40,
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
    alignItems: 'center',
    gap: 8,
  },
  selectionActionBtn: {
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
    width: 32,
    height: 32,
    borderRadius: 16,
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
    alignItems: 'center',
    marginBottom: 20,
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
    textAlign: 'center',
    marginBottom: 12,
  },
  headingDivider: {
    width: 48,
    height: 3,
    backgroundColor: c.action,
    borderRadius: 2,
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
  },
  verseRowSelected: {
    backgroundColor: '#E7F2F0',
    borderLeftWidth: 3,
    borderLeftColor: c.action,
  },
  verseRowPressed: {
    backgroundColor: '#F3F7F6',
  },
  verseNumberPill: {
    minWidth: 26,
    paddingVertical: 2,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseNumberPillSelected: {
    backgroundColor: c.action,
    borderRadius: 6,
    paddingHorizontal: 4,
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
  verseTextSelected: {
    fontFamily: fonts.medium,
    color: '#083B37',
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
    width: 38,
    height: 38,
    borderRadius: 19,
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
