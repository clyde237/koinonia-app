/** @jsxImportSource react */
// Cet écran utilise StyleSheet : conserver les callbacks natifs de Pressable.
// NativeWind 4 les intercepte et perd leurs styles (flex, arrondis, dimensions).
import { useEffect, useMemo, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import {
  AccessibilityInfo, Alert, BackHandler, Image, Modal, Platform, Pressable,
  ScrollView, Share, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BlurTargetView, BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft, Bell, BookOpen, CalendarDays, ChevronRight, CirclePlay,
  Clock3, Home, MapPin, Moon, Play, Settings, Share2, Sun, Users, X,
} from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { dailyBreakfast, homeCommunities, homeImages, recentBreakfasts, type Breakfast } from '../data/home';
import { DAILY_BIBLE_PASSAGE, type BiblePassage } from '../data/bible';
import { loadBibleFontSize, saveBibleFontSize } from '../lib/bible-library';
import { controls, fonts, type ThemeColors } from '../lib/theme';
import { useTheme } from '../lib/ThemeContext';
import { BreakfastsScreen } from './BreakfastsScreen';
import { GroupsScreen } from './GroupsScreen';
import { BIBLE_FONT_SIZES, BibleScreen, type FontSizeMode } from './BibleScreen';
import { SettingsScreen } from './SettingsScreen';
import { NotificationsMenu } from './NotificationsMenu';
import { FiligraneWatermark } from './FiligraneWatermark';
import { INITIAL_NOTIFICATIONS, type AppNotification } from '../data/notifications';

type Props = {
  readerId: string;
  name: string;
  email?: string;
  phone?: string;
  country: string;
  city?: string;
  church?: string;
  noChurch?: boolean;
  period: string;
  profilePhoto: string | null;
  requestedGroups: string[];
  breakfastNotifications: boolean;
  communityNotifications: boolean;
  photoHeaders: Record<string, string>;
  emailVerified: boolean;
  busy: boolean;
  accountError: string;
  onSignOut: () => void;
  onChangePassword: () => void;
  onEditProfile: () => void;
  onVerifyEmail: () => void;
};

type Sheet =
  | { kind: 'breakfast'; item: Breakfast; mode: 'read' | 'watch' }
  | { kind: 'community'; id: string }
  | { kind: 'notifications' | 'profile' | 'breakfasts' | 'groups' | 'settings' | 'event' };

const tabs = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'breakfasts', label: 'Breakfasts', icon: CirclePlay },
  { id: 'groups', label: 'Groupes', icon: Users },
  { id: 'bible', label: 'Bible', icon: BookOpen },
  { id: 'settings', label: 'Réglages', icon: Settings },
] as const;

function FlameWatermark() {
  return (
    <View pointerEvents="none" accessible={false} style={{ position: 'absolute', top: 16, right: 18, opacity: 0.14 }}>
      <Svg width={42} height={60} viewBox="200 0 700 1000">
        <Path fill="white" d="M598 0C501 52 422 175 434 292C439 370 477 461 470 521C464 572 430 592 388 590C320 587 265 526 281 394C229 481 205 576 210 669C218 869 348 986 556 984C737 983 877 866 879 686C883 523 821 406 690 291C590 203 531 105 598 0Z" />
      </Svg>
    </View>
  );
}

