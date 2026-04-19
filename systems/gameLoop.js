import { ENEMY_INFO, CLASS_INFO, ARENA_WIDTH, ARENA_HEIGHT,
         PLAYER_RADIUS, BASE_ENEMY_RADIUS, XP_PER_LEVEL_BASE, XP_LEVEL_SCALING,
         ENEMY_TYPES, SPEED_SCALE, SHOOTER_DESIRED_DIST, EXPLOSION_RADIUS,
         FRACTURE_RADIUS, SHOCKWAVE_RADIUS, XP_ATTRACT_RADIUS_MULT,
         XP_ATTRACT_SPEED, INVINCIBLE_DURATION, RUN_MUTATIONS } from '../constants';
// Utility: get mutation effect by id from activeMutations
function getMutationEffect(activeMutations, type) {
  if (!activeMutations) return undefined;
  return activeMutations.find(m => m.effect.type === type)?.effect;
}

import { getActiveWaveConfig, getEnemyScaling, getBossAtTime } from './waveSystem';
import { getAttackFn, getAttackCooldown, fireShooterProjectile } from './attackSystem';
import { hasUpgrade } from './upgradeSystem';
import { makeId } from '../utils/makeId';

// Boss L'Architecte — crée des murs d'énergie et invoque des Spectres Zigzag
function bossAI_architect(enemy, player, dt, projs, particles, s) {
  // Se déplace lentement vers le centre de l'arène
  const centerX = ARENA_WIDTH / 2;
  const centerY = ARENA_HEIGHT / 2;
  const dx = centerX - enemy.x;
  const dy = centerY - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const spd = enemy.speed * SPEED_SCALE * dt * 0.7; // encore plus lent
  const nx = enemy.x + (dx / dist) * spd;
  const ny = enemy.y + (dy / dist) * spd;

  // Timers patterns
  let patternTimer = (enemy.patternTimer || 0) + dt;
  let wallList = enemy.wallList || [];
  let summonTimer = (enemy.summonTimer || 0) + dt;
  let phase = enemy.patternPhase || 0;

  // Toutes les 4s : crée un mur d'énergie
  if (patternTimer >= 4) {
    patternTimer = 0;
    phase++;
    // Direction aléatoire
    const angle = Math.random() * Math.PI * 2;
    wallList = wallList.concat({
      id: makeId(),
      x: nx,
      y: ny,
      angle,
      life: 2.2, // durée d'affichage
      maxLife: 2.2,
      length: 900, // traverse toute l'arène
      color: '#66CCFF',
    });
    // Ajoute une particule visuelle pour le mur
    particles.push({
      id: makeId(),
      x: nx,
      y: ny,
      type: 'energy_wall',
      angle,
      life: 2.2,
      maxLife: 2.2,
      color: '#66CCFF',
      length: 900,
    });
  }

  // Met à jour la vie des murs
  wallList = wallList.filter(w => w.life > 0).map(w => ({ ...w, life: w.life - dt }));

  // Collision mur-joueur
  for (const wall of wallList) {
    // Calcul distance point-segment (mur infini)
    const px = player.x - wall.x;
    const py = player.y - wall.y;
    const d = Math.abs(Math.sin(wall.angle) * px - Math.cos(wall.angle) * py);
    if (d < PLAYER_RADIUS + 10 && wall.life > 0) {
      // Dégâts si collision
      const wallDamage = (ENEMY_INFO[enemy.type]?.baseDamage || 20) * 0.7;
      s = damagePlayer(s, wallDamage, true);
    }
  }

  // Toutes les 6s : invoque 2 Spectres Zigzag
  if (summonTimer >= 6) {
    summonTimer = 0;
    for (let i = 0; i < 2; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 80 + Math.random() * 60;
      const scaling = getEnemyScaling(s.elapsedTime);
      const spectre = spawnEnemy(ENEMY_TYPES.SPECTRE_ZIGZAG, scaling);
      if (spectre) {
        spectre.x = nx + Math.cos(angle) * r;
        spectre.y = ny + Math.sin(angle) * r;
        s.enemies.push(spectre);
      }
    }
  }

  // Sélectionne un défi hebdomadaire aléatoire (peut être remplacé par une logique serveur/date)
  let weeklyEvent = null;
  try {
    const events = require('../constants').WEEKLY_EVENTS;
    if (events && events.length > 0) {
      // Pour la démo, sélectionne aléatoirement (remplacer par une logique basée sur la date pour la prod)
      weeklyEvent = events[Math.floor(Math.random() * events.length)];
    }
  } catch (e) {}

  return {
    ...enemy,
    x: nx,
    y: ny,
    patternTimer,
    wallList,
    summonTimer,
    patternPhase: phase,
  };
}

// ─── IA Ennemis ───────────────────────────────────────────────────────────────

