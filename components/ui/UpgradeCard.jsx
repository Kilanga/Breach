/**
 * BREACH — Carte d'upgrade
 * Affiche une option d'upgrade avec couleur, rareté et description
 */

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PALETTE, UPGRADE_COLORS } from '../../constants';

const RARITY_LABEL = { common: 'Commun', rare: 'Rare', epic: 'Épique', curse: '☠ MALÉDICTION' };
const RARITY_COLOR = { common: '#88AACC', rare: '#FFCC44', epic: '#BB44FF', curse: '#AA22AA' };

const COLOR_BG = {
  [UPGRADE_COLORS.RED]:   '#FF445520',
  [UPGRADE_COLORS.BLUE]:  '#4488FF20',
  [UPGRADE_COLORS.GREEN]: '#44FF8820',
  [UPGRADE_COLORS.CURSE]: '#AA22AA20',
};
const COLOR_BORDER = {
  [UPGRADE_COLORS.RED]:   '#FF4455',
  [UPGRADE_COLORS.BLUE]:  '#4488FF',
  [UPGRADE_COLORS.GREEN]: '#44FF88',
  [UPGRADE_COLORS.CURSE]: '#AA22AA',
};


const UpgradeCard = memo(({ upgrade, onSelect, synergy, palette = PALETTE }) => {
  const bg      = COLOR_BG[upgrade.color]     || palette.bgCard || '#FFFFFF10';
  const border  = COLOR_BORDER[upgrade.color] || palette.border || '#FFFFFF33';
  const rarityC = RARITY_COLOR[upgrade.rarity] || palette.textMuted || '#888';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: bg, borderColor: border }, synergy && styles.synergyGlow]}
      onPress={() => onSelect(upgrade)}
      activeOpacity={0.8}
    >
      {/* Rareté */}
      <Text style={[styles.rarity, { color: rarityC }]}>{RARITY_LABEL[upgrade.rarity] || upgrade.rarity}</Text>
      {/* Nom */}
      <Text style={[styles.name, { color: border }]}>{upgrade.name}</Text>
      {/* Description */}
      <Text style={styles.desc}>{upgrade.description}</Text>
      {/* Tags */}
      <View style={styles.tags}>
        {(upgrade.tags || []).slice(0, 3).map(tag => (
          <Text key={tag} style={[styles.tag, { borderColor: border, color: border }]}>{tag}</Text>
        ))}
      </View>
      {synergy && <Text style={styles.synergyBadge}>✦ SYNERGIE ACTIVE</Text>}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    minHeight: 110,
  },
  synergyGlow: {
    shadowColor: '#FFCC44',
    shadowRadius: 8,
    shadowOpacity: 0.6,
    elevation: 8,
  },
  rarity: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase' },
  name:   { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  desc:   { fontSize: 13, color: PALETTE.textPrimary, lineHeight: 18 },
  tags:   { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  tag:    { fontSize: 9, borderWidth: 1, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  synergyBadge: { fontSize: 10, color: '#FFCC44', fontWeight: 'bold', marginTop: 6, textAlign: 'center', letterSpacing: 1 },
});

export default UpgradeCard;
