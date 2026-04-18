export default {
  expo: {
    name: 'Breach',
    slug: 'breach-autobattle',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#0A0A0F',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.kilanga.breach',
    },
    android: {
      versionCode: 1,
      statusBar: {
        translucent: false,
        backgroundColor: '#0A0A0F',
      },
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0A0A0F',
      },
      package: 'com.kilanga.breach',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      supabaseUrl:     process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
  },
};
