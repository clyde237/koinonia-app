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
  AccessibilityInfo, Animated, Easing, Image, StyleSheet, Text, useColorScheme, useWindowDimensions, View,
} from 'react-native';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ Montserrat_600SemiBold, Montserrat_700Bold, Poppins_400Regular, Poppins_500Medium });
  const dark = useColorScheme() === 'dark';
  const { width } = useWindowDimensions();
  const [screen, setScreen] = useState<'splash' | 'transition' | 'login'>('splash');
  const [reduced, setReduced] = useState(true);
  const slide = useRef(new Animated.Value(0)).current;
  const colors = dark
    ? { background: '#111A2A', surface: '#1B293D', text: '#F5F5F3', muted: '#AEBFD0', border: '#70849B', action: '#54DDD0', onAction: '#0B2929' }
    : { background: '#F7F5F0', surface: '#FFFFFF', text: '#2A364E', muted: '#536478', border: '#768591', action: '#006B65', onAction: '#FFFFFF' };

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

  if (!fontsLoaded && !fontError) return null;

  const logo = <Image source={require('./assets/logo-koinonia.png')} style={styles.wordmark} resizeMode="contain" accessibilityLabel="Koinonia" />;

  return (
    <SafeAreaProvider>
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      {screen !== 'login' && (
        <Animated.View accessibilityElementsHidden={screen === 'transition'} style={[styles.screen, styles.center, { backgroundColor: colors.background, transform: [{ translateX: slide.interpolate({ inputRange: [0, 1], outputRange: [0, -width] }) }] }]}>
          <View style={styles.brandPanel}>
            <FlameEmblem active={screen === 'splash' && !reduced} />
            {logo}
          </View>
          <Text style={[styles.tagline, { color: colors.text }]}>Communion avec le Saint-Esprit</Text>
        </Animated.View>
      )}
      {screen !== 'splash' && (
        <Animated.View style={[styles.screen, { backgroundColor: colors.background, transform: [{ translateX: screen === 'login' ? 0 : slide.interpolate({ inputRange: [0, 1], outputRange: [width, 0] }) }] }]}>
          <AuthFlow colors={colors} />
        </Animated.View>
      )}
      <PortalHost />
    </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' }, screen: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  brandPanel: { alignItems: 'center', padding: 20, borderRadius: 24, backgroundColor: '#F7F5F0' },
  wordmark: { width: 240, maxWidth: '100%', height: 55, marginTop: 18 },
  tagline: { marginTop: 20, fontSize: 15, textAlign: 'center', fontFamily: 'Poppins_400Regular' },
});
