// port_your_bond/ui/PortUploader.tsx
import React, { useState } from 'react';
import axios from 'axios';

export default function PortUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [faqOpen, setFaqOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !email || password !== import.meta.env.VITE_UPLOAD_PASSWORD) {
      setStatus('❌ Please enter valid password, file, and email.');
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Access password"
              className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="email"
              placeholder="Your email address"
              className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="file"
              accept=".json"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 transition duration-200 text-white py-2 px-4 rounded shadow-md"
            >
              🚀 Start Porting
            </button>
          </form>
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
