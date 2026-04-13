/**
 * BREACH — Game Loop temps réel
 * Gère : déplacements, IA ennemis, projectiles, collisions, XP, upgrades triggers
 */

import { ENEMY_INFO, CLASS_INFO, ARENA_WIDTH, ARENA_HEIGHT,
         PLAYER_RADIUS, BASE_ENEMY_RADIUS, XP_PER_LEVEL_BASE, XP_LEVEL_SCALING,
         ENEMY_TYPES, SPEED_SCALE, SHOOTER_DESIRED_DIST, EXPLOSION_RADIUS,
         FRACTURE_RADIUS, SHOCKWAVE_RADIUS, XP_ATTRACT_RADIUS_MULT,
         XP_ATTRACT_SPEED, INVINCIBLE_DURATION } from '../constants';
import { getActiveWaveConfig, getEnemyScaling, getBossAtTime } from './waveSystem';
import { getAttackFn, getAttackCooldown, fireShooterProjectile } from './attackSystem';
import { computePlayerStats, hasUpgrade } from './upgradeSystem';
import { makeId } from '../utils/makeId';

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createInitialState(shape, startingStats) {
  const info = CLASS_INFO[shape];
  return {
    player: {
      x: ARENA_WIDTH  / 2,
      y: ARENA_HEIGHT / 2,
      shape,
      hp:         startingStats.maxHp,
      maxHp:      startingStats.maxHp,
      attack:     startingStats.attack,
      defense:    startingStats.defense,
      speed:      startingStats.speed,
      regen:      startingStats.regen || 0,
      xpPickupRadius: startingStats.xpPickupRadius || 50,
      invincibleTimer: 0,        // secondes d'invincibilité après un coup
      shieldActive: false,
      secondWindUsed: false,
    },
    enemies: [],
    playerProjectiles: [],
    enemyProjectiles:  [],
    xpOrbs:    [],
    particles: [],
    // Timers
    attackTimer:     0,         // temps avant la prochaine attaque
    ambushTimer:     0,         // timer pour l'embuscade de l'Ombre
    ambushReady:     true,
    regenAccum:      0,         // accumulation de regen
    shieldCooldown:  0,         // timer du bouclier périodique
    // Vagues
    waveTimers:     {},         // { 'chaser_0': secondsUntilNextSpawn }
    spawnedBosses:  new Set(),
    // Progression
    elapsedTime:    0,          // secondes depuis le début
    score:          0,
    xp:             0,
    level:          1,
    kills:          0,
    bossKills:      0,          // boss tués (bonus score)
    pendingUpgrade: false,      // true = afficher l'écran d'upgrade
    activeUpgrades: [],
    // État
    alive:          true,
    paused:         false,
    // Effets actifs
    attackBoostTimer: 0,        // boost d'attaque après kill (chain_reaction)
    attackBoostMult:  1,
  };
}

// ─── Boucle principale ────────────────────────────────────────────────────────

/**
 * Met à jour tout l'état du jeu pour un frame donné.
 * @param {object} state - état courant (mutable)
 * @param {number} dt    - delta time en secondes
 * @param {object} input - { dx, dy } direction du joystick [-1..1]
 * @returns {object}     état mis à jour
 */
