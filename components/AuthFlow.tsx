/** @jsxImportSource react */
import { useEffect, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Check, ChevronDown, Eye, EyeOff, Camera, UserRound, Moon, Sun } from 'lucide-react-native';
import {
  ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView,
  StyleSheet, Switch, Text, TextInput, View, type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeScreen } from './HomeScreen';
import { authClient, accountError, getAccessToken } from '../lib/auth-client';
import { loadAccountProfile, saveAccountProfile, uploadAccountPhoto, deleteAccountPhoto, photoURL } from '../lib/account-api';
import { Country, COUNTRIES, DEFAULT_COUNTRY, findCountryByName, findCountryByDialCode } from '../data/countries';
import { CountryPickerModal } from './CountryPickerModal';
import { PhoneInput } from './PhoneInput';
import { FiligraneWatermark } from './FiligraneWatermark';
import { controls } from '../lib/theme';
import { useTheme } from '../lib/ThemeContext';

type Colors = {
  background: string; surface: string; text: string; muted: string;
  border: string; action: string; onAction: string;
  critical?: string; onCritical?: string;
};
type Screen = 'login' | 'register' | 'onboarding' | 'home' | 'forgot' | 'reset' | 'verify' | 'change-password';
type Props = { colors: Colors };

const periods = ['Aujourd’hui', '7 derniers jours', '14 derniers jours', '30 derniers jours'];
const topics = ['Prière', 'Foi', 'Vie chrétienne', 'Famille', 'Croissance spirituelle'];
const groups = [
  { id: 'matin', name: 'Veilleurs du matin', description: 'Prière et méditation au quotidien' },
  { id: 'partage', name: 'Prière et partage', description: 'Un espace pour prier ensemble' },
];

