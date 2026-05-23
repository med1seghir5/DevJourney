"use client";

import React from 'react';
import api from '@/lib/api';
import LegoBadge from '@/components/ui/LegoBadge';
import LegoButton from '@/components/ui/LegoButton';
import GradeSubmissionModal from '@/components/dashboard/GradeSubmissionModal';

interface Submission {
  _id: string;
  userId: { username: string; email: string };
  challengeId: { _id: string; title: string; difficulty: string };
  githubRepoLink: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  score?: number;
  createdAt: string;
}

export default function SubmissionsSection() {
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  // Modal de notation
  const [modalSubmission, setModalSubmission] = React.useState<Submission | null>(null);

  React.useEffect(() => {
    fetchSubmissions();
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/submissions?page=${page}&limit=10`);
      if (res.data.success) {
        setSubmissions(res.data.data);
        setTotalPages(res.data.pages || 1);
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
      const res = await api.put(`/submissions/${id}/validate`, { status, feedback: '' });
      if (res.data.success) {
        setSubmissions(prev => prev.map(s => s._id === id ? { ...s, status } : s));
      }
    } catch (err) {
      console.error(err);
      alert("Validation failed");
    }
  };

  /**
   * Appel API de notation — appelé par le modal
   */
  const handleGrade = async (submissionId: string, score: number, comment: string) => {
    const res = await api.put(`/submissions/${submissionId}/grade`, { score, comment });
    if (res.data.success) {
      // Mettre à jour localement la soumission notée
      setSubmissions(prev =>
        prev.map(s =>
          s._id === submissionId
            ? { ...s, score, feedback: comment || s.feedback }
            : s
        )
      );
    }
  };

  if (loading) return <div className="text-center font-pixel text-[10px] text-gray-500 py-10 animate-pulse">LOADING SUBMISSIONS...</div>;
  if (error) return <div className="text-center font-pixel text-[10px] text-lego-red py-10">ERROR: {error}</div>;

  return (
    <>
      {/* Modal de notation */}
      {modalSubmission && (
        <GradeSubmissionModal
          submission={modalSubmission}
          onClose={() => setModalSubmission(null)}
          onGrade={handleGrade}
        />
      )}

      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-1 flex-grow bg-gradient-to-r from-lego-yellow to-transparent" />
          <h2 className="font-pixel text-lg text-lego-yellow whitespace-nowrap uppercase">Submission Control</h2>
          <div className="h-1 w-20 bg-lego-yellow/20" />
        </div>

        <div className="max-h-[600px] overflow-y-auto overflow-x-auto bg-black/20 border-4 border-black p-4 rounded-brick custom-scrollbar">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="font-pixel text-[8px] text-gray-500">
                <th className="pb-2 px-2">BUILDER</th>
                <th className="pb-2 px-2">CHALLENGE</th>
                <th className="pb-2 px-2">REPO</th>
                <th className="pb-2 px-2 text-center">STATUT</th>
                <th className="pb-2 px-2 text-center">NOTE</th>
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
                submissions.map((sub) => (
                  <tr key={sub._id} className="bg-white/5 hover:bg-white/10 transition-colors group">
                    {/* Builder */}
                    <td className="py-3 px-2 border-y-2 border-l-2 border-black/5 first:rounded-l-sm">
                      <span className="font-pixel text-[9px] text-lego-yellow">
                        {sub.userId?.username || 'ANON'}
                      </span>
                    </td>

                    {/* Challenge */}
                    <td className="py-3 px-2 border-y-2 border-black/5">
                      <div className="flex flex-col">
                        <span className="font-pixel text-[8px] uppercase">{sub.challengeId?.title}</span>
                        <LegoBadge variant={sub.challengeId?.difficulty as any} className="mt-1 !text-[6px] !px-1 !py-0">
                          {sub.challengeId?.difficulty}
                        </LegoBadge>
                      </div>
                    </td>

                    {/* Repo */}
                    <td className="py-3 px-2 border-y-2 border-black/5">
                      <a href={sub.githubRepoLink} target="_blank" rel="noreferrer" className="text-lego-blue hover:underline text-xs">
                        REPO 🔗
                      </a>
                    </td>

                    {/* Statut */}
                    <td className="py-3 px-2 border-y-2 border-black/5 text-center">
                      <span className={`font-pixel text-[7px] px-2 py-1 border ${
                        sub.status === 'approved' ? 'border-lego-green text-lego-green' :
                        sub.status === 'rejected' ? 'border-lego-red text-lego-red' :
                        'border-lego-yellow text-lego-yellow'
                      }`}>
                        {sub.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Score / XP */}
                    <td className="py-3 px-2 border-y-2 border-black/5 text-center">
                      {sub.score !== undefined ? (
                        <span className="font-pixel text-[9px] text-lego-yellow">⭐ {sub.score}</span>
                      ) : (
                        <span className="font-pixel text-[8px] text-gray-600">—</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-2 border-y-2 border-black/5 text-right font-pixel text-[7px] text-gray-500">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-2 border-y-2 border-r-2 border-black/5 last:rounded-r-sm text-right">
                      <div className="flex justify-end items-center gap-1 flex-wrap">
                        {/* Valider / Rejeter pour les soumissions pending */}
                        {sub.status === 'pending' && (
                          <>
                            <LegoButton
                              variant="green"
                              size="sm"
                              onClick={() => handleValidate(sub._id, 'approved')}
                            >
                              ✓
                            </LegoButton>
                            <LegoButton
                              variant="red"
                              size="sm"
                              onClick={() => handleValidate(sub._id, 'rejected')}
                            >
                              ✗
                            </LegoButton>
                          </>
                        )}

                        {/* Bouton NOTER — disponible pour toutes les soumissions */}
                        <button
                          id={`grade-btn-${sub._id}`}
                          onClick={() => setModalSubmission(sub)}
                          className={`font-pixel text-[6px] px-2 py-1 border-2 rounded-sm transition-all hover:scale-105 active:scale-95 ${
                            sub.score !== undefined
                              ? 'border-lego-yellow text-lego-yellow hover:bg-lego-yellow/10'
                              : 'border-lego-blue text-lego-blue hover:bg-lego-blue/10'
                          }`}
                          title={sub.score !== undefined ? 'Modifier la note' : 'Attribuer une note'}
                        >
                          {sub.score !== undefined ? '✏ NOTER' : '⭐ NOTER'}
                        </button>

                        {/* Changer de statut pour les soumissions déjà traitées */}
                        {sub.status !== 'pending' && (
                          <button
                            onClick={() => handleValidate(sub._id, sub.status === 'approved' ? 'rejected' : 'approved')}
                            className="font-pixel text-[6px] text-gray-500 hover:text-white underline ml-1"
                          >
                            SWAP
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t border-white/5 font-pixel text-[8px]">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="text-lego-blue disabled:text-gray-600 hover:scale-110 active:scale-95 transition-all uppercase"
              >
                ◄ PREVIOUS
              </button>
              <span className="text-white bg-lego-dark px-3 py-1 border-2 border-black rounded-sm">
                PAGE {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="text-lego-blue disabled:text-gray-600 hover:scale-110 active:scale-95 transition-all uppercase"
              >
                NEXT ►
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
