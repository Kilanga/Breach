/**
 * BREACH — MenuScreen
 */

import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useGameStore from '../store/gameStore';
import pkg from '../package.json';
import { Button, Card, Title, Subtitle, Body, PALETTE } from '../components/ui';
import { useT } from '../utils/i18n';
import { Animated, Image, StyleSheet, Dimensions } from 'react-native';
const { width: W, height: H } = Dimensions.get('window');

export default function MenuScreen() {
  const goToShapeSelect   = useGameStore(s => s.goToShapeSelect);
  const goToAchievements  = useGameStore(s => s.goToAchievements);
  const goToSettings      = useGameStore(s => s.goToSettings);
  const goToTalentTree    = useGameStore(s => s.goToTalentTree);
  const setPhase          = useGameStore(s => s.setPhase);
  const meta              = useGameStore(s => s.meta);
  const t = useT();

  const bestTime = meta.bestSurvivalTime || 0;
  const bestM = Math.floor(bestTime / 60);
  const bestS = Math.floor(bestTime % 60);

  return (
    <SafeAreaView style={styles.root}>
      {/* Fond animé (dégradé radial) */}
      <View style={styles.bgLight} pointerEvents="none" />

      {/* Logo ou icône centrale (optionnel) */}
      {/* <View style={styles.logoContainer}>
        <Image source={require('../assets/icon.png')} style={styles.logo} />
      </View> */}

      {/* Titre avec effet glow */}
      <Text style={styles.titleGlow}>{t('menu_title')}</Text>
      <Text style={styles.subtitle}>{t('menu_sub')}</Text>

      {/* Stats avec icônes */}
      <View style={styles.statsRow}>
        <StatCell label={t('menu_stat_runs')} value={meta.totalRuns || 0} icon="🏃" />
        <StatCell label={t('menu_stat_kills')} value={meta.totalKills || 0} icon="☠️" />
        <StatCell label={t('menu_stat_best')} value={`${bestM}:${bestS.toString().padStart(2,'0')}`} icon="⏱" />
      </View>

      {/* Bouton jouer mis en avant */}
      <Button label={t('menu_btn_play')} primary onPress={goToShapeSelect} style={styles.playBtn} />

      {/* Boutons secondaires en ligne */}
      <View style={styles.quickRow}>
        <Button label="🏆" onPress={() => setPhase('leaderboard')} style={styles.quickBtn} />
        <Button label="📖" onPress={() => setPhase('tutorial')} style={styles.quickBtn} />
        <Button label="🌳" onPress={goToTalentTree} style={styles.quickBtn} />
        <Button label="🎖" onPress={goToAchievements} style={styles.quickBtn} />
        <Button label="⚙️" onPress={goToSettings} style={styles.quickBtn} />
      </View>

      {/* Footer version */}
      <Text style={styles.footer}>{t('menu_version', { version: pkg.version })}</Text>
    </SafeAreaView>
  );
}

function StatCell({ label, value, icon }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Title style={styles.statValue}>{value}</Title>
      <Body style={styles.statLabel}>{label}</Body>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PALETTE.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  bgLight: {
    position: 'absolute',
    top: -H * 0.15,
    left: -W * 0.15,
    width: W * 1.3,
    height: H * 1.3,
    borderRadius: W * 0.65,
    backgroundColor: 'rgba(255,255,200,0.08)',
    zIndex: 0,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 18,
    zIndex: 2,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
    borderRadius: 20,
    shadowColor: '#FFD700',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  titleGlow: {
    fontSize: 36,
    color: '#FFF',
    textShadowColor: '#FFD700',
    textShadowRadius: 16,
    textShadowOffset: { width: 0, height: 0 },
    marginBottom: 2,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFF',
    opacity: 0.8,
    marginBottom: 6,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
    marginBottom: 18,
    zIndex: 2,
  },
  statCell: {
    alignItems: 'center',
    minWidth: 70,
    marginHorizontal: 6,
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 22,
    marginBottom: 0,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: PALETTE.textDim,
    marginTop: 0,
  },
  playBtn: {
    marginBottom: 18,
    marginTop: 0,
    width: 220,
    alignSelf: 'center',
    shadowColor: '#FFD700',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    zIndex: 2,
  },
  quickBtn: {
    minWidth: 44,
    paddingHorizontal: 8,
    fontSize: 13,
  },
  footer: {
    color: PALETTE.textDim,
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    fontSize: 12,
    zIndex: 2,
  },
});
