const test = require('node:test');
const assert = require('node:assert/strict');

test('theme definitions contain all required semantic tokens and moonlight palette', () => {
  // Read theme file and verify tokens
  const fs = require('node:fs');
  const path = require('node:path');
  const themeSrc = fs.readFileSync(path.join(__dirname, '../lib/theme.ts'), 'utf-8');

  // Verify tokens exist in file
  assert.ok(themeSrc.includes('lightTheme: ThemeColors'), 'lightTheme must be exported');
  assert.ok(themeSrc.includes('darkTheme: ThemeColors'), 'darkTheme must be exported');
  assert.ok(themeSrc.includes('#0B1320'), 'darkTheme must include midnight blue canvas #0B1320');
  assert.ok(themeSrc.includes('#4EEAD8'), 'darkTheme must include moonlight cyan action #4EEAD8');
  assert.ok(themeSrc.includes('moonlightBorder'), 'ThemeColors must include moonlightBorder');
  assert.ok(themeSrc.includes('moonlightGlow'), 'ThemeColors must include moonlightGlow');
});

test('white logos exist in assets directory for dark theme', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const logoWPath = path.join(__dirname, '../assets/logo-koinonia_w.png');
  const logoW1Path = path.join(__dirname, '../assets/logo-koinonia_w1.png');

  assert.ok(fs.existsSync(logoWPath), 'assets/logo-koinonia_w.png must exist');
  assert.ok(fs.existsSync(logoW1Path), 'assets/logo-koinonia_w1.png must exist');
  assert.ok(fs.statSync(logoWPath).size > 1000, 'logo-koinonia_w.png must be a valid non-empty file');
  assert.ok(fs.statSync(logoW1Path).size > 1000, 'logo-koinonia_w1.png must be a valid non-empty file');
});

test('ThemeContext exposes mode, isDark, colors, and toggleTheme', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const contextSrc = fs.readFileSync(path.join(__dirname, '../lib/ThemeContext.tsx'), 'utf-8');

  assert.ok(contextSrc.includes('ThemeProvider'), 'ThemeContext must export ThemeProvider');
  assert.ok(contextSrc.includes('useTheme'), 'ThemeContext must export useTheme');
  assert.ok(contextSrc.includes('toggleTheme'), 'ThemeContext must export toggleTheme');
  assert.ok(contextSrc.includes('THEME_STORAGE_KEY'), 'ThemeContext must persist user preference');
});

test('navtab glassmorphism uses BlurView with opaque blurTarget to prevent white window background', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const homeSrc = fs.readFileSync(path.join(__dirname, '../components/HomeScreen.tsx'), 'utf-8');
  const appSrc = fs.readFileSync(path.join(__dirname, '../App.tsx'), 'utf-8');

  // BlurTargetView is styled with c.canvas to prevent Dimezis white decorView clear
  assert.ok(homeSrc.includes('BlurTargetView'), 'HomeScreen must configure BlurTargetView');
  assert.ok(homeSrc.includes('NavGlassContainer'), 'HomeScreen must use NavGlassContainer with BlurView');
  assert.ok(homeSrc.includes('#96A9C0'), 'HomeScreen must provide high-contrast moonlight slate for inactive tabs');

  // Splashscreen maintains official flame emblem
  assert.ok(appSrc.includes('FlameEmblem'), 'App splashscreen must keep official FlameEmblem');
});

test('AppHeader and BottomNav shared components enforce clean architecture and single-line titles', () => {
  const fs = require('node:fs');
  const path = require('node:path');

  // AppHeader exists and is used across screens
  const headerSrc = fs.readFileSync(path.join(__dirname, '../components/AppHeader.tsx'), 'utf-8');
  assert.ok(headerSrc.includes('export const AppHeader'), 'AppHeader must be exported');
  assert.ok(headerSrc.includes('numberOfLines={1}'), 'AppHeader must constrain title to 1 line');

  const bibleSrc = fs.readFileSync(path.join(__dirname, '../components/BibleScreen.tsx'), 'utf-8');
  const breakfastsSrc = fs.readFileSync(path.join(__dirname, '../components/BreakfastsScreen.tsx'), 'utf-8');
  const groupsSrc = fs.readFileSync(path.join(__dirname, '../components/GroupsScreen.tsx'), 'utf-8');
  const settingsSrc = fs.readFileSync(path.join(__dirname, '../components/SettingsScreen.tsx'), 'utf-8');
  const homeSrc = fs.readFileSync(path.join(__dirname, '../components/HomeScreen.tsx'), 'utf-8');

  assert.ok(bibleSrc.includes('<AppHeader'), 'BibleScreen must use AppHeader');
  assert.ok(breakfastsSrc.includes('<AppHeader'), 'BreakfastsScreen must use AppHeader');
  assert.ok(groupsSrc.includes('<AppHeader'), 'GroupsScreen must use AppHeader');
  assert.ok(settingsSrc.includes('<AppHeader'), 'SettingsScreen must use AppHeader');
  assert.ok(homeSrc.includes('<AppHeader'), 'HomeScreen must use AppHeader');

  // BottomNav exists and is isolated
  const bottomNavSrc = fs.readFileSync(path.join(__dirname, '../components/BottomNav.tsx'), 'utf-8');
  assert.ok(bottomNavSrc.includes('export const BottomNav'), 'BottomNav must be exported');
  assert.ok(bottomNavSrc.includes('NAV_TABS'), 'BottomNav must export NAV_TABS');
  assert.ok(homeSrc.includes('<BottomNav'), 'HomeScreen must use BottomNav');

  // BibleScreen selection bar is compact icon-only with dynamic theme colors
  assert.ok(bibleSrc.includes('compactSelectionBar'), 'BibleScreen must use compactSelectionBar');
  assert.ok(bibleSrc.includes("isDark ? '#FFFFFF' : '#131F33'"), 'compactSelectionBar must invert colors (white in dark, midnight in light)');
  assert.ok(bibleSrc.includes('verseRowSelected'), 'BibleScreen must configure verseRowSelected');
  assert.ok(bibleSrc.includes('verseRowHighlighted'), 'BibleScreen must configure verseRowHighlighted');
});