export function updateGame(state, dt, input) {
  if (!state.alive || state.paused || state.pendingUpgrade) return state;

  // Clone shallow pour éviter les mutations directes sur la ref React
  let s = { ...state };

  // Timers
  s.elapsedTime += dt;
  s.attackTimer = Math.max(0, s.attackTimer - dt);
  s.invincibleTimer = Math.max(0, (s.player.invincibleTimer || 0) - dt);
  s.attackBoostTimer = Math.max(0, s.attackBoostTimer - dt);
  if (s.attackBoostTimer <= 0) s.attackBoostMult = 1;

  // ── Ambush (Ombre) ────────────────────────────────────────────────────────
  if (s.player.shape === 'shadow') {
    if (!s.ambushReady) {
      s.ambushTimer += dt;
      if (s.ambushTimer >= CLASS_INFO.shadow.ambushCooldown) {
        s.ambushReady = true;
        s.ambushTimer = 0;
      }
    }
  }

  // ── Régénération ──────────────────────────────────────────────────────────
  const totalRegen = s.player.regen;
  if (totalRegen > 0) {
    s.regenAccum += totalRegen * dt;
    if (s.regenAccum >= 1) {
      const healAmt = Math.floor(s.regenAccum);
      s.regenAccum -= healAmt;
      s.player = { ...s.player, hp: Math.min(s.player.hp + healAmt, s.player.maxHp) };
    }
  }

  // Paladin : aura de soin passive
  if (s.player.shape === 'paladin') {
    const healAura = CLASS_INFO.paladin.healAura * dt;
    s.player = { ...s.player, hp: Math.min(s.player.hp + healAura, s.player.maxHp) };
  }

  // ── Bouclier périodique (upgrades) ───────────────────────────────────────
  const shieldUpgrades = s.activeUpgrades.filter(u => u.id === 'shield_pulse' || u.id === 'fortifie');
  if (shieldUpgrades.length > 0) {
    const interval = shieldUpgrades.some(u => u.id === 'fortifie') ? 15 : 8;
    s.shieldCooldown = (s.shieldCooldown || 0) + dt;
    if (s.shieldCooldown >= interval) {
      s.shieldCooldown = 0;
      s.player = { ...s.player, shieldActive: true };
    }
  }

  // Corruption (malédiction)
  const corruption = s.activeUpgrades.filter(u => u.id === 'corruption').length;
  if (corruption > 0) {
    s._corruptionTimer = (s._corruptionTimer || 0) + dt;
    if (s._corruptionTimer >= 5) {
      s._corruptionTimer = 0;
      s = damagePlayer(s, corruption, false);
      if (!s.alive) return s;
    }
  }

  // ── Mouvement du joueur ───────────────────────────────────────────────────
  const speed = s.player.speed * SPEED_SCALE; // unités/s (SPEED_SCALE px par unité)
  const len = Math.sqrt(input.dx * input.dx + input.dy * input.dy);
  if (len > 0.01) {
    const nx = input.dx / len;
    const ny = input.dy / len;
    let nx2 = s.player.x + nx * speed * dt;
    let ny2 = s.player.y + ny * speed * dt;
    // Clamp dans l'arène
    nx2 = Math.max(PLAYER_RADIUS, Math.min(ARENA_WIDTH  - PLAYER_RADIUS, nx2));
    ny2 = Math.max(PLAYER_RADIUS, Math.min(ARENA_HEIGHT - PLAYER_RADIUS, ny2));
    s.player = { ...s.player, x: nx2, y: ny2 };
  }

  // ── Attaque automatique ───────────────────────────────────────────────────
  if (s.attackTimer <= 0 && s.enemies.length > 0) {
    const cd = getAttackCooldown(s.player.shape, s.activeUpgrades);
    s.attackTimer = cd;
    const attackFn = getAttackFn(s.player.shape);
    const effPlayer = { ...s.player, attack: Math.round(s.player.attack * s.attackBoostMult) };
    const projs = s.player.shape === 'shadow'
      ? attackFn(effPlayer, s.enemies, s.activeUpgrades, s.ambushReady)
      : attackFn(effPlayer, s.enemies, s.activeUpgrades);
    if (s.player.shape === 'shadow' && s.ambushReady && projs.length > 0) {
      s.ambushReady = false;
      s.ambushTimer = 0;
    }
    s.playerProjectiles = [...s.playerProjectiles, ...projs];
  }

  // ── Spawn ennemis ─────────────────────────────────────────────────────────
  s = spawnEnemies(s, dt);

  // ── Mise à jour ennemis ───────────────────────────────────────────────────
  s = updateEnemies(s, dt);

  // ── Mise à jour projectiles joueur ────────────────────────────────────────
  s = updatePlayerProjectiles(s, dt);

  // ── Mise à jour projectiles ennemis ──────────────────────────────────────
  s = updateEnemyProjectiles(s, dt);

  // ── Collecte XP ──────────────────────────────────────────────────────────
  s = collectXP(s, dt);

  // ── Particules ────────────────────────────────────────────────────────────
  s.particles = s.particles
    .map(p => ({ ...p, x: p.x + p.vx * dt * SPEED_SCALE, y: p.y + p.vy * dt * SPEED_SCALE, life: p.life - dt }))
    .filter(p => p.life > 0);

  // ── Score (temps + kills + niveau + boss) ────────────────────────────────
  s.score = Math.floor(s.elapsedTime) * 10
           + s.kills * 5
           + (s.level - 1) * 50
           + (s.bossKills || 0) * 200;

  return s;
}

// ─── Spawn ────────────────────────────────────────────────────────────────────

