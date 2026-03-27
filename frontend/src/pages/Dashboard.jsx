import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Skeleton, Card, Row, Col } from 'antd'
import { getStats, getAllBills } from '../api'
import { generateBillPDF } from '../pdfGenerator'
import StatusBadge from '../components/StatusBadge.jsx'

/* ── Icons ── */
const IReceipt   = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 3 2 3-2 3 2 3-2 3 2V4a2 2 0 0 0-2-2z"/><line x1="16" y1="9" x2="8" y2="9"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
const ICheck     = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
const IClock     = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const IRupee     = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="6" y1="4" x2="18" y2="4"/><line x1="6" y1="9" x2="18" y2="9"/><path d="M6 4h4a4 4 0 0 1 0 8H6"/><line x1="10" y1="12" x2="17" y2="20"/></svg>
const IDownload  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
const IPlus      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IArrow     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>

/* ── Stat Card ── */
const StatCard = ({ label, value, sub, icon, iconBg, iconColor, accent }) => (
  <div className="sp-card" style={{ padding: '20px 22px', borderLeft: `4px solid ${accent}`, transition: 'box-shadow 0.2s' }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.11)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={{ color: '#6B7280', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 8 }}>{label}</p>
        <p style={{ color: '#111827', fontSize: 26, fontWeight: 800, lineHeight: 1, marginBottom: sub ? 4 : 0 }}>{value}</p>
        {sub && <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>{sub}</p>}
      </div>
      <div style={{ width: 52, height: 52, borderRadius: 13, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: iconColor }}>
        {icon}
      </div>
    </div>
  </div>
)

