import React from 'react'

function classify(errorText = '') {
  const t = errorText.toLowerCase()
  if (t.includes('syntax')) return { label: 'Syntax', cls: 'syntax' }
  if (t.includes('constraint') || t.includes('violat')) return { label: 'Constraint', cls: 'constraint' }
  if (t.includes('does not exist') || t.includes('type') || t.includes('column')) return { label: 'Data-type', cls: 'type' }
  return { label: 'Other', cls: 'type' }
}

export default function ExceptionsTable({ exceptions }) {
  return (
    <div className="card">
      <div className="panel-title">Recent SQL Exceptions <span className="badge">{exceptions.length} shown</span></div>
      <table className="table">
        <thead>
          <tr><th>Time</th><th>Query</th><th>Error</th><th>Type</th></tr>
        </thead>
        <tbody>
          {exceptions.length === 0 && (
            <tr><td colSpan={4} className="empty-row">No exceptions yet — replayed traffic is matching the shadow schema.</td></tr>
          )}
          {exceptions.map((ex, i) => {
            const { label, cls } = classify(ex.error)
            return (
              <tr key={i}>
                <td>{new Date(ex.time).toLocaleTimeString()}</td>
                <td>{ex.query}</td>
                <td>{ex.error}</td>
                <td><span className={`sev ${cls}`}>{label}</span></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
