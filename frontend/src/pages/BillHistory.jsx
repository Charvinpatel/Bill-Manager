import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  getAllBills,
  deleteBill,
  updateBillStatus,
  updateBill,
  getBillsByMonth,
} from "../api";
import { generateBillPDF, generateMonthlyPDF } from "../pdfGenerator";
import StatusBadge from "../components/StatusBadge.jsx";
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
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const emptyItem = () => ({
  designName: "",
  designType: "",
  quantity: 1,
  price: "",
  total: 0,
});

/* ── Edit Bill Yup Schema ── */
const editSchema = Yup.object({
  vendorName: Yup.string()
    .trim()
    .min(2, "Min 2 chars")
    .required("Vendor name is required"),
  vendorPhone: Yup.string()
    .matches(/^$|^[6-9]\d{9}$/, "Invalid mobile number")
    .nullable(),
  vendorAddress: Yup.string().nullable(),
  taxRate: Yup.number().min(0).max(100).required(),
  status: Yup.string().oneOf(["paid", "unpaid", "pending"]).required(),
  notes: Yup.string().nullable(),
  items: Yup.array()
    .of(
      Yup.object({
        designName: Yup.string().trim().required("Required"),
        designType: Yup.string().nullable(),
        quantity: Yup.number().min(1, "Min 1").required(),
        price: Yup.number().moreThan(0, "Must be > 0").required("Required"),
      }),
    )
    .min(1),
});

