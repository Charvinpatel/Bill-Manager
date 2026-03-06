import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllBills, deleteBill, updateBillStatus } from "../api";
import { generateBillPDF } from "../pdfGenerator";
import { toast } from "react-toastify";
import { Select } from "antd";

/* ── SVG Icons ───────────────────────────────────────────── */
const IconSearch = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#9CA3AF"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconChevron = ({ up }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transform: up ? "rotate(180deg)" : "none",
      transition: "transform 0.2s",
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconDownload = () => (
  <svg
    width="14"
    height="14"
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
const IconTrash = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
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
const IconEmpty = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#D1D5DB"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 3 2 3-2 3 2 3-2 3 2V4a2 2 0 0 0-2-2z" />
    <line x1="16" y1="9" x2="8" y2="9" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="10" y1="17" x2="8" y2="17" />
  </svg>
);
const IconAlert = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#EF4444"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

/* ── Status Config ───────────────────────────────────────── */
const STATUS_STYLES = {
  paid: { bg: "#DCFCE7", color: "#15803D", border: "#86EFAC", dot: "#16A34A" },
  unpaid: {
    bg: "#FEE2E2",
    color: "#B91C1C",
    border: "#FCA5A5",
    dot: "#DC2626",
  },
  pending: {
    bg: "#FEF3C7",
    color: "#92400E",
    border: "#FCD34D",
    dot: "#D97706",
  },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        fontFamily: "system-ui, sans-serif",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      <span
        style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }}
      ></span>
      {status}
    </span>
  );
};

