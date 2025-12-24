'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import MainLayout from '@/components/layout/MainLayout/MainLayout';
import PartyCard from '@/components/party/PartyCard/PartyCard';
import Button from '@/components/ui/Button/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner/LoadingSpinner';
import { useToast } from '@/context/ToastContext';
import styles from './page.module.scss';

export default function PartiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [parties, setParties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/parties');
    } else if (status === 'authenticated') {
      fetchParties();
    }
  }, [status, router]);

  const fetchParties = async () => {
    try {
      const response = await fetch('/api/parties');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch parties');
      }

      setParties(data.data.parties);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredParties = () => {
    if (filter === 'active') {
      return parties.filter(p => p.status === 'collecting');
    }
    if (filter === 'completed') {
      return parties.filter(p => p.status === 'revealed' || p.status === 'archived');
    }
    return parties;
  };

  const getUserRole = (party) => {
    if (party.creator.toString() === session?.user?.id) {
      return 'creator';
    }
    return 'participant';
  };

  if (status === 'loading' || isLoading) {
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

  const filteredParties = getFilteredParties();
  const activeCount = parties.filter(p => p.status === 'collecting').length;
  const completedCount = parties.filter(p => p.status === 'revealed' || p.status === 'archived').length;

  return (
    <MainLayout>
      <div className="container" style={{ padding: '50px 20px' }}>
        <div className={styles.header}>
          <div>
            <h1>My Parties</h1>
            <p className={styles.subtitle}>
              Manage all your playlist parties in one place
            </p>
          </div>
          <Button 
            variant="primary"
            onClick={() => router.push('/create')}
          >
            + Create Party
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({parties.length})
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'active' ? styles.active : ''}`}
            onClick={() => setFilter('active')}
          >
            Active ({activeCount})
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'completed' ? styles.active : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Parties Grid */}
        {filteredParties.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🎵</div>
            <h3>No parties found</h3>
            <p>
              {filter === 'all' 
                ? "You haven't created or joined any parties yet"
                : filter === 'active'
                ? "You don't have any active parties right now"
                : "You don't have any completed parties yet"
              }
            </p>
            <Button 
              variant="primary"
              onClick={() => router.push('/create')}
              style={{ marginTop: '20px' }}
            >
              Create Your First Party
            </Button>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredParties.map((party) => (
              <PartyCard 
                key={party._id} 
                party={party}
                userRole={getUserRole(party)}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
