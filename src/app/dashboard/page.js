'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button/Button';
import Card from '@/components/ui/Card/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner/LoadingSpinner';
import MainLayout from '@/components/layout/MainLayout/MainLayout';
import styles from './page.module.scss';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <MainLayout>
        <div className={styles.loading}>
          <LoadingSpinner size="large" />
        </div>
      </MainLayout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container" style={{ marginTop: '50px', marginBottom: '50px' }}>
        <div className={styles.header}>
          <div>
            <h1>Welcome back, {session.user.name}! 👋</h1>
            <p className={styles.subtitle}>Ready to create some amazing playlists?</p>
          </div>
        </div>

        <div className={styles.grid}>
          <Card hoverable>
            <h3>🎉 Create a Party</h3>
            <p>Start a new collaborative playlist with your friends</p>
            <Button 
              variant="primary" 
              style={{ marginTop: '16px' }}
              onClick={() => router.push('/create')}
            >
              Create Party
            </Button>
          </Card>

          <Card hoverable>
            <h3>📋 My Parties</h3>
            <p>View and manage your active playlist parties</p>
            <Button 
              variant="secondary" 
              style={{ marginTop: '16px' }}
              onClick={() => router.push('/parties')}
            >
              View Parties
            </Button>
          </Card>

          <Card hoverable>
            <h3>🎵 Join a Party</h3>
            <p>Enter a party code to join an existing playlist</p>
            <Button 
              variant="ghost" 
              style={{ marginTop: '16px' }}
              onClick={() => router.push('/join')}
            >
              Join Party
            </Button>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
