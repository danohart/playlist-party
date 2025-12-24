'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import MainLayout from '@/components/layout/MainLayout/MainLayout';
import Card from '@/components/ui/Card/Card';
import Button from '@/components/ui/Button/Button';
import SongSearch from '@/components/music/SongSearch/SongSearch';
import SongCard from '@/components/music/SongCard/SongCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner/LoadingSpinner';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import styles from './page.module.scss';

export default function SubmitSongPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { anonymousToken } = useAuth();
  const toast = useToast();
  
  const [selectedSong, setSelectedSong] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolvedSongData, setResolvedSongData] = useState(null);

  const handleSelectSong = async (song) => {
    setSelectedSong(song);
    setIsResolving(true);

    try {
      // Resolve multi-platform links
      const response = await fetch('/api/music/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spotifyId: song.spotifyId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resolve song');
      }

      setResolvedSongData(data.data);
    } catch (error) {
      toast.error(error.message);
      setSelectedSong(null);
    } finally {
      setIsResolving(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedSong(null);
    setResolvedSongData(null);
  };

  const handleSubmit = async () => {
    if (!resolvedSongData) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/parties/${params.partyId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songData: resolvedSongData,
          userToken: session ? null : anonymousToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit song');
      }

      toast.success('Song submitted successfully! 🎉');
      router.push(`/party/${params.partyId}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container" style={{ padding: '50px 20px' }}>
        <div className={styles.header}>
          <h1>Submit a Song</h1>
          <p>Search for a song to add to the playlist</p>
        </div>

        <div className={styles.content}>
          <Card padding="large">
            <SongSearch 
              onSelectSong={handleSelectSong}
              selectedSong={selectedSong}
              onClearSelection={handleClearSelection}
            />

            {isResolving && (
              <div className={styles.loading}>
                <LoadingSpinner />
                <p>Resolving song across platforms...</p>
              </div>
            )}

            {selectedSong && resolvedSongData && !isResolving && (
              <div className={styles.confirmation}>
                <h2>Confirm Submission</h2>
                <p style={{ marginBottom: '20px', color: '#475532' }}>
                  Make sure this is the right song before submitting
                </p>
                
                <SongCard song={resolvedSongData} />

                <div className={styles.actions}>
                  <Button
                    variant="secondary"
                    onClick={handleClearSelection}
                  >
                    Choose Different Song
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    loading={isSubmitting}
                  >
                    Submit This Song
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
