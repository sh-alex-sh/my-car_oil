import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.caroil.tracker',
  appName: '油耗记录',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
