import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const links = [
  {
    to: '/', label: 'Dashboard',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
  },
  {
    to: '/create', label: 'Create Bill',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
  },
  {
    to: '/history', label: 'Bill History',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <nav style={{
      background: 'linear-gradient(135deg,#1e0a4e 0%,#2d1472 50%,#1e0a4e 100%)',
      boxShadow: '0 4px 24px rgba(30,10,78,0.35)',
      position: 'sticky', top: 0, zIndex: 50,
      borderBottom: '2px solid rgba(251,191,36,0.2)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 66 }}>

          {/* Logo */}
          <Link to="/" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{
              width: 42, height: 42, borderRadius: 11, flexShrink: 0,
              background: 'linear-gradient(135deg,#FBBF24,#F59E0B)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(251,191,36,0.45)',
            }}>
              <span style={{ color: '#1e0a4e', fontWeight: 900, fontSize: 16, fontFamily: 'DM Serif Display, Georgia, serif', letterSpacing: 1 }}>SP</span>
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: 'DM Serif Display, Georgia, serif', lineHeight: 1.2 }}>Sanni Patel</div>
              <div style={{ color: '#C4B5FD', fontSize: 10.5, letterSpacing: '0.06em', marginTop: 2, fontFamily: 'DM Sans, sans-serif' }}>Bill Management System</div>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {links.map(({ to, label, icon }) => {
              const active = pathname === to
              return (
                <Link key={to} to={to} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 16px', borderRadius: 10,
                  textDecoration: 'none', fontSize: 14, fontWeight: 600,
                  fontFamily: 'DM Sans, sans-serif', transition: 'all 0.18s',
                  background: active ? 'linear-gradient(135deg,#FBBF24,#F59E0B)' : 'rgba(255,255,255,0.07)',
                  color: active ? '#1e0a4e' : '#E0D7FF',
                  border: active ? '1.5px solid #FBBF24' : '1.5px solid rgba(255,255,255,0.1)',
                  boxShadow: active ? '0 4px 16px rgba(251,191,36,0.35)' : 'none',
                }}>
                  {icon}{label}
                </Link>
              )
            })}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(o => !o)}
            style={{ display: 'none', background: 'none', border: 'none', color: '#E0D7FF', cursor: 'pointer', padding: 6 }}
            className="show-mobile-btn"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {open
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div style={{ paddingBottom: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {links.map(({ to, label, icon }) => {
              const active = pathname === to
              return (
                <Link key={to} to={to} onClick={() => setOpen(false)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 12px', borderRadius: 10, marginTop: 4,
                  textDecoration: 'none', fontSize: 14, fontWeight: 600,
                  fontFamily: 'DM Sans, sans-serif',
                  background: active ? 'linear-gradient(135deg,#FBBF24,#F59E0B)' : 'rgba(255,255,255,0.06)',
                  color: active ? '#1e0a4e' : '#E0D7FF',
                  border: active ? '1.5px solid #FBBF24' : '1.5px solid rgba(255,255,255,0.08)',
                }}>
                  {icon}{label}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
          .show-mobile-btn { display: block !important; }
        }
      `}</style>
    </nav>
  )
}
