const Bill = require('../models/Bill');

// Generate bill number
const generateBillNumber = async () => {
  const count = await Bill.countDocuments();
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `JD-${year}${month}-${String(count + 1).padStart(4, '0')}`;
};

// Get all bills
exports.getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json({ success: true, bills });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single bill
exports.getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, bill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create bill
exports.createBill = async (req, res) => {
  try {
    const { vendorName, vendorAddress, vendorPhone, items, taxRate, status, notes } = req.body;

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
      status: status || 'pending',
      notes
    });

    await bill.save();
    res.status(201).json({ success: true, bill });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update bill status
exports.updateBillStatus = async (req, res) => {
  try {
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, bill });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete bill
exports.deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, message: 'Bill deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get stats
exports.getStats = async (req, res) => {
  try {
    const total = await Bill.countDocuments();
    const paid = await Bill.countDocuments({ status: 'paid' });
    const unpaid = await Bill.countDocuments({ status: 'unpaid' });
    const pending = await Bill.countDocuments({ status: 'pending' });
    const revenue = await Bill.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } }
    ]);
    res.json({
      success: true,
      stats: {
        total, paid, unpaid, pending,
        totalRevenue: revenue[0]?.total || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
