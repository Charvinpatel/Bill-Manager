import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { createBill } from "../api";
import { generateBillPDF } from "../pdfGenerator";
import { Select } from "antd";

/* ── Constants ── */
const DESIGN_TYPES = [
  "Saree",
  "Dupatta",
  "Kurti",
  "Lehenga",
  "Shawl",
  "Stole",
  "Fabric",
  "Other",
];
const emptyItem = (prev = {}) => ({
  // Vendor Info
  vendorName: prev.vendorName || "",
  vendorPhone: prev.vendorPhone || "",
  vendorAddress: prev.vendorAddress || "",
  billDate: prev.billDate || new Date().toISOString().split("T")[0],
  status: prev.status || "pending",
  
  // Design Info
  designName: prev.designName || "",
  designType: prev.designType || "",
  quantity: prev.quantity || 1,
  price: prev.price || "",
  taxRate: prev.taxRate !== undefined ? prev.taxRate : 0,
  taxAmount: 0,
  total: 0,
});

/* ── Yup Validation Schema ── */
const schema = Yup.object({
  items: Yup.array()
    .of(
      Yup.object({
        vendorName: Yup.string().trim().required("Name required"),
        vendorPhone: Yup.string().matches(/^$|^[6-9]\d{9}$/, "Invalid").nullable(),
        billDate: Yup.date().required("Required"),
        status: Yup.string().oneOf(["paid", "pending"]).required(),
        designName: Yup.string().trim().required("Design required"),
        quantity: Yup.number().min(1, "Min 1").required(),
        price: Yup.number().moreThan(0, "Must be > 0").required(),
        taxRate: Yup.number().min(0).max(100).required(),
      })
    )
    .min(1),
});

/* ── Icons ── */
const IUser = () => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#7C3AED"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IDesign = () => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#D97706"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);
const INote = () => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#16A34A"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const IPlus = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IX = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const ITrash = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const IDownload = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IBill = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 3 2 3-2 3 2 3-2 3 2V4a2 2 0 0 0-2-2z" />
    <line x1="16" y1="9" x2="8" y2="9" />
    <line x1="16" y1="13" x2="8" y2="13" />
  </svg>
);
const ICal = () => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#7C3AED"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

/* ── Field wrapper ── */
const F = ({ label, required, err, touched, children }) => (
  <div>
    <label className="sp-label">
      {label}
      {required && <span style={{ color: "#EF4444" }}> *</span>}
    </label>
    {children}
    {touched && err && (
      <p className="sp-err">
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {err}
      </p>
    )}
  </div>
);

