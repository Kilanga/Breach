/**
 * BREACH — Store Zustand principal
 * Slices : navigation, run temps réel, méta-progression
 */

import { create } from 'zustand';
import { subscribeWithSelector, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { createNavigationSlice } from './slices/navigationSlice';
import { createMetaSlice, INITIAL_META } from './slices/metaSlice';

const useGameStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        meta: { ...INITIAL_META },
        ...createNavigationSlice(set, get),
        ...createMetaSlice(set, get),
      }),
      {
        name: 'breach-meta-v1',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({ meta: state.meta }),
        merge: (persisted, current) => ({
          ...current,
          meta: {
            ...INITIAL_META,
            ...persisted.meta,
            shapeStats: {
              ...INITIAL_META.shapeStats,
              ...(persisted.meta?.shapeStats || {}),
            },
          },
        }),
      }
    )
  )
);

export default useGameStore;