function updateEnemies(s, dt) {
  const player = s.player;
  let newEnemyProjs = [...s.enemyProjectiles];
  let newParticles  = [...s.particles];
  let newSummons    = [];
  let healEvents    = []; // { id, amount } — appliqués après le map pour éviter les mutations

  // Applique le multiplicateur de vitesse ennemie (weeklyEvent, reliques, mutations)
  let enemySpeedMult = 1;
  if (s._enemySpeedMult) enemySpeedMult *= s._enemySpeedMult;
  // Ajoute ici d’autres sources si besoin (reliques, mutations)

  // (debug log supprimé)

  // ── Pass 1 : IA + status effects ────────────────────────────────────────────

  let newEnemies = s.enemies
    .filter(Boolean)
    .map(e => {
      let enemy = { ...e };

      // Flash de hit (overlay blanc bref)
      if (enemy.hitFlashTimer > 0) {
        enemy.hitFlashTimer = Math.max(0, enemy.hitFlashTimer - dt);
      }
      // ── Status effects ticks ─────────────────────────────────────────────
      if (enemy.burnTimer > 0) {
        enemy.hp -= (enemy.burnDamage || 0) * dt;
        enemy.burnTimer = Math.max(0, enemy.burnTimer - dt);
        if (enemy.burnTimer <= 0) enemy.burnDamage = 0;
      }
      if (enemy.poisonTimer > 0) {
        enemy.hp -= (enemy.poisonDamage || 0) * dt;
        enemy.poisonTimer = Math.max(0, enemy.poisonTimer - dt);
        if (enemy.poisonTimer <= 0) enemy.poisonDamage = 0;
      }
      if (enemy.freezeTimer > 0) {
        enemy.freezeTimer = Math.max(0, enemy.freezeTimer - dt);
      }
      if (enemy.slowTimer > 0) {
        enemy.slowTimer = Math.max(0, enemy.slowTimer - dt);
        if (enemy.slowTimer <= 0) enemy.slowAmount = 0;
      }
      if (enemy.stunTimer > 0) {
        enemy.stunTimer = Math.max(0, enemy.stunTimer - dt);
        return enemy; // stunned — skip movement AI
      }

      let effectiveDt = enemy.freezeTimer > 0 ? dt * 0.1
            : enemy.slowAmount > 0   ? dt * (1 - (enemy.slowAmount || 0))
            : dt;
      // Applique le multiplicateur de vitesse ennemie
      effectiveDt *= enemySpeedMult;

      // Applique le multiplicateur de taille de boss si défini
      if (enemy.behavior && enemy.behavior.startsWith('boss') && s._bossSizeMult) {
        enemy.radius = Math.round((enemy.radius || ENEMY_INFO[enemy.type]?.radius || 24) * s._bossSizeMult);
      }
      switch (enemy.behavior) {
        case 'zigzag':
          enemy = zigzagAI(enemy, player, effectiveDt);
          break;
        case 'chase':
          enemy = chasePlayer(enemy, player, effectiveDt);
          break;
        case 'shooter':
          enemy = shooterAI(enemy, player, effectiveDt, newEnemyProjs);
          break;
        case 'healer': {
          const hRes = healerAI(enemy, player, newEnemies, effectiveDt);
          enemy = hRes.enemy;
          for (const heal of hRes.healEvents) {
            const idx = newEnemies.findIndex(e => e && e.id === heal.id);
            if (idx >= 0) {
              newEnemies[idx] = {
                ...newEnemies[idx],
                hp: Math.min(newEnemies[idx].maxHp, newEnemies[idx].hp + heal.amount),
              };
            }
          }
          break;
        }
        case 'tracker':
          enemy = trackerAI(enemy, player, effectiveDt);
          break;
        case 'boss_spiral':
          enemy = bossAI_void(enemy, player, effectiveDt, newEnemyProjs);
          break;
        case 'boss_cinder':
          enemy = bossAI_cinder(enemy, player, effectiveDt, newEnemyProjs);
          break;
        case 'boss_mirror':
          enemy = bossAI_mirror(enemy, player, effectiveDt, newEnemyProjs);
          break;
        case 'boss_pulse':
          enemy = bossAI_pulse(enemy, player, effectiveDt, newEnemyProjs);
          break;
        case 'boss_rift':
          enemy = bossAI_rift(enemy, player, effectiveDt, newEnemyProjs);
          break;
        case 'boss_prophet':
          enemy = bossAI_prophet(enemy, player, effectiveDt, newEnemyProjs, newParticles);
          break;
        case 'boss_architect':
          enemy = bossAI_architect(enemy, player, effectiveDt, newEnemyProjs, newParticles, s);
          break;
        case 'boss_amalgam':
          enemy = bossAI_amalgam(enemy, player, effectiveDt, newEnemyProjs);
          break;
        case 'summon': {
          const res = summonerAI(enemy, player, effectiveDt, s.elapsedTime);
          enemy = res.enemy;
          if (res.summons && res.summons.length > 0) {
            newSummons.push(...res.summons);
          }
          break;
        }
        default:
          enemy = chasePlayer(enemy, player, effectiveDt);
      }
      // Collision joueur-ennemi (dégâts)
      const info = ENEMY_INFO[enemy.type];
      if (info && info.baseDamage && enemy.hp > 0 && player.invincibleTimer <= 0) {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < (PLAYER_RADIUS + (enemy.radius || info.radius || 12))) {
          s = damagePlayer(s, info.baseDamage, true);
          // Vampire : se soigne en touchant le joueur
          if (info.lifeStealOnHit) {
            enemy = { ...enemy, hp: Math.min(enemy.maxHp, enemy.hp + info.lifeStealOnHit) };
          }
        }
      }
      return enemy;
    })

    .filter(Boolean);

  // Ajouter les invocations à la liste des ennemis
  if (newSummons.length > 0) {
    newEnemies = newEnemies.concat(newSummons);
  }

  // Appliquer les nouveaux projectiles, particules, etc.
  return { ...s, enemies: newEnemies, enemyProjectiles: newEnemyProjs, particles: newParticles };
}


// ─── Génération des obstacles ─────────────────────────────────────────────────

