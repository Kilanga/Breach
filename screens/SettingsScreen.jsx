/**
 * BREACH — SettingsScreen
 */

import React from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useGameStore from '../store/gameStore';
import { Card, Title, Body, Button } from '../components/ui';
import { useT } from '../utils/i18n';

import { PALETTE } from '../constants';



export default function SettingsScreen() {
  const goToMenu         = useGameStore(s => s.goToMenu);
  const meta             = useGameStore(s => s.meta);
  const setMusicEnabled  = useGameStore(s => s.setMusicEnabled);
  const setSfxEnabled    = useGameStore(s => s.setSfxEnabled);
  const setColorBlind    = useGameStore(s => s.setColorBlindMode);
  const setLargeText     = useGameStore(s => s.setLargeText);
  const t = useT();

  // Facteur d’agrandissement du texte
  const fontScale = meta.largeText ? 1.35 : 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PALETTE.bg, padding: 16 }}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Button label={t('back_menu') || '← Menu'} onPress={goToMenu} style={{ minWidth: 80, paddingVertical: 8 }} />
        <Title style={{ fontSize: 20 * fontScale }}>{t('settings_title') || 'Paramètres'}</Title>
        <View style={{ width: 60 }} />
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <Body style={{ fontSize: 11 * fontScale, color: PALETTE.textDim, marginBottom: 4 }}>{t('settings_audio') || 'Audio'}</Body>
        <SettingRow label={t('settings_music') || 'Musique'} value={meta.musicEnabled} onChange={setMusicEnabled} fontScale={fontScale} />
        <SettingRow label={t('settings_sfx') || 'Effets sonores'} value={meta.sfxEnabled} onChange={setSfxEnabled} fontScale={fontScale} />
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <Body style={{ fontSize: 11 * fontScale, color: PALETTE.textDim, marginBottom: 4 }}>{t('settings_accessibility') || 'Accessibilité'}</Body>
        <SettingRow label={t('settings_colorblind') || 'Mode daltonisme'} value={!!meta.colorBlindMode} onChange={setColorBlind} fontScale={fontScale} />
        <SettingRow label={t('settings_largetext') || 'Texte agrandi'} value={!!meta.largeText} onChange={setLargeText} fontScale={fontScale} />
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <Body style={{ fontSize: 11 * fontScale, color: PALETTE.textDim, marginBottom: 4 }}>{t('settings_progression') || 'Progression'}</Body>
        <InfoRow label={t('settings_total_runs') || 'Runs totaux'} value={meta.totalRuns} fontScale={fontScale} />
        <InfoRow label={t('settings_total_kills') || 'Kills totaux'} value={meta.totalKills} fontScale={fontScale} />
        <InfoRow label={t('settings_total_wins') || 'Victoires'} value={meta.totalWins} fontScale={fontScale} />
      </Card>
      <Body style={{ color: PALETTE.textDim, position: 'absolute', bottom: 24, alignSelf: 'center', fontSize: 11 * fontScale }}>
        {t('settings_version') || 'BREACH v1.0 · Kilanga © 2025'}
      </Body>
    </SafeAreaView>
  );
}

function SettingRow({ label, value, onChange, fontScale = 1 }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 }}>
      <Body style={{ fontSize: 15 * fontScale }}>{label}</Body>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: PALETTE.border, true: '#44FF88' }}
        thumbColor={value ? '#FFFFFF' : PALETTE.textDim}
      />
    </View>
  );
}

function InfoRow({ label, value, fontScale = 1 }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
      <Body style={{ fontSize: 14 * fontScale, color: PALETTE.textDim }}>{label}</Body>
      <Body style={{ fontSize: 14 * fontScale, color: PALETTE.textPrimary, fontWeight: 'bold' }}>{value}</Body>
    </View>
  );
}

const styles = StyleSheet.create({
  root:     { flex: 1, backgroundColor: PALETTE.bg, padding: 16 },
  header:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backBtn:  { padding: 8 },
  backText: { color: PALETTE.textMuted, fontSize: 14 },
  title:    { fontSize: 20, fontWeight: 'bold', color: PALETTE.textPrimary },
  section:  { backgroundColor: PALETTE.bgCard, borderRadius: 12, borderWidth: 1, borderColor: PALETTE.border, marginBottom: 16, overflow: 'hidden' },
  sectionTitle: { fontSize: 11, color: PALETTE.textMuted, letterSpacing: 1, padding: 12, paddingBottom: 6, textTransform: 'uppercase' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderTopWidth: 1, borderColor: PALETTE.border },
  settingLabel: { fontSize: 15, color: PALETTE.textPrimary },
  infoRow:  { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderTopWidth: 1, borderColor: PALETTE.border },
  infoLabel:{ fontSize: 14, color: PALETTE.textMuted },
  infoValue:{ fontSize: 14, color: PALETTE.textPrimary, fontWeight: 'bold' },
  version:  { position: 'absolute', bottom: 24, alignSelf: 'center', fontSize: 11, color: PALETTE.textDim },
});
