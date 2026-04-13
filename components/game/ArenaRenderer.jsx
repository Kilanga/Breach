/**
 * BREACH — Renderer de l'arène (SVG)
 * Dessine : joueur, ennemis, projectiles, orbes XP, particules
 */

import React, { memo } from 'react';
import Svg, { Circle, Polygon, Rect, G, Line, Ellipse, Text as SvgText } from 'react-native-svg';
import { PALETTE, CLASS_INFO, PLAYER_RADIUS } from '../../constants';

const ArenaRenderer = memo(({ gameState, arenaWidth, arenaHeight, scaleX, scaleY }) => {
  if (!gameState) return null;
  const { player, enemies, playerProjectiles, enemyProjectiles, xpOrbs, particles } = gameState;

  const sx = scaleX || 1;
  const sy = scaleY || 1;
  const vw = arenaWidth  * sx;
  const vh = arenaHeight * sy;

  return (
    <Svg width={vw} height={vh} viewBox={`0 0 ${arenaWidth} ${arenaHeight}`}>
      {/* Fond */}
      <Rect x={0} y={0} width={arenaWidth} height={arenaHeight} fill={PALETTE.bg} />
      {/* Grille décorative */}
      <GridLines w={arenaWidth} h={arenaHeight} />

      {/* XP orbs */}
      {xpOrbs.map(orb => (
        <Circle key={orb.id} cx={orb.x} cy={orb.y} r={orb.radius} fill={PALETTE.xp} opacity={0.9} />
      ))}

      {/* Particules */}
      {particles.map(p => (
        <Circle
          key={p.id}
          cx={p.x} cy={p.y}
          r={p.radius * (p.life / p.maxLife)}
          fill={p.color}
          opacity={p.life / p.maxLife}
        />
      ))}

      {/* Projectiles ennemis */}
      {enemyProjectiles.map(p => (
        <Circle key={p.id} cx={p.x} cy={p.y} r={p.radius} fill={p.color} opacity={0.85} />
      ))}

      {/* Projectiles joueur */}
      {playerProjectiles.map(p => (
        p.aoe ? (
          <Circle key={p.id} cx={p.x} cy={p.y} r={p.radius} fill={p.color} opacity={0.25} />
        ) : (
          <Circle key={p.id} cx={p.x} cy={p.y} r={p.radius} fill={p.color} opacity={0.95} />
        )
      ))}

      {/* Ennemis */}
      {enemies.map(e => <EnemyShape key={e.id} enemy={e} />)}

      {/* Joueur */}
      <PlayerShape player={player} />
    </Svg>
  );
});

// ─── Joueur ───────────────────────────────────────────────────────────────────

function PlayerShape({ player }) {
  const { x, y, shape, hp, maxHp, shieldActive, invincibleTimer } = player;
  const color = CLASS_INFO[shape]?.color || '#FFFFFF';
  const opacity = invincibleTimer > 0 ? 0.5 : 1;

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
  const { x, y, radius, color, hp, maxHp, isBoss, freezeTimer, burnTimer, stunTimer } = enemy;
  const hpPct = Math.max(0, hp / maxHp);

  // Couleur modifiée si statut
  let displayColor = color;
  let overlayColor = null;
  if (freezeTimer > 0) overlayColor = '#44CCFF';
  if (burnTimer   > 0) overlayColor = '#FF6600';
  if (stunTimer   > 0) overlayColor = '#AAAAAA';

  return (
    <G>
      <Circle cx={x} cy={y} r={radius} fill={displayColor} opacity={0.9} />
      {overlayColor && <Circle cx={x} cy={y} r={radius} fill={overlayColor} opacity={0.35} />}
      {/* HP bar */}
      <Rect x={x - radius} y={y - radius - 8} width={radius * 2} height={3} rx={1.5} fill="rgba(255,255,255,0.15)" />
      <Rect x={x - radius} y={y - radius - 8} width={radius * 2 * hpPct} height={3} rx={1.5} fill={hpPct > 0.5 ? '#44FF88' : '#FF4444'} />
      {/* Badge boss */}
      {isBoss && (
        <Circle cx={x} cy={y} r={radius + 5} fill="none" stroke="#BB44FF" strokeWidth={2} strokeDasharray="8,4" />
      )}
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
