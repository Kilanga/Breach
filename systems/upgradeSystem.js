/**
 * BREACH — Système d'upgrades (adapté de RIFT)
 * Conserve les synergies couleur et la pondération par rareté
 */

import { UPGRADE_COLORS } from '../constants';

export const ALL_UPGRADES = [

  // ── Rouge (offensif) ──────────────────────────────────────────────────────
  {
    id: 'overload', name: 'Surcharge', color: UPGRADE_COLORS.RED, rarity: 'common', maxStack: 3,
    description: '+3 Attaque.',
    effect: { type: 'stat', stat: 'attack', value: 3 },
    tags: ['stat', 'dégâts'],
  },
  {
    id: 'critique', name: 'Frappe Critique', color: UPGRADE_COLORS.RED, rarity: 'rare', maxStack: 3,
    description: '+15% de chance de tripler les dégâts (cumulable).',
    effect: { type: 'passive', trigger: 'onAttack', action: 'criticalHit', chance: 0.15, multiplier: 3 },
    tags: ['dégâts', 'chance'],
  },
  {
    id: 'echo', name: 'Écho', color: UPGRADE_COLORS.RED, rarity: 'rare', maxStack: 1,
    description: 'Les attaques rebondissent sur l\'ennemi le plus proche (60% dégâts).',
    effect: { type: 'passive', trigger: 'onAttack', action: 'bounceAttack', multiplier: 0.6 },
    tags: ['dégâts', 'rebond'],
  },
  {
    id: 'fracture', name: 'Fracture', color: UPGRADE_COLORS.RED, rarity: 'rare', maxStack: 1,
    description: 'Les ennemis tués explosent → 30% de leurs PV en AoE.',
    effect: { type: 'passive', trigger: 'onKill', action: 'explode', percent: 0.3 },
    tags: ['dégâts', 'aoe', 'kill'],
  },
  {
    id: 'chain_reaction', name: 'Réaction en chaîne', color: UPGRADE_COLORS.RED, rarity: 'epic', maxStack: 2,
    description: 'Après chaque kill, prochaine attaque +50%.',
    effect: { type: 'passive', trigger: 'onKill', action: 'attackBoost', multiplier: 1.5, duration: 1 },
    tags: ['dégâts', 'kill'],
  },
  {
    id: 'tranchant', name: 'Tranchant', color: UPGRADE_COLORS.RED, rarity: 'common', maxStack: 3,
    description: 'Perce 2 pts de défense ennemie par attaque (cumulable).',
    effect: { type: 'passive', trigger: 'onAttack', action: 'pierceDefense', value: 2 },
    tags: ['dégâts', 'pénétration'],
  },
  {
    id: 'berserker', name: 'Berserker', color: UPGRADE_COLORS.RED, rarity: 'epic', maxStack: 1,
    description: 'Sous 30% de PV : ATQ doublée.',
    effect: { type: 'passive', trigger: 'onAttack', action: 'berserk', threshold: 0.3 },
    tags: ['dégâts', 'survie'],
  },
  {
    id: 'cyclone', name: 'Cyclone', color: UPGRADE_COLORS.RED, rarity: 'rare', maxStack: 1,
    description: 'Chaque attaque frappe aussi les ennemis à portée (50% dégâts).',
    effect: { type: 'passive', trigger: 'onAttack', action: 'aoeOnAttack', multiplier: 0.5 },
    tags: ['dégâts', 'aoe'],
  },
  {
    id: 'ignition', name: 'Ignition', color: UPGRADE_COLORS.RED, rarity: 'rare', maxStack: 2,
    description: 'Chaque attaque inflige Brûlure : 3 dégâts/s pendant 2s (cumulable).',
    effect: { type: 'passive', trigger: 'onAttack', action: 'applyBurn', value: 3, duration: 2 },
    tags: ['dégâts', 'statut', 'brûlure'],
  },
  {
    id: 'shockwave', name: 'Onde de Choc', color: UPGRADE_COLORS.RED, rarity: 'epic', maxStack: 1,
    description: 'À chaque kill : étourdit les ennemis proches pendant 1s.',
    effect: { type: 'passive', trigger: 'onKill', action: 'stunNearby', duration: 1 },
    tags: ['contrôle', 'statut', 'stun', 'kill'],
  },
  {
    id: 'pacte_sang', name: 'Pacte de Sang', color: UPGRADE_COLORS.RED, rarity: 'epic', maxStack: 1,
    description: '+8 ATQ — mais −8 PV max.',
    effect: { type: 'stat', changes: [{ stat: 'attack', value: 8 }, { stat: 'maxHp', value: -8 }] },
    tags: ['dégâts', 'risque'],
  },
  {
    id: 'speedattack', name: 'Rafale', color: UPGRADE_COLORS.RED, rarity: 'rare', maxStack: 2,
    description: '-20% de temps entre les attaques (cumulable).',
    effect: { type: 'stat', stat: 'attackSpeedMult', value: 0.8, multiplicative: true },
    tags: ['dégâts', 'vitesse'],
  },

  // ── Bleu (utilitaire / défensif) ──────────────────────────────────────────
  {
    id: 'absorb', name: 'Absorption', color: UPGRADE_COLORS.BLUE, rarity: 'common', maxStack: 3,
    description: '+2 Défense.',
    effect: { type: 'stat', stat: 'defense', value: 2 },
    tags: ['stat', 'défense'],
  },
  {
    id: 'shield_pulse', name: 'Impulsion Bouclier', color: UPGRADE_COLORS.BLUE, rarity: 'common', maxStack: 1,
    description: 'Absorbe 1 coup toutes les 8s.',
    effect: { type: 'passive', trigger: 'periodic', action: 'shield', interval: 8 },
    tags: ['défense', 'survie'],
  },
  {
    id: 'esquive', name: 'Esquive', color: UPGRADE_COLORS.BLUE, rarity: 'rare', maxStack: 2,
    description: '20% de chance d\'esquiver une attaque par stack.',
    effect: { type: 'passive', trigger: 'onDamaged', action: 'dodge', chancePerStack: 0.2 },
    tags: ['défense', 'chance'],
  },
  {
    id: 'phase_shift', name: 'Déphasage', color: UPGRADE_COLORS.BLUE, rarity: 'rare', maxStack: 1,
    description: '+20% de vitesse de déplacement.',
    effect: { type: 'stat', stat: 'speed', value: 0.6 },
    tags: ['mouvement', 'défense'],
  },
  {
    id: 'resonance', name: 'Résonance', color: UPGRADE_COLORS.BLUE, rarity: 'epic', maxStack: 1,
    description: '3 upgrades d\'une même couleur → toutes les stats ×1.5.',
    effect: { type: 'synergy', trigger: 'onSynergyActivated', action: 'statMultiplier', multiplier: 1.5 },
    tags: ['synergie', 'couleur'],
  },
  {
    id: 'fortifie', name: 'Fortifié', color: UPGRADE_COLORS.BLUE, rarity: 'epic', maxStack: 1,
    description: 'Bouclier automatique toutes les 15s.',
    effect: { type: 'passive', trigger: 'periodic', action: 'shield', interval: 15 },
    tags: ['défense', 'bouclier'],
  },
  {
    id: 'gelbomb', name: 'Gelbomb', color: UPGRADE_COLORS.BLUE, rarity: 'rare', maxStack: 1,
    description: 'Chaque attaque gèle la cible 0.5s.',
    effect: { type: 'passive', trigger: 'onAttack', action: 'applyFreeze', duration: 0.5 },
    tags: ['contrôle', 'statut', 'gel'],
  },
  {
    id: 'verre_trempe', name: 'Verre Trempé', color: UPGRADE_COLORS.BLUE, rarity: 'epic', maxStack: 1,
    description: '+5 DEF — mais −4 ATQ.',
    effect: { type: 'stat', changes: [{ stat: 'defense', value: 5 }, { stat: 'attack', value: -4 }] },
    tags: ['défense', 'risque'],
  },
  {
    id: 'magnet', name: 'Aimant', color: UPGRADE_COLORS.BLUE, rarity: 'common', maxStack: 2,
    description: '+50% de rayon de collecte des orbes d\'XP.',
    effect: { type: 'stat', stat: 'xpPickupRadius', value: 0.5, multiplicative: true },
    tags: ['utilitaire', 'xp'],
  },

  // ── Vert (soin / support) ─────────────────────────────────────────────────
  {
    id: 'vitality', name: 'Vitalité', color: UPGRADE_COLORS.GREEN, rarity: 'common', maxStack: 4,
    description: '+4 PV max.',
    effect: { type: 'stat', stat: 'maxHp', value: 4 },
    tags: ['stat', 'survie'],
  },
  {
    id: 'regen', name: 'Régénération', color: UPGRADE_COLORS.GREEN, rarity: 'common', maxStack: 3,
    description: '+0.5 PV/s par stack.',
    effect: { type: 'stat', stat: 'regen', value: 0.5 },
    tags: ['soin', 'survie'],
  },
  {
    id: 'leech', name: 'Vol de vie', color: UPGRADE_COLORS.GREEN, rarity: 'rare', maxStack: 2,
    description: '+1 PV par ennemi tué par stack.',
    effect: { type: 'passive', trigger: 'onKill', action: 'heal', value: 1 },
    tags: ['soin', 'kill'],
  },
  {
    id: 'thorns', name: 'Épines', color: UPGRADE_COLORS.GREEN, rarity: 'rare', maxStack: 2,
    description: 'Renvoie 2 dégâts à chaque attaquant (cumulable).',
    effect: { type: 'passive', trigger: 'onDamaged', action: 'reflect', value: 2 },
    tags: ['riposte', 'défense'],
  },
  {
    id: 'second_wind', name: 'Second Souffle', color: UPGRADE_COLORS.GREEN, rarity: 'epic', maxStack: 1,
    description: 'Une fois par run : survie à un coup fatal avec 1 PV.',
    effect: { type: 'passive', trigger: 'onFatalHit', action: 'survive' },
    tags: ['survie'],
  },
  {
    id: 'overgrowth', name: 'Excroissance', color: UPGRADE_COLORS.GREEN, rarity: 'epic', maxStack: 1,
    description: 'Chaque upgrade vert → +3 PV instantanés.',
    effect: { type: 'passive', trigger: 'onUpgradeGained', colorFilter: UPGRADE_COLORS.GREEN, action: 'heal', value: 3 },
    tags: ['soin', 'synergie'],
  },
  {
    id: 'resistance', name: 'Résistance', color: UPGRADE_COLORS.GREEN, rarity: 'epic', maxStack: 1,
    description: 'Si PV > 50% : dégâts reçus réduits de 35%.',
    effect: { type: 'passive', trigger: 'onDamaged', action: 'reduceDamage', threshold: 0.5, reduction: 0.35 },
    tags: ['défense', 'survie'],
  },
  {
    id: 'contrat_mortel', name: 'Contrat Mortel', color: UPGRADE_COLORS.GREEN, rarity: 'epic', maxStack: 1,
    description: '+12 PV max — mais commence chaque vague à 60% de tes PV.',
    effect: { type: 'stat', stat: 'maxHp', value: 12 },
    tags: ['survie', 'risque'],
  },

  // ── Malédictions ─────────────────────────────────────────────────────────
  {
    id: 'fragilite', name: 'Fragilité', color: UPGRADE_COLORS.CURSE, rarity: 'curse', maxStack: 1,
    description: '☠ MALÉDICTION — −5 PV max et −1 DEF.',
    effect: { type: 'stat', changes: [{ stat: 'maxHp', value: -5 }, { stat: 'defense', value: -1 }] },
    tags: ['malus'],
  },
  {
    id: 'fardeau', name: 'Fardeau', color: UPGRADE_COLORS.CURSE, rarity: 'curse', maxStack: 1,
    description: '☠ MALÉDICTION — Chaque attaque ennemie inflige +2 dégâts bonus.',
    effect: { type: 'passive', trigger: 'onDamaged', action: 'extraDamage', value: 2 },
    tags: ['malus'],
  },
  {
    id: 'corruption', name: 'Corruption', color: UPGRADE_COLORS.CURSE, rarity: 'curse', maxStack: 1,
    description: '☠ MALÉDICTION — Perd 1 PV toutes les 5s.',
    effect: { type: 'passive', trigger: 'periodic', action: 'selfDamage', value: 1, interval: 5 },
    tags: ['malus'],
  },
];

