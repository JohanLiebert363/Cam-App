import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import {
  useFonts,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './lib/supabase';
import { Ionicons } from '@expo/vector-icons';

const STRINGS = {
  en: {
    welcomeTo: 'Welcome to',
    tagline: 'An app for your home.',
    getStarted: 'Get started →',
    login: 'Login',
    signUp: 'Sign up',
    loginSub: "Let's get your home connected.",
    email: 'Email',
    password: 'Password',
    enterEmail: 'Enter your email',
    enterPassword: 'Enter your password',
    wait: 'Please wait...',
    haveAccount: 'Already have an account?',
    noAccount: "Don't have an account?",
    missingTitle: 'Missing info',
    missingMsg: 'Enter your email and password.',
    errorTitle: 'Error',
    signedUp: 'You signed up. Now login',
    home: 'Home',
    profile: 'Profile',
    settings: 'Settings',
    noCameras: 'No cameras yet',
    noCamerasText: 'Add your first camera to start watching your home.',
    addCamera: 'Add camera',
    memberSince: 'Member since',
    logout: 'Log out',
    notifications: 'Notifications',
    motionAlerts: 'Motion alerts',
    language: 'Language',
  },
  sr: {
    welcomeTo: 'Dobrodošli u',
    tagline: 'Aplikacija za vaš dom.',
    getStarted: 'Započni →',
    login: 'Prijava',
    signUp: 'Registracija',
    loginSub: 'Hajde da povežemo vaš dom.',
    email: 'Email',
    password: 'Lozinka',
    enterEmail: 'Unesite email',
    enterPassword: 'Unesite lozinku',
    wait: 'Sačekajte...',
    haveAccount: 'Već imate nalog?',
    noAccount: 'Nemate nalog?',
    missingTitle: 'Nedostaju podaci',
    missingMsg: 'Unesite email i lozinku.',
    errorTitle: 'Greška',
    signedUp: 'Registrovali ste se. Sada se prijavite.',
    home: 'Početna',
    profile: 'Profil',
    settings: 'Podešavanja',
    noCameras: 'Još nema kamera',
    noCamerasText: 'Dodajte prvu kameru da biste počeli da pratite svoj dom.',
    addCamera: 'Dodaj kameru',
    memberSince: 'Član od',
    logout: 'Odjava',
    notifications: 'Obaveštenja',
    motionAlerts: 'Upozorenja o pokretu',
    language: 'Jezik',
  },
};

const TABS = [
  { key: 'home', icon: 'home-outline', activeIcon: 'home' },
  { key: 'profile', icon: 'person-circle-outline', activeIcon: 'person-circle' },
  { key: 'settings', icon: 'settings-outline', activeIcon: 'settings' },
];

export default function App() {
  const [lang, setLang] = useState('en');
  const [tab, setTab] = useState('home');
  const [notifications, setNotifications] = useState(true);
  const [motionAlerts, setMotionAlerts] = useState(false);
  const [setup, setSetup] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);

  const t = (key) => STRINGS[lang][key];

  const [fontsLoaded] = useFonts({
    Nunito_800ExtraBold,
    Nunito_900Black,
    BBHBartle: require('./assets/fonts/BBHBartle-Regular.ttf'),
  });

  // Load saved language
  useEffect(() => {
    AsyncStorage.getItem('lang').then((saved) => {
      if (saved === 'en' || saved === 'sr') setLang(saved);
    });
  }, []);

  const changeLanguage = (l) => {
    setLang(l);
    AsyncStorage.setItem('lang', l);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) =>
      setSession(s)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!fontsLoaded) return null;

  const onGetStarted = () => setSetup(true);

  const handleAuth = async () => {
    if (!email.trim() || !password) {
      return Alert.alert(t('missingTitle'), t('missingMsg'));
    }
    setLoading(true);

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (error) Alert.alert(t('errorTitle'), error.message);
      else if (!data.session) Alert.alert(t('signedUp'));
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) Alert.alert(t('errorTitle'), error.message);
    }

    setLoading(false);
  };

  // Logged in
  if (session) {
    return (
      <View style={styles.appContainer}>
        <View style={styles.header}>
          <Text style={styles.logo}>CamApp</Text>
          <Text style={styles.pageTitle}>{t(tab)}</Text>
        </View>

        <View style={styles.content}>
          {tab === 'home' && (
            <View style={styles.card}>
              <Ionicons name="videocam-outline" size={40} color="#815f5a" />
              <Text style={styles.cardTitle}>{t('noCameras')}</Text>
              <Text style={styles.cardText}>{t('noCamerasText')}</Text>
              <Pressable
                onPress={() => console.log('Add camera clicked!')}
                style={({ pressed }) => [styles.button, pressed && styles.pressed]}
              >
                <Text style={styles.text}>{t('addCamera')}</Text>
              </Pressable>
            </View>
          )}

          {tab === 'profile' && (
            <View style={styles.card}>
              <Ionicons name="person-circle" size={72} color="#815f5a" />
              <Text style={styles.cardLabel}>{t('email')}</Text>
              <Text style={styles.cardValue}>{session.user.email}</Text>

              <Text style={styles.cardLabel}>{t('memberSince')}</Text>
              <Text style={styles.cardValue}>
                {new Date(session.user.created_at).toLocaleDateString(
                  lang === 'sr' ? 'sr-RS' : 'en-GB'
                )}
              </Text>

              <Pressable
                onPress={() => supabase.auth.signOut()}
                style={({ pressed }) => [
                  styles.button,
                  { marginTop: 24 },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.text}>{t('logout')}</Text>
              </Pressable>
            </View>
          )}

          {tab === 'settings' && (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.rowText}>{t('notifications')}</Text>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ true: '#815f5a', false: '#c9b8ad' }}
                />
              </View>
              <View style={styles.row}>
                <Text style={styles.rowText}>{t('motionAlerts')}</Text>
                <Switch
                  value={motionAlerts}
                  onValueChange={setMotionAlerts}
                  trackColor={{ true: '#815f5a', false: '#c9b8ad' }}
                />
              </View>
              <View style={styles.row}>
                <Text style={styles.rowText}>{t('language')}</Text>
                <View style={styles.langWrap}>
                  {[
                    { code: 'en', label: 'EN' },
                    { code: 'sr', label: 'SR' },
                  ].map((l) => (
                    <Pressable
                      key={l.code}
                      onPress={() => changeLanguage(l.code)}
                      style={[
                        styles.langBtn,
                        lang === l.code && styles.langBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.langText,
                          lang === l.code && styles.langTextActive,
                        ]}
                      >
                        {l.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.tabBar}>
          {TABS.map((tb) => {
            const active = tab === tb.key;
            return (
              <Pressable
                key={tb.key}
                onPress={() => setTab(tb.key)}
                style={({ pressed }) => [
                  styles.tabButton,
                  active && styles.tabButtonActive,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name={active ? tb.activeIcon : tb.icon}
                  size={26}
                  color="#fff0f0"
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  // Login / Sign up
  if (setup) {
    return (
      <View style={styles.container}>
        <Pressable onPress={() => setSetup(false)} style={styles.goBack}>
          <Text style={styles.text}>←</Text>
        </Pressable>
        <Text style={styles.title}>{isSignUp ? t('signUp') : t('login')}</Text>
        <Text style={styles.subtitle}>{t('loginSub')}</Text>

        <View style={styles.loginC}>
          <Text style={styles.loginText}>{t('email')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('enterEmail')}
            placeholderTextColor="#958B9C"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.loginText}>{t('password')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('enterPassword')}
            placeholderTextColor="#958B9C"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            onPress={handleAuth}
            disabled={loading}
            style={({ pressed }) => [
              styles.loginBtn,
              (pressed || loading) && styles.pressed,
            ]}
          >
            <Text style={styles.text}>
              {loading ? t('wait') : isSignUp ? t('signUp') : t('login')}
            </Text>
          </Pressable>

          <Text style={styles.hv}>
            {isSignUp ? t('haveAccount') : t('noAccount')}
          </Text>
          <Pressable onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={styles.link}>{isSignUp ? t('login') : t('signUp')}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Welcome
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('welcomeTo')}</Text>
      <Text style={styles.name}>CamApp</Text>
      <Text style={styles.subtitle}>{t('tagline')}</Text>
      <Pressable
        onPress={onGetStarted}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.text}>{t('getStarted')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffe5d4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  title: {
    fontFamily: 'Nunito_900Black',
    fontSize: 40,
    color: '#2f2625',
    textAlign: 'center',
  },

  name: {
    fontFamily: 'BBHBartle',
    fontSize: 36,
    color: '#2f2625',
  },

  subtitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: '#958B9C',
    marginTop: 12,
    marginBottom: 32,
    textAlign: 'center',
  },

  button: {
    width: '90%',
    height: 58,
    backgroundColor: '#815f5a',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#875e57',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },
  goBack: {
    width: '15%',
    height: 48,
    backgroundColor: '#815f5a',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#875e57',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    left: -160,
    marginBottom: 20,
    top: -30
  },

  text: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 17,
    color: '#FFFFFF',
  },

  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  loginC: {
    backgroundColor: '#e5cebf',
    width: '94%',
    height: 400,
    padding: 24,
    borderRadius: 30,
    marginBottom: 20,
  },
  input: {
    width: '97%',
    height: 55,
    backgroundColor: '#f0e0d1',
    borderRadius: 18,
    paddingHorizontal: 18,
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: '#2f2625',
    borderWidth: 1,
    borderColor: '#e6c9b8',
    marginBottom: 10,
  },
  loginText: {
    fontFamily: 'Nunito_800ExtraBold',
    color: '#2f2625',
    fontSize: 20,
    marginLeft: 10,
    elevation: 5,
    marginBottom: 10,
  },
  loginBtn: {
    width: '90%',
    height: 58,
    backgroundColor: '#815f5a',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#875e57',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 10,
    marginLeft: 10,
  },
  account: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 5,
  },

  hv: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    marginTop: 20,
  },

  link: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: '#815f5a',
    textDecorationLine: 'underline',
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#ffe5d4',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  logo: {
    fontFamily: 'BBHBartle',
    fontSize: 16,
    color: '#2f2625',
  },
  pageTitle: {
    fontFamily: 'Nunito_900Black',
    fontSize: 34,
    color: '#2f2625',
    marginTop: 8,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: '#e5cebf',
    borderRadius: 30,
    padding: 24,
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: 'Nunito_900Black',
    fontSize: 22,
    color: '#2f2625',
    marginTop: 12,
  },
  cardText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: '#958B9C',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  cardLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: '#958B9C',
    marginTop: 16,
  },
  cardValue: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: '#2f2625',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
  },
  rowText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: '#2f2625',
  },
  tabBar: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#524644',
    borderRadius: 30,
    padding: 7,
  },
  tabButton: {
    width: 110,
    height: 54,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#815f5a',
  },
    langWrap: {
    flexDirection: 'row',
    backgroundColor: '#f0e0d1',
    borderRadius: 18,
    padding: 4,
    gap: 4,
  },
  langBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  langBtnActive: {
    backgroundColor: '#815f5a',
  },
  langText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: '#815f5a',
  },
  langTextActive: {
    color: '#FFFFFF',
  },
});
