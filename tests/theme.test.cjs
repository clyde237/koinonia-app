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
  const navSrc = fs.readFileSync(path.join(__dirname, '../components/BottomNav.tsx'), 'utf-8');
  assert.ok(homeSrc.includes('blurTarget={blurTarget}'), 'HomeScreen must forward its blur target');
  assert.ok(navSrc.includes('<BlurView'), 'BottomNav must apply blur independently of tab layout');

  // Splashscreen maintains official flame emblem
  assert.ok(appSrc.includes('FlameEmblem'), 'App splashscreen must keep official FlameEmblem');
});

test('main screens use shared navigation and the Bible keeps its themed actions', () => {
  const fs = require('node:fs');
  const path = require('node:path');

  // AppHeader exists and is used across screens
  const headerSrc = fs.readFileSync(path.join(__dirname, '../components/AppHeader.tsx'), 'utf-8');
  assert.ok(headerSrc.includes('export const AppHeader'), 'AppHeader must be exported');

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

const path = require('node:path');
const { transformFileSync } = require('@babel/core');
const { jsx, jsxs } = require('react/jsx-runtime');

const root = path.join(__dirname, '..');
const compile = name => transformFileSync(path.join(root, name), {
  cwd: root,
  caller: { name: 'metro', platform: 'android', supportsStaticESM: false },
}).code;

function evaluate(code, requireModule) {
  const module = { exports: {} };
  Function('module', 'exports', 'require', code)(module, module.exports, requireModule);
  return module.exports;
}

const theme = evaluate(compile('lib/theme.ts'), require);
const headerCode = compile('components/AppHeader.tsx');
const navCode = compile('components/BottomNav.tsx');

function loadComponent(code, { width, fontScale = 1, platform = 'android', version = 33, insets = { left: 0, right: 0, top: 0, bottom: 24 }, overrides = {} }) {
  const mocks = {
    react: { memo: component => component, useMemo: factory => factory(), useState: () => [undefined, () => {}] },
    'react/jsx-runtime': { jsx, jsxs },
    'react-native': {
      Image: 'Image', Pressable: 'Pressable', Text: 'Text', View: 'View',
      ScrollView: 'ScrollView', ActivityIndicator: 'ActivityIndicator', KeyboardAvoidingView: 'KeyboardAvoidingView',
      Modal: 'Modal', TextInput: 'TextInput', BackHandler: { addEventListener: () => ({ remove() {} }) },
      StyleSheet: { create: styles => styles, absoluteFill: { position: 'absolute' } },
      Platform: { OS: platform, Version: version },
      useWindowDimensions: () => ({ width, fontScale }),
    },
    'react-native-safe-area-context': { useSafeAreaInsets: () => insets },
    'expo-blur': { BlurView: 'BlurView' },
    'lucide-react-native': new Proxy({}, { get: (_, icon) => icon }),
    '../lib/theme': theme,
    '../lib/ThemeContext': { useTheme: () => ({ isDark: true, colors: theme.darkTheme, toggleTheme() {} }) },
  };
  return evaluate(code, id => id.endsWith('.png') ? id : overrides[id] ?? mocks[id] ?? require(id));
}

function find(tree, predicate) {
  if (Array.isArray(tree)) return tree.flatMap(node => find(node, predicate));
  if (!tree?.props) return [];
  return [...(predicate(tree) ? [tree] : []), ...find(tree.props.children, predicate)];
}

test('Metro keeps the native Pressable style callbacks in both shared components', () => {
  for (const code of [headerCode, navCode]) {
    assert.match(code, /require\(["']react\/jsx-runtime["']\)/);
    assert.doesNotMatch(code, /react-native-css-interop\/jsx-runtime/);
  }
});

test('crowded headers leave room for the title, with circular targets and larger icon marks', () => {
  const props = {
    title: 'Communautés',
    badgeLabel: 'LSG 1910',
    onBack() {},
    onOpenNotifications() {},
    unreadNotifCount: 3,
    searchAction: { active: true, onPress() {}, accessibilityLabel: 'Rechercher' },
  };
  for (const [width, fontScale, expectedRows] of [[320, 1, 2], [390, 1.5, 2], [768, 1, 1]]) {
    const { AppHeader } = loadComponent(headerCode, { width, fontScale });
    const header = AppHeader(props).props.children;
    const rows = header.props.children.filter(Boolean);
    assert.equal(rows.length, expectedRows);
    assert.equal(find(rows.at(-1), node => node.props.accessibilityRole === 'header')[0].props.children, props.title);
    const buttons = find(rows[0], node => typeof node.type === 'function');
    assert.equal(buttons.length, 4);
    for (const button of buttons) {
      const pressable = button.type(button.props);
      const [circle] = pressable.props.style({ pressed: false });
      assert.deepEqual([circle.width, circle.height, circle.borderRadius], [48, 48, 24]);
      const [icon] = find(pressable, node => node.props.size === 24);
      assert.ok(icon);
    }
    assert.equal(buttons[3].props.label, 'Notifications, 3 non lues');
  }
});

test('all five tabs occupy equal columns, stay inside safe insets and are inert when hidden', () => {
  const insets = { left: 8, right: 16, top: 0, bottom: 26 };
  for (const width of [320, 390, 768]) {
    const { BottomNav } = loadComponent(navCode, { width, insets });
    const selected = [];
    const props = { currentTab: 'bible', onSelectTab: id => selected.push(id), blurTarget: { current: {} } };
    const nav = BottomNav(props);
    const [, geometry] = nav.props.style;
    assert.ok(geometry.left >= insets.left);
    assert.ok(geometry.left + geometry.width <= width - insets.right);
    assert.equal(geometry.bottom, 34);
    const tabs = find(nav, node => node.props.accessibilityRole === 'tab');
    assert.equal(tabs.length, 5);
    assert.equal(tabs.filter(tab => tab.props.accessibilityState.selected).length, 1);
    assert.equal(tabs[3].props.accessibilityLabel, 'Bible');
    for (const tab of tabs) {
      const [item] = tab.props.style({ pressed: false });
      assert.deepEqual([item.flexBasis, item.flexGrow, item.flexShrink], [0, 1, 1]);
      assert.ok(item.minHeight >= 48);
    }
    tabs[1].props.onPress();
    assert.deepEqual(selected, ['breakfasts']);
    assert.equal(find(nav, node => node.type === 'BlurView').length, 1);
    const hidden = BottomNav({ ...props, isHidden: true });
    assert.equal(hidden.props.pointerEvents, 'none');
    assert.equal(hidden.props.accessibilityElementsHidden, true);
    assert.equal(find(hidden, node => node.type === 'BlurView').length, 0);
    assert.equal(find(BottomNav({ ...props, reduceTransparency: true }), node => node.type === 'BlurView').length, 0);
  }
  const { BottomNav } = loadComponent(navCode, { width: 320, version: 30 });
  assert.equal(find(BottomNav({ currentTab: 'home', blurTarget: {}, onSelectTab() {} }), node => node.type === 'BlurView').length, 0);
});

function rgb(hex) {
  return [1, 3, 5].map(start => Number.parseInt(hex.slice(start, start + 2), 16));
}

function luminance(channels) {
  const linear = channels.map(channel => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(foreground, background) {
  const [dark, light] = [luminance(rgb(foreground)), luminance(background)].sort((a, b) => a - b);
  return (light + 0.05) / (dark + 0.05);
}

test('Bible text and navigation labels meet 4.5:1 contrast in both themes', () => {
  for (const colors of [theme.lightTheme, theme.darkTheme]) {
    for (const background of [colors.verseSelected, colors.verseHighlighted]) {
      assert.ok(contrast(colors.text, rgb(background)) >= 4.5);
    }
    const [red, green, blue, opacity] = colors.navGlass.match(/[\d.]+/g).map(Number);
    for (const behind of [0, 255]) {
      const background = [red, green, blue].map(channel => channel * opacity + behind * (1 - opacity));
      for (const label of [colors.muted, colors.action]) assert.ok(contrast(label, background) >= 4.5);
    }
  }
});

test('the verse actions follow the latest selection and stay above the system controls', () => {
  const passage = { bookId: 'jean', chapter: 16 };
  const book = { id: 'jean', name: 'Jean', testament: 'NT' };
  const verses = [1, 2, 3].map(number => ({ number, text: `Texte ${number}` }));
  const hooks = [];
  const effects = [];
  let cursor = 0;
  let firstRender = true;
  const { BibleScreen } = loadComponent(compile('components/BibleScreen.tsx'), {
    width: 360,
    insets: { left: 0, right: 0, top: 0, bottom: 26 },
    overrides: {
      react: {
        useMemo: factory => factory(),
        useEffect: effect => { if (firstRender) effects.push(effect); },
        useRef: initial => {
          const index = cursor++;
          return hooks[index] ??= { current: initial };
        },
        useState: initial => {
          const index = cursor++;
          if (firstRender) hooks[index] = initial;
          return [hooks[index], next => { hooks[index] = typeof next === 'function' ? next(hooks[index]) : next; }];
        },
      },
      '../data/bible': {
        DAILY_BIBLE_PASSAGE: passage,
        BIBLE_BOOKS: [book],
        getBibleBook: () => book,
        getChapterVerses: () => verses,
        adjacentChapter: () => undefined,
        normalizeBibleText: text => text,
      },
      '../lib/bible-library': {
        loadBibleHighlights: async () => new Set(),
        saveBiblePosition: async () => {},
      },
      'expo-linear-gradient': { LinearGradient: 'LinearGradient' },
      './AppHeader': { AppHeader: 'AppHeader' },
      './BibleSearch': { BibleSearch: 'BibleSearch' },
      './FiligraneWatermark': { FiligraneWatermark: 'FiligraneWatermark' },
    },
  });
  const render = () => {
    cursor = 0;
    const screen = BibleScreen({ initialPassage: passage });
    firstRender = false;
    return screen;
  };
  render();
  effects.forEach(effect => effect());
  let screen = render();

  const byLabel = (tree, label) => find(tree, node => node.props.accessibilityLabel?.startsWith(label));
  const select = number => {
    byLabel(screen, `Verset ${number}.`)[0].props.onPress();
    screen = render();
  };
  const assertAnchor = number => {
    const [scroll] = find(screen, node => node.type === 'ScrollView');
    const [row] = find(scroll, node => Array.isArray(node.props.children)
      && node.props.children.some(child => child?.props?.accessibilityLabel?.startsWith(`Verset ${number}.`)));
    const [actions, verse] = row.props.children;
    assert.equal(actions.props.style.marginBottom, 6);
    assert.equal(verse.props.accessibilityState.selected, true);
    assert.equal(byLabel(screen, 'Copier les versets sélectionnés').length, 1);
    assert.equal(byLabel(actions, 'Copier les versets sélectionnés').length, 1);
    return { scroll, actions };
  };

  assert.equal(byLabel(screen, 'Copier les versets sélectionnés').length, 0);
  select(2);
  assertAnchor(2);
  select(3);
  const { scroll, actions } = assertAnchor(3);

  const offsets = [];
  scroll.props.ref.current = {
    getInnerViewRef: () => ({}),
    scrollTo: ({ y }) => offsets.push(y),
  };
  scroll.props.onLayout({ nativeEvent: { layout: { height: 300 } } });
  scroll.props.onScroll({ nativeEvent: { contentOffset: { y: 100 } } });
  for (const y of [180, 90, 350]) {
    actions.props.ref.current = { measureLayout: (_content, resolve) => resolve(0, y, 210, 50) };
    actions.props.onLayout();
  }
  assert.deepEqual(offsets, [82, 164]);

  select(3);
  assertAnchor(2);
  byLabel(screen, 'Désélectionner tout')[0].props.onPress();
  assert.equal(byLabel(render(), 'Copier les versets sélectionnés').length, 0);
});
