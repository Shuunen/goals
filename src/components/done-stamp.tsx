// an ink stamp for a list with every goal done : decorative, the screen reader gets a short status instead
export function DoneStamp() {
  return (
    <div className="done-stamp" role="status">
      <svg aria-hidden="true" className="done-stamp-art" viewBox="0 0 260 120">
        {/* the page color first, so nothing shows through, then a light green wash */}
        <rect height="104" rx="14" style={{ fill: 'var(--bg)' }} width="244" x="8" y="8" />
        <rect fill="currentColor" fillOpacity="0.14" height="104" rx="14" width="244" x="8" y="8" />
        <g fill="none" stroke="currentColor">
          <rect height="104" rx="14" strokeWidth="6" width="244" x="8" y="8" />
          <rect height="88" rx="9" strokeWidth="2" width="228" x="16" y="16" />
        </g>
        <path d="M46 60 l12 13 l24 -28" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9" />
        <text fill="currentColor" fontFamily="inherit" fontSize="34" fontWeight="900" letterSpacing="3" textAnchor="middle" x="168" y="72">
          DONE
        </text>
      </svg>
      <span className="visually-hidden">All goals done</span>
    </div>
  )
}
