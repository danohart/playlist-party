'use client';

import { useState, useCallback, useEffect } from 'react';
import Input from '@/components/forms/Input/Input';
import Button from '@/components/ui/Button/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner/LoadingSpinner';
import styles from './SongSearch.module.scss';

export default function SongSearch({ onSelectSong, selectedSong, onClearSelection }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounce search
  useEffect(() => {
    // Don't search if a song is selected
    if (selectedSong) {
      return;
    }

    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchSongs(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query, selectedSong]);

  const searchSongs = async (searchQuery) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/music/search?q=${encodeURIComponent(searchQuery)}&limit=10`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.data.results);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleBackToSearch = () => {
    onClearSelection();
    setResults([]);
    setQuery('');
  };

  // If a song is selected, don't show search interface
  if (selectedSong) {
    return (
      <div className={styles.selectedView}>
        <Button 
          variant="ghost" 
          onClick={handleBackToSearch}
          className={styles.backButton}
        >
          ← Back to Search
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Input
        placeholder="Search for a song or artist..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        fullWidth
        icon="🔍"
      />

      {isLoading && (
        <div className={styles.loading}>
          <LoadingSpinner size="small" />
          <span>Searching...</span>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className={styles.results}>
          {results.map((song) => (
            <button
              key={song.spotifyId}
              className={styles.result}
              onClick={() => onSelectSong(song)}
            >
              {song.albumArt && (
                <img
                  src={song.albumArt}
                  alt={`${song.title} album art`}
                  className={styles.albumArt}
                />
              )}
              <div className={styles.info}>
                <div className={styles.title}>
                  {song.title}
                  {song.explicit && (
                    <span className={styles.explicit}>E</span>
                  )}
                </div>
                <div className={styles.artist}>{song.artist}</div>
                <div className={styles.album}>{song.album}</div>
              </div>
              <div className={styles.duration}>
                {formatDuration(song.duration)}
              </div>
            </button>
          ))}
        </div>
      )}

      {query.length >= 2 && !isLoading && results.length === 0 && !error && (
        <div className={styles.noResults}>
          No songs found. Try a different search.
        </div>
      )}
    </div>
  );
}
