/**
 * BREACH — HUD (Heads-Up Display)
 * Affiche HP, XP, niveau, timer de survie, score, kills, indicateur d'embuscade
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PALETTE, CLASS_INFO, GAME_MODE, VICTORY_TIME } from '../../constants';
import { xpForLevel } from '../../systems/gameLoop';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Calcule le bonus endless (idem waveSystem.getEnemyScaling) sans import circulaire
function endlessBonusMult(elapsedTime) {
  return Math.max(0, (elapsedTime - VICTORY_TIME) / 60) * 0.25;
}

const HUD = memo(({ player, level, xp, elapsedTime, kills, score, bossActive,
                    ambushReady, ambushTimer, gameMode }) => {
  const hpPct  = Math.max(0, Math.min(1, player.hp / player.maxHp));
  const xpNeeded = xpForLevel(level);
  const xpPct  = Math.min(1, xp / xpNeeded);
  const classInfo = CLASS_INFO[player.shape] || {};
  const classColor = classInfo.color || PALETTE.textPrimary;
  const isEndless = gameMode === GAME_MODE.ENDLESS;
  const ambushCooldown = classInfo.ambushCooldown || 4;
  const ambushPct = ambushReady ? 1 : Math.min(1, (ambushTimer || 0) / ambushCooldown);
  // Multiplicateur de difficulté en mode Endless après le timer
  const endlessBonus = isEndless ? endlessBonusMult(elapsedTime) : 0;
  const endlessMultStr = endlessBonus > 0 ? `×${(1 + endlessBonus).toFixed(2)}` : null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Header : timer + score */}
      <View style={styles.header}>
        <View style={styles.timerBox}>
          <Text style={styles.timerLabel}>⏱</Text>
          <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>
          {isEndless && <Text style={styles.endlessTag}>∞</Text>}
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.score}>{score.toLocaleString()}</Text>
        </View>
        <View style={styles.killsBox}>
          <Text style={styles.killsLabel}>⚔</Text>
          <Text style={styles.kills}>{kills}</Text>
        </View>
      </View>

      {/* Endless : indicateur du multiplicateur de difficulté */}
      {endlessMultStr && (
        <View style={styles.endlessMultRow}>
          <Text style={styles.endlessMultText}>☠ Difficulté {endlessMultStr}</Text>
        </View>
      )}

      {/* Boss indicator */}
      {bossActive && (
        <View style={styles.bossWarning}>
          <Text style={styles.bossText}>⚠ BOSS</Text>
        </View>
      )}

      {/* HP bar */}
      <View style={styles.hpContainer}>
        <View style={styles.hpBar}>
          <View style={[styles.hpFill, { width: `${hpPct * 100}%`, backgroundColor: hpPct > 0.5 ? PALETTE.hp : hpPct > 0.25 ? '#FFCC44' : '#FF4444' }]} />
        </View>
        <Text style={styles.hpText}>{Math.ceil(player.hp)}/{player.maxHp}</Text>
      </View>

      {/* XP bar + niveau */}
      <View style={styles.xpContainer}>
        <Text style={[styles.levelBadge, { backgroundColor: classColor + '33', color: classColor, borderColor: classColor }]}>
          Niv {level}
        </Text>
        <View style={styles.xpBar}>
          <View style={[styles.xpFill, { width: `${xpPct * 100}%` }]} />
        </View>
        <Text style={styles.xpText}>{xp}/{xpNeeded} XP</Text>
      </View>

      {/* Indicateur d'embuscade — Shadow uniquement */}
      {player.shape === 'shadow' && (
        <View style={styles.ambushContainer}>
          <Text style={styles.ambushLabel}>🗡 EMBUSCADE</Text>
          <View style={styles.ambushBar}>
            <View style={[styles.ambushFill, { width: `${ambushPct * 100}%`, backgroundColor: ambushReady ? '#FF6600' : '#884400' }]} />
          </View>
          {ambushReady && <Text style={styles.ambushReady}>×2</Text>}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    padding: 10,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  timerBox: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  timerLabel: { fontSize: 12, color: PALETTE.textMuted },
  timer: { fontSize: 20, fontWeight: 'bold', color: PALETTE.textPrimary, fontVariant: ['tabular-nums'] },
  scoreBox: { alignItems: 'center' },
  scoreLabel: { fontSize: 9, color: PALETTE.textMuted, letterSpacing: 1 },
  score: { fontSize: 14, fontWeight: 'bold', color: '#FFCC44' },
  killsBox: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  killsLabel: { fontSize: 12 },
  kills: { fontSize: 16, fontWeight: 'bold', color: '#FF6666' },

  bossWarning: {
    alignSelf: 'center',
    backgroundColor: '#BB44FF33',
    borderWidth: 1, borderColor: '#BB44FF',
    borderRadius: 6,
    paddingHorizontal: 16, paddingVertical: 4,
    marginBottom: 6,
  },
  bossText: { color: '#BB44FF', fontWeight: 'bold', fontSize: 13, letterSpacing: 2 },

  hpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  hpBar: {
    flex: 1, height: 10, borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  hpFill: {
    height: '100%', borderRadius: 5,
  },
  hpText: { fontSize: 10, color: PALETTE.textMuted, minWidth: 60, textAlign: 'right' },

  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  levelBadge: {
    fontSize: 10, fontWeight: 'bold',
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4, borderWidth: 1,
    minWidth: 40, textAlign: 'center',
  },
  xpBar: {
    flex: 1, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%', borderRadius: 3,
    backgroundColor: PALETTE.xp,
  },
  xpText: { fontSize: 9, color: PALETTE.textMuted, minWidth: 55, textAlign: 'right' },

  endlessTag: { fontSize: 12, color: '#BB44FF', fontWeight: 'bold', marginLeft: 4 },

  endlessMultRow: {
    alignSelf: 'center',
    backgroundColor: 'rgba(187,68,255,0.15)',
    borderRadius: 6, borderWidth: 1, borderColor: '#BB44FF55',
    paddingHorizontal: 10, paddingVertical: 2,
    marginBottom: 4,
  },
  endlessMultText: { fontSize: 11, color: '#CC88FF', fontWeight: 'bold', letterSpacing: 1 },

  ambushContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  ambushLabel: { fontSize: 9, color: '#FF6600', fontWeight: 'bold', letterSpacing: 0.5 },
  ambushBar: {
    flex: 1, height: 5, borderRadius: 2.5,
    backgroundColor: 'rgba(255,102,0,0.15)',
    overflow: 'hidden',
  },
  ambushFill: { height: '100%', borderRadius: 2.5 },
  ambushReady: { fontSize: 10, color: '#FF6600', fontWeight: 'bold', minWidth: 20, textAlign: 'right' },
});

export default HUD;
