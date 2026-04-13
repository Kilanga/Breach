/**
 * BREACH — TutorialOverlay
 * Overlay d'introduction affiché au premier run.
 * Se ferme automatiquement après 8 secondes ou sur tap.
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PALETTE } from '../../constants';

const HINTS = [
  { icon: '🕹', text: 'Joystick en bas à gauche pour vous déplacer' },
  { icon: '⚔', text: 'Les attaques sont automatiques' },
  { icon: '✨', text: 'Collectez les orbes dorés pour monter en niveau' },
  { icon: '🛡', text: 'En mode standard, survivez 5 minutes pour gagner' },
];

export default function TutorialOverlay({ onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <TouchableOpacity style={styles.overlay} onPress={onDismiss} activeOpacity={1}>
      <View style={styles.box}>
        <Text style={styles.title}>Comment jouer</Text>
        {HINTS.map((h, i) => (
          <View key={i} style={styles.hintRow}>
            <Text style={styles.hintIcon}>{h.icon}</Text>
            <Text style={styles.hintText}>{h.text}</Text>
          </View>
        ))}
        <Text style={styles.dismiss}>Touchez pour fermer</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  box: {
    backgroundColor: PALETTE.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PALETTE.borderLight,
    padding: 20,
    width: 300,
    gap: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: PALETTE.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hintIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  hintText: { fontSize: 13, color: PALETTE.textMuted, flex: 1, lineHeight: 18 },
  dismiss: {
    fontSize: 10,
    color: PALETTE.textDim,
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 0.5,
  },
});
