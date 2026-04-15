// Simple REST API client for leaderboard
const API_URL = 'https://breach-leaderboard.example.com/api';

export async function fetchLeaderboard() {
  const res = await fetch(`${API_URL}/leaderboard`);
  if (!res.ok) throw new Error('Erreur leaderboard');
  return res.json();
}

export async function submitScore({ playerName, score, survivalTime, kills, shape }) {
  const res = await fetch(`${API_URL}/leaderboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName, score, survivalTime, kills, shape })
  });
  if (!res.ok) throw new Error('Erreur envoi score');
  return res.json();
}
