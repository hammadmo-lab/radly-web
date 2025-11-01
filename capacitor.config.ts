import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.radly.app',
  appName: 'Radly',
  webDir: 'out',

  server: {
    // Use capacitor:// scheme for iOS (recommended)
    iosScheme: 'capacitor',
    // Use https:// scheme for Android (required for secure content)
    androidScheme: 'https',
    // Allow Supabase OAuth redirect to work with capacitor:// scheme
    hostname: 'localhost',
    // Android: Allow cleartext traffic for localhost OAuth callback
    allowNavigation: ['*'],
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0A0F1E', // Match app dark background
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#2653FF', // Brand primary color
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'dark', // Dark text for light status bar
      backgroundColor: '#0A0F1E', // Match app background
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    CapacitorSocialLogin: {
      iOSAppleLogin: true,
      iOSGoogleLogin: true,
      androidAppleLogin: true,
      androidGoogleLogin: true,
      appleClientId: 'com.radly.app.signin',
      appleServiceId: 'com.radly.app.signin',
      appleTeamId: '5C282NCY69',
      googleWebClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      googleiOSClientId: '590422684479-22888vk8gimtopgpl0hnkiimqs03v9qo.apps.googleusercontent.com',
      googleiOSServerClientId: '590422684479-qjrih3fq3086q1gh6o3qj0maj0lnf9m0.apps.googleusercontent.com',
    },
    RadlyGoogleAuth: {
      clientId: '590422684479-qjrih3fq3086q1gh6o3qj0maj0lnf9m0.apps.googleusercontent.com',
    },
  },
};

export default config;
