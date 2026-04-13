/**
 * BREACH — TalentTreeScreen
 * Arbre de talents persistant (méta-progression)
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useGameStore from '../store/gameStore';
import { PALETTE, PERMANENT_UPGRADES_CATALOG } from '../constants';

const { width: W } = Dimensions.get('window');

export default function TalentTreeScreen() {
  const goToMenu           = useGameStore(s => s.goToMenu);
  const meta               = useGameStore(s => s.meta);

  const unlockedIds = meta.permanentUpgrades || [];

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToMenu} style={styles.backBtn}>
          <Text style={styles.backText}>← Menu</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Améliorations Permanentes</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Fragments */}
      <View style={styles.fragmentsRow}>
        <Text style={styles.fragIcon}>🔸</Text>
        <Text style={styles.fragLabel}>Fragments du Rift</Text>
        <Text style={styles.fragValue}>{meta.talentPoints || 0}</Text>
      </View>
      <Text style={styles.fragHint}>Les fragments sont gagnés automatiquement en fin de run (1 toutes les 10s + 1/kill, divisé par 5 pour les points de talent).</Text>

      <ScrollView contentContainerStyle={styles.list}>
        {PERMANENT_UPGRADES_CATALOG.map(item => {
          const isUnlocked = unlockedIds.includes(item.id);
          const condMet = isConditionMet(item.unlockCondition, meta);
          return (
            <View key={item.id} style={[styles.card, isUnlocked && styles.cardUnlocked, !condMet && !isUnlocked && styles.cardLocked]}>
              <Text style={styles.icon}>{isUnlocked ? item.icon : condMet ? item.icon : '🔒'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, !condMet && !isUnlocked && styles.lockedText]}>
                  {isUnlocked || condMet ? item.name : '???'}
                </Text>
                <Text style={styles.desc}>
                  {isUnlocked || condMet ? item.desc : item.unlockCondition?.desc || 'Inconnu'}
                </Text>
              </View>
              {isUnlocked
                ? <Text style={styles.check}>✓</Text>
                : condMet ? <Text style={styles.available}>Débloqué!</Text>
                : <Text style={styles.locked}>Verrouillé</Text>
              }
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function isConditionMet(cond, meta) {
  if (!cond) return true;
  if (cond.type === 'runs')      return (meta.totalRuns  || 0) >= cond.value;
  if (cond.type === 'kills')     return (meta.totalKills || 0) >= cond.value;
  if (cond.type === 'wins')      return (meta.totalWins  || 0) >= cond.value;
  if (cond.type === 'shape_win') return (meta.shapeStats?.[cond.shape]?.wins || 0) >= 1;
  return false;
}

const styles = StyleSheet.create({
  root:     { flex: 1, backgroundColor: PALETTE.bg },
  header:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backBtn:  { padding: 8 },
  backText: { color: PALETTE.textMuted, fontSize: 14 },
  title:    { fontSize: 17, fontWeight: 'bold', color: PALETTE.textPrimary },
  fragmentsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,136,68,0.1)', borderRadius: 10, marginHorizontal: 16, padding: 12, marginBottom: 4 },
  fragIcon:  { fontSize: 20 },
  fragLabel: { flex: 1, fontSize: 14, color: PALETTE.fragment },
  fragValue: { fontSize: 22, fontWeight: 'bold', color: PALETTE.fragment },
  fragHint:  { fontSize: 11, color: PALETTE.textDim, marginHorizontal: 16, marginBottom: 12, lineHeight: 16 },
  list:     { padding: 16, gap: 10 },
  card:     { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: PALETTE.bgCard, borderRadius: 12, borderWidth: 1, borderColor: PALETTE.border, padding: 14 },
  cardUnlocked: { borderColor: '#44FF8840', backgroundColor: 'rgba(68,255,136,0.04)' },
  cardLocked:   { opacity: 0.5 },
  icon:     { fontSize: 26, width: 34, textAlign: 'center' },
  name:     { fontSize: 14, fontWeight: 'bold', color: PALETTE.textPrimary },
  desc:     { fontSize: 12, color: PALETTE.textMuted, marginTop: 2 },
  lockedText: { color: PALETTE.textDim },
  check:    { color: '#44FF88', fontSize: 18, fontWeight: 'bold' },
  available:{ color: '#FFCC44', fontSize: 11, fontWeight: 'bold' },
  locked:   { color: PALETTE.textDim, fontSize: 11 },
});
