# Documentation EAS Build Android

1. Installe Expo CLI et EAS CLI si besoin :
   npm install -g expo-cli eas-cli

2. Connecte-toi à Expo :
   eas login

3. Configure ton projet (déjà fait : app.config.js, eas.json)

4. Pour un build de développement (APK installable directement) :
   eas build --platform android --profile development

5. Pour un build de production (AAB pour le Play Store) :
   eas build --platform android --profile production

6. Pour gérer les signatures :
   eas credentials
   (ou laisse Expo gérer automatiquement)

7. Pour incrémenter la version :
   - Modifie "version" dans app.config.js et package.json
   - Modifie "versionCode" dans app.config.js > android (si besoin)

8. Pour publier sur le Play Store :
   - Utilise le .aab généré par le build production
   - Suis les instructions du Play Console

Voir la doc officielle : https://docs.expo.dev/build/introduction/