function spawnEnemies(s, dt) {
  const waveConfig = getActiveWaveConfig(s.elapsedTime);
  const scaling = getEnemyScaling(s.elapsedTime);
  const timers = { ...s.waveTimers };
  const newEnemies = [...s.enemies];

  for (const group of waveConfig.groups) {
    const key = group.type;
    if (timers[key] === undefined) timers[key] = 0;
    timers[key] -= dt;
    if (timers[key] <= 0) {
      timers[key] = group.spawnInterval;
      for (let i = 0; i < group.count; i++) {
        newEnemies.push(spawnEnemy(group.type, scaling));
      }
    }
  }

  // Boss
  const bossEntry = getBossAtTime(s.elapsedTime, s.spawnedBosses);
  if (bossEntry) {
    const newSpawned = new Set(s.spawnedBosses);
    newSpawned.add(bossEntry.atSec);
    newEnemies.push(spawnEnemy(bossEntry.type, scaling));
    return { ...s, enemies: newEnemies, waveTimers: timers, spawnedBosses: newSpawned };
  }

  return { ...s, enemies: newEnemies, waveTimers: timers };
}

function spawnEnemy(type, scaling) {
  const info = ENEMY_INFO[type];
  if (!info) return null;
  // Spawn sur le bord de l'arène
  const side = Math.floor(Math.random() * 4);
  let x, y;
  const margin = 20;
  if (side === 0) { x = Math.random() * ARENA_WIDTH; y = margin; }
  else if (side === 1) { x = ARENA_WIDTH - margin; y = Math.random() * ARENA_HEIGHT; }
  else if (side === 2) { x = Math.random() * ARENA_WIDTH; y = ARENA_HEIGHT - margin; }
  else              { x = margin; y = Math.random() * ARENA_HEIGHT; }

  return {
    id:       makeId(),
    type,
    x, y,
    hp:       Math.round(info.baseHp    * scaling.hpMult),
    maxHp:    Math.round(info.baseHp    * scaling.hpMult),
    damage:   Math.round(info.baseDamage * scaling.damageMult),
    speed:    info.baseSpeed * scaling.speedMult,
    radius:   info.radius || BASE_ENEMY_RADIUS,
    color:    info.color,
    isBoss:   info.isBoss || false,
    xpValue:  info.xpValue,
    scoreValue: info.scoreValue,
    behavior: info.behavior,
    // Timers comportement
    shootTimer: 0,
    summonTimer: 0,
    healTimer: 0,
    stunTimer: 0,
    freezeTimer: 0,
    burnDamage: 0,
    burnTimer: 0,
    name: info.name,
    // Boss patterns
    patternTimer: 0,
    patternPhase: 0,
  };
}

// ─── IA Ennemis ───────────────────────────────────────────────────────────────

