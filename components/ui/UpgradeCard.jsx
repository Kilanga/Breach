/**
 * BREACH — Carte d'upgrade
 * Couleur par type, rareté, stack restant, tags, badge synergie
 */

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PALETTE, UPGRADE_COLORS } from '../../constants';

const RARITY_LABEL = {
  common: 'COMMUN',
  rare:   'RARE',
  epic:   'ÉPIQUE',
  curse:  '☠ MALÉDICTION',
};
const RARITY_COLOR = {
  common: '#88AACC',
  rare:   '#FFCC44',
  epic:   '#CC66FF',
  curse:  '#CC44AA',
};
const RARITY_BG = {
  common: 'rgba(136,170,204,0.06)',
  rare:   'rgba(255,204,68,0.08)',
  epic:   'rgba(204,102,255,0.10)',
  curse:  'rgba(204,68,170,0.10)',
};

const COLOR_ACCENT = {
  [UPGRADE_COLORS.RED]:   '#FF5566',
  [UPGRADE_COLORS.BLUE]:  '#4499FF',
  [UPGRADE_COLORS.GREEN]: '#44FF88',
  [UPGRADE_COLORS.CURSE]: '#CC44AA',
};
const COLOR_BG = {
  [UPGRADE_COLORS.RED]:   'rgba(255,68,85,0.08)',
  [UPGRADE_COLORS.BLUE]:  'rgba(68,153,255,0.08)',
  [UPGRADE_COLORS.GREEN]: 'rgba(68,255,136,0.08)',
  [UPGRADE_COLORS.CURSE]: 'rgba(204,68,170,0.08)',
};

const UpgradeCard = memo(({ upgrade, onSelect, synergy, palette = PALETTE, currentStacks = 0 }) => {
  const accent   = COLOR_ACCENT[upgrade.color] || '#FFFFFF44';
  const bg       = COLOR_BG[upgrade.color]     || 'rgba(255,255,255,0.06)';
  const rarityC  = RARITY_COLOR[upgrade.rarity] || '#888';
  const rarityBg = RARITY_BG[upgrade.rarity]   || 'transparent';
  const stacksLeft = (upgrade.maxStack || 1) - currentStacks;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: bg, borderColor: accent },
        synergy && styles.synergyGlow,
        upgrade.rarity === 'curse' && styles.curseCard,
      ]}
      onPress={() => onSelect(upgrade)}
      activeOpacity={0.75}
    >
      {/* Header : rareté + couleur dot + stacks */}
      <View style={styles.header}>
        <View style={[styles.rarityBadge, { backgroundColor: rarityBg }]}>
          <View style={[styles.colorDot, { backgroundColor: accent }]} />
          <Text style={[styles.rarity, { color: rarityC }]}>{RARITY_LABEL[upgrade.rarity] || upgrade.rarity}</Text>
        </View>
        {upgrade.maxStack > 1 && (
          <Text style={[styles.stackBadge, { color: stacksLeft <= 1 ? '#FF6644' : '#888' }]}>
            {currentStacks > 0 ? `×${currentStacks}` : ''}{stacksLeft > 0 ? ` +${stacksLeft} dispo` : ' MAX'}
          </Text>
        )}
      </View>

      {/* Nom */}
      <Text style={[styles.name, { color: accent }]}>{upgrade.name}</Text>

      {/* Description */}
      <Text style={styles.desc}>{upgrade.description}</Text>

      {/* Tags */}
      {(upgrade.tags || []).length > 0 && (
        <View style={styles.tags}>
          {upgrade.tags.slice(0, 4).map(tag => (
            <Text key={tag} style={[styles.tag, { borderColor: accent + '66', color: accent + 'AA' }]}>{tag}</Text>
          ))}
        </View>
      )}

      {/* Badge synergie */}
      {synergy && (
        <View style={styles.synergyBadgeRow}>
          <Text style={styles.synergyBadge}>✦ SYNERGIE ACTIVE — BONUS ×1.5</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    marginVertical: 5,
    minHeight: 100,
  },
  curseCard: {
    borderStyle: 'dashed',
  },
  synergyGlow: {
    shadowColor: '#FFCC44',
    shadowRadius: 10,
    shadowOpacity: 0.55,
    elevation: 10,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6,
  },
  colorDot: {
    width: 6, height: 6, borderRadius: 3,
  },
  rarity: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  stackBadge: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 5,
    letterSpacing: 0.3,
  },
  desc: {
    fontSize: 12,
    color: PALETTE.textPrimary,
    lineHeight: 17,
    opacity: 0.9,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  tag: {
    fontSize: 9,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    textTransform: 'lowercase',
  },
  synergyBadgeRow: {
    marginTop: 8,
    alignItems: 'center',
  },
  synergyBadge: {
    fontSize: 9,
    color: '#FFCC44',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default UpgradeCard;
