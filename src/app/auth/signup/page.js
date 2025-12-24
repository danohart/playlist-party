import Link from 'next/link';
import Card from '@/components/ui/Card/Card';
import SignUpForm from '@/components/auth/SignUpForm/SignUpForm';
import styles from './page.module.scss';

export const metadata = {
  title: 'Sign Up - Playlist Party',
};

export default function SignUpPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>🎵 Playlist Party</h1>
          <h2>Create Your Account</h2>
          <p>Join the community and start creating collaborative playlists</p>
        </div>

        <Card padding="large">
          <SignUpForm />
          
          <p className={styles.footer}>
            Already have an account?{' '}
            <Link href="/auth/signin" className={styles.link}>
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
