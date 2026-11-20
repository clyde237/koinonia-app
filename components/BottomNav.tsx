import React, { memo, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import {
  BookOpen,
  CirclePlay,
  Home,
  Settings,
  Users,
} from 'lucide-react-native';
import { controls, fonts, type ThemeColors } from '../lib/theme';
import { useTheme } from '../lib/ThemeContext';

export type NavTabId = 'home' | 'breakfasts' | 'groups' | 'bible' | 'settings';

export interface NavTabItem {
  id: NavTabId;
  label: string;
  icon: typeof Home;
}

export const NAV_TABS: readonly NavTabItem[] = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'breakfasts', label: 'Breakfasts', icon: CirclePlay },
  { id: 'groups', label: 'Groupes', icon: Users },
  { id: 'bible', label: 'Bible', icon: BookOpen },
  { id: 'settings', label: 'Réglages', icon: Settings },
] as const;

export interface NavGlassContainerProps {
  isDark: boolean;
  c: ThemeColors;
  blurTarget: any;
  style?: any;
  reduceTransparency?: boolean;
  children: ReactNode;
}

export function NavGlassContainer({
  isDark,
  c,
  blurTarget,
  style,
  reduceTransparency,
  children,
}: NavGlassContainerProps) {
  return (
    <BlurView
      blurTarget={blurTarget}
      blurMethod="dimezisBlurView"
      intensity={isDark ? 65 : 75}
      tint={isDark ? 'dark' : 'light'}
      style={[style, reduceTransparency && { backgroundColor: c.surface }]}
    >
      {/* Reflet spéculaire fin en haut de la capsule (effet biseau de verre dépoli) */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 18,
          right: 18,
          height: 1,
          backgroundColor: isDark ? 'rgba(78, 234, 216, 0.32)' : 'rgba(255, 255, 255, 0.85)',
        }}
      />
      {children}
    </BlurView>
  );
}

export interface BottomNavProps {
  currentTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  blurTarget?: any;
  reduceTransparency?: boolean;
  isHidden?: boolean;
  onLayoutHeight?: (height: number) => void;
}

export const BottomNav = memo(function BottomNav({
  currentTab,
  onSelectTab,
  blurTarget,
  reduceTransparency,
  isHidden,
  onLayoutHeight,
}: BottomNavProps) {
  const { isDark, colors: c } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const compact = width < 370;
  const gutter = compact ? 16 : 20;
  const navWidth = Math.min(width - (compact ? 16 : 2 * gutter), 560);
  const bottom = Math.max(insets.bottom, 12);
  const s = createNavStyles(c, isDark);

  return (
    <View
      accessibilityRole="navigation"
      accessibilityLabel="Navigation principale"
      onLayout={e => onLayoutHeight?.(e.nativeEvent.layout.height)}
      importantForAccessibility={isHidden ? 'no-hide-descendants' : 'auto'}
      style={[
        s.navShell,
        { width: navWidth, left: (width - navWidth) / 2, bottom },
        isHidden && s.navHidden,
      ]}
    >
      <NavGlassContainer
        isDark={isDark}
        c={c}
        blurTarget={blurTarget}
        style={s.navGlass}
        reduceTransparency={reduceTransparency}
      >
        <View accessibilityRole="tablist" style={s.navRow}>
          {NAV_TABS.map(tab => {
            const selected = currentTab === tab.id;
            const circleSize = Math.min(Math.floor((navWidth - 8) / 5) - 4, 58);
            return (
              <Pressable
                key={tab.id}
                accessibilityRole="tab"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected }}
                onPress={() => onSelectTab(tab.id)}
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
                <tab.icon
                  size={21}
                  color={selected ? c.action : (isDark ? '#96A9C0' : c.muted)}
                  strokeWidth={controls.iconStroke}
                />
                <Text
                  numberOfLines={1}
                  style={[s.navLabel, selected && s.navLabelSelected]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </NavGlassContainer>
    </View>
  );
});

function createNavStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    navShell: {
      position: 'absolute',
      maxWidth: 560,
      alignSelf: 'center',
      borderRadius: 36,
      borderWidth: 1.2,
      borderColor: c.navBorder,
      shadowColor: isDark ? '#000000' : '#504330',
      shadowOpacity: isDark ? 0.45 : 0.12,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 6 },
      elevation: 10,
    },
    navHidden: {
      opacity: 0,
      pointerEvents: 'none',
    },
    navGlass: {
      borderRadius: 36,
      overflow: 'hidden',
      backgroundColor: c.navGlass,
    },
    navRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 4,
    },
    navItem: {
      flex: 1,
      minWidth: controls.touchSize,
      height: 62,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      position: 'relative',
    },
    navActiveCircle: {
      position: 'absolute',
      backgroundColor: c.mint,
      alignSelf: 'center',
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? 'rgba(78, 234, 216, 0.35)' : 'transparent',
    },
    navLabel: {
      width: '100%',
      fontFamily: fonts.heading,
      fontSize: 9.5,
      lineHeight: 13,
      color: isDark ? '#96A9C0' : c.muted,
      textAlign: 'center',
      textAlignVertical: 'center',
      includeFontPadding: false,
    },
    navLabelSelected: {
      color: c.action,
      fontFamily: fonts.bold,
    },
    pressed: {
      opacity: controls.pressedOpacity,
    },
  });
}
