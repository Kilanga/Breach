    // ── Sélection du badge affiché ──────────────────────────────────────
    setSelectedBadge: (badgeId) => {
      const meta = get().meta;
      if (!meta.badges?.includes(badgeId)) return;
      set({ meta: { ...meta, selectedBadge: badgeId } });
    },
import { WEEKLY_CHALLENGES } from '../../systems/questSystem';
    // ── Défi hebdomadaire ───────────────────────────────────────────────
    checkWeeklyChallenge: () => {
      const meta = get().meta;
      const now = Date.now();
      const weekMs = 7 * 24 * 60 * 60 * 1000;
      let challenge = meta.weeklyChallenge;
      const startOfWeek = (() => {
        const d = new Date(now);
        d.setHours(0,0,0,0);
        d.setDate(d.getDate() - d.getDay()); // dimanche
        return d.getTime();
      })();
      // Nouveau challenge si absent ou trop vieux
      if (!challenge || !challenge.startDate || challenge.startDate < startOfWeek) {
        // Sélection pseudo-aléatoire basée sur la semaine
        const weekIdx = Math.floor(startOfWeek / weekMs) % WEEKLY_CHALLENGES.length;
        const picked = WEEKLY_CHALLENGES[weekIdx];
        challenge = {
          id: picked.id,
          startDate: startOfWeek,
          progress: 0,
          completed: false,
          rewardClaimed: false,
        };
        set({ meta: { ...meta, weeklyChallenge: challenge } });
      }
      return challenge;
    },
/**
 * BREACH — Slice méta-progression (persistée)
 */

import { PERMANENT_UPGRADES_CATALOG } from '../../constants';
import { computePlayerStats } from '../../systems/upgradeSystem';
import { CLASS_INFO } from '../../constants';
import { trackEvent } from '../../utils/telemetry';
import { submitScore } from '../../services/leaderboardApi';
import { addLocalScore } from '../../services/localLeaderboard';
import { MILESTONES, isMilestoneReached } from '../../systems/milestoneSystem';
import { BADGES } from '../../systems/badgeSystem';

export const INITIAL_META = {
  permanentUpgrades:  [],
  bestSurvivalTime:   0,      // secondes
  bestScore:          0,      // meilleur score toutes runs
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
    octagon:  { runs: 0, bestTime: 0, wins: 0, kills: 0 },
    engineer: { runs: 0, bestTime: 0, wins: 0, kills: 0 },
  },
  musicEnabled:      true,
  sfxEnabled:        true,
  musicVolume:       0.5,
  sfxVolume:         0.7,
  largeText:         false,
  colorBlindMode:    false,
  language:          'fr',
  lastLoginDate:     null, // timestamp (ms)
  loginStreak:       0,    // jours consécutifs
  loginRewards:      [],   // historique des récompenses de connexion
  weeklyChallenge:   null, // { id, startDate, progress, completed, rewardClaimed }
  weeklyChallengeHistory: [], // [{ id, startDate, completed }]
  badges:            [],   // ids des badges débloqués
  selectedBadge:     null, // id du badge sélectionné
};

