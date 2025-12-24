import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import styles from './MainLayout.module.scss';

export default function MainLayout({ children }) {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
