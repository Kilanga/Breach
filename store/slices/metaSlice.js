/**
 * BREACH — Slice méta-progression (persistée)
 */

import { PERMANENT_UPGRADES_CATALOG } from '../../constants';
import { computePlayerStats } from '../../systems/upgradeSystem';
import { CLASS_INFO } from '../../constants';

export const INITIAL_META = {
  permanentUpgrades:  [],
  bestSurvivalTime:   0,      // secondes
  totalRuns:          0,
  totalKills:         0,
  totalWins:          0,      // runs de 5min+ complétés
  achievements:       [],
  runHistory:         [],     // 5 dernières runs
  localLeaderboard:   [],     // Top 5 scores
  playerName:         '',
  talentPoints:       0,
  unlockedTalents:    [],
  purchasedClasses:   [],
  shapeStats: {
    triangle: { runs: 0, bestTime: 0, wins: 0, kills: 0 },
    circle:   { runs: 0, bestTime: 0, wins: 0, kills: 0 },
    hexagon:  { runs: 0, bestTime: 0, wins: 0, kills: 0 },
    shadow:   { runs: 0, bestTime: 0, wins: 0, kills: 0 },
    paladin:  { runs: 0, bestTime: 0, wins: 0, kills: 0 },
  },
  musicEnabled:      true,
  sfxEnabled:        true,
  musicVolume:       0.5,
  sfxVolume:         0.7,
};

export function createMetaSlice(set, get) {
  return {

    // ── Fin de run ──────────────────────────────────────────────────────────
    endRun: ({ shape, survivalTime, kills, won, activeUpgrades }) => {
      const meta = get().meta;
      const isWin = won || survivalTime >= 300; // 5 minutes = victoire

      // Mise à jour shapeStats
      const shapeStats = { ...meta.shapeStats };
      const ss = { ...shapeStats[shape] };
      ss.runs += 1;
      ss.kills += kills;
      if (survivalTime > ss.bestTime) ss.bestTime = survivalTime;
      if (isWin) ss.wins += 1;
      shapeStats[shape] = ss;

      // Mise à jour globale
      const newMeta = {
        ...meta,
        totalRuns:  meta.totalRuns  + 1,
        totalKills: meta.totalKills + kills,
        totalWins:  isWin ? meta.totalWins + 1 : meta.totalWins,
        bestSurvivalTime: Math.max(meta.bestSurvivalTime, survivalTime),
        shapeStats,
        runHistory: [
          { shape, survivalTime, kills, won: isWin, date: Date.now() },
          ...(meta.runHistory || []),
        ].slice(0, 10),
      };

      // Unlock upgrades permanents
      const unlocked = checkUnlocks(newMeta, meta.permanentUpgrades);
      newMeta.permanentUpgrades = unlocked;

      // Fragments gagnés
      const fragmentsEarned = Math.floor(survivalTime / 10) + kills;
      newMeta.talentPoints = (newMeta.talentPoints || 0) + Math.floor(fragmentsEarned / 5);

      set({ meta: newMeta });
      return { isWin, fragmentsEarned };
    },

    // ── Achats classe ───────────────────────────────────────────────────────
    purchaseClass: (shape) => {
      const meta = get().meta;
      if (meta.purchasedClasses.includes(shape)) return false;
      const cost = CLASS_INFO[shape]?.purchaseCost || 0;
      if ((meta.talentPoints || 0) < cost) return false;
      set({
        meta: {
          ...meta,
          purchasedClasses: [...meta.purchasedClasses, shape],
          talentPoints: (meta.talentPoints || 0) - cost,
        },
      });
      return true;
    },

    isClassUnlocked: (shape) => {
      const info = CLASS_INFO[shape];
      if (!info?.locked) return true;
      const meta = get().meta;
      return meta.purchasedClasses.includes(shape);
    },

    // ── Stat de départ enrichies par les upgrades permanents ────────────────
    getStartingStats: (shape) => {
      const meta = get().meta;
      const info = CLASS_INFO[shape];
      if (!info) return {};
      const base = { ...info.baseStats, hp: info.baseStats.maxHp, regen: 0, xpPickupRadius: 50 };
      const permUpgrades = meta.permanentUpgrades
        .filter(id => {
          const cat = PERMANENT_UPGRADES_CATALOG.find(u => u.id === id);
          return cat && cat.statBonus;
        })
        .map(id => {
          const cat = PERMANENT_UPGRADES_CATALOG.find(u => u.id === id);
          return {
            id,
            effect: { type: 'stat', stat: cat.statBonus.stat, value: cat.statBonus.value },
          };
        });
      return computePlayerStats(base, permUpgrades);
    },

    // ── Préférences ─────────────────────────────────────────────────────────
    setMusicEnabled: (v) => set(s => ({ meta: { ...s.meta, musicEnabled: v } })),
    setSfxEnabled:   (v) => set(s => ({ meta: { ...s.meta, sfxEnabled:   v } })),
    setMusicVolume:  (v) => set(s => ({ meta: { ...s.meta, musicVolume:  v } })),
    setSfxVolume:    (v) => set(s => ({ meta: { ...s.meta, sfxVolume:    v } })),
    setPlayerName:   (v) => set(s => ({ meta: { ...s.meta, playerName:   v } })),
  };
}

// ─── Vérification des déblocages ──────────────────────────────────────────────
function checkUnlocks(meta, currentUnlocked) {
  const unlocked = [...currentUnlocked];
  for (const cat of PERMANENT_UPGRADES_CATALOG) {
    if (unlocked.includes(cat.id)) continue;
    if (!cat.unlockCondition) {
      unlocked.push(cat.id);
      continue;
    }
    const cond = cat.unlockCondition;
    let meets = false;
    if (cond.type === 'runs')      meets = meta.totalRuns  >= cond.value;
    if (cond.type === 'kills')     meets = meta.totalKills >= cond.value;
    if (cond.type === 'wins')      meets = meta.totalWins  >= cond.value;
    if (cond.type === 'shape_win') meets = meta.shapeStats[cond.shape]?.wins >= 1;
    if (meets) unlocked.push(cat.id);
  }
  return unlocked;
}
