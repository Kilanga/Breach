/**
 * BREACH — App.jsx
 * Point d'entrée : routage basé sur la phase du store
 */

import React, { useEffect, useRef } from 'react';
import * as Sentry from '@sentry/react-native';
import { SENTRY_DSN } from './sentry.config';
import { loadMeta, saveMeta } from './services/cloudSave';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Animated } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useGameStore from './store/gameStore';
import { GAME_PHASES, PALETTE } from './constants';
import ErrorBoundary from './components/ErrorBoundary';

import MenuScreen         from './screens/MenuScreen';
import ShapeSelectScreen  from './screens/ShapeSelectScreen';
import ArenaScreen        from './screens/ArenaScreen';
import GameOverScreen     from './screens/GameOverScreen';
import VictoryScreen      from './screens/VictoryScreen';
import AchievementsScreen from './screens/AchievementsScreen';
import SettingsScreen     from './screens/SettingsScreen';
import TalentTreeScreen   from './screens/TalentTreeScreen';
import TutorialScreen     from './screens/TutorialScreen';

// Regroupe les phases pour détecter les transitions d'écran
function screenGroup(phase) {
  if (phase === GAME_PHASES.ARENA || phase === GAME_PHASES.UPGRADE_CHOICE) return 'arena';
  return phase;
}

// Initialisation Sentry (une seule fois)
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.2,
    enableAutoSessionTracking: true,
  });
}

export default function App() {
  const phase = useGameStore(s => s.phase);
  const meta = useGameStore(s => s.meta);
  const setMeta = useGameStore(s => s.setState);

  // Chargement cloud au démarrage
  useEffect(() => {
    (async () => {
      const remoteMeta = await loadMeta();
      if (remoteMeta) setMeta(state => ({ meta: { ...state.meta, ...remoteMeta } }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync cloud à chaque modif locale
  useEffect(() => {
    if (meta) saveMeta(meta).catch(() => {});
  }, [meta]);

  // Fondu noir entre les écrans
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const prevGroup = useRef(screenGroup(phase));

  useEffect(() => {
    const newGroup = screenGroup(phase);
    if (newGroup === prevGroup.current) return;
    prevGroup.current = newGroup;
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [phase]);

  const renderScreen = () => {
    switch (phase) {
      case GAME_PHASES.MENU:           return <MenuScreen />;
      case GAME_PHASES.SHAPE_SELECT:   return <ShapeSelectScreen />;
      case GAME_PHASES.ARENA:          return <ArenaScreen />;
      case GAME_PHASES.UPGRADE_CHOICE: return <ArenaScreen />; // géré en overlay
      case GAME_PHASES.GAME_OVER:      return <GameOverScreen />;
      case GAME_PHASES.VICTORY:        return <VictoryScreen />;
      case GAME_PHASES.ACHIEVEMENTS:   return <AchievementsScreen />;
      case GAME_PHASES.SETTINGS:       return <SettingsScreen />;
      case GAME_PHASES.TALENT_TREE:    return <TalentTreeScreen />;
      case GAME_PHASES.TUTORIAL:       return <TutorialScreen />;
      case GAME_PHASES.LEADERBOARD: {
        const LeaderboardScreen = require('./screens/LeaderboardScreen').default;
        return <LeaderboardScreen />;
      }
      default:                         return <MenuScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <View style={styles.root}>
          <StatusBar style="light" backgroundColor={PALETTE.bg} />
          {renderScreen()}
          {/* Fondu noir de transition */}
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { backgroundColor: '#000', opacity: fadeAnim }]}
          />
        </View>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PALETTE.bg,
  },
});
