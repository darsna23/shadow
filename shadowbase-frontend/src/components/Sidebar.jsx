import React from 'react'

const NAV = ['Dashboard', 'Environments', 'SQL Replay', 'Errors', 'Metrics']
const BUILD_NAV = ['Migration Scripts', 'Settings']

export default function Sidebar({ active, onSelect }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">SB</div>
        <div className="brand-name">Shadow<span>Base</span></div>
      </div>

      {NAV.map(item => (
        <button
          key={item}
          className={`nav-item ${active === item ? 'active' : ''}`}
          onClick={() => onSelect(item)}
        >
          <span className="dot" />{item}
        </button>
      ))}

      <div className="nav-section-label">Build</div>
      {BUILD_NAV.map(item => (
        <button
          key={item}
          className={`nav-item ${active === item ? 'active' : ''}`}
          onClick={() => onSelect(item)}
        >
          <span className="dot" />{item}
        </button>
      ))}

      <div className="sidebar-foot">Infotact Solutions<br />Advanced Full-Stack Java Project</div>
    </aside>
  )
}
