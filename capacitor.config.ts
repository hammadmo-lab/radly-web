import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.radly.app',
  appName: 'Radly',
  webDir: 'out',
  server: {
    iosScheme: 'capacitor',
    androidScheme: 'https',
    hostname: 'localhost',
    // Enable client-side routing fallback
    cleartext: true,
    allowNavigation: ['*'],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      androidScaleType: 'FIT_CENTER',
      showSpinner: false,
    },
  },
};

export default config;