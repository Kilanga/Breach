/**
 * BREACH — Renderer de l'arène (SVG)
 * Dessine : joueur, ennemis, projectiles, orbes XP, particules
 * Les projectiles ont un rendu différencié selon leur visualType (burn, freeze, crit, ambush, radiant, aura)
 * Les particules de type 'ring' sont dessinées comme des anneaux d'expansion (fracture, shockwave, explosif)
 */

import React, { memo, useRef, useEffect, useState } from 'react';
import Svg, { Circle, Polygon, Rect, G, Line, Text as SvgText } from 'react-native-svg';
import { PALETTE, CLASS_INFO, PLAYER_RADIUS } from '../../constants';

// Ajout du zoom et du centrage sur le joueur
const ArenaRenderer = memo(({ gameState, arenaWidth, arenaHeight, scaleX, scaleY, palette = PALETTE, highlightPlayer = false, zoom = 1.0, centerOnPlayer = false, obstacles = [] }) => {
  if (!gameState) return null;
  const { player, enemies, playerProjectiles, enemyProjectiles,
    xpOrbs, particles, turrets = [], activeUpgrades = [], chainBoostActive = false } = gameState;
  // Couleur et rayon des tourelles (Ingénieur)
  const turretColor = '#7EC8E3';
  const turretRadius = 13;

  const sx = scaleX || 1;
  const sy = scaleY || 1;
  const vw = arenaWidth  * sx;
  const vh = arenaHeight * sy;

  // Calcul du viewport centré sur le joueur
  let viewBox = `0 0 ${arenaWidth} ${arenaHeight}`;
  if (centerOnPlayer && gameState && gameState.player) {
    const player = gameState.player;
    const zoomFactor = zoom || 1.2;
    const vwz = arenaWidth / zoomFactor;
    const vhz = arenaHeight / zoomFactor;
    let cx = player.x - vwz / 2;
    let cy = player.y - vhz / 2;
    // Clamp pour ne pas sortir de l'arène
    cx = Math.max(0, Math.min(cx, arenaWidth - vwz));
    cy = Math.max(0, Math.min(cy, arenaHeight - vhz));
    viewBox = `${cx} ${cy} ${vwz} ${vhz}`;
  }

  // Flags visuels dérivés des upgrades actifs
  const hasMagnet     = activeUpgrades.some(u => u.id === 'magnet');
  const hasCyclone    = activeUpgrades.some(u => u.id === 'cyclone');
  const hasRegen      = activeUpgrades.some(u => u.id === 'regen');
  const hasBerserker  = activeUpgrades.some(u => u.id === 'berserker');
  const berserkerActive = hasBerserker && player.hp / player.maxHp < 0.3;

  // Halos évolutifs par couleur d'upgrade
  const greenUpgrades = activeUpgrades.filter(u => u.color === 'green').length;
  const redUpgrades   = activeUpgrades.filter(u => u.color === 'red').length;
  const blueUpgrades  = activeUpgrades.filter(u => u.color === 'blue').length;
  const curseUpgrades = activeUpgrades.filter(u => u.color === 'curse').length;

  // Rayon de collecte XP (avec magnet)
  const magnetStacks = activeUpgrades.filter(u => u.id === 'magnet').length;
  const xpRadius = (player.xpPickupRadius || 50) * (1 + magnetStacks * 0.5);

  // AoE de base pour les classes à zone
  const classInfo = CLASS_INFO[player.shape] || {};
  const showZoneRing = classInfo.aoeRadius || classInfo.auraRadius;
  const zoneRadius   = (classInfo.aoeRadius || classInfo.auraRadius || 0)
                       + (hasCyclone ? 20 : 0);  // cyclone agrandit la zone

  // Séparer les ring particles des particules normales
  const ringParticles   = particles.filter(p => p.type === 'ring');
  const normalParticles = particles.filter(p => !p.type);
  // Particules premium : poussière, éclats, impacts
  const dustParticles   = particles.filter(p => p.type === 'dust');
  const sparkParticles  = particles.filter(p => p.type === 'spark');
  const impactParticles = particles.filter(p => p.type === 'impact');
  // Chiffres de dégâts flottants
  const floatTexts      = particles.filter(p => p.type === 'float_text');

  // Particules murs d'énergie (boss Architecte)
  const energyWalls = particles.filter(p => p.type === 'energy_wall');

  return (
    <Svg width={vw} height={vh} viewBox={viewBox}>
                  {/* Obstacles fixes */}
                  {obstacles && obstacles.map(obs => {
                    if (obs.type === 'circle') {
                      if (obs.isHazard) {
                        // Lave : lueur orange + cercle avec motif
                        return (
                          <G key={obs.id}>
                            <Circle cx={obs.x} cy={obs.y} r={obs.radius + 10} fill="#FF6600" opacity={0.18} />
                            <Circle cx={obs.x} cy={obs.y} r={obs.radius} fill="#AA3300" opacity={0.90} />
                            <Circle cx={obs.x} cy={obs.y} r={obs.radius * 0.55} fill="#FF5500" opacity={0.60} />
                            <Circle cx={obs.x} cy={obs.y} r={obs.radius * 0.25} fill="#FFAA00" opacity={0.50} />
                          </G>
                        );
                      }
                      // Rocher : cercle gris-bleu avec relief
                      return (
                        <G key={obs.id}>
                          <Circle cx={obs.x} cy={obs.y} r={obs.radius} fill="#2A3A4A" opacity={0.95} stroke="#445566" strokeWidth={2} />
                          <Circle cx={obs.x - obs.radius * 0.2} cy={obs.y - obs.radius * 0.2} r={obs.radius * 0.45} fill="#3A5060" opacity={0.40} />
                        </G>
                      );
                    }
                    return (
                      <Rect key={obs.id} x={obs.x} y={obs.y} width={obs.w} height={obs.h} fill={obs.color || '#888'} opacity={0.7} rx={obs.rx || 8} />
                    );
                  })}
            {/* ─── Murs d'énergie (boss Architecte) ───────────────────────────── */}
            {energyWalls.map(wall => {
              // Calcule les extrémités du mur
              const x1 = wall.x - Math.cos(wall.angle) * wall.length / 2;
              const y1 = wall.y - Math.sin(wall.angle) * wall.length / 2;
              const x2 = wall.x + Math.cos(wall.angle) * wall.length / 2;
              const y2 = wall.y + Math.sin(wall.angle) * wall.length / 2;
              return (
                <Line
                  key={wall.id}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={wall.color || '#66CCFF'}
                  strokeWidth={12}
                  opacity={0.18 + 0.25 * (wall.life / wall.maxLife)}
                  strokeDasharray="32,16"
                />
              );
            })}
      {/* Fond */}
      <Rect x={0} y={0} width={arenaWidth} height={arenaHeight} fill={palette.bg} />
      {/* Grille décorative */}
      <GridLines w={arenaWidth} h={arenaHeight} />
      {/* Bordure de la map */}
      <Rect x={1} y={1} width={arenaWidth - 2} height={arenaHeight - 2} fill="none" stroke={palette.border || '#2A2A3A'} strokeWidth={3} />

      {/* ─── Tourelles de l'Ingénieur ─────────────────────────────── */}
      {turrets.map(turret => (
        <G key={turret.id}>
          <Circle cx={turret.x} cy={turret.y} r={turretRadius} fill={turretColor} opacity={0.95} stroke="#222" strokeWidth={2} />
          <Circle cx={turret.x} cy={turret.y} r={turretRadius + 5} fill="none" stroke={turretColor} strokeWidth={2} opacity={0.45}
            strokeDasharray={`${Math.max(0.01, (turret.life / (CLASS_INFO.engineer.turretLifetime || 1)) * 2 * Math.PI * (turretRadius + 5))},100`} />
          <SvgText x={turret.x} y={turret.y + 4} fontSize="15" fontWeight="bold" fill="#222" textAnchor="middle">T</SvgText>
        </G>
      ))}

      {/* ─── Auras joueur (couche basse) ───────────────────────────────────── */}
      {/* Rayon d'attraction XP (aimant) */}
      {hasMagnet && (
        <Circle
          cx={player.x} cy={player.y} r={xpRadius}
          fill="none" stroke={palette.xp || '#FFDD44'} strokeWidth={1}
          strokeDasharray="4,6" opacity={0.20}
        />
      )}
      {/* Zone d'attaque de base (Arcaniste / Colosse) + bonus Cyclone */}
      {showZoneRing > 0 && (
        <Circle
          cx={player.x} cy={player.y} r={zoneRadius}
          fill="none" stroke={classInfo.color} strokeWidth={1}
          strokeDasharray={hasCyclone ? '6,3' : '3,5'} opacity={hasCyclone ? 0.35 : 0.20}
        />
      )}
      {/* Berserker actif : aura rouge pulsante */}
      {berserkerActive && (
        <>
          <Circle cx={player.x} cy={player.y} r={PLAYER_RADIUS + 10}
            fill="none" stroke="#FF2222" strokeWidth={3} opacity={0.60} />
          <Circle cx={player.x} cy={player.y} r={PLAYER_RADIUS + 18}
            fill="none" stroke="#FF2222" strokeWidth={1} opacity={0.25} />
        </>
      )}
      {/* Chain reaction boost actif : halo doré */}
      {chainBoostActive && (
        <Circle cx={player.x} cy={player.y} r={PLAYER_RADIUS + 8}
          fill="none" stroke="#FFCC00" strokeWidth={2} opacity={0.75} />
      )}

      {/* Halo vert évolutif selon upgrades vertes */}
      {greenUpgrades > 0 && (
        <Circle
          cx={player.x}
          cy={player.y}
          r={PLAYER_RADIUS + 10 + greenUpgrades * 8}
          fill="#44FF88"
          opacity={0.18 + 0.07 * greenUpgrades}
        />
      )}
      {/* Halo rouge évolutif selon upgrades rouges */}
      {redUpgrades > 0 && (
        <Circle
          cx={player.x}
          cy={player.y}
          r={PLAYER_RADIUS + 10 + redUpgrades * 8}
          fill="#FF3344"
          opacity={0.13 + 0.07 * redUpgrades}
        />
      )}
      {/* Halo bleu évolutif selon upgrades bleues */}
      {blueUpgrades > 0 && (
        <Circle
          cx={player.x}
          cy={player.y}
          r={PLAYER_RADIUS + 10 + blueUpgrades * 8}
          fill="#3388FF"
          opacity={0.13 + 0.07 * blueUpgrades}
        />
      )}
      {/* Aura maudite évolutive */}
      {curseUpgrades > 0 && (
        <Circle
          cx={player.x}
          cy={player.y}
          r={PLAYER_RADIUS + 14 + curseUpgrades * 10}
          fill="#7B2FF2"
          opacity={0.18 + 0.10 * curseUpgrades}
        />
      )}
      {/* Regen : légère aura verte */}
      {hasRegen && (
        <Circle cx={player.x} cy={player.y} r={PLAYER_RADIUS + 4}
          fill="#44FF88" opacity={0.07} />
      )}

      {/* ─── XP orbs ────────────────────────────────────────────────────── */}
      {xpOrbs.map(orb => (
        <Circle key={orb.id} cx={orb.x} cy={orb.y} r={orb.radius} fill={PALETTE.xp || '#FFDD44'} opacity={0.9} />
      ))}

      {/* ─── Ring particles (fracture, shockwave, explosif) ─────────────── */}
      {ringParticles.map(p => {
        const progress = 1 - p.life / p.maxLife; // 0→1 pendant l'expansion
        const r = (p.maxRadius || 60) * progress;
        const opacity = Math.max(0, p.life / p.maxLife);
        return (
          <Circle key={p.id} cx={p.x} cy={p.y} r={r}
            fill="none" stroke={p.color} strokeWidth={2 + (1 - progress) * 3}
            opacity={opacity} />
        );
      })}


      {/* ─── Particules premium : poussière, éclats, impacts ────────────── */}
      {dustParticles.map(p => (
        <Circle
          key={p.id}
          cx={p.x}
          cy={p.y}
          r={p.radius * (p.life / p.maxLife)}
          fill={p.color || '#E2C089'}
          opacity={0.12 * (p.life / p.maxLife)}
        />
      ))}
      {sparkParticles.map(p => (
        <Line
          key={p.id}
          x1={p.x}
          y1={p.y}
          x2={p.x + (p.dx || 0) * 6}
          y2={p.y + (p.dy || 0) * 6}
          stroke={p.color || '#FFD700'}
          strokeWidth={1.5}
          opacity={0.18 + 0.5 * (p.life / p.maxLife)}
        />
      ))}
      {impactParticles.map(p => (
        <Circle
          key={p.id}
          cx={p.x}
          cy={p.y}
          r={p.radius * (1 - p.life / p.maxLife)}
          fill={p.color || '#FFF'}
          opacity={0.22 * (p.life / p.maxLife)}
        />
      ))}

      {/* ─── Particules normales ────────────────────────────────────────── */}
      {normalParticles.map(p => (
        <Circle
          key={p.id} cx={p.x} cy={p.y}
          r={p.radius * (p.life / p.maxLife)}
          fill={p.color} opacity={p.life / p.maxLife}
        />
      ))}

      {/* ─── Projectiles ennemis ────────────────────────────────────────── */}
      {enemyProjectiles.map(p => (
        <Circle key={p.id} cx={p.x} cy={p.y} r={p.radius} fill={p.color} opacity={0.85} />
      ))}

      {/* ─── Projectiles joueur ─────────────────────────────────────────── */}
      {playerProjectiles.map(p => <PlayerProjectile key={p.id} proj={p} />)}

      {/* ─── Ennemis ────────────────────────────────────────────────────── */}
      {enemies.map(e => <EnemyShape key={e.id} enemy={e} />)}

      {/* ─── Joueur ─────────────────────────────────────────────────────── */}
      <PlayerShape player={player} highlight={highlightPlayer} />

      {/* ─── Chiffres de dégâts flottants ─────────────────────────────── */}
      {floatTexts.map(p => {
        const progress = 1 - p.life / p.maxLife;
        const opacity  = Math.max(0, p.life / p.maxLife);
        const yOffset  = progress * 28;
        const isBig    = p.text && p.text.endsWith('!');
        return (
          <SvgText
            key={p.id}
            x={p.x}
            y={p.y - yOffset}
            fill={p.color || '#FFFFFF'}
            fontSize={isBig ? 15 : 11}
            fontWeight="bold"
            textAnchor="middle"
            opacity={opacity}
          >
            {p.text}
          </SvgText>
        );
      })}
    </Svg>
  );
});

