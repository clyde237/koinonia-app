/** @jsxImportSource react */
import React, { useState, useMemo, useRef, useEffect, type ComponentRef } from 'react';
import {
  AccessibilityInfo,
  Alert,
  BackHandler,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Calendar,
  Check,
  ChevronRight,
  CirclePlay,
  Clock3,
  Download,
  FileText,
  Play,
  Pause,
  Share2,
  Sparkles,
  X,
} from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { SearchBar } from './SearchBar';
import { FiligraneWatermark } from './FiligraneWatermark';
import {
  allBreakfasts,
  dailyFeaturedBreakfast,
  BreakfastItem,
} from '../data/breakfasts';
import { controls, fonts, homeTheme as c } from '../lib/theme';

type Props = {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onOpenNotifications?: () => void;
  initialTab?: 'watch' | 'read';
  initialBreakfastId?: string;
  navHeight?: number;
  onDetailOpenChange?: (open: boolean) => void;
};

/** Flamme Koinonia en filigrane pour les cartes héro et lecteur. */
function FlameWatermark() {
  return (
    <View pointerEvents="none" accessible={false} style={s.watermark}>
      <Svg width={42} height={60} viewBox="200 0 700 1000">
        <Path
          fill="white"
          d="M598 0C501 52 422 175 434 292C439 370 477 461 470 521C464 572 430 592 388 590C320 587 265 526 281 394C229 481 205 576 210 669C218 869 348 986 556 984C737 983 877 866 879 686C883 523 821 406 690 291C590 203 531 105 598 0Z"
        />
      </Svg>
    </View>
  );
}

const CATEGORIES = ['Tous', 'Paix', 'Foi', 'Repos', 'Grâce', 'Prière', 'Direction'];