/* ── Main Component ──────────────────────────────────────── */
const BillHistory = () => {
  const [bills, setBills] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [expandedId, setExpandedId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

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
    if (sortBy === "newest")
      r.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === "oldest")
      r.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === "highest")
      r.sort((a, b) => b.grandTotal - a.grandTotal);
    else if (sortBy === "lowest") r.sort((a, b) => a.grandTotal - b.grandTotal);
    setFiltered(r);
  }, [bills, search, statusFilter, sortBy]);

  const handleDelete = async (id) => {
    try {
      await deleteBill(id);
      toast.success("Bill deleted");
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

  const inputFocus = (e) => {
    e.target.style.borderColor = "#7C3AED";
    e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)";
  };
  const inputBlur = (e) => {
    e.target.style.borderColor = "#E5E7EB";
    e.target.style.boxShadow = "none";
  };

  const selectStyle = {
    background: "#FFFFFF",
    border: "1.5px solid #E5E7EB",
    borderRadius: 10,
    padding: "9px 14px",
    fontSize: 13,
    color: "#374151",
    fontFamily: "system-ui, sans-serif",
    outline: "none",
    cursor: "pointer",
    transition: "border-color 0.18s",
  };

  const thStyle = {
    padding: "11px 18px",
    fontSize: 11,
    fontWeight: 700,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontFamily: "system-ui, sans-serif",
    borderBottom: "1.5px solid #E5E7EB",
    whiteSpace: "nowrap",
    background: "#F9FAFB",
  };

  return (
    <div style={{ background: "#F5F3FF", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
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
              Invoice Records
            </p>
            <h2
              style={{
                color: "#111827",
                fontSize: 28,
                fontWeight: 800,
                fontFamily: "Georgia, serif",
                marginBottom: 4,
                lineHeight: 1.2,
              }}
            >
              Bill History
            </h2>
            <p
              style={{
                color: "#6B7280",
                fontSize: 14,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {bills.length} total invoice{bills.length !== 1 ? "s" : ""} on
              record
            </p>
          </div>
          <Link
            to="/create"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              background: "linear-gradient(135deg, #FBBF24, #F59E0B)",
              color: "#1e0a4e",
              padding: "11px 20px",
              borderRadius: 12,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "system-ui, sans-serif",
              boxShadow: "0 4px 16px rgba(251,191,36,0.35)",
            }}
          >
            <IconPlus /> New Bill
          </Link>
        </div>

        {/* ── Filters ── */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 14,
            padding: "16px 20px",
            marginBottom: 20,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <IconSearch />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by bill number or vendor…"
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "#FFFFFF",
                border: "1.5px solid #E5E7EB",
                borderRadius: 10,
                padding: "9px 14px 9px 38px",
                fontSize: 13,
                color: "#111827",
                fontFamily: "system-ui, sans-serif",
                outline: "none",
                transition: "border-color 0.18s",
              }}
              onFocus={inputFocus}
              onBlur={inputBlur}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            style={selectStyle}
            dropdownStyle={{ borderRadius: 10 }}
          >
            <Select.Option value="all">All Status</Select.Option>
            <Select.Option value="paid">Paid</Select.Option>
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="unpaid">Unpaid</Select.Option>
          </Select>
          <Select
            value={sortBy}
            onChange={(value) => setSortBy(value)}
            style={selectStyle}
            dropdownStyle={{ borderRadius: 10 }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </Select>
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 200,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                border: "3px solid #DDD6FE",
                borderTopColor: "#7C3AED",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }}
            ></div>
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              padding: "72px 24px",
              textAlign: "center",
              boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <IconEmpty />
            </div>
            <p
              style={{
                color: "#374151",
                fontSize: 16,
                fontWeight: 700,
                fontFamily: "system-ui, sans-serif",
                marginBottom: 6,
              }}
            >
              No bills found
            </p>
            <p
              style={{
                color: "#9CA3AF",
                fontSize: 14,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Try adjusting your filters or create a new bill
            </p>
          </div>
        ) : (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, textAlign: "left" }}>Bill No</th>
                    <th style={{ ...thStyle, textAlign: "left" }}>Vendor</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>Items</th>
                    <th style={{ ...thStyle, textAlign: "left" }}>Date</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Amount</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>Status</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((bill, idx) => (
                    <React.Fragment key={bill._id}>
                      <tr
                        style={{
                          borderBottom: "1px solid #F3F4F6",
                          transition: "background 0.13s",
                          background:
                            expandedId === bill._id ? "#FAF5FF" : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (expandedId !== bill._id)
                            e.currentTarget.style.background = "#FAFAFA";
                        }}
                        onMouseLeave={(e) => {
                          if (expandedId !== bill._id)
                            e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <td style={{ padding: "14px 18px" }}>
                          <span
                            style={{
                              fontFamily: "monospace",
                              color: "#7C3AED",
                              fontWeight: 700,
                              fontSize: 13,
                              background: "#EDE9FE",
                              padding: "3px 8px",
                              borderRadius: 6,
                            }}
                          >
                            {bill.billNumber}
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <p
                            style={{
                              color: "#111827",
                              fontWeight: 600,
                              fontSize: 14,
                              fontFamily: "system-ui, sans-serif",
                              margin: 0,
                            }}
                          >
                            {bill.vendorName}
                          </p>
                          {bill.vendorPhone && (
                            <p
                              style={{
                                color: "#9CA3AF",
                                fontSize: 12,
                                fontFamily: "system-ui, sans-serif",
                                margin: "3px 0 0",
                              }}
                            >
                              {bill.vendorPhone}
                            </p>
                          )}
                        </td>
                        <td
                          style={{ padding: "14px 18px", textAlign: "center" }}
                        >
                          <span
                            style={{
                              background: "#EDE9FE",
                              color: "#7C3AED",
                              border: "1px solid #DDD6FE",
                              padding: "3px 10px",
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 700,
                              fontFamily: "system-ui, sans-serif",
                            }}
                          >
                            {bill.items.length}
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <span
                            style={{
                              color: "#6B7280",
                              fontSize: 13,
                              fontFamily: "system-ui, sans-serif",
                            }}
                          >
                            {new Date(bill.createdAt).toLocaleDateString(
                              "en-IN",
                            )}
                          </span>
                        </td>
                        <td
                          style={{ padding: "14px 18px", textAlign: "right" }}
                        >
                          <span
                            style={{
                              color: "#111827",
                              fontWeight: 700,
                              fontSize: 15,
                              fontFamily: "system-ui, sans-serif",
                            }}
                          >
                            ₹{bill.grandTotal.toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td
                          style={{ padding: "14px 18px", textAlign: "center" }}
                        >
                          <select
                            value={bill.status}
                            onChange={(e) =>
                              handleStatusChange(bill._id, e.target.value)
                            }
                            style={{
                              ...(STATUS_STYLES[bill.status]
                                ? {
                                    background: STATUS_STYLES[bill.status].bg,
                                    color: STATUS_STYLES[bill.status].color,
                                    border: `1.5px solid ${STATUS_STYLES[bill.status].border}`,
                                  }
                                : {}),
                              padding: "4px 10px",
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer",
                              fontFamily: "system-ui, sans-serif",
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                              outline: "none",
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                          </select>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              justifyContent: "center",
                            }}
                          >
                            {/* Expand */}
                            <button
                              onClick={() =>
                                setExpandedId(
                                  expandedId === bill._id ? null : bill._id,
                                )
                              }
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: "#EEF2FF",
                                color: "#4F46E5",
                                border: "1.5px solid #C7D2FE",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.15s",
                              }}
                              title="View details"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#4F46E5";
                                e.currentTarget.style.color = "#fff";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#EEF2FF";
                                e.currentTarget.style.color = "#4F46E5";
                              }}
                            >
                              <IconChevron up={expandedId === bill._id} />
                            </button>
                            {/* PDF */}
                            <button
                              onClick={() => generateBillPDF(bill)}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: "#EDE9FE",
                                color: "#7C3AED",
                                border: "1.5px solid #DDD6FE",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.15s",
                              }}
                              title="Download PDF"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#7C3AED";
                                e.currentTarget.style.color = "#fff";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#EDE9FE";
                                e.currentTarget.style.color = "#7C3AED";
                              }}
                            >
                              <IconDownload />
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => setDeleteId(bill._id)}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: "#FEE2E2",
                                color: "#EF4444",
                                border: "1.5px solid #FECACA",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.15s",
                              }}
                              title="Delete"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#EF4444";
                                e.currentTarget.style.color = "#fff";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#FEE2E2";
                                e.currentTarget.style.color = "#EF4444";
                              }}
                            >
                              <IconTrash />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Items Row */}
                      {expandedId === bill._id && (
                        <tr>
                          <td
                            colSpan="7"
                            style={{
                              padding: "0 18px 16px",
                              background: "#FAF5FF",
                            }}
                          >
                            <div
                              style={{
                                background: "#FFFFFF",
                                borderRadius: 12,
                                overflow: "hidden",
                                border: "1.5px solid #DDD6FE",
                                marginTop: 4,
                              }}
                            >
                              <table
                                style={{
                                  width: "100%",
                                  borderCollapse: "collapse",
                                }}
                              >
                                <thead>
                                  <tr style={{ background: "#EDE9FE" }}>
                                    {[
                                      ["#", "center"],
                                      ["Design Name", "left"],
                                      ["Qty", "center"],
                                      ["Unit Price", "right"],
                                      ["Total", "right"],
                                    ].map(([h, align]) => (
                                      <th
                                        key={h}
                                        style={{
                                          padding: "9px 14px",
                                          fontSize: 10,
                                          fontWeight: 700,
                                          color: "#7C3AED",
                                          textTransform: "uppercase",
                                          letterSpacing: "0.1em",
                                          fontFamily: "system-ui, sans-serif",
                                          textAlign: align,
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
                                        borderBottom: "1px solid #F3F4F6",
                                      }}
                                    >
                                      <td
                                        style={{
                                          padding: "9px 14px",
                                          textAlign: "center",
                                          color: "#7C3AED",
                                          fontFamily: "monospace",
                                          fontSize: 12,
                                          fontWeight: 700,
                                        }}
                                      >
                                        {String(i + 1).padStart(2, "0")}
                                      </td>
                                      <td
                                        style={{
                                          padding: "9px 14px",
                                          color: "#111827",
                                          fontWeight: 600,
                                          fontSize: 13,
                                          fontFamily: "system-ui, sans-serif",
                                        }}
                                      >
                                        {item.designName}
                                      </td>
                                      <td
                                        style={{
                                          padding: "9px 14px",
                                          textAlign: "center",
                                          color: "#374151",
                                          fontSize: 13,
                                          fontFamily: "system-ui, sans-serif",
                                        }}
                                      >
                                        {item.quantity}
                                      </td>
                                      <td
                                        style={{
                                          padding: "9px 14px",
                                          textAlign: "right",
                                          color: "#374151",
                                          fontSize: 13,
                                          fontFamily: "system-ui, sans-serif",
                                        }}
                                      >
                                        ₹{item.price.toLocaleString("en-IN")}
                                      </td>
                                      <td
                                        style={{
                                          padding: "9px 14px",
                                          textAlign: "right",
                                          color: "#7C3AED",
                                          fontWeight: 700,
                                          fontSize: 14,
                                          fontFamily: "system-ui, sans-serif",
                                        }}
                                      >
                                        ₹{item.total.toLocaleString("en-IN")}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr style={{ background: "#F5F3FF" }}>
                                    <td
                                      colSpan="4"
                                      style={{
                                        padding: "9px 14px",
                                        textAlign: "right",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: "#6B7280",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.08em",
                                        fontFamily: "system-ui, sans-serif",
                                      }}
                                    >
                                      Subtotal
                                    </td>
                                    <td
                                      style={{
                                        padding: "9px 14px",
                                        textAlign: "right",
                                        color: "#111827",
                                        fontWeight: 600,
                                        fontSize: 14,
                                        fontFamily: "system-ui, sans-serif",
                                      }}
                                    >
                                      ₹{bill.subtotal.toLocaleString("en-IN")}
                                    </td>
                                  </tr>
                                  {bill.taxRate > 0 && (
                                    <tr style={{ background: "#F5F3FF" }}>
                                      <td
                                        colSpan="4"
                                        style={{
                                          padding: "9px 14px",
                                          textAlign: "right",
                                          fontSize: 11,
                                          fontWeight: 700,
                                          color: "#6B7280",
                                          textTransform: "uppercase",
                                          letterSpacing: "0.08em",
                                          fontFamily: "system-ui, sans-serif",
                                        }}
                                      >
                                        GST ({bill.taxRate}%)
                                      </td>
                                      <td
                                        style={{
                                          padding: "9px 14px",
                                          textAlign: "right",
                                          color: "#111827",
                                          fontWeight: 600,
                                          fontSize: 14,
                                          fontFamily: "system-ui, sans-serif",
                                        }}
                                      >
                                        ₹
                                        {bill.taxAmount.toLocaleString("en-IN")}
                                      </td>
                                    </tr>
                                  )}
                                  <tr
                                    style={{
                                      background:
                                        "linear-gradient(135deg, #1e0a4e, #3730A3)",
                                    }}
                                  >
                                    <td
                                      colSpan="4"
                                      style={{
                                        padding: "11px 14px",
                                        textAlign: "right",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: "#C4B5FD",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.1em",
                                        fontFamily: "system-ui, sans-serif",
                                      }}
                                    >
                                      Grand Total
                                    </td>
                                    <td
                                      style={{
                                        padding: "11px 14px",
                                        textAlign: "right",
                                        color: "#FFFFFF",
                                        fontWeight: 800,
                                        fontSize: 16,
                                        fontFamily: "system-ui, sans-serif",
                                      }}
                                    >
                                      ₹{bill.grandTotal.toLocaleString("en-IN")}
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                              {bill.notes && (
                                <div
                                  style={{
                                    padding: "10px 14px",
                                    background: "#FFFBEB",
                                    borderTop: "1px solid #FDE68A",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#92400E",
                                      fontSize: 12,
                                      fontFamily: "system-ui, sans-serif",
                                      fontStyle: "italic",
                                    }}
                                  >
                                    📝 Note: {bill.notes}
                                  </span>
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
        )}

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

      {/* ── Delete Confirm Modal ── */}
      {deleteId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(6px)",
            zIndex: 50,
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
              padding: "36px 32px",
              maxWidth: 380,
              width: "100%",
              boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
              textAlign: "center",
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
              <IconAlert />
            </div>
            <h3
              style={{
                color: "#111827",
                fontSize: 20,
                fontWeight: 800,
                fontFamily: "Georgia, serif",
                marginBottom: 8,
              }}
            >
              Delete Bill?
            </h3>
            <p
              style={{
                color: "#6B7280",
                fontSize: 14,
                fontFamily: "system-ui, sans-serif",
                marginBottom: 24,
              }}
            >
              This action is permanent and cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setDeleteId(null)}
                style={{
                  flex: 1,
                  background: "#F9FAFB",
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
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg, #DC2626, #EF4444)",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "11px 16px",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "system-ui, sans-serif",
                  boxShadow: "0 4px 16px rgba(220,38,38,0.35)",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default BillHistory;
