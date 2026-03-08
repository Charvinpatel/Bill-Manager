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
const emptyItem = () => ({
  designName: "",
  designType: "",
  quantity: 1,
  price: "",
  total: 0,
});

/* ── Yup Validation Schema ── */
const schema = Yup.object({
  vendorName: Yup.string()
    .trim()
    .min(2, "Min 2 characters")
    .required("Vendor name is required"),
  vendorPhone: Yup.string()
    .matches(/^$|^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
    .nullable(),
  vendorAddress: Yup.string().nullable(),
  billDate: Yup.date().required("Bill date is required"),
  taxRate: Yup.number().min(0, "Min 0").max(100, "Max 100").required(),
  status: Yup.string().oneOf(["paid", "unpaid", "pending"]).required(),
  notes: Yup.string().nullable(),
  items: Yup.array()
    .of(
      Yup.object({
        designName: Yup.string().trim().required("Design name is required"),
        designType: Yup.string().nullable(),
        quantity: Yup.number().min(1, "Min 1").required("Required"),
        price: Yup.number()
          .moreThan(0, "Must be greater than 0")
          .required("Price required"),
      }),
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

/* ── Main ── */
export default function CreateBill() {
  const navigate = useNavigate();
  const [createdBill, setCreatedBill] = useState(null);

  const formik = useFormik({
    initialValues: {
      vendorName: "",
      vendorPhone: "",
      vendorAddress: "",
      billDate: new Date().toISOString().split("T")[0],
      taxRate: 0,
      status: "pending",
      notes: "",
      items: [emptyItem()],
    },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          billDate: values.billDate,
          items: values.items.map((i) => ({
            designName: i.designName.trim(),
            designType: i.designType || "",
            quantity: parseFloat(i.quantity),
            price: parseFloat(i.price),
            total: parseFloat(i.quantity) * parseFloat(i.price),
          })),
        };
        const res = await createBill(payload);
        setCreatedBill(res.data.bill);
        toast.success(`Bill ${res.data.bill.billNumber} created successfully!`);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to create bill");
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
    if (field === "quantity" || field === "price") {
      const q =
        field === "quantity"
          ? parseFloat(val) || 0
          : parseFloat(items[idx].quantity) || 0;
      const p =
        field === "price"
          ? parseFloat(val) || 0
          : parseFloat(items[idx].price) || 0;
      items[idx].total = q * p;
    }
    setFieldValue("items", items);
  };
  const addItem = () => setFieldValue("items", [...values.items, emptyItem()]);
  const removeItem = (i) => {
    if (values.items.length > 1)
      setFieldValue(
        "items",
        values.items.filter((_, idx) => idx !== i),
      );
  };

  /* ── Computed totals ── */
  const subtotal = values.items.reduce((s, i) => s + (i.total || 0), 0);
  const taxAmount = (subtotal * (parseFloat(values.taxRate) || 0)) / 100;
  const grandTotal = subtotal + taxAmount;

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
          {/* ── Vendor Card ── */}
          <div
            className="sp-card"
            style={{ padding: "22px 24px", marginBottom: 18 }}
          >
            <SectionHead
              icon={<IUser />}
              title="Vendor Information"
              sub="Customer or buyer details"
              iconBg="#EDE9FE"
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                gap: 16,
              }}
            >
              <F
                label="Vendor Name"
                required
                err={errors.vendorName}
                touched={touched.vendorName}
              >
                <input
                  name="vendorName"
                  value={values.vendorName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Rahul Textiles"
                  className={`sp-input${touched.vendorName && errors.vendorName ? " is-error" : ""}`}
                />
              </F>
              <F
                label="Phone Number"
                err={errors.vendorPhone}
                touched={touched.vendorPhone}
              >
                <input
                  name="vendorPhone"
                  value={values.vendorPhone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="9876543210"
                  className={`sp-input${touched.vendorPhone && errors.vendorPhone ? " is-error" : ""}`}
                />
              </F>
              <F label="Address / City">
                <input
                  name="vendorAddress"
                  value={values.vendorAddress}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Surat, Gujarat"
                  className="sp-input"
                />
              </F>

              {/* ── Bill Date ── */}
              <F
                label="Bill Date"
                required
                err={errors.billDate}
                touched={touched.billDate}
              >
                <input
                  type="date"
                  name="billDate"
                  value={values.billDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`sp-input${touched.billDate && errors.billDate ? " is-error" : ""}`}
                />
              </F>
            </div>
          </div>

          {/* ── Design Items Card ── */}
          <div
            className="sp-card"
            style={{ marginBottom: 18, overflow: "hidden" }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 22px",
                borderBottom: "1.5px solid #F3F4F6",
              }}
            >
              <SectionHead
                icon={<IDesign />}
                title="Design Items"
                sub={`${values.items.length} item${values.items.length !== 1 ? "s" : ""} added`}
                iconBg="#FEF3C7"
              />
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
                  fontFamily: "DM Sans, sans-serif",
                  flexShrink: 0,
                }}
              >
                <IPlus /> Add Row
              </button>
            </div>

            {/* Desktop table */}
            <div style={{ overflowX: "auto" }} className="hide-mobile">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F9FAFB" }}>
                    {[
                      ["#", "center", 44],
                      ["Design Name", "left", "auto"],
                      ["Design Type", "left", 148],
                      ["Quantity", "center", 108],
                      ["Unit Price (₹)", "right", 145],
                      ["Total (₹)", "right", 132],
                      ["", "center", 52],
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
                          borderBottom: "1.5px solid #E5E7EB",
                          whiteSpace: "nowrap",
                          fontFamily: "DM Sans, sans-serif",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {values.items.map((item, idx) => (
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
                            fontSize: 12,
                            fontFamily: "JetBrains Mono, monospace",
                            background: "#EDE9FE",
                            padding: "2px 7px",
                            borderRadius: 5,
                          }}
                        >
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <input
                          value={item.designName}
                          onChange={(e) =>
                            setItem(idx, "designName", e.target.value)
                          }
                          onBlur={() =>
                            formik.setFieldTouched(
                              `items[${idx}].designName`,
                              true,
                            )
                          }
                          placeholder="e.g. Floral Brocade #12"
                          className={`sp-input${touched.items?.[idx]?.designName && errors.items?.[idx]?.designName ? " is-error" : ""}`}
                          style={{ minWidth: 170 }}
                        />
                        {touched.items?.[idx]?.designName &&
                          errors.items?.[idx]?.designName && (
                            <p className="sp-err">
                              {errors.items[idx].designName}
                            </p>
                          )}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Select
                          value={item.designType || undefined}
                          placeholder="Select type"
                          style={{
                            width: 132,
                            borderRadius: "10px",
                            height: "42.6px",
                          }}
                          onChange={(value) =>
                            setItem(idx, "designType", value)
                          }
                          options={DESIGN_TYPES.map((t) => ({
                            value: t,
                            label: t,
                          }))}
                        />
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            setItem(idx, "quantity", e.target.value)
                          }
                          onBlur={() =>
                            formik.setFieldTouched(
                              `items[${idx}].quantity`,
                              true,
                            )
                          }
                          className={`sp-input${touched.items?.[idx]?.quantity && errors.items?.[idx]?.quantity ? " is-error" : ""}`}
                          style={{ width: 78, textAlign: "center" }}
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
                              setItem(idx, "price", e.target.value)
                            }
                            onBlur={() =>
                              formik.setFieldTouched(
                                `items[${idx}].price`,
                                true,
                              )
                            }
                            placeholder="0.00"
                            className={`sp-input${touched.items?.[idx]?.price && errors.items?.[idx]?.price ? " is-error" : ""}`}
                            style={{
                              width: "100%",
                              paddingLeft: 26,
                              textAlign: "right",
                            }}
                          />
                        </div>
                        {touched.items?.[idx]?.price &&
                          errors.items?.[idx]?.price && (
                            <p
                              className="sp-err"
                              style={{ textAlign: "right" }}
                            >
                              {errors.items[idx].price}
                            </p>
                          )}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <span
                          style={{
                            color: "#7C3AED",
                            fontWeight: 700,
                            fontSize: 15,
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
                          disabled={values.items.length === 1}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor:
                              values.items.length === 1
                                ? "not-allowed"
                                : "pointer",
                            transition: "all 0.15s",
                            background:
                              values.items.length === 1 ? "#F9FAFB" : "#FEE2E2",
                            color:
                              values.items.length === 1 ? "#D1D5DB" : "#EF4444",
                            border: `1.5px solid ${values.items.length === 1 ? "#E5E7EB" : "#FECACA"}`,
                          }}
                        >
                          <IX />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile item cards */}
            <div
              className="show-mobile-items"
              style={{ display: "none", padding: "0 16px 16px" }}
            >
              {values.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    borderRadius: 12,
                    padding: 14,
                    marginTop: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        color: "#7C3AED",
                        fontWeight: 700,
                        fontSize: 12,
                        fontFamily: "JetBrains Mono, monospace",
                        background: "#EDE9FE",
                        padding: "2px 7px",
                        borderRadius: 5,
                      }}
                    >
                      Item {String(idx + 1).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      disabled={values.items.length === 1}
                      style={{
                        color:
                          values.items.length === 1 ? "#D1D5DB" : "#EF4444",
                        background: "none",
                        border: "none",
                        cursor:
                          values.items.length === 1 ? "not-allowed" : "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label className="sp-label">Design Name *</label>
                      <input
                        value={item.designName}
                        onChange={(e) =>
                          setItem(idx, "designName", e.target.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched(
                            `items[${idx}].designName`,
                            true,
                          )
                        }
                        placeholder="e.g. Floral Brocade"
                        className={`sp-input${touched.items?.[idx]?.designName && errors.items?.[idx]?.designName ? " is-error" : ""}`}
                      />
                      {touched.items?.[idx]?.designName &&
                        errors.items?.[idx]?.designName && (
                          <p className="sp-err">
                            {errors.items[idx].designName}
                          </p>
                        )}
                    </div>
                    <div>
                      <label className="sp-label">Type</label>
                      <Select
                        value={item.designType || undefined}
                        placeholder="None"
                        style={{
                          width: "100%",
                          borderRadius: "10px",
                          height: "42.6px",
                        }}
                        onChange={(value) => setItem(idx, "designType", value)}
                        options={[
                          { value: "", label: "None" },
                          ...DESIGN_TYPES.map((t) => ({ value: t, label: t })),
                        ]}
                      />
                    </div>
                    <div>
                      <label className="sp-label">Qty *</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          setItem(idx, "quantity", e.target.value)
                        }
                        className="sp-input"
                        style={{ textAlign: "center" }}
                      />
                    </div>
                    <div>
                      <label className="sp-label">Price (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => setItem(idx, "price", e.target.value)}
                        onBlur={() =>
                          formik.setFieldTouched(`items[${idx}].price`, true)
                        }
                        className={`sp-input${touched.items?.[idx]?.price && errors.items?.[idx]?.price ? " is-error" : ""}`}
                      />
                      {touched.items?.[idx]?.price &&
                        errors.items?.[idx]?.price && (
                          <p className="sp-err">{errors.items[idx].price}</p>
                        )}
                    </div>
                    <div
                      style={{
                        gridColumn: "1 / -1",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: 4,
                      }}
                    >
                      <span
                        style={{
                          color: "#9CA3AF",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        Item Total
                      </span>
                      <span
                        style={{
                          color: "#7C3AED",
                          fontWeight: 700,
                          fontSize: 16,
                        }}
                      >
                        ₹
                        {(item.total || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                style={{
                  width: "100%",
                  marginTop: 12,
                  padding: "11px",
                  border: "2px dashed #DDD6FE",
                  borderRadius: 12,
                  background: "none",
                  color: "#7C3AED",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "DM Sans, sans-serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <IPlus /> Add Another Item
              </button>
            </div>

            {/* Totals */}
            <div
              style={{
                padding: "18px 22px",
                background: "#F9FAFB",
                borderTop: "1.5px solid #F3F4F6",
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ width: "100%", maxWidth: 300 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "5px 0",
                    }}
                  >
                    <span style={{ color: "#6B7280", fontSize: 14 }}>
                      Subtotal
                    </span>
                    <span
                      style={{
                        color: "#111827",
                        fontWeight: 600,
                        fontSize: 14,
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
                      padding: "5px 0",
                      borderBottom: "1px dashed #E5E7EB",
                    }}
                  >
                    <span
                      style={{
                        color: "#6B7280",
                        fontSize: 14,
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
                        name="taxRate"
                        value={values.taxRate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        style={{
                          width: 56,
                          background: "#fff",
                          border: "1.5px solid #E5E7EB",
                          borderRadius: 8,
                          padding: "4px 8px",
                          fontSize: 13,
                          color: "#111827",
                          textAlign: "center",
                          outline: "none",
                          fontFamily: "DM Sans, sans-serif",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#7C3AED";
                          e.target.style.boxShadow =
                            "0 0 0 2px rgba(124,58,237,0.1)";
                        }}
                      />
                    </span>
                    <span
                      style={{
                        color: "#111827",
                        fontWeight: 600,
                        fontSize: 14,
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
                      background: "linear-gradient(135deg,#1e0a4e,#3730A3)",
                      borderRadius: 12,
                      padding: "13px 16px",
                      marginTop: 10,
                    }}
                  >
                    <span
                      style={{
                        color: "#C4B5FD",
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Grand Total
                    </span>
                    <span
                      style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}
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
          <div
            className="sp-card"
            style={{ padding: "22px 24px", marginBottom: 20 }}
          >
            <SectionHead
              icon={<INote />}
              title="Additional Details"
              sub="Status and notes"
              iconBg="#DCFCE7"
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                gap: 16,
              }}
            >
              <F label="Payment Status">
                <Select
                  value={values.status}
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    height: "42.6px",
                  }}
                  onChange={(value) =>
                    handleChange({ target: { name: "status", value } })
                  }
                  options={[
                    { value: "pending", label: "Pending" },
                    { value: "paid", label: "Paid" },
                    { value: "unpaid", label: "Unpaid" },
                  ]}
                />
              </F>
              <F label="Notes (optional)">
                <input
                  name="notes"
                  value={values.notes}
                  onChange={handleChange}
                  placeholder="Any special instructions or notes..."
                  className="sp-input"
                />
              </F>
            </div>
          </div>

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{
              width: "100%",
              padding: "15px 24px",
              fontSize: 16,
              fontWeight: 800,
              borderRadius: 14,
            }}
          >
            {isSubmitting ? (
              <>
                <div className="spinner-sm" /> Generating Bill…
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
