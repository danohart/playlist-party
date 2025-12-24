import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  partyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Party',
    required: true,
    index: true,
  },
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    required: true,
    index: true,
  },
  votedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'votedBy.userType',
      required: true,
    },
    userType: {
      type: String,
      enum: ['User', 'AnonymousUser'],
      required: true,
    },
  },
  voteType: {
    type: String,
    enum: ['upvote', 'downvote'],
    required: true,
  },
  voteCount: {
    type: Number,
    default: 1,
    min: 0,
  },
  votedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to prevent duplicate vote types for same submission
voteSchema.index({ 
  partyId: 1, 
  submissionId: 1, 
  'votedBy.userId': 1,
  voteType: 1
}, { unique: true });

// Index for querying user's votes
voteSchema.index({ 'votedBy.userId': 1, partyId: 1 });

voteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Vote || mongoose.model('Vote', voteSchema);
