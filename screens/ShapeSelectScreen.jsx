/**
 * BREACH — ShapeSelectScreen
 * Sélection de la classe avant de commencer un run
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useGameStore from '../store/gameStore';
import { PALETTE, PLAYER_SHAPES, CLASS_INFO } from '../constants';

const { width: W } = Dimensions.get('window');
const CARD_W = Math.min(W - 48, 380);

export default function ShapeSelectScreen() {
  const startRun       = useGameStore(s => s.startRun);
  const goToMenu       = useGameStore(s => s.goToMenu);
  const isClassUnlocked = useGameStore(s => s.isClassUnlocked);
  const meta           = useGameStore(s => s.meta);

  const [selected, setSelected] = useState('triangle');
  const info = CLASS_INFO[selected] || {};

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToMenu} style={styles.backBtn}>
          <Text style={styles.backText}>← Menu</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Choisir une classe</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Sélecteur */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.shapeRow}
      >
        {Object.values(PLAYER_SHAPES).map(shape => {
          const c = CLASS_INFO[shape];
          if (!c) return null;
          const locked = !isClassUnlocked(shape);
          const active = selected === shape;
          return (
            <TouchableOpacity
              key={shape}
              style={[styles.shapeBtn, { borderColor: c.color }, active && styles.shapeBtnActive, locked && styles.shapeLocked]}
              onPress={() => !locked && setSelected(shape)}
              activeOpacity={locked ? 1 : 0.8}
            >
              <ShapeIcon shape={shape} color={c.color} size={32} />
              <Text style={[styles.shapeName, { color: c.color }]}>{c.name}</Text>
              {locked && <Text style={styles.lockIcon}>🔒</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Fiche classe */}
      <View style={[styles.card, { borderColor: info.color }]}>
        <View style={styles.cardHeader}>
          <ShapeIcon shape={selected} color={info.color} size={44} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.className, { color: info.color }]}>{info.name}</Text>
            <Text style={styles.classDesc}>{info.desc}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatRow label="PV" value={info.baseStats?.maxHp} />
          <StatRow label="ATQ" value={info.baseStats?.attack} />
          <StatRow label="DEF" value={info.baseStats?.defense} />
          <StatRow label="Vitesse" value={info.baseStats?.speed?.toFixed(1)} />
          <StatRow label="Cooldown" value={`${info.attackCooldown}s`} />
        </View>

        {/* Historique classe */}
        {meta.shapeStats?.[selected] && (
          <View style={styles.shapeHistory}>
            <Text style={styles.histLabel}>Historique :</Text>
            <Text style={styles.histValue}>{meta.shapeStats[selected].runs} runs · {meta.shapeStats[selected].kills} kills · {meta.shapeStats[selected].wins} victoires</Text>
          </View>
        )}
      </View>

      {/* Bouton lancer */}
      <TouchableOpacity
        style={[styles.startBtn, { backgroundColor: info.color + '22', borderColor: info.color }]}
        onPress={() => startRun(selected)}
        activeOpacity={0.8}
      >
        <Text style={[styles.startText, { color: info.color }]}>▶ LANCER LE RUN</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function StatRow({ label, value }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function ShapeIcon({ shape, color, size }) {
  const s = size || 24;
  // Simple text placeholder — can be replaced with SVG shapes
  const glyphs = { triangle: '▲', circle: '●', hexagon: '⬡', shadow: '◆', paladin: '✦' };
  return <Text style={{ fontSize: s * 0.7, color, lineHeight: s }}>{glyphs[shape] || '●'}</Text>;
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: PALETTE.bg, alignItems: 'center' },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: 16, paddingTop: 12 },
  backBtn: { padding: 8 },
  backText:{ color: PALETTE.textMuted, fontSize: 14 },
  title:   { fontSize: 18, fontWeight: 'bold', color: PALETTE.textPrimary },

  shapeRow: { paddingHorizontal: 16, gap: 10, paddingVertical: 12 },
  shapeBtn: {
    alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1.5,
    backgroundColor: PALETTE.bgCard, minWidth: 80,
  },
  shapeBtnActive: { backgroundColor: 'rgba(255,255,255,0.08)' },
  shapeLocked:    { opacity: 0.4 },
  shapeName: { fontSize: 11, fontWeight: 'bold', marginTop: 4 },
  lockIcon:  { fontSize: 14, marginTop: 2 },

  card: {
    width: CARD_W, backgroundColor: PALETTE.bgCard,
    borderRadius: 14, borderWidth: 1.5, padding: 18, marginVertical: 8,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  className:  { fontSize: 20, fontWeight: 'bold' },
  classDesc:  { fontSize: 13, color: PALETTE.textMuted, marginTop: 4, lineHeight: 18 },

  statsGrid:  { gap: 6 },
  statRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderColor: PALETTE.border },
  statLabel:  { fontSize: 13, color: PALETTE.textMuted },
  statValue:  { fontSize: 13, color: PALETTE.textPrimary, fontWeight: 'bold' },

  shapeHistory: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderColor: PALETTE.border },
  histLabel:    { fontSize: 10, color: PALETTE.textMuted, letterSpacing: 1 },
  histValue:    { fontSize: 12, color: PALETTE.textPrimary, marginTop: 2 },

  startBtn: { width: CARD_W, borderRadius: 12, borderWidth: 2, padding: 18, alignItems: 'center', marginTop: 8 },
  startText: { fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
});
