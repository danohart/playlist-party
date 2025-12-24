'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import MainLayout from '@/components/layout/MainLayout/MainLayout';
import Card from '@/components/ui/Card/Card';
import Input from '@/components/forms/Input/Input';
import Button from '@/components/ui/Button/Button';
import { useToast } from '@/context/ToastContext';
import styles from './page.module.scss';

export default function JoinPartyPage() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code || code.trim().length === 0) {
      toast.error('Please enter a party code');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/parties/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join party');
      }

      toast.success('Party found!');

      // If anonymous allowed and not signed in, go to anonymous join page
      if (!session && data.data.allowAnonymous) {
        router.push(`/join/${data.data.code}`);
      } else {
        // Otherwise go directly to party
        router.push(`/party/${data.data.partyId}`);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container" style={{ padding: '50px 20px' }}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h1>Join a Party</h1>
            <p>Enter a party code to join an existing playlist</p>
          </div>

          <Card padding="large">
            <form onSubmit={handleSubmit}>
              <Input
                label="Party Code"
                placeholder="VIBE-2024-ABC"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                fullWidth
                required
                icon="🎫"
                helperText="Enter the code shared by the party creator"
              />

              <div className={styles.actions}>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={isLoading}
                >
                  Join Party
                </Button>
              </div>
            </form>
          </Card>

          {!session && (
            <Card padding="large" style={{ marginTop: '20px' }}>
              <h3>Don't have an account?</h3>
              <p style={{ marginBottom: '16px', color: '#475532' }}>
                You can join as a guest, or sign in to track all your parties
              </p>
              <Button
                variant="secondary"
                onClick={() => router.push('/auth/signup')}
              >
                Create Account
              </Button>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
