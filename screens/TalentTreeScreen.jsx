/**
 * BREACH — TalentTreeScreen
 * Arbre de talents persistant (méta-progression)
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useGameStore from '../store/gameStore';
import { PALETTE, PERMANENT_UPGRADES_CATALOG } from '../constants';
import { Card, Title, Body, Button } from '../components/ui';
import { useT } from '../utils/i18n';

const { width: W } = Dimensions.get('window');

export default function TalentTreeScreen() {
  const goToMenu           = useGameStore(s => s.goToMenu);
  const meta               = useGameStore(s => s.meta);
  const t = useT();

  const unlockedIds = meta.permanentUpgrades || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Button label={t('back_menu') || '← Menu'} onPress={goToMenu} style={{ minWidth: 80, paddingVertical: 8 }} />
        <Title style={{ fontSize: 18 }}>{t('talenttree_title') || 'Améliorations Permanentes'}</Title>
        <View style={{ width: 60 }} />
      </Card>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,136,68,0.1)', borderRadius: 10, marginBottom: 4 }}>
        <Body style={{ fontSize: 20 }}>🔸</Body>
        <Body style={{ flex: 1, fontSize: 14, color: PALETTE.gold }}>{t('talenttree_fragments') || 'Fragments du Rift'}</Body>
        <Title style={{ fontSize: 22, color: PALETTE.gold }}>{meta.talentPoints || 0}</Title>
      </Card>
      <Body style={{ fontSize: 11, color: PALETTE.textDim, marginHorizontal: 8, marginBottom: 12, lineHeight: 16 }}>
        {t('talenttree_hint') || 'Les fragments sont gagnés automatiquement en fin de run (1 toutes les 10s + 1/kill, divisé par 5 pour les points de talent).'}
      </Body>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        {PERMANENT_UPGRADES_CATALOG.map(item => {
          const isUnlocked = unlockedIds.includes(item.id);
          const condMet = isConditionMet(item.unlockCondition, meta);
          return (
            <Card key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: isUnlocked ? '#44FF8840' : PALETTE.border, backgroundColor: isUnlocked ? 'rgba(68,255,136,0.04)' : PALETTE.bgCard, opacity: !condMet && !isUnlocked ? 0.5 : 1, padding: 14 }}>
              <Body style={{ fontSize: 26, width: 34, textAlign: 'center' }}>{isUnlocked ? item.icon : condMet ? item.icon : '🔒'}</Body>
              <View style={{ flex: 1 }}>
                <Title style={{ fontSize: 14, color: !condMet && !isUnlocked ? PALETTE.textDim : PALETTE.textPrimary }}>{isUnlocked || condMet ? item.name : '???'}</Title>
                <Body style={{ fontSize: 12, color: PALETTE.textDim, marginTop: 2 }}>{isUnlocked || condMet ? item.desc : item.unlockCondition?.desc || 'Inconnu'}</Body>
              </View>
              {isUnlocked
                ? <Body style={{ color: '#44FF88', fontSize: 18, fontWeight: 'bold' }}>✓</Body>
                : condMet ? <Body style={{ color: '#FFCC44', fontSize: 11, fontWeight: 'bold' }}>{t('talenttree_available') || 'Débloqué!'}</Body>
                : <Body style={{ color: PALETTE.textDim, fontSize: 11 }}>{t('talenttree_locked') || 'Verrouillé'}</Body>
              }
            </Card>
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
