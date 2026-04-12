import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.projectlilac',
  appName: 'Lilac',
  webDir: 'out',
  server: {
    // Point to live Vercel deployment to preserve API routes & NextAuth
    url: 'https://projectlilac.app',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FAF7F2',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#FAF7F2',
    },
  },
};

export default config;
