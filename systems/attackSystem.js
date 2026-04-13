/**
 * BREACH — Système d'attaques automatiques par classe
 * Chaque classe a un comportement d'attaque différent
 */

import { CLASS_INFO } from '../constants';
import { makeId } from '../utils/makeId';

function vecToNearest(player, enemies) {
  if (enemies.length === 0) return null;
  let nearest = null;
  let minDist = Infinity;
  for (const e of enemies) {
    const dx = e.x - player.x;
    const dy = e.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) {
      minDist = dist;
      nearest = { e, dist, dx, dy };
    }
  }
  return nearest;
}


// ─── Attaque Oracle (onde de prémonition) ─────────────────────────────────────
/**
 * Oracle — onde qui ralentit les ennemis proches
 */
export function fireOracle(player, enemies, upgrades) {
  const info = CLASS_INFO.octagon;
  // Onde visuelle, applique un effet de slow aux ennemis dans le rayon
  return [{
    id: makeId(),
    x: player.x, y: player.y,
    vx: 0, vy: 0,
    damage: player.attack * 0.7, // dégâts modérés
    radius: info.premonitionRadius,
    aoe: true,
    color: info.color,
    owner: 'player',
    lifeMs: 400,
    visualType: 'premonition',
    slow: info.slowAmount,
    slowDuration: info.slowDuration,
  }];
}

/**
 * Assassin — projectile linéaire vers l'ennemi le plus proche (pierce)
 */
export function fireAssassin(player, enemies, upgrades) {
  const nearest = vecToNearest(player, enemies);
  if (!nearest) return [];
  const { dx, dy, dist } = nearest;
  const nx = dx / dist;
  const ny = dy / dist;
  const info = CLASS_INFO.triangle;
  const { dmg, isCrit } = computeAttackDamage(player.attack, upgrades);
  const vf = visualFlags(upgrades, isCrit);
  return [{
    id: makeId(),
    x: player.x, y: player.y,
    vx: nx * info.projectileSpeed, vy: ny * info.projectileSpeed,
    damage: dmg,
    radius: isCrit ? info.projectileRadius * 1.6 : info.projectileRadius,
    piercing: true,
    piercedIds: [],
    color: CLASS_INFO.triangle.color,
    owner: 'player',
    lifeMs: 2500,
    ...vf,
  }];
}

/**
 * Arcaniste — AoE circulaire autour du joueur (retourne une explosion logique)
 */
export function fireArcaniste(player, enemies, upgrades) {
  const info = CLASS_INFO.circle;
  const { dmg, isCrit } = computeAttackDamage(player.attack, upgrades);
  const vf = visualFlags(upgrades, isCrit);
  // Explose sur tous les ennemis dans aoeRadius
  return [{
    id: makeId(),
    x: player.x, y: player.y,
    vx: 0, vy: 0,
    damage: dmg,
    radius: info.aoeRadius,
    aoe: true,
    color: CLASS_INFO.circle.color,
    owner: 'player',
    lifeMs: 300, // flash visuel court
    ...vf,
  }];
}

/**
 * Colosse — aura de dégâts en continu (zone au contact)
 */
export function fireColosse(player, enemies, upgrades) {
  const info = CLASS_INFO.hexagon;
  const { dmg, isCrit } = computeAttackDamage(player.attack, upgrades);
  const vf = { ...visualFlags(upgrades, isCrit), visualType: isCrit ? 'crit' : 'aura' };
  return [{
    id: makeId(),
    x: player.x, y: player.y,
    vx: 0, vy: 0,
    damage: dmg * 0.5, // dps réduit compensé par fréquence
    radius: info.auraRadius,
    aoe: true,
    color: CLASS_INFO.hexagon.color,
    owner: 'player',
    lifeMs: 200,
    ...vf,
  }];
}

/**
 * Ombre — projectile vers le plus proche, premier coup ×2 toutes les N secondes
 */
