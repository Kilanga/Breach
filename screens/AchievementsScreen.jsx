/**
 * BREACH — AchievementsScreen
 */

import React from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import useGameStore from '../store/gameStore';
import { Card, Title, Body, Button, PALETTE } from '../components/ui';
import { useT } from '../utils/i18n';

const { width: W } = Dimensions.get('window');

const ACHIEVEMENTS = [
  { id: 'first_run',  icon: '⚡', check: m => m.totalRuns >= 1 },
  { id: 'survivor',   icon: '⏱', check: m => m.bestSurvivalTime >= 120 },
  { id: 'slayer',     icon: '⚔', check: m => m.totalKills >= 100 },
  { id: 'winner',     icon: '🏆', check: m => m.totalWins >= 1 },
  { id: 'veteran',    icon: '🔥', check: m => m.totalRuns >= 10 },
  { id: 'assassin_w', icon: '🗡', check: m => m.shapeStats?.triangle?.wins >= 1 },
  { id: 'arcanist_w', icon: '🔮', check: m => m.shapeStats?.circle?.wins >= 1 },
  { id: 'colossus_w', icon: '🏰', check: m => m.shapeStats?.hexagon?.wins >= 1 },
  { id: 'all_classes',icon: '🌟', check: m => Object.values(m.shapeStats || {}).every(s => s.runs >= 1) },
  { id: 'speedrun',   icon: '💨', check: m => m.totalWins >= 1 },
  { id: 'masochist',  icon: '☠',  check: m => m.totalRuns >= 5 },
  { id: 'legendary',  icon: '👑', check: m => m.totalWins >= 3 },
];

export default function AchievementsScreen() {
  const goToMenu = useGameStore(s => s.goToMenu);
  const meta     = useGameStore(s => s.meta);
  const t = useT();

  const unlocked  = ACHIEVEMENTS.filter(a => a.check(meta));
  const locked    = ACHIEVEMENTS.filter(a => !a.check(meta));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Button label={t('back_menu') || '← Menu'} onPress={goToMenu} style={{ minWidth: 80, paddingVertical: 8 }} />
        <Title style={{ fontSize: 22 }}>{t('achievements_title') || 'Succès'}</Title>
        <Body style={{ color: PALETTE.textDim }}>{unlocked.length}/{ACHIEVEMENTS.length}</Body>
      </Card>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        {unlocked.map(a => <AchRow key={a.id} a={a} done t={t} />)}
        {locked.map(a => <AchRow key={a.id} a={a} done={false} t={t} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

function AchRow({ a, done, t }) {
  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: done ? '#FFCC4440' : PALETTE.border, backgroundColor: done ? 'rgba(255,204,68,0.05)' : PALETTE.bgCard, padding: 14 }}>
      <Body style={{ fontSize: 28, width: 36, textAlign: 'center' }}>{done ? a.icon : '🔒'}</Body>
      <View style={{ flex: 1 }}>
        <Title style={{ fontSize: 14, color: done ? PALETTE.textPrimary : PALETTE.textDim }}>{done ? t(`achievement_${a.id}_title`) : '???'}</Title>
        <Body style={{ fontSize: 12, color: PALETTE.textDim }}>{t(`achievement_${a.id}_desc`)}</Body>
      </View>
      {done && <Body style={{ color: '#FFCC44', fontSize: 18, fontWeight: 'bold' }}>✓</Body>}
    </Card>
  );
}