export function AuthFlow({ colors }: Props) {
  const { isDark, toggleTheme } = useTheme();
  const [screen, setScreen] = useState<Screen>('login');
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [nationalPhone, setNationalPhone] = useState('');
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [church, setChurch] = useState('');
  const [noChurch, setNoChurch] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [period, setPeriod] = useState(periods[0]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [breakfastNotifications, setBreakfastNotifications] = useState(true);
  const [communityNotifications, setCommunityNotifications] = useState(true);

  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [checking, setChecking] = useState(true);
  const [restoreError, setRestoreError] = useState('');
  const [restoreRevision, setRestoreRevision] = useState(0);
  const restoredRevision = useRef(-1);
  const [busy, setBusy] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [otp, setOtp] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [avatarHeaders, setAvatarHeaders] = useState<Record<string, string>>({});
  const savedPhoto = useRef<string | null>(null);
  const activeUser = useRef<string | null>(null);
  const submitting = useRef(false);

  useEffect(() => {
    if (sessionPending) return;
    if (!session?.user) {
      if (activeUser.current) {
        activeUser.current = null; savedPhoto.current = null;
        setScreen('login'); setName(''); setEmail(''); setPassword(''); setProfilePhoto(null);
        setPhone(''); setNationalPhone(''); setSelectedCountry(DEFAULT_COUNTRY); setCountry(''); setCity(''); setChurch(''); setNoChurch(false);
        setInterests([]); setSelectedGroups([]); setPeriod(periods[0]); setStep(0);
        setCurrentPassword(''); setOtp(''); setProfileCompleted(false); setAvatarHeaders({});
      }
      setChecking(false); setRestoreError(''); return;
    }
    if (activeUser.current === session.user.id && restoredRevision.current === restoreRevision) return;
    let cancelled = false;
    setChecking(true); setRestoreError('');
    void (async () => {
      try {
        const profile = await loadAccountProfile();
        const token = await getAccessToken();
        if (cancelled) return;
        activeUser.current = session.user.id; restoredRevision.current = restoreRevision;
        setName(session.user.name); setEmail(session.user.email);
        let activeCountry = DEFAULT_COUNTRY;
        if (profile.country) {
          const byName = findCountryByName(profile.country);
          if (byName) activeCountry = byName;
        }
        if (profile.phone) {
          let byDial: Country | undefined;
          if (activeCountry && profile.phone.startsWith(activeCountry.dialCode)) {
            byDial = activeCountry;
          } else {
            byDial = COUNTRIES.find(c => profile.phone.startsWith(c.dialCode));
          }
          if (byDial) {
            activeCountry = byDial;
            setNationalPhone(profile.phone.slice(byDial.dialCode.length).trim());
          } else {
            setNationalPhone(profile.phone);
          }
          setPhone(profile.phone);
        } else {
          setNationalPhone('');
          setPhone('');
        }
        setSelectedCountry(activeCountry);
        setCountry(profile.country); setCity(profile.city); setChurch(profile.church);
        setNoChurch(profile.noChurch); setInterests(profile.interests); setPeriod(profile.period);
        setSelectedGroups(profile.requestedGroups); setBreakfastNotifications(profile.breakfastNotifications);
        setCommunityNotifications(profile.communityNotifications); setProfileCompleted(profile.onboardingCompleted);
        savedPhoto.current = photoURL(profile.photo); setProfilePhoto(savedPhoto.current);
        setAvatarHeaders({ Authorization: `Bearer ${token}` });
        setStep(Math.min(profile.onboardingStep, 4));
        setScreen(profile.onboardingCompleted ? 'home' : 'onboarding');
        setPassword(''); setCurrentPassword('');
      } catch (error) {
        if (!cancelled) setRestoreError(error instanceof Error ? error.message : 'Impossible de retrouver votre profil.');
      } finally { if (!cancelled) setChecking(false); }
    })();
    return () => { cancelled = true; };
  }, [session?.user.id, sessionPending, restoreRevision]);

  const run = async (action: () => Promise<void>) => {
    if (submitting.current) return;
    submitting.current = true; setBusy(true); setError(''); setNotice('');
    try { await action(); }
    catch (error) { setError(error instanceof Error ? error.message : 'Une erreur est survenue. Réessayez.'); }
    finally { submitting.current = false; setBusy(false); }
  };
  const signOut = () => run(async () => {
    const result = await authClient.signOut();
    if (result.error) throw new Error(accountError(result.error));
    setScreen('login'); setPassword(''); setCurrentPassword(''); setNotice('Vous êtes déconnecté.');
  });

  const heading = { color: colors.text };
  const body = { color: colors.muted };
  const toggle = (value: string, values: string[], update: (items: string[]) => void) => {
    update(values.includes(value) ? values.filter(item => item !== value) : [...values, value]);
  };
  const go = (next: Screen) => {
    setError('');
    setNotice('');
    setShowPassword(false);
    setFocusedField(null);
    setScreen(next);
  };
  const validate = () => {
    if (screen === 'register' && !name.trim()) { setError('Indiquez votre nom d’affichage.'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Saisissez une adresse e-mail valide.'); return false; }
    if (!password) { setError('Saisissez votre mot de passe.'); return false; }
    if (screen === 'register' && password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return false; }
    setError('');
    return true;
  };
  const submit = () => {
    if (!validate()) return;
    void run(async () => {
      // Ne pas passer callbackURL : sinon Better Auth renvoie redirect=true et @better-auth/expo ouvre le navigateur sur /expo-authorization-proxy.
      const result = screen === 'register'
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password });
      if (result.error) {
        if (result.error.code === 'EMAIL_NOT_VERIFIED') { setScreen('verify'); setNotice('Vérifiez votre adresse e-mail pour continuer.'); return; }
        throw new Error(accountError(result.error));
      }
      setPassword('');
      if (!result.data?.token) {
        setScreen('verify'); setNotice('Votre compte a été créé. Vérifiez votre adresse e-mail pour continuer.');
      }
      // La session réactive recharge le profil puis décide entre onboarding et accueil.
    });
  };

  const sendCode = (type: 'email-verification' | 'forget-password') => run(async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw new Error('Saisissez une adresse e-mail valide.');
    const result = await authClient.emailOtp.sendVerificationOtp({ email: email.trim(), type });
    if (result.error) throw new Error(accountError(result.error));
    setOtp('');
    if (type === 'forget-password') { setPassword(''); setScreen('reset'); }
    setNotice('Si votre compte est éligible, un code a été envoyé à cette adresse.');
  });
  const confirmCode = () => run(async () => {
    if (!/^\d{6}$/.test(otp.trim())) throw new Error('Saisissez le code à 6 chiffres.');
    const result = await authClient.emailOtp.verifyEmail({ email: email.trim(), otp: otp.trim() });
    if (result.error) throw new Error(accountError(result.error));
    setOtp(''); setScreen(session?.user && profileCompleted ? 'home' : 'login'); setNotice('Adresse e-mail vérifiée.');
  });
  const resetPassword = () => run(async () => {
    if (!/^\d{6}$/.test(otp.trim())) throw new Error('Saisissez le code à 6 chiffres.');
    if (password.length < 8 || password.length > 128) throw new Error('Utilisez un mot de passe de 8 à 128 caractères.');
    const result = await authClient.emailOtp.resetPassword({ email: email.trim(), otp: otp.trim(), password });
    if (result.error) throw new Error(accountError(result.error));
    setPassword(''); setOtp(''); setScreen('login'); setNotice('Mot de passe modifié. Connectez-vous avec le nouveau mot de passe.');
  });
  const changePassword = () => run(async () => {
    if (password.length < 8 || password.length > 128) throw new Error('Utilisez un mot de passe de 8 à 128 caractères.');
    const result = await authClient.changePassword({ currentPassword, newPassword: password, revokeOtherSessions: true });
    if (result.error) throw new Error(accountError(result.error));
    setPassword(''); setCurrentPassword(''); setScreen('home');
    Alert.alert('Mot de passe modifié', 'Votre nouveau mot de passe est enregistré. Les autres sessions ont été fermées.');
  });

  const button = (title: string, onPress: () => void, compact = false) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      disabled={busy}
      accessibilityState={{ disabled: busy, busy }}
      style={({ pressed }) => [styles.buttonTouch, compact && styles.buttonTouchCompact, pressed && styles.pressed]}
    >
      <View style={[styles.button, { backgroundColor: colors.action }]}>
        {busy ? <ActivityIndicator color={colors.onAction} /> : <Text style={[styles.buttonText, { color: colors.onAction }]}>{title}</Text>}
      </View>
    </Pressable>
  );
  const link = (title: string, onPress: () => void, variant: 'action' | 'critical' = 'action') => (
    <Pressable accessibilityRole="button" onPress={onPress} disabled={busy} style={({ pressed }) => [styles.linkTouch, pressed && styles.pressed]}>
      <Text style={[styles.link, { color: variant === 'critical' ? (colors.critical || '#B42318') : colors.action }]}>{title}</Text>
    </Pressable>
  );
  const focusProps = (label: string) => ({
    onFocus: () => setFocusedField(label),
    onBlur: () => setFocusedField(current => current === label ? null : current),
  });
  const fieldSurface = (label: string) => ({
    backgroundColor: colors.surface,
    borderColor: focusedField === label ? colors.action : colors.border,
  });
  const field = (label: string, value: string, change: (v: string) => void, props: TextInputProps = {}) => (
    <View style={styles.field}>
      <Text style={[styles.label, heading]}>{label}</Text>
      <TextInput
        {...props}
        {...focusProps(label)}
        editable={!busy && props.editable !== false}
        value={value}
        onChangeText={change}
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        underlineColorAndroid="transparent"
        style={[styles.input, fieldSurface(label), { color: colors.text }]}
      />
    </View>
  );
  const secretField = (label: string, value: string, change: (value: string) => void, autoComplete: 'current-password' | 'new-password') => (
    <View style={styles.field}>
      <Text style={[styles.label, heading]}>{label}</Text>
      <View style={[styles.passwordField, fieldSurface(label)]}>
        <TextInput
          {...focusProps(label)}
          accessibilityLabel={label}
          value={value}
          onChangeText={change}
          editable={!busy}
          secureTextEntry={!showPassword}
          autoComplete={autoComplete}
          underlineColorAndroid="transparent"
          style={[styles.passwordInput, { color: colors.text }]}
        />
        <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? 'Masquer les mots de passe' : 'Afficher les mots de passe'} onPress={() => setShowPassword(value => !value)} style={({ pressed }) => [styles.eye, pressed && styles.pressed]}>
          {showPassword ? <EyeOff size={22} color={colors.action} strokeWidth={controls.iconStroke} /> : <Eye size={22} color={colors.action} strokeWidth={controls.iconStroke} />}
        </Pressable>
      </View>
    </View>
  );
  const choice = (
    title: string,
    selected: boolean,
    onPress: () => void,
    description?: string,
    role: 'checkbox' | 'radio' = 'checkbox',
    disabled: boolean = false
  ) => (
    <Pressable
      key={title}
      onPress={disabled ? undefined : onPress}
      disabled={disabled || busy}
      pointerEvents={disabled ? 'none' : 'auto'}
      accessibilityRole={role}
      accessibilityState={{ checked: selected, disabled: disabled || busy }}
      style={[
        styles.choice,
        { backgroundColor: colors.surface, borderColor: selected ? colors.action : colors.border },
        disabled && styles.disabledChoice,
      ]}
    >
      <View style={styles.choiceText}>
        <Text style={[styles.choiceTitle, heading, disabled && styles.disabledText]}>{title}</Text>
        {description ? <Text style={[styles.choiceDescription, body]}>{description}</Text> : null}
      </View>
      <View
        style={[
          styles.check,
          { borderColor: selected ? colors.action : colors.border },
          selected && { backgroundColor: colors.action },
          disabled && { opacity: 0.35, borderColor: colors.border },
        ]}
      >
        {selected ? <Check size={15} color={colors.onAction} strokeWidth={2.5} /> : null}
      </View>
    </Pressable>
  );

  const hasChurch = church.trim().length > 0;

  const handlePhoneCountrySelect = (c: Country) => {
    setSelectedCountry(c);
    setCountry(c.name);
    const full = nationalPhone.trim() ? `${c.dialCode} ${nationalPhone.trim()}` : '';
    setPhone(full);
  };

  const handleCountrySelect = (c: Country) => {
    setCountry(c.name);
    setSelectedCountry(c);
    const full = nationalPhone.trim() ? `${c.dialCode} ${nationalPhone.trim()}` : '';
    setPhone(full);
  };

  const handleNationalPhoneChange = (text: string) => {
    setNationalPhone(text);
    const full = text.trim() ? `${selectedCountry.dialCode} ${text.trim()}` : '';
    setPhone(full);
  };

  const handleChurchChange = (text: string) => {
    setChurch(text);
    if (text.trim().length > 0 && noChurch) {
      setNoChurch(false);
    }
  };

  const handleNoChurchToggle = () => {
    if (hasChurch) return;
    const nextVal = !noChurch;
    setNoChurch(nextVal);
    if (nextVal) {
      setChurch('');
    }
  };
  const selectProfilePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setProfilePhoto(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Photo de profil', 'Impossible d’ouvrir la galerie. Veuillez réessayer.');
    }
  };

  const next = () => run(async () => {
    if (step === 0) {
      if (profilePhoto && profilePhoto !== savedPhoto.current) {
        const uploaded = await uploadAccountPhoto(profilePhoto);
        savedPhoto.current = photoURL(uploaded.photo); setProfilePhoto(savedPhoto.current);
        setAvatarHeaders({ Authorization: `Bearer ${await getAccessToken()}` });
      } else if (!profilePhoto && savedPhoto.current) {
        await deleteAccountPhoto(); savedPhoto.current = null;
      }
    }
    const profile = await saveAccountProfile({ phone, country, city, church, noChurch, interests, period, requestedGroups: selectedGroups, breakfastNotifications, communityNotifications, onboardingStep: step + 1 });
    if (step < 4) setStep(step + 1);
    else { setProfileCompleted(profile.onboardingCompleted); go('home'); }
  });

  if (checking || sessionPending || restoreError) {
    return <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}><View style={[styles.auth, { padding: 24 }]}>
      {checking || sessionPending ? <><ActivityIndicator color={colors.action} size="large" /><Text style={[styles.intro, body, { textAlign: 'center', marginTop: 16 }]}>Retrouvons votre espace…</Text></> : <>
        <Text style={[styles.title, heading]}>Connexion au service</Text><Text style={[styles.intro, body]}>{restoreError}</Text>
        {button('Réessayer', () => setRestoreRevision(value => value + 1))}{link('Se déconnecter', signOut, 'critical')}
        {error ? <Text accessibilityRole="alert" style={[styles.error, heading]}>{error}</Text> : null}
      </>}
    </View></SafeAreaView>;
  }

  if (screen === 'forgot' || screen === 'reset' || screen === 'verify' || screen === 'change-password') {
    const isVerify = screen === 'verify';
    const isChange = screen === 'change-password';
    return <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <View style={styles.auth}>
            <Pressable accessibilityRole="button" accessibilityLabel="Retour" disabled={busy} onPress={() => { setPassword(''); setCurrentPassword(''); go(session?.user && profileCompleted ? 'home' : 'login'); }} style={styles.back}><ArrowLeft size={24} color={colors.text} /></Pressable>
            <Text style={[styles.title, heading]}>{isVerify ? 'Vérifier mon adresse' : isChange ? 'Changer le mot de passe' : screen === 'reset' ? 'Nouveau mot de passe' : 'Mot de passe oublié ?'}</Text>
            <Text style={[styles.intro, body]}>{isChange ? 'Choisissez un mot de passe de 8 caractères minimum.' : isVerify ? 'Confirmez votre adresse avec le code reçu par e-mail.' : 'Un code envoyé par e-mail vous permet de retrouver votre compte.'}</Text>
            {!isChange && field('Adresse e-mail', email, setEmail, { autoCapitalize: 'none', keyboardType: 'email-address', autoComplete: 'email' })}
            {(screen === 'reset' || isVerify) && field('Code à 6 chiffres', otp, setOtp, { keyboardType: 'number-pad', autoComplete: 'one-time-code', maxLength: 6 })}
            {isChange && secretField('Mot de passe actuel', currentPassword, setCurrentPassword, 'current-password')}
            {(screen === 'reset' || isChange) && secretField('Nouveau mot de passe', password, setPassword, 'new-password')}
            {notice ? <Text accessibilityLiveRegion="polite" style={[styles.hint, { color: colors.action }]}>{notice}</Text> : null}
            {error ? <Text accessibilityRole="alert" style={[styles.error, heading]}>{error}</Text> : null}
            {button(isVerify ? 'Vérifier mon adresse' : isChange ? 'Enregistrer' : screen === 'reset' ? 'Enregistrer le mot de passe' : 'Recevoir un code', isVerify ? confirmCode : isChange ? changePassword : screen === 'reset' ? resetPassword : () => sendCode('forget-password'))}
            {(screen === 'reset' || isVerify) && link('Recevoir un nouveau code', () => sendCode(isVerify ? 'email-verification' : 'forget-password'))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>;
  }

  if (screen === 'home') {
    return (
      <HomeScreen
        key={session?.user.id}
        readerId={session?.user.id ?? 'device'}
        onSignOut={signOut}
        onChangePassword={() => { setPassword(''); setCurrentPassword(''); go('change-password'); }}
        onEditProfile={() => { setStep(0); go('onboarding'); }}
        onVerifyEmail={() => go('verify')}
        emailVerified={Boolean(session?.user.emailVerified)}
        busy={busy}
        accountError={error}
        photoHeaders={avatarHeaders}
        name={name}
        email={email}
        phone={phone}
        profilePhoto={profilePhoto}
        country={country}
        city={city}
        church={church}
        noChurch={noChurch}
        period={period}
        requestedGroups={selectedGroups}
        breakfastNotifications={breakfastNotifications}
        communityNotifications={communityNotifications}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <FiligraneWatermark opacity={0.15} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView key={screen + step} keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, screen === 'onboarding' && styles.onboardingContent]}>
          {screen === 'login' || screen === 'register' ? (
            <View style={styles.auth}>
              {screen === 'register' && (
                <Pressable accessibilityRole="button" accessibilityLabel="Retour à la connexion" onPress={() => go('login')} disabled={busy} style={styles.back}>
                  <ArrowLeft size={24} color={colors.text} />
                </Pressable>
              )}
              <View style={styles.topLogoRow}>
                <View style={[styles.logoBacking, isDark && { backgroundColor: 'transparent' }]}>
                  <Image
                    source={isDark ? require('../assets/logo-koinonia_w.png') : require('../assets/logo-koinonia.png')}
                    style={styles.logo}
                    resizeMode="contain"
                    accessibilityLabel="Koinonia"
                  />
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={isDark ? 'Passer en mode jour' : 'Passer en mode nuit'}
                  onPress={toggleTheme}
                  style={styles.themeToggleBtn}
                >
                  {isDark ? <Sun size={22} color={colors.action} /> : <Moon size={22} color={colors.text} />}
                </Pressable>
              </View>
              <Text accessibilityRole="header" textBreakStrategy="balanced" style={[styles.title, heading]}>{screen === 'register' ? 'Créer un compte' : 'Connexion'}</Text>
              <Text style={[styles.intro, body]}>{screen === 'register' ? 'Rejoignez votre communauté de foi.' : 'Connectez-vous à votre compte.'}</Text>
              {screen === 'register' && field('Nom d’affichage', name, setName, { autoCapitalize: 'words', autoComplete: 'name', placeholder: 'Votre nom' })}
              {field('Adresse e-mail', email, setEmail, { autoCapitalize: 'none', keyboardType: 'email-address', autoComplete: 'email', placeholder: 'vous@exemple.com' })}
              <View style={styles.field}>
                <Text style={[styles.label, heading]}>Mot de passe</Text>
                <View style={[styles.passwordField, fieldSurface('Mot de passe')]}>
                  <TextInput
                    {...focusProps('Mot de passe')}
                    accessibilityLabel="Mot de passe"
                    editable={!busy}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete={screen === 'register' ? 'new-password' : 'current-password'}
                    underlineColorAndroid="transparent"
                    placeholder="Votre mot de passe"
                    placeholderTextColor={colors.muted}
                    style={[styles.passwordInput, { color: colors.text }]}
                  />
                  <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} onPress={() => setShowPassword(!showPassword)} style={({ pressed }) => [styles.eye, pressed && styles.pressed]}>
                    {showPassword ? <EyeOff size={22} color={colors.action} strokeWidth={controls.iconStroke} /> : <Eye size={22} color={colors.action} strokeWidth={controls.iconStroke} />}
                  </Pressable>
                </View>
                {screen === 'register' && <Text style={[styles.hint, body]}>8 caractères minimum.</Text>}
              </View>
              {notice ? <Text accessibilityLiveRegion="polite" style={[styles.hint, { color: colors.action }]}>{notice}</Text> : null}
              {error ? <Text accessibilityRole="alert" style={[styles.error, { color: colors.text }]}>{error}</Text> : null}
              {button(screen === 'register' ? 'Créer mon compte' : 'Se connecter', submit)}
              {screen === 'login'
                ? link('Créer un compte', () => go('register'))
                : link('Déjà inscrit ? Se connecter', () => go('login'))}
              {screen === 'login' && link('Mot de passe oublié ?', () => go('forgot'))}
            </View>
          ) : screen === 'onboarding' ? (
            <View style={styles.onboarding}>
              <View style={styles.stepHeader}>
                <Pressable accessibilityRole="button" accessibilityLabel={step === 0 ? (profileCompleted ? 'Retour à l’accueil' : 'Se déconnecter') : 'Étape précédente'} disabled={busy} onPress={() => step === 0 ? (profileCompleted ? go('home') : signOut()) : setStep(step - 1)} style={styles.back}>
                  <ArrowLeft size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.stepLabel, { color: colors.action }]}>ÉTAPE {step + 1} SUR 5</Text>
              </View>
              <View style={styles.progressRow}>
                {[0, 1, 2, 3, 4].map(index => <View key={index} style={[styles.progress, { backgroundColor: index <= step ? colors.action : colors.border }]} />)}
              </View>
              {step === 0 && (
                <>
                  <Text style={[styles.title, heading]}>Faisons connaissance</Text>
                  <Text style={[styles.intro, body]}>Quelques informations pour mieux vous connaître. Elles sont facultatives.</Text>
                  <Text style={[styles.label, heading]}>Photo de profil</Text>
                  <View style={styles.photoRow}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={profilePhoto ? 'Modifier la photo de profil' : 'Ajouter une photo de profil'}
                      onPress={selectProfilePhoto}
                      style={[styles.photo, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    >
                      {profilePhoto
                        ? <Image source={{ uri: profilePhoto, headers: avatarHeaders }} style={styles.photoImage} />
                        : <UserRound size={32} color={colors.muted} strokeWidth={1.5} />}
                      <View style={[styles.photoBadge, { backgroundColor: colors.action }]}>
                        <Camera size={15} color={colors.onAction} strokeWidth={2} />
                      </View>
                    </Pressable>
                    <View style={styles.photoDetails}>
                      {link(profilePhoto ? 'Modifier la photo' : 'Ajouter une photo', selectProfilePhoto)}
                      {profilePhoto && link('Supprimer la photo', () => setProfilePhoto(null))}
                    </View>
                  </View>
                  <PhoneInput
                    label="Téléphone"
                    value={nationalPhone}
                    selectedCountry={selectedCountry}
                    selectedDialCode={selectedCountry.dialCode}
                    onChangeText={handleNationalPhoneChange}
                    onSelectCountry={handlePhoneCountrySelect}
                    editable={!busy}
                    colors={colors}
                  />
                  <View style={styles.field}>
                    <Text style={[styles.label, heading]}>Pays</Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Pays sélectionné : ${country || 'Aucun'}. Appuyez pour choisir.`}
                      disabled={busy}
                      onPress={() => setCountryPickerVisible(true)}
                      style={[
                        styles.input,
                        styles.dropdownInput,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                      ]}
                    >
                      <View style={styles.dropdownContent}>
                        {selectedCountry?.flag ? (
                          <Text style={styles.dropdownFlag}>{selectedCountry.flag}</Text>
                        ) : null}
                        <Text
                          style={[styles.dropdownValue, { color: country ? colors.text : colors.muted }]}
                          numberOfLines={1}
                        >
                          {country || 'Choisir votre pays (ex. Cameroun)'}
                        </Text>
                      </View>
                      <ChevronDown size={18} color={colors.muted} strokeWidth={1.5} />
                    </Pressable>
                  </View>
                  {field('Ville', city, setCity, { placeholder: 'Ex. Bafoussam, Douala, Yaoundé…' })}
                  <View style={styles.field}>
                    <Text style={[styles.label, heading, noChurch && styles.disabledText]}>Église ou assemblée</Text>
                    <TextInput
                      accessibilityLabel="Église ou assemblée"
                      editable={!busy && !noChurch}
                      value={church}
                      onChangeText={handleChurchChange}
                      placeholder={noChurch ? 'Non applicable' : 'Votre église'}
                      placeholderTextColor={colors.muted}
                      underlineColorAndroid="transparent"
                      style={[
                        styles.input,
                        { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
                        noChurch && styles.disabledInput,
                      ]}
                    />
                  </View>
                  {choice(
                    'Je n’appartiens à aucune église',
                    noChurch && !hasChurch,
                    handleNoChurchToggle,
                    undefined,
                    'radio',
                    hasChurch
                  )}
                  <CountryPickerModal
                    visible={countryPickerVisible}
                    onClose={() => setCountryPickerVisible(false)}
                    onSelect={handleCountrySelect}
                    selectedCountry={selectedCountry}
                    selectedCountryName={country}
                    colors={colors}
                  />
                </>
              )}
              {step === 1 && (
                <>
                  <Text style={[styles.title, heading]}>Vos centres d’intérêt</Text>
                  <Text style={[styles.intro, body]}>Choisissez les sujets qui vous inspirent. Cette étape est facultative.</Text>
                  <View style={styles.chips}>
                    {topics.map(topic => <Pressable key={topic} accessibilityRole="checkbox" accessibilityState={{ checked: interests.includes(topic) }} onPress={() => toggle(topic, interests, setInterests)} style={[styles.chip, { backgroundColor: interests.includes(topic) ? colors.action : colors.surface, borderColor: colors.border }]}><Text style={[styles.chipText, { color: interests.includes(topic) ? colors.onAction : colors.text }]}>{topic}</Text></Pressable>)}
                  </View>
                </>
              )}
              {step === 2 && (
                <>
                  <Text style={[styles.title, heading]}>Votre historique</Text>
                  <Text style={[styles.intro, body]}>Choisissez la période à afficher. La recherche couvre toutes les publications.</Text>
                  {periods.map(item => choice(item, period === item, () => setPeriod(item), undefined, 'radio'))}
                </>
              )}
              {step === 3 && (
                <>
                  <Text style={[styles.title, heading]}>Découvrez les communautés</Text>
                  <Text style={[styles.intro, body]}>Rejoignez une communauté : les demandes sont soumises à validation.</Text>
                  <Text style={[styles.hint, body]}>Exemples de communautés pour cette démonstration.</Text>
                  {groups.map(group => choice(group.name, selectedGroups.includes(group.id), () => toggle(group.id, selectedGroups, setSelectedGroups), group.description))}
                </>
              )}
              {step === 4 && (
                <>
                  <Text style={[styles.title, heading]}>Restez informé</Text>
                  <Text style={[styles.intro, body]}>Encore une étape ! Choisissez vos notifications, modifiables plus tard.</Text>
                  <View style={[styles.switchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.choiceText}><Text style={[styles.choiceTitle, heading]}>Nouveaux Breakfasts</Text><Text style={[styles.choiceDescription, body]}>À chaque nouvelle publication.</Text></View>
                    <Switch accessibilityLabel="Notifications des nouveaux Breakfasts" value={breakfastNotifications} onValueChange={setBreakfastNotifications} trackColor={{ true: colors.action }} />
                  </View>
                  <View style={[styles.switchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.choiceText}><Text style={[styles.choiceTitle, heading]}>Messages des communautés</Text><Text style={[styles.choiceDescription, body]}>Vous pourrez les régler par communauté.</Text></View>
                    <Switch accessibilityLabel="Notifications des communautés" value={communityNotifications} onValueChange={setCommunityNotifications} trackColor={{ true: colors.action }} />
                  </View>
                  <Text style={[styles.hint, body]}>L’autorisation du téléphone sera demandée lorsque les notifications seront activées dans l’application.</Text>
                </>
              )}
            </View>
          ) : null}
        </ScrollView>
        {screen === 'onboarding' && (
          <View style={[styles.stepActions, { backgroundColor: colors.background }]} >
            {error ? <Text accessibilityRole="alert" style={[styles.error, heading]}>{error}</Text> : null}
            {button(step === 4 ? 'Terminer' : 'Continuer', next, true)}
            {(step === 0 || step === 1 || step === 3) && link('Passer cette étape', next)}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 },
  onboardingContent: { paddingTop: 8, paddingBottom: 8 },
  auth: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center', justifyContent: 'center' },
  topLogoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  themeToggleBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24 },
  logoBacking: { alignSelf: 'flex-start', backgroundColor: '#F7F5F0', borderRadius: 12, padding: 8, marginBottom: 8 },
  logo: { width: 225, height: 44 }, back: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginLeft: -12, marginBottom: 8 },
  title: { fontFamily: 'Montserrat_700Bold', fontSize: 27, lineHeight: 35, marginBottom: 10 },
  intro: { fontFamily: 'Poppins_400Regular', fontSize: 15, lineHeight: 23, marginBottom: 20 },
  field: { marginTop: 14 }, fieldRow: { flexDirection: 'row', gap: 12 }, fieldColumn: { flex: 1 }, label: { fontFamily: 'Montserrat_600SemiBold', fontSize: 14, marginBottom: 8 },
  input: { minHeight: 52, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, fontSize: 15, fontFamily: 'Poppins_400Regular' },
  passwordField: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, minHeight: 52 },
  passwordInput: { flex: 1, minHeight: 52, paddingHorizontal: 16, fontSize: 15, fontFamily: 'Poppins_400Regular' },
  eye: { width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  error: { marginTop: 16, fontFamily: 'Poppins_500Medium', fontSize: 14 },
  buttonTouch: { marginTop: 28, width: '100%' },
  button: { minHeight: 54, borderRadius: 12, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  buttonText: { fontFamily: 'Montserrat_600SemiBold', fontSize: 15, textAlign: 'center' },
  pressed: { opacity: controls.pressedOpacity },
  linkTouch: { minHeight: 48, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
  link: { fontFamily: 'Montserrat_600SemiBold', fontSize: 14, textAlign: 'center' },
  onboarding: { width: '100%', maxWidth: 480, alignSelf: 'center', flex: 1 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepLabel: { fontFamily: 'Montserrat_600SemiBold', fontSize: 12 },
  progressRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  progress: { height: 4, borderRadius: 4, flex: 1 },
  section: { fontFamily: 'Montserrat_600SemiBold', fontSize: 17, marginTop: 24, marginBottom: 4 },
  hint: { fontFamily: 'Poppins_400Regular', fontSize: 12, lineHeight: 19, marginTop: 8 },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 8 },
  photo: { width: 64, height: 64, borderRadius: 32, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  photoImage: { width: '100%', height: '100%', borderRadius: 31 },
  photoBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  photoDetails: { alignItems: 'flex-start' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: { minHeight: 44, borderRadius: 22, borderWidth: 1, paddingHorizontal: 16, justifyContent: 'center' },
  chipText: { fontFamily: 'Poppins_500Medium', fontSize: 13 },
  choice: { minHeight: 62, borderWidth: 1, borderRadius: 14, padding: 16, marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  choiceText: { flex: 1 }, choiceTitle: { fontFamily: 'Montserrat_600SemiBold', fontSize: 14, lineHeight: 21 },
  choiceDescription: { fontFamily: 'Poppins_400Regular', fontSize: 12, lineHeight: 19, marginTop: 3 },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  switchRow: { minHeight: 80, padding: 16, borderWidth: 1, borderRadius: 14, marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  buttonTouchCompact: { marginTop: 0 },
  stepActions: { width: '100%', maxWidth: 528, alignSelf: 'center', paddingHorizontal: 24, paddingBottom: 8 },
  dropdownInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 14 },
  dropdownContent: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  dropdownFlag: { fontSize: 18, lineHeight: 22 },
  dropdownValue: { fontFamily: 'Poppins_400Regular', fontSize: 15, flex: 1 },
  disabledInput: { opacity: 0.45 },
  disabledChoice: { opacity: 0.45 },
  disabledText: { opacity: 0.6 },
});