function updateEnemies(s, dt) {
  const player = s.player;
  let newEnemyProjs = [...s.enemyProjectiles];
  let newParticles  = [...s.particles];
  let newSummons    = [];
  let healEvents    = []; // { id, amount } — appliqués après le map pour éviter les mutations

  // ── Pass 1 : IA + status effects ────────────────────────────────────────────
  let newEnemies = s.enemies
    .filter(Boolean)
    .map(e => {
      let enemy = { ...e };

      // Stun
      if (enemy.stunTimer > 0) {
        enemy.stunTimer = Math.max(0, enemy.stunTimer - dt);
        if (enemy.burnTimer > 0) {
          enemy.burnTimer -= dt;
          enemy.hp -= enemy.burnDamage * dt;
        }
        return enemy.hp <= 0 ? null : enemy;
      }
      // Freeze
      if (enemy.freezeTimer > 0) {
        enemy.freezeTimer = Math.max(0, enemy.freezeTimer - dt);
        return enemy;
      }
      // Brûlure
      if (enemy.burnTimer > 0) {
        enemy.burnTimer -= dt;
        enemy.hp -= enemy.burnDamage * dt;
        if (enemy.hp <= 0) return null;
      }

      switch (enemy.behavior) {
        case 'chase':
          enemy = chasePlayer(enemy, player, dt);
          break;
        case 'shoot':
          enemy = shooterAI(enemy, player, dt, newEnemyProjs);
          break;
        case 'healer': {
          const result = healerAI(enemy, player, s.enemies, dt); // lit l'état original (pas de mutation)
          enemy = result.enemy;
          healEvents = healEvents.concat(result.healEvents);
          break;
        }
        case 'summon': {
          const result = summonerAI(enemy, player, dt);
          enemy = result.enemy;
          newSummons = newSummons.concat(result.summons);
          break;
        }
        case 'boss_spiral':
        case 'boss_void':
          enemy = bossAI_void(enemy, player, dt, newEnemyProjs);
          break;
        case 'boss_cinder':
          enemy = bossAI_cinder(enemy, player, dt, newEnemyProjs);
          break;
        case 'boss_mirror':
          enemy = bossAI_mirror(enemy, player, dt, newEnemyProjs);
          break;
        case 'boss_pulse':
          enemy = bossAI_pulse(enemy, player, dt, newEnemyProjs);
          break;
        case 'boss_rift':
          enemy = bossAI_rift(enemy, player, dt, newEnemyProjs);
          break;
        default:
          enemy = chasePlayer(enemy, player, dt);
      }

      return enemy;
    })
    .filter(Boolean);

  // ── Appliquer les soins du Guérisseur (sans mutation des objets originaux) ──
  for (const { id, amount } of healEvents) {
    const idx = newEnemies.findIndex(e => e && e.id === id);
    if (idx >= 0) {
      newEnemies[idx] = {
        ...newEnemies[idx],
        hp: Math.min(newEnemies[idx].hp + amount, newEnemies[idx].maxHp),
      };
    }
  }

  // ── Invocations du Summoner ──────────────────────────────────────────────────
  for (const summon of newSummons) newEnemies.push(summon);

  // ── Pass 2 : Collisions joueur (boucle séparée pour éviter les mutations de s) ──
  const thornsCount = s.activeUpgrades.filter(u => u.id === 'thorns').length;
  for (let i = 0; i < newEnemies.length; i++) {
    const enemy = newEnemies[i];
    if (!enemy || !s.alive) continue;

    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (s.invincibleTimer <= 0 && !s.player.shieldActive) {
      if (dist < PLAYER_RADIUS + enemy.radius) {
        s = damagePlayer(s, enemy.damage, true);
        if (thornsCount > 0) {
          newEnemies[i] = { ...enemy, hp: enemy.hp - thornsCount * 2 };
        }
        // Une seule collision par frame (invincibilité empêche les suivantes)
      }
    } else if (s.player.shieldActive) {
      if (dist < PLAYER_RADIUS + enemy.radius) {
        s = { ...s, player: { ...s.player, shieldActive: false } };
      }
    }
  }

  return {
    ...s,
    enemies: newEnemies.filter(e => e && e.hp > 0),
    enemyProjectiles: newEnemyProjs,
    particles: newParticles,
  };
}

function chasePlayer(enemy, player, dt) {
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const spd = enemy.speed * SPEED_SCALE * dt;
  return {
    ...enemy,
    x: enemy.x + (dx / dist) * spd,
    y: enemy.y + (dy / dist) * spd,
  };
}

function shooterAI(enemy, player, dt, projs) {
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  let nx = enemy.x;
  let ny = enemy.y;
  if (dist < SHOOTER_DESIRED_DIST - 20) {
    // Fuir
    nx -= (dx / dist) * enemy.speed * SPEED_SCALE * dt;
    ny -= (dy / dist) * enemy.speed * SPEED_SCALE * dt;
  } else if (dist > SHOOTER_DESIRED_DIST + 20) {
    // Approcher lentement
    nx += (dx / dist) * enemy.speed * SPEED_SCALE * dt * 0.5;
    ny += (dy / dist) * enemy.speed * SPEED_SCALE * dt * 0.5;
  }
  const shootTimer = (enemy.shootTimer || 0) + dt;
  const info = ENEMY_INFO.shooter;
  if (shootTimer >= (info.projectileCooldown || 2.5)) {
    projs.push(fireShooterProjectile({ ...enemy, x: nx, y: ny }, player.x, player.y));
    return { ...enemy, x: nx, y: ny, shootTimer: 0 };
  }
  return { ...enemy, x: nx, y: ny, shootTimer };
}

