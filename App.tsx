import './global.css';
import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PortalHost } from '@rn-primitives/portal';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthFlow } from './components/AuthFlow';
import { FlameEmblem } from './components/FlameEmblem';
import { useFonts } from 'expo-font';
import { Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Poppins_400Regular, Poppins_500Medium } from '@expo-google-fonts/poppins';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { ThemeProvider, useTheme } from './lib/ThemeContext';

function MainApp() {
  const { isDark, colors } = useTheme();
  const { width } = useWindowDimensions();
  const [screen, setScreen] = useState<'splash' | 'transition' | 'login'>('splash');
  const [reduced, setReduced] = useState(true);
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReduced(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => { active = false; subscription.remove(); };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (reduced) { setScreen('login'); return; }
      setScreen('transition');
      Animated.timing(slide, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true })
        .start(({ finished }) => { if (finished) setScreen('login'); });
    }, 2600);
    return () => { clearTimeout(timer); slide.stopAnimation(); };
  }, [reduced, slide]);

  return (
    <View style={[styles.root, { backgroundColor: screen === 'splash' ? '#F7F5F0' : colors.canvas }]}>
      <StatusBar style={screen === 'splash' ? 'dark' : (isDark ? 'light' : 'dark')} />
      {screen !== 'login' && (
        <Animated.View
          accessibilityElementsHidden={screen === 'transition'}
          style={[
            styles.screen,
            styles.center,
            {
              backgroundColor: '#F7F5F0',
              transform: [{ translateX: slide.interpolate({ inputRange: [0, 1], outputRange: [0, -width] }) }],
            },
          ]}
        >
          <View style={styles.brandPanel}>
            <FlameEmblem active={screen === 'splash' && !reduced} />
            <Image
              source={require('./assets/logo-koinonia.png')}
              style={styles.wordmark}
              resizeMode="contain"
              accessibilityLabel="Koinonia"
            />
          </View>
          <Text style={[styles.tagline, { color: '#2A364E' }]}>Communion avec le Saint-Esprit</Text>
        </Animated.View>
      )}
      {screen !== 'splash' && (
        <Animated.View
          style={[
            styles.screen,
            {
              backgroundColor: colors.canvas,
              transform: [{ translateX: screen === 'login' ? 0 : slide.interpolate({ inputRange: [0, 1], outputRange: [width, 0] }) }],
            },
          ]}
        >
          <AuthFlow
            colors={{
              background: colors.canvas,
              surface: colors.surface,
              text: colors.text,
              muted: colors.muted,
              border: colors.divider,
              action: colors.action,
              onAction: colors.onHeroAction,
            }}
          />
        </Animated.View>
      )}
      <PortalHost />
    </View>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
  });
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  screen: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  brandPanel: { alignItems: 'center', padding: 20, borderRadius: 24 },
  wordmark: { width: 240, maxWidth: '100%', height: 55, marginTop: 18 },
  tagline: { marginTop: 20, fontSize: 15, textAlign: 'center', fontFamily: 'Poppins_400Regular' },
});
