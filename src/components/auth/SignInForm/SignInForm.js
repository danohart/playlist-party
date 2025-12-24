'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Input from '@/components/forms/Input/Input';
import Button from '@/components/ui/Button/Button';
import { useToast } from '@/context/ToastContext';
import styles from './SignInForm.module.scss';

export default function SignInForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Welcome back!');
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (error) {
      toast.error('Google sign in failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Email"
        type="email"
        placeholder="your.email@example.com"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        fullWidth
        required
        icon="✉️"
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        fullWidth
        required
        icon="🔒"
      />

      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={isLoading}
      >
        Sign In
      </Button>

      {/* Uncomment when Google OAuth is set up */}
      {/* <div className={styles.divider}>
        <span>or</span>
      </div>

      <Button
        type="button"
        variant="secondary"
        fullWidth
        onClick={handleGoogleSignIn}
      >
        Continue with Google
      </Button> */}
    </form>
  );
}