const UPGRADE_MAP = ALL_UPGRADES.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});

// ─── API ──────────────────────────────────────────────────────────────────────

export function getUpgradeChoices(activeUpgrades, count = 3) {
  const stackCount = {};
  activeUpgrades.forEach(u => { stackCount[u.id] = (stackCount[u.id] || 0) + 1; });
  const colorCount = countByColor(activeUpgrades);
  const dominantColor = Object.entries(colorCount)
    .sort((a, b) => b[1] - a[1])
    .find(([, value]) => value > 0)?.[0] || null;

  const available = ALL_UPGRADES.filter(u => (stackCount[u.id] || 0) < u.maxStack);
  if (available.length <= count) return [...available];

  const weighted = available.flatMap(u => {
    const rarityWeight = u.rarity === 'common' ? 3
               : u.rarity === 'rare'   ? 2
               : u.rarity === 'epic'   ? 1.2
               : u.rarity === 'curse'  ? 2.5
               : 1;
    const affinityStacks = dominantColor && u.color === dominantColor ? Math.max(0, colorCount[dominantColor] || 0) : 0;
    const affinityWeight = dominantColor && u.color === dominantColor
      ? 1 + Math.min(0.5, affinityStacks * 0.12)
      : 1;
    const copies = Math.max(1, Math.round(rarityWeight * affinityWeight));
    return Array.from({ length: copies }, () => u);
  });

  const selected    = [];
  const usedIds     = new Set();
  let   cursePicked = 0;
  let   attempts    = 0;

  while (selected.length < count && attempts < 200) {
    attempts++;
    const candidate = weighted[Math.floor(Math.random() * weighted.length)];
    if (candidate.rarity === 'curse' && cursePicked >= 1) continue;
    if (!usedIds.has(candidate.id)) {
      usedIds.add(candidate.id);
      selected.push(candidate);
      if (candidate.rarity === 'curse') cursePicked += 1;
    }
  }

  // Fallback robuste : si le tirage pondéré n'a pas rempli toutes les slots,
  // compléter avec des upgrades disponibles non encore utilisées.
  if (selected.length < count) {
    const remaining = available.filter(u => !usedIds.has(u.id));
    while (selected.length < count && remaining.length > 0) {
      const i = Math.floor(Math.random() * remaining.length);
      const candidate = remaining.splice(i, 1)[0];
      if (candidate.rarity === 'curse' && cursePicked >= 1) continue;
      usedIds.add(candidate.id);
      selected.push(candidate);
      if (candidate.rarity === 'curse') cursePicked += 1;
    }
  }

  return selected;
}

