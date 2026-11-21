const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');

// Hook TypeScript compilation for CommonJS tests
require.extensions['.ts'] = (loadedModule, file) => {
  loadedModule._compile(
    ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText,
    file
  );
};
require.extensions['.jpg'] = (loadedModule, file) => { loadedModule.exports = file; };
require.extensions['.png'] = (loadedModule, file) => { loadedModule.exports = file; };

const {
  isBreakfastDownloaded,
  markBreakfastDownloaded,
  downloadBreakfast,
} = require('../lib/breakfast-api.ts');
const { allBreakfasts } = require('../data/breakfasts.ts');

test('app.json contains background audio and expo-video plugin configuration', () => {
  const appJsonPath = path.join(__dirname, '../app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

  // iOS UIBackgroundModes: ["audio"]
  assert.ok(appJson.expo.ios?.infoPlist?.UIBackgroundModes?.includes('audio'), 'iOS Info.plist must declare UIBackgroundModes audio');

  // Android permissions for foreground service media playback
  const androidPerms = appJson.expo.android?.permissions || [];
  assert.ok(androidPerms.includes('android.permission.FOREGROUND_SERVICE'), 'Android must declare FOREGROUND_SERVICE');
  assert.ok(androidPerms.includes('android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK'), 'Android must declare FOREGROUND_SERVICE_MEDIA_PLAYBACK');

  // expo-video plugin with supportsBackgroundPlayback: true
  const plugins = appJson.expo.plugins || [];
  const videoPlugin = plugins.find(p => Array.isArray(p) && p[0] === 'expo-video');
  assert.ok(videoPlugin, 'expo-video plugin must be configured in plugins');
  assert.equal(videoPlugin[1]?.supportsBackgroundPlayback, true, 'supportsBackgroundPlayback must be true');
});

test('HomeScreen embeds BreakfastVideoPlayer, autoPlay and download button next to share button', () => {
  const homePath = path.join(__dirname, '../components/HomeScreen.tsx');
  const homeSrc = fs.readFileSync(homePath, 'utf8');

  assert.ok(homeSrc.includes('<BreakfastVideoPlayer'), 'HomeScreen must render BreakfastVideoPlayer');
  assert.ok(homeSrc.includes('autoPlay={true}'), 'HomeScreen must auto-play daily breakfast on entry');
  assert.ok(homeSrc.includes('<DownloadModal'), 'HomeScreen must include DownloadModal');
  assert.ok(homeSrc.includes('setDownloadModalItem'), 'HomeScreen must trigger download modal');
  assert.ok(homeSrc.includes('shareDailyBreakfast'), 'HomeScreen must support sharing daily breakfast');
});

test('BreakfastsScreen plays video instantly without opening reading page, has download next to share', () => {
  const screenPath = path.join(__dirname, '../components/BreakfastsScreen.tsx');
  const screenSrc = fs.readFileSync(screenPath, 'utf8');

  assert.ok(screenSrc.includes('<BreakfastVideoPlayer'), 'BreakfastsScreen must render BreakfastVideoPlayer');
  assert.ok(screenSrc.includes('<DownloadModal'), 'BreakfastsScreen must include DownloadModal');
  assert.ok(screenSrc.includes('handleDownloadClick'), 'BreakfastsScreen must handle download clicks');
  // Clicking video item directly updates playingBreakfast and starts video instead of opening reading detail screen
  assert.ok(screenSrc.includes('setPlayingBreakfast(item)'), 'Clicking breakfast item must update playing video directly');
});

test('downloadBreakfast marks offline availability for video, audio, and pdf', async () => {
  const item = allBreakfasts[0];
  assert.ok(item);

  // Test video download
  const videoRes = await downloadBreakfast(item, 'video');
  assert.equal(videoRes.success, true);
  assert.equal(videoRes.type, 'video');
  assert.ok(await isBreakfastDownloaded(item.id, 'video'));

  // Test audio download
  const audioRes = await downloadBreakfast(item, 'audio');
  assert.equal(audioRes.success, true);
  assert.equal(audioRes.type, 'audio');
  assert.ok(await isBreakfastDownloaded(item.id, 'audio'));

  // Test PDF download
  const pdfRes = await downloadBreakfast(item, 'pdf');
  assert.equal(pdfRes.success, true);
  assert.equal(pdfRes.type, 'pdf');
  assert.ok(await isBreakfastDownloaded(item.id, 'pdf'));
});