export function HomeScreen(props: Props) {
  const { isDark, colors: c, toggleTheme } = useTheme();
  const s = useMemo(() => createStyles(c, isDark), [c, isDark]);

  function SectionTitle({ children, action, actionLabel }: { children: ReactNode; action: () => void; actionLabel: string }) {
    return (
      <View style={s.sectionHeading}>
        <Text accessibilityRole="header" style={s.sectionTitle}>{children}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={actionLabel} onPress={action} style={({ pressed }) => [s.textAction, pressed && s.pressed]}>
          <Text style={s.link}>Tout voir</Text>
        </Pressable>
      </View>
    );
  }
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const compact = width < 370;
  const gutter = compact ? 16 : 20;
  const navWidth = Math.min(width - (compact ? 16 : 2 * gutter), 560);
  const stackHeroActions = fontScale > 1.35 || (width < 345 && fontScale > 1.1);
  const [currentScreen, setCurrentScreen] = useState<'home' | 'breakfasts' | 'groups' | 'bible' | 'settings'>('home');
  const [bibleFontSize, setBibleFontSize] = useState<FontSizeMode>('medium');
  const [bibleOpening, setBibleOpening] = useState<{ revision: number; passage?: BiblePassage }>({ revision: 0 });
  const bibleFontEdited = useRef(false);
  const [selectedBreakfastId, setSelectedBreakfastId] = useState<string | undefined>(undefined);
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(undefined);
  const [breakfastInitialTab, setBreakfastInitialTab] = useState<'watch' | 'read'>('watch');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const unreadNotifCount = notifications.filter(n => !n.read).length;
  const [reduceTransparency, setReduceTransparency] = useState(false);
  const [navHeight, setNavHeight] = useState(80);
  const feed = useRef<ComponentRef<typeof ScrollView>>(null);
  const blurTarget = useRef<ComponentRef<typeof View> | null>(null);
  const firstName = props.name.trim().split(/\s+/)[0] || 'à vous';
  const initials = props.name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase() || 'K';
  const bottom = Math.max(insets.bottom, 12);

  useEffect(() => {
    let active = true;
    bibleFontEdited.current = false;
    loadBibleFontSize(props.readerId).then(size => {
      if (active && !bibleFontEdited.current && size && Object.hasOwn(BIBLE_FONT_SIZES, size)) {
        setBibleFontSize(size as FontSizeMode);
      }
    }).catch(() => {});
    return () => { active = false; };
  }, [props.readerId]);

  const changeBibleFontSize = (size: FontSizeMode) => {
    bibleFontEdited.current = true;
    setBibleFontSize(size);
    saveBibleFontSize(props.readerId, size).catch(() => {
      Alert.alert('Préférence indisponible', 'La taille de lecture n’a pas pu être enregistrée sur cet appareil.');
    });
  };

  const openBible = (passage?: BiblePassage) => {
    if (passage || currentScreen !== 'bible') {
      setBibleOpening(previous => ({ passage, revision: previous.revision + 1 }));
    }
    setCurrentScreen('bible');
  };

  const handleSelectNotification = (item: AppNotification) => {
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
    setIsNotifMenuOpen(false);
    if (item.targetScreen === 'bible') {
      openBible(item.biblePassage);
      return;
    }
    if (item.targetScreen) {
      if (item.targetScreen === 'breakfasts') {
        setSelectedBreakfastId(undefined);
      } else if (item.targetScreen === 'groups') {
        setSelectedGroupId(undefined);
      }
      setCurrentScreen(item.targetScreen);
    }
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let active = true;
    AccessibilityInfo.isReduceTransparencyEnabled().then(value => { if (active) setReduceTransparency(value); }).catch(() => {});
    const listener = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReduceTransparency);
    return () => { active = false; listener.remove(); };
  }, []);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isNotifMenuOpen) {
        setIsNotifMenuOpen(false);
        return true;
      }
      if (sheet) {
        setSheet(null);
        return true;
      }
      if (currentScreen === 'breakfasts' || currentScreen === 'groups' || currentScreen === 'bible' || currentScreen === 'settings') {
        if (isDetailOpen) {
          // Géré par l'écran lui-même
          return false;
        }
        setCurrentScreen('home');
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [sheet, currentScreen, isDetailOpen, isNotifMenuOpen]);

  const shareVerse = async () => {
    try {
      await Share.share({ message: '« Demeurez en moi, et je demeurerai en vous. »\nJean 15.4\n\nKoinonia · Communion avec le Saint-Esprit' });
    } catch {
      Alert.alert('Partage indisponible', 'Veuillez réessayer dans un instant.');
    }
  };
  const openBreakfast = (item: Breakfast, mode: 'read' | 'watch') => {
    setSelectedBreakfastId(item.id);
    setBreakfastInitialTab(mode);
    setCurrentScreen('breakfasts');
  };
  const profile = sheet?.kind === 'profile' || sheet?.kind === 'settings';
  const community = sheet?.kind === 'community' ? homeCommunities.find(group => group.id === sheet.id) : undefined;
  const sheetTitle = !sheet ? '' : sheet.kind === 'breakfast' ? (sheet.mode === 'read' ? 'Votre méditation' : 'Regarder le Breakfast')
    : community ? community.name
    : ({ notifications: 'Notifications', profile: 'Mon profil', breakfasts: 'Les Breakfasts', groups: 'Communautés', settings: 'Réglages', event: 'À la une' } as Record<string, string>)[sheet.kind];

  const communityRow = (group: typeof homeCommunities[number], index: number) => (
    <Pressable
      key={group.id}
      accessibilityRole="button"
      accessibilityLabel={`${group.name}${props.requestedGroups.includes(group.id) ? ', demande en attente' : ''}${group.readOnly ? ', lecture seule' : ''}`}
      onPress={() => {
        setSelectedGroupId(group.id);
        setCurrentScreen('groups');
      }}
      style={({ pressed }) => [s.communityRow, index > 0 && s.rowDivider, pressed && s.pressed]}
    >
      <Image source={group.image} style={s.communityImage} />
      <View style={s.grow}>
        <Text style={s.communityName}>{group.name}</Text>
        {props.requestedGroups.includes(group.id) && <Text style={s.pending}>Demande en attente</Text>}
      </View>
      {group.readOnly ? <View style={s.neutralBadge}><Text style={s.badgeText}>Lecture seule</Text></View> : <ChevronRight size={18} color={c.muted} strokeWidth={1.5} />}
    </Pressable>
  );

  return (
    <View style={s.root}>
      <FiligraneWatermark opacity={0.15} />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView edges={['top', 'left', 'right']} style={s.grow}>
        <BlurTargetView ref={blurTarget} style={s.grow}>
          {currentScreen === 'home' ? (
            <ScrollView
              ref={feed}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[s.feed, { paddingHorizontal: gutter, paddingBottom: navHeight + bottom + 32 }]}
            >
            <View style={s.header}>
              <Image
                source={isDark ? require('../assets/logo-koinonia_w.png') : require('../assets/logo-koinonia.png')}
                resizeMode="contain"
                accessibilityLabel="Koinonia"
                style={[s.logo, compact && { width: 148 }]}
              />
              <View style={s.headerActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={isDark ? "Passer en mode jour" : "Passer en mode nuit"}
                  onPress={toggleTheme}
                  style={({ pressed }) => [s.iconButton, pressed && s.pressed]}
                >
                  {isDark ? (
                    <Sun size={23} color={c.action} strokeWidth={controls.iconStroke} />
                  ) : (
                    <Moon size={23} color={c.text} strokeWidth={controls.iconStroke} />
                  )}
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Notifications, ${unreadNotifCount > 0 ? `${unreadNotifCount} nouvelles` : 'aucune nouvelle'}`}
                  onPress={() => setIsNotifMenuOpen(true)}
                  style={({ pressed }) => [s.iconButton, pressed && s.pressed]}
                >
                  <Bell size={24} color={c.text} strokeWidth={1.5} />
                  {unreadNotifCount > 0 && <View style={s.bellBadge} />}
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel="Ouvrir mes réglages et mon profil" onPress={() => setCurrentScreen('settings')} style={({ pressed }) => [s.avatar, pressed && s.pressed]}>
                  {props.profilePhoto ? <Image source={{ uri: props.profilePhoto, headers: props.photoHeaders }} style={s.avatarImage} /> : <Text style={s.initials}>{initials}</Text>}
                </Pressable>
              </View>
            </View>

            <View style={s.welcome}>
              <Text style={s.greeting}>Bonjour, {firstName}</Text>
              <Text accessibilityRole="header" textBreakStrategy="balanced" lineBreakStrategyIOS="push-out" style={[s.welcomeTitle, compact && s.welcomeTitleCompact]}>
                Que ta journée commence dans la paix
              </Text>
            </View>

            <View style={[s.hero, { minHeight: compact ? 280 : 296 }]}>
              <Image source={homeImages.dawn} resizeMode="cover" style={[StyleSheet.absoluteFill, s.coverImage]} />
              <LinearGradient colors={['rgba(17,26,42,0.12)', 'rgba(13,27,29,0.45)', 'rgba(8,23,24,0.96)']} locations={[0, 0.3, 1]} style={[StyleSheet.absoluteFill, s.coverImage]} />
              <FlameWatermark />
              <View style={s.heroContent}>
                <View style={s.dailyBadge}><Text style={s.dailyBadgeText}>Breakfast du jour</Text></View>
                <View style={s.heroSpacer} />
                <Text accessibilityRole="header" textBreakStrategy="balanced" lineBreakStrategyIOS="push-out" style={[s.heroTitle, compact && s.heroTitleCompact]}>
                  {dailyBreakfast.title}
                </Text>
                <View style={s.duration}><Clock3 size={17} color="white" strokeWidth={1.5} /><Text style={s.heroMeta}>{dailyBreakfast.duration}</Text></View>
                <View style={[s.heroActions, stackHeroActions && s.stack]}>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Regarder ${dailyBreakfast.title}`} onPress={() => openBreakfast(dailyBreakfast, 'watch')} style={({ pressed }) => [s.primaryAction, stackHeroActions && s.stackedAction, pressed && s.pressed]}>
                    <LinearGradient colors={['#54DDD0', '#00A99D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.watchButton}>
                      <Play size={20} color={c.onHeroAction} fill={c.onHeroAction} strokeWidth={controls.iconStroke} style={s.playIcon} />
                      <Text style={s.watchLabel}>Regarder</Text>
                    </LinearGradient>
                  </Pressable>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Lire ${dailyBreakfast.title}`} onPress={() => openBreakfast(dailyBreakfast, 'read')} style={({ pressed }) => [s.readButton, stackHeroActions && s.stackedAction, pressed && s.pressed]}>
                    <BookOpen size={20} color={c.onHero} strokeWidth={controls.iconStroke} />
                    <Text style={s.readLabel}>Lire</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={[s.verseCard, s.softShadow]}>
              <View style={s.verseHeader}>
                <Text accessibilityRole="header" style={s.sectionTitle}>Verset du jour</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Partager le verset du jour" onPress={shareVerse} style={({ pressed }) => [s.iconButton, s.shareButton, pressed && s.pressed]}><Share2 size={21} color={c.text} strokeWidth={1.5} /></Pressable>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Demeurez en moi, et je demeurerai en vous. Jean 15, verset 4."
                accessibilityHint="Ouvre Jean 15, verset 4 dans la Bible"
                onPress={() => openBible(DAILY_BIBLE_PASSAGE)}
                style={({ pressed }) => [s.verseBody, pressed && s.pressed]}
              >
                <Text accessible={false} style={s.quote}>“</Text>
                <View style={s.grow}>
                  <Text textBreakStrategy="highQuality" lineBreakStrategyIOS="push-out" style={s.verse}>Demeurez en moi, et je demeurerai en vous.</Text>
                  <Text style={s.reference}>Jean 15.4 · Lire le chapitre →</Text>
                </View>
              </Pressable>
            </View>

            <View style={s.section}>
              <SectionTitle actionLabel="Voir tous les Breakfasts" action={() => { setSelectedBreakfastId(undefined); setCurrentScreen('breakfasts'); }}>Derniers Breakfasts</SectionTitle>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -gutter }} contentContainerStyle={{ paddingHorizontal: gutter, gap: 12 }}>
                {recentBreakfasts.map(item => (
                  <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${item.format === 'video' ? 'Regarder' : 'Lire'} ${item.title}, ${item.duration}`} onPress={() => openBreakfast(item, item.format === 'video' ? 'watch' : 'read')} style={({ pressed }) => [s.recentCard, { width: compact ? 158 : 174 }, pressed && s.pressed]}>
                    <Image source={item.image} style={[StyleSheet.absoluteFill, s.coverImage]} resizeMode="cover" />
                    <LinearGradient pointerEvents="none" colors={['rgba(17,26,42,0.02)', 'rgba(8,23,24,0.92)']} style={StyleSheet.absoluteFill} />
                    <View style={s.recentContent}>
                      <View style={s.formatIcon}>{item.format === 'video' ? <CirclePlay size={30} color="white" strokeWidth={1.5} /> : <BookOpen size={22} color="white" strokeWidth={1.5} />}</View>
                      <Text style={s.recentTitle}>{item.title}</Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={s.section}>
              <SectionTitle actionLabel="Voir toutes les communautés" action={() => { setSelectedGroupId(undefined); setCurrentScreen('groups'); }}>Mes communautés</SectionTitle>
              <View style={[s.communityCard, s.softShadow]}>{homeCommunities.map(communityRow)}</View>
            </View>

            <Pressable accessibilityRole="button" accessibilityLabel="Voir l’événement Veillée de prière, le 28 novembre à Douala" onPress={() => setSheet({ kind: 'event' })} style={({ pressed }) => [s.eventCard, s.softShadow, pressed && s.pressed]}>
              <Image source={homeImages.candle} style={s.eventImage} resizeMode="cover" />
              <View style={s.grow}>
                <View style={s.eventBadge}><Text style={s.eventBadgeText}>À la une</Text></View>
                <Text style={s.eventTitle}>Veillée de prière</Text>
                <Text style={s.eventMeta}>28 nov. · Douala</Text>
              </View>
              <ChevronRight size={18} color={c.muted} strokeWidth={1.5} />
            </Pressable>

            <View style={s.library} accessible accessibilityLabel="Bibliothèque, à venir">
              <BookOpen size={25} color={c.text} strokeWidth={1.5} />
              <Text style={[s.libraryTitle, s.grow]}>Bibliothèque</Text>
              <View style={s.neutralBadge}><Text style={s.badgeText}>À venir</Text></View>
            </View>
            <Text style={s.demoNote}>Aperçu · Contenus de démonstration</Text>
          </ScrollView>
        ) : currentScreen === 'breakfasts' ? (
          <BreakfastsScreen
            onBack={() => setCurrentScreen('home')}
            onOpenProfile={() => setCurrentScreen('settings')}
            onOpenNotifications={() => setIsNotifMenuOpen(true)}
            initialTab={breakfastInitialTab}
            initialBreakfastId={selectedBreakfastId}
            navHeight={navHeight}
            onDetailOpenChange={setIsDetailOpen}
          />
        ) : currentScreen === 'groups' ? (
          <GroupsScreen
            onBack={() => setCurrentScreen('home')}
            onOpenProfile={() => setCurrentScreen('settings')}
            onOpenNotifications={() => setIsNotifMenuOpen(true)}
            initialGroupId={selectedGroupId}
            navHeight={navHeight}
            onDetailOpenChange={setIsDetailOpen}
          />
        ) : currentScreen === 'bible' ? (
          <BibleScreen
            key={bibleOpening.revision}
            readerId={props.readerId}
            initialPassage={bibleOpening.passage}
            onBack={() => setCurrentScreen('home')}
            onOpenProfile={() => setCurrentScreen('settings')}
            onOpenNotifications={() => setIsNotifMenuOpen(true)}
            navHeight={navHeight}
            fontSizeMode={bibleFontSize}
            onDetailOpenChange={setIsDetailOpen}
          />
        ) : (
          <SettingsScreen
            name={props.name}
            email={props.email}
            phone={props.phone}
            country={props.country}
            city={props.city}
            church={props.church}
            noChurch={props.noChurch}
            period={props.period}
            profilePhoto={props.profilePhoto}
            photoHeaders={props.photoHeaders}
            emailVerified={props.emailVerified}
            breakfastNotifications={props.breakfastNotifications}
            communityNotifications={props.communityNotifications}
            busy={props.busy}
            accountError={props.accountError}
            navHeight={navHeight}
            bibleFontSize={bibleFontSize}
            onChangeBibleFontSize={changeBibleFontSize}
            onBack={() => setCurrentScreen('home')}
            onSignOut={props.onSignOut}
            onChangePassword={props.onChangePassword}
            onEditProfile={props.onEditProfile}
            onVerifyEmail={props.onVerifyEmail}
            onOpenNotifications={() => setIsNotifMenuOpen(true)}
          />
        )}
        </BlurTargetView>
      </SafeAreaView>

      <View
        onLayout={event => {
          const h = event.nativeEvent.layout.height;
          if (h > 0) setNavHeight(h);
        }}
        pointerEvents={(sheet !== null || isDetailOpen) ? 'none' : 'auto'}
        accessibilityElementsHidden={sheet !== null || isDetailOpen}
        importantForAccessibility={(sheet !== null || isDetailOpen) ? 'no-hide-descendants' : 'auto'}
        style={[
          s.navShell,
          { width: navWidth, left: (width - navWidth) / 2, bottom },
          (sheet !== null || isDetailOpen) && s.navHidden,
        ]}
      >
        <BlurView blurTarget={blurTarget} blurMethod="dimezisBlurViewSdk31Plus" intensity={70} tint={isDark ? "dark" : "light"} style={[s.navGlass, reduceTransparency && { backgroundColor: c.surface }]}>
          <View accessibilityRole="tablist" style={s.navRow}>
            {tabs.map(tab => {
              const selected = currentScreen === tab.id;
              const circleSize = Math.min(Math.floor((navWidth - 8) / 5) - 4, 58);
              return (
                <Pressable
                  key={tab.label}
                  accessibilityRole="tab"
                  accessibilityLabel={tab.label}
                  accessibilityState={{ selected }}
                  onPress={() => {
                    if (tab.id === 'home') {
                      if (currentScreen === 'home') {
                        feed.current?.scrollTo({ y: 0, animated: false });
                      } else {
                        setCurrentScreen('home');
                      }
                    } else if (tab.id === 'breakfasts') {
                      setSelectedBreakfastId(undefined);
                      setCurrentScreen('breakfasts');
                    } else if (tab.id === 'groups') {
                      setSelectedGroupId(undefined);
                      setCurrentScreen('groups');
                    } else if (tab.id === 'bible') {
                      openBible();
                    } else if (tab.id === 'settings') {
                      setCurrentScreen('settings');
                    }
                  }}
                  style={({ pressed }) => [s.navItem, pressed && s.pressed]}
                >
                  {selected && (
                    <View
                      pointerEvents="none"
                      style={[
                        s.navActiveCircle,
                        {
                          width: circleSize,
                          height: circleSize,
                          borderRadius: circleSize / 2,
                          top: Math.round((62 - circleSize) / 2),
                        },
                      ]}
                    />
                  )}
                  <tab.icon size={21} color={selected ? c.action : c.text} strokeWidth={controls.iconStroke} />
                  <Text numberOfLines={1} style={[s.navLabel, selected && s.navLabelSelected]}>{tab.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </BlurView>
      </View>

      <Modal
        visible={sheet !== null}
        animationType="none"
        transparent
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setSheet(null)}
      >
        <View style={s.modalRoot}>
          <Pressable accessibilityRole="button" accessibilityLabel="Fermer l’aperçu" onPress={() => setSheet(null)} style={s.scrim} />
          <View accessibilityViewIsModal style={[s.sheet, { maxHeight: '90%', paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHeader}>
              {sheet?.kind === 'breakfast' && <Pressable accessibilityRole="button" accessibilityLabel="Retour aux Breakfasts" onPress={() => setSheet({ kind: 'breakfasts' })} style={s.iconButton}><ArrowLeft size={22} color={c.text} /></Pressable>}
              <Text accessibilityRole="header" style={[s.sectionTitle, s.grow]}>{sheetTitle}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Fermer" onPress={() => setSheet(null)} style={s.iconButton}><X size={22} color={c.text} strokeWidth={1.5} /></Pressable>
            </View>
            <ScrollView contentContainerStyle={s.sheetBody}>
              {sheet?.kind === 'breakfast' && <>
                <Image source={sheet.item.image} style={s.detailImage} />
                <Text style={s.detailTitle}>{sheet.item.title}</Text>
                <Text style={s.detailMeta}>{sheet.item.duration}</Text>
                {sheet.mode === 'watch' ? <>
                  <Text style={s.detailBody}>La vidéo de cette méditation sera accessible ici dès sa publication. Vous pouvez découvrir le texte d’exemple.</Text>
                  <Pressable accessibilityRole="button" onPress={() => openBreakfast(sheet.item, 'read')} style={s.sheetButton}><BookOpen size={20} color="white" /><Text style={s.sheetButtonLabel}>Lire la méditation</Text></Pressable>
                </> : <Text style={s.detailBody}>{sheet.item.text}</Text>}
                <Text style={s.detailMeta}>Méditation de démonstration</Text>
              </>}
              {sheet?.kind === 'breakfasts' && [dailyBreakfast, ...recentBreakfasts].map(item => <Pressable key={item.id} accessibilityRole="button" onPress={() => openBreakfast(item, item.format === 'video' ? 'watch' : 'read')} style={({ pressed }) => [s.previewRow, pressed && s.pressed]}><Image source={item.image} style={s.communityImage} /><View style={s.grow}><Text style={s.communityName}>{item.title}</Text><Text style={s.detailMeta}>{item.duration} · {item.format === 'video' ? 'Vidéo' : 'Lecture'}</Text></View><ChevronRight size={20} color={c.action} /></Pressable>)}
              {sheet?.kind === 'groups' && <><Text style={s.detailBody}>Retrouvez les communautés découvertes pendant votre accueil.</Text>{homeCommunities.map(communityRow)}</>}
              {community && <>
                <Image source={community.image} style={s.detailImage} />
                <Text style={s.detailBody}>{community.description}</Text>
                <Text style={s.detailBody}>{props.requestedGroups.includes(community.id) ? 'Votre choix est conservé dans cet aperçu. La demande d’adhésion sera envoyée lorsque le service de communautés sera connecté.' : 'Vous pourrez demander à rejoindre cette communauté lorsque le service sera disponible.'}</Text>
                {community.readOnly && <View style={s.infoPanel}><Text style={s.detailBody}>Lecture seule : seuls les administrateurs peuvent publier.</Text></View>}
              </>}
              {sheet?.kind === 'event' && <>
                <Image source={homeImages.candle} style={s.detailImage} />
                <Text style={s.detailTitle}>Veillée de prière</Text>
                <View style={s.infoLine}><CalendarDays size={20} color={c.action} /><Text style={s.detailBody}>28 novembre</Text></View>
                <View style={s.infoLine}><MapPin size={20} color={c.action} /><Text style={s.detailBody}>Douala</Text></View>
                <Text style={s.detailBody}>Un temps de prière, de partage et de communion.</Text>
                <Text style={s.detailMeta}>Événement de démonstration · Horaires et lieu précis à confirmer.</Text>
              </>}
              {sheet?.kind === 'notifications' && <View style={s.empty}><Bell size={32} color={c.action} strokeWidth={1.5} /><Text style={s.detailTitle}>Un moment de calme</Text><Text style={s.detailBody}>Vous n’avez aucune notification pour le moment.</Text></View>}
              {profile && <>
                <Text style={s.detailTitle}>{props.name || 'Votre profil'}</Text>
                {props.country ? <Text style={s.detailBody}>{props.country}</Text> : null}
                <View style={s.infoPanel}><Text style={s.communityName}>Historique des Breakfasts</Text><Text style={s.detailBody}>{props.period}</Text></View>
                <View style={s.infoPanel}><Text style={s.communityName}>Notifications choisies</Text><Text style={s.detailBody}>Breakfasts : {props.breakfastNotifications ? 'activées' : 'désactivées'}{ '\n' }Communautés : {props.communityNotifications ? 'activées' : 'désactivées'}</Text></View>
                <Text style={s.detailMeta}>{props.emailVerified ? 'Adresse e-mail vérifiée' : 'Adresse e-mail non vérifiée'}</Text>
                {!props.emailVerified && <Pressable accessibilityRole="button" disabled={props.busy} onPress={props.onVerifyEmail} style={s.accountAction}><Text style={s.link}>Vérifier mon adresse e-mail</Text><ChevronRight size={18} color={c.action} /></Pressable>}
                <Pressable accessibilityRole="button" disabled={props.busy} onPress={props.onEditProfile} style={s.accountAction}><Text style={s.link}>Modifier mon profil et mes préférences</Text><ChevronRight size={18} color={c.action} /></Pressable>
                <Pressable accessibilityRole="button" disabled={props.busy} onPress={props.onChangePassword} style={s.accountAction}><Text style={s.link}>Changer le mot de passe</Text><ChevronRight size={18} color={c.action} /></Pressable>
                {props.accountError ? <Text accessibilityRole="alert" style={s.accountError}>{props.accountError}</Text> : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: props.busy, busy: props.busy }}
                  disabled={props.busy}
                  onPress={props.onSignOut}
                  style={({ pressed }) => [s.sheetButton, s.sheetButtonDestructive, pressed && s.pressed]}
                >
                  <Text style={[s.sheetButtonLabel, s.sheetButtonDestructiveLabel]}>{props.busy ? 'Déconnexion…' : 'Se déconnecter'}</Text>
                </Pressable>
              </>}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <NotificationsMenu
        visible={isNotifMenuOpen}
        notifications={notifications}
        onClose={() => setIsNotifMenuOpen(false)}
        onSelectNotification={handleSelectNotification}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onOpenSettings={() => {
          setIsNotifMenuOpen(false);
          setCurrentScreen('settings');
        }}
      />
    </View>
  );
}

function createStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
  root: { flex: 1, backgroundColor: c.canvas }, grow: { flex: 1 },
  coverImage: { width: '100%', height: '100%' },
  feed: { width: '100%', maxWidth: 600, alignSelf: 'center', paddingTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 },
  logo: { width: 158, height: 30 }, headerActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  bellBadge: { position: 'absolute', top: 8, right: 8, width: 9, height: 9, borderRadius: 5, backgroundColor: c.action, borderWidth: 1.5, borderColor: isDark ? c.surface : 'white' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.mint, borderWidth: 2, borderColor: isDark ? c.moonlightBorder : 'white', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' }, initials: { fontFamily: fonts.heading, fontSize: 16, color: c.action },
  welcome: { marginTop: 16, marginBottom: 20 }, greeting: { fontFamily: fonts.heading, fontSize: 14, lineHeight: 21, color: c.text, marginBottom: 6 },
  welcomeTitle: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 31, letterSpacing: -0.6, color: c.text },
  welcomeTitleCompact: { fontSize: 22, lineHeight: 29 },
  hero: { borderRadius: 32, overflow: 'hidden', backgroundColor: '#243D3A' },
  heroContent: { flex: 1, padding: 20 }, heroSpacer: { minHeight: 24, flex: 1 },
  dailyBadge: { alignSelf: 'flex-start', backgroundColor: c.action, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  dailyBadgeText: { color: isDark ? c.onHeroAction : 'white', fontFamily: fonts.heading, fontSize: 12, lineHeight: 17 },
  watermark: { position: 'absolute', top: 16, right: 18, opacity: 0.14 },
  heroTitle: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: c.onHero, marginBottom: 12 },
  heroTitleCompact: { fontSize: 27, lineHeight: 34 },
  duration: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }, heroMeta: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 18, color: c.onHero },
  heroActions: { flexDirection: 'row', gap: 10 }, stack: { flexDirection: 'column' },
  primaryAction: { flex: 1.25, borderRadius: 12, overflow: 'hidden', minHeight: 52 },
  watchButton: { flex: 1, flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingVertical: 14, justifyContent: 'center', alignItems: 'center' },
  playIcon: { marginLeft: 2 },
  watchLabel: { flexShrink: 1, textAlign: 'center', fontFamily: fonts.heading, fontSize: 15, lineHeight: 22, color: c.onHeroAction },
  readButton: { flex: 1, flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingVertical: 14, minHeight: 52, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  stackedAction: { flex: 0 },
  readLabel: { flexShrink: 1, textAlign: 'center', fontFamily: fonts.heading, fontSize: 15, lineHeight: 22, color: c.onHero },
  softShadow: { shadowColor: isDark ? '#000000' : '#584A37', shadowOpacity: isDark ? 0.35 : 0.06, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  verseCard: { marginTop: 12, borderRadius: 24, padding: 20, backgroundColor: c.surface, borderWidth: 1, borderColor: isDark ? c.moonlightBorder : '#F0ECE5' },
  verseHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }, shareButton: { marginTop: -10, marginBottom: -8, marginRight: -12 },
  verseBody: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' }, quote: { fontFamily: fonts.bold, fontSize: 54, lineHeight: 56, color: c.amber, marginTop: -1 },
  verse: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: c.text }, reference: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 18, color: c.muted, marginTop: 6 },
  section: { marginTop: 24 }, sectionHeading: { minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  sectionTitle: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 25, color: c.text, flexShrink: 1, letterSpacing: -0.35 },
  textAction: { minHeight: 48, justifyContent: 'center', paddingLeft: 4, flexShrink: 0, marginVertical: -8 }, link: { fontFamily: fonts.heading, color: c.action, fontSize: 12, lineHeight: 18 },
  recentCard: { borderRadius: 18, overflow: 'hidden', backgroundColor: isDark ? c.surfaceRaised : c.text },
  recentContent: { minHeight: 136, flexGrow: 1, justifyContent: 'flex-end', padding: 12 },
  formatIcon: { alignSelf: 'center', minHeight: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  recentTitle: { fontFamily: fonts.heading, fontSize: 13, lineHeight: 18, color: 'white' },
  communityCard: { borderRadius: 24, backgroundColor: c.surface, borderWidth: 1, borderColor: isDark ? c.moonlightBorder : '#F0ECE5', paddingHorizontal: 12 },
  communityRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.divider },
  communityImage: { width: 62, height: 48, borderRadius: 12, backgroundColor: c.mint, borderWidth: StyleSheet.hairlineWidth, borderColor: controls.photoOutline },
  communityName: { fontFamily: fonts.heading, fontSize: 13, lineHeight: 19, color: c.text },
  pending: { fontFamily: fonts.medium, color: isDark ? '#F7CA73' : '#855C08', fontSize: 10, lineHeight: 16, marginTop: 3 },
  neutralBadge: { backgroundColor: isDark ? c.surfaceRaised : '#F0EFEB', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, maxWidth: 90 },
  badgeText: { fontFamily: fonts.medium, fontSize: 10, lineHeight: 15, color: c.muted },
  eventCard: { marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.surface, padding: 12, borderRadius: 24, borderWidth: 1, borderColor: isDark ? c.moonlightBorder : '#F0ECE5' },
  eventImage: { width: 76, height: 76, borderRadius: 12, backgroundColor: c.amberSurface, borderWidth: StyleSheet.hairlineWidth, borderColor: controls.photoOutline },
  eventBadge: { alignSelf: 'flex-start', backgroundColor: c.amberSurface, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 4 },
  eventBadgeText: { fontFamily: fonts.medium, fontSize: 10, lineHeight: 16, color: c.amberText }, eventTitle: { fontFamily: fonts.heading, fontSize: 15, lineHeight: 22, color: c.text },
  eventMeta: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: c.muted },
  library: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 20 }, libraryTitle: { fontFamily: fonts.heading, fontSize: 15, lineHeight: 22, color: c.text },
  demoNote: { fontFamily: fonts.body, fontSize: 10, lineHeight: 16, color: c.muted, textAlign: 'center', marginTop: 4 },
  navShell: { position: 'absolute', maxWidth: 560, alignSelf: 'center', borderRadius: 36, borderWidth: 1, borderColor: c.navBorder, shadowColor: isDark ? '#000000' : '#504330', shadowOpacity: isDark ? 0.35 : 0.14, shadowRadius: 20, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  navHidden: { opacity: 0, pointerEvents: 'none' },
  navGlass: { borderRadius: 36, overflow: 'hidden', backgroundColor: c.navGlass },
  navRow: { flexDirection: 'row', alignItems: 'center', padding: 4 },
  navItem: { flex: 1, minWidth: controls.touchSize, height: 62, alignItems: 'center', justifyContent: 'center', gap: 3, position: 'relative' },
  navActiveCircle: { position: 'absolute', backgroundColor: c.mint, alignSelf: 'center' },
  navLabel: { width: '100%', fontFamily: fonts.heading, fontSize: 9.5, lineHeight: 13, color: c.muted, textAlign: 'center' },
  navLabelSelected: { color: c.action, fontFamily: fonts.bold },
  pressed: { opacity: controls.pressedOpacity },
  modalRoot: { flex: 1, justifyContent: 'flex-end' }, scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(5,9,16,0.65)' },
  sheet: { backgroundColor: isDark ? c.surfaceRaised : c.canvas, borderTopLeftRadius: 32, borderTopRightRadius: 32, width: '100%', maxWidth: 600, alignSelf: 'center', overflow: 'hidden' },
  sheetHandle: { width: 36, height: 4, backgroundColor: c.divider, borderRadius: 4, alignSelf: 'center', marginTop: 12 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 24, paddingRight: 12, paddingVertical: 8 }, sheetBody: { paddingHorizontal: 24, paddingBottom: 24, gap: 12 },
  detailImage: { width: '100%', height: 200, borderRadius: 24, backgroundColor: c.mint },
  detailTitle: { fontFamily: fonts.bold, fontSize: 23, lineHeight: 30, color: c.text, marginTop: 8 },
  detailMeta: { fontFamily: fonts.body, fontSize: 12, lineHeight: 19, color: c.muted }, detailBody: { fontFamily: fonts.body, fontSize: 15, lineHeight: 25, color: c.text },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomColor: c.divider, borderBottomWidth: StyleSheet.hairlineWidth },
  accountAction: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, borderBottomColor: c.divider, borderBottomWidth: StyleSheet.hairlineWidth },
  accountError: { fontFamily: fonts.body, fontSize: 13, lineHeight: 20, color: c.critical },
  sheetButton: { backgroundColor: c.action, flexDirection: 'row', gap: 10, minHeight: 52, padding: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 12 }, sheetButtonLabel: { fontFamily: fonts.heading, fontSize: 14, color: isDark ? c.onHeroAction : 'white' },
  sheetButtonDestructive: { backgroundColor: c.critical }, sheetButtonDestructiveLabel: { color: c.onCritical },
  infoLine: { flexDirection: 'row', alignItems: 'center', gap: 12 }, infoPanel: { backgroundColor: c.surface, padding: 16, borderRadius: 18, gap: 8 }, empty: { alignItems: 'center', paddingVertical: 24, gap: 16 },
  });
}