// ─── Rendu projectile joueur ─────────────────────────────────────────────────

function PlayerProjectile({ proj }) {
  const { x, y, radius, color, aoe, visualType = 'normal', isCrit, hasBurn, hasFreeze } = proj;

  if (aoe) {
    // Flash AoE (Arcaniste / Colosse)
    const overlayColor = hasBurn ? '#FF6600' : hasFreeze ? '#44CCFF' : isCrit ? '#FFCC00' : color;
    return (
      <G>
        <Circle cx={x} cy={y} r={radius} fill={overlayColor} opacity={visualType === 'aura' ? 0.15 : 0.22} />
        {(hasBurn || hasFreeze || isCrit) && (
          <Circle cx={x} cy={y} r={radius} fill="none" stroke={overlayColor} strokeWidth={1.5} opacity={0.45} />
        )}
      </G>
    );
  }

  // Projectile linéaire
  switch (visualType) {
    case 'crit':
      return (
        <G>
          <Circle cx={x} cy={y} r={radius + 4} fill="#FFCC00" opacity={0.30} />
          <Circle cx={x} cy={y} r={radius}     fill="#FFEE44" opacity={0.95} />
        </G>
      );
    case 'burn':
      return (
        <G>
          <Circle cx={x} cy={y} r={radius + 3} fill="#FF4400" opacity={0.35} />
          <Circle cx={x} cy={y} r={radius}     fill={color}   opacity={0.95} />
        </G>
      );
    case 'freeze':
      return (
        <G>
          <Circle cx={x} cy={y} r={radius + 2} fill="#44CCFF" opacity={0.40} />
          <Circle cx={x} cy={y} r={radius}     fill="#88DDFF" opacity={0.95} />
        </G>
      );
    case 'ambush':
      return (
        <G>
          <Circle cx={x} cy={y} r={radius + 5} fill="#FF4400" opacity={0.45} />
          <Circle cx={x} cy={y} r={radius}     fill={color}   opacity={1.0}  />
          {/* Couronne indiquant le ×2 */}
          <Circle cx={x} cy={y} r={radius + 2} fill="none"    stroke="#FFFFFF" strokeWidth={1} opacity={0.6} />
        </G>
      );
    case 'radiant':
      // Paladin : éclat lumineux doré
      return (
        <G>
          <Circle cx={x} cy={y} r={radius + 3} fill={color} opacity={0.20} />
          <Circle cx={x} cy={y} r={radius}     fill={color} opacity={0.95} />
        </G>
      );
    default:
      return <Circle cx={x} cy={y} r={radius} fill={color} opacity={0.95} />;
  }
}