// healerAI retourne { enemy, healEvents } pour éviter les mutations directes
function healerAI(enemy, player, allEnemies, dt) {
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  let nx = enemy.x - (dx / dist) * enemy.speed * SPEED_SCALE * dt * 0.8;
  let ny = enemy.y - (dy / dist) * enemy.speed * SPEED_SCALE * dt * 0.8;
  nx = Math.max(20, Math.min(ARENA_WIDTH  - 20, nx));
  ny = Math.max(20, Math.min(ARENA_HEIGHT - 20, ny));

  const healTimer = (enemy.healTimer || 0) + dt;
  if (healTimer >= ENEMY_INFO.healer.healInterval) {
    const healEvents = [];
    for (const other of allEnemies) {
      if (!other || other.id === enemy.id) continue;
      const odx = other.x - nx;
      const ody = other.y - ny;
      if (Math.sqrt(odx * odx + ody * ody) < ENEMY_INFO.healer.healRadius) {
        healEvents.push({ id: other.id, amount: ENEMY_INFO.healer.healRate });
      }
    }
    return { enemy: { ...enemy, x: nx, y: ny, healTimer: 0 }, healEvents };
  }
  return { enemy: { ...enemy, x: nx, y: ny, healTimer }, healEvents: [] };
}

function summonerAI(enemy, player, dt) {
  const e = chasePlayer(enemy, player, dt);
  const summonTimer = (e.summonTimer || 0) + dt;
  const info = ENEMY_INFO.summoner;
  const summons = [];
  if (summonTimer >= info.summonInterval) {
    for (let i = 0; i < info.summonCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 30 + Math.random() * 20;
      const scaling = { hpMult: 1, damageMult: 1, speedMult: 1 };
      const summon = spawnEnemy(ENEMY_TYPES.CHASER, scaling);
      if (summon) {
        summon.x = e.x + Math.cos(angle) * r;
        summon.y = e.y + Math.sin(angle) * r;
        summons.push(summon);
      }
    }
    return { enemy: { ...e, summonTimer: 0 }, summons };
  }
  return { enemy: { ...e, summonTimer }, summons };
}

// ─── Comportements boss uniques ───────────────────────────────────────────────

// Boss L'Écho — spirale de 6 projectiles à angle progressif
function bossAI_void(enemy, player, dt, projs) {
  const e = chasePlayer(enemy, player, dt);
  const patternTimer = (e.patternTimer || 0) + dt;
  const patternPhase = e.patternPhase || 0;
  if (patternTimer >= 2) {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + patternPhase;
      projs.push({
        id: makeId(), x: e.x, y: e.y,
        vx: Math.cos(angle) * 3, vy: Math.sin(angle) * 3,
        damage: e.damage * 0.5, radius: 7, color: '#BB44FF',
        owner: 'enemy', enemyId: e.id, lifeMs: 2500,
      });
    }
    return { ...e, patternTimer: 0, patternPhase: patternPhase + Math.PI / 3 };
  }
  return { ...e, patternTimer };
}

// Boss Veilleur de Cendre — traînée de projectiles de feu (proj statiques courts)
function bossAI_cinder(enemy, player, dt, projs) {
  const e = chasePlayer(enemy, player, dt);
  const trailTimer = (e.trailTimer || 0) + dt;
  if (trailTimer >= 0.35) {
    projs.push({
      id: makeId(), x: e.x, y: e.y,
      vx: 0, vy: 0,
      damage: e.damage * 0.4, radius: 14, color: '#FF6600',
      owner: 'enemy', enemyId: e.id, lifeMs: 1800,
    });
    return { ...e, trailTimer: 0 };
  }
  return { ...e, trailTimer };
}

// Boss La Mère-Écho — tirs ciblés rapides toutes les 1.5s
function bossAI_mirror(enemy, player, dt, projs) {
  const e = chasePlayer(enemy, player, dt);
  const patternTimer = (e.patternTimer || 0) + dt;
  if (patternTimer >= 1.5) {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    // 3 projectiles en léger éventail
    for (let spread = -1; spread <= 1; spread++) {
      const angle = Math.atan2(dy, dx) + spread * 0.2;
      projs.push({
        id: makeId(), x: e.x, y: e.y,
        vx: Math.cos(angle) * 5, vy: Math.sin(angle) * 5,
        damage: e.damage * 0.6, radius: 7, color: '#AAFFFF',
        owner: 'enemy', enemyId: e.id, lifeMs: 2000,
      });
    }
    return { ...e, patternTimer: 0 };
  }
  return { ...e, patternTimer };
}

// Boss Tonnerre Incarné — onde de choc 12 projectiles toutes les 3s
function bossAI_pulse(enemy, player, dt, projs) {
  const e = chasePlayer(enemy, player, dt);
  const patternTimer = (e.patternTimer || 0) + dt;
  if (patternTimer >= 3) {
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      projs.push({
        id: makeId(), x: e.x, y: e.y,
        vx: Math.cos(angle) * 4, vy: Math.sin(angle) * 4,
        damage: e.damage * 0.6, radius: 8, color: '#FFFF44',
        owner: 'enemy', enemyId: e.id, lifeMs: 2000,
      });
    }
    return { ...e, patternTimer: 0 };
  }
  return { ...e, patternTimer };
}

