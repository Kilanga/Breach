// services/leaderboard.js
import { supabase } from '../utils/supabase';

const TABLE = 'leaderboard';

export async function submitScore({ playerName, score, meta = {} }) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([{ playerName, score, meta, created_at: new Date().toISOString() }]);
  if (error) throw error;
  return data;
}

export async function fetchLeaderboard({ limit = 20 } = {}) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('score', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}
