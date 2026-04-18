/**
 * BREACH — Joystick virtuel
 * Animated.ValueXY pour le rendu fluide du stick.
 * Zone morte de 12% pour éviter le drift au repos.
 */

import React, { useRef } from 'react';
import { View, StyleSheet, PanResponder, Animated } from 'react-native';

const STICK_RADIUS = 50;
const BASE_RADIUS  = 70;
const DEAD_ZONE    = 0.12; // 12% de rayon = zone insensible

export default function VirtualJoystick({ onDirectionChange, style }) {
  const stickAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  // Ref pour éviter les closures périmées dans PanResponder
  const onDirRef = useRef(onDirectionChange);
  onDirRef.current = onDirectionChange;

  const springBack = () => {
    Animated.spring(stickAnim, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      friction: 6,
      tension: 80,
    }).start();
    onDirRef.current({ dx: 0, dy: 0 });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,

      onPanResponderGrant: () => {
        stickAnim.setValue({ x: 0, y: 0 });
        onDirRef.current({ dx: 0, dy: 0 });
      },

      onPanResponderMove: (_, gs) => {
        let dx = gs.dx;
        let dy = gs.dy;
        const len = Math.sqrt(dx * dx + dy * dy);
        // Clamp dans le rayon du stick
        if (len > STICK_RADIUS) {
          dx = (dx / len) * STICK_RADIUS;
          dy = (dy / len) * STICK_RADIUS;
        }
        stickAnim.setValue({ x: dx, y: dy });

        // Zone morte : normaliser et ignorer si trop petit
        const ndx = dx / STICK_RADIUS;
        const ndy = dy / STICK_RADIUS;
        const nlen = Math.sqrt(ndx * ndx + ndy * ndy);
        if (nlen < DEAD_ZONE) {
          onDirRef.current({ dx: 0, dy: 0 });
        } else {
          // Remapper pour que la zone morte ne se sente pas
          const scaled = (nlen - DEAD_ZONE) / (1 - DEAD_ZONE);
          onDirRef.current({ dx: (ndx / nlen) * scaled, dy: (ndy / nlen) * scaled });
        }
      },

      onPanResponderRelease:   springBack,
      onPanResponderTerminate: springBack,
    })
  ).current;

  return (
    <View style={[styles.base, style]} {...panResponder.panHandlers}>
      <View style={styles.ring} />
      <View style={styles.crossH} />
      <View style={styles.crossV} />
      <Animated.View
        style={[
          styles.stick,
          { transform: [{ translateX: stickAnim.x }, { translateY: stickAnim.y }] },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    width:           BASE_RADIUS * 2,
    height:          BASE_RADIUS * 2,
    borderRadius:    BASE_RADIUS,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth:     2,
    borderColor:     'rgba(255,255,255,0.18)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  ring: {
    position:     'absolute',
    width:        STICK_RADIUS * 2,
    height:       STICK_RADIUS * 2,
    borderRadius: STICK_RADIUS,
    borderWidth:  1,
    borderColor:  'rgba(255,255,255,0.12)',
  },
  // Croix de repère central
  crossH: {
    position: 'absolute',
    width: 16, height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  crossV: {
    position: 'absolute',
    width: 1, height: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  stick: {
    width:           STICK_RADIUS * 1.1,
    height:          STICK_RADIUS * 1.1,
    borderRadius:    STICK_RADIUS,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth:     2,
    borderColor:     'rgba(255,255,255,0.55)',
    // Ombre pour profondeur
    shadowColor: '#FFF',
    shadowRadius: 6,
    shadowOpacity: 0.18,
    elevation: 4,
  },
});
