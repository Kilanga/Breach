/**
 * BREACH — ArenaScreen
 * Écran de jeu principal : game loop temps réel
 */

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, AppState } from 'react-native';

import useGameStore from '../store/gameStore';
import { PALETTE, ARENA_WIDTH, ARENA_HEIGHT, BOSS_INTERVAL_SECONDS } from '../constants';
import { createInitialState, updateGame } from '../systems/gameLoop';
import { getUpgradeChoices, applySynergies, computePlayerStats } from '../systems/upgradeSystem';
import ArenaRenderer from '../components/game/ArenaRenderer';
import HUD from '../components/game/HUD';
import VirtualJoystick from '../components/game/VirtualJoystick';
import UpgradeChoiceScreen from './UpgradeChoiceScreen';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Facteur d'échelle pour adapter l'arène à l'écran
const ARENA_DISPLAY_W = Math.min(SCREEN_W, SCREEN_H);
const ARENA_DISPLAY_H = ARENA_DISPLAY_W;
const SCALE_X = ARENA_DISPLAY_W / ARENA_WIDTH;
const SCALE_Y = ARENA_DISPLAY_H / ARENA_HEIGHT;

export default function ArenaScreen() {
  const selectedShape  = useGameStore(s => s.selectedShape);
  const getStartingStats = useGameStore(s => s.getStartingStats);
  const goToGameOver   = useGameStore(s => s.goToGameOver);
  const goToVictory    = useGameStore(s => s.goToVictory);
  const endRun         = useGameStore(s => s.endRun);

  // Game state (ref pour éviter re-renders dans la loop)
  const gameStateRef = useRef(null);

  // État UI (déclenche les re-renders)
  const [uiState, setUiState] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeChoices, setUpgradeChoices] = useState([]);

  // Input joystick
  const inputRef = useRef({ dx: 0, dy: 0 });

  // RAF handle
  const rafRef     = useRef(null);
  const lastTimeRef = useRef(null);

  // Initialisation
  useEffect(() => {
    const stats = getStartingStats(selectedShape);
    gameStateRef.current = createInitialState(selectedShape, stats);
    setUiState(extractUiState(gameStateRef.current));
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Game loop
  const tick = useCallback((timestamp) => {
    if (!gameStateRef.current) return;
    if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
    const dtMs = Math.min(timestamp - lastTimeRef.current, 50); // cap à 50ms
    lastTimeRef.current = timestamp;
    const dt = dtMs / 1000;

    const s = gameStateRef.current;
    if (s.paused || s.pendingUpgrade || !s.alive) return;

    const newState = updateGame(s, dt, inputRef.current);
    gameStateRef.current = newState;

    // UI update throttled (chaque frame c'est ok, c'est juste setUiState)
    setUiState(extractUiState(newState));

    if (!newState.alive) {
      const result = endRun({
        shape: selectedShape,
        survivalTime: newState.elapsedTime,
        kills: newState.kills,
        won: false,
        activeUpgrades: newState.activeUpgrades,
      });
      goToGameOver();
      return;
    }

    // Victoire à 5 minutes
    if (newState.elapsedTime >= 300) {
      const result = endRun({
        shape: selectedShape,
        survivalTime: newState.elapsedTime,
        kills: newState.kills,
        won: true,
        activeUpgrades: newState.activeUpgrades,
      });
      goToVictory();
      return;
    }

    // Level up → afficher upgrade
    if (newState.pendingUpgrade && !showUpgrade) {
      const choices = getUpgradeChoices(newState.activeUpgrades, 3);
      setUpgradeChoices(choices);
      setShowUpgrade(true);
      gameStateRef.current = { ...newState, paused: true };
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [showUpgrade]);

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
      }
    });
    return () => sub.remove();
  }, []);

  const handleDirectionChange = useCallback((dir) => {
    inputRef.current = dir;
  }, []);

  const handleUpgradeSelect = useCallback((upgrade) => {
    const s = gameStateRef.current;
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
    }

    gameStateRef.current = {
      ...s,
      activeUpgrades: newUpgrades,
      player: newPlayer,
      pendingUpgrade: false,
      paused: false,
    };
    setShowUpgrade(false);
    lastTimeRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

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
        />
      </View>

      {/* HUD */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <HUD
          player={uiState.player}
          level={uiState.level}
          xp={uiState.xp}
          elapsedTime={uiState.elapsedTime}
          kills={uiState.kills}
          score={uiState.score}
          bossActive={uiState.bossActive}
        />
      </View>

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
          />
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
    renderState: {
      player:            s.player,
      enemies:           s.enemies,
      playerProjectiles: s.playerProjectiles,
      enemyProjectiles:  s.enemyProjectiles,
      xpOrbs:            s.xpOrbs,
      particles:         s.particles,
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
});
