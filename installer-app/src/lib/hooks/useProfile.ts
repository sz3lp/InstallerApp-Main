import { useState, useEffect } from 'react';
import supabase from '../supabaseClient';

export interface Profile {
  user_id: string;
  onboarded: boolean;
}

export default function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    let cancel = false;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('user_id, onboarded')
        .eq('user_id', userId)
        .maybeSingle();
      if (!cancel) {
        if (data) setProfile(data as Profile);
        setLoading(false);
      }
    };
    load();
    return () => {
      cancel = true;
    };
  }, [userId]);

  return { profile, loading } as const;
}
