"use client";

import React, { useState } from 'react';
import LegoCard from '@/components/ui/LegoCard';
import LegoButton from '@/components/ui/LegoButton';
import LegoBadge from '@/components/ui/LegoBadge';
import Link from 'next/link';

import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { XP_REWARDS, Difficulty } from '@/lib/constants';

export default function ChallengesPage() {
  const [filter, setFilter] = useState('ALL');
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await api.get('/challenges?limit=20');
      if (response.data.success) {
        setChallenges(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateXP = (diff: string) => XP_REWARDS[diff.toLowerCase() as Difficulty] || 50;

  const filtered = challenges.filter(c => filter === 'ALL' || c.difficulty.toUpperCase() === filter);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-pixel-grass p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-2 md:px-8">
        <header className="text-center mb-16 animate-brick">
          <h1 className="font-pixel text-xl md:text-3xl lg:text-4xl text-white mb-4 tracking-tighter [text-shadow:4px_4px_0px_#006DB7]">🗺️ CHALLENGE MAP</h1>
          <p className="font-retro text-2xl text-lego-yellow uppercase tracking-widest">REAL MISSIONS FROM PIXEL COMMAND</p>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12">
          {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-pixel text-[8px] md:text-[10px] px-4 md:px-6 py-2 md:py-3 border-4 border-b-6 border-r-6 md:border-b-8 md:border-r-8 rounded-brick transition-all shadow-brick ${
                filter === f 
                ? (f === 'EASY' ? 'bg-lego-green border-[#007337] text-white' : f === 'MEDIUM' ? 'bg-lego-yellow border-[#ccac00] text-black' : f === 'HARD' ? 'bg-lego-red border-[#800000] text-white' : 'bg-lego-blue border-[#004a80] text-white')
                : 'bg-lego-dark border-black text-gray-400 hover:text-white'
              }`}
            >
              <span className="md:mr-1">{f === 'ALL' ? '🌍 ' : f === 'EASY' ? '🟢 ' : f === 'MEDIUM' ? '🟡 ' : '🔴 '}</span>
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <LegoCard variant="dark" className="h-48 bg-gray-800/50" />
              </div>
            ))
          ) : filtered.length > 0 ? (
            filtered.map((challenge, i) => (
              <div key={challenge._id} className="animate-brick" style={{ animationDelay: `${i * 0.05}s` }}>
                <LegoCard variant="white">
                  <div className="flex justify-between items-start mb-6">
                    <LegoBadge variant={challenge.difficulty as any}>{challenge.difficulty.toUpperCase()}</LegoBadge>
                    <span className="font-pixel text-[8px] text-gray-500 font-bold">{calculateXP(challenge.difficulty)} XP</span>
                  </div>
                  
                  <h3 className="font-pixel text-sm mb-6 text-black line-clamp-2 h-10 overflow-hidden uppercase">
                    {challenge.title}
                  </h3>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t-2 border-dashed border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-[8px] text-lego-blue">OPEN MISSION 🔓</span>
                    </div>
                    
                    <Link href={`/challenges/${challenge._id}`}>
                      <LegoButton variant="blue" size="sm" className="!px-3 !py-2 !text-[8px]">VIEW BRICKS</LegoButton>
                    </Link>
                  </div>
                </LegoCard>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center animate-brick">
               <div className="text-4xl mb-6">🏜️</div>
               <p className="font-pixel text-xs text-gray-400">NO MISSIONS FOUND IN THIS ZONE.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

