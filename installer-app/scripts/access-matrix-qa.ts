import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY as string;
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const users = [
  { email: process.env.INSTALLER_EMAIL!, password: process.env.INSTALLER_PASSWORD!, role: 'Installer' },
  { email: process.env.ADMIN_EMAIL!, password: process.env.ADMIN_PASSWORD!, role: 'Admin' },
  { email: process.env.MANAGER_EMAIL!, password: process.env.MANAGER_PASSWORD!, role: 'Manager' },
  { email: process.env.SALES_EMAIL!, password: process.env.SALES_PASSWORD!, role: 'Sales' },
];

async function testAccess(email: string, password: string, role: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    console.error(`Failed to login ${role}:`, error?.message);
    return;
  }
  const token = data.session.access_token;

  const headers = { Authorization: `Bearer ${token}` };
  for (const route of routes) {
    const res = await fetch(`${BASE_URL}${route.path}`, { redirect: 'manual', headers });
    const ok = res.status === 200;
    const redirected = res.status === 302 || res.status === 301;
    const pass = route.allowed.includes(role) ? ok : redirected || res.status === 403;
    const symbol = pass ? '✔' : '✖';
    const note = pass ? '✅' : `❌ (${res.status})`;
    console.log(`${symbol} ${role}: ${route.path} ${note}`);
  }
  await supabase.auth.signOut();
}

const routes = [
  { path: '/', allowed: ['Installer'] },
  { path: '/admin/users', allowed: ['Admin'] },
  { path: '/manager/qa', allowed: ['Manager'] },
];

(async () => {
  for (const u of users) {
    if (u.email && u.password) {
      await testAccess(u.email, u.password, u.role);
    }
  }
})();
