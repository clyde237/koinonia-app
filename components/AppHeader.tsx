/** @jsxImportSource react */
import { memo, useMemo, useState, type ReactNode } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type AccessibilityState,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { ArrowLeft, Bell, Moon, Search, Sun } from 'lucide-react-native';
import { controls, fonts, type ThemeColors } from '../lib/theme';
import { useTheme } from '../lib/ThemeContext';

export interface AppHeaderProps {
  variant?: 'title' | 'logo';
  title?: string;
  subtitle?: string;
  badgeLabel?: string;
  onBack?: () => void;
  backAccessibilityLabel?: string;
  showThemeToggle?: boolean;
  searchAction?: {
    active: boolean;
    onPress: () => void;
    accessibilityLabel: string;
    disabled?: boolean;
  };
  onOpenNotifications?: () => void;
  unreadNotifCount?: number;
  onOpenProfile?: () => void;
  profilePhoto?: string;
  photoHeaders?: Record<string, string>;
  profileInitials?: string;
  rightActions?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

const actionGap = 8;
const identityGap = 12;
const iconSize = 24;
const iconStroke = 2;

type HeaderButtonProps = {
  label: string;
  onPress: () => void;
  styles: ReturnType<typeof createHeaderStyles>;
  active?: boolean;
  state?: AccessibilityState;
  children: ReactNode;
};

function HeaderButton({ label, onPress, styles: s, active, state, children }: HeaderButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={state}
      disabled={state?.disabled}
      onPress={onPress}
      style={({ pressed }) => [s.circle, active && s.active, state?.disabled && s.disabled, pressed && s.pressed]}
    >
      {children}
    </Pressable>
  );
}

export const AppHeader = memo(function AppHeader({
  variant = 'title',
  title,
  subtitle,
  badgeLabel,
  onBack,
  backAccessibilityLabel = 'Retour',
  showThemeToggle = true,
  searchAction,
  onOpenNotifications,
  unreadNotifCount,
  onOpenProfile,
  profilePhoto,
  photoHeaders,
  profileInitials = 'K',
  rightActions,
  style,
}: AppHeaderProps) {
  const { isDark, colors: c, toggleTheme } = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState<number>();
  const s = useMemo(() => createHeaderStyles(c, isDark), [c, isDark]);
  const isLogo = variant === 'logo';
  const actionCount = [showThemeToggle, searchAction, onOpenNotifications, onOpenProfile, rightActions].filter(Boolean).length;
  const sideWidth = actionCount * controls.touchSize + Math.max(0, actionCount - 1) * actionGap
    + (actionCount ? identityGap : 0) + (!isLogo && onBack ? controls.touchSize + identityGap : 0);
  const availableWidth = measuredWidth ?? width - 40;
  const stacked = !isLogo && availableWidth - sideWidth < 172 * fontScale;

  const back = !isLogo && onBack && (
    <HeaderButton label={backAccessibilityLabel} onPress={onBack} styles={s}>
      <ArrowLeft size={iconSize} color={c.text} strokeWidth={iconStroke} />
    </HeaderButton>
  );

  const identity = isLogo ? (
    <View style={s.logoContainer}>
      <Image
        source={isDark ? require('../assets/logo-koinonia_w.png') : require('../assets/logo-koinonia.png')}
        resizeMode="contain"
        accessibilityLabel="Koinonia"
        style={s.logo}
      />
    </View>
  ) : (
    <View style={stacked ? s.stackedIdentity : s.identity}>
      {title && <Text accessibilityRole="header" style={s.pageTitle}>{title}</Text>}
      {badgeLabel && <Text style={s.badge}>{badgeLabel}</Text>}
      {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <View style={style}>
      <View style={s.header} onLayout={event => setMeasuredWidth(event.nativeEvent.layout.width)}>
        <View style={s.row}>
          {back}
          {!stacked && identity}
          {actionCount > 0 && (
            <View style={[s.actions, stacked && s.actionsEnd]}>
              {showThemeToggle && (
                <HeaderButton label={isDark ? 'Passer en mode jour' : 'Passer en mode nuit'} onPress={toggleTheme} styles={s}>
                  {isDark
                    ? <Sun size={iconSize} color={c.action} strokeWidth={iconStroke} />
                    : <Moon size={iconSize} color={c.text} strokeWidth={iconStroke} />}
                </HeaderButton>
              )}
              {searchAction && (
                <HeaderButton
                  label={searchAction.accessibilityLabel}
                  onPress={searchAction.onPress}
                  styles={s}
                  active={searchAction.active}
                  state={{ expanded: searchAction.active, disabled: searchAction.disabled }}
                >
                  <Search size={iconSize} color={searchAction.active ? c.action : c.text} strokeWidth={iconStroke} />
                </HeaderButton>
              )}
              {onOpenNotifications && (
                <HeaderButton
                  label={unreadNotifCount ? `Notifications, ${unreadNotifCount} non lues` : 'Notifications'}
                  onPress={onOpenNotifications}
                  styles={s}
                >
                  <Bell size={iconSize} color={c.text} strokeWidth={iconStroke} />
                  {Boolean(unreadNotifCount) && <View style={s.bellBadge} />}
                </HeaderButton>
              )}
              {onOpenProfile && (
                <HeaderButton label="Mon profil" onPress={onOpenProfile} styles={s}>
                  {profilePhoto ? (
                    <Image source={{ uri: profilePhoto, headers: photoHeaders }} style={s.avatarImage} />
                  ) : (
                    <Text maxFontSizeMultiplier={1.3} style={s.avatarInitials}>{profileInitials}</Text>
                  )}
                </HeaderButton>
              )}
              {rightActions}
            </View>
          )}
        </View>
        {stacked && identity}
      </View>
    </View>
  );
});

function createHeaderStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    header: { paddingVertical: 10, rowGap: 8 },
    row: { flexDirection: 'row', alignItems: 'center', columnGap: identityGap },
    logoContainer: { flex: 1, minWidth: 0, justifyContent: 'center' },
    logo: { width: '100%', maxWidth: 172, height: 38 },
    identity: { flex: 1, minWidth: 0, gap: 3 },
    stackedIdentity: { gap: 3 },
    pageTitle: { fontFamily: fonts.bold, fontSize: 22, color: c.text, includeFontPadding: false },
    subtitle: { fontFamily: fonts.body, fontSize: 12, color: c.muted, includeFontPadding: false },
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: c.badgeBg,
      color: c.badgeText,
      fontFamily: fonts.medium,
      fontSize: 11,
      includeFontPadding: false,
    },
    actions: { flexDirection: 'row', alignItems: 'center', columnGap: actionGap, flexShrink: 0 },
    actionsEnd: { marginLeft: 'auto' },
    circle: {
      width: controls.touchSize,
      height: controls.touchSize,
      borderRadius: controls.touchSize / 2,
      backgroundColor: isDark ? c.surfaceRaised : c.surface,
      borderWidth: 1,
      borderColor: isDark ? c.moonlightBorder : c.divider,
      alignItems: 'center',
      justifyContent: 'center',
    },
    active: { backgroundColor: c.mint, borderColor: c.action },
    disabled: { opacity: 0.6 },
    pressed: { opacity: controls.pressedOpacity },
    bellBadge: {
      position: 'absolute',
      top: 7,
      right: 8,
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: c.amber,
      borderWidth: 1,
      borderColor: isDark ? c.surfaceRaised : c.surface,
    },
    avatarImage: { width: 40, height: 40, borderRadius: 20 },
    avatarInitials: { fontFamily: fonts.bold, fontSize: 16, color: c.action, includeFontPadding: false },
  });
}
