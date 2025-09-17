import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f1a651ea65764aa6804b66e8ab8a2d51',
  appName: 'Cricket Coach Mental Ability',
  webDir: 'dist',
  server: {
    url: 'https://f1a651ea-6576-4aa6-804b-66e8ab8a2d51.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#22c55e",
      showSpinner: false
    }
  }
};

export default config;