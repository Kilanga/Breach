import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { fetchLeaderboard } from '../services/leaderboardApi';
import { PALETTE } from '../constants';

export default function LeaderboardScreen() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard()
      .then(setScores)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color={PALETTE.upgradeBlue} style={{ marginTop: 40 }} />;
  if (error) return <Text style={{ color: 'red', marginTop: 40 }}>{error}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Leaderboard</Text>
      <FlatList
        data={scores}
        keyExtractor={item => item.id || item.playerName + item.score}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.rank}>{index + 1}</Text>
            <Text style={styles.name}>{item.playerName}</Text>
            <Text style={styles.score}>{item.score}</Text>
            <Text style={styles.time}>{Math.floor(item.survivalTime / 60)}:{(item.survivalTime % 60).toString().padStart(2, '0')}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucun score pour l’instant.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.bg,
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: PALETTE.textPrimary,
    marginBottom: 18,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: PALETTE.borderLight,
  },
  rank: { width: 32, fontWeight: 'bold', color: PALETTE.upgradeBlue, fontSize: 18 },
  name: { flex: 1, color: PALETTE.textPrimary, fontSize: 16 },
  score: { width: 70, textAlign: 'right', color: PALETTE.upgradeGreen, fontWeight: 'bold', fontSize: 16 },
  time: { width: 60, textAlign: 'right', color: PALETTE.textMuted, fontSize: 15 },
  empty: { color: PALETTE.textMuted, textAlign: 'center', marginTop: 32 },
});