function generateObstacles() {
  const obstacles = [];
  const WALL_MARGIN  = 120;   // distance minimale du bord de la map
  const SPAWN_CLEAR  = 240;   // zone libre autour du spawn central
  const MIN_SPACING  = 130;   // distance minimale entre obstacles
  const MAX_OBS      = 7;
  const cx = ARENA_WIDTH  / 2;
  const cy = ARENA_HEIGHT / 2;

  // Grille 4×4 pour distribuer les obstacles uniformément
  const COLS = 4, ROWS = 4;
  const usableW = ARENA_WIDTH  - WALL_MARGIN * 2;
  const usableH = ARENA_HEIGHT - WALL_MARGIN * 2;
  const cellW = usableW / COLS;
  const cellH = usableH / ROWS;

  for (let row = 0; row < ROWS && obstacles.length < MAX_OBS; row++) {
    for (let col = 0; col < COLS && obstacles.length < MAX_OBS; col++) {
      if (Math.random() > 0.5) continue; // ~50% de chance par cellule

      // Position aléatoire dans la cellule
      const x = WALL_MARGIN + cellW * col + cellW * (0.25 + Math.random() * 0.5);
      const y = WALL_MARGIN + cellH * row + cellH * (0.25 + Math.random() * 0.5);

      // Zone libre autour du spawn
      const distCenter = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (distCenter < SPAWN_CLEAR) continue;

      // Pas trop proche d'un autre obstacle
      const tooClose = obstacles.some(o =>
        Math.sqrt((x - o.x) ** 2 + (y - o.y) ** 2) < MIN_SPACING
      );
      if (tooClose) continue;

      const isHazard = Math.random() < 0.2; // 20% de lave
      const radius   = 38 + Math.floor(Math.random() * 28); // 38–65

      obstacles.push({
        id:          `obs_${obstacles.length}`,
        type:        'circle',
        x, y, radius,
        isHazard,
        color:       isHazard ? '#CC4400' : '#334455',
        contactDps:  isHazard ? 10 : 0, // dégâts/s si lave
      });
    }
  }
  return obstacles;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createInitialState(shape, startingStats, permanentUpgrades = []) {
  // Sélectionne 2 mutations aléatoires pour la run
  const { RUN_MUTATIONS } = require('../constants');
  function pickMutations(n) {
    const arr = [...RUN_MUTATIONS];
    const res = [];
    for (let i = 0; i < n && arr.length > 0; i++) {
      const idx = Math.floor(Math.random() * arr.length);
      res.push(arr.splice(idx, 1)[0]);
    }
    return res;
  }
  const activeMutations = pickMutations(2);

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
    turrets:    [], // tourelles actives (Ingénieur)
    obstacles:  generateObstacles(),
    // Timers
    attackTimer:     0,         // temps avant la prochaine attaque
    ambushTimer:     0,         // timer pour l'embuscade de l'Ombre
    ambushReady:     true,
    regenAccum:      0,         // accumulation de regen
    shieldCooldown:  0,         // timer du bouclier périodique
    turretPlaceTimer: 0,        // timer pour la pose de tourelle
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
    surgeCounter:     0,        // compteur pour Surtension (toutes les 5 attaques)
    // Mutations actives pour la run
    activeMutations,
    // Événements aléatoires
    eventTimer:       0,        // temps écoulé depuis le dernier événement
    eventState:       null,     // événement actif (objet ou null)
    // Reliques actives (objets collectés pendant la run)
    activeRelics: [],
    // Défi hebdomadaire actif
    weeklyEvent,
    // Upgrades permanentes actives pour cette run
    permanentUpgrades,
  /**
   * Ajoute une relique à l'état de partie si non déjà possédée.
   * @param {object} state - état courant du jeu
   * @param {object} relic - objet relique (depuis constants.RELICS)
   * @returns {object} nouvel état avec la relique ajoutée
   */
  export function gainRelic(state, relic) {
    if (!relic || !relic.id) return state;
    if (state.activeRelics.some(r => r.id === relic.id)) return state; // déjà possédée
    return {
      ...state,
      activeRelics: [...state.activeRelics, relic],
    };
  }
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
      // --- Appliquer l'effet du défi hebdomadaire (weeklyEvent) ---
      const weekly = s.weeklyEvent;
      if (weekly && weekly.effect) {
        switch (weekly.effect.type) {
          case 'xp_mult':
            s._xpMult = (s._xpMult || 1) * weekly.effect.value;
            break;
          case 'enemy_speed':
            s._enemySpeedMult = (s._enemySpeedMult || 1) * weekly.effect.value;
            break;
          case 'no_heal':
            s._noHeal = true;
            break;
          case 'boss_size_mult':
            s._bossSizeMult = (s._bossSizeMult || 1) * weekly.effect.value;
            break;
          // Ajoute d'autres effets ici si besoin
          default:
            break;
        }
      }
    // --- Appliquer les effets des reliques actives ---
    if (s.activeRelics && s.activeRelics.length > 0) {
      for (const relic of s.activeRelics) {
        if (!relic.effect) continue;
        switch (relic.effect.type) {
          case 'attack_mult':
            s.player.attack = Math.round((s.player.attack || 1) * relic.effect.value);
            break;
          case 'xp_mult':
            s._xpMult = (s._xpMult || 1) * relic.effect.value;
            break;
          case 'regen':
            s.player.regen = (s.player.regen || 0) + relic.effect.value;
            break;
          case 'one_time_shield':
            if (!s.player._relicShieldUsed && s.player.hp <= 0) {
              s.player.hp = 1;
              s.player._relicShieldUsed = true;
            }
            break;
          // Ajoute d'autres effets de reliques ici...
          default:
            break;
        }
      }
    }
  if (!state || !state.player) return state;
  if (!state.alive || state.paused || state.pendingUpgrade) return state;

  // Clone shallow pour éviter les mutations directes sur la ref React
  let s = { ...state };
  const mutations = s.activeMutations || [];

  // --- Apply player stat mutations ---
  // Fragile: max HP -50%
  const fragile = getMutationEffect(mutations, 'player_hp_mult');
  if (fragile) {
    s.player.maxHp = Math.round((s.player.maxHp || 1) * fragile.value);
    if (s.player.hp > s.player.maxHp) s.player.hp = s.player.maxHp;
  }
  // Regen: +X HP/s
  const regen = getMutationEffect(mutations, 'player_regen');
  if (regen) {
    s.player.regen = (s.player.regen || 0) + regen.value;
  }
  // Curse: -X HP every interval
  const curse = getMutationEffect(mutations, 'player_dot');
  if (curse) {
    s._mutationDotTimer = (s._mutationDotTimer || 0) + dt;
    if (s._mutationDotTimer >= curse.interval) {
      s._mutationDotTimer = 0;
      s = damagePlayer(s, curse.value, false);
      if (!s.alive) return s;
    }
  }

  // --- Apply vision mutation (blindness) ---
  // (Handled in renderer/UI, but can be passed via s for ArenaRenderer)
  const vision = getMutationEffect(mutations, 'vision_radius');
  if (vision) {
    s.visionRadius = vision.value;
  }

  // --- XP rain mutation ---
  const xpRain = getMutationEffect(mutations, 'xp_rain');
  if (xpRain) {
    s._xpRainTimer = (s._xpRainTimer || 0) + dt;
    if (s._xpRainTimer >= xpRain.interval) {
      s._xpRainTimer = 0;
      for (let i = 0; i < xpRain.amount; i++) {
        s.xpOrbs.push({
          id: makeId(),
          x: Math.random() * ARENA_WIDTH,
          y: Math.random() * ARENA_HEIGHT,
          value: 3,
          radius: 8,
        });
      }
    }
  }

  // ── Événements aléatoires ─────────────────────────────────────────────
  s.eventTimer = (s.eventTimer || 0) + dt;
  if (!s.eventState && s.eventTimer >= 30) {
    // Déclenche un événement aléatoire
    const events = (typeof window !== 'undefined' && window.RANDOM_EVENTS) ? window.RANDOM_EVENTS : require('../constants').RANDOM_EVENTS;
    const event = events[Math.floor(Math.random() * events.length)];
    s.eventState = { ...event, startTime: s.elapsedTime };
    s.eventTimer = 0;
    // Feedback visuel : flash central et particules
    s.particles.push({
      id: makeId(),
      x: ARENA_WIDTH / 2,
      y: ARENA_HEIGHT / 2,
      type: 'event_flash',
      color: '#FFD700',
      life: 1.2,
      maxLife: 1.2,
      radius: 0,
      maxRadius: 400,
    });
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      s.particles.push({
        id: makeId(),
        x: ARENA_WIDTH / 2,
        y: ARENA_HEIGHT / 2,
        vx: Math.cos(angle) * (2 + Math.random() * 2),
        vy: Math.sin(angle) * (2 + Math.random() * 2),
        color: '#FFD700',
        life: 0.7 + Math.random() * 0.3,
        maxLife: 1.0,
        radius: 6 + Math.random() * 4,
      });
    }
  }
  // Réinitialise l'événement après 10s (ou selon type)
  if (s.eventState && s.elapsedTime - s.eventState.startTime > 10) {
    s.eventState = null;
  }

    // ── Ingénieur : gestion des tourelles ───────────────────────────────
    if (s.player.shape === 'engineer') {
      const info = CLASS_INFO.engineer;
      s.turretPlaceTimer = (s.turretPlaceTimer || 0) + dt;
      // Pose une tourelle si timer OK et pas trop de tourelles
      if (s.turretPlaceTimer >= info.attackCooldown && (s.turrets?.length || 0) < info.turretCount) {
        s.turretPlaceTimer = 0;
        s.turrets = [
          ...(s.turrets || []),
          {
            id: makeId(),
            x: s.player.x,
            y: s.player.y,
            life: info.turretLifetime,
            cooldown: 0,
          },
        ];
      }
      // Met à jour les tourelles (durée de vie, tirs)
      s.turrets = (s.turrets || []).map(turret => {
        let t = { ...turret };
        t.life -= dt;
        t.cooldown = Math.max(0, (t.cooldown || 0) - dt);
        // Cherche une cible dans la portée
        const target = s.enemies.find(e => {
          const dx = e.x - t.x;
          const dy = e.y - t.y;
          return Math.sqrt(dx * dx + dy * dy) < info.turretRange;
        });
        if (target && t.cooldown <= 0) {
          // Tire un projectile
          const dx = target.x - t.x;
          const dy = target.y - t.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          s.playerProjectiles.push({
            id: makeId(),
            x: t.x,
            y: t.y,
            vx: (dx / dist) * 7,
            vy: (dy / dist) * 7,
            damage: info.turretAttack,
            radius: 7,
            color: '#7EC8E3',
            fromTurret: true,
          });
          t.cooldown = info.turretCooldown;
        }
        return t;
      }).filter(t => t.life > 0);
    }

  // Timers
  s.elapsedTime += dt;
  s.attackTimer = Math.max(0, s.attackTimer - dt);
  s.player.invincibleTimer = Math.max(0, (s.player.invincibleTimer || 0) - dt);
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
  let totalRegen = s.player.regen || 0;
  // Bloque toute régénération si no_heal actif
  if (!s._noHeal) {
    // Détermination : double regen sous 25% PV
    if (totalRegen > 0 && hasUpgrade(s.activeUpgrades, 'determination')) {
      if (s.player.hp / s.player.maxHp < 0.25) totalRegen *= 2;
    }
    if (totalRegen > 0) {
      s.regenAccum += totalRegen * dt;
      if (s.regenAccum >= 1) {
        const healAmt = Math.floor(s.regenAccum);
        s.regenAccum -= healAmt;
        s.player = { ...s.player, hp: Math.min(s.player.hp + healAmt, s.player.maxHp) };
      }
    }
  }

  // Paladin : aura de soin passive
  if (s.player.shape === 'paladin' && !s._noHeal) {
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

  // Barrière Adaptative : bouclier temporaire après dégâts
  if (!s.adaptiveShieldCooldown) s.adaptiveShieldCooldown = 0;
  if (!s.adaptiveShieldTimer) s.adaptiveShieldTimer = 0;
  if (!s.player.adaptiveShield) s.player.adaptiveShield = 0;
  // Si le joueur a l'upgrade et n'a pas de bouclier actif
  if (hasUpgrade(s.activeUpgrades, 'barriere')) {
    // Si le joueur a perdu des PV ce frame (hors dégâts de corruption)
    if (s._lastHp !== undefined && s.player.hp < s._lastHp && s._lastHp - s.player.hp < 50) {
      if (s.adaptiveShieldCooldown <= 0) {
        const barriere = s.activeUpgrades.find(u => u.id === 'barriere');
        s.player = { ...s.player, adaptiveShield: barriere.effect.value || 10 };
        s.adaptiveShieldTimer = barriere.effect.duration || 3;
        s.adaptiveShieldCooldown = barriere.effect.cooldown || 20;
      }
    }
    // Timer du bouclier
    if (s.player.adaptiveShield > 0) {
      s.adaptiveShieldTimer -= dt;
      if (s.adaptiveShieldTimer <= 0) {
        s.player = { ...s.player, adaptiveShield: 0 };
      }
    }
    // Cooldown
    if (s.adaptiveShieldCooldown > 0) {
      s.adaptiveShieldCooldown -= dt;
    }
  }
  s._lastHp = s.player.hp;

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
    // Clamp dans l'arène (marge de sécurité pour éviter de sortir ou d'être bloqué)
    const margin = 4;
    nx2 = Math.max(PLAYER_RADIUS + margin, Math.min(ARENA_WIDTH  - PLAYER_RADIUS - margin, nx2));
    ny2 = Math.max(PLAYER_RADIUS + margin, Math.min(ARENA_HEIGHT - PLAYER_RADIUS - margin, ny2));
    // Collision obstacles (cercle simple)
    if (s.obstacles && s.obstacles.length > 0) {
      for (const obs of s.obstacles) {
        if (obs.type === 'circle') {
          const dx = nx2 - obs.x;
          const dy = ny2 - obs.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < PLAYER_RADIUS + obs.radius) {
            // Repousse le joueur à la surface de l'obstacle
            const angle = Math.atan2(dy, dx);
            nx2 = obs.x + Math.cos(angle) * (PLAYER_RADIUS + obs.radius + 0.1);
            ny2 = obs.y + Math.sin(angle) * (PLAYER_RADIUS + obs.radius + 0.1);
          }
        } else if (obs.type === 'rect') {
          // Rectangle axis-aligned
          const rx = obs.x, ry = obs.y, rw = obs.w, rh = obs.h;
          const px = Math.max(rx, Math.min(nx2, rx + rw));
          const py = Math.max(ry, Math.min(ny2, ry + rh));
          const dx = nx2 - px, dy = ny2 - py;
          if (dx*dx + dy*dy < PLAYER_RADIUS*PLAYER_RADIUS) {
            // Repousse le joueur hors du rectangle
            if (Math.abs(dx) > Math.abs(dy)) {
              nx2 = dx > 0 ? px + PLAYER_RADIUS + 0.1 : px - PLAYER_RADIUS - 0.1;
            } else {
              ny2 = dy > 0 ? py + PLAYER_RADIUS + 0.1 : py - PLAYER_RADIUS - 0.1;
            }
          }
        }
      }
    }
    s.player = { ...s.player, x: nx2, y: ny2 };
  }

  // ── Dégâts de contact des obstacles dangereux (lave) ────────────────────
  if (s.obstacles && s.player.invincibleTimer <= 0) {
    for (const obs of s.obstacles) {
      if (!obs.isHazard || !obs.contactDps) continue;
      const dx = s.player.x - obs.x;
      const dy = s.player.y - obs.y;
      if (Math.sqrt(dx * dx + dy * dy) < PLAYER_RADIUS + obs.radius) {
        const rawDmg = obs.contactDps * dt;
        const dmg = Math.max(0, rawDmg - s.player.defense * 0.05);
        const newHp = s.player.hp - dmg;
        if (newHp <= 0) {
          s = { ...s, player: { ...s.player, hp: 0 }, alive: false };
        } else {
          s = { ...s, player: { ...s.player, hp: newHp } };
        }
        break;
      }
    }
  }

  // ── Attaque automatique ───────────────────────────────────────────────────
  if (s.attackTimer <= 0 && s.enemies.length > 0) {
    const cd = getAttackCooldown(s.player.shape, s.activeUpgrades);
    s.attackTimer = cd;
    s.surgeCounter = (s.surgeCounter || 0) + 1;
    const isSurge = hasUpgrade(s.activeUpgrades, 'surge') && s.surgeCounter % 5 === 0;
    const attackFn = getAttackFn(s.player.shape);
    const baseAttack = Math.round(s.player.attack * s.attackBoostMult * (isSurge ? 2 : 1));
    const effPlayer = { ...s.player, attack: baseAttack };
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
  const prevLevel = s.level;
  const prevHp = s.player.hp;
  s = collectXP(s, dt);
  // Symbiose : soin à chaque orbe d'XP ramassé
  if (hasUpgrade(s.activeUpgrades, 'symbiose')) {
    const symbiose = s.activeUpgrades.find(u => u.id === 'symbiose');
    // Si le joueur a gagné de l'XP ce frame (orbes ramassés)
    if (s.player.hp < s.player.maxHp && s.xp > state.xp) {
      // Soigne 2 PV par orbe ramassé (approximation : 1 orbe = 1 gain d'XP)
      const heal = (s.xp - state.xp) * (symbiose.effect.value || 2);
      s.player = { ...s.player, hp: Math.min(s.player.hp + heal, s.player.maxHp) };
    }
  }
  // Effet visuel de level-up : halo expansif
  if (s.level > prevLevel) {
    s.particles.push({
      id: makeId(),
      x: s.player.x,
      y: s.player.y,
      type: 'ring',
      color: '#FFD700',
      life: 0.7,
      maxLife: 0.7,
      maxRadius: 120,
    });
  }
  // Prémonition : appliquer slow à tous les ennemis lors d'un level-up
  const hasPremonition = hasUpgrade(s.activeUpgrades, 'premonition')
    || (s.permanentUpgrades || []).includes('premonition');
  if (hasPremonition && s.level > prevLevel) {
    const premonition = s.activeUpgrades.find(u => u.id === 'premonition');
    const slowAmount = (premonition?.effect?.amount) ?? 0.5;
    const slowDuration = (premonition?.effect?.duration) ?? 2;
    s.enemies = s.enemies.map(e => ({
      ...e,
      slowTimer: Math.max(e.slowTimer || 0, slowDuration),
      slowAmount: slowAmount,
    }));
  }

  // ── Particules ────────────────────────────────────────────────────────────
  s.particles = s.particles
    .map(p => ({ ...p, x: p.x + p.vx * dt * SPEED_SCALE, y: p.y + p.vy * dt * SPEED_SCALE, life: p.life - dt }))
    .filter(p => p.life > 0);

  // ── Score : temps exponentiel + kills pondérés + niveaux + boss ─────────
  const timeMult = 1 + Math.floor(s.elapsedTime / 60) * 0.3; // +30% par minute
  s.score = Math.floor(s.elapsedTime * timeMult) * 12
           + s.kills * 8
           + (s.level - 1) * 80
           + (s.bossKills || 0) * 350;

  return s;
}

