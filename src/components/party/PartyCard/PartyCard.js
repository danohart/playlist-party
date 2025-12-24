'use client';

import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card/Card';
import Badge from '@/components/ui/Badge/Badge';
import Button from '@/components/ui/Button/Button';
import styles from './PartyCard.module.scss';

export default function PartyCard({ party, userRole }) {
  const router = useRouter();

  const deadline = new Date(party.deadline);
  const isExpired = deadline < new Date();
  const timeUntilDeadline = deadline - new Date();
  const daysUntilDeadline = Math.floor(timeUntilDeadline / (1000 * 60 * 60 * 24));
  const hoursUntilDeadline = Math.floor((timeUntilDeadline % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  const getStatusBadge = () => {
    if (party.status === 'collecting') {
      return <Badge variant="success">Active</Badge>;
    }
    if (party.status === 'revealed') {
      return <Badge variant="info">Completed</Badge>;
    }
    return <Badge variant="default">Archived</Badge>;
  };

  const getTimeRemaining = () => {
    if (isExpired || party.status !== 'collecting') {
      return null;
    }

    if (daysUntilDeadline > 0) {
      return `${daysUntilDeadline} day${daysUntilDeadline !== 1 ? 's' : ''} left`;
    }
    if (hoursUntilDeadline > 0) {
      return `${hoursUntilDeadline} hour${hoursUntilDeadline !== 1 ? 's' : ''} left`;
    }
    return 'Less than 1 hour left';
  };

  return (
    <Card hoverable onClick={() => router.push(`/party/${party._id}`)}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <div className={styles.titleRow}>
              <h3 className={styles.title}>{party.name}</h3>
              {getStatusBadge()}
            </div>
            {party.theme && (
              <p className={styles.theme}>{party.theme}</p>
            )}
          </div>
          {userRole === 'creator' && (
            <Badge variant="primary" size="small">Creator</Badge>
          )}
        </div>

        <div className={styles.info}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🎵</span>
            <span className={styles.infoText}>
              {party.totalSubmissions || 0} song{party.totalSubmissions !== 1 ? 's' : ''}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>📅</span>
            <span className={styles.infoText}>
              {deadline.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: deadline.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
              })}
            </span>
          </div>

          {getTimeRemaining() && (
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}>⏰</span>
              <span className={styles.infoText}>{getTimeRemaining()}</span>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.code}>Code: {party.code}</span>
          <Button 
            variant="ghost" 
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/party/${party._id}`);
            }}
          >
            View →
          </Button>
        </div>
      </div>
    </Card>
  );
}
