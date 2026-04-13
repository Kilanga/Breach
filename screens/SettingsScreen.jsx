/**
 * BREACH — SettingsScreen
 */

import React from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useGameStore from '../store/gameStore';
import { PALETTE } from '../constants';

export default function SettingsScreen() {
  const goToMenu       = useGameStore(s => s.goToMenu);
  const meta           = useGameStore(s => s.meta);
  const setMusicEnabled = useGameStore(s => s.setMusicEnabled);
  const setSfxEnabled   = useGameStore(s => s.setSfxEnabled);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToMenu} style={styles.backBtn}>
          <Text style={styles.backText}>← Menu</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Paramètres</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audio</Text>
        <SettingRow label="Musique" value={meta.musicEnabled} onChange={setMusicEnabled} />
        <SettingRow label="Effets sonores" value={meta.sfxEnabled} onChange={setSfxEnabled} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progression</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Runs totaux</Text>
          <Text style={styles.infoValue}>{meta.totalRuns}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Kills totaux</Text>
          <Text style={styles.infoValue}>{meta.totalKills}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Victoires</Text>
          <Text style={styles.infoValue}>{meta.totalWins}</Text>
        </View>
      </View>

      <Text style={styles.version}>BREACH v1.0 · Kilanga © 2025</Text>
    </SafeAreaView>
  );
}

function SettingRow({ label, value, onChange }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: PALETTE.border, true: '#44FF88' }}
        thumbColor={value ? '#FFFFFF' : PALETTE.textMuted}
      />
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
