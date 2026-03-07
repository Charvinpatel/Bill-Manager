import React from 'react'

const DOTS = { paid: '#16A34A', unpaid: '#DC2626', pending: '#D97706' }

export default function StatusBadge({ status = 'pending' }) {
  return (
    <span className={`badge badge-${status}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: DOTS[status] || DOTS.pending, display: 'inline-block' }} />
      {status}
    </span>
  )
}
