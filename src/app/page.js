'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button/Button';
import Card from '@/components/ui/Card/Card';
import MainLayout from '@/components/layout/MainLayout/MainLayout';
import styles from './page.module.scss';

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleGetStarted = () => {
    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/auth/signup');
    }
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>
            🎵 Playlist Party
          </h1>
          <p className={styles.subtitle}>
            Create collaborative playlists with friends. Share songs, vote on favorites, and discover music together.
          </p>
          
          <div className={styles.buttons}>
            <Button 
              variant="primary" 
              size="large"
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
            {!session && (
              <Button 
                variant="secondary" 
                size="large"
                onClick={() => router.push('/auth/signin')}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

        <div className={styles.features}>
          <Card hoverable>
            <div className={styles.featureIcon}>🎤</div>
            <h3>Submit Songs</h3>
            <p>Everyone adds their favorite tracks to the collaborative playlist</p>
          </Card>

          <Card hoverable>
            <div className={styles.featureIcon}>👍</div>
            <h3>Vote & Comment</h3>
            <p>Share your thoughts and vote on the best submissions</p>
          </Card>

          <Card hoverable>
            <div className={styles.featureIcon}>🎧</div>
            <h3>Multi-Platform</h3>
            <p>Works with Spotify, Apple Music, and Tidal</p>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
