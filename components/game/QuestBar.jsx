import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { QUESTS, getQuestProgress } from '../../systems/questSystem';
import useGameStore from '../../store/gameStore';

export default function QuestBar() {
  const meta = useGameStore(s => s.meta);
  const stats = {
    kills: meta.totalKills,
    level: meta.runHistory[0]?.level || 1,
    wins: meta.totalWins,
  };
  return (
    <View style={styles.bar}>
      {QUESTS.map(q => (
        <View key={q.id} style={styles.quest}>
          <Text style={styles.desc}>{q.desc}</Text>
          <View style={styles.progressBox}>
            <View style={[styles.progress, { width: `${100 * getQuestProgress(q, stats) / q.goal}%` }]} />
            <Text style={styles.progressText}>{getQuestProgress(q, stats)} / {q.goal}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
    marginHorizontal: 4,
  },
  quest: {
    marginBottom: 6,
  },
  desc: {
    fontSize: 12,
    color: '#FFCC44',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  progressBox: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progress: {
    height: '100%',
    backgroundColor: '#FFCC44',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 10,
    color: '#FFF',
    marginLeft: 6,
    fontWeight: 'bold',
  },
});
