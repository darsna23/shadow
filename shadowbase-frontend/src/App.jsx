import React, { useEffect, useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import FlowStrip from './components/FlowStrip'
import MetricCards from './components/MetricCards'
import LiveChart from './components/LiveChart'
import ErrorDonut from './components/ErrorDonut'
import SqlEditorPanel from './components/SqlEditorPanel'
import ExceptionsTable from './components/ExceptionsTable'
import { getMetricsSummary, getRecentExceptions, createEnvironment } from './api'

const DEMO_SUMMARY = { totalQueries: 125842, queriesReplayed: 123947, errors: 347, errorRatePercent: 0.28 }
const DEMO_EXCEPTIONS = [
  { time: Date.now() - 5000, query: "UPDATE users SET age = '35c' WHERE id = 12", error: 'invalid input syntax for integer' },
  { time: Date.now() - 8000, query: 'INSERT INTO orders (id, amount) VALUES (5, -19)', error: 'check constraint "chk_qty" violated' },
  { time: Date.now() - 11000, query: 'ALTER TABLE product DROP COLUMN price', error: 'column "price" does not exist' }
]

export default function App() {
  const [active, setActive] = useState('Dashboard')
  const [summary, setSummary] = useState(DEMO_SUMMARY)
  const [exceptions, setExceptions] = useState(DEMO_EXCEPTIONS)
  const [connected, setConnected] = useState(false)
  const [envId, setEnvId] = useState(null)
  const [chartPoints, setChartPoints] = useState(
    Array.from({ length: 20 }, (_, i) => ({
      label: `${10 + Math.floor(i / 4)}:${i % 4 === 0 ? '00' : (i % 4) * 15}`,
      value: 8000 + Math.round(Math.random() * 4000)
    }))
  )

  const poll = useCallback(async () => {
    try {
      const [s, ex] = await Promise.all([getMetricsSummary(), getRecentExceptions()])
      setSummary(s)
      setExceptions(ex)
      setConnected(true)
      setChartPoints(prev => [...prev.slice(1), { label: new Date().toLocaleTimeString().slice(0, 5), value: s.queriesReplayed }])
    } catch {
      setConnected(false) // backend not running — dashboard keeps showing demo data
    }
  }, [])

  useEffect(() => {
    poll()
    const id = setInterval(poll, 4000)
    return () => clearInterval(id)
  }, [poll])

  const handleCreateEnv = async () => {
    try {
      const res = await createEnvironment(
        'CREATE TABLE orders (id SERIAL PRIMARY KEY, customer_name VARCHAR(100), amount NUMERIC(10,2), status VARCHAR(20));'
      )
      setEnvId(res.environmentId)
    } catch (e) {
      alert('Could not reach backend at :8080 — is it running? ' + (e.message || ''))
    }
  }

  const errorBreakdown = { 'Syntax Error': 42, 'Constraint Violation': 30, 'Data-type Mismatch': 18, 'Others': 10 }

  return (
    <div className="app">
      <Sidebar active={active} onSelect={setActive} />
      <main className="main">
        <div className="topbar">
          <div>
            <h1>Migration Sandbox</h1>
            <p>Zero-downtime schema testing against live shadowed traffic</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="run-btn secondary" onClick={handleCreateEnv}>
              {envId ? `Env: ${envId}` : '+ New shadow environment'}
            </button>
            <div className={`live-pill ${connected ? '' : 'offline'}`}>
              <span className="pulse" />
              {connected ? 'Shadow environment live' : 'Backend offline — showing demo data'}
            </div>
          </div>
        </div>

        <FlowStrip />
        <MetricCards summary={summary} />

        <div className="grid-2">
          <LiveChart points={chartPoints} />
          <ErrorDonut breakdown={errorBreakdown} total={summary.errors} />
        </div>

        <SqlEditorPanel envId={envId} />
        <ExceptionsTable exceptions={exceptions} />
      </main>
    </div>
  )
}
