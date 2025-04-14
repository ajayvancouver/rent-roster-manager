
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.6406d9701c2445bba170417ddab7e66a',
  appName: 'rent-roster-manager',
  webDir: 'dist',
  server: {
    url: 'https://6406d970-1c24-45bb-a170-417ddab7e66a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'always',
    scheme: 'RentRosterManager'
  },
  android: {
    buildOptions: {
      keystorePath: 'rent-roster-manager.keystore',
      keystoreAlias: 'rent-roster-manager',
      releaseType: 'AAB'
    }
  }
};

export default config;
