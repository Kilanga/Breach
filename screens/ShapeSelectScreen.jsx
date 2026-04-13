/**
 * BREACH — ShapeSelectScreen
 * Sélection de la classe avant de commencer un run
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useGameStore from '../store/gameStore';
import { PALETTE, PLAYER_SHAPES, CLASS_INFO, GAME_MODE } from '../constants';
import { Card, Title, Body, Button } from '../components/ui';
import { useT } from '../utils/i18n';

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
  const t = useT();
  const info = CLASS_INFO[selected] || {};
  const locked = !isClassUnlocked(selected);
  const canAfford = !locked || (info.purchasable && (meta.talentPoints || 0) >= (info.purchaseCost || 0));
  const handlePurchase = () => { purchaseClass(selected); };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PALETTE.bg, alignItems: 'center' }}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 12 }}>
        <Button label={t('back_menu') || '← Menu'} onPress={goToMenu} style={{ minWidth: 80, paddingVertical: 8 }} />
        <Title style={{ fontSize: 18 }}>{t('shapeselect_title') || 'Choisir une classe'}</Title>
        <View style={{ width: 60 }} />
      </Card>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingVertical: 12 }}>
        {Object.values(PLAYER_SHAPES).map(shape => {
          const c = CLASS_INFO[shape];
          if (!c) return null;
          const isLocked = !isClassUnlocked(shape);
          const active = selected === shape;
          return (
            <Card key={shape} style={{ alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: c.color, backgroundColor: active ? 'rgba(255,255,255,0.08)' : PALETTE.bgCard, minWidth: 80, opacity: isLocked ? 0.5 : 1, marginRight: 8 }}>
              <TouchableOpacity onPress={() => setSelected(shape)} activeOpacity={0.8} style={{ alignItems: 'center' }}>
                <ShapeIcon shape={shape} color={c.color} size={32} />
                <Body style={{ fontSize: 11, fontWeight: 'bold', marginTop: 4, color: c.color }}>{c.name}</Body>
                {isLocked && <Body style={{ fontSize: 14, marginTop: 2 }}>🔒</Body>}
              </TouchableOpacity>
            </Card>
          );
        })}
      </ScrollView>
      <Card style={{ borderColor: info.color, width: '100%', maxWidth: 380, marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <ShapeIcon shape={selected} color={info.color} size={44} />
          <View style={{ flex: 1 }}>
            <Title style={{ fontSize: 20, color: info.color }}>{info.name}</Title>
            <Body style={{ fontSize: 13, color: PALETTE.textDim, marginTop: 4, lineHeight: 18 }}>{info.desc}</Body>
          </View>
        </View>
        <View style={{ gap: 6 }}>
          <StatRow label={t('stat_hp') || 'PV'} value={info.baseStats?.maxHp} />
          <StatRow label={t('stat_attack') || 'ATQ'} value={info.baseStats?.attack} />
          <StatRow label={t('stat_defense') || 'DEF'} value={info.baseStats?.defense} />
          <StatRow label={t('stat_speed') || 'Vitesse'} value={info.baseStats?.speed?.toFixed(1)} />
          <StatRow label={t('stat_cooldown') || 'Cooldown'} value={`${info.attackCooldown}s`} />
        </View>
        {meta.shapeStats?.[selected] && (
          <View style={{ marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderColor: PALETTE.border }}>
            <Body style={{ fontSize: 10, color: PALETTE.textDim, letterSpacing: 1 }}>{t('shapeselect_history') || 'Historique :'}</Body>
            <Body style={{ fontSize: 12, color: PALETTE.textPrimary, marginTop: 2 }}>{meta.shapeStats[selected].runs} runs · {meta.shapeStats[selected].kills} kills · {meta.shapeStats[selected].wins} victoires</Body>
          </View>
        )}
        {locked && info.purchasable && (
          <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: PALETTE.border, alignItems: 'center', gap: 6 }}>
            <Body style={{ fontSize: 13, color: PALETTE.gold, fontWeight: 'bold' }}>🔸 {info.purchaseCost} {t('shapeselect_fragments_required') || 'fragments requis'}</Body>
            <Body style={{ fontSize: 11, color: PALETTE.textDim }}>{t('shapeselect_you_have') || 'Vous avez'} : {meta.talentPoints || 0} 🔸</Body>
            <Button label={canAfford ? (t('shapeselect_unlock') || '🔓 DÉBLOQUER') : (t('shapeselect_insufficient') || 'Fragments insuffisants')} onPress={handlePurchase} disabled={!canAfford} style={{ marginTop: 4, backgroundColor: canAfford ? '#1A2A1A' : 'transparent', borderColor: canAfford ? '#44FF88' : PALETTE.border }} />
          </View>
        )}
      </Card>
      <View style={{ width: '100%', maxWidth: 380, flexDirection: 'row', gap: 8, marginVertical: 6 }}>
        <Button label={t('mode_standard') || '⏱ Standard (5 min)'} onPress={() => setMode(GAME_MODE.STANDARD)} primary={mode === GAME_MODE.STANDARD} style={{ flex: 1 }} />
        <Button label={t('mode_endless') || '∞ Infini'} onPress={() => setMode(GAME_MODE.ENDLESS)} primary={mode === GAME_MODE.ENDLESS} style={{ flex: 1 }} />
        <Button label={t('mode_prestige') || '★ Prestige'} onPress={() => setMode(GAME_MODE.PRESTIGE)} primary={mode === GAME_MODE.PRESTIGE} style={{ flex: 1 }} />
        <Button label={t('mode_hard') || '🔥 Difficile'} onPress={() => setMode(GAME_MODE.HARD)} primary={mode === GAME_MODE.HARD} style={{ flex: 1 }} />
      </View>
      <Button
        label={locked ? (t('shapeselect_locked') || '🔒 CLASSE VERROUILLÉE') : (t('shapeselect_start') || '▶ LANCER LE RUN')}
        onPress={() => !locked && startRun(selected, mode)}
        disabled={locked}
        primary
        style={{ width: '100%', maxWidth: 380, marginTop: 4, backgroundColor: info.color + '22', borderColor: info.color }}
      />
    </SafeAreaView>
  );
}

function StatRow({ label, value }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderColor: PALETTE.border }}>
      <Body style={{ fontSize: 13, color: PALETTE.textDim }}>{label}</Body>
      <Body style={{ fontSize: 13, color: PALETTE.textPrimary, fontWeight: 'bold' }}>{value}</Body>
    </View>
  );
}

function ShapeIcon({ shape, color, size }) {
  const s = size || 24;
  const glyphs = { triangle: '▲', circle: '●', hexagon: '⬡', shadow: '◆', paladin: '✦' };
  return <Body style={{ fontSize: s * 0.7, color, lineHeight: s }}>{glyphs[shape] || '●'}</Body>;
}
