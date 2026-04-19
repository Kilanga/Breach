import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { PALETTE, PALETTE_DALTONISM } from '../constants';
import { getUpgradeTreeData } from './upgradeTreeUtils';

// Simple upgrade tree: shows all upgrades in order, grouped by color
  if (!upgrades.length) return null;
  const palette = colorBlindMode ? PALETTE_DALTONISM : PALETTE;
  const { grouped, synergies } = getUpgradeTreeData(upgrades);
  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 6 })
    ]).start();
    Haptics.selectionAsync && Haptics.selectionAsync();
    return () => { Haptics.selectionAsync && Haptics.selectionAsync(); };
  }, []);
  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }] }>
      <Text style={styles.title}>Arbre d'Upgrades</Text>
      {synergies.length > 0 && (
        <View style={styles.synergyRow}>
          {synergies.map(s => (
            <Text key={s.id} style={styles.synergyBadge}>✨ {s.description}</Text>
          ))}
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scroll} horizontal={true} showsHorizontalScrollIndicator={false}>
        {Object.entries(grouped).map(([color, list]) => (
          <View key={color} style={styles.group}>
            <Text style={[styles.groupTitle, { color: colorToHex(color, colorBlindMode, palette) }]}>{colorLabel(color, colorBlindMode)}</Text>
            <View style={styles.row}>
              {list.map((u, i) => (
                <View key={u.id + i} style={[styles.upgrade, { borderColor: colorToHex(color, colorBlindMode, palette), backgroundColor: colorBlindBg(color, colorBlindMode, palette), boxShadow: isSynergyUpgrade(u, synergies) ? '0 0 8px #FFCC44' : undefined }] }>
                  <Text style={styles.icon}>{colorBlindIcon(color, colorBlindMode)} {u.icon || u.name[0]}</Text>
                  <Text style={styles.name}>{u.name}</Text>
                  {u.count > 1 && <Text style={styles.stack}>×{u.count}</Text>}
                  {isSynergyUpgrade(u, synergies) && <Text style={styles.synergyStar}>★</Text>}
                </View>
              ))}
            </View>
            {/* Lien visuel de progression */}
            {list.length > 1 && (
              <View style={styles.linkLine} />
            )}
          </View>
        ))}
      </ScrollView>
      <Text style={styles.closeBtn} onPress={() => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => onClose && onClose());
        Haptics.selectionAsync && Haptics.selectionAsync();
      }}>Fermer</Text>
    </Animated.View>
  );
}

function isSynergyUpgrade(upgrade, synergies) {
  return synergies.some(s => s.upgrades.includes(upgrade.id));
}

function colorToHex(color, colorBlindMode, palette) {
  if (colorBlindMode && palette) {
    switch (color) {
      case 'red': return palette.red;
      case 'blue': return palette.blue;
      case 'green': return palette.green;
      case 'curse': return palette.curse;
      default: return '#AAA';
    }
  }
  switch (color) {
    case 'red': return '#FF3344';
    case 'blue': return '#3388FF';
    case 'green': return '#44FF88';
    case 'curse': return '#7B2FF2';
    default: return '#AAA';
  }
}
function colorLabel(color, colorBlindMode) {
  if (colorBlindMode) {
    switch (color) {
      case 'red': return 'Offensif ◼';
      case 'blue': return 'Défensif ◆';
      case 'green': return 'Soin ●';
      case 'curse': return 'Malédiction ☠';
      default: return color;
    }
  }
  switch (color) {
    case 'red': return 'Offensif';
    case 'blue': return 'Défensif';
    case 'green': return 'Soin';
    case 'curse': return 'Malédiction';
    default: return color;
  }
}
function colorBlindIcon(color, colorBlindMode) {
  if (!colorBlindMode) return '';
  switch (color) {
    case 'red': return '◼';
    case 'blue': return '◆';
    case 'green': return '●';
    case 'curse': return '☠';
    default: return '';
  }
}
function colorBlindBg(color, colorBlindMode, palette) {
  if (!colorBlindMode || !palette) return 'rgba(255,255,255,0.04)';
  switch (color) {
    case 'red': return palette.red + '22';
    case 'blue': return palette.blue + '22';
    case 'green': return palette.green + '22';
    case 'curse': return palette.curse + '22';
    default: return 'rgba(255,255,255,0.04)';
  }
}
const styles = StyleSheet.create({
  synergyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  synergyBadge: {
    backgroundColor: 'rgba(255,204,68,0.13)',
    color: '#FFCC44',
    fontWeight: 'bold',
    fontSize: 13,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 2,
  },
  synergyStar: {
    color: '#FFCC44',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 2,
    textShadowColor: '#222',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    position: 'absolute',
    top: 2,
    right: 2,
  },
  linkLine: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.10)',
    marginVertical: 6,
    borderRadius: 1,
    width: '80%',
    alignSelf: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,20,0.97)',
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  title: {
    fontSize: 22,
    color: '#FFCC44',
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 1.5,
  },
  scroll: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  group: {
    marginBottom: 18,
    alignItems: 'center',
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  upgrade: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 8,
    margin: 4,
    minWidth: 60,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  icon: { fontSize: 18, marginBottom: 2 },
  name: { fontSize: 12, color: '#FFF', textAlign: 'center' },
  stack: { fontSize: 11, color: '#FFDD44', fontWeight: 'bold', marginTop: 2 },
  closeBtn: {
    marginTop: 18,
    color: '#FFCC44',
    fontWeight: 'bold',
    fontSize: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
});