export function createMetaSlice(set, get) {
  return {
    // ── Récompense de connexion quotidienne ──────────────────────────────
    checkLoginReward: () => {
      const meta = get().meta;
      const now = Date.now();
      const last = meta.lastLoginDate || 0;
      const oneDay = 24 * 60 * 60 * 1000;
      const today = new Date(now).setHours(0,0,0,0);
      const lastDay = last ? new Date(last).setHours(0,0,0,0) : 0;
      let streak = meta.loginStreak || 0;
      let reward = null;
      if (!last || today > lastDay) {
        // Nouveau jour
        if (last && today - lastDay === oneDay) streak += 1;
        else streak = 1;
        // Récompense simple (progressive)
        const amount = 2 + Math.min(streak, 7); // ex: 3 à 9 fragments
        reward = { date: now, streak, amount };
        set({ meta: {
          ...meta,
          lastLoginDate: now,
          loginStreak: streak,
          loginRewards: [...(meta.loginRewards || []), reward],
        }});
      }
      return reward;
    },

    // ── Fin de run ──────────────────────────────────────────────────────────
    endRun: async ({ shape, survivalTime, kills, won, score, level, activeUpgrades }) => {
      // Instrumentation télémétrie
      trackEvent('run_end', {
        shape,
        survivalTime,
        kills,
        won,
        score,
        level,
        activeUpgrades,
      });
      const meta = get().meta;
      const isWin = won || survivalTime >= 300; // 5 minutes = victoire

      // Mise à jour défi hebdomadaire
      let weeklyChallenge = meta.weeklyChallenge;
      if (weeklyChallenge) {
        // Trouver le challenge courant
        const { WEEKLY_CHALLENGES } = await import('../../systems/questSystem');
        const challengeDef = WEEKLY_CHALLENGES.find(c => c.id === weeklyChallenge.id);
        if (challengeDef) {
          let progress = weeklyChallenge.progress || 0;
          let add = 0;
          if (challengeDef.progressKey === 'kills') add = kills;
          if (challengeDef.progressKey === 'wins' && isWin) add = 1;
          if (challengeDef.progressKey === 'upgrades') add = activeUpgrades?.length || 0;
          progress += add;
          let completed = progress >= challengeDef.goal;
          let rewardClaimed = weeklyChallenge.rewardClaimed;
          // Récompense automatique à la complétion
          if (completed && !rewardClaimed) {
            rewardClaimed = true;
            // Ajout des fragments
            const newTP = (meta.talentPoints || 0) + (challengeDef.reward?.amount || 0);
            set({ meta: { ...meta, talentPoints: newTP } });
          }
          weeklyChallenge = {
            ...weeklyChallenge,
            progress,
            completed,
            rewardClaimed,
          };
        }
      }

      // Mise à jour shapeStats
      const shapeStats = { ...meta.shapeStats };
      const ss = { ...shapeStats[shape] };
      ss.runs += 1;
      ss.kills += kills;
      if (survivalTime > ss.bestTime) ss.bestTime = survivalTime;
      if (isWin) ss.wins += 1;
      shapeStats[shape] = ss;

      // Mise à jour globale
      // Calcul upgrades cumulés
      const totalUpgrades = (meta.totalUpgrades || 0) + (activeUpgrades?.length || 0);
      // Historique des défis hebdo complétés
      let weeklyChallengeHistory = meta.weeklyChallengeHistory || [];
      if (weeklyChallenge && weeklyChallenge.completed && !weeklyChallengeHistory.some(h => h.id === weeklyChallenge.id && h.startDate === weeklyChallenge.startDate)) {
        weeklyChallengeHistory = [
          { id: weeklyChallenge.id, startDate: weeklyChallenge.startDate, completed: true },
          ...weeklyChallengeHistory
        ].slice(0, 20);
      }
      // Détection des badges débloqués
      const prevBadges = meta.badges || [];
      const unlockedNow = BADGES.filter(b => b.condition(meta) && !prevBadges.includes(b.id)).map(b => b.id);
      let badges = prevBadges;
      if (unlockedNow.length > 0) {
        badges = [...prevBadges, ...unlockedNow];
      }

      const newMeta = {
        ...meta,
        totalRuns:        meta.totalRuns  + 1,
        totalKills:       meta.totalKills + kills,
        totalWins:        isWin ? meta.totalWins + 1 : meta.totalWins,
        bestSurvivalTime: Math.max(meta.bestSurvivalTime, survivalTime),
        bestScore:        Math.max(meta.bestScore || 0, score || 0),
        shapeStats,
        runHistory: [
          { shape, survivalTime, kills, won: isWin, score: score || 0, level: level || 1, date: Date.now() },
          ...(meta.runHistory || []),
        ].slice(0, 10),
        totalUpgrades,
        weeklyChallenge,
        weeklyChallengeHistory,
        badges,
      };

      // Détection des milestones atteints
      const prevMilestones = meta.milestones || [];
      const reachedNow = MILESTONES.filter(m => isMilestoneReached(m, newMeta) && !prevMilestones.includes(m.id)).map(m => m.id);
      if (reachedNow.length > 0) {
        newMeta.milestones = [...prevMilestones, ...reachedNow];
      } else {
        newMeta.milestones = prevMilestones;
      }

      // Unlock upgrades permanents
      const unlocked = checkUnlocks(newMeta, meta.permanentUpgrades);
      newMeta.permanentUpgrades = unlocked;

      // Fragments gagnés (perm_fragmaster : +1 fragment par run)
      const extraFragment = newMeta.permanentUpgrades.includes('perm_fragmaster') ? 1 : 0;
      const fragmentsEarned = Math.floor(survivalTime / 10) + kills + extraFragment;
      newMeta.talentPoints = (newMeta.talentPoints || 0) + Math.floor(fragmentsEarned / 5);

      set({ meta: newMeta });
      const playerName = meta.playerName || 'Anonyme';
      // Sauvegarde locale (toujours)
      await addLocalScore({ playerName, score: score || 0, survivalTime, kills, shape });
      // Soumission réseau (best-effort)
      try {
        await submitScore({ playerName, score: score || 0, survivalTime, kills, shape });
      } catch {
        // Ignore erreur réseau
      }
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

    // ── Achats upgrades permanents ──────────────────────────────────────────
    buyPermanentUpgrade: (id) => {
      const meta = get().meta;
      if (meta.permanentUpgrades.includes(id)) return false;
      const cat = PERMANENT_UPGRADES_CATALOG.find(u => u.id === id);
      if (!cat || !cat.cost) return false;
      if ((meta.talentPoints || 0) < cat.cost) return false;
      set({
        meta: {
          ...meta,
          permanentUpgrades: [...meta.permanentUpgrades, id],
          talentPoints: (meta.talentPoints || 0) - cat.cost,
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
    setColorBlindMode: (v) => set(s => ({ meta: { ...s.meta, colorBlindMode: v } })),
    setLargeText: (v) => set(s => ({ meta: { ...s.meta, largeText: v } })),
  };
}

// ─── Vérification des déblocages ──────────────────────────────────────────────
function checkUnlocks(meta, currentUnlocked) {
  const unlocked = [...currentUnlocked];
  for (const cat of PERMANENT_UPGRADES_CATALOG) {
    if (unlocked.includes(cat.id)) continue;
    if (cat.cost) continue; // Purchasable items must be bought manually
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
