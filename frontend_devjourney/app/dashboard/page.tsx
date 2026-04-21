"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import LegoCard from '@/components/ui/LegoCard';
import LegoButton from '@/components/ui/LegoButton';
import LegoBadge from '@/components/ui/LegoBadge';
import dynamic from 'next/dynamic';
const SubmissionsSection = dynamic(() => import('@/components/dashboard/SubmissionsSection'), {
  loading: () => <div className="animate-pulse bg-lego-dark/50 h-64 rounded-brick" />,
  ssr: false
});

export default function DashboardPage() {
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const [mounted, setMounted] = React.useState(false);
  const [challenges, setChallenges] = React.useState<any[]>([]);
  const [leaderboard, setLeaderboard] = React.useState<any[]>([]);
  const [subCount, setSubCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const hasFetchedRef = React.useRef(false);

  React.useEffect(() => {
    let cancelled = false;
    checkAuth().then(() => {
      if (cancelled) return;
      setMounted(true);
      const { isAuthenticated: authed } = useAuthStore.getState();
      if (!authed) {
        router.push('/auth/login');
      } else if (!hasFetchedRef.current) {
        hasFetchedRef.current = true;
        fetchAllData();
      }
    });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const calls: Promise<any>[] = [fetchChallenges(), fetchLeaderboard(), fetchMySubmissions()];
      await Promise.all(calls);
    } finally {
      setLoading(false);
    }
  };

  const fetchChallenges = async () => {
    try {
      const res = await api.get('/challenges?limit=2');
      if (res.data.success) setChallenges(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/leaderboard');
      if (res.data.success) setLeaderboard(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchMySubmissions = async () => {
    try {
      const res = await api.get('/submissions');
      if (res.data.success) setSubCount(res.data.count);
    } catch (err) { console.error(err); }
  };

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch { }
    logout();
    router.push('/');
  };

  const myRank = leaderboard.findIndex(u => u._id === user?._id) + 1;
  const displayRank = myRank > 0 ? `#${myRank}` : '--';
  const dynamicStats = [
    { label: 'RANK', value: displayRank, color: 'blue', sub: 'GLOBAL POSITION' },
    { label: 'CHALLENGES', value: user?.completedChallenges?.toString() || '0', color: 'yellow', sub: 'COMPLETED' },
    { label: 'SUBMISSIONS', value: subCount.toString(), color: 'green', sub: 'TOTAL ATTEMPTS' },
    { label: 'XP', value: (user?.xp || 0).toString(), color: 'orange', sub: 'TOTAL POINTS' },
  ];

  if (!mounted || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-pixel-grass p-4 md:p-8 relative overflow-hidden">
      <div className="absolute top-20 right-[10%] w-16 h-16 bg-lego-yellow border-4 border-yellow-700 rounded-brick opacity-10 animate-float pointer-events-none" />
      <div className="absolute bottom-40 left-[5%] w-12 h-12 bg-lego-blue border-4 border-blue-900 rounded-brick opacity-5 animate-float pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-[40%] w-8 h-8 bg-lego-red border-4 border-red-900 rounded-brick opacity-5 animate-float pointer-events-none" style={{ animationDelay: '4s' }} />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-brick">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-lego-yellow rounded-brick border-2 border-black shadow-brick animate-pulse" />
              <h2 className="font-pixel text-xs text-lego-green">MISSION CONTROL</h2>
            </div>
            <h1 className="font-pixel text-3xl md:text-4xl text-lego-yellow tracking-widest drop-shadow-[4px_4px_0px_#000]">DASHBOARD</h1>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 bg-lego-dark border-4 border-black p-3 rounded-brick shadow-brick">
              <div className="text-right">
                <p className="font-pixel text-[8px] text-gray-500 mb-1">CURRENT BUILDER</p>
                <p className="font-pixel text-[10px] text-lego-yellow uppercase">{user?.username || 'MASTER BUILDER'}</p>
              </div>
              <div className="w-12 h-12 bg-lego-blue border-2 border-black rounded-brick flex items-center justify-center font-pixel text-xl text-white">
                {user?.role === 'teacher' ? '👨‍🏫' : (user?.username?.[0]?.toUpperCase() || 'M')}
              </div>
            </div>

            {(user?.role === 'teacher' || user?.role === 'admin') && (
              <div className="flex gap-2">
                <Link href="/challenges/create" className="flex-grow">
                  <LegoButton variant="blue" size="sm" className="w-full !text-[6px] lg:!text-[8px]">➕ CREATE MISSION</LegoButton>
                </Link>
                {user?.role === 'admin' && (
                  <Link href="/admin/users" className="flex-grow">
                    <LegoButton variant="red" size="sm" className="w-full !text-[6px] lg:!text-[8px]">🛡️ ADMIN PANEL</LegoButton>
                  </Link>
                )}
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {dynamicStats.map((stat, i) => (
            <div key={i} className="group animate-brick" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
              <LegoCard variant={stat.color as any} className="relative overflow-hidden transition-all group-hover:-translate-y-2 group-hover:brightness-110">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <div className="w-16 h-16 bg-white rounded-full" />
                </div>
                <div className="relative z-10">
                  <div className="font-pixel text-[10px] opacity-80 mb-3 flex items-center justify-between">
                    {stat.label} <span className="text-lg opacity-50">#</span>
                  </div>
                  <div className="font-pixel text-4xl mb-2 drop-shadow-md">{stat.value}</div>
                  <div className="font-pixel text-[8px] opacity-70 flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full" /> {stat.sub}
                  </div>
                </div>
              </LegoCard>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8 animate-brick" style={{ animationDelay: '0.6s' }}>
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-1 flex-grow bg-gradient-to-r from-lego-blue to-transparent" />
                <h2 className="font-pixel text-lg text-lego-yellow whitespace-nowrap">URGENT MISSIONS</h2>
                <div className="h-1 w-20 bg-lego-blue/20" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                  Array(2).fill(0).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <LegoCard variant="dark" className="h-40 bg-gray-800/50" />
                    </div>
                  ))
                ) : challenges.length > 0 ? (
                  challenges.map((challenge) => (
                    <LegoCard key={challenge._id} variant="dark" className="border-r-8 hover:border-r-12 transition-all group">
                      <div className="flex justify-between items-start mb-6">
                        <LegoBadge variant={challenge.difficulty as any}>{challenge.difficulty}</LegoBadge>
                        <div className="w-3 h-3 rounded-full bg-lego-yellow animate-pulse shadow-[0_0_8px_#FFD700]" />
                      </div>
                      <h3 className="font-pixel text-sm mb-6 leading-relaxed group-hover:text-lego-yellow transition-colors line-clamp-2">{challenge.title}</h3>
                      <Link href={`/challenges/${challenge._id}`} className="w-full">
                        <LegoButton variant="green" size="sm" className="w-full !text-[8px]">START MISSION 🧱</LegoButton>
                      </Link>
                    </LegoCard>
                  ))
                ) : (
                  <div className="col-span-full py-10 text-center">
                    <p className="font-pixel text-[10px] text-gray-500">NO MISSIONS AVAILABLE YET.</p>
                  </div>
                )}
              </div>
            </section>

            {(user?.role === 'teacher' || user?.role === 'admin') && (
              <section className="animate-brick">
                <SubmissionsSection />
              </section>
            )}

            <LegoCard variant="blue" className="bg-gradient-to-br from-lego-blue to-blue-900 border-none shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-pixel text-xs text-white mb-2">BONUS XP AVAILABLE</h3>
                  <p className="font-retro text-xl text-blue-200">COMPLETE 3 HARD BRICKS TODAY</p>
                </div>
                <div className="font-pixel text-2xl text-lego-yellow">+1500 XP</div>
              </div>
            </LegoCard>
          </div>

          <div className="space-y-8 animate-brick" style={{ animationDelay: '0.8s' }}>
            <LegoCard variant="dark" className="bg-lego-dark/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8 pb-4 border-b-4 border-black/40">
                <h2 className="font-pixel text-[10px] text-white">LEADERBOARD</h2>
                <span className="font-pixel text-[8px] text-lego-yellow">TOP 3</span>
              </div>
              <div className="space-y-4">
                {loading ? (
                  Array(3).fill(0).map((_, i) => <div key={i} className="h-12 bg-black/20 animate-pulse rounded-brick" />)
                ) : leaderboard.length > 0 ? (
                  leaderboard.slice(0, 3).map((row, i) => {
                    const medals = ['👑', '🥈', '🥉'];
                    const colors = ['text-lego-yellow', 'text-gray-300', 'text-orange-400'];
                    return (
                      <div key={row._id} className="group relative overflow-hidden bg-black/40 p-4 border-l-4 border-lego-blue hover:bg-black/60 transition-all cursor-pointer">
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-4">
                            <span className={`font-pixel text-xs ${colors[i]}`}>{medals[i]}</span>
                            <span className="font-retro text-xl">{row.username}</span>
                          </div>
                          <span className="font-pixel text-[10px] text-lego-yellow">{row.xp ?? row.completedChallenges} XP</span>
                        </div>
                      </div>
                    );
                  })
                ) : <p className="font-pixel text-[8px] text-center text-gray-500 py-4">NO DATA YET</p>}
              </div>
              <Link href="/leaderboard">
                <LegoButton variant="dark" size="sm" className="w-full mt-8 border-2 !text-[8px]">VIEW FULL RANKINGS</LegoButton>
              </Link>
            </LegoCard>

            <LegoCard variant="green">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-pixel text-[10px]">BUILDER PROGRESS</h2>
                <div className="w-4 h-4 bg-lego-yellow rounded-full border-2 border-black animate-bounce" />
              </div>
              <div className="space-y-6">
                <div className="font-retro text-2xl uppercase">
                  GOAL: {(Math.floor((user?.completedChallenges || 0) / 5) + 1) * 5} CHALLENGES
                </div>
                <div className="relative h-6 bg-black/40 border-4 border-green-900 rounded-brick overflow-hidden">
                  <div className="h-full bg-lego-yellow transition-all duration-1000" style={{ width: `${((user?.completedChallenges || 0) % 5) * 20}%` }} />
                </div>
                <div className="flex justify-between font-pixel text-[8px]">
                  <span className="text-white uppercase">{user?.completedChallenges || 0} SOLVED</span>
                  <span className="text-white">{((user?.completedChallenges || 0) % 5) * 20}%</span>
                </div>
              </div>
            </LegoCard>
          </div>
        </div>
      </div>

      <button onClick={handleLogout} className="fixed bottom-8 right-8 group z-50 flex items-center gap-3">
        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 border-2 border-lego-red font-pixel text-[8px] text-white opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
          LOGOUT SESSION
        </div>
        <div className="w-16 h-16 bg-lego-red border-b-[8px] border-r-[8px] border-red-900 rounded-brick shadow-brick hover:scale-110 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center text-3xl">⚡</div>
      </button>
    </div>
  );
}