/* ── Loading Skeleton ── */
const DashboardSkeleton = () => (
  <div style={{ background: '#F5F3FF', minHeight: '100vh', padding: '28px 20px' }}>
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      {/* Hero Skeleton */}
      <Skeleton.Button active style={{ width: '100%', height: 160, borderRadius: 20, marginBottom: 24 }} />
      
      {/* Stats Skeleton */}
      <Row gutter={[18, 18]} style={{ marginBottom: 24 }}>
        {[1, 2, 3, 4].map(i => (
          <Col key={i} xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: 12 }}>
              <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Table Skeleton */}
      <Card style={{ borderRadius: 12 }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    </div>
  </div>
)

/* ── Dashboard ── */
export default function Dashboard() {
  const [stats, setStats]       = useState(null)
  const [recent, setRecent]     = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const [sRes, bRes] = await Promise.all([getStats(), getAllBills()])
        setStats(sRes.data.stats)
        setRecent(bRes.data.bills.slice(0, 6))
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <DashboardSkeleton />

  const revenue = stats?.totalRevenue || 0

  return (
    <div style={{ background: '#F5F3FF', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 20px' }}>

        {/* ── Hero ── */}
        <div style={{
          background: 'linear-gradient(135deg,#1e0a4e 0%,#3730A3 55%,#1e0a4e 100%)',
          borderRadius: 20, padding: '32px 36px', marginBottom: 24,
          boxShadow: '0 12px 40px rgba(30,10,78,0.28)', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(251,191,36,0.07)' }} />
          <div style={{ position: 'absolute', bottom: -30, right: 100, width: 130, height: 130, borderRadius: '50%', background: 'rgba(139,92,246,0.13)' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 18 }}>
            <div>
              <p style={{ color: '#C4B5FD', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>Jacquard Design Studio</p>
              <h2 style={{ color: '#fff', fontSize: 30, fontWeight: 800, fontFamily: 'DM Serif Display, Georgia, serif', marginBottom: 8, lineHeight: 1.2 }}>Welcome, Sanni Patel</h2>
              <p style={{ color: '#A5B4FC', fontSize: 14 }}>Manage your design bills &amp; vendor transactions</p>
            </div>
            <Link to="/create" className="btn-gold" style={{ fontSize: 14, padding: '12px 22px', flexShrink: 0 }}>
              <IPlus /> Create New Bill
            </Link>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 18, marginBottom: 24 }}>
          <StatCard label="Total Bills"    value={stats?.total   || 0} accent="#7C3AED" iconBg="#EDE9FE" iconColor="#7C3AED" icon={<IReceipt />} />
          <StatCard label="Paid Bills"     value={stats?.paid    || 0} accent="#16A34A" iconBg="#DCFCE7" iconColor="#16A34A" icon={<ICheck />} />
          <StatCard label="Pending Bills"  value={stats?.pending || 0} accent="#D97706" iconBg="#FEF3C7" iconColor="#D97706" icon={<IClock />} />
          <StatCard label="Total Revenue"  value={`₹${revenue.toLocaleString('en-IN')}`} sub="From paid bills" accent="#1D4ED8" iconBg="#DBEAFE" iconColor="#1D4ED8" icon={<IRupee />} />
        </div>

        {/* ── Recent Bills ── */}
        <div className="sp-card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderBottom: '1.5px solid #F3F4F6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7C3AED' }} />
              <h3 style={{ color: '#111827', fontSize: 17, fontWeight: 700, fontFamily: 'DM Serif Display, Georgia, serif', margin: 0 }}>Recent Bills</h3>
            </div>
            <Link to="/history" style={{ color: '#7C3AED', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              View All <IArrow />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 24px' }}>
              <div style={{ width: 60, height: 60, background: '#F3F4F6', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <IReceipt />
              </div>
              <p style={{ color: '#374151', fontWeight: 600, marginBottom: 4 }}>No bills yet</p>
              <p style={{ color: '#9CA3AF', fontSize: 13 }}>Create your first bill to get started</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div style={{ overflowX: 'auto' }} className="hide-mobile">
                <table className="sp-table">
                  <thead>
                    <tr>
                      <th>Bill No</th>
                      <th>Vendor Name</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map(bill => (
                      <tr key={bill._id}>
                        <td>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#7C3AED', fontWeight: 700, fontSize: 13, background: '#EDE9FE', padding: '2px 8px', borderRadius: 6 }}>
                            {bill.billNumber}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: '#111827' }}>{bill.vendorName}</td>
                        <td style={{ color: '#6B7280' }}>{new Date(bill.createdAt).toLocaleDateString('en-IN')}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 15, color: '#111827' }}>
                          ₹{bill.grandTotal.toLocaleString('en-IN')}
                        </td>
                        <td style={{ textAlign: 'center' }}><StatusBadge status={bill.status} /></td>
                        <td style={{ textAlign: 'center' }}>
                          <button onClick={() => generateBillPDF(bill)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#EDE9FE', color: '#7C3AED', border: '1.5px solid #DDD6FE', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif' }}
                            onMouseEnter={e => { e.currentTarget.style.background='#7C3AED'; e.currentTarget.style.color='#fff' }}
                            onMouseLeave={e => { e.currentTarget.style.background='#EDE9FE'; e.currentTarget.style.color='#7C3AED' }}>
                            <IDownload /> PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div style={{ display: 'none' }} className="show-mobile-cards">
                {recent.map(bill => (
                  <div key={bill._id} style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#7C3AED', fontWeight: 700, fontSize: 12, background: '#EDE9FE', padding: '2px 7px', borderRadius: 5 }}>{bill.billNumber}</span>
                      <StatusBadge status={bill.status} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>{bill.vendorName}</p>
                        <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>{new Date(bill.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>₹{bill.grandTotal.toLocaleString('en-IN')}</p>
                        <button onClick={() => generateBillPDF(bill)} style={{ marginTop: 4, color: '#7C3AED', fontSize: 12, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', textDecoration: 'underline' }}>
                          Download PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 28, color: '#C4B5FD', fontSize: 11, letterSpacing: '0.15em', paddingBottom: 8 }}>
          SANNI PATEL — JACQUARD DESIGN STUDIO
        </p>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
          .show-mobile-cards { display: block !important; }
        }
      `}</style>
    </div>
  )
}
