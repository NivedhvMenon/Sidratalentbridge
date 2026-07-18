import React from 'react';
import { createClient } from '@/utils/supabase/server';
import NavbarClient from './NavbarClient';

export default async function Navbar() {
  const supabase = await createClient();
  
  // Safe getUser execution
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
  } catch (err) {
    // Ignore auth connection issue during page pre-rendering/static builds
  }

  const role = user?.user_metadata?.role;

  return <NavbarClient user={user} role={role} />;
}
