import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { PALETTE, TUTORIAL_STEPS } from '../constants';
import { useT } from '../utils/i18n';

// ...existing code...

export default function TutorialScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const stepData = TUTORIAL_STEPS[step];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={{fontSize:48, textAlign:'center'}}>{stepData.icon}</Text>
        <Text style={styles.title}>{stepData.title}</Text>
        <Text style={styles.desc}>{stepData.desc}</Text>
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