export function getBuildRecommendation(activeUpgrades) {
  const colorCount = countByColor(activeUpgrades);
  const entries = Object.entries(colorCount)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;
  const [color, count] = entries[0];
  const secondCount = entries[1]?.[1] || 0;
  if (count < 2 || count - secondCount < 1) return null;
  return { color, count, secondCount };
}

export function applySynergies(upgrades) {
  const colorCount = countByColor(upgrades);
  const activeColors = Object.entries(colorCount)
    .filter(([, c]) => c >= 3)
    .map(([color]) => color);
  return upgrades.map(u => ({ ...u, synergyActive: activeColors.includes(u.color) }));
}

/**
 * Calcule les stats du joueur en tenant compte de tous les upgrades.
 * Les stats de base (player) sont enrichies par les effets de type 'stat'.
 */
export function computePlayerStats(basePlayer, activeUpgrades) {
  let stats = { ...basePlayer };
  const curseMult = hasCurseSynergy(activeUpgrades) ? 2 : 1;

  activeUpgrades.forEach(u => {
    if (u.effect.type === 'stat') {
      const changes = u.effect.changes || [{ stat: u.effect.stat, value: u.effect.value }];
      changes.forEach(({ stat, value, multiplicative }) => {
        if (stats[stat] !== undefined) {
          if (multiplicative) {
            stats[stat] *= value;
          } else {
            stats[stat] += value * curseMult;
          }
        }
      });
    }
  });

  stats.attack  = Math.max(1,   stats.attack);
  stats.defense = Math.max(0,   stats.defense);
  stats.maxHp   = Math.max(1,   stats.maxHp);
  stats.speed   = Math.max(0.5, stats.speed);
  stats.hp      = Math.min(stats.hp, stats.maxHp);
  return stats;
}

export function getUpgradeById(id)              { return UPGRADE_MAP[id] || null; }
export function hasUpgrade(upgrades, id)        { return upgrades.some(u => u.id === id); }
export function getUpgradesByColor(upgrades, c) { return upgrades.filter(u => u.color === c); }
export function hasCurseSynergy(upgrades)       { return upgrades.filter(u => u.color === 'curse').length >= 3; }

export function getSynergySummary(activeUpgrades) {
  const colorCount = countByColor(activeUpgrades);
  return Object.entries(colorCount).map(([color, count]) => ({
    color, count, active: color === 'curse' ? count >= 3 : count >= 3,
  }));
}

function countByColor(upgrades) {
  const count = { red: 0, blue: 0, green: 0, curse: 0 };
  upgrades.forEach(u => { if (count[u.color] !== undefined) count[u.color]++; });
  return count;
}