// ─── Joueur ───────────────────────────────────────────────────────────────────

// import supprimé : déjà présent en haut du fichier
import { Animated as RNAnimated } from 'react-native';

function PlayerShape({ player, highlight }) {
  const { x, y, shape, hp, maxHp, shieldActive, invincibleTimer } = player;
  const color = CLASS_INFO[shape]?.color || '#FFFFFF';
  const opacity = invincibleTimer > 0 ? 0.5 : 1;

  // Animation du halo de surbrillance
  const haloAnim = useRef(new RNAnimated.Value(0)).current;
  useEffect(() => {
    if (highlight) {
      haloAnim.setValue(1);
      RNAnimated.timing(haloAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: false,
      }).start();
    }
  }, [highlight]);

  const haloOpacity = haloAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.7] });
  const haloRadius = haloAnim.interpolate({ inputRange: [0, 1], outputRange: [PLAYER_RADIUS + 12, PLAYER_RADIUS + 24] });

  const inner = (() => {
    switch (shape) {
      case 'triangle': {
        const r = PLAYER_RADIUS;
        const pts = `${x},${y - r} ${x - r * 0.866},${y + r * 0.5} ${x + r * 0.866},${y + r * 0.5}`;
        return <Polygon points={pts} fill={color} opacity={opacity} />;
      }
      case 'circle':
        return <Circle cx={x} cy={y} r={PLAYER_RADIUS} fill={color} opacity={opacity} />;
      case 'hexagon': {
        const r = PLAYER_RADIUS;
        const pts = Array.from({ length: 6 }, (_, i) => {
          const a = (i * 60 - 30) * Math.PI / 180;
          return `${x + r * Math.cos(a)},${y + r * Math.sin(a)}`;
        }).join(' ');
        return <Polygon points={pts} fill={color} opacity={opacity} />;
      }
      case 'shadow': {
        const r = PLAYER_RADIUS;
        return (
          <G>
            <Circle cx={x} cy={y} r={r} fill={color} opacity={opacity} />
            <Circle cx={x - r * 0.4} cy={y - r * 0.4} r={r * 0.3} fill="rgba(0,0,0,0.5)" />
          </G>
        );
      }
      case 'paladin': {
        const r = PLAYER_RADIUS;
        const pts = `${x},${y - r} ${x + r * 0.7},${y + r * 0.4} ${x - r * 0.7},${y + r * 0.4}`;
        return (
          <G>
            <Polygon points={pts} fill={color} opacity={opacity} />
            <Circle cx={x} cy={y} r={r * 0.4} fill="rgba(255,255,220,0.4)" />
          </G>
        );
      }
      default:
        return <Circle cx={x} cy={y} r={PLAYER_RADIUS} fill={color} opacity={opacity} />;
    }
  })();

  return (
    <G>
      {/* Halo animé lors du highlight */}
      {highlight && (
        <RNAnimated.View
          style={{
            position: 'absolute',
            left: x - PLAYER_RADIUS - 24,
            top: y - PLAYER_RADIUS - 24,
            width: 2 * (PLAYER_RADIUS + 24),
            height: 2 * (PLAYER_RADIUS + 24),
            borderRadius: PLAYER_RADIUS + 24,
            backgroundColor: color,
            opacity: haloOpacity,
            zIndex: 1,
          }}
        />
      )}
      {inner}
      {/* HP bar au dessus */}
      <Rect x={x - 20} y={y - PLAYER_RADIUS - 10} width={40} height={4} rx={2} fill="rgba(255,255,255,0.15)" />
      <Rect x={x - 20} y={y - PLAYER_RADIUS - 10} width={40 * Math.max(0, hp / maxHp)} height={4} rx={2} fill={PALETTE.hp} />
      {/* Bouclier */}
      {shieldActive && <Circle cx={x} cy={y} r={PLAYER_RADIUS + 6} fill="none" stroke="#4488FF" strokeWidth={2} opacity={0.7} />}
    </G>
  );
}

