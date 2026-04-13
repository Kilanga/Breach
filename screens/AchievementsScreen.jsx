/**
 * BREACH — AchievementsScreen
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import useGameStore from '../store/gameStore';
import { PALETTE, PERMANENT_UPGRADES_CATALOG } from '../constants';

const { width: W } = Dimensions.get('window');

const ACHIEVEMENTS = [
  { id: 'first_run',  title: 'Première Brèche',   desc: 'Terminer un premier run.',        icon: '⚡', check: m => m.totalRuns >= 1 },
  { id: 'survivor',   title: '2 minutes',          desc: 'Survivre 2 minutes.',             icon: '⏱', check: m => m.bestSurvivalTime >= 120 },
  { id: 'slayer',     title: 'Massacreur',         desc: 'Tuer 100 ennemis au total.',      icon: '⚔', check: m => m.totalKills >= 100 },
  { id: 'winner',     title: 'Survivant',          desc: 'Survivre 5 minutes entières.',    icon: '🏆', check: m => m.totalWins >= 1 },
  { id: 'veteran',    title: 'Vétéran',            desc: '10 runs joués.',                  icon: '🔥', check: m => m.totalRuns >= 10 },
  { id: 'assassin_w', title: 'Maîtrise Assassin',  desc: 'Gagner avec l\'Assassin.',        icon: '🗡', check: m => m.shapeStats?.triangle?.wins >= 1 },
  { id: 'arcanist_w', title: 'Maîtrise Arcaniste', desc: 'Gagner avec l\'Arcaniste.',       icon: '🔮', check: m => m.shapeStats?.circle?.wins >= 1 },
  { id: 'colossus_w', title: 'Maîtrise Colosse',   desc: 'Gagner avec le Colosse.',         icon: '🏰', check: m => m.shapeStats?.hexagon?.wins >= 1 },
  { id: 'all_classes',title: 'Touche à tout',      desc: 'Jouer avec les 5 classes.',       icon: '🌟', check: m => Object.values(m.shapeStats || {}).every(s => s.runs >= 1) },
  { id: 'speedrun',   title: 'Speedrunner',        desc: '5 min sans mourir.',              icon: '💨', check: m => m.totalWins >= 1 },
  { id: 'masochist',  title: 'Masochiste',         desc: 'Prendre une malédiction.',        icon: '☠',  check: m => m.totalRuns >= 5 },
  { id: 'legendary',  title: 'Légende',            desc: 'Gagner 3 fois.',                  icon: '👑', check: m => m.totalWins >= 3 },
];

export default function AchievementsScreen() {
  const goToMenu = useGameStore(s => s.goToMenu);
  const meta     = useGameStore(s => s.meta);

  const unlocked  = ACHIEVEMENTS.filter(a => a.check(meta));
  const locked    = ACHIEVEMENTS.filter(a => !a.check(meta));

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToMenu} style={styles.backBtn}>
          <Text style={styles.backText}>← Menu</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Succès</Text>
        <Text style={styles.count}>{unlocked.length}/{ACHIEVEMENTS.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {unlocked.map(a => <AchRow key={a.id} a={a} done />)}
        {locked.map(a => <AchRow key={a.id} a={a} done={false} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

function AchRow({ a, done }) {
  return (
    <View style={[styles.row, done && styles.rowDone]}>
      <Text style={styles.icon}>{done ? a.icon : '🔒'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.achTitle, !done && styles.locked]}>{done ? a.title : '???'}</Text>
        <Text style={styles.achDesc}>{a.desc}</Text>
      </View>
      {done && <Text style={styles.check}>✓</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: PALETTE.bg },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 12 },
  backBtn: { padding: 8 },
  backText:{ color: PALETTE.textMuted, fontSize: 14 },
  title:   { fontSize: 20, fontWeight: 'bold', color: PALETTE.textPrimary },
  count:   { fontSize: 14, color: PALETTE.textMuted },
  list:    { padding: 16, gap: 10 },
  row:     { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: PALETTE.bgCard, borderRadius: 12, borderWidth: 1, borderColor: PALETTE.border, padding: 14 },
  rowDone: { borderColor: '#FFCC4440', backgroundColor: 'rgba(255,204,68,0.05)' },
  icon:    { fontSize: 28, width: 36, textAlign: 'center' },
  achTitle:{ fontSize: 14, fontWeight: 'bold', color: PALETTE.textPrimary },
  achDesc: { fontSize: 12, color: PALETTE.textMuted, marginTop: 2 },
  locked:  { color: PALETTE.textDim },
  check:   { color: '#FFCC44', fontSize: 18, fontWeight: 'bold' },
});
