import { useState, useEffect } from 'react';
import supabase from '../supabaseClient';

export interface Profile {
  user_id: string;
  onboarded: boolean;
}

export default function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('user_id, onboarded')
      .eq('user_id', userId)
      .maybeSingle();
    if (data) setProfile(data as Profile);
    setLoading(false);
  };

  useEffect(() => {
    let cancel = false;
    const wrapped = async () => {
      if (cancel) return;
      await load();
    };
    wrapped();
    return () => {
      cancel = true;
    };
  }, [userId]);

  return { profile, loading, refresh: load } as const;
}