/* ── Section header ── */
const SectionHead = ({ icon, title, sub, iconBg }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}
  >
    <div
      style={{
        width: 38,
        height: 38,
        background: iconBg,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <h3
        style={{ color: "#111827", fontSize: 15, fontWeight: 700, margin: 0 }}
      >
        {title}
      </h3>
      <p style={{ color: "#9CA3AF", fontSize: 12, margin: "2px 0 0" }}>{sub}</p>
    </div>
  </div>
);

/* ── Success screen ── */
const SuccessScreen = ({ bill, onReset, onHistory }) => (
  <div
    style={{
      background: "#F5F3FF",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}
  >
    <div
      className="sp-card"
      style={{
        padding: "44px 36px",
        maxWidth: 460,
        width: "100%",
        textAlign: "center",
        boxShadow: "0 20px 60px rgba(124,58,237,0.14)",
      }}
    >
      <div
        style={{
          width: 76,
          height: 76,
          background: "#DCFCE7",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 18px",
        }}
      >
        <svg
          width="38"
          height="38"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#16A34A"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <h2
        style={{
          color: "#111827",
          fontSize: 26,
          fontWeight: 800,
          fontFamily: "DM Serif Display, Georgia, serif",
          marginBottom: 6,
        }}
      >
        Bill Created!
      </h2>
      <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 4 }}>
        Bill No:{" "}
        <span
          style={{
            fontFamily: "JetBrains Mono, monospace",
            color: "#7C3AED",
            fontWeight: 700,
            background: "#EDE9FE",
            padding: "2px 8px",
            borderRadius: 6,
          }}
        >
          {bill.billNumber}
        </span>
      </p>
      <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 4 }}>
        Vendor: <strong style={{ color: "#111827" }}>{bill.vendorName}</strong>
      </p>
      <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 22 }}>
        Date:{" "}
        <strong style={{ color: "#111827" }}>
          {new Date(bill.billDate || bill.createdAt).toLocaleDateString(
            "en-IN",
          )}
        </strong>
      </p>
      <div
        style={{
          background: "#F5F3FF",
          border: "2px solid #DDD6FE",
          borderRadius: 14,
          padding: "14px 22px",
          marginBottom: 24,
        }}
      >
        <p
          style={{
            color: "#6B7280",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 4,
          }}
        >
          Grand Total
        </p>
        <p style={{ color: "#7C3AED", fontSize: 30, fontWeight: 800 }}>
          ₹
          {bill.grandTotal.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          onClick={() => generateBillPDF(bill)}
          className="btn-primary"
          style={{ width: "100%", padding: "13px 20px", fontSize: 15 }}
        >
          <IDownload /> Download PDF Invoice
        </button>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onReset}
            className="btn-gold"
            style={{ flex: 1, padding: "11px 16px" }}
          >
            <IPlus /> New Bill
          </button>
          <button onClick={onHistory} className="btn-ghost" style={{ flex: 1 }}>
            <IBill /> View History
          </button>
        </div>
      </div>
    </div>
  </div>
);

/* ── Helpers ── */
const toTitleCase = (str) => {
  if (!str) return "";
  return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};

