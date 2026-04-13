# Crash reporting Sentry (Expo/React Native)

1. Crée un projet sur https://sentry.io/ et récupère ton DSN.
2. Ajoute la variable d’environnement dans `.env` :
   EXPO_PUBLIC_SENTRY_DSN=ton_dsn
3. Le crash reporting est initialisé automatiquement dans App.jsx si le DSN est présent.
4. Pour tester :
   - Lance l’app, force une erreur JS (ex: throw new Error('test sentry'))
   - Vérifie la réception dans Sentry.

Voir la doc officielle : https://docs.sentry.io/platforms/react-native/
