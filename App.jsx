/**
 * BREACH — App.jsx
 * Point d'entrée : routage basé sur la phase du store
 */

import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Animated } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useGameStore from './store/gameStore';
import { GAME_PHASES, PALETTE } from './constants';

import MenuScreen         from './screens/MenuScreen';
import ShapeSelectScreen  from './screens/ShapeSelectScreen';
import ArenaScreen        from './screens/ArenaScreen';
import GameOverScreen     from './screens/GameOverScreen';
import VictoryScreen      from './screens/VictoryScreen';
import AchievementsScreen from './screens/AchievementsScreen';
import SettingsScreen     from './screens/SettingsScreen';
import TalentTreeScreen   from './screens/TalentTreeScreen';

// Regroupe les phases pour détecter les transitions d'écran
function screenGroup(phase) {
  if (phase === GAME_PHASES.ARENA || phase === GAME_PHASES.UPGRADE_CHOICE) return 'arena';
  return phase;
}

export default function App() {
  const phase = useGameStore(s => s.phase);

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
      default:                         return <MenuScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="light" backgroundColor={PALETTE.bg} />
        {renderScreen()}
        {/* Fondu noir de transition */}
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: '#000', opacity: fadeAnim }]}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PALETTE.bg,
  },
});
