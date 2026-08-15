# ShadowBase Frontend

React 18 + Vite dashboard for the ShadowBase migration sandbox. Dark violet/gold
theme, Monaco-powered SQL editor, live charts (Chart.js), polls the Spring Boot
backend every 4 seconds. If the backend isn't running, it falls back to demo
data automatically so the UI is never blank.

## Run it

```bash
npm install
npm run dev
```

Open **http://localhost:5173**. API calls to `/api/*` are proxied to
`http://localhost:8080` (the Spring Boot backend) — see `vite.config.js`.

## Build for production

```bash
npm run build
npm run preview
```

## Structure
```
src/
├── App.jsx                    # polling, layout, state
├── api.js                     # axios client for the backend REST API
├── index.css                  # dark theme design tokens
└── components/
    ├── Sidebar.jsx
    ├── FlowStrip.jsx          # animated Prod DB -> Debezium -> Kafka -> Clone strip
    ├── MetricCards.jsx
    ├── LiveChart.jsx          # replayed-queries line chart
    ├── ErrorDonut.jsx         # errors-by-type donut
    ├── SqlEditorPanel.jsx     # Monaco editor, calls /api/migrations/analyze + /api/environments/{id}/migrate
    └── ExceptionsTable.jsx
```
