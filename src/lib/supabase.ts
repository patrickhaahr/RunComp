import { createClient } from '@supabase/supabase-js';

// These environment variables need to be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on our schema
export type Profile = {
  id: string;
  name: string;  // User's display name
  profile_image?: string;
  created_at: string;
};

export type Run = {
  id: string;
  user_id: string;
  distance: number; // in kilometers
  time: number; // in seconds
  created_at: string;
};

export type LeaderboardEntry = {
  user_id: string;
  name: string;
  profile_image?: string;
  total_distance: number;
  total_runs: number;
  best_pace: number;
  avg_pace: number;
};

// Auth functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
};

export const updateUserEmail = async (newEmail: string) => {
  const { data, error } = await supabase.auth.updateUser({
    email: newEmail,
  });
  return { data, error };
};

export const updateUserPassword = async (password: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password,
  });
  return { data, error };
};

// Profile functions
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { profile: data as Profile | null, error };
};

export const updateProfile = async (userId: string, updates: Partial<Omit<Profile, 'id' | 'created_at'>>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  
  return { data, error };
};

export const createProfile = async (profile: { id: string, name: string, profile_image?: string }) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([profile]);
  
  return { data, error };
};

// Run functions
export const getRuns = async (userId?: string) => {
  let query = supabase.from('runs').select('*');
  
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  return { runs: data as Run[] | null, error };
};

export const addRun = async (run: Omit<Run, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('runs')
    .insert([run]);
  
  return { data, error };
};

export const updateRun = async (runId: string, updates: Partial<Omit<Run, 'id' | 'user_id' | 'created_at'>>) => {
  const { data, error } = await supabase
    .from('runs')
    .update(updates)
    .eq('id', runId);
  
  return { data, error };
};

export const deleteRun = async (runId: string) => {
  const { error } = await supabase
    .from('runs')
    .delete()
    .eq('id', runId);
  
  return { error };
};

// Leaderboard functions
export const getLeaderboard = async () => {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*');
  
  return { leaderboard: data as LeaderboardEntry[] | null, error };
};

// Functions to interact with Supabase will be added here 