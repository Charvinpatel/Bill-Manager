const Bill = require("../models/Bill");

// ── Generate bill number ──────────────────────────────────────────────────────
const generateBillNumber = async () => {
  const count = await Bill.countDocuments();
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `JD-${year}${month}-${String(count + 1).padStart(4, "0")}`;
};

// ── Get all bills ─────────────────────────────────────────────────────────────
exports.getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json({ success: true, bills });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get single bill ───────────────────────────────────────────────────────────
exports.getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill)
      return res
        .status(404)
        .json({ success: false, message: "Bill not found" });
    res.json({ success: true, bill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Create bill ───────────────────────────────────────────────────────────────
exports.createBill = async (req, res) => {
  try {
    const {
      vendorName,
      vendorAddress,
      vendorPhone,
      items,
      taxRate,
      status,
      notes,
    } = req.body;
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal * (taxRate || 0)) / 100;
    const grandTotal = subtotal + taxAmount;
    const billNumber = await generateBillNumber();
    const bill = new Bill({
      billNumber,
      vendorName,
      vendorAddress,
      vendorPhone,
      items,
      subtotal,
      taxRate: taxRate || 0,
      taxAmount,
      grandTotal,
      status: status || "pending",
      notes,
    });
    await bill.save();
    res.status(201).json({ success: true, bill });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── Update full bill ──────────────────────────────────────────────────────────
exports.updateBill = async (req, res) => {
  try {
    const {
      vendorName,
      vendorAddress,
      vendorPhone,
      items,
      taxRate,
      status,
      notes,
    } = req.body;
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal * (taxRate || 0)) / 100;
    const grandTotal = subtotal + taxAmount;
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      {
        vendorName,
        vendorAddress,
        vendorPhone,
        items,
        subtotal,
        taxRate: taxRate || 0,
        taxAmount,
        grandTotal,
        status: status || "pending",
        notes,
      },
      { new: true, runValidators: true },
    );
    if (!bill)
      return res
        .status(404)
        .json({ success: false, message: "Bill not found" });
    res.json({ success: true, bill });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── Update bill status ────────────────────────────────────────────────────────
exports.updateBillStatus = async (req, res) => {
  try {
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );
    if (!bill)
      return res
        .status(404)
        .json({ success: false, message: "Bill not found" });
    res.json({ success: true, bill });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── Delete bill ───────────────────────────────────────────────────────────────
exports.deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill)
      return res
        .status(404)
        .json({ success: false, message: "Bill not found" });
    res.json({ success: true, message: "Bill deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get bills by month (optionally filtered by vendor) ────────────────────────
// Query params: ?year=2025&month=3&vendorName=Rahul Textiles
// If vendorName is omitted → returns ALL vendors grouped by vendor
exports.getBillsByMonth = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const vendorName = req.query.vendorName
      ? req.query.vendorName.trim()
      : null;

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    // Build query — filter by vendor if provided
    const query = { createdAt: { $gte: start, $lte: end } };
    if (vendorName) {
      query.vendorName = { $regex: new RegExp(`^${vendorName}$`, "i") };
    }

    const bills = await Bill.find(query).sort({ vendorName: 1, createdAt: 1 });

    // ── Per-vendor summary ──────────────────────────────────────────────────
    // Group bills by vendorName and compute stats for each
    const vendorMap = {};
    bills.forEach((b) => {
      const key = b.vendorName;
      if (!vendorMap[key]) {
        vendorMap[key] = {
          vendorName: key,
          bills: [],
          totalBills: 0,
          totalRevenue: 0,
          paidRevenue: 0,
          unpaidRevenue: 0,
        };
      }
      vendorMap[key].bills.push(b);
      vendorMap[key].totalBills += 1;
      vendorMap[key].totalRevenue += b.grandTotal;
      if (b.status === "paid") {
        vendorMap[key].paidRevenue += b.grandTotal;
      } else {
        vendorMap[key].unpaidRevenue += b.grandTotal;
      }
    });

    const vendors = Object.values(vendorMap);

    // ── Overall summary ─────────────────────────────────────────────────────
    const summary = {
      totalBills: bills.length,
      totalRevenue: bills.reduce((s, b) => s + b.grandTotal, 0),
      paidRevenue: bills
        .filter((b) => b.status === "paid")
        .reduce((s, b) => s + b.grandTotal, 0),
      unpaidRevenue: bills
        .filter((b) => b.status !== "paid")
        .reduce((s, b) => s + b.grandTotal, 0),
      totalVendors: vendors.length,
    };

    // ── Distinct vendor names for the month (for dropdown) ──────────────────
    const vendorNames = vendors.map((v) => v.vendorName);

    res.json({
      success: true,
      year,
      month,
      bills,
      vendors,
      vendorNames,
      summary,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get stats ─────────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const total = await Bill.countDocuments();
    const paid = await Bill.countDocuments({ status: "paid" });
    const unpaid = await Bill.countDocuments({ status: "unpaid" });
    const pending = await Bill.countDocuments({ status: "pending" });
    const revenue = await Bill.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } },
    ]);
    res.json({
      success: true,
      stats: {
        total,
        paid,
        unpaid,
        pending,
        totalRevenue: revenue[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
