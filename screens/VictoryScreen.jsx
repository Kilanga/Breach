/**
 * BREACH — VictoryScreen
 */

import React, { useEffect } from 'react';
import { submitScore } from '../services/leaderboard';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useGameStore from '../store/gameStore';
import { Card, Title, Body, Button, PALETTE } from '../components/ui';
import { useT } from '../utils/i18n';

const { width: W } = Dimensions.get('window');

export default function VictoryScreen() {
  const goToMenu        = useGameStore(s => s.goToMenu);
  const goToShapeSelect = useGameStore(s => s.goToShapeSelect);
  const meta            = useGameStore(s => s.meta);
  const lastRun = meta.runHistory?.[0];
  const t = useT();

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PALETTE.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ width: '100%', maxWidth: 380, alignItems: 'center', borderColor: '#FFCC44', padding: 28 }}>
        <Title style={{ fontSize: 40, color: '#FFCC44', marginBottom: 8 }}>🏆 {t('victory_title') || 'VICTOIRE !'}</Title>
        <Body style={{ fontSize: 14, color: PALETTE.textDim, marginBottom: 24 }}>{t('victory_sub') || 'Tu as survécu au Breach !'}</Body>
        {lastRun && (
          <View style={{ width: '100%', gap: 10, marginBottom: 20 }}>
            <StatRow label={t('stat_survival_time') || 'Temps de survie'} value={formatTime(lastRun.survivalTime)} highlight />
            <StatRow label={t('stat_score') || 'Score'} value={(lastRun.score || 0).toLocaleString()} />
            <StatRow label={t('stat_level') || 'Niveau atteint'} value={`Niv. ${lastRun.level || 1}`} />
            <StatRow label={t('stat_kills') || 'Ennemis tués'} value={lastRun.kills} />
            <StatRow label={t('stat_class') || 'Classe'} value={lastRun.shape} />
          </View>
        )}
        <View style={{ backgroundColor: 'rgba(255,204,68,0.08)', borderRadius: 10, padding: 14, width: '100%', marginBottom: 20, borderWidth: 1, borderColor: '#FFCC4440' }}>
          <Body style={{ fontSize: 14, color: '#FFCC44', fontWeight: 'bold', marginBottom: 4 }}>{t('victory_fragments') || '⬆ Nouveaux fragments gagnés !'}</Body>
          <Body style={{ fontSize: 12, color: PALETTE.textDim, lineHeight: 17 }}>{t('victory_fragments_hint') || "Débloquez des améliorations permanentes dans l'arbre des talents."}</Body>
        </View>
        <Button label={t('victory_replay') || '🔄 Rejouer'} primary onPress={goToShapeSelect} style={{ marginBottom: 10 }} />
        <Button label={t('back_menu') || '← Menu'} onPress={goToMenu} />
      </Card>
    </SafeAreaView>
  );
}

function StatRow({ label, value, highlight }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderColor: PALETTE.border }}>
      <Body style={{ fontSize: 13, color: PALETTE.textDim }}>{label}</Body>
      <Body style={[{ fontSize: 13, color: PALETTE.textPrimary, fontWeight: 'bold' }, highlight && { color: '#FFCC44', fontSize: 16 }]}>{value}</Body>
    </View>
  );
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
