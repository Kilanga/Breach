/**
 * BREACH — UpgradeChoiceScreen
 * Proposé à chaque level-up : 3 cartes d'upgrade à choisir
 */

import React, { memo } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { PALETTE } from '../constants';
import UpgradeCard from '../components/ui/UpgradeCard';
import { getBuildRecommendation, getSynergySummary } from '../systems/upgradeSystem';

const { width: SCREEN_W } = Dimensions.get('window');

const UpgradeChoiceScreen = memo(({ choices, activeUpgrades, level, onSelect }) => {
  const recommendation = getBuildRecommendation(activeUpgrades);
  const synergies      = getSynergySummary(activeUpgrades);

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        {/* Header */}
        <Text style={styles.levelUp}>⬆ NIVEAU {level}</Text>
        <Text style={styles.subtitle}>Choisissez un upgrade</Text>

        {/* Synergies actives */}
        {synergies.some(s => s.active) && (
          <View style={styles.synRow}>
            {synergies.filter(s => s.count > 0).map(s => (
              <Text key={s.color} style={[styles.synBadge, s.active && styles.synBadgeActive]}>
                {synergyEmoji(s.color)} {s.count}
              </Text>
            ))}
          </View>
        )}

        {/* Recommandation */}
        {recommendation && (
          <Text style={styles.rec}>
            Build conseillé : {colorLabel(recommendation.color)} ({recommendation.count} upgrades)
          </Text>
        )}

        {/* Cartes */}
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          {choices.map(upgrade => (
            <UpgradeCard
              key={upgrade.id}
              upgrade={upgrade}
              onSelect={onSelect}
              synergy={activeUpgrades.some(u => u.color === upgrade.color) && upgrade.rarity !== 'curse'}
            />
          ))}
        </ScrollView>
      </View>
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
});

export default UpgradeChoiceScreen;
