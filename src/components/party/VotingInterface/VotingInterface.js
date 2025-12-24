'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button/Button';
import Badge from '@/components/ui/Badge/Badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import styles from './VotingInterface.module.scss';

export default function VotingInterface({ 
  submissions, 
  partyId, 
  votingSystem,
  showSubmitter = false,
  onVotesSubmitted 
}) {
  const { data: session } = useSession();
  const { anonymousToken } = useAuth();
  const toast = useToast();
  const storageKey = `votes_${partyId}_${session?.user?.id || anonymousToken}`;

  // votes structure: { submissionId: { upvote: 2, downvote: 0 } }
  const [votes, setVotes] = useState({});
  const [savedVotes, setSavedVotes] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const toastShownRef = useRef(false);

  const totalSubmissions = submissions.length;
  const maxUpvotes = Math.ceil(totalSubmissions / 2);
  const maxDownvotes = votingSystem === 'upvote-downvote' ? Math.ceil(totalSubmissions / 3) : 0;

  // Calculate total votes used
  const totalUpvotesUsed = Object.values(votes).reduce((sum, v) => sum + (v.upvote || 0), 0);
  const totalDownvotesUsed = Object.values(votes).reduce((sum, v) => sum + (v.downvote || 0), 0);

  // Load votes from localStorage and server on mount
  useEffect(() => {
    loadVotesFromStorage();
    fetchSavedVotes();
  }, [partyId, session, anonymousToken]);

  // Save to localStorage whenever votes change
  useEffect(() => {
    if (Object.keys(votes).length > 0 || Object.keys(savedVotes).length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(votes));
      setHasChanges(JSON.stringify(votes) !== JSON.stringify(savedVotes));
    }
  }, [votes, savedVotes, storageKey]);

  const loadVotesFromStorage = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setVotes(parsed);
      }
    } catch (error) {
      console.error('Failed to parse stored votes:', error);
      localStorage.removeItem(storageKey);
    }
  };

  const fetchSavedVotes = async () => {
    try {
      const params = new URLSearchParams();
      if (anonymousToken) {
        params.set('userToken', anonymousToken);
      }

      const response = await fetch(`/api/parties/${partyId}/votes?${params}`);
      const data = await response.json();

      if (response.ok) {
        setSavedVotes(data.data.votes);
        // Only set votes if localStorage is empty
        const stored = localStorage.getItem(storageKey);
        if (!stored) {
          setVotes(data.data.votes);
        }
      }
    } catch (error) {
      console.error('Failed to fetch saved votes:', error);
    }
  };

  const handleVote = (submissionId, voteType, increment) => {
    toastShownRef.current = false; // Reset toast flag
    
    setVotes(prev => {
      const current = prev[submissionId] || { upvote: 0, downvote: 0 };
      const newVotes = { ...prev };
      
      // Calculate new value
      const currentCount = current[voteType] || 0;
      const newCount = Math.max(0, currentCount + increment);
      
      // Check if this would exceed limits
      const otherVoteType = voteType === 'upvote' ? 'downvote' : 'upvote';
      const tempVotes = {
        ...prev,
        [submissionId]: {
          ...current,
          [voteType]: newCount,
        }
      };
      
      const tempUpvotes = Object.values(tempVotes).reduce((sum, v) => sum + (v.upvote || 0), 0);
      const tempDownvotes = Object.values(tempVotes).reduce((sum, v) => sum + (v.downvote || 0), 0);
      
      if (voteType === 'upvote' && tempUpvotes > maxUpvotes) {
        if (!toastShownRef.current) {
          toast.error(`You can only cast ${maxUpvotes} upvote${maxUpvotes !== 1 ? 's' : ''} total`);
          toastShownRef.current = true;
        }
        return prev;
      }
      
      if (voteType === 'downvote' && tempDownvotes > maxDownvotes) {
        if (!toastShownRef.current) {
          toast.error(`You can only cast ${maxDownvotes} downvote${maxDownvotes !== 1 ? 's' : ''} total`);
          toastShownRef.current = true;
        }
        return prev;
      }
      
      // Update the vote
      newVotes[submissionId] = {
        ...current,
        [voteType]: newCount,
      };
      
      // Remove entry if both are 0
      if (newVotes[submissionId].upvote === 0 && newVotes[submissionId].downvote === 0) {
        delete newVotes[submissionId];
      }
      
      return newVotes;
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/parties/${partyId}/votes/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          votes,
          userToken: session ? null : anonymousToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit votes');
      }

      toast.success('Votes submitted successfully! 🎉');
      setSavedVotes(votes);
      setHasChanges(false);
      localStorage.removeItem(storageKey);

      if (onVotesSubmitted) {
        onVotesSubmitted();
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setVotes(savedVotes);
    localStorage.setItem(storageKey, JSON.stringify(savedVotes));
    toast.info('Votes reset to last saved state');
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.container}>
      {/* Vote Counter Header */}
      <div className={styles.header}>
        <div className={styles.counters}>
          <div className={styles.counter}>
            <span className={styles.counterLabel}>Upvotes:</span>
            <Badge variant={totalUpvotesUsed > maxUpvotes ? 'error' : 'success'}>
              {totalUpvotesUsed} / {maxUpvotes}
            </Badge>
          </div>
          {votingSystem === 'upvote-downvote' && (
            <div className={styles.counter}>
              <span className={styles.counterLabel}>Downvotes:</span>
              <Badge variant={totalDownvotesUsed > maxDownvotes ? 'error' : 'warning'}>
                {totalDownvotesUsed} / {maxDownvotes}
              </Badge>
            </div>
          )}
        </div>

        {hasChanges && (
          <Badge variant="info">Unsaved changes</Badge>
        )}
      </div>

      {/* Submissions List with Voting */}
      <div className={styles.list}>
        {submissions.map((submission, index) => {
          const userVotes = votes[submission._id] || { upvote: 0, downvote: 0 };
          const upvoteCount = userVotes.upvote || 0;
          const downvoteCount = userVotes.downvote || 0;

          return (
            <div key={submission._id} className={styles.item}>
              <div className={styles.number}>{index + 1}</div>

              {submission.songData.albumArt && (
                <img
                  src={submission.songData.albumArt}
                  alt={`${submission.songData.title} album art`}
                  className={styles.albumArt}
                />
              )}

              <div className={styles.info}>
                <div className={styles.title}>
                  {submission.songData.title}
                  {submission.songData.explicit && (
                    <span className={styles.explicit}>E</span>
                  )}
                </div>
                <div className={styles.artist}>{submission.songData.artist}</div>
                <div className={styles.meta}>
                  {submission.songData.album && (
                    <span className={styles.album}>{submission.songData.album}</span>
                  )}
                  {submission.songData.duration && (
                    <span className={styles.duration}>
                      {formatDuration(submission.songData.duration)}
                    </span>
                  )}
                </div>
                {showSubmitter && submission.submittedBy?.displayName && (
                  <div className={styles.submitter}>
                    Submitted by {submission.submittedBy.displayName}
                  </div>
                )}

                {/* Total vote counts from all users */}
                <div className={styles.voteStats}>
                  {submission.upvotes > 0 && (
                    <span className={styles.statUpvote}>
                      👍 {submission.upvotes}
                    </span>
                  )}
                  {submission.downvotes > 0 && (
                    <span className={styles.statDownvote}>
                      👎 {submission.downvotes}
                    </span>
                  )}
                </div>
              </div>

              {/* Vote Controls */}
              <div className={styles.voteControls}>
                {/* Upvote */}
                <div className={styles.voteGroup}>
                  <button
                    className={styles.voteDecrement}
                    onClick={() => handleVote(submission._id, 'upvote', -1)}
                    disabled={upvoteCount === 0}
                  >
                    −
                  </button>
                  <div className={`${styles.voteDisplay} ${upvoteCount > 0 ? styles.active : ''}`}>
                    <span className={styles.voteIcon}>👍</span>
                    <span className={styles.voteCount}>{upvoteCount}</span>
                  </div>
                  <button
                    className={styles.voteIncrement}
                    onClick={() => handleVote(submission._id, 'upvote', 1)}
                  >
                    +
                  </button>
                </div>

                {/* Downvote */}
                {votingSystem === 'upvote-downvote' && (
                  <div className={styles.voteGroup}>
                    <button
                      className={styles.voteDecrement}
                      onClick={() => handleVote(submission._id, 'downvote', -1)}
                      disabled={downvoteCount === 0}
                    >
                      −
                    </button>
                    <div className={`${styles.voteDisplay} ${styles.downvote} ${downvoteCount > 0 ? styles.active : ''}`}>
                      <span className={styles.voteIcon}>👎</span>
                      <span className={styles.voteCount}>{downvoteCount}</span>
                    </div>
                    <button
                      className={styles.voteIncrement}
                      onClick={() => handleVote(submission._id, 'downvote', 1)}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit/Reset Buttons */}
      {hasChanges && (
        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            Reset to Saved
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={totalUpvotesUsed > maxUpvotes || totalDownvotesUsed > maxDownvotes}
          >
            Submit Votes
          </Button>
        </div>
      )}

      {!hasChanges && Object.keys(savedVotes).length > 0 && (
        <div className={styles.savedMessage}>
          ✓ Your votes have been saved
        </div>
      )}
    </div>
  );
}