export function BreakfastsScreen({
  onBack,
  onOpenProfile,
  onOpenNotifications,
  initialTab = 'watch',
  initialBreakfastId,
  navHeight = 80,
  onDetailOpenChange,
}: Props) {
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const compact = width < 370;
  const gutter = compact ? 16 : 20;

  // Mode actif : 'watch' (« Regarder » par défaut selon le cadrage MVP) ou 'read' (« Lire »)
  const [activeMode, setActiveMode] = useState<'watch' | 'read'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('Tous');
  const [selectedBreakfast, setSelectedBreakfast] = useState<BreakfastItem | null>(() => {
    if (initialBreakfastId) {
      return allBreakfasts.find(b => b.id === initialBreakfastId) || null;
    }
    return null;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [downloadedIds, setDownloadedIds] = useState<Record<string, boolean>>({});

  const feedRef = useRef<ComponentRef<typeof ScrollView>>(null);

  useEffect(() => {
    if (onDetailOpenChange) {
      onDetailOpenChange(selectedBreakfast !== null);
    }
  }, [selectedBreakfast, onDetailOpenChange]);

  // Gestion du retour physique Android
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectedBreakfast) {
        setSelectedBreakfast(null);
        setIsPlaying(false);
        return true;
      }
      if (searchQuery.trim().length > 0) {
        setSearchQuery('');
        return true;
      }
      if (onBack) {
        onBack();
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [selectedBreakfast, searchQuery, onBack]);

  // Filtrage des Breakfasts selon la recherche et la catégorie
  // Selon le cadrage MVP : "La recherche couvre tout l’historique, y compris les contenus masqués par la période affichée."
  const filteredBreakfasts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allBreakfasts.filter(item => {
      // Filtre tag
      if (selectedTag !== 'Tous' && !item.tags.includes(selectedTag)) {
        return false;
      }

      // Filtre texte libre
      if (!q) return true;
      const inTitle = item.title.toLowerCase().includes(q);
      const inScripture = item.scriptureRef.toLowerCase().includes(q) || item.scriptureText.toLowerCase().includes(q);
      const inAuthor = item.author.toLowerCase().includes(q);
      const inTags = item.tags.some(t => t.toLowerCase().includes(q));
      const inText = item.text.toLowerCase().includes(q);
      const inSummary = item.summary.toLowerCase().includes(q);
      return inTitle || inScripture || inAuthor || inTags || inText || inSummary;
    });
  }, [searchQuery, selectedTag]);

  // Breakfast du jour à la une (affiché si pas de recherche spécifique ou s'il fait partie des résultats)
  const showDailyHero = useMemo(() => {
    if (!searchQuery.trim() && selectedTag === 'Tous') return true;
    return filteredBreakfasts.some(b => b.id === dailyFeaturedBreakfast.id);
  }, [searchQuery, selectedTag, filteredBreakfasts]);

  const handleShare = async (item: BreakfastItem) => {
    try {
      await Share.share({
        title: item.title,
        message: `« ${item.title} »\n${item.scriptureRef}\n\n${item.summary}\n\nKoinonia · Méditation matinale quotidienne`,
      });
    } catch {
      Alert.alert('Partage indisponible', 'Veuillez réessayer dans un instant.');
    }
  };

  const handleDownload = (item: BreakfastItem, format: 'video' | 'pdf') => {
    const key = `${item.id}-${format}`;
    setDownloadedIds(prev => ({ ...prev, [key]: true }));
    const label = format === 'video' ? 'La vidéo a été téléchargée' : 'Le PDF a été téléchargé';
    Alert.alert(
      'Téléchargement terminé',
      `${label} pour une consultation hors-ligne sur votre appareil.`,
      [{ text: 'OK' }]
    );
  };

  const openBreakfastDetail = (item: BreakfastItem, mode?: 'watch' | 'read') => {
    if (mode) setActiveMode(mode);
    setSelectedBreakfast(item);
    setIsPlaying(false);
  };

  // --- RENDU : VUE DÉTAILLÉE DU BREAKFAST (LECTEUR / VIDÉO) ---
  if (selectedBreakfast) {
    const isDownloadedVideo = downloadedIds[`${selectedBreakfast.id}-video`];
    const isDownloadedPdf = downloadedIds[`${selectedBreakfast.id}-pdf`];

    return (
      <View style={s.root}>
        <FiligraneWatermark opacity={0.15} />
        <View style={s.grow}>
          {/* Header du détail */}
          <View style={s.detailHeader}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retour à la liste des Breakfasts"
              onPress={() => {
                setSelectedBreakfast(null);
                setIsPlaying(false);
              }}
              style={({ pressed }) => [s.iconButton, pressed && s.pressed]}
            >
              <ArrowLeft size={22} color={c.text} strokeWidth={2} />
            </Pressable>

            {/* Sélecteur de mode dans le détail */}
            <View style={s.detailSegment}>
              <Pressable
                accessibilityRole="tab"
                accessibilityLabel="Mode vidéo"
                accessibilityState={{ selected: activeMode === 'watch' }}
                onPress={() => setActiveMode('watch')}
                style={[
                  s.detailSegmentTab,
                  activeMode === 'watch' && s.detailSegmentTabActive,
                ]}
              >
                <CirclePlay
                  size={15}
                  color={activeMode === 'watch' ? '#FFFFFF' : c.muted}
                  strokeWidth={2}
                />
                <Text
                  style={[
                    s.detailSegmentText,
                    activeMode === 'watch' && s.detailSegmentTextActive,
                  ]}
                >
                  Vidéo
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="tab"
                accessibilityLabel="Mode lecture"
                accessibilityState={{ selected: activeMode === 'read' }}
                onPress={() => setActiveMode('read')}
                style={[
                  s.detailSegmentTab,
                  activeMode === 'read' && s.detailSegmentTabActive,
                ]}
              >
                <BookOpen
                  size={15}
                  color={activeMode === 'read' ? '#FFFFFF' : c.muted}
                  strokeWidth={2}
                />
                <Text
                  style={[
                    s.detailSegmentText,
                    activeMode === 'read' && s.detailSegmentTextActive,
                  ]}
                >
                  Lecture
                </Text>
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Partager ce Breakfast"
              onPress={() => handleShare(selectedBreakfast)}
              style={({ pressed }) => [s.iconButton, pressed && s.pressed]}
            >
              <Share2 size={21} color={c.text} strokeWidth={1.75} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              s.detailScroll,
              { paddingBottom: navHeight + insets.bottom + 40 },
            ]}
          >
            {activeMode === 'watch' ? (
              // --- VUE VIDÉO ---
              <View>
                {/* Cadre vidéo simulé 16:9 */}
                <View style={s.videoPlayerFrame}>
                  <Image
                    source={selectedBreakfast.image}
                    resizeMode="cover"
                    style={StyleSheet.absoluteFill}
                  />
                  <LinearGradient
                    colors={['rgba(17,26,42,0.1)', 'rgba(8,23,24,0.85)']}
                    style={StyleSheet.absoluteFill}
                  />

                  {/* Bouton de lecture central */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={isPlaying ? 'Mettre en pause la vidéo' : 'Lire la vidéo'}
                    onPress={() => setIsPlaying(!isPlaying)}
                    style={({ pressed }) => [s.videoPlayBtn, pressed && s.pressed]}
                  >
                    {isPlaying ? (
                      <Pause size={28} color="#0B2929" fill="#0B2929" />
                    ) : (
                      <Play size={28} color="#0B2929" fill="#0B2929" style={{ marginLeft: 3 }} />
                    )}
                  </Pressable>

                  {/* Contrôles bas de vidéo */}
                  <View style={s.videoControlsBar}>
                    <Text style={s.videoTimer}>
                      {isPlaying ? '02:45' : '00:00'} / {selectedBreakfast.duration}
                    </Text>
                    <View style={s.videoProgressTrack}>
                      <View
                        style={[
                          s.videoProgressFill,
                          { width: isPlaying ? '35%' : '0%' },
                        ]}
                      />
                    </View>
                  </View>
                </View>

                {/* Métadonnées et actions de la vidéo */}
                <View style={s.detailContent}>
                  <View style={s.tagRow}>
                    {selectedBreakfast.tags.map(tag => (
                      <View key={tag} style={s.tagBadge}>
                        <Text style={s.tagText}>{tag}</Text>
                      </View>
                    ))}
                    <Text style={s.metaDate}>{selectedBreakfast.formattedDate}</Text>
                  </View>

                  <Text style={s.detailTitle}>{selectedBreakfast.title}</Text>
                  <Text style={s.authorLine}>Par {selectedBreakfast.author}</Text>

                  {/* Référence biblique */}
                  <View style={s.verseBanner}>
                    <Text style={s.verseRef}>{selectedBreakfast.scriptureRef}</Text>
                    <Text style={s.verseExcerpt}>{selectedBreakfast.scriptureText}</Text>
                  </View>

                  {/* Description et points clés */}
                  <View style={s.sectionCard}>
                    <Text style={s.sectionCardTitle}>Points clés de la méditation</Text>
                    <Text style={s.bodyText}>{selectedBreakfast.summary}</Text>
                  </View>

                  {/* Bouton de téléchargement vidéo */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Télécharger la vidéo pour écoute hors-ligne"
                    onPress={() => handleDownload(selectedBreakfast, 'video')}
                    style={({ pressed }) => [
                      s.downloadButton,
                      isDownloadedVideo && s.downloadButtonSuccess,
                      pressed && s.pressed,
                    ]}
                  >
                    {isDownloadedVideo ? (
                      <>
                        <Check size={19} color="#FFFFFF" strokeWidth={2.5} />
                        <Text style={s.downloadButtonLabel}>Vidéo disponible hors-ligne</Text>
                      </>
                    ) : (
                      <>
                        <Download size={19} color="#FFFFFF" strokeWidth={2} />
                        <Text style={s.downloadButtonLabel}>Télécharger la vidéo</Text>
                      </>
                    )}
                  </Pressable>
                </View>
              </View>
            ) : (
              // --- VUE LECTURE (Livre / Éditoriale) ---
              <View>
                {/* En-tête éditorial : métadonnées et titre sur fond calme et 100% lisible */}
                <View style={s.readingEditorialHeader}>
                  <View style={s.readingMetaRow}>
                    <View style={s.readingPill}>
                      <Clock3 size={14} color={c.action} strokeWidth={2} />
                      <Text style={s.readingPillText}>{selectedBreakfast.readTime}</Text>
                    </View>
                    <Text style={s.readingDateText}>{selectedBreakfast.formattedDate}</Text>
                  </View>

                  <Text accessibilityRole="header" style={s.readingMainTitle}>
                    {selectedBreakfast.title}
                  </Text>
                  <Text style={s.readingAuthorText}>Par {selectedBreakfast.author}</Text>
                </View>

                {/* Vignette d'illustration contenue et encadrée (sans aucun texte par-dessus) */}
                <View style={s.readingVignette}>
                  <Image
                    source={selectedBreakfast.image}
                    resizeMode="cover"
                    style={s.readingVignetteImage}
                  />
                </View>

                <View style={s.detailContent}>
                  {/* Encart du verset style livre */}
                  <View style={s.scriptureBookBox}>
                    <Text style={s.quoteSymbol}>“</Text>
                    <Text style={s.scriptureBookText}>
                      {selectedBreakfast.scriptureText}
                    </Text>
                    <Text style={s.scriptureBookRef}>— {selectedBreakfast.scriptureRef}</Text>
                  </View>

                  {/* Texte de la méditation */}
                  <View style={s.meditationBody}>
                    {selectedBreakfast.text.split('\n\n').map((paragraph, idx) => (
                      <Text key={idx} style={s.meditationParagraph}>
                        {paragraph}
                      </Text>
                    ))}
                  </View>

                  {/* Encadré : Prière du jour */}
                  <View style={s.prayerCard}>
                    <View style={s.prayerHeader}>
                      <Sparkles size={18} color={c.action} />
                      <Text style={s.prayerTitle}>Prière du jour</Text>
                    </View>
                    <Text style={s.prayerBody}>{selectedBreakfast.prayer}</Text>
                  </View>

                  {/* Action Télécharger le PDF */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Télécharger la méditation en PDF"
                    onPress={() => handleDownload(selectedBreakfast, 'pdf')}
                    style={({ pressed }) => [
                      s.downloadButton,
                      isDownloadedPdf && s.downloadButtonSuccess,
                      pressed && s.pressed,
                    ]}
                  >
                    {isDownloadedPdf ? (
                      <>
                        <Check size={19} color="#FFFFFF" strokeWidth={2.5} />
                        <Text style={s.downloadButtonLabel}>PDF enregistré hors-ligne</Text>
                      </>
                    ) : (
                      <>
                        <FileText size={19} color="#FFFFFF" strokeWidth={2} />
                        <Text style={s.downloadButtonLabel}>Télécharger le PDF</Text>
                      </>
                    )}
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    );
  }

  // --- RENDU : PAGE PRINCIPALE BREAKFASTS ---
  return (
    <View style={s.root}>
      <FiligraneWatermark opacity={0.15} />
      <View style={s.grow}>
        <ScrollView
          ref={feedRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            s.feedContainer,
            { paddingHorizontal: gutter, paddingBottom: navHeight + insets.bottom + 36 },
          ]}
        >
          {/* En-tête de la page */}
          <View style={s.headerRow}>
            {onBack ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Retour à l’accueil"
                onPress={onBack}
                style={({ pressed }) => [s.iconButton, pressed && s.pressed]}
              >
                <ArrowLeft size={22} color={c.text} strokeWidth={2} />
              </Pressable>
            ) : null}
            <View style={s.titleBlock}>
              <Text accessibilityRole="header" style={s.pageTitle}>
                Breakfasts
              </Text>
              <Text style={s.pageSubtitle}>Méditations quotidiennes</Text>
            </View>

            <View style={s.headerActions}>
              {onOpenNotifications && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Ouvrir les notifications"
                  onPress={onOpenNotifications}
                  style={({ pressed }) => [s.iconButton, pressed && s.pressed]}
                >
                  <Bell size={22} color={c.text} strokeWidth={1.5} />
                </Pressable>
              )}
            </View>
          </View>

          {/* Composant de recherche dédié */}
          <View style={s.searchContainer}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="Rechercher un Breakfast, un passage, un mot-clé…"
            />
          </View>

          {/* Deux onglets : « Regarder » (vidéos, par défaut) et « Lire » (méditations écrites) */}
          <View accessibilityRole="tablist" style={s.tabsContainer}>
            <Pressable
              accessibilityRole="tab"
              accessibilityLabel="Onglet Regarder, vidéos"
              accessibilityState={{ selected: activeMode === 'watch' }}
              onPress={() => setActiveMode('watch')}
              style={({ pressed }) => [
                s.modeTab,
                activeMode === 'watch' && s.modeTabActive,
                pressed && s.pressed,
              ]}
            >
              <CirclePlay
                size={18}
                color={activeMode === 'watch' ? '#FFFFFF' : c.muted}
                strokeWidth={2}
              />
              <Text
                style={[
                  s.modeTabLabel,
                  activeMode === 'watch' && s.modeTabLabelActive,
                ]}
              >
                Regarder
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="tab"
              accessibilityLabel="Onglet Lire, méditations écrites"
              accessibilityState={{ selected: activeMode === 'read' }}
              onPress={() => setActiveMode('read')}
              style={({ pressed }) => [
                s.modeTab,
                activeMode === 'read' && s.modeTabActive,
                pressed && s.pressed,
              ]}
            >
              <BookOpen
                size={18}
                color={activeMode === 'read' ? '#FFFFFF' : c.muted}
                strokeWidth={2}
              />
              <Text
                style={[
                  s.modeTabLabel,
                  activeMode === 'read' && s.modeTabLabelActive,
                ]}
              >
                Lire
              </Text>
            </Pressable>
          </View>

          {/* Chips thématiques / Filtres */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.chipScroller}
            contentContainerStyle={s.chipScrollerContent}
          >
            {CATEGORIES.map(category => {
              const selected = selectedTag === category;
              return (
                <Pressable
                  key={category}
                  accessibilityRole="button"
                  accessibilityLabel={`Thème ${category}`}
                  accessibilityState={{ selected }}
                  onPress={() => setSelectedTag(category)}
                  style={({ pressed }) => [
                    s.categoryChip,
                    selected && s.categoryChipActive,
                    pressed && s.pressed,
                  ]}
                >
                  <Text
                    style={[
                      s.categoryChipText,
                      selected && s.categoryChipTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* CARTE HÉRO : Breakfast du jour (si non masqué par recherche) */}
          {showDailyHero && (
            <View style={s.heroSection}>
              <View style={[s.heroCard, { minHeight: compact ? 260 : 280 }]}>
                <Image
                  source={dailyFeaturedBreakfast.image}
                  resizeMode="cover"
                  style={[StyleSheet.absoluteFill, s.coverImage]}
                />
                <LinearGradient
                  colors={[
                    'rgba(17,26,42,0.15)',
                    'rgba(13,27,29,0.5)',
                    'rgba(8,23,24,0.95)',
                  ]}
                  locations={[0, 0.35, 1]}
                  style={[StyleSheet.absoluteFill, s.coverImage]}
                />
                <FlameWatermark />

                <View style={s.heroContent}>
                  <View style={s.heroTopRow}>
                    <View style={s.dailyBadge}>
                      <Text style={s.dailyBadgeText}>Breakfast du jour</Text>
                    </View>
                    <View style={s.heroDuration}>
                      <Clock3 size={15} color="#FFFFFF" strokeWidth={1.5} />
                      <Text style={s.heroDurationText}>
                        {activeMode === 'watch'
                          ? dailyFeaturedBreakfast.duration
                          : dailyFeaturedBreakfast.readTime}
                      </Text>
                    </View>
                  </View>

                  <View style={s.heroSpacer} />

                  <Text
                    accessibilityRole="header"
                    textBreakStrategy="balanced"
                    lineBreakStrategyIOS="push-out"
                    style={[s.heroTitle, compact && { fontSize: 24, lineHeight: 30 }]}
                  >
                    {dailyFeaturedBreakfast.title}
                  </Text>

                  <Text style={s.heroVerse}>
                    {dailyFeaturedBreakfast.scriptureRef} · {dailyFeaturedBreakfast.author}
                  </Text>

                  {/* Actions de la carte du jour adaptées à l'onglet sélectionné */}
                  <View style={s.heroActions}>
                    {activeMode === 'watch' ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Regarder le Breakfast du jour"
                        onPress={() => openBreakfastDetail(dailyFeaturedBreakfast, 'watch')}
                        style={({ pressed }) => [s.primaryHeroAction, pressed && s.pressed]}
                      >
                        <LinearGradient
                          colors={['#54DDD0', '#00A99D']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={s.heroGradientBtn}
                        >
                          <Play size={18} color="#0B2929" fill="#0B2929" />
                          <Text style={s.primaryHeroLabel}>Regarder la vidéo</Text>
                        </LinearGradient>
                      </Pressable>
                    ) : (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Lire la méditation du jour"
                        onPress={() => openBreakfastDetail(dailyFeaturedBreakfast, 'read')}
                        style={({ pressed }) => [s.primaryHeroAction, pressed && s.pressed]}
                      >
                        <LinearGradient
                          colors={['#54DDD0', '#00A99D']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={s.heroGradientBtn}
                        >
                          <BookOpen size={18} color="#0B2929" />
                          <Text style={s.primaryHeroLabel}>Lire la méditation</Text>
                        </LinearGradient>
                      </Pressable>
                    )}

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Partager la méditation du jour"
                      onPress={() => handleShare(dailyFeaturedBreakfast)}
                      style={({ pressed }) => [s.secondaryHeroAction, pressed && s.pressed]}
                    >
                      <Share2 size={19} color="#FFFFFF" strokeWidth={1.75} />
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* LISTE HISTORIQUE / RÉSULTATS */}
          <View style={s.archiveSection}>
            <View style={s.archiveHeadingRow}>
              <Text accessibilityRole="header" style={s.archiveTitle}>
                {searchQuery.trim()
                  ? `Résultats (${filteredBreakfasts.length})`
                  : 'Tous les Breakfasts'}
              </Text>
              {searchQuery.trim().length > 0 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Effacer la recherche"
                  onPress={() => setSearchQuery('')}
                  style={({ pressed }) => [s.clearFilterBtn, pressed && s.pressed]}
                >
                  <Text style={s.clearFilterText}>Effacer</Text>
                </Pressable>
              )}
            </View>

            {/* ÉTAT VIDE SI RECHERCHE SANS RÉSULTATS */}
            {filteredBreakfasts.length === 0 ? (
              <View style={s.emptyState}>
                <View style={s.emptyIconCircle}>
                  <BookOpen size={36} color={c.action} strokeWidth={1.5} />
                </View>
                <Text style={s.emptyTitle}>Aucun Breakfast trouvé</Text>
                <Text style={s.emptySubtitle}>
                  Aucune méditation ne correspond à « {searchQuery} ». Essayez avec un mot-clé comme
                  « paix », « foi », ou une référence comme « Jean 15 ».
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Réinitialiser la recherche"
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedTag('Tous');
                  }}
                  style={({ pressed }) => [s.emptyResetBtn, pressed && s.pressed]}
                >
                  <Text style={s.emptyResetBtnText}>Voir tout l’historique</Text>
                </Pressable>
              </View>
            ) : (
              // CARTES DES BREAKFASTS
              filteredBreakfasts.map(item => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.title}, ${item.date}, ${item.duration}`}
                  onPress={() => openBreakfastDetail(item, activeMode)}
                  style={({ pressed }) => [s.cardItem, pressed && s.pressed]}
                >
                  {/* Miniature avec badge vidéo ou lecture */}
                  <View style={s.thumbnailWrapper}>
                    <Image source={item.image} style={s.thumbnailImage} resizeMode="cover" />
                    <LinearGradient
                      pointerEvents="none"
                      colors={['transparent', 'rgba(8,23,24,0.6)']}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={s.thumbBadge}>
                      {activeMode === 'watch' ? (
                        <CirclePlay size={16} color="#FFFFFF" strokeWidth={2} />
                      ) : (
                        <BookOpen size={14} color="#FFFFFF" strokeWidth={2} />
                      )}
                      <Text style={s.thumbBadgeText}>
                        {activeMode === 'watch' ? item.duration : item.readTime}
                      </Text>
                    </View>
                  </View>

                  {/* Informations texte */}
                  <View style={s.cardInfo}>
                    <View style={s.cardMetaRow}>
                      <Text style={s.cardDate}>{item.date}</Text>
                      <Text style={s.cardScripture}>{item.scriptureRef}</Text>
                    </View>
                    <Text numberOfLines={2} style={s.cardTitle}>
                      {item.title}
                    </Text>
                    <Text numberOfLines={2} style={s.cardSummary}>
                      {item.summary}
                    </Text>
                  </View>

                  <ChevronRight size={18} color={c.muted} strokeWidth={1.5} />
                </Pressable>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: c.canvas,
  },
  grow: {
    flex: 1,
  },
  feedContainer: {
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  titleBlock: {
    flex: 1,
  },
  pageTitle: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: c.text,
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: c.muted,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: controls.touchSize,
    height: controls.touchSize,
    borderRadius: 24,
    backgroundColor: c.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: c.divider,
  },
  searchContainer: {
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#EAE6DC',
    borderRadius: 28,
    padding: 4,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    minHeight: controls.touchSize,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    gap: 8,
    padding: 8,
  },
  modeTabActive: {
    backgroundColor: c.action,
  },
  modeTabLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: c.muted,
    textAlign: 'center',
  },
  modeTabLabelActive: {
    color: '#FFFFFF',
    fontFamily: fonts.heading,
  },
  chipScroller: {
    marginBottom: 18,
    marginHorizontal: -4,
  },
  chipScrollerContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  categoryChip: {
    minHeight: controls.touchSize,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.divider,
  },
  categoryChipActive: {
    backgroundColor: c.mint,
    borderColor: c.action,
  },
  categoryChipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: c.muted,
  },
  categoryChipTextActive: {
    color: c.action,
    fontFamily: fonts.heading,
  },
  heroSection: {
    marginBottom: 24,
  },
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1B293D',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  watermark: {
    position: 'absolute',
    top: 14,
    right: 14,
    opacity: 0.2,
  },
  heroContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dailyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(84,221,208,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(84,221,208,0.5)',
  },
  dailyBadgeText: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: '#54DDD0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroDurationText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#FFFFFF',
  },
  heroSpacer: {
    height: 18,
  },
  heroTitle: {
    fontFamily: fonts.bold,
    fontSize: 26,
    lineHeight: 32,
    color: '#FFFFFF',
  },
  heroVerse: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#E0E8EE',
    marginTop: 6,
    marginBottom: 16,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  primaryHeroAction: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  heroGradientBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  primaryHeroLabel: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: '#0B2929',
  },
  secondaryHeroAction: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  archiveSection: {
    gap: 12,
  },
  archiveHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  archiveTitle: {
    fontFamily: fonts.heading,
    fontSize: 19,
    color: c.text,
  },
  clearFilterBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearFilterText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: c.action,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: c.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.divider,
    gap: 12,
  },
  thumbnailWrapper: {
    width: 90,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1B293D',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: controls.photoOutline,
    borderRadius: 12,
  },
  thumbBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  thumbBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: '#FFFFFF',
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardDate: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: c.muted,
  },
  cardScripture: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: c.action,
  },
  cardTitle: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: c.text,
    lineHeight: 20,
  },
  cardSummary: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: c.muted,
    lineHeight: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: c.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: c.divider,
    marginTop: 8,
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: c.mint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: c.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: c.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyResetBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: c.action,
  },
  emptyResetBtnText: {
    fontFamily: fonts.heading,
    fontSize: 14,
    color: '#FFFFFF',
  },
  // DETAIL STYLES
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.divider,
  },
  detailSegment: {
    flexDirection: 'row',
    backgroundColor: '#EAE6DC',
    borderRadius: 20,
    padding: 3,
  },
  detailSegmentTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    gap: 6,
  },
  detailSegmentTabActive: {
    backgroundColor: c.action,
  },
  detailSegmentText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: c.muted,
  },
  detailSegmentTextActive: {
    color: '#FFFFFF',
    fontFamily: fonts.heading,
  },
  detailScroll: {
    paddingTop: 8,
  },
  videoPlayerFrame: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 20,
    overflow: 'hidden',
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: c.divider,
    shadowColor: '#111A2A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  videoPlayBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#54DDD0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  videoControlsBar: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  videoTimer: {
    fontFamily: fonts.medium,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    color: '#FFFFFF',
  },
  videoProgressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  videoProgressFill: {
    height: '100%',
    backgroundColor: '#54DDD0',
  },
  readingEditorialHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 8,
  },
  readingMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  readingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: c.mint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C2E0DA',
  },
  readingPillText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: c.action,
  },
  readingDateText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: c.muted,
  },
  readingMainTitle: {
    fontFamily: fonts.bold,
    fontSize: 26,
    lineHeight: 33,
    color: c.text,
    letterSpacing: -0.3,
  },
  readingAuthorText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: c.muted,
  },
  readingVignette: {
    marginHorizontal: 20,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1B293D',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: c.divider,
    shadowColor: '#111A2A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  readingVignetteImage: {
    width: '100%',
    height: '100%',
  },
  detailContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: c.mint,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: c.action,
  },
  metaDate: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: c.muted,
  },
  detailTitle: {
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 30,
    color: c.text,
  },
  authorLine: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: c.muted,
    marginTop: -8,
  },
  verseBanner: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F7E9D3',
    borderLeftWidth: 4,
    borderLeftColor: c.amber,
    gap: 6,
  },
  verseRef: {
    fontFamily: fonts.heading,
    fontSize: 14,
    color: '#6B4823',
  },
  verseExcerpt: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: '#3F2C18',
    fontStyle: 'italic',
  },
  sectionCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.divider,
    gap: 8,
  },
  sectionCardTitle: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: c.text,
  },
  bodyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: c.text,
  },
  scriptureBookBox: {
    padding: 20,
    borderRadius: 18,
    backgroundColor: '#FBF8F2',
    borderWidth: 1,
    borderColor: '#E8E1D3',
    position: 'relative',
  },
  quoteSymbol: {
    fontSize: 48,
    fontFamily: fonts.bold,
    color: c.amber,
    lineHeight: 36,
    marginBottom: -8,
  },
  scriptureBookText: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24,
    color: '#342B20',
    fontStyle: 'italic',
  },
  scriptureBookRef: {
    fontFamily: fonts.heading,
    fontSize: 13,
    color: c.action,
    marginTop: 10,
    textAlign: 'right',
  },
  meditationBody: {
    gap: 14,
  },
  meditationParagraph: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 25,
    color: c.text,
  },
  prayerCard: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: c.mint,
    borderWidth: 1,
    borderColor: '#C2E0DA',
    gap: 10,
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prayerTitle: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: c.action,
  },
  prayerBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: '#153D38',
    fontStyle: 'italic',
  },
  downloadButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: c.action,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 8,
    shadowColor: c.action,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  downloadButtonSuccess: {
    backgroundColor: '#0E705A',
  },
  downloadButtonLabel: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: '#FFFFFF',
  },
  pressed: {
    opacity: controls.pressedOpacity,
  },
});