export function fireOmbre(player, enemies, upgrades, ambushReady) {
  const nearest = vecToNearest(player, enemies);
  if (!nearest) return [];
  const { dx, dy, dist } = nearest;
  const nx = dx / dist;
  const ny = dy / dist;
  const info = CLASS_INFO.shadow;
  const { dmg: baseDmg, isCrit } = computeAttackDamage(player.attack, upgrades);
  const dmg = ambushReady ? Math.round(baseDmg * info.ambushMultiplier) : baseDmg;
  const vf  = visualFlags(upgrades, isCrit, ambushReady);
  return [{
    id: makeId(),
    x: player.x, y: player.y,
    vx: nx * info.projectileSpeed, vy: ny * info.projectileSpeed,
    damage: dmg,
    radius: ambushReady ? info.projectileRadius * 1.8 : info.projectileRadius,
    piercing: false,
    piercedIds: [],
    color: CLASS_INFO.shadow.color,
    owner: 'player',
    lifeMs: 2000,
    ...vf,
  }];
}

/**
 * Paladin — frappe radiale (8 projectiles en étoile)
 */
export function firePaladin(player, enemies, upgrades) {
  const info = CLASS_INFO.paladin;
  const { dmg, isCrit } = computeAttackDamage(player.attack, upgrades);
  const vf = { ...visualFlags(upgrades, isCrit), visualType: isCrit ? 'crit' : 'radiant' };
  const projectiles = [];
  for (let i = 0; i < info.radialCount; i++) {
    const angle = (i / info.radialCount) * Math.PI * 2;
    projectiles.push({
      id: makeId(),
      x: player.x, y: player.y,
      vx: Math.cos(angle) * info.projectileSpeed,
      vy: Math.sin(angle) * info.projectileSpeed,
      damage: dmg,
      radius: isCrit ? info.projectileRadius * 1.4 : info.projectileRadius,
      piercing: false,
      piercedIds: [],
      color: CLASS_INFO.paladin.color,
      owner: 'player',
      lifeMs: 1500,
      ...vf,
    });
  }
  return projectiles;
}

// ─── Utilitaires ──────────────────────────────────────────────────────────────

/**
 * Calcule les dégâts et si l'attaque est critique.
 * @returns {{ dmg: number, isCrit: boolean }}
 */
function computeAttackDamage(baseAttack, upgrades) {
  let dmg    = baseAttack;
  let isCrit = false;
  const critUpgrades = upgrades.filter(u => u.id === 'critique');
  if (critUpgrades.length > 0) {
    const critChance = critUpgrades.length * 0.15;
    if (Math.random() < critChance) {
      dmg   *= 3;
      isCrit = true;
    }
  }
  return { dmg: Math.round(dmg), isCrit };
}

/** Retourne les flags visuels courants basés sur les upgrades actifs */
function visualFlags(upgrades, isCrit, isAmbush = false) {
  const hasBurn   = upgrades.some(u => u.id === 'ignition');
  const hasFreeze = upgrades.some(u => u.id === 'gelbomb');
  const visualType = isAmbush ? 'ambush'
                   : isCrit   ? 'crit'
                   : hasBurn  ? 'burn'
                   : hasFreeze ? 'freeze'
                   : 'normal';
  return { hasBurn, hasFreeze, isCrit, isAmbush, visualType };
}

/**
 * Retourne la fonction d'attaque pour une classe donnée
 */
export function getAttackFn(shape) {
  switch (shape) {
    case 'triangle': return fireAssassin;
    case 'circle':   return fireArcaniste;
    case 'hexagon':  return fireColosse;
    case 'shadow':   return fireOmbre;
    case 'paladin':  return firePaladin;
    case 'octagon':  return fireOracle;
    default:         return fireAssassin;
  }
}

/**
 * Retourne le cooldown d'attaque (secondes) pour une classe, modifié par les upgrades
 */
export function getAttackCooldown(shape, upgrades) {
  const info = CLASS_INFO[shape];
  let cd = info?.attackCooldown ?? 1.5;
  // Rafale : -20% par stack
  const rafale = upgrades.filter(u => u.id === 'speedattack').length;
  for (let i = 0; i < rafale; i++) cd *= 0.8;
  return Math.max(0.15, cd);
}

/**
 * Projectiles ennemis (Tirailleur)
 */
export function fireShooterProjectile(enemy, playerX, playerY) {
  const dx = playerX - enemy.x;
  const dy = playerY - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const speed = 3.5;
  return {
    id: makeId(),
    x: enemy.x, y: enemy.y,
    vx: (dx / dist) * speed,
    vy: (dy / dist) * speed,
    damage: enemy.damage,
    radius: 6,
    color: '#4488FF',
    owner: 'enemy',
    enemyId: enemy.id,
    lifeMs: 3000,
  };
}
