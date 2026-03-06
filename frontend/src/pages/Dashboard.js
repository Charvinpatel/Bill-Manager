import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getStats, getAllBills } from "../api";
import { generateBillPDF } from "../pdfGenerator";

/* ── SVG Icons ──────────────────────────────────────────── */
const IconReceipt = ({ size = 28, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 3 2 3-2 3 2 3-2 3 2V4a2 2 0 0 0-2-2z" />
    <line x1="16" y1="9" x2="8" y2="9" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="10" y1="17" x2="8" y2="17" />
  </svg>
);
const IconCheckCircle = ({ size = 28, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const IconClock = ({ size = 28, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconRupee = ({ size = 28, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="6" y1="4" x2="18" y2="4" />
    <line x1="6" y1="9" x2="18" y2="9" />
    <path d="M6 4h4a4 4 0 0 1 0 8H6" />
    <line x1="10" y1="12" x2="17" y2="20" />
  </svg>
);
const IconDownload = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
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
const IconPlus = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
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
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: s.dot,
          display: "inline-block",
        }}
      ></span>
      {status}
    </span>
  );
};

/* ── Stat Card ───────────────────────────────────────────── */
const StatCard = ({
  label,
  value,
  Icon,
  iconBg,
  iconColor,
  borderColor,
  sub,
}) => (
  <div
    style={{
      background: "#FFFFFF",
      borderRadius: 16,
      padding: "22px 24px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      borderLeft: `4px solid ${borderColor}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      transition: "box-shadow 0.2s",
    }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.12)")
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)")
    }
  >
    <div>
      <p
        style={{
          color: "#6B7280",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "system-ui, sans-serif",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 6,
        }}
      >
        {label}
      </p>
      <p
        style={{
          color: "#111827",
          fontSize: 28,
          fontWeight: 800,
          fontFamily: "system-ui, sans-serif",
          lineHeight: 1,
          marginBottom: sub ? 5 : 0,
        }}
      >
        {value}
      </p>
      {sub && (
        <p
          style={{
            color: "#9CA3AF",
            fontSize: 12,
            fontFamily: "system-ui, sans-serif",
            marginTop: 4,
          }}
        >
          {sub}
        </p>
      )}
    </div>
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 14,
        background: iconBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon size={26} color={iconColor} />
    </div>
  </div>
);

