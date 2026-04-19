
import { WEEKLY_CHALLENGES } from '../../systems/questSystem';
import { PERMANENT_UPGRADES_CATALOG } from '../../constants';
import { computePlayerStats } from '../../systems/upgradeSystem';
import { CLASS_INFO } from '../../constants';
import { trackEvent } from '../../utils/telemetry';
import { submitScore } from '../../services/leaderboardApi';
import { addLocalScore } from '../../services/localLeaderboard';
import { MILESTONES, isMilestoneReached } from '../../systems/milestoneSystem';
import { BADGES } from '../../systems/badgeSystem';

/**
 * BREACH — Slice méta-progression (persistée)
 */

export function createMetaSlice(set, get) {
  return {
    // ── Sélection du badge affiché ──────────────────────────────────────
    setSelectedBadge: (badgeId) => {
      const meta = get().meta;
      if (!meta.badges?.includes(badgeId)) return;
      set({ meta: { ...meta, selectedBadge: badgeId } });
    },
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
    // ── Quêtes journalières ─────────────────────────────────────────────────
    checkDailyQuests: () => {
      const meta = get().meta;
      const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
      const dq    = meta.dailyQuests;
      if (!dq || dq.date !== today) {
        // Nouveau jour → réinitialiser la progression
        const fresh = {
          date:     today,
          progress: { kill_100: 0, reach_level_10: 0 },
          claimed:  {},
        };
        set({ meta: { ...meta, dailyQuests: fresh } });
        return fresh;
      }
      return dq;
    },

    updateDailyQuestProgress: ({ kills, level }) => {
      const meta = get().meta;
      const today = new Date().toISOString().slice(0, 10);
      const dq    = meta.dailyQuests;
      if (!dq || dq.date !== today) return;
      const progress = { ...dq.progress };
      // kill_100 : cumul des kills sur la journée
      progress.kill_100      = Math.min(100, (progress.kill_100      || 0) + (kills || 0));
      // reach_level_10 : max level atteint aujourd'hui
      progress.reach_level_10 = Math.max(progress.reach_level_10 || 0, level || 0);
      set({ meta: { ...meta, dailyQuests: { ...dq, progress } } });
    },

    claimDailyQuestReward: (questId) => {
      const meta = get().meta;
      const today = new Date().toISOString().slice(0, 10);
      const dq    = meta.dailyQuests;
      if (!dq || dq.date !== today) return false;
      if (dq.claimed?.[questId]) return false; // déjà réclamée
      const { QUESTS } = require('../../systems/questSystem');
      const quest = QUESTS.find(q => q.id === questId && q.type === 'daily');
      if (!quest) return false;
      const progress = dq.progress?.[questId] || 0;
      if (progress < quest.goal) return false; // pas encore complétée
      // Accorder la récompense
      const amount = quest.reward?.amount || 1;
      set({ meta: {
        ...meta,
        talentPoints: (meta.talentPoints || 0) + amount,
        dailyQuests: { ...dq, claimed: { ...(dq.claimed || {}), [questId]: true } },
      }});
      return true;
    },

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

      // Mise à jour quêtes journalières
      const today = new Date().toISOString().slice(0, 10);
      const dq    = newMeta.dailyQuests;
      if (dq && dq.date === today) {
        const updProg = { ...dq.progress };
        updProg.kill_100       = Math.min(100, (updProg.kill_100       || 0) + kills);
        updProg.reach_level_10 = Math.max(updProg.reach_level_10 || 0, level || 1);
        newMeta.dailyQuests = { ...dq, progress: updProg };
      } else {
        // Premier accès du jour : initialiser
        newMeta.dailyQuests = {
          date:     today,
          progress: { kill_100: kills, reach_level_10: level || 1 },
          claimed:  {},
        };
      }

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
