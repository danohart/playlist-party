import mongoose from 'mongoose';

const songCacheSchema = new mongoose.Schema({
  spotifyId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  songData: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  cachedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    index: true,
  },
});

// TTL index to auto-delete expired cache
songCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.SongCache || mongoose.model('SongCache', songCacheSchema);
