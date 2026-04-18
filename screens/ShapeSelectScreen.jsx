/**
 * BREACH — ShapeSelectScreen
 * Sélection de la classe avant de commencer un run
 */


import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, FlatList, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import useGameStore from '../store/gameStore';
import { PALETTE, CLASS_INFO, GAME_MODE } from '../constants';
import { Card, Button } from '../components/ui';
import { Title, Body } from '../components/ui/Typography';
import { useT } from '../utils/i18n';

const { width: W } = Dimensions.get('window');
const CARD_SIZE = Math.floor((W - 64) / 3);

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
      const canAfford = !locked || (info.purchasable && (meta?.talentPoints || 0) >= (info.purchaseCost || 0));
      const handlePurchase = () => { purchaseClass(selected); };
      const allShapes = Object.keys(CLASS_INFO);
      const scrollRef = useRef();

      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: PALETTE.bg }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 8, marginTop: 8, marginBottom: 4 }}>
            <Button label={t('back_menu') || '← Menu'} onPress={goToMenu} style={{ minWidth: 80, paddingVertical: 8 }} />
            <Title style={{ fontSize: 20 }}>{t('shapeselect_title') || 'Choisir une classe'}</Title>
            <View style={{ width: 60 }} />
          </View>

          {/* Carte de classe sélectionnée */}
          <Card style={{ width: '94%', maxWidth: 400, alignSelf: 'center', marginBottom: 10, padding: 14, borderColor: info.color }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8 }}>
              <ShapeIcon shape={selected} color={info.color} size={38} />
              <View style={{ flex: 1 }}>
                <Title style={{ fontSize: 18, color: info.color }}>{info.name}</Title>
                <Body style={{ fontSize: 13, color: PALETTE.textDim, marginTop: 2, lineHeight: 18 }}>{info.desc}</Body>
              </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 4 }}>
              <Body style={{ fontSize: 13 }}>{t('stat_hp') || 'PV'}: <Body style={{ fontWeight: 'bold' }}>{info.baseStats?.maxHp ?? '-'}</Body></Body>
              <Body style={{ fontSize: 13 }}>{t('stat_attack') || 'ATQ'}: <Body style={{ fontWeight: 'bold' }}>{info.baseStats?.attack ?? '-'}</Body></Body>
              <Body style={{ fontSize: 13 }}>{t('stat_defense') || 'DEF'}: <Body style={{ fontWeight: 'bold' }}>{info.baseStats?.defense ?? '-'}</Body></Body>
              <Body style={{ fontSize: 13 }}>{t('stat_speed') || 'Vitesse'}: <Body style={{ fontWeight: 'bold' }}>{info.baseStats?.speed ?? '-'}</Body></Body>
              <Body style={{ fontSize: 13 }}>{t('stat_cooldown') || 'Cooldown'}: <Body style={{ fontWeight: 'bold' }}>{info.attackCooldown ? info.attackCooldown + 's' : '-'}</Body></Body>
            </View>
            {meta?.shapeStats?.[selected] && (
              <View style={{ marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderColor: PALETTE.border }}>
                <Body style={{ fontSize: 10, color: PALETTE.textDim, letterSpacing: 1 }}>{t('shapeselect_history') || 'Historique :'}</Body>
                <Body style={{ fontSize: 12, color: PALETTE.textPrimary, marginTop: 2 }}>{meta.shapeStats[selected].runs} runs · {meta.shapeStats[selected].kills} kills · {meta.shapeStats[selected].wins} victoires</Body>
              </View>
            )}
            {locked && info.purchasable && (
              <View style={{ marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderColor: PALETTE.border, alignItems: 'center', gap: 6 }}>
                <Body style={{ fontSize: 13, color: PALETTE.gold, fontWeight: 'bold' }}>🔸 {info.purchaseCost} {t('shapeselect_fragments_required') || 'fragments requis'}</Body>
                <Body style={{ fontSize: 11, color: PALETTE.textDim }}>{t('shapeselect_you_have') || 'Vous avez'} : {meta.talentPoints || 0} 🔸</Body>
                <Button label={canAfford ? (t('shapeselect_unlock') || '🔓 DÉBLOQUER') : (t('shapeselect_insufficient') || 'Fragments insuffisants')} onPress={handlePurchase} disabled={!canAfford} style={{ marginTop: 4, backgroundColor: canAfford ? '#1A2A1A' : 'transparent', borderColor: canAfford ? '#44FF88' : PALETTE.border }} />
              </View>
            )}
          </Card>

          {/* Carousel horizontal de classes */}
          <View style={{ height: CARD_SIZE + 32, marginBottom: 12 }}>
            <ScrollView
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 16 }}
            >
              {allShapes.map(shape => {
                const c = CLASS_INFO[shape];
                const isLocked = !isClassUnlocked(shape);
                const active = selected === shape;
                return (
                  <TouchableOpacity
                    key={shape}
                    onPress={() => setSelected(shape)}
                    activeOpacity={0.85}
                    style={{ marginHorizontal: 8, alignItems: 'center' }}
                  >
                    <Card
                      style={{
                        alignItems: 'center',
                        padding: 12,
                        borderRadius: 16,
                        borderWidth: active ? 3 : 1.5,
                        borderColor: c.color,
                        backgroundColor: active ? 'rgba(255,255,255,0.13)' : PALETTE.bgCard,
                        width: CARD_SIZE,
                        opacity: isLocked ? 0.5 : 1,
                        marginBottom: 4,
                        shadowColor: active ? c.color : 'transparent',
                        shadowOpacity: active ? 0.25 : 0,
                        shadowRadius: active ? 8 : 0,
                        elevation: active ? 4 : 0,
                        transform: active ? [{ scale: 1.06 }] : [],
                      }}
                    >
                      <ShapeIcon shape={shape} color={c.color} size={32} />
                      <Body style={{ fontSize: 12, fontWeight: 'bold', marginTop: 4, color: c.color }}>{c.name}</Body>
                      {isLocked && <Body style={{ fontSize: 14, marginTop: 2 }}>🔒</Body>}
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Modes de jeu */}
          <View style={{ width: '100%', maxWidth: 400, alignSelf: 'center', flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            <Button label={t('mode_standard') || '⏱ Standard (5 min)'} onPress={() => setMode(GAME_MODE.STANDARD)} primary={mode === GAME_MODE.STANDARD} style={{ flex: 1 }} />
            <Button label={t('mode_endless') || '∞ Infini'} onPress={() => setMode(GAME_MODE.ENDLESS)} primary={mode === GAME_MODE.ENDLESS} style={{ flex: 1 }} />
            <Button label={t('mode_prestige') || '★ Prestige'} onPress={() => setMode(GAME_MODE.PRESTIGE)} primary={mode === GAME_MODE.PRESTIGE} style={{ flex: 1 }} />
            <Button label={t('mode_hard') || '🔥 Difficile'} onPress={() => setMode(GAME_MODE.HARD)} primary={mode === GAME_MODE.HARD} style={{ flex: 1 }} />
          </View>

          {/* Bouton lancer en bas, toujours visible */}
          <Button
            label={locked ? (t('shapeselect_locked') || '🔒 CLASSE VERROUILLÉE') : (t('shapeselect_start') || '▶ LANCER LE RUN')}
            onPress={() => !locked && startRun(selected, mode)}
            disabled={locked}
            primary
            style={{ width: '100%', maxWidth: 400, alignSelf: 'center', marginBottom: 12, backgroundColor: info.color + '22', borderColor: info.color }}
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
