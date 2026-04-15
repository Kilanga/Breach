/**
 * BREACH — ArenaScreen
 * Écran de jeu principal : game loop temps réel
 */

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, AppState, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import useGameStore from '../store/gameStore';
import { PALETTE, PALETTE_DALTONISM, ARENA_WIDTH, ARENA_HEIGHT, VICTORY_TIME, GAME_MODE } from '../constants';
import { createInitialState, updateGame } from '../systems/gameLoop';
import { getUpgradeChoices, applySynergies, computePlayerStats } from '../systems/upgradeSystem';
import ArenaRenderer from '../components/game/ArenaRenderer';
import HUD from '../components/game/HUD';
import VirtualJoystick from '../components/game/VirtualJoystick';
import UpgradeChoiceScreen from './UpgradeChoiceScreen';
import TutorialOverlay from '../components/game/TutorialOverlay';
import { Card, Title, Button } from '../components/ui';
import { useT } from '../utils/i18n';
import { trackEvent } from '../utils/telemetry';
// Debug FPS HUD (dev only)
function DebugFPSHUD() {
  const [fps, setFps] = useState(0);
  const lastFrame = useRef(Date.now());
  const frameTimes = useRef([]);

  useEffect(() => {
    let running = true;
    function loop() {
      if (!running) return;
      const now = Date.now();
      const dt = now - lastFrame.current;
      lastFrame.current = now;
      frameTimes.current.push(dt);
      if (frameTimes.current.length > 30) frameTimes.current.shift();
      const avg = frameTimes.current.reduce((a, b) => a + b, 0) / frameTimes.current.length;
      setFps(Math.round(1000 / avg));
      requestAnimationFrame(loop);
    }
    loop();
    return () => { running = false; };
  }, []);

  return (
    <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }} pointerEvents="none">
      <Text style={{ color: '#66FF66', fontWeight: 'bold', fontSize: 13, fontVariant: ['tabular-nums'] }}>FPS: {fps}</Text>
    </View>
  );
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Facteur d'échelle pour adapter l'arène à l'écran
const ARENA_DISPLAY_W = Math.min(SCREEN_W, SCREEN_H);
const ARENA_DISPLAY_H = ARENA_DISPLAY_W;
const SCALE_X = ARENA_DISPLAY_W / ARENA_WIDTH;
const SCALE_Y = ARENA_DISPLAY_H / ARENA_HEIGHT;

