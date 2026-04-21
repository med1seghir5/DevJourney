"use client";

import React from 'react';
import LegoCard from '@/components/ui/LegoCard';
import LegoBadge from '@/components/ui/LegoBadge';
import Link from 'next/link';

import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function LeaderboardPage() {
  const { user: currentUser } = useAuthStore();
  const [leaders, setLeaders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/leaderboard');
      if (response.data.success) {
        setLeaders(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const topThree = leaders.slice(0, 3);
  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  return (
    <div className="min-h-screen bg-pixel-grass p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-5xl mx-auto">
        <header className="mb-16 text-center animate-brick">
          <h1 className="font-pixel text-4xl text-white mb-4 [text-shadow:4px_4px_0px_#FFD700]">🏆 HALL OF BUILDERS</h1>
          <p className="font-retro text-2xl text-lego-yellow uppercase tracking-widest">REAL-TIME GLOBAL RANKINGS</p>
        </header>

        {/* Podium */}
        {!loading && leaders.length >= 1 ? (
          <div className="flex flex-col md:flex-row items-end justify-center gap-4 mb-20 px-4">
            {/* 2nd Place */}
            {second && (
              <div className="flex-1 w-full md:w-auto animate-brick" style={{ animationDelay: '0.2s' }}>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gray-400 border-4 border-black rounded-brick mx-auto mb-2 flex items-center justify-center text-xl">🥈</div>
                  <Link href={`/profile/${second.username}`} className="font-pixel text-[10px] text-white hover:text-lego-yellow transition-colors underline decoration-dotted">
                    {second.username}
                  </Link>
                </div>
                <div className="h-48 bg-lego-blue border-x-4 border-t-4 border-blue-900 flex items-center justify-center relative">
                  <div className="font-pixel text-4xl text-blue-900/30">2</div>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {first && (
              <div className="flex-1 w-full md:w-auto animate-brick">
                <div className="text-center mb-4 scale-110">
                  <div className="w-20 h-20 bg-lego-yellow border-4 border-black rounded-brick mx-auto mb-2 flex items-center justify-center text-3xl shadow-brick">
                    👑
                  </div>
                  <Link href={`/profile/${first.username}`} className="font-pixel text-xs text-lego-yellow uppercase hover:text-white transition-colors underline decoration-dotted">
                    {first.username}
                  </Link>
                </div>
                <div className="h-64 bg-lego-red border-x-4 border-t-4 border-red-900 flex items-center justify-center relative">
                  <div className="font-pixel text-4xl text-red-900/30">1</div>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {third && (
              <div className="flex-1 w-full md:w-auto animate-brick" style={{ animationDelay: '0.4s' }}>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-lego-orange border-4 border-black rounded-brick mx-auto mb-2 flex items-center justify-center text-xl">🥉</div>
                  <Link href={`/profile/${third.username}`} className="font-pixel text-[10px] text-white hover:text-lego-yellow transition-colors underline decoration-dotted">
                    {third.username}
                  </Link>
                </div>
                <div className="h-32 bg-lego-green border-x-4 border-t-4 border-green-900 flex items-center justify-center relative">
                  <div className="font-pixel text-4xl text-green-900/30">3</div>
                </div>
              </div>
            )}
          </div>
        ) : loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="font-pixel text-xl text-lego-yellow animate-pulse">BUILDING RANKINGS...</div>
          </div>
        ) : null}

        {/* List */}
        <LegoCard variant="dark">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-4 border-black font-pixel text-[8px] text-lego-yellow">
                  <th className="py-4 px-2">RANK</th>
                  <th className="py-4">BUILDER</th>
                  <th className="py-4">XP (EST.)</th>
                  <th className="py-4">SOLVED</th>
                </tr>
              </thead>
              <tbody className="font-retro text-xl">
                {leaders.map((leader, i) => (
                  <tr
                    key={leader._id}
                    className={`border-b-2 border-black/20 hover:bg-black/10 transition-colors ${leader._id === currentUser?._id ? 'bg-lego-blue/20 text-lego-yellow' : ''
                      }`}
                  >
                    <td className="py-4 px-2 font-pixel text-xs">#{i + 1}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 border-2 border-black rounded-brick ${i === 0 ? 'bg-lego-yellow' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-lego-orange' : 'bg-lego-dark'
                          }`} />
                        <Link href={`/profile/${leader.username}`} className="hover:text-lego-blue hover:underline transition-colors decoration-dotted">
                          {leader.username}
                        </Link>
                        {leader._id === currentUser?._id && <span className="font-pixel text-[8px] ml-2 text-lego-green">(YOU)</span>}
                      </div>
                    </td>
                    <td className="py-4">{leader.xp || 0}</td>
                    <td className="py-4 font-pixel text-[10px] text-lego-yellow">{leader.completedChallenges}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {leaders.length === 0 && !loading && (
              <div className="text-center py-10 font-pixel text-[10px] text-gray-500">
                NO BUILDERS IN THE HALL YET.
              </div>
            )}
          </div>
        </LegoCard>
      </div>
    </div>
  );
}

