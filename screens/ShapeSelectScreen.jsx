/**
 * BREACH — ShapeSelectScreen
 * Sélection de la classe avant de commencer un run
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useGameStore from '../store/gameStore';
import { PALETTE, PLAYER_SHAPES, CLASS_INFO, GAME_MODE } from '../constants';

const { width: W } = Dimensions.get('window');
const CARD_W = Math.min(W - 48, 380);

export default function ShapeSelectScreen() {
  const startRun        = useGameStore(s => s.startRun);
  const goToMenu        = useGameStore(s => s.goToMenu);
  const isClassUnlocked = useGameStore(s => s.isClassUnlocked);
  const purchaseClass   = useGameStore(s => s.purchaseClass);
  const meta            = useGameStore(s => s.meta);

  const [selected, setSelected] = useState('triangle');
  const [mode, setMode]         = useState(GAME_MODE.STANDARD);
  const info = CLASS_INFO[selected] || {};
  const locked = !isClassUnlocked(selected);
  const canAfford = !locked || (info.purchasable && (meta.talentPoints || 0) >= (info.purchaseCost || 0));

  const handlePurchase = () => {
    purchaseClass(selected);
  };

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
          const isLocked = !isClassUnlocked(shape);
          const active = selected === shape;
          return (
            <TouchableOpacity
              key={shape}
              style={[styles.shapeBtn, { borderColor: c.color }, active && styles.shapeBtnActive, isLocked && styles.shapeLocked]}
              onPress={() => setSelected(shape)}
              activeOpacity={0.8}
            >
              <ShapeIcon shape={shape} color={c.color} size={32} />
              <Text style={[styles.shapeName, { color: c.color }]}>{c.name}</Text>
              {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
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

        {/* Achat classe verrouillée */}
        {locked && info.purchasable && (
          <View style={styles.purchaseRow}>
            <Text style={styles.purchaseCost}>🔸 {info.purchaseCost} fragments requis</Text>
            <Text style={styles.talentBalance}>Vous avez : {meta.talentPoints || 0} 🔸</Text>
            <TouchableOpacity
              style={[styles.purchaseBtn, !canAfford && styles.purchaseBtnDisabled]}
              onPress={handlePurchase}
              disabled={!canAfford}
              activeOpacity={0.8}
            >
              <Text style={[styles.purchaseBtnText, !canAfford && styles.purchaseBtnTextDisabled]}>
                {canAfford ? '🔓 DÉBLOQUER' : 'Fragments insuffisants'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Sélecteur de mode */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === GAME_MODE.STANDARD && styles.modeBtnActive]}
          onPress={() => setMode(GAME_MODE.STANDARD)}
          activeOpacity={0.8}
        >
          <Text style={[styles.modeBtnText, mode === GAME_MODE.STANDARD && styles.modeBtnTextActive]}>⏱ Standard (5 min)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === GAME_MODE.ENDLESS && styles.modeBtnActive]}
          onPress={() => setMode(GAME_MODE.ENDLESS)}
          activeOpacity={0.8}
        >
          <Text style={[styles.modeBtnText, mode === GAME_MODE.ENDLESS && styles.modeBtnTextActive]}>∞ Infini</Text>
        </TouchableOpacity>
      </View>

      {/* Bouton lancer */}
      <TouchableOpacity
        style={[styles.startBtn, { backgroundColor: info.color + '22', borderColor: info.color }, locked && styles.startBtnDisabled]}
        onPress={() => !locked && startRun(selected, mode)}
        disabled={locked}
        activeOpacity={0.8}
      >
        <Text style={[styles.startText, { color: locked ? PALETTE.textDim : info.color }]}>
          {locked ? '🔒 CLASSE VERROUILLÉE' : '▶ LANCER LE RUN'}
        </Text>
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
  shapeLocked:    { opacity: 0.5 },
  shapeName: { fontSize: 11, fontWeight: 'bold', marginTop: 4 },
  lockIcon:  { fontSize: 14, marginTop: 2 },

  card: {
    width: CARD_W, backgroundColor: PALETTE.bgCard,
    borderRadius: 14, borderWidth: 1.5, padding: 18, marginVertical: 4,
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

  purchaseRow: {
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderColor: PALETTE.border,
    alignItems: 'center', gap: 6,
  },
  purchaseCost: { fontSize: 13, color: PALETTE.fragment, fontWeight: 'bold' },
  talentBalance: { fontSize: 11, color: PALETTE.textMuted },
  purchaseBtn: {
    marginTop: 4, backgroundColor: '#1A2A1A',
    borderRadius: 8, borderWidth: 1, borderColor: '#44FF88',
    paddingHorizontal: 20, paddingVertical: 10, alignSelf: 'stretch', alignItems: 'center',
  },
  purchaseBtnDisabled: { borderColor: PALETTE.border, backgroundColor: 'transparent' },
  purchaseBtnText: { fontSize: 14, color: '#44FF88', fontWeight: 'bold' },
  purchaseBtnTextDisabled: { color: PALETTE.textDim },

  modeRow: {
    width: CARD_W, flexDirection: 'row', gap: 8, marginVertical: 6,
  },
  modeBtn: {
    flex: 1, backgroundColor: PALETTE.bgCard,
    borderRadius: 10, borderWidth: 1, borderColor: PALETTE.border,
    padding: 10, alignItems: 'center',
  },
  modeBtnActive: { backgroundColor: '#1A1A2A', borderColor: '#BB44FF' },
  modeBtnText: { fontSize: 13, color: PALETTE.textMuted },
  modeBtnTextActive: { color: '#BB44FF', fontWeight: 'bold' },

  startBtn: { width: CARD_W, borderRadius: 12, borderWidth: 2, padding: 18, alignItems: 'center', marginTop: 4 },
  startBtnDisabled: { opacity: 0.5 },
  startText: { fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
});
