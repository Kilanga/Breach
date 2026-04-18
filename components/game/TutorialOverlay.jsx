/**
 * BREACH — TutorialOverlay
 * Overlay d'introduction affiché au premier run.
 * Se ferme automatiquement après 8 secondes ou sur tap.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Card, Title, Body, PALETTE } from '../ui';
import { useT } from '../../utils/i18n';

const HINTS = [
  { icon: '🕹', key: 'tutorial_move', highlight: 'joystick' },
  { icon: '⚔', key: 'tutorial_attack', highlight: 'player' },
  { icon: '✨', key: 'tutorial_orbs' },
  { icon: '🛡', key: 'tutorial_win' },
];

export default function TutorialOverlay({ onDismiss }) {
  const t = useT();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    const timer = setTimeout(onDismiss, 9000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}> 
      <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={onDismiss} activeOpacity={1}>
        <Card style={{ alignItems: 'center', width: 300, gap: 10, paddingBottom: 12 }}>
          <Title style={{ fontSize: 17, marginBottom: 6, textAlign: 'center' }}>{t('tutorial_title') || 'Comment jouer'}</Title>
          {HINTS.map((h, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Body style={{ fontSize: 20, width: 28, textAlign: 'center',
                textShadowColor: h.highlight === 'joystick' ? '#FFD700' : h.highlight === 'player' ? '#00E0FF' : undefined,
                textShadowOffset: h.highlight ? { width: 0, height: 0 } : undefined,
                textShadowRadius: h.highlight ? 8 : 0,
              }}>{h.icon}</Body>
              <Body style={{ fontSize: 13, color: PALETTE.textDim, flex: 1, lineHeight: 18 }}>{t(h.key) || ''}</Body>
            </View>
          ))}
          <TouchableOpacity style={styles.okBtn} onPress={onDismiss} activeOpacity={0.85}>
            <Text style={styles.okBtnText}>{t('tutorial_ok') || 'OK'}</Text>
          </TouchableOpacity>
          <Body style={{ fontSize: 10, color: PALETTE.textDim, textAlign: 'center', marginTop: 2, letterSpacing: 0.5 }}>{t('tutorial_dismiss') || 'Touchez pour fermer'}</Body>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.68)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  okBtn: {
    marginTop: 10,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 6,
    alignSelf: 'center',
    minWidth: 80,
  },
  okBtnText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
    letterSpacing: 1,
  },
});
