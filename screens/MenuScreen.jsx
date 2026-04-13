/**
 * BREACH — MenuScreen
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useGameStore from '../store/gameStore';
import { PALETTE } from '../constants';
import pkg from '../package.json';

const { width: W } = Dimensions.get('window');

export default function MenuScreen() {
  const goToShapeSelect   = useGameStore(s => s.goToShapeSelect);
  const goToAchievements  = useGameStore(s => s.goToAchievements);
  const goToSettings      = useGameStore(s => s.goToSettings);
  const goToTalentTree    = useGameStore(s => s.goToTalentTree);
  const meta              = useGameStore(s => s.meta);

  const bestTime = meta.bestSurvivalTime || 0;
  const bestM = Math.floor(bestTime / 60);
  const bestS = Math.floor(bestTime % 60);

  return (
    <SafeAreaView style={styles.root}>
      {/* Title */}
      <View style={styles.titleBlock}>
        <Text style={styles.title}>BREACH</Text>
        <Text style={styles.sub}>Auto-battle · Survive · Upgrade</Text>
      </View>

      {/* Stats rapides */}
      <View style={styles.statsRow}>
        <StatCell label="Runs" value={meta.totalRuns || 0} />
        <StatCell label="Kills" value={meta.totalKills || 0} />
        <StatCell label="Best" value={`${bestM}:${bestS.toString().padStart(2,'0')}`} />
      </View>

      {/* Boutons */}
      <View style={styles.buttons}>
        <Button label="🎮  JOUER" primary onPress={goToShapeSelect} />
        <Button label="🏆  Talents"   onPress={goToTalentTree} />
        <Button label="🥇  Succès"    onPress={goToAchievements} />
        <Button label="⚙   Paramètres" onPress={goToSettings} />
      </View>

      <Text style={styles.version}>v{pkg.version} · Kilanga</Text>
    </SafeAreaView>
  );
}

function StatCell({ label, value }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Button({ label, onPress, primary }) {
  return (
    <TouchableOpacity
      style={[styles.btn, primary && styles.btnPrimary]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.btnText, primary && styles.btnTextPrimary]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PALETTE.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },

  titleBlock: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 56, fontWeight: 'bold', color: PALETTE.textPrimary, letterSpacing: 8 },
  sub:   { fontSize: 14, color: PALETTE.textMuted, letterSpacing: 2, marginTop: 4 },

  statsRow: {
    flexDirection: 'row', gap: 16, marginBottom: 40,
    backgroundColor: PALETTE.bgCard,
    borderRadius: 12, padding: 16, borderWidth: 1, borderColor: PALETTE.border,
  },
  statCell: { alignItems: 'center', minWidth: 70 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: PALETTE.textPrimary },
  statLabel: { fontSize: 10, color: PALETTE.textMuted, letterSpacing: 1, marginTop: 2 },

  buttons: { width: Math.min(W - 48, 320), gap: 10 },
  btn: {
    backgroundColor: PALETTE.bgCard,
    borderRadius: 10, padding: 16,
    borderWidth: 1, borderColor: PALETTE.border,
    alignItems: 'center',
  },
  btnPrimary: { backgroundColor: '#1A3A2A', borderColor: PALETTE.hp },
  btnText: { fontSize: 16, color: PALETTE.textPrimary, fontWeight: '600' },
  btnTextPrimary: { color: PALETTE.hp, fontWeight: 'bold' },

  version: { position: 'absolute', bottom: 16, fontSize: 10, color: PALETTE.textDim },
});