// ─── Spawn ────────────────────────────────────────────────────────────────────

function spawnEnemies(s, dt) {
  const waveConfig = getActiveWaveConfig(s.elapsedTime);
  const scaling = getEnemyScaling(s.elapsedTime, s.gameMode);
  const timers = { ...s.waveTimers };
  const newEnemies = [...s.enemies];

  for (const group of waveConfig.groups) {
    const key = group.type;
    if (timers[key] === undefined) timers[key] = 0;
    timers[key] -= dt;
    if (timers[key] <= 0) {
      timers[key] = group.spawnInterval;
      for (let i = 0; i < group.count; i++) {
        newEnemies.push(spawnEnemy(group.type, scaling, s.activeMutations));
      }
    }
  }

  // Boss
  const bossEntry = getBossAtTime(s.elapsedTime, s.spawnedBosses);
  const bossCount = getMutationEffect(s.activeMutations, 'boss_count')?.value || 1;
  if (bossEntry) {
    const newSpawned = new Set(s.spawnedBosses);
    newSpawned.add(bossEntry.atSec);
    for (let i = 0; i < bossCount; i++) {
      newEnemies.push(spawnEnemy(bossEntry.type, scaling, s.activeMutations));
    }
    return { ...s, enemies: newEnemies, waveTimers: timers, spawnedBosses: newSpawned };
  }

  return { ...s, enemies: newEnemies, waveTimers: timers };
}

