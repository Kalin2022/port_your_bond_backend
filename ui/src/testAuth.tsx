import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

export default function TestAuth() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, session);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email: 'test@example.com',
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    if (error) console.error('Error:', error);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2>Auth Test</h2>
      <p>Session: {session ? 'Active' : 'None'}</p>
      <p>User: {session?.user?.email || 'None'}</p>
      <button onClick={handleSignIn}>Test Sign In</button>
      <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
    </div>
  );
}
