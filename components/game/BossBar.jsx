import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BossBar({ boss }) {
  if (!boss) return null;
  const percent = Math.max(0, Math.min(1, boss.hp / boss.maxHp));
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{boss.name || 'BOSS'}</Text>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${percent * 100}%` }]} />
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
    backgroundColor: 'rgba(30,30,30,0.85)',
    borderRadius: 12,
    padding: 8,
  },
  name: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 2,
  },
  barBg: {
    width: '100%',
    height: 18,
    backgroundColor: '#333',
    borderRadius: 9,
    overflow: 'hidden',
    marginBottom: 2,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#FF4444',
    borderRadius: 9,
  },
  hp: {
    color: '#FFF',
    fontSize: 13,
    marginTop: 1,
  },
});
