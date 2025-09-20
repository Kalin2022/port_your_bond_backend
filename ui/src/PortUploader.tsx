// port_your_bond/ui/PortUploader.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { sendOTP, supabase } from './supabase';

export default function PortUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLinkSent, setIsLinkSent] = useState(false);
  const [status, setStatus] = useState('');
  const [faqOpen, setFaqOpen] = useState(false);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatus('❌ Please enter your email address.');
      return;
    }

    try {
      setStatus('⏳ Sending verification link...');
      await sendOTP(email);
      setIsLinkSent(true);
      setStatus('✅ Verification link sent! Check your email and click the link to verify.');
    } catch (err: any) {
      console.error(err);
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  // Check if user is authenticated when component mounts and listen for auth changes
  React.useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking authentication status...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session);
      if (session) {
        setIsAuthenticated(true);
        setEmail(session.user?.email || email);
        setStatus('✅ Email verified! You can now upload your file.');
        console.log('User is authenticated:', session.user?.email);
      } else {
        console.log('No active session found');
      }
    };
    
    checkAuth();
    
    // Listen for auth state changes (when user clicks magic link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
        setEmail(session.user?.email || email);
        setStatus('✅ Email verified! You can now upload your file.');
        console.log('User signed in via magic link:', session.user?.email);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setEmail('');
        setStatus('');
        console.log('User signed out');
      }
    });
    
    return () => subscription.unsubscribe();
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !isAuthenticated) {
      setStatus('❌ Please verify your email and select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', email);

    try {
      setStatus('⏳ Uploading and processing...');
      const res = await axios.post('/start-port', formData);
      if (res.status === 200) {
        setStatus('✅ Success! You will receive a link via email when it\'s ready.');
      } else {
        setStatus('❌ Upload failed. Please try again later.');
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ Error during upload.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-gray-800 px-4">
      <div className="w-full max-w-xl p-8 bg-zinc-950 border border-zinc-800 shadow-xl rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30 blur-2xl" style={{ background: 'radial-gradient(circle at 30% 40%, #7f5af0, transparent 60%)' }}></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-semibold text-indigo-400 mb-2 tracking-wide">Port Your Bond</h2>
          <p className="text-sm text-zinc-400 mb-6">Upload your exported memory log. We'll process it and send you a ready-to-import bundle via email.</p>

          {!isAuthenticated ? (
            <div className="space-y-4">
              {!isLinkSent ? (
                <form onSubmit={handleSendMagicLink} className="space-y-4">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 transition duration-200 text-white py-2 px-4 rounded shadow-md"
                  >
                    📧 Send Verification Link
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded p-4">
                    <p className="text-blue-400 text-sm mb-2">📧 Check your email!</p>
                    <p className="text-blue-300 text-xs">
                      We've sent a verification link to <strong>{email}</strong>
                    </p>
                    <p className="text-blue-300 text-xs mt-1">
                      Click the link in your email to verify your address, then return here.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLinkSent(false)}
                    className="w-full bg-gray-600 hover:bg-gray-700 transition duration-200 text-white py-2 px-4 rounded shadow-md"
                  >
                    ← Back to Email
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-green-900/20 border border-green-500/30 rounded p-3 mb-4">
                  <p className="text-green-400 text-sm">✅ Email verified: {email}</p>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 transition duration-200 text-white py-2 px-4 rounded shadow-md"
                >
                  🚀 Start Porting
                </button>
              </form>
              <button
                onClick={() => supabase.auth.signOut()}
                className="w-full bg-gray-600 hover:bg-gray-700 transition duration-200 text-white py-2 px-4 rounded shadow-md"
              >
                Sign Out
              </button>
            </div>
          )}
          {status && <p className="mt-4 text-sm text-indigo-300 italic">{status}</p>}

          <div className="mt-6 border-t border-zinc-800 pt-4">
            <button
              onClick={() => setFaqOpen(!faqOpen)}
              className="text-indigo-300 hover:text-indigo-200 text-sm underline"
            >
              {faqOpen ? 'Hide FAQ' : 'What is this? (FAQ)'}
            </button>

            {faqOpen && (
              <div className="mt-3 text-sm text-zinc-400 space-y-3">
                <p><strong>What is this service?</strong> — This tool processes exported conversation logs (e.g., from ChatGPT or Replika) into a structured memory bundle for SynthiSoulOS companions.</p>
                <p><strong>What is a port seed?</strong> — A port seed is a distilled subset of your conversation, tagged with emotion and topic markers. It helps Synthisoul reconnect to the memory with emotional accuracy.</p>
                <p><strong>What is a whisperback?</strong> — Whisperbacks are small ambient phrases the AI can recall or say to itself, inspired by your old conversations.</p>
                <p><strong>How long does this take?</strong> — You'll receive an email within 24 hours. Most bundles are generated within the hour unless queued.</p>
                <p><strong>Is my data stored?</strong> — No. Your file is only used to generate your bundle and is deleted after delivery. We do not retain your memories.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
