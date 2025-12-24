import Link from 'next/link';
import Card from '@/components/ui/Card/Card';
import SignInForm from '@/components/auth/SignInForm/SignInForm';
import styles from './page.module.scss';

export const metadata = {
  title: 'Sign In - Playlist Party',
};

export default function SignInPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>🎵 Playlist Party</h1>
          <h2>Welcome Back</h2>
          <p>Sign in to continue creating collaborative playlists</p>
        </div>

        <Card padding="large">
          <SignInForm />
          
          <p className={styles.footer}>
            Don't have an account?{' '}
            <Link href="/auth/signup" className={styles.link}>
              Sign up
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
