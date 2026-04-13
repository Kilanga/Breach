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

// ─── Attaques par classe ──────────────────────────────────────────────────────

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
  const speed = info.projectileSpeed;
  const dmg = computeAttackDamage(player.attack, upgrades);
  return [{
    id: makeId(),
    x: player.x, y: player.y,
    vx: nx * speed, vy: ny * speed,
    damage: dmg,
    radius: info.projectileRadius,
    piercing: true,
    piercedIds: [],
    color: CLASS_INFO.triangle.color,
    owner: 'player',
    lifeMs: 2500,
  }];
}

/**
 * Arcaniste — AoE circulaire autour du joueur (retourne une explosion logique)
 */
export function fireArcaniste(player, enemies, upgrades) {
  const info = CLASS_INFO.circle;
  const dmg = computeAttackDamage(player.attack, upgrades);
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
  }];
}

/**
 * Colosse — aura de dégâts en continu (zone au contact)
 */
export function fireColosse(player, enemies, upgrades) {
  const info = CLASS_INFO.hexagon;
  const dmg = computeAttackDamage(player.attack, upgrades) * 0.5; // dps réduit compensé par fréquence
  return [{
    id: makeId(),
    x: player.x, y: player.y,
    vx: 0, vy: 0,
    damage: dmg,
    radius: info.auraRadius,
    aoe: true,
    color: CLASS_INFO.hexagon.color,
    owner: 'player',
    lifeMs: 200,
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
  const speed = info.projectileSpeed;
  let dmg = computeAttackDamage(player.attack, upgrades);
  if (ambushReady) dmg *= info.ambushMultiplier;
  return [{
    id: makeId(),
    x: player.x, y: player.y,
    vx: nx * speed, vy: ny * speed,
    damage: dmg,
    radius: info.projectileRadius,
    piercing: false,
    piercedIds: [],
    color: CLASS_INFO.shadow.color,
    owner: 'player',
    lifeMs: 2000,
    isAmbush: ambushReady,
  }];
}

/**
 * Paladin — frappe radiale (8 projectiles en étoile)
 */
export function firePaladin(player, enemies, upgrades) {
  const info = CLASS_INFO.paladin;
  const dmg = computeAttackDamage(player.attack, upgrades);
  const projectiles = [];
  for (let i = 0; i < info.radialCount; i++) {
    const angle = (i / info.radialCount) * Math.PI * 2;
    projectiles.push({
      id: makeId(),
      x: player.x, y: player.y,
      vx: Math.cos(angle) * info.projectileSpeed,
      vy: Math.sin(angle) * info.projectileSpeed,
      damage: dmg,
      radius: info.projectileRadius,
      piercing: false,
      piercedIds: [],
      color: CLASS_INFO.paladin.color,
      owner: 'player',
      lifeMs: 1500,
    });
  }
  return projectiles;
}

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function computeAttackDamage(baseAttack, upgrades) {
  let dmg = baseAttack;
  // Critique
  const critUpgrades = upgrades.filter(u => u.id === 'critique');
  if (critUpgrades.length > 0) {
    const critChance = critUpgrades.length * 0.15;
    if (Math.random() < critChance) dmg *= 3;
  }
  // Berserker (géré côté loop avec accès au HP)
  return Math.round(dmg);
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
