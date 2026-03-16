const mongoose = require("mongoose");

const billItemSchema = new mongoose.Schema({
  designName: { type: String, required: true },
  designType: { type: String, default: "" },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  total: { type: Number, required: true },
});

const billSchema = new mongoose.Schema({
  billNumber: { type: String, required: true, unique: true },
  vendorName: { type: String, required: true },
  vendorAddress: { type: String, default: "" },
  vendorPhone: { type: String, default: "" },
  billDate: { type: Date, required: true },
  items: [billItemSchema],
  subtotal: { type: Number, required: true },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  status: {
    type: String,
    enum: ["paid", "unpaid", "pending"],
    default: "pending",
  },
  notes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Bill", billSchema);