export default function ArenaScreen() {
    // Highlight temporaire du joueur (level-up, heal)
    const [highlightPlayer, setHighlightPlayer] = useState(false);
  const t = useT();
  const selectedShape    = useGameStore(s => s.selectedShape);
  const gameMode         = useGameStore(s => s.gameMode);
  const getStartingStats = useGameStore(s => s.getStartingStats);
  const goToGameOver     = useGameStore(s => s.goToGameOver);
  const goToVictory      = useGameStore(s => s.goToVictory);
  const goToMenu         = useGameStore(s => s.goToMenu);
  const goToShapeSelect  = useGameStore(s => s.goToShapeSelect);
  const endRun           = useGameStore(s => s.endRun);
  const totalRuns        = useGameStore(s => s.meta.totalRuns);
  const sfxEnabled       = useGameStore(s => s.meta.sfxEnabled);
  const fontScale        = useGameStore(s => s.meta.largeText ? 1.35 : 1);
  const colorBlind       = useGameStore(s => s.meta.colorBlindMode);
  const palette          = colorBlind ? PALETTE_DALTONISM : PALETTE;
  // Game state (ref pour éviter re-renders dans la loop)
  const gameStateRef = useRef(null);

  // État UI (déclenche les re-renders)
  const [uiState, setUiState] = useState(null);

  // showUpgrade via ref pour ne pas recréer tick à chaque fois
  const showUpgradeRef = useRef(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeChoices, setUpgradeChoices] = useState([]);
  const [showPauseMenu, setShowPauseMenu] = useState(false);

  // sfxEnabled en ref pour lecture dans tick sans dépendance
  const sfxEnabledRef = useRef(sfxEnabled !== false);
  useEffect(() => { sfxEnabledRef.current = sfxEnabled !== false; }, [sfxEnabled]);

  // Input joystick
  const inputRef = useRef({ dx: 0, dy: 0 });

  // RAF handle
  const rafRef     = useRef(null);
  const lastTimeRef = useRef(null);

  // Tutorial au premier run
  const [showTutorial, setShowTutorial] = useState(totalRuns === 0);

  // Initialisation
  useEffect(() => {
    const stats = getStartingStats(selectedShape);
    gameStateRef.current = createInitialState(selectedShape, stats);
    setUiState(extractUiState(gameStateRef.current));
    trackEvent('run_started', { shape: selectedShape, mode: gameMode });
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Game loop — tick sans dépendance à showUpgrade (lecture via ref)
  const tick = useCallback((timestamp) => {
    if (!gameStateRef.current) return;
    if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
    const dtMs = Math.min(timestamp - lastTimeRef.current, 50); // cap à 50ms
    lastTimeRef.current = timestamp;
    const dt = dtMs / 1000;

    const s = gameStateRef.current;
    if (!s.alive) return;

    // Si un level-up est déjà en attente, ouvrir l'overlay immédiatement.
    if (s.pendingUpgrade) {
      if (!showUpgradeRef.current) {
        const choices = getUpgradeChoices(s.activeUpgrades, 3);
        if (!choices || choices.length === 0) {
          // Cas limite: plus aucun upgrade possible, afficher un fallback explicite.
          setUpgradeChoices([]);
          showUpgradeRef.current = true;
          setShowUpgrade(true);
          gameStateRef.current = { ...s, paused: true };
          trackEvent('level_up_without_choices', { level: s.level, upgrades: s.activeUpgrades.length });
          return;
        }
        setUpgradeChoices(choices);
        showUpgradeRef.current = true;
        setShowUpgrade(true);
        gameStateRef.current = { ...s, paused: true };
        trackEvent('level_up_prompt_shown', {
          level: s.level,
          choicesCount: choices.length,
          activeUpgrades: s.activeUpgrades.length,
        });
      }
      return;
    }

    if (s.paused) return;

    const prevHp    = s.player.hp;
    const prevKills = s.kills;
    const prevLevel = s.level;
    const prevBossKills = s.bossKills || 0;

    const newState = updateGame(s, dt, inputRef.current);
    gameStateRef.current = newState;

    // Highlight sur level-up ou heal
    if (newState.level > prevLevel || newState.player.hp > prevHp) {
      setHighlightPlayer(true);
    }

    // Retours haptiques
    if (sfxEnabledRef.current) {
      if (newState.player.hp < prevHp) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      } else if (newState.kills > prevKills) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    }

    // UI update
    setUiState(extractUiState(newState));
    // Reset du highlight après 700ms
    useEffect(() => {
      if (highlightPlayer) {
        const to = setTimeout(() => setHighlightPlayer(false), 700);
        return () => clearTimeout(to);
      }
    }, [highlightPlayer]);

    if (newState.level > prevLevel) {
      trackEvent('level_gained', {
        from: prevLevel,
        to: newState.level,
        elapsedTime: newState.elapsedTime,
      });
    }
    if (newState.player.hp < prevHp) {
      trackEvent('player_damaged', {
        from: prevHp,
        to: newState.player.hp,
        elapsedTime: newState.elapsedTime,
        level: newState.level,
      });
    }
    if (newState.player.hp > prevHp) {
      trackEvent('player_healed', {
        from: prevHp,
        to: newState.player.hp,
        elapsedTime: newState.elapsedTime,
        level: newState.level,
      });
    }

    if ((newState.bossKills || 0) > prevBossKills) {
      trackEvent('boss_killed', {
        bossKills: newState.bossKills || 0,
        elapsedTime: newState.elapsedTime,
        level: newState.level,
      });
    }

    if (!newState.alive) {
      trackEvent('run_ended', {
        result: 'defeat',
        shape: selectedShape,
        mode: gameMode,
        survivalTime: newState.elapsedTime,
        level: newState.level,
        kills: newState.kills,
        score: newState.score,
      });
      endRun({
        shape: selectedShape,
        survivalTime: newState.elapsedTime,
        kills: newState.kills,
        won: false,
        score: newState.score,
        level: newState.level,
        activeUpgrades: newState.activeUpgrades,
      });
      goToGameOver();
      return;
    }

    // Victoire en mode standard uniquement
    if (gameMode !== GAME_MODE.ENDLESS && newState.elapsedTime >= VICTORY_TIME) {
      trackEvent('run_ended', {
        result: 'victory',
        shape: selectedShape,
        mode: gameMode,
        survivalTime: newState.elapsedTime,
        level: newState.level,
        kills: newState.kills,
        score: newState.score,
      });
      endRun({
        shape: selectedShape,
        survivalTime: newState.elapsedTime,
        kills: newState.kills,
        won: true,
        score: newState.score,
        level: newState.level,
        activeUpgrades: newState.activeUpgrades,
      });
      goToVictory();
      return;
    }

    // Level up → afficher upgrade
    if (newState.pendingUpgrade && !showUpgradeRef.current) {
      const choices = getUpgradeChoices(newState.activeUpgrades, 3);
      if (!choices || choices.length === 0) {
        setUpgradeChoices([]);
        showUpgradeRef.current = true;
        setShowUpgrade(true);
        gameStateRef.current = { ...newState, paused: true };
        trackEvent('level_up_without_choices', { level: newState.level, upgrades: newState.activeUpgrades.length });
        return;
      }
      setUpgradeChoices(choices);
      showUpgradeRef.current = true;
      setShowUpgrade(true);
      gameStateRef.current = { ...newState, paused: true };
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []); // aucune dépendance — lecture via refs

  // Démarrer la loop quand le composant est monté
  useEffect(() => {
    if (uiState) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [tick, uiState !== null]);

  // Pause sur appState change
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (gameStateRef.current) {
        gameStateRef.current = { ...gameStateRef.current, paused: state !== 'active' };
        if (state !== 'active') {
          setShowPauseMenu(true);
        }
      }
    });
    return () => sub.remove();
  }, []);

  const handleDirectionChange = useCallback((dir) => {
    inputRef.current = dir;
  }, []);

  const handleUpgradeSelect = useCallback((upgrade) => {
    const s = gameStateRef.current;
    trackEvent('upgrade_selected', {
      id: upgrade.id,
      rarity: upgrade.rarity,
      color: upgrade.color,
      level: s.level,
      activeUpgradesBeforePick: s.activeUpgrades.length,
    });
    const newUpgrades = applySynergies([...s.activeUpgrades, upgrade]);
    const newStats = computePlayerStats(
      { attack: s.player.attack, defense: s.player.defense, maxHp: s.player.maxHp,
        speed: s.player.speed, regen: s.player.regen, hp: s.player.hp, xpPickupRadius: s.player.xpPickupRadius },
      newUpgrades
    );
    const newPlayer = { ...s.player, ...newStats };

    // overgrowth : soin si upgrade vert
    if (upgrade.color === 'green' && newUpgrades.some(u => u.id === 'overgrowth')) {
      newPlayer.hp = Math.min(newPlayer.hp + 3, newPlayer.maxHp);
      trackEvent('player_healed', {
        reason: 'overgrowth',
        to: newPlayer.hp,
        level: s.level,
      });
    }

    gameStateRef.current = {
      ...s,
      activeUpgrades: newUpgrades,
      player: newPlayer,
      pendingUpgrade: false,
      paused: false,
    };
    showUpgradeRef.current = false;
    setShowUpgrade(false);
    lastTimeRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const handleUpgradeSkip = useCallback(() => {
    const s = gameStateRef.current;
    if (!s) return;
    gameStateRef.current = {
      ...s,
      pendingUpgrade: false,
      paused: false,
    };
    showUpgradeRef.current = false;
    setShowUpgrade(false);
    setUpgradeChoices([]);
    lastTimeRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const openPauseMenu = useCallback(() => {
    const s = gameStateRef.current;
    if (!s || !s.alive || showUpgradeRef.current) return;
    gameStateRef.current = { ...s, paused: true };
    setShowPauseMenu(true);
    trackEvent('pause_menu_opened', { elapsedTime: s.elapsedTime, level: s.level });
  }, []);

  const resumeRun = useCallback(() => {
    const s = gameStateRef.current;
    if (!s) return;
    gameStateRef.current = { ...s, paused: false };
    setShowPauseMenu(false);
    lastTimeRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
    trackEvent('pause_menu_closed', { elapsedTime: s.elapsedTime, level: s.level });
  }, [tick]);

  const restartRun = useCallback(() => {
    const s = gameStateRef.current;
    trackEvent('run_abandoned', {
      reason: 'restart',
      elapsedTime: s?.elapsedTime || 0,
      level: s?.level || 1,
      kills: s?.kills || 0,
      score: s?.score || 0,
    });
    setShowPauseMenu(false);
    goToShapeSelect();
  }, [goToShapeSelect]);

  const quitToMenu = useCallback(() => {
    const s = gameStateRef.current;
    trackEvent('run_abandoned', {
      reason: 'quit_menu',
      elapsedTime: s?.elapsedTime || 0,
      level: s?.level || 1,
      kills: s?.kills || 0,
      score: s?.score || 0,
    });
    setShowPauseMenu(false);
    goToMenu();
  }, [goToMenu]);

  if (!uiState) return <View style={styles.root} />;

  return (
    <View style={styles.root}>
      {/* Arena */}
      <View style={styles.arenaContainer}>
        <ArenaRenderer
          gameState={uiState.renderState}
          arenaWidth={ARENA_WIDTH}
          arenaHeight={ARENA_HEIGHT}
          scaleX={SCALE_X}
          scaleY={SCALE_Y}
          palette={palette}
          highlightPlayer={highlightPlayer}
        />
      </View>

      {/* HUD */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {typeof __DEV__ !== 'undefined' && __DEV__ && <DebugFPSHUD />}
        <HUD
          player={uiState.player}
          level={uiState.level}
          xp={uiState.xp}
          elapsedTime={uiState.elapsedTime}
          kills={uiState.kills}
          score={uiState.score}
          bossActive={uiState.bossActive}
          ambushReady={uiState.ambushReady}
          ambushTimer={uiState.ambushTimer}
          gameMode={gameMode}
          fontScale={fontScale}
          palette={palette}
        />
      </View>

      {/* Tutorial premier run */}
      {showTutorial && (
        <TutorialOverlay onDismiss={() => setShowTutorial(false)} />
      )}

      {/* Bouton pause */}
      {!showUpgrade && (
        <TouchableOpacity style={styles.pauseBtn} onPress={openPauseMenu} activeOpacity={0.85}>
          <Text style={styles.pauseBtnText}>II</Text>
        </TouchableOpacity>
      )}

      {/* Joystick */}
      <View style={styles.joystickContainer} pointerEvents="box-none">
        <VirtualJoystick onDirectionChange={handleDirectionChange} />
      </View>

      {/* Upgrade choice overlay */}
      {showUpgrade && (
        <View style={StyleSheet.absoluteFill}>
          <UpgradeChoiceScreen
            choices={upgradeChoices}
            activeUpgrades={gameStateRef.current?.activeUpgrades || []}
            level={uiState.level}
            onSelect={handleUpgradeSelect}
            onSkip={handleUpgradeSkip}
            colorBlindMode={colorBlind}
          />
        </View>
      )}

      {/* Pause overlay */}
      {showPauseMenu && !showUpgrade && (
        <View style={styles.pauseOverlay}>
          <Card style={{ alignItems: 'center', width: 300, gap: 14, padding: 24 }}>
            <Title style={{ fontSize: 24, color: palette.textPrimary, marginBottom: 8 }}>{t('pause_title') || 'PAUSE'}</Title>
            <Button label={t('pause_resume') || 'Reprendre'} primary onPress={resumeRun} style={{ marginBottom: 8 }} />
            <Button label={t('pause_restart') || 'Recommencer'} onPress={restartRun} style={{ marginBottom: 8 }} />
            <Button label={t('pause_quit') || 'Quitter vers menu'} onPress={quitToMenu} style={{ backgroundColor: '#2A1A1A', borderColor: '#FF4455' }} />
          </Card>
        </View>
      )}
    </View>
  );
}

// Extrait les données nécessaires au rendu UI depuis le game state
function extractUiState(s) {
  return {
    player: {
      x: s.player.x, y: s.player.y,
      hp: s.player.hp, maxHp: s.player.maxHp,
      shape: s.player.shape,
      shieldActive: s.player.shieldActive,
      invincibleTimer: s.player.invincibleTimer,
      attack: s.player.attack,
      defense: s.player.defense,
      speed: s.player.speed,
    },
    level:       s.level,
    xp:          s.xp,
    elapsedTime: s.elapsedTime,
    kills:       s.kills,
    score:       s.score,
    bossActive:  s.enemies.some(e => e.isBoss),
    ambushReady: s.ambushReady,
    ambushTimer: s.ambushTimer,
    renderState: {
      player:            s.player,
      enemies:           s.enemies,
      playerProjectiles: s.playerProjectiles,
      enemyProjectiles:  s.enemyProjectiles,
      xpOrbs:            s.xpOrbs,
      particles:         s.particles,
      activeUpgrades:    s.activeUpgrades,    // pour les auras visuelles
      chainBoostActive:  s.attackBoostTimer > 0, // chain_reaction boost en cours
    },
  };
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PALETTE.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arenaContainer: {
    width:  ARENA_DISPLAY_W,
    height: ARENA_DISPLAY_H,
    overflow: 'hidden',
    borderRadius: 8,
  },
  joystickContainer: {
    position: 'absolute',
    bottom: 40,
    left: 30,
  },
  pauseBtn: {
    position: 'absolute',
    top: 38,
    right: 18,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(10,10,15,0.8)',
    borderWidth: 1,
    borderColor: PALETTE.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBtnText: {
    color: PALETTE.textPrimary,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  pausePanel: {
    width: Math.min(SCREEN_W - 40, 360),
    backgroundColor: PALETTE.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PALETTE.borderLight,
    padding: 18,
    gap: 10,
  },
  pauseTitle: {
    color: PALETTE.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  pauseActionBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: PALETTE.borderLight,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  pauseDangerBtn: {
    borderColor: '#FF4455AA',
    backgroundColor: 'rgba(255,68,85,0.12)',
  },
  pauseActionText: {
    color: PALETTE.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
