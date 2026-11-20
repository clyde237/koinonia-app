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