/* ── Dashboard ───────────────────────────────────────────── */
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBills, setRecentBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, billsRes] = await Promise.all([
          getStats(),
          getAllBills(),
        ]);
        setStats(statsRes.data.stats);
        setRecentBills(billsRes.data.bills.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 280,
          background: "#F5F3FF",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 44,
              height: 44,
              border: "3px solid #DDD6FE",
              borderTopColor: "#7C3AED",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
              margin: "0 auto 12px",
            }}
          ></div>
          <p
            style={{
              color: "#6B7280",
              fontSize: 14,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Loading dashboard…
          </p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  const totalRevenue = stats?.totalRevenue || 0;

  return (
    <div style={{ background: "#F5F3FF", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
        {/* ── Hero Banner ── */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #1e0a4e 0%, #3730A3 50%, #1e0a4e 100%)",
            borderRadius: 20,
            padding: "36px 40px",
            marginBottom: 28,
            boxShadow: "0 12px 40px rgba(30,10,78,0.3)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          <div
            style={{
              position: "absolute",
              top: -60,
              right: -60,
              width: 220,
              height: 220,
              background: "rgba(251,191,36,0.08)",
              borderRadius: "50%",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              bottom: -40,
              right: 120,
              width: 140,
              height: 140,
              background: "rgba(139,92,246,0.15)",
              borderRadius: "50%",
            }}
          ></div>

          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 20,
            }}
          >
            <div>
              <p
                style={{
                  color: "#C4B5FD",
                  fontSize: 13,
                  fontFamily: "system-ui, sans-serif",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Jacquard Design Studio
              </p>
              <h2
                style={{
                  color: "#FFFFFF",
                  fontSize: 32,
                  fontWeight: 800,
                  fontFamily: "Georgia, serif",
                  marginBottom: 8,
                  lineHeight: 1.2,
                }}
              >
                Welcome, Sanni Patel
              </h2>
              <p
                style={{
                  color: "#A5B4FC",
                  fontSize: 15,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                Manage your design bills &amp; vendor transactions
              </p>
            </div>
            <Link
              to="/create"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "linear-gradient(135deg, #FBBF24, #F59E0B)",
                color: "#1e0a4e",
                fontWeight: 700,
                fontSize: 15,
                padding: "12px 24px",
                borderRadius: 12,
                textDecoration: "none",
                boxShadow: "0 4px 20px rgba(251,191,36,0.4)",
                fontFamily: "system-ui, sans-serif",
                transition: "transform 0.15s",
              }}
            >
              <IconPlus size={17} />
              Create New Bill
            </Link>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
            marginBottom: 28,
          }}
        >
          <StatCard
            label="Total Bills"
            value={stats?.total || 0}
            Icon={IconReceipt}
            iconBg="#EDE9FE"
            iconColor="#7C3AED"
            borderColor="#7C3AED"
          />
          <StatCard
            label="Paid Bills"
            value={stats?.paid || 0}
            Icon={IconCheckCircle}
            iconBg="#DCFCE7"
            iconColor="#16A34A"
            borderColor="#16A34A"
          />
          <StatCard
            label="Pending Bills"
            value={stats?.pending || 0}
            Icon={IconClock}
            iconBg="#FEF3C7"
            iconColor="#D97706"
            borderColor="#D97706"
          />
          <StatCard
            label="Total Revenue"
            value={`₹${totalRevenue.toLocaleString("en-IN")}`}
            Icon={IconRupee}
            iconBg="#DBEAFE"
            iconColor="#1D4ED8"
            borderColor="#1D4ED8"
            sub="From paid bills"
          />
        </div>

        {/* ── Recent Bills Table ── */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 18,
            boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 24px",
              borderBottom: "1.5px solid #F3F4F6",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#7C3AED",
                }}
              ></div>
              <h3
                style={{
                  color: "#111827",
                  fontSize: 17,
                  fontWeight: 700,
                  fontFamily: "Georgia, serif",
                  margin: 0,
                }}
              >
                Recent Bills
              </h3>
            </div>
            <Link
              to="/history"
              style={{
                color: "#7C3AED",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                fontFamily: "system-ui, sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              View All
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>

          {recentBills.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 24px" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  background: "#F3F4F6",
                  borderRadius: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <IconReceipt size={30} color="#9CA3AF" />
              </div>
              <p
                style={{
                  color: "#374151",
                  fontSize: 16,
                  fontWeight: 600,
                  fontFamily: "system-ui, sans-serif",
                  marginBottom: 6,
                }}
              >
                No bills yet
              </p>
              <p
                style={{
                  color: "#9CA3AF",
                  fontSize: 14,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                Create your first bill to get started
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F9FAFB" }}>
                    {[
                      "Bill No",
                      "Vendor Name",
                      "Date",
                      "Amount",
                      "Status",
                      "Action",
                    ].map((h, i) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 20px",
                          textAlign:
                            i === 3 ? "right" : i >= 4 ? "center" : "left",
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
                  {recentBills.map((bill, idx) => (
                    <tr
                      key={bill._id}
                      style={{
                        borderBottom:
                          idx < recentBills.length - 1
                            ? "1px solid #F3F4F6"
                            : "none",
                        transition: "background 0.13s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#FAF5FF")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={{ padding: "14px 20px" }}>
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
                      <td style={{ padding: "14px 20px" }}>
                        <span
                          style={{
                            color: "#111827",
                            fontWeight: 600,
                            fontSize: 14,
                            fontFamily: "system-ui, sans-serif",
                          }}
                        >
                          {bill.vendorName}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span
                          style={{
                            color: "#6B7280",
                            fontSize: 13,
                            fontFamily: "system-ui, sans-serif",
                          }}
                        >
                          {new Date(bill.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "right" }}>
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
                      <td style={{ padding: "14px 20px", textAlign: "center" }}>
                        <StatusBadge status={bill.status} />
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "center" }}>
                        <button
                          onClick={() => generateBillPDF(bill)}
                          title="Download PDF"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            background: "#EDE9FE",
                            color: "#7C3AED",
                            border: "1.5px solid #DDD6FE",
                            padding: "6px 12px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            fontFamily: "system-ui, sans-serif",
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#7C3AED";
                            e.currentTarget.style.color = "#fff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#EDE9FE";
                            e.currentTarget.style.color = "#7C3AED";
                          }}
                        >
                          <IconDownload size={14} />
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

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

export default Dashboard;