// ─── Ennemis ──────────────────────────────────────────────────────────────────

function EnemyShape({ enemy }) {
  const { x, y, radius, color, hp, maxHp, isBoss,
          freezeTimer, burnTimer, stunTimer, poisonTimer, hitFlashTimer, type } = enemy;
  const hpPct = Math.max(0, hp / maxHp);

  // Animation pop à l'apparition
  const [scale, setScale] = useState(0.3);
  const animRef = useRef();
  useEffect(() => {
    setScale(0.3);
    animRef.current = setTimeout(() => setScale(1), 16);
    return () => clearTimeout(animRef.current);
  }, [enemy.id]);

  // Priorité des overlays : hit flash > stun > burn > poison > freeze
  let overlayColor = null;
  let statusIcon   = null;
  let overlayOpacity = 0.45;

  if (freezeTimer > 0)  { overlayColor = '#44CCFF'; statusIcon = '❄'; }
  if (poisonTimer > 0)  { overlayColor = '#88FF44'; statusIcon = '☠'; }
  if (burnTimer   > 0)  { overlayColor = '#FF6600'; statusIcon = '🔥'; }
  if (stunTimer   > 0)  { overlayColor = '#DDDDAA'; statusIcon = '⚡'; overlayOpacity = 0.6; }
  if (hitFlashTimer > 0) { overlayColor = '#FFFFFF'; overlayOpacity = 0.75 * (hitFlashTimer / 0.12); }

  // Traînée pour Spectre Zigzag
  let trail = null;
  if (type === 'spectre_zigzag') {
    const trailAlpha = [0.16, 0.10, 0.06, 0.03];
    trail = trailAlpha.map((a, i) => (
      <Circle
        key={`trail${i}`}
        cx={x - (i + 1) * 14}
        cy={y}
        r={radius * (1 - (i + 1) * 0.15)}
        fill="#66CCFF"
        opacity={a}
      />
    ));
  }

  return (
    <G>
      {trail}
      <G transform={`translate(${x}, ${y}) scale(${scale}) translate(${-x}, ${-y})`}>
        {/* Corps */}
        <Circle cx={x} cy={y} r={radius} fill={color} opacity={0.92} />
        {/* Overlay statut / hit flash */}
        {overlayColor && (
          <Circle cx={x} cy={y} r={radius} fill={overlayColor} opacity={overlayOpacity} />
        )}
        {/* Aura boss */}
        {isBoss && (
          <>
            <Circle cx={x} cy={y} r={radius + 8}  fill="none" stroke="#BB44FF" strokeWidth={2} strokeDasharray="10,5" opacity={0.7} />
            <Circle cx={x} cy={y} r={radius + 14} fill="none" stroke="#BB44FF" strokeWidth={1} opacity={0.25} />
          </>
        )}
        {/* HP bar */}
        <Rect x={x - radius} y={y - radius - 9} width={radius * 2} height={isBoss ? 5 : 3} rx={1.5} fill="rgba(0,0,0,0.4)" />
        <Rect
          x={x - radius} y={y - radius - 9}
          width={radius * 2 * hpPct} height={isBoss ? 5 : 3} rx={1.5}
          fill={isBoss ? '#BB44FF' : hpPct > 0.5 ? '#44FF88' : hpPct > 0.25 ? '#FFCC44' : '#FF4444'}
        />
        {/* Icône de statut */}
        {statusIcon && !hitFlashTimer && (
          <SvgText
            x={x + radius + 6} y={y + 4}
            fontSize={radius * 0.9} textAnchor="start" opacity={0.9}
          >
            {statusIcon}
          </SvgText>
        )}
        {/* Nom du boss */}
        {isBoss && enemy.name && (
          <SvgText
            x={x} y={y - radius - 14}
            fontSize={10} fontWeight="bold" fill="#DDBBFF"
            textAnchor="middle" opacity={0.9}
          >
            {enemy.name}
          </SvgText>
        )}
      </G>
    </G>
  );
}

// ─── Grille décorative ────────────────────────────────────────────────────────

const GridLines = memo(({ w, h }) => {
  const lines = [];
  const step = 60;
  for (let x = 0; x <= w; x += step) {
    lines.push(<Line key={`v${x}`} x1={x} y1={0} x2={x} y2={h} stroke="rgba(255,255,255,0.03)" strokeWidth={1} />);
  }
  for (let y = 0; y <= h; y += step) {
    lines.push(<Line key={`h${y}`} x1={0} y1={y} x2={w} y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth={1} />);
  }
  return <G>{lines}</G>;
});

export default ArenaRenderer;
