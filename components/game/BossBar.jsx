import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function BossBar({ boss }) {
  const animWidth = useRef(new Animated.Value(1)).current;
  const prevPercent = useRef(1);

  const percent = boss ? Math.max(0, Math.min(1, boss.hp / boss.maxHp)) : 1;

  useEffect(() => {
    if (!boss) return;
    Animated.timing(animWidth, {
      toValue: percent,
      duration: 200,
      useNativeDriver: false,
    }).start();
    prevPercent.current = percent;
  }, [percent]);

  if (!boss) return null;

  // Couleur de la barre selon les PV
  const barColor = percent > 0.5 ? '#FF4444'
                 : percent > 0.25 ? '#FF8800'
                 : '#FF0055';

  // Emoji phase boss
  const phaseIcon = percent > 0.5 ? '' : percent > 0.25 ? ' ⚡' : ' ☠';

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{boss.name || 'BOSS'}{phaseIcon}</Text>
      <View style={styles.barBg}>
        <Animated.View
          style={[
            styles.barFill,
            {
              backgroundColor: barColor,
              width: animWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
        {/* Marqueur de phase à 50% */}
        <View style={[styles.phaseMarker, { left: '50%' }]} />
        {/* Marqueur de phase à 25% */}
        <View style={[styles.phaseMarker, { left: '25%' }]} />
      </View>
      <Text style={styles.hp}>{Math.ceil(boss.hp)} / {Math.ceil(boss.maxHp)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 32,
    left: 20,
    right: 20,
    zIndex: 100,
    alignItems: 'center',
    backgroundColor: 'rgba(10,10,20,0.90)',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,80,80,0.4)',
  },
  name: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 4,
    letterSpacing: 1,
  },
  barBg: {
    width: '100%',
    height: 16,
    backgroundColor: '#222',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 3,
    position: 'relative',
  },
  barFill: {
    height: '100%',
    borderRadius: 8,
  },
  phaseMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  hp: {
    color: '#AAA',
    fontSize: 12,
    marginTop: 1,
  },
});
