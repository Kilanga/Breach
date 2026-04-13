/**
 * BREACH — Système de vagues d'ennemis
 * Config JSON par minute + scaling de difficulté
 */

import { ENEMY_TYPES, VICTORY_TIME } from '../constants';

// ─── Config des vagues par intervalle de temps (secondes) ─────────────────────
// Chaque entrée = spawns déclenchés entre [fromSec, toSec]
// spawnInterval = secondes entre chaque spawn d'un groupe

export const WAVE_CONFIGS = [
  // ── Minute 0–1 : introduction ─────────────────────────────────────────────
  {
    fromSec: 0,
    toSec: 60,
    groups: [
      { type: ENEMY_TYPES.CHASER,  count: 1, spawnInterval: 2.5 },
    ],
  },
  // ── Minute 1–2 : première pression ───────────────────────────────────────
  {
    fromSec: 60,
    toSec: 120,
    groups: [
      { type: ENEMY_TYPES.CHASER,  count: 2, spawnInterval: 2.0 },
      { type: ENEMY_TYPES.SHOOTER, count: 1, spawnInterval: 5.0 },
    ],
  },
  // ── Minute 2–3 ────────────────────────────────────────────────────────────
  {
    fromSec: 120,
    toSec: 180,
    groups: [
      { type: ENEMY_TYPES.CHASER,   count: 2, spawnInterval: 1.8 },
      { type: ENEMY_TYPES.SHOOTER,  count: 1, spawnInterval: 4.0 },
      { type: ENEMY_TYPES.BLOCKER,  count: 1, spawnInterval: 8.0 },
    ],
  },
  // ── Minute 3–4 ────────────────────────────────────────────────────────────
  {
    fromSec: 180,
    toSec: 240,
    groups: [
      { type: ENEMY_TYPES.CHASER,    count: 3, spawnInterval: 1.5 },
      { type: ENEMY_TYPES.SHOOTER,   count: 2, spawnInterval: 3.5 },
      { type: ENEMY_TYPES.EXPLOSIVE, count: 1, spawnInterval: 6.0 },
    ],
  },
  // ── Minute 4–5 ────────────────────────────────────────────────────────────
  {
    fromSec: 240,
    toSec: 300,
    groups: [
      { type: ENEMY_TYPES.CHASER,    count: 3, spawnInterval: 1.3 },
      { type: ENEMY_TYPES.SHOOTER,   count: 2, spawnInterval: 3.0 },
      { type: ENEMY_TYPES.HEALER,    count: 1, spawnInterval: 7.0 },
      { type: ENEMY_TYPES.EXPLOSIVE, count: 1, spawnInterval: 5.0 },
    ],
  },
  // ── Minute 5–6 ────────────────────────────────────────────────────────────
  {
    fromSec: 300,
    toSec: 360,
    groups: [
      { type: ENEMY_TYPES.CHASER,   count: 4, spawnInterval: 1.2 },
      { type: ENEMY_TYPES.SHOOTER,  count: 2, spawnInterval: 2.8 },
      { type: ENEMY_TYPES.SUMMONER, count: 1, spawnInterval: 9.0 },
      { type: ENEMY_TYPES.BLOCKER,  count: 1, spawnInterval: 6.0 },
    ],
  },
  // ── Minute 6–7 ────────────────────────────────────────────────────────────
  {
    fromSec: 360,
    toSec: 420,
    groups: [
      { type: ENEMY_TYPES.CHASER,    count: 4, spawnInterval: 1.0 },
      { type: ENEMY_TYPES.SHOOTER,   count: 3, spawnInterval: 2.5 },
      { type: ENEMY_TYPES.SUMMONER,  count: 1, spawnInterval: 8.0 },
      { type: ENEMY_TYPES.EXPLOSIVE, count: 2, spawnInterval: 4.0 },
      { type: ENEMY_TYPES.HEALER,    count: 1, spawnInterval: 6.0 },
    ],
  },
  // ── Minute 7+ : chaos total ───────────────────────────────────────────────
  {
    fromSec: 420,
    toSec: Infinity,
    groups: [
      { type: ENEMY_TYPES.CHASER,    count: 5, spawnInterval: 0.8 },
      { type: ENEMY_TYPES.SHOOTER,   count: 3, spawnInterval: 2.0 },
      { type: ENEMY_TYPES.SUMMONER,  count: 2, spawnInterval: 6.0 },
      { type: ENEMY_TYPES.EXPLOSIVE, count: 2, spawnInterval: 3.0 },
      { type: ENEMY_TYPES.BLOCKER,   count: 2, spawnInterval: 4.0 },
      { type: ENEMY_TYPES.HEALER,    count: 2, spawnInterval: 5.0 },
    ],
  },
];

// Boss par minute (toutes les 60s)
export const BOSS_SCHEDULE = [
  { atSec: 60,  type: ENEMY_TYPES.BOSS_VOID   },
  { atSec: 120, type: ENEMY_TYPES.BOSS_CINDER },
  { atSec: 180, type: ENEMY_TYPES.BOSS_MIRROR },
  { atSec: 240, type: ENEMY_TYPES.BOSS_PULSE  },
  { atSec: 300, type: ENEMY_TYPES.BOSS_RIFT   },
];

/**
 * Retourne la config de vague active pour un temps de jeu donné
 */
export function getActiveWaveConfig(elapsedSeconds) {
  return WAVE_CONFIGS.find(w => elapsedSeconds >= w.fromSec && elapsedSeconds < w.toSec)
    || WAVE_CONFIGS[WAVE_CONFIGS.length - 1];
}

/**
 * Scaling de difficulté : HP, dégâts, vitesse augmentent avec le temps.
 * En mode Endless, un bonus de +25% par minute s'applique après le compte à rebours.
 */
export function getEnemyScaling(elapsedSeconds) {
  const minute = elapsedSeconds / 60;
  // Endless bonus : +25% par minute après VICTORY_TIME (5 min)
  const endlessMinutes = Math.max(0, (elapsedSeconds - VICTORY_TIME) / 60);
  const endlessBonus   = endlessMinutes * 0.25;
  let hpMult = 1 + minute * 0.35 + endlessBonus;
  let damageMult = 1 + minute * 0.2 + endlessBonus;
  let speedMult = 1 + Math.min(minute * 0.1 + endlessBonus * 0.4, 1.5);
  // Modificateurs selon le mode de jeu
  if (arguments[1] === 'hard') {
    hpMult *= 1.5;
    damageMult *= 1.5;
    speedMult *= 1.15;
  } else if (arguments[1] === 'prestige') {
    hpMult *= 2.0;
    damageMult *= 2.0;
    speedMult *= 1.25;
  }
  return { hpMult, damageMult, speedMult };
}

/**
 * Retourne le boss à spawner au temps t, ou null
 */
export function getBossAtTime(elapsedSeconds, spawnedBosses) {
  const entry = BOSS_SCHEDULE.find(b => {
    const diff = Math.abs(elapsedSeconds - b.atSec);
    return diff < 0.5 && !spawnedBosses.has(b.atSec);
  });
  return entry || null;
}
