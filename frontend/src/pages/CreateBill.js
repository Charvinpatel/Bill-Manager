import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBill } from "../api";
import { generateBillPDF } from "../pdfGenerator";
import { toast } from "react-toastify";
import { Select } from "antd";

/* ── SVG Icons ───────────────────────────────────────────── */
const IconUser = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#7C3AED"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconDesign = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#D97706"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);
const IconNote = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#16A34A"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const IconPlus = () => (
  <svg
    width="15"
    height="15"
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
const IconX = () => (
  <svg
    width="13"
    height="13"
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
const IconSuccess = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#16A34A"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const IconDownload = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconBill = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 3 2 3-2 3 2 3-2 3 2V4a2 2 0 0 0-2-2z" />
    <line x1="16" y1="9" x2="8" y2="9" />
    <line x1="16" y1="13" x2="8" y2="13" />
  </svg>
);

/* ── Styles ──────────────────────────────────────────────── */
const inputStyle = {
  width: "100%",
  background: "#FFFFFF",
  border: "1.5px solid #E5E7EB",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 14,
  color: "#111827",
  fontFamily: "system-ui, sans-serif",
  outline: "none",
  transition: "border-color 0.18s, box-shadow 0.18s",
  boxSizing: "border-box",
};
const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "#374151",
  fontFamily: "system-ui, sans-serif",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: 6,
};
const cardStyle = {
  background: "#FFFFFF",
  borderRadius: 16,
  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
  padding: "24px 28px",
  marginBottom: 20,
};
const sectionHeadStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 20,
};

const emptyItem = () => ({ designName: "", quantity: 1, price: "", total: 0 });

