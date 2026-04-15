// services/cloudSave.js
import { supabase } from '../utils/supabase';

const TABLE = 'player_meta';

export async function ensureAnonAuth() {
  if (!supabase.auth.getUser) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (user) return user;
  // Sign in anonymously
  const { data } = await supabase.auth.signInAnonymously();
  return data.user;
}

export async function saveMeta(meta) {
  const user = await ensureAnonAuth();
  if (!user) throw new Error('No user');
  const { data } = await supabase
    .from(TABLE)
    .upsert([{ user_id: user.id, meta, updated_at: new Date().toISOString() }], { onConflict: ['user_id'] });
  return data;
}

export async function loadMeta() {
  const user = await ensureAnonAuth();
  if (!user) throw new Error('No user');
  const { data } = await supabase
    .from(TABLE)
    .select('meta')
    .eq('user_id', user.id)
    .single();
  return data?.meta || null;
}
