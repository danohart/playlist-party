"use client";

import styles from "./SubmissionList.module.scss";

export default function SubmissionList({ submissions, showSubmitter = false }) {
  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (submissions.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🎵</div>
        <h3>No songs yet</h3>
        <p>Be the first to submit a song!</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {submissions.map((submission, index) => (
        <div key={submission._id} className={styles.item}>
          <div className={styles.number}>{index + 1}</div>

          {submission.songData.albumArt && (
            <img
              src={submission.songData.albumArt}
              alt={`${submission.songData.title} album art`}
              className={styles.albumArt}
            />
          )}

          <div className={styles.info}>
            <div className={styles.title}>
              {submission.songData.title}
              {submission.songData.explicit && (
                <span className={styles.explicit}>E</span>
              )}
            </div>
            <div className={styles.artist}>{submission.songData.artist}</div>
            <div className={styles.meta}>
              {submission.songData.album && (
                <span className={styles.album}>
                  {submission.songData.album}
                </span>
              )}
              {submission.songData.duration && (
                <span className={styles.duration}>
                  {formatDuration(submission.songData.duration)}
                </span>
              )}
            </div>
            {showSubmitter && submission.submittedBy?.displayName && (
              <div className={styles.submitter}>
                Submitted by {submission.submittedBy.displayName}
              </div>
            )}
          </div>

          <div className={styles.platforms}>
            {/* Spotify Link */}
            {submission.songData.spotifyUrl && (
              <a
                href={submission.songData.spotifyUrl}
                target='_blank'
                rel='noopener noreferrer'
                className={styles.platformLink}
                title='Open in Spotify'
              >
                <img
                  src='/icons/spotify-icon.svg'
                  alt='Spotify'
                  className={styles.platformIcon}
                />
              </a>
            )}

            {/* Apple Music Link */}
            {submission.songData.appleMusicUrl && (
              <a
                href={submission.songData.appleMusicUrl}
                target='_blank'
                rel='noopener noreferrer'
                className={styles.platformLink}
                title='Open in Apple Music'
              >
                <img
                  src='/icons/apple-music-icon.svg'
                  alt='Apple Music'
                  className={styles.platformIcon}
                />
              </a>
            )}

            {/* Tidal Link */}
            {submission.songData.tidalUrl && (
              <a
                href={submission.songData.tidalUrl}
                target='_blank'
                rel='noopener noreferrer'
                className={styles.platformLink}
                title='Open in Tidal'
              >
                <img
                  src='/icons/tidal-icon.svg'
                  alt='Tidal'
                  className={styles.platformIcon}
                />
              </a>
            )}

            {/* Universal Songlink (if other platforms aren't available) */}
            {submission.songData.songlinkUrl &&
              !submission.songData.appleMusicUrl &&
              !submission.songData.tidalUrl && (
                <a
                  href={submission.songData.songlinkUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={styles.platformLink}
                  title='Open in other platforms'
                >
                  <span className={styles.platformText}>🔗</span>
                </a>
              )}
          </div>
        </div>
      ))}
    </div>
  );
}
