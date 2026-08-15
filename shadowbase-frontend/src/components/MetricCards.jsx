import React from 'react'

export default function MetricCards({ summary }) {
  const { totalQueries = 0, queriesReplayed = 0, errors = 0, errorRatePercent = 0 } = summary || {}
  const coverage = totalQueries ? ((queriesReplayed / totalQueries) * 100).toFixed(1) : '0.0'

  return (
    <div className="grid-4">
      <div className="card">
        <div className="metric-label">Total Queries</div>
        <div className="metric-value">{totalQueries.toLocaleString()}</div>
        <div className="metric-sub up">Live from Kafka stream</div>
      </div>
      <div className="card">
        <div className="metric-label">Queries Replayed</div>
        <div className="metric-value accent-teal">{queriesReplayed.toLocaleString()}</div>
        <div className="metric-sub">{coverage}% replay coverage</div>
      </div>
      <div className="card">
        <div className="metric-label">Errors Detected</div>
        <div className="metric-value accent-red">{errors.toLocaleString()}</div>
        <div className="metric-sub warn">Since environment created</div>
      </div>
      <div className="card">
        <div className="metric-label">Error Rate</div>
        <div className="metric-value accent-gold">{errorRatePercent}%</div>
        <div className="metric-sub">Threshold: 1.0%</div>
      </div>
    </div>
  )
}