function spawnEnemy(type, scaling, activeMutations = []) {
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

  let speedMult = scaling.speedMult;
  const fast = getMutationEffect(activeMutations, 'enemy_speed_mult');
  if (fast) speedMult *= fast.value;

  return {
    id:       makeId(),
    type,
    x, y,
    hp:       Math.round(info.baseHp    * scaling.hpMult),
    maxHp:    Math.round(info.baseHp    * scaling.hpMult),
    damage:   Math.round(info.baseDamage * scaling.damageMult),
    speed:    info.baseSpeed * speedMult,
    radius:   info.radius || BASE_ENEMY_RADIUS,
    color:    info.color,
    isBoss:   info.isBoss || false,
    xpValue:  info.xpValue,
    scoreValue: info.scoreValue,
    behavior: info.behavior,
    shootTimer: 0,
    summonTimer: 0,
    healTimer: 0,
    stunTimer: 0,
    freezeTimer: 0,
    burnDamage: 0,
    burnTimer: 0,
    name: info.name,
    patternTimer: 0,
    patternPhase: 0,
    isExplosiveMutation: !!getMutationEffect(activeMutations, 'enemy_explode'),
  };
}

// ─── IA Ennemis ───────────────────────────────────────────────────────────────

function zigzagAI(enemy, player, dt) {
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const spd = enemy.speed * SPEED_SCALE * dt;
  const zigzagTimer = (enemy.zigzagTimer || 0) + dt;
  const interval = enemy.zigzagInterval || 1.5;
  // Alterne la direction de zigzag à chaque intervalle
  const side = Math.floor(zigzagTimer / interval) % 2 === 0 ? 1 : -1;
  const perpX = (-dy / dist) * side * 0.6;
  const perpY = (dx / dist) * side * 0.6;
  const nx = Math.max(PLAYER_RADIUS, Math.min(ARENA_WIDTH  - PLAYER_RADIUS, enemy.x + (dx / dist + perpX) * spd));
  const ny = Math.max(PLAYER_RADIUS, Math.min(ARENA_HEIGHT - PLAYER_RADIUS, enemy.y + (dy / dist + perpY) * spd));
  return { ...enemy, x: nx, y: ny, zigzagTimer };
}

