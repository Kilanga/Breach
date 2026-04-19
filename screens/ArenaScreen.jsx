import RelicNotification from '../components/game/RelicNotification';
/**
 * BREACH — ArenaScreen
 * Écran de jeu principal : game loop temps réel
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import { Animated } from 'react-native';
import { View, Text, StyleSheet, Dimensions, AppState, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import useGameStore from '../store/gameStore';
import { PALETTE, PALETTE_DALTONISM, ARENA_WIDTH, ARENA_HEIGHT, VICTORY_TIME, GAME_MODE } from '../constants';
import MutationBar from '../components/MutationBar';
import { createInitialState, updateGame } from '../systems/gameLoop';
import { getUpgradeChoices, applySynergies, computePlayerStats } from '../systems/upgradeSystem';
import ArenaRenderer from '../components/game/ArenaRenderer';
import HUD from '../components/game/HUD';
import UpgradeTreeOverlay from '../components/game/UpgradeTreeOverlay';
import VirtualJoystick from '../components/game/VirtualJoystick';
import UpgradeChoiceScreen from './UpgradeChoiceScreen';
import TutorialOverlay from '../components/game/TutorialOverlay';
import { Card, Title, Body, Button } from '../components/ui';
import { ScrollView } from 'react-native';
import { trackEvent } from '../utils/telemetry';
import BossBar from '../components/game/BossBar';
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
      // Overlay arbre d'upgrades
      const [showUpgradeTree, setShowUpgradeTree] = useState(false);
    // Notification de relique
    const [relicNotif, setRelicNotif] = useState(null);
  const insets = useSafeAreaInsets();
  // Highlight temporaire du joueur (level-up, heal)
  const [highlightPlayer, setHighlightPlayer] = useState(false);
  // Animation de secousse de l'arène
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const selectedShape    = useGameStore(s => s.selectedShape);
  const gameMode         = useGameStore(s => s.gameMode);
  const getStartingStats = useGameStore(s => s.getStartingStats);
  const goToGameOver     = useGameStore(s => s.goToGameOver);
  const goToVictory      = useGameStore(s => s.goToVictory);
  const goToMenu         = useGameStore(s => s.goToMenu);
  const goToShapeSelect  = useGameStore(s => s.goToShapeSelect);
  const endRun           = useGameStore(s => s.endRun);
  const totalRuns          = useGameStore(s => s.meta.totalRuns);
  const permanentUpgrades  = useGameStore(s => s.meta.permanentUpgrades || []);
  const sfxEnabled         = useGameStore(s => s.meta.sfxEnabled);
  const fontScale        = useGameStore(s => s.meta.largeText ? 1.35 : 1);
  const colorBlind       = useGameStore(s => s.meta.colorBlindMode);
  const palette          = colorBlind ? PALETTE_DALTONISM : PALETTE;
  // Game state (ref pour éviter re-renders dans la loop)
  const gameStateRef = useRef(null);

  // État UI (déclenche les re-renders)
  const [uiState, setUiState] = useState(null);

  // Déclencheur pour highlight temporaire du joueur
  useEffect(() => {
    if (highlightPlayer) {
      const to = setTimeout(() => setHighlightPlayer(false), 700);
      return () => clearTimeout(to);
    }
  }, [highlightPlayer]);

  // showUpgrade via ref pour ne pas recréer tick à chaque fois
  const showUpgradeRef = useRef(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeChoices, setUpgradeChoices] = useState([]);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [confirmQuit, setConfirmQuit] = useState(null); // null | 'restart' | 'menu'

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
    gameStateRef.current = createInitialState(selectedShape, stats, permanentUpgrades);
    setUiState(extractUiState(gameStateRef.current));
    trackEvent('run_started', { shape: selectedShape, mode: gameMode });
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Game loop — tick sans dépendance à showUpgrade (lecture via ref)
  const tick = useCallback((timestamp) => {
    if (!gameStateRef.current) return;
    const s = gameStateRef.current;
    if (!s || !s.player) return;
    // Synchronise paused avec showPauseMenu
    if (showPauseMenu && !gameStateRef.current.paused) {
      gameStateRef.current = { ...gameStateRef.current, paused: true };
    }
    if (!showPauseMenu && gameStateRef.current.paused) {
      gameStateRef.current = { ...gameStateRef.current, paused: false };
    }
    if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
    const dtMs = Math.min(timestamp - lastTimeRef.current, 50); // cap à 50ms
    lastTimeRef.current = timestamp;
    const dt = dtMs / 1000;

    // ...existing code...
    if (!s.alive) return;

    // Si un level-up est déjà en attente, ouvrir l'overlay immédiatement.
    if (s.pendingUpgrade) {
      if (!showUpgradeRef.current) {
        const choices = getUpgradeChoices(s.activeUpgrades, 3);
        if (!choices || choices.length === 0) {
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

    const prevRelics = (s.activeRelics || []).map(r => r.id);
    const newState = updateGame(s, dt, inputRef.current);
    // Détection d'une nouvelle relique obtenue
    const newRelic = (newState.activeRelics || []).find(r => !prevRelics.includes(r.id));
    if (newRelic) {
      setRelicNotif(newRelic);
      if (sfxEnabledRef.current) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    gameStateRef.current = newState;

    // Highlight sur level-up ou heal
    if (newState.level > prevLevel || newState.player.hp > prevHp) {
      setHighlightPlayer(true);
    }

    // Animation de secousse si dégâts reçus
    if (newState.player.hp < prevHp) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
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
  }, [showPauseMenu]); // dépendance sur showPauseMenu pour synchronisation

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
    setUpgradeChoices([]);
    lastTimeRef.current = null;
    // Annule et relance la boucle
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
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
    // Annule et relance la boucle
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
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
    // Toujours relancer la boucle
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
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

  // Shake effect: translation X/Y pseudo-aléatoire
  const shake = shakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-8, 0, 8],
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}> 
      {/* MutationBar: affiche les mutations actives de la run */}
      {gameStateRef.current?.activeMutations && gameStateRef.current.activeMutations.length > 0 && (
        <View style={{ position: 'absolute', top: 8, left: 0, right: 0, zIndex: 20, alignItems: 'center' }} pointerEvents="none">
          <MutationBar mutations={gameStateRef.current.activeMutations} />
        </View>
      )}
      {/* BossBar affichée si boss actif */}
      {uiState.bossActive && uiState.bossEnemy && <BossBar boss={uiState.bossEnemy} />}
      {/* Arena avec shake, respecte la safe zone en haut */}
      <Animated.View style={[styles.arenaContainer, { transform: [
        { translateX: shake },
        { translateY: shakeAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [6, 0, -6] }) },
      ] }] }>
        <ArenaRenderer
          gameState={uiState.renderState}
          arenaWidth={ARENA_WIDTH}
          arenaHeight={ARENA_HEIGHT}
          scaleX={SCALE_X}
          scaleY={SCALE_Y}
          palette={palette}
          highlightPlayer={highlightPlayer || showTutorial}
          zoom={1.25}
          centerOnPlayer={true}
          obstacles={uiState.obstacles || []}
        />
        {/* Surbrillance joueur pendant le tutoriel */}
        {showTutorial && (
          <View pointerEvents="none" style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 80,
            height: 80,
            marginLeft: -40,
            marginTop: -40,
            borderRadius: 40,
            borderWidth: 3,
            borderColor: '#00E0FF',
            opacity: 0.5,
            zIndex: 10,
          }} />
        )}
      </Animated.View>

      {/* HUD + Notification relique */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {typeof __DEV__ !== 'undefined' && __DEV__ && <DebugFPSHUD />}
        <HUD
          player={uiState.player}
          level={uiState.level}
          xp={uiState.xp}
          elapsedTime={uiState.elapsedTime}
          kills={uiState.kills}
          score={uiState.score}
          bossActive={uiState.bossActive}
          bossEnemy={uiState.bossEnemy}
          ambushReady={uiState.ambushReady}
          ambushTimer={uiState.ambushTimer}
          surgeCounter={uiState.surgeCounter}
          gameMode={gameMode}
          fontScale={fontScale}
          palette={palette}
          activeUpgrades={gameStateRef.current?.activeUpgrades || []}
          activeRelics={gameStateRef.current?.activeRelics || []}
          weeklyEvent={gameStateRef.current?.weeklyEvent}
          killStreak={uiState.killStreak || 0}
          onShowUpgradeTree={() => setShowUpgradeTree(true)}
        />
        {relicNotif && (
          <RelicNotification relic={relicNotif} onHide={() => setRelicNotif(null)} />
        )}
        {showUpgradeTree && (
          <UpgradeTreeOverlay
            upgrades={gameStateRef.current?.activeUpgrades || []}
            onClose={() => setShowUpgradeTree(false)}
            colorBlindMode={colorBlind}
          />
        )}
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
        <View style={showTutorial ? styles.joystickHighlight : null}>
          <VirtualJoystick onDirectionChange={handleDirectionChange} />
        </View>
        {/* Surbrillance joystick pendant le tutoriel */}
        {showTutorial && (
          <View pointerEvents="none" style={styles.joystickGlow} />
        )}
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
          {confirmQuit ? (
            <Card style={{ alignItems: 'center', width: 300, gap: 12, padding: 24 }}>
              <Title style={{ fontSize: 18, color: '#FF4455', textAlign: 'center' }}>
                {confirmQuit === 'restart' ? 'Recommencer la run ?' : 'Quitter vers le menu ?'}
              </Title>
              <Body style={{ fontSize: 12, color: PALETTE.textDim, textAlign: 'center' }}>
                Ta progression de cette run sera perdue.
              </Body>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                <Button label="Annuler" onPress={() => setConfirmQuit(null)} style={{ flex: 1 }} />
                <Button
                  label="Confirmer"
                  primary
                  onPress={confirmQuit === 'restart' ? restartRun : quitToMenu}
                  style={{ flex: 1, backgroundColor: '#FF4455', borderColor: '#FF4455' }}
                />
              </View>
            </Card>
          ) : (
            <Card style={{ width: 320, padding: 20, gap: 0 }}>
              <Title style={{ fontSize: 22, textAlign: 'center', marginBottom: 14 }}>⏸ PAUSE</Title>

              {/* Stats en temps réel */}
              {uiState && (
                <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 10, marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Body style={{ fontSize: 11, color: PALETTE.textDim }}>Temps</Body>
                    <Body style={{ fontSize: 11, color: PALETTE.textPrimary, fontWeight: 'bold' }}>
                      {Math.floor((uiState.elapsedTime || 0) / 60)}:{String(Math.floor((uiState.elapsedTime || 0) % 60)).padStart(2, '0')}
                    </Body>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Body style={{ fontSize: 11, color: PALETTE.textDim }}>Niveau</Body>
                    <Body style={{ fontSize: 11, color: '#FFCC44', fontWeight: 'bold' }}>{uiState.level || 1}</Body>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Body style={{ fontSize: 11, color: PALETTE.textDim }}>Kills</Body>
                    <Body style={{ fontSize: 11, color: PALETTE.textPrimary, fontWeight: 'bold' }}>{uiState.kills || 0}</Body>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Body style={{ fontSize: 11, color: PALETTE.textDim }}>Score</Body>
                    <Body style={{ fontSize: 11, color: '#BB88FF', fontWeight: 'bold' }}>{(uiState.score || 0).toLocaleString()}</Body>
                  </View>
                </View>
              )}

              {/* Upgrades actives */}
              {uiState?.renderState?.activeUpgrades?.length > 0 && (
                <View style={{ marginBottom: 12 }}>
                  <Body style={{ fontSize: 10, color: PALETTE.textDim, letterSpacing: 1, marginBottom: 6 }}>— UPGRADES ACTIVES —</Body>
                  <ScrollView style={{ maxHeight: 110 }} showsVerticalScrollIndicator={false}>
                    {Object.entries(
                      uiState.renderState.activeUpgrades.reduce((acc, u) => {
                        acc[u.id] = { u, count: (acc[u.id]?.count || 0) + 1 };
                        return acc;
                      }, {})
                    ).map(([id, { u, count }]) => (
                      <View key={id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Body style={{ fontSize: 13 }}>{u.icon || '▪'}</Body>
                        <Body style={{ fontSize: 11, color: PALETTE.textPrimary, flex: 1 }}>{u.name}</Body>
                        {count > 1 && <Body style={{ fontSize: 10, color: '#FFCC44' }}>×{count}</Body>}
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Boutons */}
              <Button label="▶ Reprendre" primary onPress={resumeRun} style={{ marginBottom: 8 }} />
              <Button label="↺ Recommencer" onPress={() => setConfirmQuit('restart')} style={{ marginBottom: 8 }} />
              <Button
                label="← Menu principal"
                onPress={() => setConfirmQuit('menu')}
                style={{ backgroundColor: '#1A0A0A', borderColor: '#FF445566' }}
              />
            </Card>
          )}
        </View>
      )}
    </View>
  );
}

// Extrait les données nécessaires au rendu UI depuis le game state
function extractUiState(s) {
  if (!s || !s.player) return null;
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
      activeRelics: s.activeRelics || [],
    },
    level:       s.level,
    xp:          s.xp,
    elapsedTime: s.elapsedTime,
    kills:       s.kills,
    score:       s.score,
    bossActive:  s.enemies?.some(e => e.isBoss),
    bossEnemy:   s.enemies?.find(e => e.isBoss) || null,
    ambushReady: s.ambushReady,
    ambushTimer: s.ambushTimer,
    surgeCounter: s.surgeCounter || 0,
    killStreak:  s.killStreak  || 0,
    enemies:     s.enemies,
    obstacles:   s.obstacles || [],
    renderState: {
      ...s,
      obstacles: s.obstacles || [],
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
  joystickHighlight: {
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFD700',
    padding: 2,
    backgroundColor: 'rgba(255,255,0,0.08)',
  },
  joystickGlow: {
    position: 'absolute',
    left: -10,
    top: -10,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,215,0,0.18)',
    zIndex: 5,
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
