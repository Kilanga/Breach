/**
 * BREACH — Joystick virtuel
 * PanResponder pour détecter la direction de déplacement
 */

import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';

const STICK_RADIUS = 50;
const BASE_RADIUS  = 70;

export default function VirtualJoystick({ onDirectionChange, style }) {
  const stickPos = useRef({ x: 0, y: 0 });
  const baseCenter = useRef({ x: 0, y: 0 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,

      onPanResponderGrant: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        baseCenter.current = { x: pageX, y: pageY };
        stickPos.current   = { x: 0, y: 0 };
        onDirectionChange({ dx: 0, dy: 0 });
      },

      onPanResponderMove: (_, gestureState) => {
        let dx = gestureState.dx;
        let dy = gestureState.dy;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > STICK_RADIUS) {
          dx = (dx / len) * STICK_RADIUS;
          dy = (dy / len) * STICK_RADIUS;
        }
        stickPos.current = { x: dx, y: dy };
        onDirectionChange({ dx: (dx / STICK_RADIUS), dy: (dy / STICK_RADIUS) });
      },

      onPanResponderRelease: () => {
        stickPos.current = { x: 0, y: 0 };
        onDirectionChange({ dx: 0, dy: 0 });
      },

      onPanResponderTerminate: () => {
        stickPos.current = { x: 0, y: 0 };
        onDirectionChange({ dx: 0, dy: 0 });
      },
    })
  ).current;

  return (
    <View style={[styles.base, style]} {...panResponder.panHandlers}>
      <View style={styles.ring} />
      <JoystickDot stickPos={stickPos} />
    </View>
  );
}

// Composant séparé pour le dot (pour éviter trop de re-renders)
function JoystickDot({ stickPos }) {
  return (
    <View
      style={[
        styles.stick,
        { transform: [{ translateX: stickPos.current?.x || 0 }, { translateY: stickPos.current?.y || 0 }] },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    width:           BASE_RADIUS * 2,
    height:          BASE_RADIUS * 2,
    borderRadius:    BASE_RADIUS,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth:     2,
    borderColor:     'rgba(255,255,255,0.15)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  ring: {
    position:        'absolute',
    width:           BASE_RADIUS * 2 - 8,
    height:          BASE_RADIUS * 2 - 8,
    borderRadius:    BASE_RADIUS,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.08)',
  },
  stick: {
    width:           STICK_RADIUS * 1.1,
    height:          STICK_RADIUS * 1.1,
    borderRadius:    STICK_RADIUS,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth:     2,
    borderColor:     'rgba(255,255,255,0.5)',
  },
});