/* ── Icons ── */
const ISearch = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#9CA3AF"
    strokeWidth="2.2"
    strokeLinecap="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IDown = ({ up }) => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    style={{
      transform: up ? "rotate(180deg)" : "none",
      transition: "transform 0.2s",
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IDl = () => (
  <svg
    width="13"
    height="13"
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
const ITrash = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const IEdit = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.3"
    strokeLinecap="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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
const ICal = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

/* ── Small action button ── */
const ActionBtn = ({
  children,
  bg,
  color,
  border,
  title,
  onClick,
  disabled,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={{
      width: 32,
      height: 32,
      borderRadius: 9,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: bg,
      color,
      border: `1.5px solid ${border}`,
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.15s",
      flexShrink: 0,
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.filter = "brightness(0.85)";
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.filter = "";
    }}
  >
    {children}
  </button>
);

export default function BillHistory() {
  const [bills, setBills] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [expandedId, setExpandedId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  /* ── Edit modal state ── */
  const [editBill, setEditBill] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  /* ── Monthly PDF state ── */
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [monthYear, setMonthYear] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  const [monthVendorFilter, setMonthVendorFilter] = useState("all");
  const [monthVendorNames, setMonthVendorNames] = useState([]);
  const [monthVendorsFetching, setMonthVendorsFetching] = useState(false);
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  /* ── Edit Formik ── */
  const editFormik = useFormik({
    initialValues: {
      vendorName: "",
      vendorPhone: "",
      vendorAddress: "",
      taxRate: 0,
      status: "pending",
      notes: "",
      items: [emptyItem()],
    },
    validationSchema: editSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      setEditLoading(true);
      try {
        await updateBill(editBill._id, {
          ...values,
          items: values.items.map((i) => ({
            designName: i.designName.trim(),
            designType: i.designType || "",
            quantity: parseFloat(i.quantity),
            price: parseFloat(i.price),
            total: parseFloat(i.quantity) * parseFloat(i.price),
          })),
        });
        toast.success("✅ Bill updated successfully!");
        setEditBill(null);
        fetchBills();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to update bill");
      } finally {
        setEditLoading(false);
        setSubmitting(false);
      }
    },
  });

  /* ── Fetch ── */
  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await getAllBills();
      setBills(res.data.bills);
    } catch {
      toast.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBills();
  }, []);

  /* ── Filter/Sort ── */
  useEffect(() => {
    let r = [...bills];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (b) =>
          b.billNumber.toLowerCase().includes(q) ||
          b.vendorName.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") r = r.filter((b) => b.status === statusFilter);
    r.sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "highest") return b.grandTotal - a.grandTotal;
      if (sortBy === "lowest") return a.grandTotal - b.grandTotal;
      return 0;
    });
    setFiltered(r);
  }, [bills, search, statusFilter, sortBy]);

  /* ── Actions ── */
  const handleDelete = async (id) => {
    try {
      await deleteBill(id);
      toast.success("🗑️ Bill deleted");
      setDeleteId(null);
      fetchBills();
    } catch {
      toast.error("Failed to delete");
    }
  };
  const handleStatusChange = async (id, status) => {
    try {
      await updateBillStatus(id, status);
      toast.success("Status updated");
      fetchBills();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const openEdit = (bill) => {
    editFormik.resetForm({
      values: {
        vendorName: bill.vendorName,
        vendorPhone: bill.vendorPhone || "",
        vendorAddress: bill.vendorAddress || "",
        taxRate: bill.taxRate || 0,
        status: bill.status,
        notes: bill.notes || "",
        items: bill.items.map((i) => ({ ...i })),
      },
    });
    setEditBill(bill);
  };

  /* ── Edit item helpers ── */
  const ev = editFormik.values;
  const setEditItem = (idx, field, val) => {
    const items = [...ev.items];
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
    editFormik.setFieldValue("items", items);
  };

  const editSubtotal = ev.items.reduce((s, i) => s + (i.total || 0), 0);
  const editTaxAmount = (editSubtotal * (parseFloat(ev.taxRate) || 0)) / 100;
  const editGrandTotal = editSubtotal + editTaxAmount;

  /* ── Monthly PDF handlers ── */
  const fetchMonthVendors = async (y, m) => {
    setMonthVendorsFetching(true);
    setMonthVendorNames([]);
    setMonthVendorFilter("all");
    try {
      const res = await getBillsByMonth(y, m);
      setMonthVendorNames(res.data.vendorNames || []);
    } catch {
      toast.error("Failed to load vendors");
    } finally {
      setMonthVendorsFetching(false);
    }
  };
  const openMonthPicker = () => {
    setShowMonthPicker(true);
    fetchMonthVendors(monthYear.year, monthYear.month);
  };
  const handleMonthPickerChange = (field, val) => {
    const updated = { ...monthYear, [field]: val };
    setMonthYear(updated);
    fetchMonthVendors(updated.year, updated.month);
  };
  const handleMonthlyPDF = async () => {
    setMonthlyLoading(true);
    try {
      const vendor = monthVendorFilter === "all" ? null : monthVendorFilter;
      const res = await getBillsByMonth(
        monthYear.year,
        monthYear.month,
        vendor,
      );
      const { bills: mBills, vendors, summary } = res.data;
      if (!mBills.length) {
        toast.info("No bills found for selected month/vendor");
        return;
      }
      if (monthVendorFilter === "all") {
        generateMonthlyPDF(
          mBills,
          monthYear.year,
          monthYear.month,
          summary,
          vendors,
        );
      } else {
        const vd = vendors.find((v) => v.vendorName === monthVendorFilter) || {
          vendorName: monthVendorFilter,
          bills: mBills,
          totalBills: mBills.length,
          totalRevenue: summary.totalRevenue,
          paidRevenue: summary.paidRevenue,
          unpaidRevenue: summary.unpaidRevenue,
        };
        generateMonthlyPDF(
          mBills,
          monthYear.year,
          monthYear.month,
          { ...summary },
          [vd],
        );
      }
      toast.success("📊 Monthly PDF downloaded!");
      setShowMonthPicker(false);
    } catch {
      toast.error("Failed to generate report");
    } finally {
      setMonthlyLoading(false);
    }
  };

  /* ── Status colour for inline dropdown ── */
  const statusStyle = (s) => ({
    background:
      s === "paid" ? "#DCFCE7" : s === "unpaid" ? "#FEE2E2" : "#FEF3C7",
    color: s === "paid" ? "#15803D" : s === "unpaid" ? "#B91C1C" : "#92400E",
    border: `1px solid ${s === "paid" ? "#86EFAC" : s === "unpaid" ? "#FCA5A5" : "#FCD34D"}`,
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "DM Sans, sans-serif",
    cursor: "pointer",
    outline: "none",
  });

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F5F3FF",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
        }}
      >
        <div className="spinner" />
        <p style={{ color: "#6B7280", fontSize: 14 }}>Loading bills…</p>
      </div>
    );

  return (
    <div style={{ background: "#F5F3FF", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 20px" }}>
        {/* ── Page Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 22,
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          <div>
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
              Invoice Records
            </p>
            <h2
              style={{
                color: "#111827",
                fontSize: 28,
                fontWeight: 800,
                fontFamily: "DM Serif Display, Georgia, serif",
                marginBottom: 4,
                lineHeight: 1.2,
              }}
            >
              Bill History
            </h2>
            <p style={{ color: "#6B7280", fontSize: 14 }}>
              {bills.length} total invoice{bills.length !== 1 ? "s" : ""} on
              record
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={openMonthPicker}
              className="btn-primary"
            >
              <ICal /> Monthly Report
            </button>
            <Link to="/create" className="btn-gold">
              <IPlus /> New Bill
            </Link>
          </div>
        </div>

        {/* ── Filters ── */}
        <div
          className="sp-card"
          style={{ padding: "14px 18px", marginBottom: 18 }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div
              style={{ position: "relative", flex: "1 1 200px", minWidth: 180 }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <ISearch />
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search bill no or vendor…"
                className="sp-input"
                style={{ paddingLeft: 36 }}
              />
            </div>
            <Select
              value={statusFilter}
              style={{ flex: "0 0 130px" }}
              onChange={(value) => setStatusFilter(value)}
              options={[
                { value: "all", label: "All Status" },
                { value: "paid", label: "Paid" },
                { value: "unpaid", label: "Unpaid" },
                { value: "pending", label: "Pending" },
              ]}
            />
            <Select
              value={sortBy}
              style={{ flex: "0 0 148px" }}
              onChange={(value) => setSortBy(value)}
              options={[
                { value: "newest", label: "Newest First" },
                { value: "oldest", label: "Oldest First" },
                { value: "highest", label: "Highest Amount" },
                { value: "lowest", label: "Lowest Amount" },
              ]}
            />
          </div>
        </div>

        {/* ── Empty ── */}
        {filtered.length === 0 && (
          <div
            className="sp-card"
            style={{ textAlign: "center", padding: "60px 24px" }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D1D5DB"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{ margin: "0 auto 14px", display: "block" }}
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 3 2 3-2 3 2 3-2 3 2V4a2 2 0 0 0-2-2z" />
            </svg>
            <p style={{ color: "#374151", fontWeight: 600, marginBottom: 4 }}>
              No bills found
            </p>
            <p style={{ color: "#9CA3AF", fontSize: 13 }}>
              Try adjusting your filters
            </p>
          </div>
        )}

        {/* ── Desktop Table ── */}
        {filtered.length > 0 && (
          <>
            <div className="sp-card hide-mobile" style={{ overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table className="sp-table">
                  <thead>
                    <tr>
                      <th>Bill No</th>
                      <th>Vendor</th>
                      <th style={{ textAlign: "center" }}>Items</th>
                      <th>Date</th>
                      <th style={{ textAlign: "right" }}>Amount</th>
                      <th style={{ textAlign: "center" }}>Status</th>
                      <th style={{ textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((bill) => (
                      <React.Fragment key={bill._id}>
                        <tr>
                          <td>
                            <span
                              style={{
                                fontFamily: "JetBrains Mono,monospace",
                                color: "#7C3AED",
                                fontWeight: 700,
                                fontSize: 13,
                                background: "#EDE9FE",
                                padding: "2px 8px",
                                borderRadius: 6,
                              }}
                            >
                              {bill.billNumber}
                            </span>
                          </td>
                          <td>
                            <p style={{ fontWeight: 600, color: "#111827" }}>
                              {bill.vendorName}
                            </p>
                            {bill.vendorPhone && (
                              <p
                                style={{
                                  color: "#9CA3AF",
                                  fontSize: 12,
                                  marginTop: 2,
                                }}
                              >
                                {bill.vendorPhone}
                              </p>
                            )}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span
                              style={{
                                background: "#EDE9FE",
                                color: "#7C3AED",
                                border: "1px solid #DDD6FE",
                                borderRadius: 20,
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "2px 9px",
                              }}
                            >
                              {bill.items.length}
                            </span>
                          </td>
                          <td style={{ color: "#6B7280" }}>
                            {new Date(bill.createdAt).toLocaleDateString(
                              "en-IN",
                            )}
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              fontWeight: 700,
                              fontSize: 15,
                              color: "#111827",
                            }}
                          >
                            ₹{bill.grandTotal.toLocaleString("en-IN")}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <Select
                              value={bill.status}
                              style={{
                                ...statusStyle(bill.status),
                                width: 120,
                              }}
                              onChange={(value) =>
                                handleStatusChange(bill._id, value)
                              }
                              options={[
                                { value: "pending", label: "Pending" },
                                { value: "paid", label: "Paid" },
                                { value: "unpaid", label: "Unpaid" },
                              ]}
                            />
                          </td>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                gap: 6,
                                justifyContent: "center",
                              }}
                            >
                              <ActionBtn
                                bg="#EDE9FE"
                                color="#7C3AED"
                                border="#DDD6FE"
                                title="Expand"
                                onClick={() =>
                                  setExpandedId(
                                    expandedId === bill._id ? null : bill._id,
                                  )
                                }
                              >
                                <IDown up={expandedId === bill._id} />
                              </ActionBtn>
                              <ActionBtn
                                bg="#EDE9FE"
                                color="#7C3AED"
                                border="#DDD6FE"
                                title="Download PDF"
                                onClick={() => generateBillPDF(bill)}
                              >
                                <IDl />
                              </ActionBtn>
                              <ActionBtn
                                bg="#DCFCE7"
                                color="#16A34A"
                                border="#86EFAC"
                                title="Edit"
                                onClick={() => openEdit(bill)}
                              >
                                <IEdit />
                              </ActionBtn>
                              <ActionBtn
                                bg="#FEE2E2"
                                color="#EF4444"
                                border="#FECACA"
                                title="Delete"
                                onClick={() => setDeleteId(bill._id)}
                              >
                                <ITrash />
                              </ActionBtn>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded items */}
                        {expandedId === bill._id && (
                          <tr>
                            <td
                              colSpan="7"
                              style={{
                                padding: "0 20px 16px",
                                background: "#F5F3FF",
                              }}
                            >
                              <div
                                style={{
                                  border: "1.5px solid #DDD6FE",
                                  borderRadius: 12,
                                  overflow: "hidden",
                                  marginTop: 4,
                                }}
                              >
                                <table
                                  style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: 13,
                                  }}
                                >
                                  <thead>
                                    <tr style={{ background: "#EDE9FE" }}>
                                      {[
                                        "#",
                                        "Design Name",
                                        "Type",
                                        "Qty",
                                        "Unit Price",
                                        "Total",
                                      ].map((h) => (
                                        <th
                                          key={h}
                                          style={{
                                            padding: "8px 14px",
                                            textAlign: "left",
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: "#7C3AED",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.07em",
                                          }}
                                        >
                                          {h}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {bill.items.map((item, i) => (
                                      <tr
                                        key={i}
                                        style={{
                                          borderTop: "1px solid #E5E7EB",
                                          background: "#fff",
                                        }}
                                      >
                                        <td style={{ padding: "9px 14px" }}>
                                          <span
                                            style={{
                                              fontFamily:
                                                "JetBrains Mono,monospace",
                                              color: "#7C3AED",
                                              fontWeight: 700,
                                              fontSize: 12,
                                            }}
                                          >
                                            {String(i + 1).padStart(2, "0")}
                                          </span>
                                        </td>
                                        <td
                                          style={{
                                            padding: "9px 14px",
                                            fontWeight: 600,
                                            color: "#111827",
                                          }}
                                        >
                                          {item.designName}
                                        </td>
                                        <td style={{ padding: "9px 14px" }}>
                                          {item.designType ? (
                                            <span
                                              style={{
                                                background: "#EDE9FE",
                                                color: "#7C3AED",
                                                border: "1px solid #DDD6FE",
                                                borderRadius: 20,
                                                fontSize: 11,
                                                fontWeight: 700,
                                                padding: "2px 8px",
                                              }}
                                            >
                                              {item.designType}
                                            </span>
                                          ) : (
                                            <span style={{ color: "#D1D5DB" }}>
                                              —
                                            </span>
                                          )}
                                        </td>
                                        <td
                                          style={{
                                            padding: "9px 14px",
                                            color: "#374151",
                                          }}
                                        >
                                          {item.quantity}
                                        </td>
                                        <td
                                          style={{
                                            padding: "9px 14px",
                                            color: "#374151",
                                          }}
                                        >
                                          ₹{item.price.toLocaleString("en-IN")}
                                        </td>
                                        <td
                                          style={{
                                            padding: "9px 14px",
                                            fontWeight: 700,
                                            color: "#7C3AED",
                                          }}
                                        >
                                          ₹{item.total.toLocaleString("en-IN")}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot>
                                    {bill.taxRate > 0 && (
                                      <tr
                                        style={{
                                          borderTop: "1px solid #E5E7EB",
                                          background: "#F9FAFB",
                                        }}
                                      >
                                        <td
                                          colSpan="5"
                                          style={{
                                            padding: "8px 14px",
                                            textAlign: "right",
                                            fontWeight: 600,
                                            color: "#6B7280",
                                            fontSize: 12,
                                          }}
                                        >
                                          GST ({bill.taxRate}%)
                                        </td>
                                        <td
                                          style={{
                                            padding: "8px 14px",
                                            fontWeight: 700,
                                            color: "#111827",
                                          }}
                                        >
                                          ₹
                                          {bill.taxAmount.toLocaleString(
                                            "en-IN",
                                          )}
                                        </td>
                                      </tr>
                                    )}
                                    <tr
                                      style={{
                                        background:
                                          "linear-gradient(135deg,#1e0a4e,#3730A3)",
                                      }}
                                    >
                                      <td
                                        colSpan="5"
                                        style={{
                                          padding: "10px 14px",
                                          textAlign: "right",
                                          color: "#C4B5FD",
                                          fontWeight: 700,
                                          fontSize: 12,
                                          textTransform: "uppercase",
                                          letterSpacing: "0.08em",
                                        }}
                                      >
                                        Grand Total
                                      </td>
                                      <td
                                        style={{
                                          padding: "10px 14px",
                                          color: "#fff",
                                          fontWeight: 800,
                                          fontSize: 15,
                                        }}
                                      >
                                        ₹
                                        {bill.grandTotal.toLocaleString(
                                          "en-IN",
                                        )}
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                                {bill.notes && (
                                  <div
                                    style={{
                                      padding: "8px 14px",
                                      background: "#FFFBEB",
                                      borderTop: "1px solid #FDE68A",
                                      fontSize: 12,
                                      color: "#92400E",
                                      fontStyle: "italic",
                                    }}
                                  >
                                    📝 {bill.notes}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="show-mobile-list" style={{ display: "none" }}>
              {filtered.map((bill) => (
                <div
                  key={bill._id}
                  className="sp-card"
                  style={{ marginBottom: 12, overflow: "hidden" }}
                >
                  <div style={{ padding: "14px 16px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "JetBrains Mono,monospace",
                          color: "#7C3AED",
                          fontWeight: 700,
                          fontSize: 12,
                          background: "#EDE9FE",
                          padding: "2px 7px",
                          borderRadius: 5,
                        }}
                      >
                        {bill.billNumber}
                      </span>
                      <Select
                        value={bill.status}
                        size="small"
                        style={{
                          ...statusStyle(bill.status),
                          fontSize: 11,
                          width: 110,
                        }}
                        onChange={(value) =>
                          handleStatusChange(bill._id, value)
                        }
                        options={[
                          { value: "pending", label: "Pending" },
                          { value: "paid", label: "Paid" },
                          { value: "unpaid", label: "Unpaid" },
                        ]}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontWeight: 700,
                            color: "#111827",
                            fontSize: 15,
                          }}
                        >
                          {bill.vendorName}
                        </p>
                        {bill.vendorPhone && (
                          <p
                            style={{
                              color: "#9CA3AF",
                              fontSize: 12,
                              marginTop: 2,
                            }}
                          >
                            {bill.vendorPhone}
                          </p>
                        )}
                        <p
                          style={{
                            color: "#9CA3AF",
                            fontSize: 12,
                            marginTop: 4,
                          }}
                        >
                          {new Date(bill.createdAt).toLocaleDateString("en-IN")}{" "}
                          · {bill.items.length} item
                          {bill.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <p
                        style={{
                          fontWeight: 800,
                          fontSize: 17,
                          color: "#111827",
                        }}
                      >
                        ₹{bill.grandTotal.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                  {/* Actions strip */}
                  <div
                    style={{
                      borderTop: "1px solid #F3F4F6",
                      padding: "10px 14px",
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === bill._id ? null : bill._id)
                      }
                      style={{
                        flex: 1,
                        minWidth: 60,
                        padding: "7px 10px",
                        borderRadius: 9,
                        background: "#EDE9FE",
                        color: "#7C3AED",
                        border: "1.5px solid #DDD6FE",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "DM Sans,sans-serif",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                      }}
                    >
                      <IDown up={expandedId === bill._id} />{" "}
                      {expandedId === bill._id ? "Hide" : "Items"}
                    </button>
                    <button
                      onClick={() => generateBillPDF(bill)}
                      style={{
                        flex: 1,
                        minWidth: 60,
                        padding: "7px 10px",
                        borderRadius: 9,
                        background: "#EDE9FE",
                        color: "#7C3AED",
                        border: "1.5px solid #DDD6FE",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "DM Sans,sans-serif",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                      }}
                    >
                      <IDl /> PDF
                    </button>
                    <button
                      onClick={() => openEdit(bill)}
                      style={{
                        flex: 1,
                        minWidth: 60,
                        padding: "7px 10px",
                        borderRadius: 9,
                        background: "#DCFCE7",
                        color: "#16A34A",
                        border: "1.5px solid #86EFAC",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "DM Sans,sans-serif",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                      }}
                    >
                      <IEdit /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(bill._id)}
                      style={{
                        flex: 1,
                        minWidth: 60,
                        padding: "7px 10px",
                        borderRadius: 9,
                        background: "#FEE2E2",
                        color: "#EF4444",
                        border: "1.5px solid #FECACA",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "DM Sans,sans-serif",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                      }}
                    >
                      <ITrash /> Delete
                    </button>
                  </div>
                  {/* Mobile expanded items */}
                  {expandedId === bill._id && (
                    <div
                      style={{
                        borderTop: "1px solid #DDD6FE",
                        background: "#F5F3FF",
                        padding: "12px 14px",
                      }}
                    >
                      {bill.items.map((item, i) => (
                        <div
                          key={i}
                          style={{
                            background: "#fff",
                            border: "1px solid #E5E7EB",
                            borderRadius: 10,
                            padding: "10px 12px",
                            marginBottom: 8,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                            }}
                          >
                            <div>
                              <p
                                style={{
                                  fontWeight: 600,
                                  color: "#111827",
                                  fontSize: 14,
                                }}
                              >
                                {item.designName}
                              </p>
                              {item.designType && (
                                <span
                                  style={{
                                    background: "#EDE9FE",
                                    color: "#7C3AED",
                                    border: "1px solid #DDD6FE",
                                    borderRadius: 20,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    padding: "1px 7px",
                                  }}
                                >
                                  {item.designType}
                                </span>
                              )}
                              <p
                                style={{
                                  color: "#9CA3AF",
                                  fontSize: 12,
                                  marginTop: 4,
                                }}
                              >
                                Qty: {item.quantity} × ₹
                                {item.price.toLocaleString("en-IN")}
                              </p>
                            </div>
                            <span
                              style={{
                                fontWeight: 700,
                                color: "#7C3AED",
                                fontSize: 15,
                              }}
                            >
                              ₹{item.total.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          borderTop: "1px solid #DDD6FE",
                          paddingTop: 8,
                          marginTop: 4,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            color: "#374151",
                            fontSize: 13,
                          }}
                        >
                          Grand Total
                        </span>
                        <span
                          style={{
                            fontWeight: 800,
                            color: "#1e0a4e",
                            fontSize: 15,
                          }}
                        >
                          ₹{bill.grandTotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

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

      {/* ════════════════════════════════════
          MONTHLY PDF PICKER MODAL
      ════════════════════════════════════ */}
      {showMonthPicker && (
        <div className="modal-overlay">
          <div
            className="sp-card"
            style={{
              padding: "28px 26px",
              maxWidth: 380,
              width: "100%",
              boxShadow: "0 24px 64px rgba(30,10,78,0.22)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: "#EDE9FE",
                  borderRadius: 11,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ICal />
              </div>
              <div>
                <h3
                  style={{
                    color: "#111827",
                    fontSize: 18,
                    fontWeight: 800,
                    fontFamily: "DM Serif Display,Georgia,serif",
                    margin: 0,
                  }}
                >
                  Monthly Report
                </h3>
                <p
                  style={{ color: "#9CA3AF", fontSize: 12, margin: "2px 0 0" }}
                >
                  Select month, year & vendor
                </p>
              </div>
            </div>

            <div
              style={{ height: 1, background: "#F3F4F6", marginBottom: 18 }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div>
                <label className="sp-label">Month</label>
                <Select
                  value={monthYear.month}
                  style={{ width: 140 }}
                  onChange={(value) => handleMonthPickerChange("month", value)}
                  options={MONTHS.map((m, i) => ({
                    value: i + 1,
                    label: m,
                  }))}
                />
              </div>
              <div>
                <label className="sp-label">Year</label>
                <input
                  type="number"
                  min="2020"
                  max="2099"
                  value={monthYear.year}
                  onChange={(e) =>
                    handleMonthPickerChange(
                      "year",
                      parseInt(e.target.value) || monthYear.year,
                    )
                  }
                  className="sp-input"
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="sp-label">Vendor</label>
              {monthVendorsFetching ? (
                <div className="sp-input" style={{ color: "#9CA3AF" }}>
                  Loading vendors…
                </div>
              ) : monthVendorNames.length === 0 ? (
                <div
                  style={{
                    background: "#FEF3C7",
                    border: "1.5px solid #FCD34D",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "#92400E",
                  }}
                >
                  No bills found for this month
                </div>
              ) : (
                <Select
                  value={monthVendorFilter}
                  style={{ width: 180 }}
                  onChange={(value) => setMonthVendorFilter(value)}
                  options={[
                    {
                      value: "all",
                      label: `All Vendors (${monthVendorNames.length})`,
                    },
                    ...monthVendorNames.map((v) => ({
                      value: v,
                      label: v,
                    })),
                  ]}
                />
              )}
              {monthVendorFilter !== "all" && monthVendorNames.length > 0 && (
                <p
                  style={{
                    color: "#7C3AED",
                    fontSize: 11,
                    fontWeight: 600,
                    marginTop: 5,
                  }}
                >
                  PDF will show only: {monthVendorFilter}
                </p>
              )}
              {monthVendorFilter === "all" && monthVendorNames.length > 0 && (
                <p style={{ color: "#6B7280", fontSize: 11, marginTop: 5 }}>
                  PDF includes all {monthVendorNames.length} vendor
                  {monthVendorNames.length > 1 ? "s" : ""} — each with their own
                  section
                </p>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  setShowMonthPicker(false);
                  setMonthVendorFilter("all");
                  setMonthVendorNames([]);
                }}
                className="btn-ghost"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleMonthlyPDF}
                disabled={monthlyLoading || monthVendorNames.length === 0}
                className="btn-primary"
                style={{ flex: "1.6" }}
              >
                {monthlyLoading ? (
                  <>
                    <div className="spinner-sm" /> Generating…
                  </>
                ) : monthVendorFilter === "all" ? (
                  "Download All"
                ) : (
                  `Download — ${monthVendorFilter.split(" ")[0]}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
          EDIT BILL MODAL — Formik + Yup
      ════════════════════════════════════ */}
      {editBill && (
        <div
          className="modal-overlay"
          style={{
            alignItems: "flex-start",
            paddingTop: 20,
            paddingBottom: 20,
          }}
        >
          <div
            className="sp-card"
            style={{
              padding: "26px 24px",
              maxWidth: 760,
              width: "100%",
              boxShadow: "0 24px 64px rgba(30,10,78,0.2)",
              my: 20,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: "1.5px solid #F3F4F6",
              }}
            >
              <div>
                <h3
                  style={{
                    color: "#111827",
                    fontSize: 20,
                    fontWeight: 800,
                    fontFamily: "DM Serif Display,Georgia,serif",
                    margin: 0,
                  }}
                >
                  Edit Bill
                </h3>
                <p
                  style={{
                    color: "#7C3AED",
                    fontFamily: "JetBrains Mono,monospace",
                    fontWeight: 700,
                    fontSize: 13,
                    marginTop: 3,
                  }}
                >
                  {editBill.billNumber}
                </p>
              </div>
              <button
                onClick={() => setEditBill(null)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "#F3F4F6",
                  color: "#6B7280",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={editFormik.handleSubmit} noValidate>
              {/* Vendor fields */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
                  gap: 14,
                  marginBottom: 18,
                }}
              >
                {[
                  ["vendorName", "Vendor Name", true, "Vendor name"],
                  ["vendorPhone", "Phone", "", "9876543210"],
                  ["vendorAddress", "Address", "", "City, State"],
                ].map(([name, label, req, ph]) => (
                  <div key={name}>
                    <label className="sp-label">
                      {label}
                      {req && <span style={{ color: "#EF4444" }}> *</span>}
                    </label>
                    <input
                      name={name}
                      value={editFormik.values[name] || ""}
                      onChange={editFormik.handleChange}
                      onBlur={editFormik.handleBlur}
                      placeholder={ph}
                      className={`sp-input${editFormik.touched[name] && editFormik.errors[name] ? " is-error" : ""}`}
                    />
                    {editFormik.touched[name] && editFormik.errors[name] && (
                      <p className="sp-err">{editFormik.errors[name]}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Items */}
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <label className="sp-label" style={{ marginBottom: 0 }}>
                    Design Items
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      editFormik.setFieldValue("items", [
                        ...ev.items,
                        emptyItem(),
                      ])
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      background: "#EDE9FE",
                      color: "#7C3AED",
                      border: "1.5px solid #DDD6FE",
                      padding: "6px 12px",
                      borderRadius: 9,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "DM Sans,sans-serif",
                    }}
                  >
                    <IPlus /> Add Row
                  </button>
                </div>

                {/* Desktop edit table */}
                <div
                  style={{
                    border: "1.5px solid #E5E7EB",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                  className="hide-mobile"
                >
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#F9FAFB" }}>
                        {[
                          "#",
                          "Design Name",
                          "Type",
                          "Qty",
                          "Price (₹)",
                          "Total",
                          "",
                        ].map((h, i) => (
                          <th
                            key={i}
                            style={{
                              padding: "9px 12px",
                              textAlign: "left",
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#6B7280",
                              textTransform: "uppercase",
                              letterSpacing: "0.07em",
                              borderBottom: "1.5px solid #E5E7EB",
                              fontFamily: "DM Sans,sans-serif",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ev.items.map((item, idx) => (
                        <tr
                          key={idx}
                          style={{ borderBottom: "1px solid #F3F4F6" }}
                        >
                          <td
                            style={{ padding: "9px 12px", textAlign: "center" }}
                          >
                            <span
                              style={{
                                fontFamily: "JetBrains Mono,monospace",
                                color: "#7C3AED",
                                fontWeight: 700,
                                fontSize: 11,
                                background: "#EDE9FE",
                                padding: "1px 6px",
                                borderRadius: 4,
                              }}
                            >
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                          </td>
                          <td style={{ padding: "9px 12px", minWidth: 140 }}>
                            <input
                              value={item.designName}
                              onChange={(e) =>
                                setEditItem(idx, "designName", e.target.value)
                              }
                              onBlur={() =>
                                editFormik.setFieldTouched(
                                  `items[${idx}].designName`,
                                  true,
                                )
                              }
                              className={`sp-input${editFormik.touched.items?.[idx]?.designName && editFormik.errors.items?.[idx]?.designName ? " is-error" : ""}`}
                              style={{ fontSize: 13 }}
                              placeholder="Design name"
                            />
                            {editFormik.touched.items?.[idx]?.designName &&
                              editFormik.errors.items?.[idx]?.designName && (
                                <p className="sp-err">
                                  {editFormik.errors.items[idx].designName}
                                </p>
                              )}
                          </td>
                          <td style={{ padding: "9px 12px" }}>
                            <Select
                              size="small"
                              value={item.designType || undefined}
                              placeholder="None"
                              style={{ width: 110, fontSize: 13 }}
                              onChange={(value) =>
                                setEditItem(idx, "designType", value)
                              }
                              options={[
                                { value: "", label: "None" },
                                ...DESIGN_TYPES.map((t) => ({
                                  value: t,
                                  label: t,
                                })),
                              ]}
                            />
                          </td>
                          <td style={{ padding: "9px 12px" }}>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                setEditItem(idx, "quantity", e.target.value)
                              }
                              className="sp-input"
                              style={{
                                width: 66,
                                textAlign: "center",
                                fontSize: 13,
                              }}
                            />
                          </td>
                          <td style={{ padding: "9px 12px" }}>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) =>
                                setEditItem(idx, "price", e.target.value)
                              }
                              onBlur={() =>
                                editFormik.setFieldTouched(
                                  `items[${idx}].price`,
                                  true,
                                )
                              }
                              className={`sp-input${editFormik.touched.items?.[idx]?.price && editFormik.errors.items?.[idx]?.price ? " is-error" : ""}`}
                              style={{ width: 100, fontSize: 13 }}
                            />
                            {editFormik.touched.items?.[idx]?.price &&
                              editFormik.errors.items?.[idx]?.price && (
                                <p className="sp-err">
                                  {editFormik.errors.items[idx].price}
                                </p>
                              )}
                          </td>
                          <td
                            style={{
                              padding: "9px 12px",
                              fontWeight: 700,
                              color: "#7C3AED",
                              fontSize: 14,
                            }}
                          >
                            ₹
                            {(item.total || 0).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td
                            style={{ padding: "9px 12px", textAlign: "center" }}
                          >
                            <button
                              type="button"
                              disabled={ev.items.length === 1}
                              onClick={() =>
                                ev.items.length > 1 &&
                                editFormik.setFieldValue(
                                  "items",
                                  ev.items.filter((_, i) => i !== idx),
                                )
                              }
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 7,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor:
                                  ev.items.length === 1
                                    ? "not-allowed"
                                    : "pointer",
                                background:
                                  ev.items.length === 1 ? "#F9FAFB" : "#FEE2E2",
                                color:
                                  ev.items.length === 1 ? "#D1D5DB" : "#EF4444",
                                border: `1.5px solid ${ev.items.length === 1 ? "#E5E7EB" : "#FECACA"}`,
                              }}
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile edit items */}
                <div className="show-mobile-items" style={{ display: "none" }}>
                  {ev.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "#F9FAFB",
                        border: "1px solid #E5E7EB",
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "JetBrains Mono,monospace",
                            color: "#7C3AED",
                            fontWeight: 700,
                            fontSize: 11,
                            background: "#EDE9FE",
                            padding: "1px 6px",
                            borderRadius: 4,
                          }}
                        >
                          Item {idx + 1}
                        </span>
                        <button
                          type="button"
                          disabled={ev.items.length === 1}
                          onClick={() =>
                            ev.items.length > 1 &&
                            editFormik.setFieldValue(
                              "items",
                              ev.items.filter((_, i) => i !== idx),
                            )
                          }
                          style={{
                            color:
                              ev.items.length === 1 ? "#D1D5DB" : "#EF4444",
                            background: "none",
                            border: "none",
                            cursor:
                              ev.items.length === 1 ? "not-allowed" : "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                            fontFamily: "DM Sans,sans-serif",
                          }}
                        >
                          Remove
                        </button>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                        }}
                      >
                        <div style={{ gridColumn: "1/-1" }}>
                          <label className="sp-label">Name *</label>
                          <input
                            value={item.designName}
                            onChange={(e) =>
                              setEditItem(idx, "designName", e.target.value)
                            }
                            className="sp-input"
                            style={{ fontSize: 13 }}
                          />
                        </div>
                        <div style={{ gridColumn: "1/-1" }}>
                          <label className="sp-label">Type</label>
                          <Select
                            size="small"
                            value={item.designType || undefined}
                            placeholder="None"
                            style={{ fontSize: 13, width: "100%" }}
                            onChange={(value) =>
                              setEditItem(idx, "designType", value)
                            }
                            options={[
                              { value: "", label: "None" },
                              ...DESIGN_TYPES.map((t) => ({
                                value: t,
                                label: t,
                              })),
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
                              setEditItem(idx, "quantity", e.target.value)
                            }
                            className="sp-input"
                            style={{ textAlign: "center", fontSize: 13 }}
                          />
                        </div>
                        <div>
                          <label className="sp-label">Price (₹) *</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price}
                            onChange={(e) =>
                              setEditItem(idx, "price", e.target.value)
                            }
                            className="sp-input"
                            style={{ fontSize: 13 }}
                          />
                        </div>
                        <div
                          style={{
                            gridColumn: "1/-1",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              color: "#6B7280",
                              fontWeight: 600,
                            }}
                          >
                            Total
                          </span>
                          <span style={{ fontWeight: 700, color: "#7C3AED" }}>
                            ₹
                            {(item.total || 0).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom: status + summary */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div>
                    <label className="sp-label">GST %</label>
                    <input
                      type="number"
                      name="taxRate"
                      min="0"
                      max="100"
                      value={ev.taxRate}
                      onChange={editFormik.handleChange}
                      className="sp-input"
                    />
                  </div>
                  <div>
                    <label className="sp-label">Status</label>
                    <Select
                      size="middle"
                      value={ev.status}
                      style={{ width: "100%" }}
                      onChange={(value) =>
                        editFormik.setFieldValue("status", value)
                      }
                      options={[
                        { value: "pending", label: "Pending" },
                        { value: "paid", label: "Paid" },
                        { value: "unpaid", label: "Unpaid" },
                      ]}
                    />
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label className="sp-label">Notes</label>
                    <input
                      name="notes"
                      value={ev.notes || ""}
                      onChange={editFormik.handleChange}
                      placeholder="Notes…"
                      className="sp-input"
                    />
                  </div>
                </div>

                <div
                  style={{
                    background: "linear-gradient(135deg,#1e0a4e,#3730A3)",
                    borderRadius: 14,
                    padding: "18px 20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      color: "#C4B5FD",
                      marginBottom: 8,
                    }}
                  >
                    <span>Subtotal</span>
                    <span style={{ color: "#fff", fontWeight: 600 }}>
                      ₹
                      {editSubtotal.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  {parseFloat(ev.taxRate) > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 13,
                        color: "#C4B5FD",
                        marginBottom: 8,
                      }}
                    >
                      <span>GST ({ev.taxRate}%)</span>
                      <span style={{ color: "#fff", fontWeight: 600 }}>
                        ₹
                        {editTaxAmount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                  <div
                    style={{
                      borderTop: "1px solid rgba(196,181,253,0.3)",
                      paddingTop: 10,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
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
                      style={{
                        color: "#FBBF24",
                        fontWeight: 800,
                        fontSize: 22,
                      }}
                    >
                      ₹
                      {editGrandTotal.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setEditBill(null)}
                  className="btn-ghost"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="btn-primary"
                  style={{ flex: 2 }}
                >
                  {editLoading ? (
                    <>
                      <div className="spinner-sm" /> Saving…
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
          DELETE CONFIRM MODAL
      ════════════════════════════════════ */}
      {deleteId && (
        <div className="modal-overlay">
          <div
            className="sp-card"
            style={{
              padding: "36px 32px",
              maxWidth: 380,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                background: "#FEE2E2",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <ITrash />
            </div>
            <h3
              style={{
                color: "#111827",
                fontSize: 22,
                fontWeight: 800,
                fontFamily: "DM Serif Display,Georgia,serif",
                marginBottom: 8,
              }}
            >
              Delete Bill?
            </h3>
            <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 26 }}>
              This action is permanent and cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setDeleteId(null)}
                className="btn-ghost"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                style={{
                  flex: 1,
                  padding: "11px 20px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#DC2626,#EF4444)",
                  color: "#fff",
                  border: "none",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "DM Sans,sans-serif",
                  boxShadow: "0 4px 16px rgba(220,38,38,0.35)",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
          .show-mobile-list { display: block !important; }
          .show-mobile-items { display: block !important; }
        }
      `}</style>
    </div>
  );
}
