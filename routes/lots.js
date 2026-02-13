const express = require('express');
const router = express.Router();

const {
  getLots,
  getLot,
  createLot,
  updateLot,
  deleteLot,
  placeBid,
  getBids,
  closeLot
} = require('../controllers/lotController');

const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getLots);
router.get('/:id', getLot);
router.get('/:id/bids', getBids);

// Protected routes
router.post('/:id/bid', authenticate, placeBid);
router.post('/', authenticate, authorize('admin'), createLot);
router.put('/:id', authenticate, authorize('admin'), updateLot);
router.delete('/:id', authenticate, authorize('admin'), deleteLot);
router.post('/:id/close', authenticate, authorize('admin'), closeLot);

module.exports = router;