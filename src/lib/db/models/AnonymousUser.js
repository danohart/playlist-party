import mongoose from 'mongoose';

const anonymousUserSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 30,
  },
  partyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Party',
    required: true,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000, // TTL: 30 days (auto-delete)
  },
});

// Compound index for party + display name uniqueness
anonymousUserSchema.index({ partyId: 1, displayName: 1 }, { unique: true });

export default mongoose.models.AnonymousUser || mongoose.model('AnonymousUser', anonymousUserSchema);
