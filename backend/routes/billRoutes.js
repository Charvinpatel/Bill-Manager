const express = require("express");
const router = express.Router();
const {
  getAllBills,
  getBillById,
  createBill,
  updateBill,
  updateBillStatus,
  deleteBill,
  getStats,
  getBillsByMonth,
  getAllVendors, // Added getAllVendors to destructuring
} = require("../controllers/billController");

router.get("/stats", getStats);
router.get("/monthly", getBillsByMonth); // ← NEW: ?year=2025&month=3
router.get("/vendors", getAllVendors); // Added GET /vendors route
router.get("/", getAllBills);
router.get("/:id", getBillById);
router.post("/", createBill);
router.put("/:id", updateBill); // ← NEW: full edit
router.patch("/:id/status", updateBillStatus);
router.delete("/:id", deleteBill);

module.exports = router;
