import React, { useState } from 'react'
import Editor from '@monaco-editor/react'
import { analyzeMigration, applyMigration } from '../api'

const DEFAULT_SQL = `-- merges legacy 'orders_v1' into 'orders'
ALTER TABLE orders DROP COLUMN legacy_ref;
ALTER TABLE orders ADD CONSTRAINT chk_qty CHECK (qty > 0);
UPDATE orders SET status = 'archived' WHERE created_at < '2023-01-01';`

export default function SqlEditorPanel({ envId }) {
  const [sql, setSql] = useState(DEFAULT_SQL)
  const [warnings, setWarnings] = useState([])
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)

  const handleAnalyze = async () => {
    setBusy(true)
    setStatus(null)
    try {
      const res = await analyzeMigration(sql)
      setWarnings(res.warnings || [])
    } catch (e) {
      setWarnings(['Analysis failed: ' + (e.response?.data?.message || e.message)])
    } finally {
      setBusy(false)
    }
  }

  const handleRun = async () => {
    if (!envId) {
      setStatus({ ok: false, text: 'Create a shadow environment first.' })
      return
    }
    setBusy(true)
    setStatus(null)
    try {
      await applyMigration(envId, sql)
      setStatus({ ok: true, text: `Applied to shadow environment ${envId}.` })
    } catch (e) {
      setStatus({ ok: false, text: e.response?.data?.message || e.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="editor">
      <div className="editor-head">
        <div className="editor-tab">migrate_merge_users_orders.sql</div>
        <div>
          <button className="run-btn secondary" onClick={handleAnalyze} disabled={busy}>
            Check for warnings
          </button>
          <button className="run-btn" onClick={handleRun} disabled={busy}>
            ▶ Run against shadow clone
          </button>
        </div>
      </div>

      <Editor
        height="220px"
        defaultLanguage="sql"
        theme="vs-dark"
        value={sql}
        onChange={(v) => setSql(v || '')}
        options={{ fontSize: 13, minimap: { enabled: false }, fontFamily: 'JetBrains Mono' }}
      />

      {(warnings.length > 0 || status) && (
        <div className="warnings">
          {warnings.map((w, i) => <div key={i} className="warning-item">{w}</div>)}
          {status && (
            <div className="warning-item" style={status.ok
              ? { color: '#3ddc97', background: 'rgba(61,220,151,.08)', borderColor: 'rgba(61,220,151,.3)' }
              : {}}>
              {status.text}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