// Boss Le Dévoreur — rafale de 16 projectiles + téléportation vers le joueur
function bossAI_rift(enemy, player, dt, projs) {
  const e = chasePlayer(enemy, player, dt);
  const patternTimer = (e.patternTimer || 0) + dt;
  if (patternTimer >= 4) {
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      projs.push({
        id: makeId(), x: e.x, y: e.y,
        vx: Math.cos(angle) * 5, vy: Math.sin(angle) * 5,
        damage: e.damage * 0.8, radius: 9, color: '#FF0066',
        owner: 'enemy', enemyId: e.id, lifeMs: 2000,
      });
    }
    // Téléportation à proximité du joueur
    const teleX = Math.max(40, Math.min(ARENA_WIDTH  - 40, player.x + (Math.random() - 0.5) * 120));
    const teleY = Math.max(40, Math.min(ARENA_HEIGHT - 40, player.y + (Math.random() - 0.5) * 120));
    return { ...e, x: teleX, y: teleY, patternTimer: 0 };
  }
  return { ...e, patternTimer };
}

// ─── Projectiles joueur ───────────────────────────────────────────────────────

function updatePlayerProjectiles(s, dt) {
  let newEnemies = [...s.enemies];
  let newParticles = [...s.particles];
  let newXpOrbs = [...s.xpOrbs];
  let kills = 0;
  let healFromKills = 0;

  const projs = s.playerProjectiles
    .map(p => {
      let proj = { ...p, lifeMs: p.lifeMs - dt * 1000 };
      if (proj.lifeMs <= 0) return null;

      // Déplacement
      proj.x += proj.vx * SPEED_SCALE * dt;
      proj.y += proj.vy * SPEED_SCALE * dt;

      // Sortie de l'arène
      if (proj.x < 0 || proj.x > ARENA_WIDTH || proj.y < 0 || proj.y > ARENA_HEIGHT) return null;

      // Collision ennemis (AoE vs cercle)
      if (proj.aoe) {
        newEnemies = newEnemies.map(e => {
          const dx = e.x - proj.x;
          const dy = e.y - proj.y;
          if (Math.sqrt(dx*dx + dy*dy) < proj.radius + e.radius) {
            return applyDamageToEnemy(e, proj.damage, s.activeUpgrades);
          }
          return e;
        });
        // AoE disparaît immédiatement après le flash
        return null;
      } else {
        // Projectile linéaire
        for (let i = 0; i < newEnemies.length; i++) {
          const e = newEnemies[i];
          if (!e) continue;
          if (proj.piercing && proj.piercedIds && proj.piercedIds.includes(e.id)) continue;
          const dx = e.x - proj.x;
          const dy = e.y - proj.y;
          if (Math.sqrt(dx*dx + dy*dy) < proj.radius + e.radius) {
            newEnemies[i] = applyDamageToEnemy(e, proj.damage, s.activeUpgrades);
            if (proj.piercing) {
              proj = { ...proj, piercedIds: [...proj.piercedIds, e.id] };
            } else {
              return null; // non-piercing s'arrête
            }
          }
        }
      }

      return proj;
    })
    .filter(Boolean);

  // Kill processing
  const deadEnemies = newEnemies.filter(e => e && e.hp <= 0);
  newEnemies = newEnemies.filter(e => e && e.hp > 0);
  let bossKills = 0;

  for (const dead of deadEnemies) {
    kills++;
    if (dead.isBoss) bossKills++;
    // XP orb
    newXpOrbs.push({
      id: makeId(),
      x: dead.x, y: dead.y,
      value: dead.xpValue || 5,
      radius: 8,
    });
    // Fragments (particules)
    for (let i = 0; i < 4; i++) {
      newParticles.push({
        id: makeId(),
        x: dead.x, y: dead.y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        color: dead.color || '#FF4444',
        radius: 3 + Math.random() * 2,
      });
    }
    // Explosif : dégâts de zone + anneau visuel
    if (dead.behavior === 'explosive' || ENEMY_INFO[dead.type]?.explodeOnDeath) {
      const explodeR = ENEMY_INFO[dead.type]?.explodeRadius || EXPLOSION_RADIUS;
      newEnemies = newEnemies.map(e => {
        const dx = e.x - dead.x;
        const dy = e.y - dead.y;
        if (Math.sqrt(dx*dx + dy*dy) < explodeR) {
          return { ...e, hp: e.hp - dead.maxHp * 0.3 };
        }
        return e;
      });
      // Dégâts joueur si proche
      const pdx = s.player.x - dead.x;
      const pdy = s.player.y - dead.y;
      if (Math.sqrt(pdx*pdx + pdy*pdy) < explodeR) {
        s = damagePlayer(s, dead.damage, false);
      }
      // Anneau d'explosion visuel
      newParticles.push({
        id: makeId(), x: dead.x, y: dead.y,
        type: 'ring', maxRadius: explodeR,
        life: 0.35, maxLife: 0.35, color: '#FF8800',
        vx: 0, vy: 0, radius: 0,
      });
    }
    // Fracture upgrade + anneau visuel
    if (hasUpgrade(s.activeUpgrades, 'fracture')) {
      const fracDmg = dead.maxHp * 0.3;
      newEnemies = newEnemies.map(e => {
        const dx = e.x - dead.x;
        const dy = e.y - dead.y;
        if (Math.sqrt(dx*dx + dy*dy) < FRACTURE_RADIUS) {
          return { ...e, hp: e.hp - fracDmg };
        }
        return e;
      });
      newParticles.push({
        id: makeId(), x: dead.x, y: dead.y,
        type: 'ring', maxRadius: FRACTURE_RADIUS,
        life: 0.4, maxLife: 0.4, color: '#FF4455',
        vx: 0, vy: 0, radius: 0,
      });
    }
    // Vol de vie
    const leechCount = s.activeUpgrades.filter(u => u.id === 'leech').length;
    healFromKills += leechCount;
    // Chain reaction
    if (hasUpgrade(s.activeUpgrades, 'chain_reaction')) {
      s.attackBoostMult = 1.5;
      s.attackBoostTimer = 0.5;
    }
    // Shockwave : stun ennemis proches + anneau visuel
    if (hasUpgrade(s.activeUpgrades, 'shockwave')) {
      newEnemies = newEnemies.map(e => {
        const dx = e.x - dead.x;
        const dy = e.y - dead.y;
        if (Math.sqrt(dx*dx + dy*dy) < SHOCKWAVE_RADIUS) {
          return { ...e, stunTimer: 1 };
        }
        return e;
      });
      newParticles.push({
        id: makeId(), x: dead.x, y: dead.y,
        type: 'ring', maxRadius: SHOCKWAVE_RADIUS,
        life: 0.5, maxLife: 0.5, color: '#FFFF44',
        vx: 0, vy: 0, radius: 0,
      });
    }
  }

  // Appliquer kills et heal
  if (kills > 0 || healFromKills > 0) {
    const newHp = Math.min(s.player.maxHp, s.player.hp + healFromKills);
    s.player = { ...s.player, hp: newHp };
    s.kills += kills;
    s.bossKills = (s.bossKills || 0) + bossKills;
    const newXp = s.xp + deadEnemies.reduce((acc, e) => acc + (e.xpValue || 5), 0);
    const xpNeeded = xpForLevel(s.level);
    if (newXp >= xpNeeded) {
      s.xp = newXp - xpNeeded;
      s.level += 1;
      s.pendingUpgrade = true;
    } else {
      s.xp = newXp;
    }
  }

  return {
    ...s,
    playerProjectiles: projs,
    enemies: newEnemies.filter(e => e && e.hp > 0),
    xpOrbs: newXpOrbs,
    particles: newParticles,
  };
}

