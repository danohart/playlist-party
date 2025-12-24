'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import MainLayout from '@/components/layout/MainLayout/MainLayout';
import Card from '@/components/ui/Card/Card';
import Input from '@/components/forms/Input/Input';
import Button from '@/components/ui/Button/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner/LoadingSpinner';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import styles from './page.module.scss';

export default function JoinByCodePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { createAnonymousUser } = useAuth();
  const toast = useToast();

  const [party, setParty] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    fetchParty();
  }, [params.code]);

  // If user is already signed in, redirect to party
  useEffect(() => {
    if (session && party) {
      router.push(`/party/${party.partyId}`);
    }
  }, [session, party, router]);

  const fetchParty = async () => {
    try {
      const response = await fetch('/api/parties/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: params.code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find party');
      }

      setParty(data.data);
    } catch (error) {
      toast.error(error.message);
      router.push('/join');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousJoin = async (e) => {
    e.preventDefault();

    if (!displayName || displayName.trim().length < 2) {
      toast.error('Please enter a display name (at least 2 characters)');
      return;
    }

    setIsJoining(true);

    try {
      await createAnonymousUser(party.partyId, displayName.trim());
      toast.success(`Welcome, ${displayName}! 🎉`);
      router.push(`/party/${party.partyId}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className={styles.loading}>
          <LoadingSpinner size="large" />
        </div>
      </MainLayout>
    );
  }

  if (!party) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container" style={{ padding: '50px 20px' }}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h1>Join {party.name}</h1>
            {party.theme && (
              <p className={styles.theme}>{party.theme}</p>
            )}
            <p className={styles.description}>
              Choose how you'd like to join this party
            </p>
          </div>

          {/* Sign In Option */}
          <Card padding="large" style={{ marginBottom: '20px' }}>
            <h3>Sign In</h3>
            <p style={{ marginBottom: '16px', color: '#475532' }}>
              Create an account or sign in to track all your parties
            </p>
            <div className={styles.buttonGroup}>
              <Button
                variant="primary"
                onClick={() => router.push(`/auth/signin?callbackUrl=/party/${party.partyId}`)}
              >
                Sign In
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push(`/auth/signup?callbackUrl=/party/${party.partyId}`)}
              >
                Create Account
              </Button>
            </div>
          </Card>

          {/* Anonymous Option */}
          {party.allowAnonymous && (
            <Card padding="large">
              <h3>Join as Guest</h3>
              <p style={{ marginBottom: '20px', color: '#475532' }}>
                No account needed - just pick a display name
              </p>

              <form onSubmit={handleAnonymousJoin}>
                <Input
                  label="Display Name"
                  placeholder="Cool Music Fan"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={30}
                  fullWidth
                  required
                  icon="👤"
                  helperText="This is how others will see you (2-30 characters)"
                />

                <div className={styles.actions}>
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={isJoining}
                  >
                    Join as Guest
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {!party.allowAnonymous && (
            <Card padding="large">
              <h3>Account Required</h3>
              <p style={{ color: '#475532' }}>
                This party requires you to sign in or create an account to join.
              </p>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
