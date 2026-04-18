/**
 * BREACH — TalentTreeScreen
 */

import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useGameStore from '../store/gameStore';
import { PALETTE, PERMANENT_UPGRADES_CATALOG } from '../constants';
import { Card, Title, Body, Button } from '../components/ui';
import { useT } from '../utils/i18n';

export default function TalentTreeScreen() {
  const goToMenu             = useGameStore(s => s.goToMenu);
  const meta                 = useGameStore(s => s.meta);
  const buyPermanentUpgrade  = useGameStore(s => s.buyPermanentUpgrade);
  const t = useT();

  const unlockedIds   = meta.permanentUpgrades || [];
  const talentPoints  = meta.talentPoints || 0;

  const purchasable = PERMANENT_UPGRADES_CATALOG.filter(i => i.cost);
  const achievementBased = PERMANENT_UPGRADES_CATALOG.filter(i => !i.cost);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Button label={t('back_menu') || '← Menu'} onPress={goToMenu} style={{ minWidth: 80, paddingVertical: 8 }} />
        <Title style={{ fontSize: 18 }}>{t('talenttree_title') || 'Talents Permanents'}</Title>
        <View style={{ width: 60 }} />
      </Card>

      {/* Points de talent */}
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,204,68,0.1)', borderRadius: 10, marginBottom: 4 }}>
        <Body style={{ fontSize: 20 }}>🔸</Body>
        <Body style={{ flex: 1, fontSize: 14, color: PALETTE.gold }}>Points de talent</Body>
        <Title style={{ fontSize: 24, color: PALETTE.gold }}>{talentPoints}</Title>
      </Card>
      <Body style={{ fontSize: 11, color: PALETTE.textDim, marginHorizontal: 8, marginBottom: 12, lineHeight: 16 }}>
        Gagnés en fin de run · 1 pt = 5 fragments (survie + kills)
      </Body>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>

        {/* Achetables avec des points */}
        <Body style={{ fontSize: 11, color: PALETTE.textDim, letterSpacing: 1.2, marginBottom: 4 }}>— ACHETABLES —</Body>
        {purchasable.map(item => {
          const owned    = unlockedIds.includes(item.id);
          const canAfford = talentPoints >= item.cost;
          return (
            <Card key={item.id} style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              borderColor: owned ? '#44FF8840' : canAfford ? '#FFCC4460' : PALETTE.border,
              backgroundColor: owned ? 'rgba(68,255,136,0.04)' : PALETTE.bgCard,
              padding: 14,
            }}>
              <Body style={{ fontSize: 26, width: 34, textAlign: 'center' }}>{item.icon}</Body>
              <View style={{ flex: 1 }}>
                <Title style={{ fontSize: 14 }}>{item.name}</Title>
                <Body style={{ fontSize: 12, color: PALETTE.textDim, marginTop: 2 }}>{item.desc}</Body>
              </View>
              {owned
                ? <Body style={{ color: '#44FF88', fontSize: 20, fontWeight: 'bold' }}>✓</Body>
                : (
                  <TouchableOpacity
                    onPress={() => buyPermanentUpgrade(item.id)}
                    disabled={!canAfford}
                    style={{
                      backgroundColor: canAfford ? '#FFCC44' : '#333',
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      opacity: canAfford ? 1 : 0.5,
                    }}
                  >
                    <Body style={{ fontSize: 12, fontWeight: 'bold', color: canAfford ? '#111' : PALETTE.textDim }}>
                      🔸 {item.cost}
                    </Body>
                  </TouchableOpacity>
                )
              }
            </Card>
          );
        })}

        {/* Débloqués par achievements */}
        <Body style={{ fontSize: 11, color: PALETTE.textDim, letterSpacing: 1.2, marginTop: 8, marginBottom: 4 }}>— RÉCOMPENSES —</Body>
        {achievementBased.map(item => {
          const owned    = unlockedIds.includes(item.id);
          const condMet  = isConditionMet(item.unlockCondition, meta);
          const visible  = owned || condMet;
          return (
            <Card key={item.id} style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              borderColor: owned ? '#44FF8840' : PALETTE.border,
              backgroundColor: owned ? 'rgba(68,255,136,0.04)' : PALETTE.bgCard,
              opacity: !visible ? 0.45 : 1,
              padding: 14,
            }}>
              <Body style={{ fontSize: 26, width: 34, textAlign: 'center' }}>{visible ? item.icon : '🔒'}</Body>
              <View style={{ flex: 1 }}>
                <Title style={{ fontSize: 14, color: visible ? PALETTE.textPrimary : PALETTE.textDim }}>
                  {visible ? item.name : '???'}
                </Title>
                <Body style={{ fontSize: 12, color: PALETTE.textDim, marginTop: 2 }}>
                  {visible ? item.desc : item.unlockCondition?.desc || '???'}
                </Body>
              </View>
              {owned
                ? <Body style={{ color: '#44FF88', fontSize: 20, fontWeight: 'bold' }}>✓</Body>
                : condMet
                  ? <Body style={{ color: '#FFCC44', fontSize: 11, fontWeight: 'bold' }}>Débloqué !</Body>
                  : <Body style={{ fontSize: 11, color: PALETTE.textDim }}>Verrouillé</Body>
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
