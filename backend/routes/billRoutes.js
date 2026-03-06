const express = require('express');
const router = express.Router();
const {
  getAllBills,
  getBillById,
  createBill,
  updateBillStatus,
  deleteBill,
  getStats
} = require('../controllers/billController');

router.get('/stats', getStats);
router.get('/', getAllBills);
router.get('/:id', getBillById);
router.post('/', createBill);
router.patch('/:id/status', updateBillStatus);
router.delete('/:id', deleteBill);

module.exports = router;
