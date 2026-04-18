/**
 * BREACH — GameOverScreen
 */

import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useGameStore from '../store/gameStore';
import { Card, Title, Body, Button, PALETTE } from '../components/ui';
import { useT } from '../utils/i18n';

export default function GameOverScreen() {
  const goToMenu        = useGameStore(s => s.goToMenu);
  const goToShapeSelect = useGameStore(s => s.goToShapeSelect);
  const meta            = useGameStore(s => s.meta);
  const t               = useT();
  const lastRun = meta.runHistory?.[0];

  const fragmentsEarned = lastRun
    ? Math.floor(lastRun.survivalTime / 10) + (lastRun.kills || 0)
    : 0;
  const talentPointsEarned = Math.floor(fragmentsEarned / 5);
  const dps = lastRun && lastRun.survivalTime > 0
    ? ((lastRun.kills || 0) / lastRun.survivalTime * 60).toFixed(1)
    : '0';
  const isRecord = lastRun && lastRun.score > 0 && lastRun.score >= (meta.bestScore || 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <ScrollView contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', padding: 20, paddingBottom: 40 }}>
        <Card style={{ width: '100%', maxWidth: 400, alignItems: 'center', borderColor: '#FF4455', padding: 24 }}>

          <Title style={{ fontSize: 38, color: '#FF4455', marginBottom: 4 }}>☠ {t('gameover_title') || 'MORT'}</Title>
          <Body style={{ fontSize: 13, color: PALETTE.textDim, marginBottom: 20 }}>
            {t('gameover_sub') || "Le Breach t'a consumé..."}
          </Body>

          {isRecord && (
            <View style={{ backgroundColor: 'rgba(255,204,68,0.12)', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 14, borderWidth: 1, borderColor: '#FFCC4466' }}>
              <Body style={{ color: '#FFCC44', fontWeight: 'bold', textAlign: 'center' }}>🏆 NOUVEAU RECORD !</Body>
            </View>
          )}

          {lastRun && (
            <View style={{ width: '100%', marginBottom: 16 }}>
              <StatRow label={t('stat_survival_time') || 'Temps de survie'} value={formatTime(lastRun.survivalTime)} highlight />
              <StatRow label={t('stat_score') || 'Score'}               value={(lastRun.score || 0).toLocaleString()} />
              <StatRow label={t('stat_level') || 'Niveau atteint'}      value={`Niv. ${lastRun.level || 1}`} />
              <StatRow label={t('stat_kills') || 'Ennemis tués'}        value={lastRun.kills || 0} />
              <StatRow label="Kills / minute"                           value={dps} />
              <StatRow label={t('stat_class') || 'Classe'}              value={lastRun.shape} />
            </View>
          )}

          {/* Records perso */}
          <View style={{ width: '100%', gap: 6, marginBottom: 16, paddingTop: 10, borderTopWidth: 1, borderColor: PALETTE.border }}>
            <Body style={{ fontSize: 11, color: PALETTE.textDim, letterSpacing: 1, marginBottom: 4 }}>— RECORDS —</Body>
            <StatRow label="🏆 Meilleur temps"  value={formatTime(meta.bestSurvivalTime || 0)} />
            <StatRow label="🥇 Meilleur score"  value={(meta.bestScore || 0).toLocaleString()} />
            <StatRow label="⚔ Total kills"      value={meta.totalKills || 0} />
          </View>

          {/* Fragments gagnés */}
          <View style={{ backgroundColor: 'rgba(187,68,255,0.08)', borderRadius: 10, padding: 12, width: '100%', marginBottom: 18, borderWidth: 1, borderColor: '#BB44FF40' }}>
            <Body style={{ fontSize: 13, color: '#BB88FF', fontWeight: 'bold', marginBottom: 2 }}>
              ⬆ +{talentPointsEarned} points de talent gagnés
            </Body>
            <Body style={{ fontSize: 11, color: PALETTE.textDim }}>
              ({fragmentsEarned} fragments · 1 point = 5 fragments)
            </Body>
          </View>

          <Button label={t('gameover_replay') || '🔄 Rejouer'} primary onPress={goToShapeSelect} style={{ marginBottom: 10, width: '100%' }} />
          <Button label={t('back_menu') || '← Menu'} onPress={goToMenu} style={{ width: '100%' }} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatRow({ label, value, highlight }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderColor: PALETTE.border }}>
      <Body style={{ fontSize: 12, color: PALETTE.textDim }}>{label}</Body>
      <Body style={[{ fontSize: 12, color: PALETTE.textPrimary, fontWeight: 'bold' }, highlight && { color: '#FFCC44', fontSize: 15 }]}>{value}</Body>
    </View>
  );
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
