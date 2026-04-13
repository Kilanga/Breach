/**
 * BREACH — Slice navigation (phases de jeu)
 */

import { GAME_PHASES, GAME_MODE } from '../../constants';

export function createNavigationSlice(set, get) {
  return {
    phase: GAME_PHASES.MENU,

    // Paramètres du run en cours
    selectedShape: 'triangle',
    gameMode: GAME_MODE.STANDARD,
    runStartedAt: null,

    setPhase: (phase) => set({ phase }),

    goToMenu: () => set({ phase: GAME_PHASES.MENU }),

    startRun: (shape, mode = GAME_MODE.STANDARD) => set({
      phase: GAME_PHASES.ARENA,
      selectedShape: shape,
      gameMode: mode,
      runStartedAt: Date.now(),
    }),

    goToShapeSelect: () => set({ phase: GAME_PHASES.SHAPE_SELECT }),
    goToUpgradeChoice: () => set({ phase: GAME_PHASES.UPGRADE_CHOICE }),
    goToGameOver: () => set({ phase: GAME_PHASES.GAME_OVER }),
    goToVictory: () => set({ phase: GAME_PHASES.VICTORY }),
    goToAchievements: () => set({ phase: GAME_PHASES.ACHIEVEMENTS }),
    goToSettings: () => set({ phase: GAME_PHASES.SETTINGS }),
    goToTalentTree: () => set({ phase: GAME_PHASES.TALENT_TREE }),
  };
}
