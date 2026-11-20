import React, { memo, type ReactNode } from 'react';
import {
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { ArrowLeft, Bell, Moon, Search, Sun } from 'lucide-react-native';
import { controls, fonts, type ThemeColors } from '../lib/theme';
import { useTheme } from '../lib/ThemeContext';

export interface AppHeaderProps {
  /** 'title' (default) shows back button + title/badge; 'logo' shows official brand wordmark */
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
  unreadNotifCount = 0,
  onOpenProfile,
  profilePhoto,
  photoHeaders,
  profileInitials = 'K',
  rightActions,
  style,
}: AppHeaderProps) {
  const { isDark, colors: c, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();
  const compact = width < 370;
  const s = createHeaderStyles(c, isDark);

  return (
    <View style={[s.headerRow, style]}>
      {/* Left side: either Logo or (Back + Title + Badge) */}
      {variant === 'logo' ? (
        <View style={s.logoContainer}>
          <Image
            source={
              isDark
                ? require('../assets/logo-koinonia_w.png')
                : require('../assets/logo-koinonia.png')
            }
            resizeMode="contain"
            accessibilityLabel="Koinonia"
            style={[s.logo, compact && s.logoCompact]}
          />
        </View>
      ) : (
        <View style={s.headerLeft}>
          {onBack && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={backAccessibilityLabel}
              hitSlop={6}
              onPress={onBack}
              style={({ pressed }) => [s.iconBtn, pressed && s.pressed]}
            >
              <ArrowLeft size={20} color={c.text} strokeWidth={controls.iconStroke} />
            </Pressable>
          )}

          <View style={s.titleBox}>
            <View style={s.titleRow}>
              {title ? (
                <Text
                  accessibilityRole="header"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={s.pageTitle}
                >
                  {title}
                </Text>
              ) : null}

              {badgeLabel ? (
                <View style={s.badge}>
                  <Text numberOfLines={1} style={s.badgeText}>
                    {badgeLabel}
                  </Text>
                </View>
              ) : null}
            </View>

            {subtitle ? (
              <Text numberOfLines={1} ellipsizeMode="tail" style={s.subtitle}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
      )}

      {/* Right side: standard actions */}
      <View style={s.headerRight}>
        {showThemeToggle && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isDark ? 'Passer en mode jour' : 'Passer en mode nuit'}
            hitSlop={6}
            onPress={toggleTheme}
            style={({ pressed }) => [s.iconBtn, pressed && s.pressed]}
          >
            {isDark ? (
              <Sun size={19} color={c.action} strokeWidth={controls.iconStroke} />
            ) : (
              <Moon size={19} color={c.text} strokeWidth={controls.iconStroke} />
            )}
          </Pressable>
        )}

        {searchAction && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={searchAction.accessibilityLabel}
            accessibilityState={{
              expanded: searchAction.active,
              disabled: searchAction.disabled,
            }}
            disabled={searchAction.disabled}
            hitSlop={6}
            onPress={searchAction.onPress}
            style={({ pressed }) => [
              s.iconBtn,
              searchAction.active && s.iconBtnActive,
              searchAction.disabled && s.disabled,
              pressed && s.pressed,
            ]}
          >
            <Search
              size={19}
              color={searchAction.active ? c.action : c.text}
              strokeWidth={controls.iconStroke}
            />
          </Pressable>
        )}

        {onOpenNotifications && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Notifications, ${unreadNotifCount > 0 ? `${unreadNotifCount} nouvelles` : 'aucune nouvelle'}`}
            hitSlop={6}
            onPress={onOpenNotifications}
            style={({ pressed }) => [s.iconBtn, pressed && s.pressed]}
          >
            <Bell size={19} color={c.text} strokeWidth={controls.iconStroke} />
            {unreadNotifCount > 0 && <View style={s.bellBadge} />}
          </Pressable>
        )}

        {onOpenProfile && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mon profil"
            hitSlop={6}
            onPress={onOpenProfile}
            style={({ pressed }) => [s.avatarBtn, pressed && s.pressed]}
          >
            {profilePhoto ? (
              <Image
                source={{ uri: profilePhoto, headers: photoHeaders }}
                style={s.avatarImage}
              />
            ) : (
              <Text style={s.avatarInitials}>{profileInitials}</Text>
            )}
          </Pressable>
        )}

        {rightActions}
      </View>
    </View>
  );
});

function createHeaderStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      minHeight: 52,
      gap: 10,
    },
    logoContainer: {
      flexShrink: 1,
      justifyContent: 'center',
    },
    logo: {
      width: 172,
      height: 38,
    },
    logoCompact: {
      width: 142,
    },
    headerLeft: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    titleBox: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      flexShrink: 1,
    },
    pageTitle: {
      fontFamily: fonts.bold,
      fontSize: 19,
      lineHeight: 24,
      color: c.text,
      flexShrink: 1,
      letterSpacing: -0.2,
      includeFontPadding: false,
      textAlignVertical: 'center',
    },
    badge: {
      backgroundColor: c.mint,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      alignSelf: 'center',
    },
    badgeText: {
      fontFamily: fonts.medium,
      fontSize: 10,
      lineHeight: 14,
      color: c.action,
      includeFontPadding: false,
      textAlignVertical: 'center',
    },
    subtitle: {
      fontFamily: fonts.body,
      fontSize: 11.5,
      lineHeight: 16,
      color: c.muted,
      marginTop: 1,
      includeFontPadding: false,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flexShrink: 0,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: isDark ? c.moonlightBorder : c.divider,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    iconBtnActive: {
      backgroundColor: c.mint,
      borderColor: c.action,
    },
    disabled: {
      opacity: 0.45,
    },
    pressed: {
      opacity: controls.pressedOpacity,
    },
    bellBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.amber,
      borderWidth: 1.5,
      borderColor: c.surface,
    },
    avatarBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.mint,
      borderWidth: 1.5,
      borderColor: isDark ? c.action : 'white',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarInitials: {
      fontFamily: fonts.heading,
      fontSize: 14,
      color: c.action,
    },
  });
}
