/**
 * BREACH — VictoryScreen
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useGameStore from '../store/gameStore';
import { PALETTE } from '../constants';

const { width: W } = Dimensions.get('window');

export default function VictoryScreen() {
  const goToMenu        = useGameStore(s => s.goToMenu);
  const goToShapeSelect = useGameStore(s => s.goToShapeSelect);
  const meta            = useGameStore(s => s.meta);
  const lastRun = meta.runHistory?.[0];

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.panel}>
        <Text style={styles.title}>🏆 VICTOIRE !</Text>
        <Text style={styles.sub}>Tu as survécu au Breach !</Text>

        {lastRun && (
          <View style={styles.stats}>
            <StatRow label="Temps de survie" value={formatTime(lastRun.survivalTime)} highlight />
            <StatRow label="Score"           value={(lastRun.score || 0).toLocaleString()} />
            <StatRow label="Niveau atteint"  value={`Niv. ${lastRun.level || 1}`} />
            <StatRow label="Ennemis tués"    value={lastRun.kills} />
            <StatRow label="Classe"          value={lastRun.shape} />
          </View>
        )}

        <View style={styles.fragRow}>
          <Text style={styles.fragLabel}>⬆ Nouveaux fragments gagnés !</Text>
          <Text style={styles.fragSub}>Débloquez des améliorations permanentes dans l'arbre des talents.</Text>
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

function StatRow({ label, value, highlight }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, highlight && { color: '#FFCC44', fontSize: 16 }]}>{value}</Text>
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
  panel:    { width: Math.min(W - 40, 380), backgroundColor: PALETTE.bgCard, borderRadius: 16, borderWidth: 1, borderColor: '#FFCC44', padding: 28, alignItems: 'center' },
  title:    { fontSize: 40, fontWeight: 'bold', color: '#FFCC44', marginBottom: 8 },
  sub:      { fontSize: 14, color: PALETTE.textMuted, marginBottom: 24 },
  stats:    { width: '100%', gap: 10, marginBottom: 20 },
  statRow:  { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderColor: PALETTE.border },
  statLabel:{ fontSize: 13, color: PALETTE.textMuted },
  statValue:{ fontSize: 13, color: PALETTE.textPrimary, fontWeight: 'bold' },
  fragRow:  { backgroundColor: 'rgba(255,204,68,0.08)', borderRadius: 10, padding: 14, width: '100%', marginBottom: 20, borderWidth: 1, borderColor: '#FFCC4440' },
  fragLabel:{ fontSize: 14, color: '#FFCC44', fontWeight: 'bold', marginBottom: 4 },
  fragSub:  { fontSize: 12, color: PALETTE.textMuted, lineHeight: 17 },
  btn:      { backgroundColor: '#2A2A1A', borderRadius: 10, borderWidth: 1, borderColor: '#FFCC44', padding: 16, width: '100%', alignItems: 'center', marginBottom: 10 },
  btnText:  { fontSize: 16, color: '#FFCC44', fontWeight: 'bold' },
  btnSecondary: { padding: 12 },
  btnSecText:   { color: PALETTE.textMuted, fontSize: 14 },
});
