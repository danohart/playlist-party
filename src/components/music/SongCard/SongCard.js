import Badge from '@/components/ui/Badge/Badge';
import styles from './SongCard.module.scss';

export default function SongCard({ song }) {
  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getPlatformBadges = () => {
    const available = [];
    if (song.availableOn?.spotify) available.push('Spotify');
    if (song.availableOn?.appleMusic) available.push('Apple Music');
    if (song.availableOn?.tidal) available.push('Tidal');
    return available;
  };

  return (
    <div className={styles.card}>
      {song.albumArt && (
        <div className={styles.albumArtContainer}>
          <img
            src={song.albumArt}
            alt={`${song.title} album art`}
            className={styles.albumArt}
          />
        </div>
      )}
      
      <div className={styles.info}>
        <h3 className={styles.title}>
          {song.title}
          {song.explicit && (
            <span className={styles.explicit}>E</span>
          )}
        </h3>
        <p className={styles.artist}>{song.artist}</p>
        <p className={styles.album}>{song.album}</p>
        
        <div className={styles.meta}>
          {song.duration && (
            <span className={styles.duration}>
              {formatDuration(song.duration)}
            </span>
          )}
          
          {song.releaseDate && (
            <span className={styles.year}>
              {new Date(song.releaseDate).getFullYear()}
            </span>
          )}
        </div>
        
        <div className={styles.platforms}>
          {getPlatformBadges().map(platform => (
            <Badge key={platform} variant="success" size="small">
              ✓ {platform}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