const CreateBill = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    vendorName: "",
    vendorAddress: "",
    vendorPhone: "",
    taxRate: 0,
    status: "pending",
    notes: "",
  });
  const [items, setItems] = useState([emptyItem()]);
  const [loading, setLoading] = useState(false);
  const [createdBill, setCreatedBill] = useState(null);

  const updateItem = (idx, field, value) => {
    const updated = [...items];
    updated[idx][field] = value;
    if (field === "quantity" || field === "price") {
      const qty =
        field === "quantity"
          ? parseFloat(value) || 0
          : parseFloat(updated[idx].quantity) || 0;
      const pr =
        field === "price"
          ? parseFloat(value) || 0
          : parseFloat(updated[idx].price) || 0;
      updated[idx].total = qty * pr;
    }
    setItems(updated);
  };
  const addItem = () => setItems([...items, emptyItem()]);
  const removeItem = (i) => {
    if (items.length > 1) setItems(items.filter((_, idx) => idx !== i));
  };

  const subtotal = items.reduce((s, i) => s + (i.total || 0), 0);
  const taxAmount = (subtotal * (parseFloat(form.taxRate) || 0)) / 100;
  const grandTotal = subtotal + taxAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vendorName.trim()) return toast.error("Vendor name is required");
    if (items.some((i) => !i.designName.trim()))
      return toast.error("All design names are required");
    if (items.some((i) => !i.price || i.price <= 0))
      return toast.error("Price must be greater than 0");
    setLoading(true);
    try {
      const res = await createBill({
        ...form,
        items: items.map((i) => ({
          designName: i.designName,
          quantity: parseFloat(i.quantity),
          price: parseFloat(i.price),
          total: i.total,
        })),
      });
      setCreatedBill(res.data.bill);
      toast.success(`Bill ${res.data.bill.billNumber} created!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create bill");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCreatedBill(null);
    setItems([emptyItem()]);
    setForm({
      vendorName: "",
      vendorAddress: "",
      vendorPhone: "",
      taxRate: 0,
      status: "pending",
      notes: "",
    });
  };

  const focusInput = (e) => {
    e.target.style.borderColor = "#7C3AED";
    e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)";
  };
  const blurInput = (e) => {
    e.target.style.borderColor = "#E5E7EB";
    e.target.style.boxShadow = "none";
  };

  /* ── Success Screen ── */
  if (createdBill)
    return (
      <div
        style={{
          background: "#F5F3FF",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 20,
            padding: "48px 40px",
            maxWidth: 460,
            width: "100%",
            boxShadow: "0 20px 60px rgba(124,58,237,0.15)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              background: "#DCFCE7",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <IconSuccess />
          </div>
          <h2
            style={{
              color: "#111827",
              fontSize: 26,
              fontWeight: 800,
              fontFamily: "Georgia, serif",
              marginBottom: 6,
            }}
          >
            Bill Created!
          </h2>
          <p
            style={{
              color: "#6B7280",
              fontSize: 14,
              fontFamily: "system-ui, sans-serif",
              marginBottom: 4,
            }}
          >
            Bill No:{" "}
            <span
              style={{
                fontFamily: "monospace",
                color: "#7C3AED",
                fontWeight: 700,
                background: "#EDE9FE",
                padding: "2px 8px",
                borderRadius: 6,
              }}
            >
              {createdBill.billNumber}
            </span>
          </p>
          <p
            style={{
              color: "#6B7280",
              fontSize: 14,
              fontFamily: "system-ui, sans-serif",
              marginBottom: 24,
            }}
          >
            Vendor:{" "}
            <strong style={{ color: "#111827" }}>
              {createdBill.vendorName}
            </strong>
          </p>
          <div
            style={{
              background: "#F5F3FF",
              border: "2px solid #DDD6FE",
              borderRadius: 14,
              padding: "16px 24px",
              marginBottom: 28,
            }}
          >
            <p
              style={{
                color: "#6B7280",
                fontSize: 12,
                fontFamily: "system-ui, sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 4,
              }}
            >
              Grand Total
            </p>
            <p
              style={{
                color: "#7C3AED",
                fontSize: 32,
                fontWeight: 800,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              ₹
              {createdBill.grandTotal.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => generateBillPDF(createdBill)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "linear-gradient(135deg, #1e0a4e, #3730A3)",
                color: "#FFFFFF",
                border: "none",
                padding: "13px 20px",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "system-ui, sans-serif",
                boxShadow: "0 4px 16px rgba(30,10,78,0.25)",
              }}
            >
              <IconDownload /> Download PDF Invoice
            </button>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={resetForm}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  background: "linear-gradient(135deg, #FBBF24, #F59E0B)",
                  color: "#1e0a4e",
                  border: "none",
                  padding: "11px 16px",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                <IconPlus /> New Bill
              </button>
              <button
                onClick={() => navigate("/history")}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  background: "#F3F4F6",
                  color: "#374151",
                  border: "1.5px solid #E5E7EB",
                  padding: "11px 16px",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                <IconBill /> View History
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  /* ── Form ── */
  return (
    <div style={{ background: "#F5F3FF", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        {/* Page Header */}
        <div style={{ marginBottom: 24 }}>
          <p
            style={{
              color: "#7C3AED",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontFamily: "system-ui, sans-serif",
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
              fontFamily: "Georgia, serif",
              marginBottom: 4,
            }}
          >
            Create Bill
          </h2>
          <p
            style={{
              color: "#6B7280",
              fontSize: 14,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Fill in vendor details and add design items below
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── Vendor Card ── */}
          <div style={cardStyle}>
            <div style={sectionHeadStyle}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  background: "#EDE9FE",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconUser />
              </div>
              <div>
                <h3
                  style={{
                    color: "#111827",
                    fontSize: 16,
                    fontWeight: 700,
                    fontFamily: "system-ui, sans-serif",
                    margin: 0,
                  }}
                >
                  Vendor Information
                </h3>
                <p
                  style={{
                    color: "#9CA3AF",
                    fontSize: 12,
                    fontFamily: "system-ui, sans-serif",
                    margin: "2px 0 0",
                  }}
                >
                  Customer or buyer details
                </p>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 16,
              }}
            >
              <div>
                <label style={labelStyle}>
                  Vendor Name <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  style={inputStyle}
                  type="text"
                  value={form.vendorName}
                  onChange={(e) =>
                    setForm({ ...form, vendorName: e.target.value })
                  }
                  placeholder="e.g. Rahul Textiles"
                  onFocus={focusInput}
                  onBlur={blurInput}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={form.vendorPhone}
                  onChange={(e) =>
                    setForm({ ...form, vendorPhone: e.target.value })
                  }
                  placeholder="+91 98765 43210"
                  onFocus={focusInput}
                  onBlur={blurInput}
                />
              </div>
              <div>
                <label style={labelStyle}>Address / City</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={form.vendorAddress}
                  onChange={(e) =>
                    setForm({ ...form, vendorAddress: e.target.value })
                  }
                  placeholder="Surat, Gujarat"
                  onFocus={focusInput}
                  onBlur={blurInput}
                />
              </div>
            </div>
          </div>

          {/* ── Design Items Card ── */}
          <div style={{ ...cardStyle, padding: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px",
                borderBottom: "1.5px solid #F3F4F6",
              }}
            >
              <div style={sectionHeadStyle}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    background: "#FEF3C7",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <IconDesign />
                </div>
                <div>
                  <h3
                    style={{
                      color: "#111827",
                      fontSize: 16,
                      fontWeight: 700,
                      fontFamily: "system-ui, sans-serif",
                      margin: 0,
                    }}
                  >
                    Design Items
                  </h3>
                  <p
                    style={{
                      color: "#9CA3AF",
                      fontSize: 12,
                      fontFamily: "system-ui, sans-serif",
                      margin: "2px 0 0",
                    }}
                  >
                    {items.length} item{items.length !== 1 ? "s" : ""} added
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={addItem}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#EDE9FE",
                  color: "#7C3AED",
                  border: "1.5px solid #DDD6FE",
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "system-ui, sans-serif",
                  transition: "all 0.15s",
                }}
              >
                <IconPlus /> Add Row
              </button>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F9FAFB" }}>
                    {[
                      ["#", "center", 40],
                      ["Design Name", "left", "auto"],
                      ["Quantity", "center", 110],
                      ["Unit Price (₹)", "right", 140],
                      ["Total (₹)", "right", 130],
                      ["", "center", 50],
                    ].map(([h, align, w]) => (
                      <th
                        key={h}
                        style={{
                          padding: "11px 16px",
                          textAlign: align,
                          width: w !== "auto" ? w : undefined,
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#6B7280",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          fontFamily: "system-ui, sans-serif",
                          borderBottom: "1.5px solid #E5E7EB",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr
                      key={idx}
                      style={{ borderBottom: "1px solid #F3F4F6" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#FAFAFA")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span
                          style={{
                            color: "#7C3AED",
                            fontWeight: 700,
                            fontSize: 13,
                            fontFamily: "monospace",
                            background: "#EDE9FE",
                            padding: "2px 7px",
                            borderRadius: 6,
                          }}
                        >
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <input
                          type="text"
                          value={item.designName}
                          onChange={(e) =>
                            updateItem(idx, "designName", e.target.value)
                          }
                          placeholder="e.g. Floral Brocade #12"
                          style={{ ...inputStyle, minWidth: 180 }}
                          onFocus={focusInput}
                          onBlur={blurInput}
                          required
                        />
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(idx, "quantity", e.target.value)
                          }
                          style={{
                            ...inputStyle,
                            width: 80,
                            textAlign: "center",
                          }}
                          onFocus={focusInput}
                          onBlur={blurInput}
                          required
                        />
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div
                          style={{
                            position: "relative",
                            width: 120,
                            marginLeft: "auto",
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              left: 12,
                              top: "50%",
                              transform: "translateY(-50%)",
                              color: "#9CA3AF",
                              fontSize: 14,
                              fontFamily: "system-ui, sans-serif",
                              pointerEvents: "none",
                            }}
                          >
                            ₹
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price}
                            onChange={(e) =>
                              updateItem(idx, "price", e.target.value)
                            }
                            placeholder="0.00"
                            style={{
                              ...inputStyle,
                              width: "100%",
                              paddingLeft: 28,
                              textAlign: "right",
                            }}
                            onFocus={focusInput}
                            onBlur={blurInput}
                            required
                          />
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <span
                          style={{
                            color: "#7C3AED",
                            fontWeight: 700,
                            fontSize: 15,
                            fontFamily: "system-ui, sans-serif",
                          }}
                        >
                          ₹
                          {(item.total || 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          disabled={items.length === 1}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            background:
                              items.length === 1 ? "#F9FAFB" : "#FEE2E2",
                            color: items.length === 1 ? "#D1D5DB" : "#EF4444",
                            border: `1.5px solid ${items.length === 1 ? "#E5E7EB" : "#FECACA"}`,
                            cursor:
                              items.length === 1 ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.15s",
                          }}
                        >
                          <IconX />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div
              style={{
                padding: "20px 24px",
                background: "#F9FAFB",
                borderTop: "1.5px solid #F3F4F6",
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ width: 280 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 0",
                    }}
                  >
                    <span
                      style={{
                        color: "#6B7280",
                        fontSize: 14,
                        fontFamily: "system-ui, sans-serif",
                      }}
                    >
                      Subtotal
                    </span>
                    <span
                      style={{
                        color: "#111827",
                        fontWeight: 600,
                        fontSize: 14,
                        fontFamily: "system-ui, sans-serif",
                      }}
                    >
                      ₹
                      {subtotal.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 0",
                      borderBottom: "1px dashed #E5E7EB",
                    }}
                  >
                    <span
                      style={{
                        color: "#6B7280",
                        fontSize: 14,
                        fontFamily: "system-ui, sans-serif",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      GST (%)
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={form.taxRate}
                        onChange={(e) =>
                          setForm({ ...form, taxRate: e.target.value })
                        }
                        style={{
                          width: 56,
                          background: "#FFFFFF",
                          border: "1.5px solid #E5E7EB",
                          borderRadius: 8,
                          padding: "4px 8px",
                          fontSize: 13,
                          color: "#111827",
                          fontFamily: "system-ui, sans-serif",
                          textAlign: "center",
                          outline: "none",
                        }}
                        onFocus={focusInput}
                        onBlur={blurInput}
                      />
                    </span>
                    <span
                      style={{
                        color: "#111827",
                        fontWeight: 600,
                        fontSize: 14,
                        fontFamily: "system-ui, sans-serif",
                      }}
                    >
                      ₹
                      {taxAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "linear-gradient(135deg, #1e0a4e, #3730A3)",
                      borderRadius: 12,
                      padding: "14px 16px",
                      marginTop: 10,
                    }}
                  >
                    <span
                      style={{
                        color: "#C4B5FD",
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: "system-ui, sans-serif",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Grand Total
                    </span>
                    <span
                      style={{
                        color: "#FFFFFF",
                        fontWeight: 800,
                        fontSize: 20,
                        fontFamily: "system-ui, sans-serif",
                      }}
                    >
                      ₹
                      {grandTotal.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Notes & Status Card ── */}
          <div style={cardStyle}>
            <div style={sectionHeadStyle}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  background: "#DCFCE7",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconNote />
              </div>
              <div>
                <h3
                  style={{
                    color: "#111827",
                    fontSize: 16,
                    fontWeight: 700,
                    fontFamily: "system-ui, sans-serif",
                    margin: 0,
                  }}
                >
                  Additional Details
                </h3>
                <p
                  style={{
                    color: "#9CA3AF",
                    fontSize: 12,
                    fontFamily: "system-ui, sans-serif",
                    margin: "2px 0 0",
                  }}
                >
                  Status and notes
                </p>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: 16,
              }}
            >
              <div>
                <label style={labelStyle}>Payment Status</label>
                <Select
                  value={form.status}
                  onChange={(value) => setForm({ ...form, status: value })}
                  style={{
                    width: "100%",
                    background: "#FFFFFF",
                    border: "1.5px solid #E5E7EB",
                    borderRadius: 10,
                    fontSize: 14,
                    color: "#111827",
                    fontFamily: "system-ui, sans-serif",
                  }}
                  dropdownStyle={{ borderRadius: 10 }}
                >
                  <Select.Option value="pending">Pending</Select.Option>
                  <Select.Option value="paid">Paid</Select.Option>
                  <Select.Option value="unpaid">Unpaid</Select.Option>
                </Select>
              </div>
              <div>
                <label style={labelStyle}>Notes (optional)</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any special instructions or notes..."
                  style={inputStyle}
                  onFocus={focusInput}
                  onBlur={blurInput}
                />
              </div>
            </div>
          </div>

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              background: loading
                ? "#C4B5FD"
                : "linear-gradient(135deg, #1e0a4e 0%, #3730A3 100%)",
              color: "#FFFFFF",
              border: "none",
              padding: "15px 24px",
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "system-ui, sans-serif",
              boxShadow: loading ? "none" : "0 6px 24px rgba(30,10,78,0.3)",
              transition: "all 0.2s",
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    border: "2.5px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                ></div>{" "}
                Generating Bill…
              </>
            ) : (
              <>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 00-2 2v16l3-2 3 2 3-2 3 2 3-2V4a2 2 0 00-2-2z" />
                  <line x1="16" y1="9" x2="8" y2="9" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                </svg>{" "}
                Generate Bill
              </>
            )}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: 32,
            color: "#C4B5FD",
            fontSize: 12,
            fontFamily: "system-ui, sans-serif",
            letterSpacing: "0.15em",
          }}
        >
          SANNI PATEL — JACQUARD DESIGN STUDIO
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default CreateBill;