/* ── Main ── */
export default function CreateBill() {
  const navigate = useNavigate();
  const [createdBill, setCreatedBill] = useState(null);

  const formik = useFormik({
    initialValues: {
      items: [emptyItem()],
    },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Group items for multiple bill submission
        const groups = {};
        values.items.forEach(i => {
          const key = `${i.vendorName.trim()}_${i.billDate}`;
          if (!groups[key]) groups[key] = [];
          groups[key].push(i);
        });

        const keys = Object.keys(groups);
        let firstBill = null;

        for (const k of keys) {
          const group = groups[k];
          const master = group[0];
          const payload = {
            vendorName: master.vendorName.trim(),
            vendorPhone: master.vendorPhone || "",
            vendorAddress: master.vendorAddress || "",
            billDate: master.billDate,
            status: master.status,
            items: group.map(i => ({
              designName: i.designName.trim(),
              designType: i.designType || "",
              quantity: parseFloat(i.quantity) || 0,
              price: parseFloat(i.price) || 0,
              taxRate: parseFloat(i.taxRate) || 0
            }))
          };
          const res = await createBill(payload);
          if (!firstBill) firstBill = res.data.bill;
          toast.success(`Bill created for ${master.vendorName}`);
        }

        if (firstBill) {
          setCreatedBill(firstBill);
          resetForm();
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to create bills");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    setFieldValue,
    resetForm,
  } = formik;

  /* ── Item helpers ── */
  const setItem = (idx, field, val) => {
    const items = [...values.items];
    items[idx] = { ...items[idx], [field]: val };
    
    if (["quantity", "price", "taxRate"].includes(field)) {
      const q = parseFloat(items[idx].quantity) || 0;
      const p = parseFloat(items[idx].price) || 0;
      const r = parseFloat(items[idx].taxRate) || 0;
      const sub = q * p;
      const tax = (sub * r) / 100;
      items[idx].taxAmount = tax;
      items[idx].total = sub + tax;
    }
    setFieldValue("items", items);
  };

  const addItem = () => {
    const last = values.items[values.items.length - 1];
    setFieldValue("items", [...values.items, emptyItem(last)]);
  };

  const removeItem = (idx) => {
    if (values.items.length > 1) {
      setFieldValue("items", values.items.filter((_, i) => i !== idx));
    }
  };

  /* ── Computed totals ── */
  const grandTotal = values.items.reduce((s, i) => s + (i.total || 0), 0);
  const totalTax = values.items.reduce((s, i) => s + (i.taxAmount || 0), 0);
  const subtotal = grandTotal - totalTax;

  const handleReset = () => {
    setCreatedBill(null);
    resetForm();
  };

  if (createdBill)
    return (
      <SuccessScreen
        bill={createdBill}
        onReset={handleReset}
        onHistory={() => navigate("/history")}
      />
    );

  return (
    <div style={{ background: "#F5F3FF", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1020, margin: "0 auto", padding: "28px 20px" }}>
        {/* ── Page Header ── */}
        <div style={{ marginBottom: 22 }}>
          <p
            style={{
              color: "#7C3AED",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            New Invoice
          </p>
          <h2
            style={{
              color: "#111827",
              fontSize: 28,
              fontWeight: 800,
              fontFamily: "DM Serif Display, Georgia, serif",
              marginBottom: 4,
            }}
          >
            Create Bill
          </h2>
          <p style={{ color: "#6B7280", fontSize: 14 }}>
            Fill in vendor details and add design items below
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* ── Seamless Unified Ledger Card ── */}
          <div
            className="sp-card"
            style={{ padding: "0", marginBottom: 20, overflow: "hidden" }}
          >
            {/* Ledger Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                background: "#FAFAFA",
                borderBottom: "1.5px solid #F3F4F6",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ background: "#7C3AED", color: "#fff", padding: "6px", borderRadius: "8px", display: "flex" }}>
                   <IBill />
                </div>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: 0 }}>Create Design Ledger</h2>
                  <p style={{ fontSize: 11, color: "#6B7280", margin: 0 }}>Add multiple designs and vendors in a single entry flow</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addItem}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  background: "#7C3AED",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "DM Sans, sans-serif",
                  boxShadow: "0 4px 12px rgba(124,58,237,0.2)",
                  minWidth: "42px",
                  height: "42px"
                }}
              >
                <IPlus size={20} />
                <span className="hide-mobile">Add New Row</span>
              </button>
            </div>

            {/* Vertical Card Ledger Area */}
            <div style={{ background: "#F9FAFB", padding: "16px", display: "flex", flexDirection: "column", gap: 16 }}>
              {values.items.map((item, idx) => (
                <div 
                  key={idx} 
                  className="sp-card" 
                  style={{ 
                    padding: "20px", 
                    position: "relative", 
                    background: "#fff", 
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                  }}
                >
                  {/* Row Index & Delete */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
                    <span style={{ color: "#7C3AED", fontWeight: 800, fontSize: 13, background: "#EDE9FE", padding: "4px 10px", borderRadius: 6 }}>
                      ITEM #{String(idx + 1).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      disabled={values.items.length === 1}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: values.items.length === 1 ? "not-allowed" : "pointer",
                        background: values.items.length === 1 ? "transparent" : "#FEE2E2",
                        color: values.items.length === 1 ? "#D1D5DB" : "#EF4444",
                        border: "none"
                      }}
                    >
                      <ITrash size={16} />
                    </button>
                  </div>

                  {/* Field Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                    
                    {/* Column 1: Vendor Details */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 4, height: 16, background: "#7C3AED", borderRadius: 4 }} />
                        <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.05em" }}>Vendor Info</p>
                      </div>
                      <div className="grid-resp-2">
                        <F label="Vendor Name" required err={errors.items?.[idx]?.vendorName} touched={touched.items?.[idx]?.vendorName}>
                          <input
                            value={item.vendorName}
                            onChange={(e) => setItem(idx, "vendorName", toTitleCase(e.target.value))}
                            className="sp-input"
                            placeholder="Sanni Patel..."
                            style={{ textTransform: "capitalize" }}
                          />
                        </F>
                        <F label="Phone Number">
                          <input
                            value={item.vendorPhone}
                            onChange={(e) => setItem(idx, "vendorPhone", e.target.value)}
                            className="sp-input"
                            placeholder="98765..."
                          />
                        </F>
                      </div>
                      <div className="grid-resp-2">
                        <F label="Bill Date" required>
                          <input
                            type="date"
                            value={item.billDate}
                            onChange={(e) => setItem(idx, "billDate", e.target.value)}
                            className="sp-input"
                          />
                        </F>
                        <F label="Payment Status" required>
                          <Select
                            value={item.status}
                            style={{ width: "100%", height: 38 }}
                            onChange={(v) => setItem(idx, "status", v)}
                            options={[
                              { value: "pending", label: "Pending" },
                              { value: "paid", label: "Paid" },
                            ]}
                          />
                        </F>
                      </div>
                      <F label="Address">
                        <input
                          value={item.vendorAddress}
                          onChange={(e) => setItem(idx, "vendorAddress", e.target.value)}
                          className="sp-input"
                          placeholder="Surat, Gujarat..."
                        />
                      </F>
                    </div>

                    {/* Column 2: Design Details */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 4, height: 16, background: "#D97706", borderRadius: 4 }} />
                        <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.05em" }}>Design & Price</p>
                      </div>
                      <div className="grid-resp-2">
                        <div style={{ gridColumn: "1/-1" }}>
                          <F label="Design Name" required err={errors.items?.[idx]?.designName} touched={touched.items?.[idx]?.designName}>
                            <input
                              value={item.designName}
                              onChange={(e) => setItem(idx, "designName", toTitleCase(e.target.value))}
                              className="sp-input"
                              placeholder="Embroidery Name..."
                              style={{ textTransform: "capitalize" }}
                            />
                          </F>
                        </div>
                        <div className="grid-mobile-2" style={{ display: "contents" }}>
                          <F label="Design Type">
                            <Select
                              value={item.designType || undefined}
                              placeholder="Type"
                              style={{ width: "100%", height: 38 }}
                              onChange={(v) => setItem(idx, "designType", v)}
                              options={DESIGN_TYPES.map(t => ({ value: t, label: t }))}
                            />
                          </F>
                          <F label="Qty" required>
                            <input
                              type="number"
                              min="0"
                              onWheel={(e) => e.target.blur()}
                              onKeyDown={(e) => {
                                if (e.key === "-" || e.key === "e") e.preventDefault();
                              }}
                              value={item.quantity}
                              onChange={(e) => {
                                const val = Math.max(0, parseFloat(e.target.value) || 0);
                                setItem(idx, "quantity", val);
                              }}
                              className="sp-input"
                              style={{ textAlign: "center" }}
                            />
                          </F>
                        </div>
                        <div className="grid-mobile-2" style={{ display: "contents" }}>
                          <F label="Price (₹)" required>
                            <input
                              type="number"
                              min="0"
                              onWheel={(e) => e.target.blur()}
                              onKeyDown={(e) => {
                                if (e.key === "-" || e.key === "e") e.preventDefault();
                              }}
                              value={item.price}
                              onChange={(e) => {
                                const val = Math.max(0, parseFloat(e.target.value) || 0);
                                setItem(idx, "price", val);
                              }}
                              className="sp-input"
                              placeholder="0"
                            />
                          </F>
                          <F label="GST (%)" required>
                            <input
                              type="number"
                              min="0"
                              onWheel={(e) => e.target.blur()}
                              onKeyDown={(e) => {
                                if (e.key === "-" || e.key === "e") e.preventDefault();
                              }}
                              value={item.taxRate}
                              onChange={(e) => {
                                const val = Math.max(0, parseFloat(e.target.value) || 0);
                                setItem(idx, "taxRate", val);
                              }}
                              className="sp-input"
                              style={{ textAlign: "center" }}
                            />
                          </F>
                        </div>
                      </div>
                      
                      {/* Per Item Total */}
                      <div 
                        style={{ 
                          marginTop: "auto", 
                          background: "#F5F3FF", 
                          padding: "12px 16px", 
                          borderRadius: 12, 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center" 
                        }}
                      >
                        <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 700 }}>ITEM TOTAL</span>
                        <span style={{ fontSize: 18, color: "#7C3AED", fontWeight: 900 }}>
                          ₹{(item.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 1 })}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* Refined Totals Summary Bar */}
            <div
              style={{
                padding: "24px",
                background: "#fff",
                borderTop: "1.5px solid #F3F4F6",
                display: "flex",
                flexDirection: "column",
                gap: 16
              }}
            >
              <div className="grid-mobile-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* Gross Subtotal Card */}
                <div style={{ 
                  background: "#F0FDF4", 
                  border: "1px solid #DCFCE7", 
                  padding: "12px 16px", 
                  borderRadius: 14,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center"
                }}>
                  <p style={{ margin: 0, fontSize: 10, color: "#166534", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Gross Subtotal</p>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#111827" }}>₹{subtotal.toLocaleString("en-IN")}</p>
                </div>

                {/* Total GST Card */}
                <div style={{ 
                  background: "#FFFBEB", 
                  border: "1px solid #FEF3C7", 
                  padding: "12px 16px", 
                  borderRadius: 14,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center"
                }}>
                  <p style={{ margin: 0, fontSize: 10, color: "#92400E", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Total GST</p>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#111827" }}>₹{totalTax.toLocaleString("en-IN")}</p>
                </div>
              </div>

              {/* Grand Total Row */}
              <div 
                className="show-desktop"
                style={{ 
                  background: "linear-gradient(135deg,#1e0a4e,#3730A3)", 
                  borderRadius: 14, 
                  padding: "14px 24px", 
                  color: "#fff",
                  boxShadow: "0 8px 24px rgba(30,10,78,0.18)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                   <p style={{ margin: 0, fontSize: 11, color: "#C4B5FD", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em" }}>Net Payable Amount</p>
                   <p style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                </div>
                <div style={{ opacity: 0.3 }}>
                   <IBill />
                </div>
              </div>

              {/* Mobile Compact Grand Total */}
              <div className="show-mobile" style={{ display: "none" }}>
                 <div 
                    style={{ 
                      background: "linear-gradient(135deg,#1e0a4e,#3730A3)", 
                      borderRadius: 14, 
                      padding: "12px 20px", 
                      color: "#fff",
                      boxShadow: "0 10px 25px rgba(30,10,78,0.2)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <span style={{ fontSize: 12, color: "#C4B5FD", fontWeight: 800, textTransform: "uppercase" }}>Total Payable</span>
                    <span style={{ fontSize: 22, fontWeight: 900 }}>₹{grandTotal.toLocaleString("en-IN")}</span>
                  </div>
              </div>
            </div>
          </div>

          {/* Submit Action Area */}
          <div style={{ display: "flex", justifyContent: "center", mt: 15 }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{
                maxWidth: 420,
                width: "100%",
                padding: "18px 24px",
                fontSize: 16,
                fontWeight: 800,
                borderRadius: 18,
                boxShadow: "0 15px 35px rgba(124,58,237,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner-sm" /> Processing Submissions...
                </>
              ) : (
                <>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16l3-2 3 2 3-2 3 2 3-2V4a2 2 0 00-2-2z" />
                    <line x1="16" y1="9" x2="8" y2="9" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                  </svg>
                  Generate & Save Multi-Bill Ledger
                </>
              )}
            </button>
          </div>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: 28,
            color: "#C4B5FD",
            fontSize: 11,
            letterSpacing: "0.15em",
            paddingBottom: 8,
          }}
        >
          SANNI PATEL — JACQUARD DESIGN STUDIO
        </p>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
          .show-mobile-items { display: block !important; }
        }
      `}</style>
    </div>
  );
}
