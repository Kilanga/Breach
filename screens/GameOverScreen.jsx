/**
 * BREACH — GameOverScreen
 */

import React, { useEffect } from 'react';
import { submitScore } from '../services/leaderboard';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useGameStore from '../store/gameStore';
import { Card, Title, Body, Button, PALETTE } from '../components/ui';
import { useT } from '../utils/i18n';

const { width: W } = Dimensions.get('window');

export default function GameOverScreen() {
  const goToMenu       = useGameStore(s => s.goToMenu);
  const goToShapeSelect = useGameStore(s => s.goToShapeSelect);
  const meta           = useGameStore(s => s.meta);
  const t = useT();

  const lastRun = meta.runHistory?.[0];

  useEffect(() => {
    if (lastRun && lastRun.score > 0) {
      submitScore({
        playerName: meta.playerName || 'Anonyme',
        score: lastRun.score,
        meta: {
          shape: lastRun.shape,
          survivalTime: lastRun.survivalTime,
          kills: lastRun.kills,
          level: lastRun.level,
          date: lastRun.date,
        },
      }).catch(() => {});
    }
  }, [lastRun, meta.playerName]);
  const bestTime = meta.bestSurvivalTime || 0;
  const bm = Math.floor(bestTime / 60);
  const bs = Math.floor(bestTime % 60);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PALETTE.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ width: '100%', maxWidth: 380, alignItems: 'center', borderColor: '#FF4455', padding: 28 }}>
        <Title style={{ fontSize: 40, color: '#FF4455', marginBottom: 8 }}>☠ {t('gameover_title') || 'MORT'}</Title>
        <Body style={{ fontSize: 15, color: PALETTE.textDim, marginBottom: 24 }}>{t('gameover_sub') || "Le Breach t'a consumé..."}</Body>
        {lastRun && (
          <View style={{ width: '100%', gap: 10, marginBottom: 20 }}>
            <StatRow label={t('stat_survival_time') || 'Temps de survie'} value={formatTime(lastRun.survivalTime)} />
            <StatRow label={t('stat_score') || 'Score'} value={(lastRun.score || 0).toLocaleString()} />
            <StatRow label={t('stat_level') || 'Niveau atteint'} value={`Niv. ${lastRun.level || 1}`} />
            <StatRow label={t('stat_kills') || 'Ennemis tués'} value={lastRun.kills} />
            <StatRow label={t('stat_class') || 'Classe'} value={lastRun.shape} />
          </View>
        )}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
          <Body style={{ color: PALETTE.textDim }}>{t('stat_best_time') || '🏆 Meilleur temps'}</Body>
          <Body style={{ color: PALETTE.textPrimary }}>{bm}:{bs.toString().padStart(2,'0')}</Body>
        </View>
        {meta.bestScore > 0 && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: -12, borderColor: '#FFCC4440' }}>
            <Body style={{ color: '#FFCC44' }}>{t('stat_best_score') || '🥇 Meilleur score'}</Body>
            <Body style={{ color: PALETTE.textPrimary }}>{(meta.bestScore).toLocaleString()}</Body>
          </View>
        )}
        <Button label={t('gameover_replay') || '🔄 Rejouer'} primary onPress={goToShapeSelect} style={{ marginTop: 24 }} />
        <Button label={t('back_menu') || '← Menu'} onPress={goToMenu} style={{ marginTop: 8 }} />
      </Card>
    </SafeAreaView>
  );
}

function StatRow({ label, value }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderColor: PALETTE.border }}>
      <Body style={{ color: PALETTE.textDim }}>{label}</Body>
      <Body style={{ color: PALETTE.textPrimary }}>{value}</Body>
    </View>
  );
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
