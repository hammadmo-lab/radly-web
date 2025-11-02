import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.radly.app',
  appName: 'Radly',
  webDir: 'out',
  server: {
    iosScheme: 'capacitor',
    androidScheme: 'https',
    hostname: 'localhost',
  },
  ios: {
    packageClassList: ['App.RadlyGoogleAuth'],
  },
};

export default config;
