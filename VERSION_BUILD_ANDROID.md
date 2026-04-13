# Versioning et build Android

- Modifie la version dans `app.config.js` (champ `version`) et dans `package.json`.
- Pour chaque build Play Store, incrémente aussi `versionCode` dans `app.config.js` > `android` :

```
android: {
  versionCode: 2, // Incrémente à chaque release Play Store
  ...
}
```

- Pour un build de test (APK) :
  `eas build --platform android --profile development`

- Pour un build Play Store (AAB) :
  `eas build --platform android --profile production`

- Pour la signature, laisse Expo gérer ou configure tes propres clés via `eas credentials`.

Voir aussi le fichier EAS_ANDROID.md pour le workflow complet.
