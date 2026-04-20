"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import LegoCard from '@/components/ui/LegoCard';
import LegoButton from '@/components/ui/LegoButton';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function CreateChallengePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    difficulty: 'medium'
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (user && user.role === 'user') {
      router.push('/dashboard');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await api.post('/challenges', formData);
      if (response.data.challenge) {
        setSuccess(true);
        setFormData({ title: '', description: '', difficulty: 'medium' });
        setTimeout(() => router.push('/dashboard'), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating challenge');
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-pixel-grass flex items-center justify-center p-4">
        <LegoCard variant="red">
          <p className="font-pixel text-xs text-white">ACCESS DENIED: TEACHERS ONLY 🛑</p>
        </LegoCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pixel-grass p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-12 text-center animate-brick">
          <h1 className="font-pixel text-4xl text-white mb-4 [text-shadow:4px_4px_0px_#FFD700]">🏗️ CHALLENGE CREATOR</h1>
          <p className="font-retro text-2xl text-lego-yellow uppercase tracking-widest">BUILD A NEW MISSION FOR YOUR STUDENTS</p>
        </header>

        <LegoCard variant="dark" className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="font-pixel text-[10px] text-lego-yellow block uppercase">Mission Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-black/40 border-4 border-black p-4 font-retro text-xl text-white focus:border-lego-blue outline-none transition-all placeholder:text-gray-600"
                placeholder="E.G. PIXEL ART ENGINE"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="font-pixel text-[10px] text-lego-yellow block uppercase">Mission Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-black/40 border-4 border-black p-4 font-retro text-xl text-white focus:border-lego-blue outline-none transition-all h-40 resize-none placeholder:text-gray-600"
                placeholder="DESCRIBE THE MISSION DETAILS..."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="font-pixel text-[10px] text-lego-yellow block uppercase">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-4">
                {['easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, difficulty: level })}
                    className={`p-3 font-pixel text-[8px] border-4 border-black transition-all ${
                      formData.difficulty === level 
                        ? (level === 'easy' ? 'bg-lego-green' : level === 'medium' ? 'bg-lego-yellow text-black' : 'bg-lego-red')
                        : 'bg-black/20 text-gray-500 opacity-50'
                    }`}
                  >
                    {level.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-lego-red/20 border-2 border-lego-red p-3 font-pixel text-[8px] text-lego-red text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-lego-green/20 border-2 border-lego-green p-3 font-pixel text-[8px] text-lego-green text-center animate-bounce">
                MISSION CREATED SUCCESSFULLY! 🧱
              </div>
            )}

            <LegoButton 
              type="submit" 
              variant="blue" 
              className="w-full h-16 text-xl tracking-widest"
              disabled={loading}
            >
              {loading ? 'DEPLOYING...' : 'DEPLOY MISSION 🚀'}
            </LegoButton>
          </form>
        </LegoCard>

        <div className="mt-8 text-center">
          <LegoButton variant="dark" size="sm" onClick={() => router.push('/dashboard')}>
             BACK TO BASE
          </LegoButton>
        </div>
      </div>
    </div>
  );
}
