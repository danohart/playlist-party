'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button/Button';
import { useClickOutside } from '@/hooks/useClickOutside';
import styles from './Header.module.scss';

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useClickOutside(() => setIsMenuOpen(false));

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Image 
            src="/icons/favicon.png" 
            alt="Playlist Party Logo" 
            width={40} 
            height={40}
            priority
          />
          <span className={styles.logoText}>Playlist Party</span>
        </Link>

        <nav className={styles.nav}>
          {session ? (
            <>
              <Link href="/dashboard" className={styles.navLink}>
                Dashboard
              </Link>
              <Link href="/parties" className={styles.navLink}>
                My Parties
              </Link>
              <Link href="/create" className={styles.navLink}>
                Create Party
              </Link>
              
              <div className={styles.userMenu} ref={menuRef}>
                <button 
                  className={styles.userButton}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label="User menu"
                >
                  <div className={styles.avatar}>
                    {session.user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className={styles.userName}>{session.user.name}</span>
                  <span className={styles.chevron}>▼</span>
                </button>

                {isMenuOpen && (
                  <div className={styles.dropdown}>
                    <Link 
                      href="/dashboard" 
                      className={styles.dropdownItem}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/parties" 
                      className={styles.dropdownItem}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Parties
                    </Link>
                    <button 
                      className={styles.dropdownItem}
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className={styles.navLink}>
                Sign In
              </Link>
              <Button 
                variant="primary" 
                size="small"
                onClick={() => router.push('/auth/signup')}
              >
                Get Started
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
