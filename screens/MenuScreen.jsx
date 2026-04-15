/**
 * BREACH — MenuScreen
 */

import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useGameStore from '../store/gameStore';
import pkg from '../package.json';
import { Button, Card, Title, Subtitle, Body, PALETTE } from '../components/ui';
import { useT } from '../utils/i18n';

export default function MenuScreen() {
  const goToShapeSelect   = useGameStore(s => s.goToShapeSelect);
  const goToAchievements  = useGameStore(s => s.goToAchievements);
  const goToSettings      = useGameStore(s => s.goToSettings);
  const goToTalentTree    = useGameStore(s => s.goToTalentTree);
  const setPhase          = useGameStore(s => s.setPhase);
  const meta              = useGameStore(s => s.meta);
  const t = useT();

  const bestTime = meta.bestSurvivalTime || 0;
  const bestM = Math.floor(bestTime / 60);
  const bestS = Math.floor(bestTime % 60);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PALETTE.bg, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Card style={{ alignItems: 'center', marginBottom: 24, width: '100%' }}>
        <Title>{t('menu_title')}</Title>
        <Subtitle>{t('menu_sub')}</Subtitle>
      </Card>

      <Card style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 24, padding: 16 }}>
        <StatCell label={t('menu_stat_runs')} value={meta.totalRuns || 0} />
        <StatCell label={t('menu_stat_kills')} value={meta.totalKills || 0} />
        <StatCell label={t('menu_stat_best')} value={`${bestM}:${bestS.toString().padStart(2,'0')}`} />
      </Card>

      <View style={{ width: '100%', maxWidth: 340, marginBottom: 24 }}>
        <Button label={t('menu_btn_play')} primary onPress={goToShapeSelect} style={{ marginBottom: 8 }} />
        <Button label="🏆 Leaderboard" onPress={() => setPhase('leaderboard')} style={{ marginBottom: 8 }} />
        <Button label="📖 Tutoriel" onPress={() => setPhase('tutorial')} style={{ marginBottom: 8 }} />
        <Button label={t('menu_btn_talents')} onPress={goToTalentTree} />
        <Button label={t('menu_btn_achievements')} onPress={goToAchievements} />
        <Button label={t('menu_btn_settings')} onPress={goToSettings} />
      </View>

      <Body style={{ color: PALETTE.textDim, position: 'absolute', bottom: 16, alignSelf: 'center', fontSize: 12 }}>
        {t('menu_version', { version: pkg.version })}
      </Body>
    </SafeAreaView>
  );
}

function StatCell({ label, value }) {
  return (
    <View style={{ alignItems: 'center', minWidth: 70 }}>
      <Title style={{ fontSize: 22, marginBottom: 2 }}>{value}</Title>
      <Body style={{ fontSize: 12, color: PALETTE.textDim }}>{label}</Body>
    </View>
  );
}
