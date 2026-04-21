"use client";

import React from 'react';
import api from '@/lib/api';
import LegoBadge from '@/components/ui/LegoBadge';
import LegoButton from '@/components/ui/LegoButton';
import { XP_REWARDS, Difficulty } from '@/lib/constants';

interface Submission {
  _id: string;
  userId: { username: string; email: string };
  challengeId: { _id: string; title: string; difficulty: string };
  githubRepoLink: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  createdAt: string;
}

export default function SubmissionsSection() {
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/submissions');
      if (res.data.success) {
        setSubmissions(res.data.data);
      } else {
        setError("FAILED TO FETCH SUBMISSIONS");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "NETWORK ERROR");
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const feedback = prompt("Enter feedback (optional):") || "";
      const res = await api.put(`/submissions/${id}/validate`, { status, feedback });
      if (res.data.success) {
        setSubmissions(prev => prev.map(s => s._id === id ? { ...s, status, feedback } : s));
      }
    } catch (err) {
      console.error(err);
      alert("Validation failed");
    }
  };

  if (loading) return <div className="text-center font-pixel text-[10px] text-gray-500 py-10 animate-pulse">LOADING SUBMISSIONS...</div>;
  if (error) return <div className="text-center font-pixel text-[10px] text-lego-red py-10">ERROR: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-1 flex-grow bg-gradient-to-r from-lego-yellow to-transparent" />
        <h2 className="font-pixel text-lg text-lego-yellow whitespace-nowrap uppercase">Submission Control</h2>
        <div className="h-1 w-20 bg-lego-yellow/20" />
      </div>

      <div className="overflow-x-auto bg-black/20 border-4 border-black p-4 rounded-brick">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="font-pixel text-[8px] text-gray-500">
              <th className="pb-2 px-2">BUILDER</th>
              <th className="pb-2 px-2">CHALLENGE</th>
              <th className="pb-2 px-2">RESPONSE</th>
              <th className="pb-2 px-2 text-center">STATUS</th>
              <th className="pb-2 px-2 text-center">XP</th>
              <th className="pb-2 px-2 text-right">DATE</th>
              <th className="pb-2 px-2 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="font-retro text-lg">
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center font-pixel text-[8px] text-gray-500 italic">
                  NO SUBMISSIONS TO REVIEW
                </td>
              </tr>
            ) : (
              submissions.map((sub) => {
                const xp = XP_REWARDS[sub.challengeId?.difficulty as Difficulty] || 0;
                return (
                  <tr key={sub._id} className="bg-white/5 hover:bg-white/10 transition-colors group">
                    <td className="py-3 px-2 border-y-2 border-l-2 border-black/5 first:rounded-l-sm">
                      <span className="font-pixel text-[9px] text-lego-yellow">{sub.userId?.username || 'ANON'}</span>
                    </td>
                    <td className="py-3 px-2 border-y-2 border-black/5">
                      <div className="flex flex-col">
                        <span className="font-pixel text-[8px] uppercase">{sub.challengeId?.title}</span>
                        <LegoBadge variant={sub.challengeId?.difficulty as any} className="mt-1 !text-[6px] !px-1 !py-0">
                          {sub.challengeId?.difficulty}
                        </LegoBadge>
                      </div>
                    </td>
                    <td className="py-3 px-2 border-y-2 border-black/5">
                      <a href={sub.githubRepoLink} target="_blank" rel="noreferrer" className="text-lego-blue hover:underline text-xs">
                        REPO 🔗
                      </a>
                    </td>
                    <td className="py-3 px-2 border-y-2 border-black/5 text-center">
                      <span className={`font-pixel text-[7px] px-2 py-1 border ${sub.status === 'approved' ? 'border-lego-green text-lego-green' :
                          sub.status === 'rejected' ? 'border-lego-red text-lego-red' :
                            'border-lego-yellow text-lego-yellow'
                        }`}>
                        {sub.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-2 border-y-2 border-black/5 text-center font-pixel text-[9px]">
                      {sub.status === 'approved' ? `+${xp}` : '--'}
                    </td>
                    <td className="py-3 px-2 border-y-2 border-black/5 text-right font-pixel text-[7px] text-gray-500">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2 border-y-2 border-r-2 border-black/5 last:rounded-r-sm text-right">
                      {sub.status === 'pending' ? (
                        <div className="flex justify-end gap-1">
                          <LegoButton variant="green" size="sm" onClick={() => handleValidate(sub._id, 'approved')}>OK</LegoButton>
                          <LegoButton variant="red" size="sm" onClick={() => handleValidate(sub._id, 'rejected')}>NO</LegoButton>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleValidate(sub._id, sub.status === 'approved' ? 'rejected' : 'approved')}
                          className="font-pixel text-[6px] text-gray-500 hover:text-white underline"
                        >
                          EDIT
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
