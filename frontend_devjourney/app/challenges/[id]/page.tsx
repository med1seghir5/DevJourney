"use client";

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import LegoCard from '@/components/ui/LegoCard';
import LegoButton from '@/components/ui/LegoButton';
import LegoBadge from '@/components/ui/LegoBadge';
import LegoInput from '@/components/ui/LegoInput';
import ProgressBar from '@/components/ui/ProgressBar';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function ChallengeDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();

  const [challenge, setChallenge] = React.useState<any>(null);
  const [userSubmission, setUserSubmission] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [githubUrl, setGithubUrl] = React.useState('');
  const [status, setStatus] = React.useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  React.useEffect(() => {
    fetchChallenge();
  }, [id]);

  React.useEffect(() => {
    if (isAuthenticated) fetchMySubmission();
  }, [isAuthenticated, id]);

  const fetchChallenge = async () => {
    try {
      const response = await api.get(`/challenges/${id}`);
      if (response.data.success) setChallenge(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMySubmission = async () => {
    try {
      const response = await api.get('/submissions');
      if (response.data.success) {
        const sub = response.data.data.find((s: any) => s.challengeId === id || s.challengeId?._id === id);
        setUserSubmission(sub || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userSubmission) return;
    setSubmitting(true);
    setStatus(null);
    try {
      await api.post('/submissions', { challengeId: id, githubRepoLink: githubUrl });
      setStatus({ type: 'success', msg: 'MISSION SUBMITTED! BRICK PLACED 🧱' });
      setGithubUrl('');
      fetchMySubmission();
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'SUBMISSION FAILED' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-pixel-grass flex items-center justify-center font-pixel text-white">SCANNING BRICKS...</div>;
  if (!challenge) return <div className="min-h-screen bg-pixel-grass flex items-center justify-center font-pixel text-white">CHALLENGE NOT FOUND</div>;

  return (
    <div className="min-h-screen bg-pixel-grass p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-brick">
          <div>
            <Link href="/challenges" className="font-pixel text-[8px] text-lego-blue hover:text-white mb-2 inline-block">
              🔙 BACK TO MAP
            </Link>
            <h1 className="font-pixel text-4xl text-white [text-shadow:4px_4px_0px_#E3000B]">{challenge.title.toUpperCase()}</h1>
          </div>
          <div className="flex gap-4">
            <LegoBadge variant={challenge.difficulty as any}>{challenge.difficulty.toUpperCase()}</LegoBadge>
            <LegoBadge variant="status">50 XP</LegoBadge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8 animate-brick" style={{ animationDelay: '0.2s' }}>
            <LegoCard variant="white" className="border-b-[12px]">
              <h2 className="font-pixel text-sm mb-6 border-b-2 border-gray-100 pb-2">📜 INSTRUCTION BOOKLET</h2>
              <div className="font-retro text-xl leading-relaxed space-y-4">
                <p className="whitespace-pre-wrap">{challenge.description}</p>
                <h3 className="font-pixel text-[10px] mt-6 text-lego-blue">MISSION PROTOCOL:</h3>
                <ul className="list-none space-y-2">
                  <li className="flex items-center gap-2"><span className="text-lego-green">🧱</span> BUILD THE PROJECT LOCALLY</li>
                  <li className="flex items-center gap-2"><span className="text-lego-green">🧱</span> PUSH TO GITHUB REPOSITORY</li>
                  <li className="flex items-center gap-2"><span className="text-lego-green">🧱</span> SUBMIT LINK FOR REVIEW</li>
                </ul>
              </div>
            </LegoCard>
          </div>

          <div className="space-y-8 animate-brick" style={{ animationDelay: '0.4s' }}>
            <LegoCard variant="dark">
              {isAuthenticated ? (
                <>
                  <h2 className="font-pixel text-sm mb-6 uppercase">SUBMIT YOUR SOLUTION</h2>
                  <form onSubmit={handleSubmission} className="space-y-6">
                    <div className="space-y-2">
                      <label className="font-pixel text-[8px] text-lego-yellow">GITHUB REPOSITORY URL</label>
                      <input
                        type="url"
                        value={userSubmission ? userSubmission.githubRepoLink : githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        disabled={!!userSubmission}
                        className={`w-full bg-black/40 border-4 border-black p-3 font-retro text-lg text-white outline-none transition-all ${userSubmission ? 'opacity-50 cursor-not-allowed border-lego-green' : 'focus:border-lego-blue'}`}
                        placeholder="HTTPS://GITHUB.COM/..."
                        required
                      />
                    </div>

                    {userSubmission && (
                      <div className={`p-3 font-pixel text-[8px] border-2 ${userSubmission.status === 'approved' ? 'bg-lego-green/20 border-lego-green text-lego-green' : 'bg-lego-yellow/20 border-lego-yellow text-lego-yellow'}`}>
                        {userSubmission.status === 'approved' ? 'MISSION COMPLETE ✅ (+50 XP)' : 'UNDER REVIEW BY TEACHER ⏳'}
                      </div>
                    )}

                    {status && (
                      <div className={`p-3 font-pixel text-[8px] border-2 ${status.type === 'success' ? 'bg-lego-green/20 border-lego-green text-lego-green' : 'bg-lego-red/20 border-lego-red text-lego-red'}`}>
                        {status.msg}
                      </div>
                    )}

                    <LegoButton
                      type="submit"
                      variant={userSubmission?.status === 'approved' ? 'green' : userSubmission ? 'dark' : 'green'}
                      className="w-full h-14"
                      disabled={submitting || !!userSubmission}
                    >
                      {submitting ? 'UPLOADING...' :
                        userSubmission?.status === 'approved' ? 'DONE ✅' :
                          userSubmission ? 'SUBMITTED ⏳' : 'SUBMIT BRICKS 🧱'}
                    </LegoButton>
                  </form>
                </>
              ) : (
                <>
                  <h2 className="font-pixel text-sm mb-6 uppercase text-lego-yellow">🔒 MISSION LOCKED</h2>
                  <p className="font-retro text-lg text-gray-400 mb-6">
                    YOU MUST JOIN THE CORPS TO SUBMIT YOUR SOLUTION.
                  </p>
                  <div className="space-y-3">
                    <Link href="/auth/login" className="block">
                      <LegoButton variant="yellow" className="w-full h-14 !text-lego-dark">
                        LOGIN TO BUILD 🧱
                      </LegoButton>
                    </Link>
                    <p className="font-pixel text-[8px] text-gray-500 text-center">
                      NO ACCOUNT? <Link href="/auth/register" className="text-lego-blue hover:underline">REGISTER HERE</Link>
                    </p>
                  </div>
                </>
              )}
            </LegoCard>
          </div>
        </div>
      </div>
    </div>
  );
}
