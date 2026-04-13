/**
 * BREACH — TutorialOverlay
 * Overlay d'introduction affiché au premier run.
 * Se ferme automatiquement après 8 secondes ou sur tap.
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card, Title, Body, PALETTE } from '../ui';
import { useT } from '../../utils/i18n';

const HINTS = [
  { icon: '🕹', key: 'tutorial_move' },
  { icon: '⚔', key: 'tutorial_attack' },
  { icon: '✨', key: 'tutorial_orbs' },
  { icon: '🛡', key: 'tutorial_win' },
];

export default function TutorialOverlay({ onDismiss }) {
  const t = useT();
  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <TouchableOpacity style={styles.overlay} onPress={onDismiss} activeOpacity={1}>
      <Card style={{ alignItems: 'center', width: 300, gap: 10 }}>
        <Title style={{ fontSize: 17, marginBottom: 6, textAlign: 'center' }}>{t('tutorial_title') || 'Comment jouer'}</Title>
        {HINTS.map((h, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Body style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{h.icon}</Body>
            <Body style={{ fontSize: 13, color: PALETTE.textDim, flex: 1, lineHeight: 18 }}>{t(h.key) || ''}</Body>
          </View>
        ))}
        <Body style={{ fontSize: 10, color: PALETTE.textDim, textAlign: 'center', marginTop: 6, letterSpacing: 0.5 }}>{t('tutorial_dismiss') || 'Touchez pour fermer'}</Body>
      </Card>
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
});
