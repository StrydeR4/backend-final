const Lot = require('../models/Lot');
const Category = require('../models/Category');

// Get all lots
const getLots = async (req, res) => {
  try {
    const lots = await Lot.find()
      .populate('category', 'name')
      .populate('createdBy', 'name email')
      .populate('winner', 'name email')
      .populate('bids.user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: lots });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single lot
const getLot = async (req, res) => {
  try {
    const lot = await Lot.findById(req.params.id)
      .populate('category', 'name')
      .populate('createdBy', 'name email')
      .populate('winner', 'name email')
      .populate('bids.user', 'name email');

    if (!lot) return res.status(404).json({ success: false, message: 'Not found' });

    res.json({ success: true, data: lot });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create lot (admin only)
const createLot = async (req, res) => {
  try {
    const { title, description, startBid, endDate, bidIncrement, category, images, brand, colorway, size, condition } = req.body;

    if (!title || !description || !startBid || !endDate) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const end = new Date(endDate);
    if (end <= new Date()) {
      return res.status(400).json({ success: false, message: 'End date must be in future' });
    }

    const lot = new Lot({
      title,
      description,
      startBid,
      currentBid: startBid,
      endDate: end,
      bidIncrement: bidIncrement || 10,
      category,
      images: images || [],
      brand,
      colorway,
      size,
      condition,
      createdBy: req.user.id
    });

    await lot.save();
    await lot.populate(['category', 'createdBy']);

    res.status(201).json({ success: true, message: 'Created', data: lot });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update lot
const updateLot = async (req, res) => {
  try {
    let lot = await Lot.findById(req.params.id);
    if (!lot) return res.status(404).json({ success: false, message: 'Not found' });

    if (lot.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    Object.assign(lot, req.body);
    await lot.save();

    res.json({ success: true, message: 'Updated', data: lot });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete lot
const deleteLot = async (req, res) => {
  try {
    const lot = await Lot.findById(req.params.id);
    if (!lot) return res.status(404).json({ success: false, message: 'Not found' });

    if (lot.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Lot.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Place bid
const placeBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const lot = await Lot.findById(req.params.id).populate('bids.user', 'name');

    if (!lot) return res.status(404).json({ success: false, message: 'Not found' });
    if (lot.status !== 'active') return res.status(400).json({ success: false, message: 'Not active' });
    if (new Date() > lot.endDate) return res.status(400).json({ success: false, message: 'Expired' });

    const minBid = lot.currentBid + lot.bidIncrement;
    if (amount < minBid) {
      return res.status(400).json({ success: false, message: `Min bid: $${minBid}` });
    }

    lot.currentBid = amount;
    lot.bids.push({ user: req.user.id, amount });
    await lot.save();
    await lot.populate('bids.user', 'name email');

    res.json({ success: true, message: 'Bid placed', data: lot });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get bid history
const getBids = async (req, res) => {
  try {
    const lot = await Lot.findById(req.params.id).populate('bids.user', 'name email');
    if (!lot) return res.status(404).json({ success: false, message: 'Not found' });

    res.json({
      success: true,
      data: {
        lotTitle: lot.title,
        currentBid: lot.currentBid,
        totalBids: lot.bids.length,
        bids: lot.bids
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Close auction
const closeLot = async (req, res) => {
  try {
    const lot = await Lot.findById(req.params.id);
    if (!lot) return res.status(404).json({ success: false, message: 'Not found' });

    if (lot.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (lot.bids.length > 0) {
      const lastBid = lot.bids[lot.bids.length - 1];
      lot.winner = lastBid.user;
    }

    lot.status = 'closed';
    lot.closedAt = new Date();
    await lot.save();
    await lot.populate(['createdBy', 'winner']);

    res.json({ success: true, message: 'Closed', data: lot });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getLots,
  getLot,
  createLot,
  updateLot,
  deleteLot,
  placeBid,
  getBids,
  closeLot
};
