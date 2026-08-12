const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate connections
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });
// Indexes to highly optimize the $or queries and status filtering
connectionSchema.index({ recipient: 1, status: 1 });
connectionSchema.index({ requester: 1, status: 1 });

module.exports = mongoose.model('Connection', connectionSchema);
