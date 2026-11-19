/** @jsxImportSource react */
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
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
  Globe,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Moon,
  Phone,
  Settings,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Type,
  User,
  Volume2,
  WifiOff,
  X,
} from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { FontSizeMode, BIBLE_FONT_SIZES } from './BibleScreen';
import { controls, fonts, homeTheme as c } from '../lib/theme';

export type SettingsScreenProps = {
  name: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  church?: string;
  noChurch?: boolean;
  period?: string;
  profilePhoto: string | null;
  photoHeaders?: Record<string, string>;
  emailVerified: boolean;
  breakfastNotifications: boolean;
  communityNotifications: boolean;
  busy: boolean;
  accountError: string;
  navHeight?: number;
  bibleFontSize?: FontSizeMode;
  onChangeBibleFontSize?: (size: FontSizeMode) => void;
  onBack?: () => void;
  onSignOut: () => void;
  onChangePassword: () => void;
  onEditProfile: () => void;
  onVerifyEmail: () => void;
  onOpenNotifications?: () => void;
};

export function SettingsScreen({
  name,
  email = '',
  phone = '',
  country = '',
  city = '',
  church = '',
  noChurch = false,
  period = "Aujourd'hui",
  profilePhoto,
  photoHeaders,
  emailVerified,
  breakfastNotifications: initialBreakfastNotifs,
  communityNotifications: initialCommunityNotifs,
  busy,
  accountError,
  navHeight = 80,
  bibleFontSize = 'medium',
  onChangeBibleFontSize,
  onBack,
  onSignOut,
  onChangePassword,
  onEditProfile,
  onVerifyEmail,
  onOpenNotifications,
}: SettingsScreenProps) {
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const compact = width < 370;
  const gutter = compact ? 16 : 20;

  // Notification toggles
  const [breakfastNotifs, setBreakfastNotifs] = useState(initialBreakfastNotifs);
  const [communityNotifs, setCommunityNotifs] = useState(initialCommunityNotifs);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [offlineSync, setOfflineSync] = useState(true);

  // Bible reading font size preference
  const currentBibleFontSize = bibleFontSize || 'medium';
  const handleFontSizeChange = (mode: FontSizeMode) => {
    onChangeBibleFontSize?.(mode);
  };

  const initials = name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'K';
  const displayLocation = [city, country].filter(Boolean).join(', ');

  const handleSignOutConfirm = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter de votre compte Koinonia ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: onSignOut,
        },
      ]
    );
  };

  return (
    <View style={s.root}>
      {/* Top Header Bar */}
      <View style={[s.header, { paddingHorizontal: gutter }]}>
        <View style={s.headerLeft}>
          {onBack && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retour à l'accueil"
              onPress={onBack}
              style={({ pressed }) => [s.backBtn, pressed && s.pressed]}
            >
              <ArrowLeft size={22} color={c.text} strokeWidth={1.5} />
            </Pressable>
          )}
          <View style={s.headerTitleBlock}>
            <Text accessibilityRole="header" style={s.headerTitle}>Réglages</Text>
            <Text style={s.headerSubtitle}>Profil & préférences</Text>
          </View>
        </View>

        <View style={s.headerRight}>
          {onOpenNotifications && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ouvrir les notifications"
              onPress={onOpenNotifications}
              style={({ pressed }) => [s.iconBtn, pressed && s.pressed]}
            >
              <Bell size={21} color={c.text} strokeWidth={1.5} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          s.scrollContent,
          { paddingHorizontal: gutter, paddingBottom: navHeight + Math.max(insets.bottom, 16) + 64 },
        ]}
      >
        {/* HERO PROFILE CARD */}
        <View style={[s.profileCard, s.cardShadow]}>
          <LinearGradient
            colors={['#0F3835', '#006B65']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.profileGradient}
          >
            {/* Watermark flame */}
            <View pointerEvents="none" style={s.flameWatermark}>
              <Svg width={90} height={120} viewBox="200 0 700 1000">
                <Path
                  fill="white"
                  opacity={0.12}
                  d="M598 0C501 52 422 175 434 292C439 370 477 461 470 521C464 572 430 592 388 590C320 587 265 526 281 394C229 481 205 576 210 669C218 869 348 986 556 984C737 983 877 866 879 686C883 523 821 406 690 291C590 203 531 105 598 0Z"
                />
              </Svg>
            </View>

            <View style={s.profileTopRow}>
              <View style={s.avatarContainer}>
                {profilePhoto ? (
                  <Image
                    source={{ uri: profilePhoto, headers: photoHeaders }}
                    style={s.avatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={s.avatarPlaceholder}>
                    <Text style={s.avatarInitialsText}>{initials}</Text>
                  </View>
                )}
                <View style={s.avatarBadge}>
                  <Sparkles size={11} color="white" strokeWidth={2} />
                </View>
              </View>

              <View style={s.profileDetails}>
                <Text style={s.userName}>{name || 'Mon Profil'}</Text>
                {displayLocation ? (
                  <View style={s.locationRow}>
                    <MapPin size={13} color="#DCECE9" strokeWidth={1.5} />
                    <Text style={s.userLocation}>{displayLocation}</Text>
                  </View>
                ) : null}
                <View style={s.memberPill}>
                  <Text style={s.memberPillText}>Membre Koinonia</Text>
                </View>
              </View>
            </View>

            {/* Email verification status bar inside Hero */}
            <View style={s.emailStatusBanner}>
              <View style={s.emailStatusLeft}>
                {emailVerified ? (
                  <ShieldCheck size={16} color="#7AE0CD" strokeWidth={1.8} />
                ) : (
                  <Mail size={16} color={c.amber} strokeWidth={1.8} />
                )}
                <Text style={s.emailStatusText} numberOfLines={1}>
                  {email || (emailVerified ? 'Adresse vérifiée' : 'Adresse non vérifiée')}
                </Text>
              </View>

              {!emailVerified && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Vérifier mon adresse e-mail"
                  disabled={busy}
                  onPress={onVerifyEmail}
                  style={({ pressed }) => [s.verifyEmailBtn, pressed && s.pressed]}
                >
                  <Text style={s.verifyEmailBtnText}>Vérifier</Text>
                </Pressable>
              )}
            </View>

            {/* Edit Profile Action */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Modifier mon profil et mes coordonnées"
              disabled={busy}
              onPress={onEditProfile}
              style={({ pressed }) => [s.editProfileBannerBtn, pressed && s.pressed]}
            >
              <Text style={s.editProfileBannerBtnText}>Modifier mon profil & mes infos</Text>
              <ChevronRight size={16} color="white" strokeWidth={2} />
            </Pressable>
          </LinearGradient>
        </View>

        {/* SECTION 1: INFORMATIONS PERSONNELLES & ÉGLISE */}
        <View style={s.sectionBlock}>
          <Text style={s.sectionHeader}>Informations personnelles</Text>
          <View style={[s.sectionCard, s.cardShadow]}>
            {/* Phone Row */}
            {phone ? (
              <View style={s.cardRow}>
                <View style={s.rowIconBox}>
                  <Phone size={18} color={c.action} strokeWidth={1.5} />
                </View>
                <View style={s.rowContent}>
                  <Text style={s.rowLabel}>Téléphone</Text>
                  <Text numberOfLines={1} ellipsizeMode="tail" style={s.rowValue}>{phone}</Text>
                </View>
              </View>
            ) : null}

            {phone ? <View style={s.cardDivider} /> : null}

            {/* Church Row */}
            <View style={s.cardRow}>
              <View style={s.rowIconBox}>
                <Globe size={18} color={c.action} strokeWidth={1.5} />
              </View>
              <View style={s.rowContent}>
                <Text style={s.rowLabel}>Église ou assemblée</Text>
                <Text numberOfLines={1} ellipsizeMode="tail" style={s.rowValue}>
                  {noChurch ? 'Aucune assemblée spécifique' : (church || 'Non renseignée')}
                </Text>
              </View>
            </View>

            <View style={s.cardDivider} />

            {/* Breakfasts archive period */}
            <View style={s.cardRow}>
              <View style={s.rowIconBox}>
                <Calendar size={18} color={c.action} strokeWidth={1.5} />
              </View>
              <View style={s.rowContent}>
                <Text style={s.rowLabel}>Historique des Breakfasts</Text>
                <Text style={s.rowValue}>{period}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SECTION 2: NOTIFICATIONS & ALERTES */}
        <View style={s.sectionBlock}>
          <Text style={s.sectionHeader}>Notifications & Rappels</Text>
          <View style={[s.sectionCard, s.cardShadow]}>
            {/* Breakfasts daily meditation toggle */}
            <View style={s.toggleRow}>
              <View style={s.rowIconBox}>
                <Sparkles size={18} color={c.action} strokeWidth={1.5} />
              </View>
              <View style={s.rowContent}>
                <Text style={s.rowTitle}>Breakfast quotidien</Text>
                <Text style={s.rowSubtitle}>
                  Rappel spirituel chaque matin pour la nouvelle méditation
                </Text>
              </View>
              <Switch
                accessibilityLabel="Notifications du Breakfast quotidien"
                value={breakfastNotifs}
                onValueChange={setBreakfastNotifs}
                trackColor={{ false: '#DFE5E4', true: c.mint }}
                thumbColor={breakfastNotifs ? c.action : '#FFFFFF'}
              />
            </View>

            <View style={s.cardDivider} />

            {/* Communities toggle */}
            <View style={s.toggleRow}>
              <View style={s.rowIconBox}>
                <Bell size={18} color={c.action} strokeWidth={1.5} />
              </View>
              <View style={s.rowContent}>
                <Text style={s.rowTitle}>Communautés & Groupes</Text>
                <Text style={s.rowSubtitle}>
                  Messages et requêtes de prière partagées
                </Text>
              </View>
              <Switch
                accessibilityLabel="Notifications des communautés"
                value={communityNotifs}
                onValueChange={setCommunityNotifs}
                trackColor={{ false: '#DFE5E4', true: c.mint }}
                thumbColor={communityNotifs ? c.action : '#FFFFFF'}
              />
            </View>

            <View style={s.cardDivider} />

            {/* Sound toggle */}
            <View style={s.toggleRow}>
              <View style={s.rowIconBox}>
                <Volume2 size={18} color={c.action} strokeWidth={1.5} />
              </View>
              <View style={s.rowContent}>
                <Text style={s.rowTitle}>Son discret des alertes</Text>
                <Text style={s.rowSubtitle}>
                  Sonnerie douce adaptée aux moments de dévotion
                </Text>
              </View>
              <Switch
                accessibilityLabel="Son discret des alertes"
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: '#DFE5E4', true: c.mint }}
                thumbColor={soundEnabled ? c.action : '#FFFFFF'}
              />
            </View>
          </View>
        </View>

        {/* SECTION 3: LECTURE & PRÉFÉRENCES SPIRITUELLES */}
        <View style={s.sectionBlock}>
          <Text style={s.sectionHeader}>Lecture & Bible</Text>
          <View style={[s.sectionCard, s.cardShadow]}>
            {/* Version Bible */}
            <View style={s.cardRow}>
              <View style={s.rowIconBox}>
                <BookOpen size={18} color={c.action} strokeWidth={1.5} />
              </View>
              <View style={s.rowContent}>
                <Text style={s.rowLabel}>Version biblique active</Text>
                <Text style={s.rowValue}>Louis Segond 1910 (LSG)</Text>
              </View>
              <View style={s.pillBadge}>
                <Text style={s.pillBadgeText}>Français</Text>
              </View>
            </View>

            <View style={s.cardDivider} />

            {/* Taille du texte biblique */}
            <View style={s.fontSizeConfigBlock}>
              <View style={s.fontSizeConfigHeader}>
                <View style={s.rowIconBox}>
                  <Type size={18} color={c.action} strokeWidth={1.5} />
                </View>
                <View style={s.rowContent}>
                  <Text style={s.rowTitle}>Taille du texte biblique</Text>
                  <Text style={s.rowSubtitle}>
                    Ajuste la taille d’affichage des versets dans la Bible
                  </Text>
                </View>
                <View style={s.pillBadge}>
                  <Text style={s.pillBadgeText}>
                    {BIBLE_FONT_SIZES[currentBibleFontSize].label}
                  </Text>
                </View>
              </View>

              {/* Les 4 options de taille de police */}
              <View accessibilityRole="radiogroup" accessibilityLabel="Taille du texte biblique" style={s.fontSizeSelectorRow}>
                {(['small', 'medium', 'large', 'xlarge'] as FontSizeMode[]).map(mode => {
                  const active = currentBibleFontSize === mode;
                  return (
                    <Pressable
                      key={mode}
                      accessibilityRole="radio"
                      accessibilityLabel={`Taille ${BIBLE_FONT_SIZES[mode].text} points`}
                      accessibilityState={{ checked: active }}
                      onPress={() => handleFontSizeChange(mode)}
                      style={({ pressed }) => [
                        s.fontSizeSelectorBtn,
                        fontScale > 1.3 && s.fontSizeSelectorBtnWide,
                        active && s.fontSizeSelectorBtnActive,
                        pressed && s.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          s.fontSizeSelectorBtnText,
                          active && s.fontSizeSelectorBtnTextActive,
                        ]}
                      >
                        {BIBLE_FONT_SIZES[mode].label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Aperçu en temps réel */}
              <View style={s.fontSizePreviewBox}>
                <Text
                  style={[
                    s.fontSizePreviewText,
                    {
                      fontSize: BIBLE_FONT_SIZES[currentBibleFontSize].text,
                      lineHeight: BIBLE_FONT_SIZES[currentBibleFontSize].line,
                    },
                  ]}
                >
                  « Ta parole est une lampe à mes pieds, Et une lumière sur mon sentier. »
                </Text>
                <Text style={s.fontSizePreviewRef}>Psaume 119.105 (LSG)</Text>
              </View>
            </View>

            <View style={s.cardDivider} />

            {/* Offline sync toggle */}
            <View style={s.toggleRow}>
              <View style={s.rowIconBox}>
                <WifiOff size={18} color={c.action} strokeWidth={1.5} />
              </View>
              <View style={s.rowContent}>
                <Text style={s.rowTitle}>Lecture hors-ligne</Text>
                <Text style={s.rowSubtitle}>
                  Conserver les derniers Breakfasts et chapitres lus sur l’appareil
                </Text>
              </View>
              <Switch
                accessibilityLabel="Lecture hors ligne"
                value={offlineSync}
                onValueChange={setOfflineSync}
                trackColor={{ false: '#DFE5E4', true: c.mint }}
                thumbColor={offlineSync ? c.action : '#FFFFFF'}
              />
            </View>
          </View>
        </View>

        {/* SECTION 4: SÉCURITÉ DU COMPTE */}
        <View style={s.sectionBlock}>
          <Text style={s.sectionHeader}>Sécurité</Text>
          <View style={[s.sectionCard, s.cardShadow]}>
            {/* Change password button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Changer mon mot de passe"
              disabled={busy}
              onPress={onChangePassword}
              style={({ pressed }) => [s.actionRow, pressed && s.pressed]}
            >
              <View style={s.rowIconBox}>
                <Lock size={18} color={c.action} strokeWidth={1.5} />
              </View>
              <View style={s.rowContent}>
                <Text style={s.actionRowTitle}>Changer le mot de passe</Text>
                <Text style={s.actionRowSubtitle}>
                  Sécurisez l'accès à votre compte Koinonia
                </Text>
              </View>
              <ChevronRight size={18} color={c.muted} strokeWidth={1.5} />
            </Pressable>

            <View style={s.cardDivider} />

            {/* Privacy note */}
            <View style={s.cardRow}>
              <View style={s.rowIconBox}>
                <Shield size={18} color={c.action} strokeWidth={1.5} />
              </View>
              <View style={s.rowContent}>
                <Text style={s.rowLabel}>Confidentialité</Text>
                <Text style={s.privacyNotice}>
                  Vos données de profil, requêtes et notes personnelles sont chiffrées et protégées.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* SECTION 5: À PROPOS & MISSION */}
        <View style={s.sectionBlock}>
          <Text style={s.sectionHeader}>À propos</Text>
          <View style={[s.sectionCard, s.cardShadow]}>
            <View style={s.aboutRow}>
              <View style={s.appEmblem}>
                <Sparkles size={20} color={c.action} strokeWidth={1.5} />
              </View>
              <View style={s.rowContent}>
                <Text style={s.appName}>Koinonia</Text>
                <Text style={s.appVersion}>Version 1.0.0 · Bêta</Text>
              </View>
            </View>

            <Text style={s.missionText}>
              Koinonia est un espace spirituel conçu pour nourrir votre intimité quotidienne avec Dieu et vivre la communion fraternelle au travers des Breakfasts, de la Sainte Bible et des communautés de prière.
            </Text>
          </View>
        </View>

        {/* Error notice if any */}
        {accountError ? (
          <View style={s.errorAlertBox}>
            <Text accessibilityRole="alert" style={s.errorAlertText}>
              {accountError}
            </Text>
          </View>
        ) : null}

        {/* SECTION 6: DÉCONNEXION (DESTRUCTIVE RED BUTTON) */}
        <View style={s.signOutSection}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Se déconnecter de votre compte"
            accessibilityState={{ disabled: busy, busy: busy }}
            disabled={busy}
            onPress={handleSignOutConfirm}
            style={({ pressed }) => [
              s.signOutButton,
              pressed && s.signOutButtonPressed,
              busy && s.signOutButtonDisabled,
            ]}
          >
            <LogOut size={20} color="white" strokeWidth={1.8} style={s.signOutIcon} />
            <Text style={s.signOutButtonText}>
              {busy ? 'Déconnexion en cours…' : 'Se déconnecter'}
            </Text>
          </Pressable>
          <Text style={s.signOutSubnote}>
            Vous pourrez vous reconnecter à tout moment avec vos identifiants.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: c.canvas,
  },
  pressed: {
    opacity: controls.pressedOpacity,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: c.divider,
    backgroundColor: c.canvas,
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitleBlock: { flex: 1, minWidth: 0 },
  backBtn: {
    width: controls.touchSize,
    height: controls.touchSize,
    borderRadius: 24,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 26,
    color: c.text,
  },
  headerSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: c.muted,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
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

  scrollContent: {
    paddingTop: 16,
  },

  /* HERO PROFILE CARD */
  profileCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  cardShadow: {
    shadowColor: '#17302B',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  profileGradient: {
    padding: 20,
    position: 'relative',
  },
  flameWatermark: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 0,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    zIndex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: c.mint,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialsText: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: c.action,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: c.amber,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileDetails: {
    flex: 1,
  },
  userName: {
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 26,
    color: 'white',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  userLocation: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#DCECE9',
  },
  memberPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  memberPillText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: 'white',
  },

  /* Email Status Banner */
  emailStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    marginBottom: 12,
    zIndex: 1,
  },
  emailStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  emailStatusText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: 'white',
    flex: 1,
  },
  verifyEmailBtn: {
    backgroundColor: c.amber,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  verifyEmailBtnText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: '#3A2700',
  },

  /* Edit Profile Banner Button */
  editProfileBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: 10,
    zIndex: 1,
  },
  editProfileBannerBtnText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: 'white',
  },

  /* SECTIONS */
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontFamily: fonts.bold,
    fontSize: 13,
    letterSpacing: 0.5,
    color: c.muted,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: c.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.divider,
    overflow: 'hidden',
  },

  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F0F4F3',
    marginLeft: 54,
  },
  rowIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: c.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: c.divider,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: c.muted,
    marginBottom: 2,
  },
  rowValue: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: c.text,
  },
  rowTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: c.text,
    marginBottom: 2,
  },
  rowSubtitle: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: c.muted,
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  actionRowTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: c.text,
    marginBottom: 2,
  },
  actionRowSubtitle: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: c.muted,
  },

  pillBadge: {
    backgroundColor: c.mint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pillBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: c.action,
  },

  /* Bible Font Size Settings */
  fontSizeConfigBlock: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fontSizeConfigHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  fontSizeSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  fontSizeSelectorBtn: {
    flex: 1,
    minWidth: 0,
    minHeight: controls.touchSize,
    paddingHorizontal: 4,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: c.canvas,
    borderWidth: 1,
    borderColor: c.divider,
  },
  fontSizeSelectorBtnWide: { flexBasis: '44%' },
  fontSizeSelectorBtnActive: {
    backgroundColor: c.action,
    borderColor: c.action,
  },
  fontSizeSelectorBtnText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: c.text,
    textAlign: 'center',
  },
  fontSizeSelectorBtnTextActive: {
    fontFamily: fonts.bold,
    color: 'white',
  },
  fontSizePreviewBox: {
    backgroundColor: c.canvas,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: c.divider,
  },
  fontSizePreviewText: {
    fontFamily: fonts.body,
    color: c.text,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  fontSizePreviewRef: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: c.action,
    textAlign: 'right',
  },

  privacyNotice: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: c.muted,
  },

  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    paddingBottom: 8,
  },
  appEmblem: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: c.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: c.text,
  },
  appVersion: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: c.muted,
  },
  missionText: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 19,
    color: c.muted,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  /* Error box */
  errorAlertBox: {
    backgroundColor: '#FDECEB',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F5C6CB',
    marginBottom: 16,
  },
  errorAlertText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: '#721C24',
    textAlign: 'center',
  },

  /* SIGN OUT BUTTON (DESTRUCTIVE RED) */
  signOutSection: {
    marginTop: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  signOutButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#C93B2B',
    paddingVertical: 16,
    borderRadius: 16,
    minHeight: 52,
    shadowColor: '#C93B2B',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  signOutButtonPressed: {
    backgroundColor: '#A82E20',
  },
  signOutButtonDisabled: {
    opacity: 0.6,
  },
  signOutIcon: {
    marginRight: 2,
  },
  signOutButtonText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: 'white',
  },
  signOutSubnote: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: c.muted,
    marginTop: 10,
    textAlign: 'center',
  },
});
