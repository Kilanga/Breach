import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { PALETTE } from '../constants';

const TUTORIAL_STEPS = [
  {
    title: 'Bienvenue dans BREACH!',
    desc: 'Survis le plus longtemps possible dans l’arène. Déplace-toi, évite les ennemis et collecte l’XP pour devenir plus fort.'
  },
  {
    title: 'Déplacement',
    desc: 'Utilise le joystick virtuel pour déplacer ton personnage dans l’arène.'
  },
  {
    title: 'Attaque automatique',
    desc: 'Ton personnage attaque automatiquement les ennemis proches. Améliore tes stats et choisis des upgrades pour survivre.'
  },
  {
    title: 'Upgrades',
    desc: 'À chaque level-up, choisis une amélioration parmi 3 options. Combine les synergies de couleur pour des bonus puissants.'
  },
  {
    title: 'Boss & Vagues',
    desc: 'Des boss apparaissent régulièrement. Prépare-toi à leurs patterns uniques et reste mobile!'
  },
  {
    title: 'Bonne chance!',
    desc: 'Découvre toutes les classes, upgrades et secrets du Breach. À toi de jouer!'
  }
];

export default function TutorialScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const current = TUTORIAL_STEPS[step];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.desc}>{current.desc}</Text>
      </ScrollView>
      <View style={styles.footer}>
        {step > 0 && (
          <TouchableOpacity style={styles.button} onPress={() => setStep(step - 1)}>
            <Text style={styles.buttonText}>Précédent</Text>
          </TouchableOpacity>
        )}
        {step < TUTORIAL_STEPS.length - 1 ? (
          <TouchableOpacity style={styles.button} onPress={() => setStep(step + 1)}>
            <Text style={styles.buttonText}>Suivant</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Terminer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.bg,
    padding: 24,
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: PALETTE.textPrimary,
    marginBottom: 18,
    textAlign: 'center',
  },
  desc: {
    fontSize: 18,
    color: PALETTE.textMuted,
    textAlign: 'center',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    backgroundColor: PALETTE.upgradeBlue,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
