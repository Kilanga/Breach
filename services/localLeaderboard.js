import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@breach_leaderboard_v1';
const MAX_ENTRIES = 10;

export async function getLocalLeaderboard() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addLocalScore({ playerName, score, survivalTime, kills, shape }) {
  try {
    const current = await getLocalLeaderboard();
    const entry = {
      id: Date.now().toString(),
      playerName: playerName || 'Anonyme',
      score: score || 0,
      survivalTime: survivalTime || 0,
      kills: kills || 0,
      shape: shape || '?',
      date: Date.now(),
    };
    const updated = [...current, entry]
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ENTRIES);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export async function clearLocalLeaderboard() {
  await AsyncStorage.removeItem(KEY);
}