// ─── Projectiles ennemis ──────────────────────────────────────────────────────

function updateEnemyProjectiles(s, dt) {
  let pendingDamage = null;

  const projs = s.enemyProjectiles
    .map(p => {
      const proj = { ...p, lifeMs: p.lifeMs - dt * 1000 };
      if (proj.lifeMs <= 0) return null;
      proj.x += proj.vx * SPEED_SCALE * dt;
      proj.y += proj.vy * SPEED_SCALE * dt;
      if (proj.x < 0 || proj.x > ARENA_WIDTH || proj.y < 0 || proj.y > ARENA_HEIGHT) return null;
      // Collision joueur (accumulate, apply once after map)
      if (pendingDamage === null) {
        const dx = s.player.x - proj.x;
        const dy = s.player.y - proj.y;
        if (Math.sqrt(dx*dx + dy*dy) < PLAYER_RADIUS + proj.radius) {
          pendingDamage = proj.damage;
          return null;
        }
      }
      return proj;
    })
    .filter(Boolean);

  if (pendingDamage !== null) {
    s = damagePlayer(s, pendingDamage, true);
  }

  return { ...s, enemyProjectiles: projs };
}

// ─── Collecte XP ─────────────────────────────────────────────────────────────

function collectXP(s, dt) {
  const pickupR = s.player.xpPickupRadius || 50;
  // Bonus aimant
  const magnetStacks = s.activeUpgrades.filter(u => u.id === 'magnet').length;
  const effectiveR = pickupR * (1 + magnetStacks * 0.5);
  const attractR   = effectiveR * XP_ATTRACT_RADIUS_MULT;

  let xpGained = 0;
  const remaining = s.xpOrbs
    .map(orb => {
      const dx = s.player.x - orb.x;
      const dy = s.player.y - orb.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < effectiveR) {
        xpGained += orb.value;
        return null; // collecté
      }

      // Attraction progressive vers le joueur
      if (dist < attractR && dist > 0) {
        const pull = (1 - dist / attractR) * XP_ATTRACT_SPEED * dt;
        return { ...orb, x: orb.x + (dx / dist) * pull, y: orb.y + (dy / dist) * pull };
      }

      return orb;
    })
    .filter(Boolean);

  if (xpGained === 0) return { ...s, xpOrbs: remaining };

  const newXp = s.xp + xpGained;
  const xpNeeded = xpForLevel(s.level);
  if (newXp >= xpNeeded) {
    return {
      ...s,
      xpOrbs: remaining,
      xp: newXp - xpNeeded,
      level: s.level + 1,
      pendingUpgrade: true,
    };
  }
  return { ...s, xpOrbs: remaining, xp: newXp };
}

