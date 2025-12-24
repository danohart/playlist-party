import './globals.scss';
import { ToastProvider } from '@/context/ToastContext';
import SessionProvider from '@/components/providers/SessionProvider';

export const metadata = {
  title: 'Playlist Party - Collaborative Music Playlists',
  description: 'Create collaborative playlists with friends. Share songs, vote, and discover music together.',
  manifest: '/manifest.json',
  themeColor: '#D2FF8B',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
