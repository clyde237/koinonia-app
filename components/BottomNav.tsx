/** @jsxImportSource react */
import { memo, useMemo, type ComponentProps } from 'react';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { BookOpen, CirclePlay, Home, Settings, Users } from 'lucide-react-native';
import { controls, fonts, type ThemeColors } from '../lib/theme';
import { useTheme } from '../lib/ThemeContext';

export type NavTabId = 'home' | 'breakfasts' | 'groups' | 'bible' | 'settings';

export const NAV_TABS = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'breakfasts', label: 'Breakfasts', icon: CirclePlay },
  { id: 'groups', label: 'Groupes', icon: Users },
  { id: 'bible', label: 'Bible', icon: BookOpen },
  { id: 'settings', label: 'Réglages', icon: Settings },
] as const;

export const bottomNavOffset = (bottomInset: number) => Math.max(12, bottomInset + 8);

export interface BottomNavProps {
  currentTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  blurTarget?: ComponentProps<typeof BlurView>['blurTarget'];
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
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const gutter = width < 370 ? 12 : 20;
  const availableWidth = width - insets.left - insets.right;
  const navWidth = Math.min(availableWidth - 2 * gutter, 560);
  const bottom = bottomNavOffset(insets.bottom);
  const canBlur = !reduceTransparency && (Platform.OS === 'ios'
    || (Platform.OS === 'android' && Number(Platform.Version) >= 31 && Boolean(blurTarget)));
  const s = useMemo(() => createNavStyles(c, isDark), [c, isDark]);

  return (
    <View
      pointerEvents={isHidden ? 'none' : 'auto'}
      accessibilityElementsHidden={isHidden}
      importantForAccessibility={isHidden ? 'no-hide-descendants' : 'auto'}
      onLayout={event => onLayoutHeight?.(event.nativeEvent.layout.height)}
      style={[s.shell, { width: navWidth, left: insets.left + (availableWidth - navWidth) / 2, bottom }, isHidden && s.hidden]}
    >
      <View style={[s.surface, !canBlur && s.opaque]}>
        {canBlur && !isHidden && (
          <BlurView
            pointerEvents="none"
            blurTarget={blurTarget}
            blurMethod="dimezisBlurViewSdk31Plus"
            intensity={55}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        )}
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, canBlur && s.tint]} />
        <View accessibilityRole="tablist" accessibilityLabel="Navigation principale" style={s.row}>
          {NAV_TABS.map(tab => {
            const selected = currentTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                accessibilityRole="tab"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected }}
                onPress={() => onSelectTab(tab.id)}
                style={({ pressed }) => [s.item, pressed && s.pressed]}
              >
                <View pointerEvents="none" style={[s.indicator, selected && s.indicatorSelected]}>
                  <tab.icon size={24} color={selected ? c.action : c.muted} strokeWidth={selected ? 2 : controls.iconStroke} />
                </View>
                <Text
                  numberOfLines={fontScale > 1.2 ? undefined : 1}
                  adjustsFontSizeToFit={fontScale <= 1.2}
                  minimumFontScale={0.75}
                  style={[s.label, selected && s.labelSelected]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
});

function createNavStyles(c: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    shell: {
      position: 'absolute',
      borderRadius: 28,
      shadowColor: c.cardShadow,
      shadowOpacity: isDark ? 0.38 : 0.16,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
    },
    hidden: { opacity: 0 },
    surface: { borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: isDark ? c.moonlightBorder : c.divider },
    opaque: { backgroundColor: c.surface },
    tint: { backgroundColor: c.navGlass },
    row: { flexDirection: 'row', alignItems: 'stretch', paddingHorizontal: 4, paddingVertical: 5 },
    item: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      minWidth: 0,
      minHeight: 62,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 3,
      gap: 3,
    },
    indicator: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    indicatorSelected: { backgroundColor: c.mint },
    label: { width: '100%', fontFamily: fonts.heading, fontSize: 11, color: c.muted, textAlign: 'center', includeFontPadding: false },
    labelSelected: { color: c.action, fontFamily: fonts.bold },
    pressed: { opacity: controls.pressedOpacity },
  });
}
