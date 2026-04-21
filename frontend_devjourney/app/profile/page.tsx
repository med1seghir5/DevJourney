"use client";

import React from 'react';
import LegoCard from '@/components/ui/LegoCard';
import LegoButton from '@/components/ui/LegoButton';
import LegoBadge from '@/components/ui/LegoBadge';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Submission {
  _id: string;
  challengeId: { _id: string; title: string; difficulty: string } | null;
  githubRepoLink: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  submissionDate: string;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function calcLevel(xp: number): number {
  return Math.floor(xp / 500) + 1;
}

export default function ProfilePage() {
  const { user, logout, checkAuth } = useAuthStore();
  const router = useRouter();

  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    checkAuth().then(() => {
      if (cancelled) return;
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else {
        setMounted(true);
        fetchSubmissions();
      }
    });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/submissions');
      if (res.data.success) setSubmissions(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    logout();
    router.push('/');
  };

  if (!mounted) return null;

  const xp = user?.xp || 0;
  const level = calcLevel(xp);
  const xpInCurrentLevel = xp % 500;
  const xpProgress = Math.min(100, Math.round((xpInCurrentLevel / 500) * 100));

  const approved = submissions.filter(s => s.status === 'approved');
  const pending  = submissions.filter(s => s.status === 'pending');
  const rejected = submissions.filter(s => s.status === 'rejected');

  const joinedDate = user && (user as any).createdAt
    ? new Date((user as any).createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : '—';

  const statusColor = (status: string) => {
    if (status === 'approved') return 'text-lego-green';
    if (status === 'rejected') return 'text-lego-red';
    return 'text-lego-yellow';
  };
  const statusEmoji = (status: string) => {
    if (status === 'approved') return '✅';
    if (status === 'rejected') return '❌';
    return '⏳';
  };

  return (
    <div className="min-h-screen bg-pixel-grass p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left Column ── */}
          <div className="space-y-6">
            <LegoCard variant="dark">
              <div className="flex flex-col items-center py-4">
                {/* Lego figure head */}
                <div className="w-28 h-28 bg-lego-yellow border-4 border-black rounded-brick relative mb-5 shadow-brick">
                  <div className="absolute top-9 left-5 w-3 h-3 bg-black rounded-full" />
                  <div className="absolute top-9 right-5 w-3 h-3 bg-black rounded-full" />
                  <div className="absolute bottom-7 left-1/2 -translate-x-1/2 w-7 h-2 bg-black rounded-full opacity-30" />
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-14 h-7 bg-lego-red border-2 border-black rounded-t-brick" />
                </div>

                <h1 className="font-pixel text-base text-white mb-1 uppercase">
                  {user?.username || 'BUILDER'}
                </h1>
                <p className="font-retro text-lg text-lego-yellow mb-2">
                  LEVEL {level} BUILDER
                </p>
                <span className={`font-pixel text-[8px] px-3 py-1 rounded-brick border-2 ${
                  user?.role === 'admin'   ? 'bg-lego-red  border-red-900  text-white' :
                  user?.role === 'teacher' ? 'bg-lego-blue border-blue-900 text-white' :
                                             'bg-lego-dark border-gray-700 text-gray-300'
                }`}>
                  {(user?.role || 'user').toUpperCase()}
                </span>
              </div>

              {/* XP Progress Bar */}
              <div className="mb-5 px-2">
                <div className="flex justify-between font-pixel text-[8px] text-gray-400 mb-1">
                  <span>{xp} XP</span>
                  <span>{level * 500} XP → LVL {level + 1}</span>
                </div>
                <div className="h-4 bg-black/40 border-2 border-gray-700 rounded-brick overflow-hidden">
                  <div
                    className="h-full bg-lego-green transition-all duration-700"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>

              <div className="border-t-4 border-black pt-4 space-y-3">
                <div className="flex justify-between font-retro text-base">
                  <span className="text-gray-400">EMAIL:</span>
                  <span className="text-white truncate max-w-[150px]">{user?.email || '—'}</span>
                </div>
                <div className="flex justify-between font-retro text-base">
                  <span className="text-gray-400">JOINED:</span>
                  <span className="text-white uppercase">{joinedDate}</span>
                </div>
              </div>

              <div className="mt-5">
                <LegoButton variant="red" className="w-full" size="sm" onClick={handleLogout}>
                  LOGOUT
                </LegoButton>
              </div>
            </LegoCard>

            {/* Quick stats */}
            <LegoCard variant="dark">
              <h3 className="font-pixel text-[9px] text-lego-yellow mb-4">BUILDER STATS</h3>
              <div className="space-y-3">
                {[
                  { label: 'COMPLETED', val: approved.length, color: 'text-lego-green' },
                  { label: 'PENDING',   val: pending.length,  color: 'text-lego-yellow' },
                  { label: 'REJECTED',  val: rejected.length, color: 'text-lego-red' },
                  { label: 'TOTAL XP',  val: xp,              color: 'text-lego-blue' },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center bg-black/30 px-3 py-2 rounded-brick">
                    <span className="font-pixel text-[8px] text-gray-400">{row.label}</span>
                    <span className={`font-pixel text-sm ${row.color}`}>{row.val}</span>
                  </div>
                ))}
              </div>
            </LegoCard>
          </div>

          {/* ── Right Column ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Top 3 stat cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'CHALLENGES', val: user?.completedChallenges || 0, color: 'green' },
                { label: 'SUBMISSIONS', val: submissions.length,             color: 'blue' },
                { label: 'XP EARNED',  val: xp,                             color: 'red' },
              ].map((stat, i) => (
                <LegoCard key={i} variant={stat.color as any} showStuds={false}>
                  <div className="text-center">
                    <div className="font-pixel text-[8px] opacity-70 mb-1">{stat.label}</div>
                    <div className="font-pixel text-xl">{stat.val}</div>
                  </div>
                </LegoCard>
              ))}
            </div>

            {/* Submission history */}
            <LegoCard variant="white">
              <h3 className="font-pixel text-[10px] text-black mb-6 border-b-2 border-gray-200 pb-3">
                🔨 SUBMISSION HISTORY ({submissions.length})
              </h3>

              {loading ? (
                <div className="space-y-4">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="h-14 bg-gray-100 animate-pulse rounded-brick" />
                  ))}
                </div>
              ) : submissions.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-4xl mb-3">🏗️</div>
                  <p className="font-pixel text-[9px] text-gray-400">NO SUBMISSIONS YET. START BUILDING!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((sub, i) => (
                    <div key={sub._id} className="flex items-center gap-4 group">
                      <div className="w-10 h-10 bg-lego-dark border-4 border-black rounded-brick flex items-center justify-center text-white font-pixel text-[10px] shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="font-pixel text-[9px] text-black group-hover:text-lego-blue transition-colors truncate uppercase">
                          {sub.challengeId?.title || 'Unknown Challenge'}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {sub.challengeId?.difficulty && (
                            <LegoBadge variant={sub.challengeId.difficulty as any}>
                              {sub.challengeId.difficulty}
                            </LegoBadge>
                          )}
                          <span className="font-retro text-sm text-gray-400">
                            {timeAgo(sub.createdAt || sub.submissionDate)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {sub.status === 'approved' && (
                          <div className="font-pixel text-[9px] text-lego-green">+50 XP</div>
                        )}
                        <div className={`font-pixel text-[9px] ${statusColor(sub.status)}`}>
                          {statusEmoji(sub.status)} {sub.status.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </LegoCard>
          </div>
        </div>
      </div>
    </div>
  );
}
