"use client";

import React from 'react';

interface GradeSubmissionModalProps {
  submission: {
    _id: string;
    userId: { username: string; email: string };
    challengeId: { _id: string; title: string; difficulty: string };
    githubRepoLink: string;
    status: string;
    score?: number;
    feedback?: string;
  } | null;
  onClose: () => void;
  onGrade: (submissionId: string, score: number, comment: string) => Promise<void>;
}

export default function GradeSubmissionModal({ submission, onClose, onGrade }: GradeSubmissionModalProps) {
  const [score, setScore] = React.useState<string>('');
  const [comment, setComment] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Pré-remplir si déjà noté
  React.useEffect(() => {
    if (submission) {
      setScore(submission.score !== undefined ? String(submission.score) : '');
      setComment(submission.feedback || '');
      setError(null);
    }
  }, [submission]);

  if (!submission) return null;

  const difficultyColors: Record<string, string> = {
    easy: 'text-lego-green border-lego-green',
    medium: 'text-lego-yellow border-lego-yellow',
    hard: 'text-lego-red border-lego-red',
  };
  const diffColor = difficultyColors[submission.challengeId?.difficulty] || 'text-white border-white';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numScore = parseInt(score, 10);
    if (isNaN(numScore) || numScore < 0 || numScore > 1000) {
      setError('Le score doit être un nombre entre 0 et 1000.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onGrade(submission._id, numScore, comment);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erreur lors de la notation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal panel */}
      <div
        className="relative w-full max-w-lg bg-lego-dark border-4 border-black rounded-brick shadow-[8px_8px_0px_#000] animate-brick"
        style={{ animationDuration: '0.2s' }}
      >
        {/* Header */}
        <div className="bg-lego-blue border-b-4 border-black px-6 py-4 flex items-center justify-between rounded-t-[6px]">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-lego-yellow rounded-brick border-2 border-black animate-pulse" />
            <h2 className="font-pixel text-xs text-white tracking-widest uppercase">
              📝 Attribuer une Note
            </h2>
          </div>
          <button
            onClick={onClose}
            className="font-pixel text-[10px] text-white hover:text-lego-red transition-colors border-2 border-white/30 hover:border-lego-red px-2 py-1 rounded-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {/* Infos soumission */}
          <div className="bg-black/30 border-2 border-black/50 rounded-brick p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[8px] text-gray-400">BUILDER</span>
              <span className="font-pixel text-[9px] text-lego-yellow uppercase">
                👤 {submission.userId?.username || 'ANONYME'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[8px] text-gray-400">CHALLENGE</span>
              <div className="flex items-center gap-2">
                <span className={`font-pixel text-[7px] border px-1 py-0.5 rounded-sm ${diffColor}`}>
                  {submission.challengeId?.difficulty?.toUpperCase()}
                </span>
                <span className="font-pixel text-[8px] text-white max-w-[160px] truncate uppercase">
                  {submission.challengeId?.title}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[8px] text-gray-400">REPO</span>
              <a
                href={submission.githubRepoLink}
                target="_blank"
                rel="noreferrer"
                className="font-pixel text-[8px] text-lego-blue hover:underline"
              >
                🔗 VOIR LE CODE
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[8px] text-gray-400">STATUT ACTUEL</span>
              <span className={`font-pixel text-[7px] px-2 py-0.5 border rounded-sm ${
                submission.status === 'approved' ? 'border-lego-green text-lego-green' :
                submission.status === 'rejected' ? 'border-lego-red text-lego-red' :
                'border-lego-yellow text-lego-yellow'
              }`}>
                {submission.status?.toUpperCase()}
              </span>
            </div>
            {submission.score !== undefined && (
              <div className="flex items-center justify-between border-t border-white/10 pt-2 mt-2">
                <span className="font-pixel text-[8px] text-gray-400">NOTE ACTUELLE</span>
                <span className="font-pixel text-[9px] text-lego-yellow">
                  ⭐ {submission.score} XP
                </span>
              </div>
            )}
          </div>

          {/* Score input */}
          <div className="space-y-2">
            <label className="font-pixel text-[9px] text-white uppercase tracking-widest block">
              Score / Points XP
            </label>
            <div className="relative">
              <input
                id="grade-score-input"
                type="number"
                min={0}
                max={1000}
                step={1}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="Ex: 150"
                required
                className="w-full bg-black/50 border-4 border-black focus:border-lego-yellow outline-none text-white font-retro text-2xl px-4 py-3 rounded-brick placeholder-gray-600 transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-pixel text-[9px] text-lego-yellow pointer-events-none">
                XP
              </span>
            </div>
            <p className="font-pixel text-[7px] text-gray-500">
              Valeur entre 0 et 1000 XP. Un re-calcul du delta sera appliqué si déjà noté.
            </p>
          </div>

          {/* Comment textarea */}
          <div className="space-y-2">
            <label className="font-pixel text-[9px] text-white uppercase tracking-widest block">
              Remarque / Commentaire
            </label>
            <textarea
              id="grade-comment-input"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Excellent travail sur l'architecture, mais améliore la gestion des erreurs..."
              rows={4}
              className="w-full bg-black/50 border-4 border-black focus:border-lego-blue outline-none text-white font-retro text-base px-4 py-3 rounded-brick placeholder-gray-600 resize-none transition-colors"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-lego-red/20 border-2 border-lego-red rounded-brick px-4 py-2">
              <p className="font-pixel text-[8px] text-lego-red">⚠ {error}</p>
            </div>
          )}

          {/* XP preview */}
          {score !== '' && !isNaN(parseInt(score, 10)) && (
            <div className="bg-lego-green/10 border-2 border-lego-green/50 rounded-brick px-4 py-3 flex items-center justify-between">
              <span className="font-pixel text-[8px] text-lego-green">XP ATTRIBUÉS</span>
              <span className="font-pixel text-lg text-lego-green">+{parseInt(score, 10)} XP</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 font-pixel text-[8px] text-white border-4 border-black/50 hover:border-white/30 bg-black/30 hover:bg-black/50 px-4 py-3 rounded-brick transition-all active:translate-y-1"
            >
              ANNULER
            </button>
            <button
              id="grade-submit-btn"
              type="submit"
              disabled={loading || score === ''}
              className="flex-[2] font-pixel text-[9px] text-black bg-lego-yellow hover:bg-yellow-400 border-4 border-b-[6px] border-r-[6px] border-yellow-700 px-4 py-3 rounded-brick transition-all active:translate-y-1 active:border-b-[2px] disabled:opacity-50 disabled:cursor-not-allowed shadow-brick"
            >
              {loading ? '⏳ TRAITEMENT...' : '⭐ ATTRIBUER LA NOTE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
