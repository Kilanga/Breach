/**
 * BREACH — HUD (Heads-Up Display)
 * Affiche HP, XP, niveau, timer de survie, score, kills, indicateur d'embuscade
 */

import React, { memo, useRef, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { View, Text, StyleSheet, Animated } from 'react-native';
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

import { getSynergySummary } from '../../systems/upgradeSystem';

const HUD = memo(({ player, level, xp, elapsedTime, kills, score, bossActive, bossEnemy,
                    ambushReady, ambushTimer, surgeCounter, gameMode, activeUpgrades = [],
                    fontScale = 1, palette = PALETTE, weeklyEvent }) => {
      // Défi hebdomadaire actif (depuis props)
      const weekly = weeklyEvent;
    // Synergies actives (3 upgrades d'une couleur)
    const synergies = getSynergySummary(activeUpgrades).filter(s => s.active && s.count >= 3);
  // Grouper les upgrades par id pour compter les stacks
  const upgradeGroups = {};
  activeUpgrades.forEach(u => {
    if (!upgradeGroups[u.id]) upgradeGroups[u.id] = { ...u, count: 1 };
    else upgradeGroups[u.id].count++;
  });
  const upgradesList = Object.values(upgradeGroups);

  // Reliques actives (depuis player.activeRelics ou props.activeRelics)
  const relicsList = player.activeRelics || [];

  const hpPct  = Math.max(0, Math.min(1, player.hp / player.maxHp));
  const xpNeeded = xpForLevel(level);
  const xpPct  = Math.min(1, xp / xpNeeded);

  // Haptics: level-up & damage
  const prevLevel = useRef(level);
  const prevHp = useRef(player.hp);
  useEffect(() => {
    if (level > prevLevel.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    prevLevel.current = level;
  }, [level]);
  useEffect(() => {
    if (player.hp < prevHp.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    prevHp.current = player.hp;
  }, [player.hp]);

  // Animations fluides pour les barres
  const hpAnim = useRef(new Animated.Value(hpPct)).current;
  const xpAnim = useRef(new Animated.Value(xpPct)).current;
  useEffect(() => {
    Animated.timing(hpAnim, {
      toValue: hpPct,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [hpPct]);
  useEffect(() => {
    Animated.timing(xpAnim, {
      toValue: xpPct,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [xpPct]);
  const classInfo = CLASS_INFO[player.shape] || {};
  const classColor = classInfo.color || palette.textPrimary;
  const isEndless = gameMode === GAME_MODE.ENDLESS;
  const ambushCooldown = classInfo.ambushCooldown || 4;
  const ambushPct = ambushReady ? 1 : Math.min(1, (ambushTimer || 0) / ambushCooldown);
  // Surtension : prochain coup chargé
  const hasSurge  = activeUpgrades.some(u => u.id === 'surge');
  const surgeStep = ((surgeCounter || 0) % 5);
  const surgePct  = surgeStep / 5; // 0→1 vers le prochain coup ×2
  const surgeReady = surgeStep === 0 && (surgeCounter || 0) > 0;
  // Boss HP
  const bossHpPct = bossEnemy ? Math.max(0, bossEnemy.hp / bossEnemy.maxHp) : 0;
  // Multiplicateur de difficulté en mode Endless après le timer
  const endlessBonus = isEndless ? endlessBonusMult(elapsedTime) : 0;
  const endlessMultStr = endlessBonus > 0 ? `×${(1 + endlessBonus).toFixed(2)}` : null;

  // Flash visuel lors du level-up ou dégâts
  const flashAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (level > prevLevel.current || player.hp < prevHp.current) {
      flashAnim.setValue(1);
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }
  }, [level, player.hp]);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Feedback visuel synergie rare */}
      {synergies.length > 0 && (
        <View style={styles.synergyRow}>
          {synergies.map(s => (
            <View key={s.color} style={[styles.synergyBadge, { borderColor: s.color === 'red' ? '#FF3344' : s.color === 'blue' ? '#3388FF' : s.color === 'green' ? '#44FF88' : '#7B2FF2', backgroundColor: s.color === 'red' ? '#FF334422' : s.color === 'blue' ? '#3388FF22' : s.color === 'green' ? '#44FF8822' : '#7B2FF222' }] }>
              <Text style={styles.synergyText}>SYNERGIE {s.color.toUpperCase()} ×{s.count}</Text>
            </View>
          ))}
        </View>
      )}
      {/* Flash visuel lors d'un événement */}
      <Animated.View pointerEvents="none" style={[styles.flash, { opacity: flashAnim }]} />

      {/* Défi hebdomadaire actif */}
      {weekly && (
        <View style={styles.weeklyRow}>
          <Text style={styles.weeklyIcon}>{weekly.icon || '🎯'}</Text>
          <View style={styles.weeklyTexts}>
            <Text style={styles.weeklyTitle}>{weekly.name}</Text>
            <Text style={styles.weeklyDesc}>{weekly.desc}</Text>
          </View>
        </View>
      )}

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


      {/* Ligne d’icônes d’upgrades actives */}
      {upgradesList.length > 0 && (
        <View style={styles.upgradesRow}>
          {upgradesList.map(u => (
            <View key={u.id} style={[styles.upgradeIcon, { borderColor: u.color === 'red' ? '#FF3344' : u.color === 'blue' ? '#3388FF' : u.color === 'green' ? '#44FF88' : '#7B2FF2' }] }>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#fff' }}>{u.icon || u.name[0]}</Text>
              {u.count > 1 && <Text style={styles.upgradeStack}>×{u.count}</Text>}
            </View>
          ))}
        </View>
      )}

      {/* Ligne d’icônes de reliques collectées */}
      {relicsList.length > 0 && (
        <View style={styles.relicsRow}>
          {relicsList.map(r => (
            <View key={r.id} style={styles.relicIcon}>
              <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{r.icon || '🔸'}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Endless : indicateur du multiplicateur de difficulté */}
      {endlessMultStr && (
        <View style={styles.endlessMultRow}>
          <Text style={styles.endlessMultText}>☠ Difficulté {endlessMultStr}</Text>
        </View>
      )}

      {/* ── Barre de vie Boss ─────────────────────────────────────────── */}
      {bossActive && bossEnemy && (
        <View style={styles.bossBarContainer}>
          <View style={styles.bossBarHeader}>
            <Text style={styles.bossBarLabel}>⚠ {bossEnemy.name || 'BOSS'}</Text>
            <Text style={styles.bossBarHp}>{Math.ceil(bossEnemy.hp)} / {bossEnemy.maxHp}</Text>
          </View>
          <View style={styles.bossBarTrack}>
            <Animated.View style={[styles.bossBarFill, { width: `${bossHpPct * 100}%` }]} />
            {/* Segments de phase (tous les 25%) */}
            {[0.25, 0.5, 0.75].map(pct => (
              <View key={pct} style={[styles.bossBarSegment, { left: `${pct * 100}%` }]} />
            ))}
          </View>
        </View>
      )}

      {/* HP bar animée */}
      <View style={styles.hpContainer}>
        <View style={styles.hpBar}>
          <Animated.View style={[styles.hpFill, {
            width: hpAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%']
            }),
            backgroundColor: hpPct > 0.5 ? palette.hp : hpPct > 0.25 ? '#FFCC44' : '#FF4444',
          }]} />
        </View>
        <Text style={styles.hpText}>{Math.ceil(player.hp)}/{player.maxHp}</Text>
      </View>

      {/* XP bar + niveau animée */}
      <View style={styles.xpContainer}>
        <Text style={[styles.levelBadge, { backgroundColor: classColor + '33', color: classColor, borderColor: classColor }]}>
          Niv {level}
        </Text>
        <View style={styles.xpBar}>
          <Animated.View style={[styles.xpFill, {
            width: xpAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%']
            })
          }]} />
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

      {/* Indicateur Surtension */}
      {hasSurge && (
        <View style={styles.surgeContainer}>
          <Text style={styles.surgeLabel}>⚡ SURTENSION</Text>
          <View style={styles.surgeBar}>
            <View style={[styles.surgeFill, {
              width: `${surgePct * 100}%`,
              backgroundColor: surgeReady ? '#FFEE00' : '#886600',
            }]} />
            {/* 4 tirets de progression */}
            {[1,2,3,4].map(i => (
              <View key={i} style={[styles.surgeTick, { left: `${i * 20}%` }]} />
            ))}
          </View>
          {surgeReady && <Text style={styles.surgeReady}>×2 !</Text>}
          {!surgeReady && <Text style={styles.surgeCount}>{surgeStep}/5</Text>}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  weeklyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,220,0,0.13)',
    borderRadius: 8,
    padding: 7,
    marginBottom: 7,
    gap: 8,
  },
  weeklyIcon: { fontSize: 22, marginRight: 6 },
  weeklyTexts: { flex: 1 },
  weeklyTitle: { fontSize: 13, fontWeight: 'bold', color: '#7B5B00' },
  weeklyDesc: { fontSize: 11, color: '#5A4A00' },
  relicsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  relicIcon: {
    minWidth: 28,
    minHeight: 28,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255,220,0,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
    paddingHorizontal: 4,
    flexDirection: 'row',
  },
  upgradesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  upgradeIcon: {
    minWidth: 26,
    minHeight: 26,
    borderRadius: 6,
    borderWidth: 2,
    backgroundColor: 'rgba(30,30,40,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
    paddingHorizontal: 4,
    flexDirection: 'row',
  },
  upgradeStack: {
    fontSize: 11,
    color: '#FFDD44',
    fontWeight: 'bold',
    marginLeft: 2,
  },
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

  // ── Barre de vie Boss ──────────────────────────────────────────────────────
  bossBarContainer: {
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  bossBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  bossBarLabel: {
    fontSize: 11, fontWeight: 'bold', color: '#CC88FF', letterSpacing: 1,
  },
  bossBarHp: {
    fontSize: 10, color: '#BB66FF',
  },
  bossBarTrack: {
    height: 8, borderRadius: 4,
    backgroundColor: 'rgba(187,68,255,0.15)',
    borderWidth: 1, borderColor: '#BB44FF55',
    overflow: 'visible',
    position: 'relative',
  },
  bossBarFill: {
    height: '100%', borderRadius: 4,
    backgroundColor: '#BB44FF',
  },
  bossBarSegment: {
    position: 'absolute',
    top: -2, bottom: -2,
    width: 1.5,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  // ── Surtension ────────────────────────────────────────────────────────────
  surgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  surgeLabel: { fontSize: 9, color: '#FFDD00', fontWeight: 'bold', letterSpacing: 0.5 },
  surgeBar: {
    flex: 1, height: 5, borderRadius: 2.5,
    backgroundColor: 'rgba(255,220,0,0.12)',
    overflow: 'visible',
    position: 'relative',
  },
  surgeFill: { height: '100%', borderRadius: 2.5 },
  surgeTick: {
    position: 'absolute', top: -1, bottom: -1,
    width: 1, backgroundColor: 'rgba(0,0,0,0.5)',
  },
  surgeReady: { fontSize: 10, color: '#FFEE00', fontWeight: 'bold', minWidth: 24, textAlign: 'right' },
  surgeCount: { fontSize: 9, color: '#886600', minWidth: 24, textAlign: 'right' },
});

export default HUD;