// ─── Dégâts ───────────────────────────────────────────────────────────────────

function damagePlayer(s, rawDamage, setInvincible) {
  if (!s.alive) return s;
  if (s.invincibleTimer > 0) return s;
  if (s.player.shieldActive) {
    return { ...s, player: { ...s.player, shieldActive: false } };
  }

  // Calcul dégâts
  let dmg = Math.max(1, rawDamage - s.player.defense);

  // Résistance : -35% si HP > 50%
  if (hasUpgrade(s.activeUpgrades, 'resistance')) {
    if (s.player.hp / s.player.maxHp > 0.5) dmg = Math.round(dmg * 0.65);
  }
  // Fardeau (malédiction)
  const fardeau = s.activeUpgrades.filter(u => u.id === 'fardeau').length;
  if (fardeau > 0) dmg += fardeau * 2;

  const newHp = s.player.hp - dmg;

  if (newHp <= 0) {
    // Second Souffle
    if (!s.player.secondWindUsed && hasUpgrade(s.activeUpgrades, 'second_wind')) {
      return {
        ...s,
        player: { ...s.player, hp: 1, secondWindUsed: true, invincibleTimer: 2 },
        invincibleTimer: 2,
      };
    }
    return { ...s, player: { ...s.player, hp: 0 }, alive: false };
  }

  return {
    ...s,
    player: { ...s.player, hp: newHp, invincibleTimer: setInvincible ? INVINCIBLE_DURATION : 0 },
    invincibleTimer: setInvincible ? INVINCIBLE_DURATION : 0,
  };
}

function applyDamageToEnemy(enemy, damage, upgrades) {
  // Tranchant (perce défense)
  const tranchant = upgrades.filter(u => u.id === 'tranchant').length;
  let dmg = damage + tranchant * 2;
  // Ignition (brûlure)
  const ignition = upgrades.filter(u => u.id === 'ignition').length;
  let newEnemy = { ...enemy, hp: enemy.hp - dmg };
  if (ignition > 0) {
    newEnemy.burnDamage = ignition * 3;
    newEnemy.burnTimer  = 2;
  }
  // Gelbomb (gel)
  if (hasUpgrade(upgrades, 'gelbomb')) {
    newEnemy.freezeTimer = 0.5;
  }
  return newEnemy;
}

// ─── XP par niveau ────────────────────────────────────────────────────────────
export function xpForLevel(level) {
  return Math.round(XP_PER_LEVEL_BASE * Math.pow(XP_LEVEL_SCALING, level - 1));
}