function trackerAI(enemy, player, dt) {
  // Se dirige vers la dernière position connue du joueur, mise à jour toutes les 1.5s
  const trackInterval = 1.5;
  let trackTimer = (enemy.trackTimer || 0) + dt;
  let targetX = enemy.targetX ?? player.x;
  let targetY = enemy.targetY ?? player.y;
  if (trackTimer >= trackInterval) {
    trackTimer = 0;
    targetX = player.x;
    targetY = player.y;
  }
  const dx = targetX - enemy.x;
  const dy = targetY - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const spd = enemy.speed * SPEED_SCALE * dt;
  return {
    ...enemy,
    x: enemy.x + (dx / dist) * spd,
    y: enemy.y + (dy / dist) * spd,
    trackTimer, targetX, targetY,
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

function summonerAI(enemy, player, dt, elapsedTime = 0) {
  const e = chasePlayer(enemy, player, dt);
  const summonTimer = (e.summonTimer || 0) + dt;
  const info = ENEMY_INFO.summoner;
  const summons = [];
  if (summonTimer >= info.summonInterval) {
    const scaling = getEnemyScaling(elapsedTime); // invocations au niveau de difficulté actuel
    for (let i = 0; i < info.summonCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 30 + Math.random() * 20;
      const summon = spawnEnemy(ENEMY_TYPES.CHASER, scaling, []);
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
// Boss Le Prophète — zones d’anticipation + projectiles qui ralentissent
function bossAI_prophet(enemy, player, dt, projs, particles) {
  // Suit le joueur lentement
  const e = chasePlayer(enemy, player, dt * 0.7);
  let patternTimer = (e.patternTimer || 0) + dt;
  let patternPhase = e.patternPhase || 0;
  let telegraph = e.telegraph || null;

  // Toutes les 2.5s : télégraphier une zone puis tirer un projectile lent
  if (!telegraph && patternTimer >= 2.5) {
    // Choisit une position anticipée du joueur
    const predictT = 0.7; // anticipe 0.7s dans la direction du joueur
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const px = player.x + (dx/len) * player.speed * SPEED_SCALE * predictT;
    const py = player.y + (dy/len) * player.speed * SPEED_SCALE * predictT;
    telegraph = { x: px, y: py, timer: 0 };
    patternTimer = 0;
    // Affiche une zone d’anticipation (particule visuelle)
    particles.push({
      id: makeId(), x: px, y: py, type: 'telegraph',
      radius: 38, color: '#00FFD0', life: 0.7, maxLife: 0.7,
      vx: 0, vy: 0,
    });
  }

  // Après 0.7s de télégraph, tire un projectile lent
  if (telegraph) {
    telegraph.timer += dt;
    if (telegraph.timer >= 0.7) {
      // Tire un projectile lent qui ralentit le joueur
      const dx = telegraph.x - e.x;
      const dy = telegraph.y - e.y;
      const len = Math.sqrt(dx*dx + dy*dy) || 1;
      projs.push({
        id: makeId(), x: e.x, y: e.y,
        vx: (dx/len) * 2.2, vy: (dy/len) * 2.2,
        damage: e.damage * 0.7, radius: 14, color: '#00FFD0',
        owner: 'enemy', enemyId: e.id, lifeMs: 3200,
        slow: 0.5, slowDuration: 2.5, visualType: 'prophet_orb',
      });
      telegraph = null;
      patternPhase++;
    }
  }

  return {
    ...e,
    patternTimer,
    patternPhase,
    telegraph,
  };
}

// Boss L'Amalgame — absorbe des dégâts, mute sous 40% HP
function bossAI_amalgam(enemy, player, dt, projs) {
  const enraged = enemy.hp / enemy.maxHp < 0.4;
  const speedMult = enraged ? 1.8 : 1.0;
  const e = chasePlayer(enemy, player, dt * speedMult);

  const burstTimer   = (e.burstTimer   || 0) + dt;
  const dashTimer    = (e.dashTimer    || 0) + dt;
  const absorbTimer  = (e.absorbTimer  || 0) + dt;

  let result = { ...e, burstTimer, dashTimer, absorbTimer };

  // Toutes les 2.5s (1.5s enragé) : rafale en croix
  const burstCd = enraged ? 1.5 : 2.5;
  if (burstTimer >= burstCd) {
    const count = enraged ? 8 : 4;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      projs.push({
        id: makeId(), x: e.x, y: e.y,
        vx: Math.cos(angle) * 4.5, vy: Math.sin(angle) * 4.5,
        damage: e.damage * 0.6, radius: 9, color: '#FF6600',
        owner: 'enemy', enemyId: e.id, lifeMs: 2200,
      });
    }
    result.burstTimer = 0;
  }

  // Toutes les 4s : dash vers le joueur + tir concentré
  if (dashTimer >= 4) {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const dashX = Math.max(20, Math.min(ARENA_WIDTH  - 20, e.x + (dx/len) * 90));
    const dashY = Math.max(20, Math.min(ARENA_HEIGHT - 20, e.y + (dy/len) * 90));
    // 3 projectiles concentrés vers le joueur
    for (let i = -1; i <= 1; i++) {
      const angle = Math.atan2(dy, dx) + i * 0.25;
      projs.push({
        id: makeId(), x: dashX, y: dashY,
        vx: Math.cos(angle) * 6, vy: Math.sin(angle) * 6,
        damage: e.damage, radius: 11, color: '#FF3300',
        owner: 'enemy', enemyId: e.id, lifeMs: 1800,
      });
    }
    result = { ...result, x: dashX, y: dashY, dashTimer: 0 };
  }

  // Absorption : toutes les 5s, regagne 3% HP max (représente la mécanique d'absorption)
  if (absorbTimer >= 5 && e.hp < e.maxHp) {
    result.hp = Math.min(e.maxHp, e.hp + Math.round(e.maxHp * 0.03));
    result.absorbTimer = 0;
    result.hitFlashTimer = 0.1; // flash orange pour signaler l'absorption
  }

  return result;
}

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
    // const dist = Math.sqrt(dx * dx + dy * dy) || 1; // supprimé car inutilisé
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
  let damageDealt = 0;
  const permUpgrades = s.permanentUpgrades || [];
  const hasBossBane   = permUpgrades.includes('perm_bossbane');
  const hasPermLifesteal = permUpgrades.includes('perm_lifesteal');

  const projs = s.playerProjectiles
    .map(p => {
      let proj = { ...p, lifeMs: p.lifeMs - dt * 1000 };
      if (proj.lifeMs <= 0) return null;

      // Déplacement
      proj.x += proj.vx * SPEED_SCALE * dt;
      proj.y += proj.vy * SPEED_SCALE * dt;

      // Collision obstacles (arrête le projectile)
      if (s.obstacles && s.obstacles.length > 0) {
        for (const obs of s.obstacles) {
          if (obs.type === 'circle') {
            const dx = proj.x - obs.x;
            const dy = proj.y - obs.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < (proj.radius || 4) + obs.radius) return null;
          } else if (obs.type === 'rect') {
            const rx = obs.x, ry = obs.y, rw = obs.w, rh = obs.h;
            const px = Math.max(rx, Math.min(proj.x, rx + rw));
            const py = Math.max(ry, Math.min(proj.y, ry + rh));
            const dx = proj.x - px, dy = proj.y - py;
            if (dx*dx + dy*dy < (proj.radius || 4)*(proj.radius || 4)) return null;
          }
        }
      }

      // Sortie de l'arène
      if (proj.x < 0 || proj.x > ARENA_WIDTH || proj.y < 0 || proj.y > ARENA_HEIGHT) return null;

      // Collision ennemis (AoE vs cercle)
      if (proj.aoe) {
        newEnemies = newEnemies.map(e => {
          const dx = e.x - proj.x;
          const dy = e.y - proj.y;
          if (Math.sqrt(dx*dx + dy*dy) < proj.radius + e.radius) {
            const effectiveDmg = (hasBossBane && e.isBoss) ? proj.damage * 1.3 : proj.damage;
            damageDealt += effectiveDmg;
            if (hasPermLifesteal) healFromKills += Math.min(Math.round(effectiveDmg * 0.1), 2);
            // Appliquer dégâts
            let newE = applyDamageToEnemy(e, effectiveDmg, s.activeUpgrades);
            // Appliquer slow si c'est une onde de prémonition (Oracle)
            if (proj.visualType === 'premonition' && proj.slow && proj.slowDuration) {
              newE = {
                ...newE,
                slowTimer: Math.max(newE.slowTimer || 0, proj.slowDuration),
                slowAmount: proj.slow,
              };
            }
            return newE;
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
            const effectiveDmg = (hasBossBane && e.isBoss) ? proj.damage * 1.3 : proj.damage;
            damageDealt += effectiveDmg;
            if (hasPermLifesteal) healFromKills += Math.min(Math.round(effectiveDmg * 0.1), 2);
            newEnemies[i] = applyDamageToEnemy(e, effectiveDmg, s.activeUpgrades);
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

  // Import des reliques (évite import circulaire)
  let RELICS = [];
  try {
    RELICS = require('../constants').RELICS;
  } catch (e) {}

  for (const dead of deadEnemies) {
    kills++;
    if (dead.isBoss) {
      bossKills++;
      // Drop de relique : 40% de chance si il reste des reliques non possédées
      if (RELICS && RELICS.length > 0 && Math.random() < 0.4) {
        const owned = (s.activeRelics || []).map(r => r.id);
        const available = RELICS.filter(r => !owned.includes(r.id));
        if (available.length > 0) {
          const relic = available[Math.floor(Math.random() * available.length)];
          // Ajoute la relique à l'état
          s = require('./gameLoop').gainRelic(s, relic);
          // Feedback visuel : particule dorée
          newParticles.push({
            id: makeId(),
            x: dead.x, y: dead.y,
            type: 'relic_drop',
            color: '#FFD700',
            life: 1.2, maxLife: 1.2,
            radius: 0, maxRadius: 38,
          });
        }
      }
    }
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
    // Explosif : dégâts de zone + anneau visuel (mutation or enemy type)
    const isExplosive = dead.behavior === 'explosive' || ENEMY_INFO[dead.type]?.explodeOnDeath || dead.isExplosiveMutation;
    if (isExplosive) {
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
    // Fracture upgrade OU synergie Brûlure+Explosion (ennemi brûlé)
    const { hasSynergy } = require('./upgradeSystem');
    const isBurning = dead.status?.burn && dead.status.burn > 0;
    if (hasUpgrade(s.activeUpgrades, 'fracture') || (hasSynergy(s.activeUpgrades, 'burn_explode') && isBurning)) {
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
    // Vol de vie (leech)
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
    // Épicentre : explosion de dégâts autour du mort
    if (hasUpgrade(s.activeUpgrades, 'epicentre')) {
      const epicR = 60;
      newEnemies = newEnemies.map(e => {
        const dx = e.x - dead.x;
        const dy = e.y - dead.y;
        if (Math.sqrt(dx*dx + dy*dy) < epicR) {
          return { ...e, hp: e.hp - 8 };
        }
        return e;
      });
      newParticles.push({
        id: makeId(), x: dead.x, y: dead.y,
        type: 'ring', maxRadius: epicR,
        life: 0.35, maxLife: 0.35, color: '#44AAFF',
        vx: 0, vy: 0, radius: 0,
      });
    }
  }

  // Vampirisme : lifesteal sur les dégâts infligés
  if (damageDealt > 0 && hasUpgrade(s.activeUpgrades, 'vampirisme')) {
    healFromKills += Math.round(damageDealt * 0.15);
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
      // Testament : soin à chaque montée de niveau
      if (hasUpgrade(s.activeUpgrades, 'testament')) {
        const testamentStacks = s.activeUpgrades.filter(u => u.id === 'testament').length;
        s.player = { ...s.player, hp: Math.min(s.player.maxHp, s.player.hp + 5 * testamentStacks) };
      }
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
  // Accumuler les dégâts de TOUS les projectiles qui touchent le joueur dans
  // cette frame (et les détruire), puis appliquer une seule fois.
  let accumulatedDamage = 0;

  const projs = s.enemyProjectiles
    .map(p => {
      const proj = { ...p, lifeMs: p.lifeMs - dt * 1000 };
      if (proj.lifeMs <= 0) return null;
      proj.x += proj.vx * SPEED_SCALE * dt;
      proj.y += proj.vy * SPEED_SCALE * dt;
      if (proj.x < 0 || proj.x > ARENA_WIDTH || proj.y < 0 || proj.y > ARENA_HEIGHT) return null;
      // Collision joueur — tous les projectiles qui touchent sont détruits
      const dx = s.player.x - proj.x;
      const dy = s.player.y - proj.y;
      if (Math.sqrt(dx*dx + dy*dy) < PLAYER_RADIUS + proj.radius) {
        accumulatedDamage += proj.damage;
        return null;
      }
      return proj;
    })
    .filter(Boolean);

  if (accumulatedDamage > 0) {
    s = damagePlayer(s, accumulatedDamage, true);
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
        // Applique tous les multiplicateurs d’XP (weeklyEvent, reliques, mutations)
        let mult = 1;
        if (s._xpMult) mult *= s._xpMult;
        xpGained += Math.round(orb.value * mult);
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

  let newXp    = s.xp + xpGained;
  let newLevel = s.level;
  let pendingUpgrade = s.pendingUpgrade;

  // Boucle : un seul upgrade est proposé à la fois, mais on consomme tout l'XP accumulé
  while (!pendingUpgrade) {
    const xpNeeded = xpForLevel(newLevel);
    if (newXp >= xpNeeded) {
      newXp -= xpNeeded;
      newLevel += 1;
      pendingUpgrade = true;
    } else {
      break;
    }
  }

  return { ...s, xpOrbs: remaining, xp: newXp, level: newLevel, pendingUpgrade };
}

// ─── Dégâts ───────────────────────────────────────────────────────────────────

function damagePlayer(s, rawDamage, setInvincible) {
  if (!s.alive) return s;
  if (s.player.invincibleTimer > 0) return s;
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
  };
}

function applyDamageToEnemy(enemy, damage, upgrades) {
  const tranchant = upgrades.filter(u => u.id === 'tranchant').length;
  let dmg = damage + tranchant * 2;
  const ignition = upgrades.filter(u => u.id === 'ignition').length;
  let newEnemy = { ...enemy, hp: enemy.hp - dmg, hitFlashTimer: 0.12 };
  if (ignition > 0) {
    newEnemy.burnDamage = ignition * 3;
    newEnemy.burnTimer  = 2;
  }
  if (hasUpgrade(upgrades, 'gelbomb')) {
    newEnemy.freezeTimer = 0.5;
  }
  // Lame Empoisonnée
  const poison = upgrades.filter(u => u.id === 'lame_poison').length;
  if (poison > 0) {
    newEnemy.poisonDamage = poison * 2;
    newEnemy.poisonTimer  = 3;
  }
  return newEnemy;
}

// ─── XP par niveau ────────────────────────────────────────────────────────────
export function xpForLevel(level) {
  return Math.round(XP_PER_LEVEL_BASE * Math.pow(XP_LEVEL_SCALING, level - 1));
}
