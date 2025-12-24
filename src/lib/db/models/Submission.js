import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  partyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Party',
    required: true,
  },
  submittedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'submittedBy.userType',
      required: true,
    },
    userType: {
      type: String,
      enum: ['User', 'AnonymousUser'],
      required: true,
    },
    displayName: String,
  },
  songData: {
    title: {
      type: String,
      required: true,
    },
    artist: {
      type: String,
      required: true,
    },
    album: String,
    albumArt: String,
    duration: Number,
    releaseDate: String,
    explicit: Boolean,
    
    spotifyId: String,
    spotifyUri: String,
    appleMusicId: String,
    tidalId: String,
    
    spotifyUrl: String,
    appleMusicUrl: String,
    tidalUrl: String,
    songlinkUrl: String,
    
    availableOn: {
      spotify: { type: Boolean, default: false },
      appleMusic: { type: Boolean, default: false },
      tidal: { type: Boolean, default: false },
    },
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  downvotes: {
    type: Number,
    default: 0,
  },
  commentCount: {
    type: Number,
    default: 0,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
});

submissionSchema.index({ partyId: 1, submittedAt: 1 });
submissionSchema.index({ partyId: 1, 'submittedBy.userId': 1 });
submissionSchema.index({ partyId: 1, 'songData.spotifyId': 1 });
submissionSchema.index({ partyId: 1, upvotes: -1 });
submissionSchema.index({ partyId: 1, deletedAt: 1 });

// Prevent duplicate songs in same party
submissionSchema.index(
  { partyId: 1, 'songData.spotifyId': 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);

export default mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
