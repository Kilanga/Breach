/**
 * BREACH — GameOverScreen
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useGameStore from '../store/gameStore';
import { PALETTE } from '../constants';

const { width: W } = Dimensions.get('window');

export default function GameOverScreen() {
  const goToMenu       = useGameStore(s => s.goToMenu);
  const goToShapeSelect = useGameStore(s => s.goToShapeSelect);
  const meta           = useGameStore(s => s.meta);

  const lastRun = meta.runHistory?.[0];
  const bestTime = meta.bestSurvivalTime || 0;
  const bm = Math.floor(bestTime / 60);
  const bs = Math.floor(bestTime % 60);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.panel}>
        <Text style={styles.title}>☠ MORT</Text>
        <Text style={styles.sub}>Le Breach t'a consumé...</Text>

        {lastRun && (
          <View style={styles.stats}>
            <StatRow label="Temps de survie" value={formatTime(lastRun.survivalTime)} />
            <StatRow label="Ennemis tués"    value={lastRun.kills} />
            <StatRow label="Classe"          value={lastRun.shape} />
          </View>
        )}

        <View style={styles.bestRow}>
          <Text style={styles.bestLabel}>🏆 Meilleur temps</Text>
          <Text style={styles.bestValue}>{bm}:{bs.toString().padStart(2,'0')}</Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={goToShapeSelect} activeOpacity={0.8}>
          <Text style={styles.btnText}>🔄 Rejouer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={goToMenu} activeOpacity={0.8}>
          <Text style={styles.btnSecText}>← Menu</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function StatRow({ label, value }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  root:     { flex: 1, backgroundColor: PALETTE.bg, alignItems: 'center', justifyContent: 'center' },
  panel:    { width: Math.min(W - 40, 380), backgroundColor: PALETTE.bgCard, borderRadius: 16, borderWidth: 1, borderColor: '#FF4455', padding: 28, alignItems: 'center' },
  title:    { fontSize: 48, fontWeight: 'bold', color: '#FF4455', marginBottom: 8 },
  sub:      { fontSize: 13, color: PALETTE.textMuted, marginBottom: 24 },
  stats:    { width: '100%', gap: 10, marginBottom: 20 },
  statRow:  { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderColor: PALETTE.border },
  statLabel:{ fontSize: 13, color: PALETTE.textMuted },
  statValue:{ fontSize: 13, color: PALETTE.textPrimary, fontWeight: 'bold' },
  bestRow:  { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 24, backgroundColor: 'rgba(255,204,68,0.1)', borderRadius: 8, padding: 10, width: '100%', justifyContent: 'space-between' },
  bestLabel:{ fontSize: 13, color: '#FFCC44' },
  bestValue:{ fontSize: 18, fontWeight: 'bold', color: '#FFCC44' },
  btn:      { backgroundColor: '#1A3A2A', borderRadius: 10, borderWidth: 1, borderColor: PALETTE.hp, padding: 16, width: '100%', alignItems: 'center', marginBottom: 10 },
  btnText:  { fontSize: 16, color: PALETTE.hp, fontWeight: 'bold' },
  btnSecondary: { padding: 12 },
  btnSecText:   { color: PALETTE.textMuted, fontSize: 14 },
});
