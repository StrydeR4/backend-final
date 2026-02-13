const mongoose = require('mongoose');

// Bid sub-schema
const bidSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const lotSchema = new mongoose.Schema({
  // Product info
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10
  },
  brand: {
    type: String,
    enum: ['Nike', 'Adidas', 'Jordan', 'Puma', 'New Balance', 'Reebok', 'Vans', 'Converse', 'Other'],
    default: 'Other'
  },
  colorway: String,
  size: {
    type: Number,
    min: 1,
    max: 15
  },
  condition: {
    type: String,
    enum: ['DS', 'VNDS', 'Lightly Worn', 'Well Worn', 'Used'],
    default: 'VNDS'
  },
  material: String,
  year: {
    type: Number,
    min: 1980,
    max: new Date().getFullYear()
  },

  // Auction info
  startBid: {
    type: Number,
    required: true,
    min: 0
  },
  currentBid: {
    type: Number,
    default: function() { return this.startBid; }
  },
  bidIncrement: {
    type: Number,
    default: 10,
    min: 1
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'pending'],
    default: 'active'
  },

  // Relations
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Dates
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) { return v > new Date(); },
      message: 'End date must be in future'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  closedAt: Date,

  // Bids & Images
  bids: [bidSchema],
  images: [{ type: String }]

}, { timestamps: true });

// Create indexes
lotSchema.index({ status: 1, endDate: 1 });
lotSchema.index({ createdBy: 1 });
lotSchema.index({ category: 1 });

// Methods
lotSchema.methods.placeBid = function(userId, amount) {
  if (amount <= this.currentBid) {
    throw new Error('Bid must be higher than current bid');
  }
  this.currentBid = amount;
  this.bids.push({ user: userId, amount });
  return this.save();
};

lotSchema.methods.closeAuction = function(winnerId) {
  this.status = 'closed';
  this.closedAt = new Date();
  if (winnerId) this.winner = winnerId;
  return this.save();
};

// Statics
lotSchema.statics.closeExpiredLots = async function() {
  return this.updateMany(
    { status: 'active', endDate: { $lt: new Date() } },
    { status: 'closed', closedAt: new Date() }
  );
};

module.exports = mongoose.model('Lot', lotSchema);