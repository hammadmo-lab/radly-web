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
};

export default config;

