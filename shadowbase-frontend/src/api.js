import axios from 'axios'

// In dev, Vite proxies /api -> http://localhost:8080 (see vite.config.js)
const api = axios.create({ baseURL: '/api' })

export const getMetricsSummary = () => api.get('/metrics/summary').then(r => r.data)
export const getRecentExceptions = () => api.get('/metrics/exceptions').then(r => r.data)

export const createEnvironment = (baseSchemaSql) =>
  api.post('/environments', { baseSchemaSql }).then(r => r.data)

export const applyMigration = (envId, sql) =>
  api.post(`/environments/${envId}/migrate`, { sql }).then(r => r.data)

export const destroyEnvironment = (envId) =>
  api.delete(`/environments/${envId}`).then(r => r.data)

export const analyzeMigration = (sql) =>
  api.post('/migrations/analyze', { sql }).then(r => r.data)

export default api
