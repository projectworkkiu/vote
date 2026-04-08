'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Candidate {
  id: string;
  name: string;
  photo: string | null;
  bio: string | null;
}

interface Position {
  id: string;
  name: string;
  candidates: Candidate[];
}

interface Election {
  id: string;
  title: string;
  positions: Position[];
  hasVoted?: boolean;
}

export default function VotingBoothPage({ params }: { params: Promise<{ electionId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/elections/${resolvedParams.electionId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          toast.error(data.error);
          router.push('/vote');
          return;
        }
        if (data.hasVoted) {
          toast.error('You have already voted in this election.');
          router.push('/vote');
          return;
        }
        // Filter out positions with no candidates
        const validPositions = (data.positions || []).filter((p: Position) => p.candidates && p.candidates.length > 0);
        setElection({ ...data, positions: validPositions });
      })
      .catch(() => toast.error('Failed to load election'))
      .finally(() => setLoading(false));
  }, [resolvedParams.electionId, router]);

  const handleSelect = (positionId: string, candidateId: string) => {
    setSelections({ ...selections, [positionId]: candidateId });
  };

  const currentPosition = election?.positions[currentStep];
  const isLastStep = currentStep === (election?.positions?.length || 0) - 1;
  const isComplete = Object.keys(selections).length === (election?.positions?.length || 0);

  const handleSubmit = async () => {
    if (!isComplete) {
      toast.error('Please vote for all positions');
      return;
    }

    setSubmitting(true);
    const votes = Object.entries(selections).map(([positionId, candidateId]) => ({
      positionId,
      candidateId,
    }));

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ electionId: election?.id, votes }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Vote submitted successfully!');
        router.push(`/vote/confirmation?token=${data.receiptToken}`);
      } else {
        toast.error(data.error || 'Failed to submit vote');
      }
    } catch {
      toast.error('Network error during submission');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner spinner-lg" /></div>;
  if (!election || election.positions.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--slate-500)' }}>No candidates available for this election yet.</p>
        <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => router.push('/vote')}>Go Back</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{election.title}</h1>
        {/* Progress Bar */}
        <div style={{ marginTop: '1rem', background: 'var(--slate-800)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(Object.keys(selections).length / election.positions.length) * 100}%` }}
            style={{ height: '100%', background: 'linear-gradient(90deg, var(--green-600), var(--green-400))' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--slate-400)' }}>
          <span>Step {currentStep + 1} of {election.positions.length}</span>
          <span>{Object.keys(selections).length} of {election.positions.length} selected</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
              Select: <span className="gradient-text">{currentPosition?.name}</span>
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1rem' }}>
              {currentPosition?.candidates.map((c) => {
                const isSelected = selections[currentPosition.id] === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelect(currentPosition.id, c.id)}
                    style={{
                      background: isSelected ? 'rgba(16, 185, 129, 0.1)' : 'var(--slate-800)',
                      border: `1px solid ${isSelected ? 'var(--green-500)' : 'var(--slate-700)'}`,
                      borderRadius: '0.75rem',
                      padding: '1.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative',
                      overflow: 'hidden',
                      transform: isSelected ? 'translateY(-2px)' : 'none',
                      boxShadow: isSelected ? '0 8px 24px rgba(16, 185, 129, 0.2)' : 'none',
                    }}
                  >
                    {isSelected && (
                      <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', color: 'var(--green-400)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <div style={{
                        width: '80px', height: '80px', borderRadius: '50%', marginBottom: '1rem',
                        background: c.photo ? `url(${c.photo}) center/cover` : 'var(--slate-700)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', fontWeight: 700, color: 'var(--slate-500)',
                        border: `3px solid ${isSelected ? 'var(--green-400)' : 'var(--slate-600)'}`
                      }}>
                        {!c.photo && c.name.charAt(0).toUpperCase()}
                      </div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>{c.name}</h3>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--slate-400)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {c.bio || 'No bio provided'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '1rem', background: 'var(--slate-900)', borderRadius: '0.75rem', border: '1px solid var(--slate-800)' }}>
        <button
          className="btn btn-secondary"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          ← Previous
        </button>
        
        {!isLastStep ? (
          <button
            className="btn btn-primary"
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!selections[currentPosition?.id || '']}
          >
            Next →
          </button>
        ) : (
          <button
            className="btn btn-primary"
            style={{
              background: isComplete ? 'linear-gradient(135deg, var(--green-600), var(--green-500))' : 'var(--slate-700)',
              cursor: isComplete && !submitting ? 'pointer' : 'not-allowed',
            }}
            onClick={handleSubmit}
            disabled={!isComplete || submitting}
          >
            {submitting ? <span className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Submit Vote 🗳️'}
          </button>
        )}
      </div>
    </div>
  );
}
