import React from 'react'

export default function FlowStrip() {
  return (
    <div className="flow-strip">
      <div className="flow-node"><div className="flow-icon">🗄️</div><span>Production DB</span></div>
      <div className="flow-line" />
      <div className="flow-node"><div className="flow-icon">🔁</div><span>Debezium CDC</span></div>
      <div className="flow-line" />
      <div className="flow-node"><div className="flow-icon">📡</div><span>Kafka Stream</span></div>
      <div className="flow-line" />
      <div className="flow-node sandbox">
        <div className="flow-node"><div className="flow-icon">🐳</div><span>DB Clone</span></div>
        <div className="flow-node"><div className="flow-icon">▶️</div><span>Replayer</span></div>
      </div>
    </div>
  )
}
