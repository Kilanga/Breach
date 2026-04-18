/**
 * BREACH — UpgradeChoiceScreen
 * Proposé à chaque level-up : 3 cartes d'upgrade à choisir
 */

import React, { memo } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { PALETTE, PALETTE_DALTONISM } from '../constants';
import UpgradeCard from '../components/ui/UpgradeCard';
import { getBuildRecommendation, getSynergySummary } from '../systems/upgradeSystem';
import { Card, Title, Body, Button } from '../components/ui';
import { useT } from '../utils/i18n';

const { width: SCREEN_W } = Dimensions.get('window');

const UpgradeChoiceScreen = memo(({ choices = [], activeUpgrades, level, onSelect, onSkip, colorBlindMode = false }) => {
  const recommendation = getBuildRecommendation(activeUpgrades);
  const synergies      = getSynergySummary(activeUpgrades);
  const hasChoices = choices.length > 0;
  const palette = colorBlindMode ? PALETTE_DALTONISM : PALETTE;
  const t = useT();

  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <Card style={{ width: Math.min(SCREEN_W - 32, 420), maxHeight: '90%', padding: 20, minHeight: 300, justifyContent: 'flex-start' }}>
        <Title style={{ fontSize: 24, color: palette.xp, textAlign: 'center', marginBottom: 4, letterSpacing: 2 }}>⬆ {t('upgrade_level') || 'NIVEAU'} {level}</Title>
        <Body style={{ fontSize: 13, color: palette.textDim, textAlign: 'center', marginBottom: 10 }}>{hasChoices ? (t('upgrade_choose') || 'Choisissez un upgrade') : (t('upgrade_none') || 'Aucune amélioration disponible')}</Body>
        {synergies.some(s => s.active) && (
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            {synergies.filter(s => s.count > 0).map(s => (
              <Body key={s.color} style={{ fontSize: 12, color: s.active ? '#FFCC44' : palette.textDim, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: s.active ? 'rgba(255,204,68,0.15)' : 'rgba(255,255,255,0.05)' }}>
                {synergyEmoji(s.color)} {s.count}
              </Body>
            ))}
          </View>
        )}
        {hasChoices && recommendation && (
          <Body style={{ fontSize: 11, color: palette.textDim, textAlign: 'center', marginBottom: 10, fontStyle: 'italic' }}>
            {t('upgrade_recommend') || 'Build conseillé'} : {colorLabel(recommendation.color)} ({recommendation.count} upgrades)
          </Body>
        )}
        {hasChoices ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }} style={{ minHeight: 200 }}>
            {choices.map(upgrade => (
              <UpgradeCard
                key={upgrade.id}
                upgrade={upgrade}
                onSelect={onSelect}
                synergy={activeUpgrades.filter(u => u.color === upgrade.color).length >= 3 && upgrade.rarity !== 'curse'}
                currentStacks={activeUpgrades.filter(u => u.id === upgrade.id).length}
                palette={palette}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={{ paddingTop: 16, gap: 12 }}>
            <Body style={{ color: palette.textDim, fontSize: 13, textAlign: 'center', lineHeight: 20 }}>{t('upgrade_limit') || 'Tu as atteint la limite des upgrades disponibles pour cette run.'}</Body>
            <Button label={t('continue') || 'Continuer'} onPress={onSkip} style={{ alignSelf: 'center', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: palette.borderLight, backgroundColor: 'rgba(255,255,255,0.06)' }} />
          </View>
        )}
      </Card>
    </View>
  );
});

function synergyEmoji(color) {
  switch (color) {
    case 'red':   return '🔴';
    case 'blue':  return '🔵';
    case 'green': return '🟢';
    case 'curse': return '☠';
    default:      return '●';
  }
}

function colorLabel(color) {
  switch (color) {
    case 'red':   return 'Offensif 🔴';
    case 'blue':  return 'Défensif 🔵';
    case 'green': return 'Soin 🟢';
    case 'curse': return 'Malédiction ☠';
    default:      return color;
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  panel: {
    width: Math.min(SCREEN_W - 32, 420),
    maxHeight: '90%',
    backgroundColor: PALETTE.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.borderLight,
    padding: 20,
  },
  levelUp: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PALETTE.xp,
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 13,
    color: PALETTE.textMuted,
    textAlign: 'center',
    marginBottom: 10,
  },
  synRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  synBadge: {
    fontSize: 12,
    color: PALETTE.textMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  synBadgeActive: {
    color: '#FFCC44',
    backgroundColor: 'rgba(255,204,68,0.15)',
  },
  rec: {
    fontSize: 11,
    color: PALETTE.textMuted,
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  scroll: { flex: 1 },
  emptyWrap: {
    paddingTop: 16,
    gap: 12,
  },
  emptyText: {
    color: PALETTE.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyBtn: {
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PALETTE.borderLight,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  emptyBtnText: {
    color: PALETTE.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default UpgradeChoiceScreen;
