import React, { useEffect, useState } from 'react';
import { SZInput } from '../../components/ui/SZInput';
import { SZButton } from '../../components/ui/SZButton';
import useAuth from '../../lib/hooks/useAuth';
import supabase from '../../lib/supabaseClient';
import uploadAvatar from '../../lib/uploadAvatar';

const InstallerProfilePage: React.FC = () => {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const email = session?.user?.email ?? '';
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('phone, avatar_url')
        .eq('user_id', userId)
        .single();
      if (data) {
        setPhone(data.phone ?? '');
        setAvatarUrl(data.avatar_url ?? null);
      }
      setLoading(false);
    };
    load();
  }, [userId]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    let url = avatarUrl;
    if (avatarFile) {
      const uploaded = await uploadAvatar(userId, avatarFile);
      if (uploaded) url = uploaded;
    }
    await supabase.from('profiles').upsert({
      user_id: userId,
      phone,
      avatar_url: url,
    });
    setAvatarUrl(url);
    setAvatarFile(null);
    setSaving(false);
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 max-w-md space-y-4">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <SZInput id="email" label="Email" value={email} onChange={() => {}} disabled />
      <SZInput id="phone" label="Phone" value={phone} onChange={setPhone} />
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Avatar</label>
        {avatarUrl && (
          <img src={avatarUrl} alt="avatar" className="h-20 w-20 rounded-full object-cover" />
        )}
        <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
      </div>
      <SZButton onClick={handleSave} isLoading={saving}>Save</SZButton>
    </div>
  );
};

export default InstallerProfilePage;
