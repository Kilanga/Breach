import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Button from '../ui/Button';
import { QUESTS, WEEKLY_CHALLENGES } from '../../systems/questSystem';
import { MILESTONES } from '../../systems/milestoneSystem';
import useGameStore from '../../store/gameStore';
import { BADGES } from '../../systems/badgeSystem';

// Historique simple basé sur les stats actuelles (pour MVP)
export default function QuestHistoryOverlay({ onClose }) {
  const meta = useGameStore(s => s.meta);
  const stats = {
    kills: meta.totalKills,
    level: meta.runHistory[0]?.level || 1,
    wins: meta.totalWins,
  };
  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>Historique des Quêtes</Text>
      <ScrollView contentContainerStyle={styles.scroll}>
        {QUESTS.map(q => {
          const done = (q.progressKey === 'kills' && stats.kills >= q.goal)
            || (q.progressKey === 'level' && stats.level >= q.goal)
            || (q.progressKey === 'wins' && stats.wins >= q.goal);
          return (
            <View key={q.id} style={[styles.quest, done && styles.questDone]}>
              <Text style={styles.desc}>{q.desc}</Text>
              <Text style={styles.reward}>Récompense : +{q.reward.amount} Fragments</Text>
              <Text style={styles.status}>{done ? 'Terminé' : 'En cours'}</Text>
            </View>
          );
        })}
        {/* Milestones */}
        <View style={{ marginTop: 18, marginBottom: 6 }}>
          <Text style={{ color: '#FFCC44', fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>Succès débloqués</Text>
        </View>
        {MILESTONES.map(m => {
          const unlocked = (meta.milestones || []).includes(m.id);
          return (
            <View key={m.id} style={[styles.quest, unlocked && styles.questDone, { borderStyle: 'dashed' }] }>
              <Text style={styles.desc}>{m.desc}</Text>
              <Text style={styles.reward}>Récompense : +{m.reward.amount} Fragments</Text>
              <Text style={styles.status}>{unlocked ? 'Débloqué' : 'Non atteint'}</Text>
            </View>
          );
        })}
        {/* Défi hebdomadaire */}
        <View style={{ marginTop: 18, marginBottom: 6 }}>
          <Text style={{ color: '#3388FF', fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>Défi hebdomadaire</Text>
        </View>
        {(() => {
          const ch = meta.weeklyChallenge;
          if (!ch) return null;
          const def = WEEKLY_CHALLENGES.find(c => c.id === ch.id);
          if (!def) return null;
          return (
            <View style={[styles.quest, ch.completed && styles.questDone, { borderColor: '#3388FF', borderWidth: 1 }] }>
              <Text style={styles.desc}>{def.desc}</Text>
              <Text style={styles.reward}>Récompense : +{def.reward.amount} Fragments</Text>
              <Text style={styles.status}>Progression : {Math.min(ch.progress, def.goal)}/{def.goal} {def.progressKey === 'kills' ? 'kills' : def.progressKey === 'wins' ? 'victoires' : 'upgrades'}</Text>
              <Text style={styles.status}>{ch.completed ? (ch.rewardClaimed ? 'Récompense obtenue' : 'Récompense à récupérer !') : 'En cours'}</Text>
            </View>
          );
        })()}
        {/* Badges */}
        <View style={{ marginTop: 18, marginBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>Badges débloqués</Text>
          <Button label="Aucun badge" onPress={() => useGameStore.getState().setSelectedBadge(null)} style={{ paddingVertical: 6, paddingHorizontal: 12, marginBottom: 0 }} />
        </View>
        {BADGES.map(b => {
          const unlocked = (meta.badges || []).includes(b.id);
          const selected = meta.selectedBadge === b.id;
          return (
            <View key={b.id} style={[styles.quest, unlocked && styles.questDone, { borderColor: '#FFD700', borderWidth: 1, flexDirection: 'row', alignItems: 'center' }] }>
              <Text style={{ fontSize: 22, marginRight: 8 }}>{b.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.desc}>{b.name}</Text>
                <Text style={styles.reward}>{b.desc}</Text>
                <Text style={styles.status}>{unlocked ? (selected ? 'Sélectionné' : 'Débloqué') : 'Non atteint'}</Text>
              </View>
              {unlocked && !selected && (
                <Button label="Sélectionner" onPress={() => useGameStore.getState().setSelectedBadge(b.id)} style={{ marginLeft: 8, paddingVertical: 6, paddingHorizontal: 12 }} />
              )}
            </View>
          );
        })}
        {/* Récompenses de connexion */}
        <View style={{ marginTop: 18, marginBottom: 6 }}>
          <Text style={{ color: '#44FF88', fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>Récompenses de connexion</Text>
        </View>
        {(meta.loginRewards || []).slice(-10).reverse().map((r, i) => (
          <View key={r.date || i} style={[styles.quest, { borderColor: '#44FF88', borderWidth: 1 }] }>
            <Text style={styles.desc}>Jour {r.streak} — {new Date(r.date).toLocaleDateString()}</Text>
            <Text style={styles.reward}>+{r.amount} Fragments</Text>
          </View>
        ))}
      </ScrollView>
      <Text style={styles.closeBtn} onPress={onClose}>Fermer</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,20,0.97)',
    zIndex: 200,
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
  quest: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    width: 260,
    alignItems: 'center',
  },
  questDone: {
    backgroundColor: 'rgba(255,204,68,0.13)',
    borderColor: '#FFCC44',
    borderWidth: 1.5,
  },
  desc: { fontSize: 14, color: '#FFF', marginBottom: 4, textAlign: 'center' },
  reward: { fontSize: 12, color: '#FFCC44', marginBottom: 2 },
  status: { fontSize: 12, color: '#FFCC44', fontWeight: 'bold' },
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
