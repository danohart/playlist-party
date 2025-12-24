import Link from "next/link";
import styles from "./Footer.module.scss";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.brand}>
            <h3>🎵 Playlist Party</h3>
            <p>Create collaborative playlists with friends</p>
          </div>

          <div className={styles.links}>
            <div className={styles.linkColumn}>
              <h4>Product</h4>
              <Link href='/create'>Create Party</Link>
              <Link href='/dashboard'>Dashboard</Link>
              <Link href='/auth/signup'>Sign Up</Link>
            </div>

            <div className={styles.linkColumn}>
              <h4>Support</h4>
              <Link href='/about'>About</Link>
              <Link href='/contact'>Contact</Link>
              <Link href='/faq'>FAQ</Link>
            </div>

            <div className={styles.linkColumn}>
              <h4>Legal</h4>
              <Link href='/privacy'>Privacy Policy</Link>
              <Link href='/terms'>Terms of Service</Link>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>&copy; {currentYear} Playlist Party. All rights reserved.</p>
          <div className={styles.social}>
            <span>
              Built with ❤️ by{" "}
              <a href='https://danielhart.co/' target='_blank'>
                Daniel Hart
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
