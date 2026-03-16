const Bill = require("../models/Bill");

/* ══════════════════════════════════════════════════════════
   HELPER — Generate bill number using the BILL DATE
   Format: JD-YYMM-XXXX  (e.g. JD-2503-0007)
   Uses the user-supplied billDate, not server "now"
══════════════════════════════════════════════════════════ */
const generateBillNumber = async (billDate) => {
  const d = billDate ? new Date(billDate) : new Date();
  const year = d.getFullYear().toString().slice(-2); // "25"
  const month = String(d.getMonth() + 1).padStart(2, "0"); // "03"
  const count = await Bill.countDocuments();
  return `JD-${year}${month}-${String(count + 1).padStart(4, "0")}`;
};

/* ══════════════════════════════════════════════════════════
   GET ALL BILLS
══════════════════════════════════════════════════════════ */
exports.getAllBills = async (req, res) => {
  try {
    const { search, status, sortBy, sortOrder = "desc" } = req.query;
    
    let query = {};
    
    // 1. Searching
    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { billNumber: searchRegex },
        { vendorName: searchRegex },
      ];
    }
    
    // 2. Filtering by status
    if (status && status !== "all") {
      query.status = status;
    }
    
    // 3. Sorting
    let sort = { createdAt: -1 }; // Default
    if (sortBy) {
      const order = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "newest")  sort = { createdAt: -1 };
      else if (sortBy === "oldest") sort = { createdAt: 1 };
      else if (sortBy === "highest") sort = { grandTotal: -1 };
      else if (sortBy === "lowest") sort = { grandTotal: 1 };
      else sort = { [sortBy]: order };
    }

    const bills = await Bill.find(query).sort(sort);
    res.json({ success: true, bills });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════
   GET SINGLE BILL
══════════════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════════════
   CREATE BILL
   — billNumber is generated using the user-chosen billDate
   — billDate is saved from req.body (not server now)
══════════════════════════════════════════════════════════ */
exports.createBill = async (req, res) => {
  try {
    const {
      vendorName,
      vendorPhone = "",
      vendorAddress = "",
      billDate, // ← user-chosen date from frontend
      items,
      taxRate = 0,
      status = "pending",
      notes = "",
    } = req.body;

    // Compute itemized totals
    let subtotal = 0;
    let taxAmount = 0;
    
    items.forEach(item => {
      const itemSubtotal = parseFloat(item.quantity) * parseFloat(item.price);
      const itemTax = (itemSubtotal * (parseFloat(item.taxRate) || 0)) / 100;
      
      item.taxAmount = itemTax;
      item.total = itemSubtotal + itemTax; // Total includes GST
      
      subtotal += itemSubtotal;
      taxAmount += itemTax;
    });

    const grandTotal = subtotal + taxAmount;

    // ✅ Bill number uses billDate so format matches the chosen date
    const billNumber = await generateBillNumber(billDate);

    const bill = await Bill.create({
      billNumber,
      vendorName,
      vendorPhone,
      vendorAddress,
      billDate: new Date(billDate), // ✅ always user-provided
      items,
      subtotal,
      taxRate: parseFloat(taxRate) || 0,
      taxAmount,
      grandTotal,
      status,
      notes,
    });

    res.status(201).json({ success: true, bill });
  } catch (err) {
    console.error("createBill:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════
   UPDATE FULL BILL
   — billDate is updated from req.body
   — totals are recalculated
══════════════════════════════════════════════════════════ */
exports.updateBill = async (req, res) => {
  try {
    const {
      vendorName,
      vendorPhone = "",
      vendorAddress = "",
      billDate, // ← user-chosen date from frontend
      items,
      taxRate = 0,
      status,
      notes = "",
    } = req.body;

    // Compute itemized totals
    let subtotal = 0;
    let taxAmount = 0;
    
    items.forEach(item => {
      const itemSubtotal = parseFloat(item.quantity) * parseFloat(item.price);
      const itemTax = (itemSubtotal * (parseFloat(item.taxRate) || 0)) / 100;
      
      item.taxAmount = itemTax;
      item.total = itemSubtotal + itemTax;
      
      subtotal += itemSubtotal;
      taxAmount += itemTax;
    });

    const grandTotal = subtotal + taxAmount;

    const updatePayload = {
      vendorName,
      vendorPhone,
      vendorAddress,
      items,
      subtotal,
      taxRate: parseFloat(taxRate) || 0,
      taxAmount,
      grandTotal,
      status,
      notes,
    };

    // ✅ Only update billDate if explicitly provided
    if (billDate) {
      updatePayload.billDate = new Date(billDate);
    }

    const bill = await Bill.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true,
    });

    if (!bill)
      return res
        .status(404)
        .json({ success: false, message: "Bill not found" });

    res.json({ success: true, bill });
  } catch (err) {
    console.error("updateBill:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════
   UPDATE STATUS ONLY
══════════════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════════════
   DELETE BILL
══════════════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════════════
   GET ALL UNIQUE VENDORS
══════════════════════════════════════════════════════════ */
exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await Bill.distinct("vendorName");
    res.json({ success: true, vendors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════
   GET BILLS BY MONTH
   — Queries on billDate field (falls back to createdAt for old bills)
══════════════════════════════════════════════════════════ */
exports.getBillsByMonth = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const vendorName = req.query.vendorName
      ? req.query.vendorName.trim()
      : null;

    const allTime = req.query.allTime === "true";

    let dateFilter = {};
    if (!allTime) {
      const start = new Date(Date.UTC(year, month - 1, 1));
      const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

      // ✅ Query on billDate OR createdAt so both old and new bills are included
      dateFilter = {
        $or: [
          { billDate: { $gte: start, $lte: end } },
          { billDate: { $exists: false }, createdAt: { $gte: start, $lte: end } },
        ],
      };
    }

    const query = vendorName
      ? {
          ...dateFilter,
          vendorName: { $regex: new RegExp(`^${vendorName}$`, "i") },
        }
      : dateFilter;

    const bills = await Bill.find(query).sort({ billDate: 1, createdAt: 1 });

    // Group by vendor
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
          pendingRevenue: 0,
        };
      }
      vendorMap[key].bills.push(b);
      vendorMap[key].totalBills += 1;
      vendorMap[key].totalRevenue += b.grandTotal;
      if (b.status === "paid") vendorMap[key].paidRevenue += b.grandTotal;
      else vendorMap[key].pendingRevenue += b.grandTotal;
    });

    const vendors = Object.values(vendorMap);

    const summary = {
      totalBills: bills.length,
      totalRevenue: bills.reduce((s, b) => s + b.grandTotal, 0),
      paidRevenue: bills
        .filter((b) => b.status === "paid")
        .reduce((s, b) => s + b.grandTotal, 0),
      pendingRevenue: bills
        .filter((b) => b.status !== "paid")
        .reduce((s, b) => s + b.grandTotal, 0),
      totalVendors: vendors.length,
    };

    res.json({
      success: true,
      year,
      month,
      bills,
      vendors,
      vendorNames: vendors.map((v) => v.vendorName),
      summary,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════
   GET STATS
══════════════════════════════════════════════════════════ */
exports.getStats = async (req, res) => {
  try {
    const [total, paid, pending, revenue] = await Promise.all([
      Bill.countDocuments(),
      Bill.countDocuments({ status: "paid" }),
      Bill.countDocuments({ status: "pending" }),
      Bill.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
      ]),
    ]);
    res.json({
      success: true,
      stats: {
        total,
        paid,
        pending,
        totalRevenue: revenue[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
