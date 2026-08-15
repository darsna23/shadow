import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Filler, Tooltip
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

export default function LiveChart({ points }) {
  const data = {
    labels: points.map(p => p.label),
    datasets: [{
      data: points.map(p => p.value),
      borderColor: '#2dd4c8',
      backgroundColor: 'rgba(45,212,200,0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2
    }]
  }

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#1a2338' }, ticks: { maxTicksLimit: 6, color: '#8891ab' } },
      y: { grid: { color: '#1a2338' }, ticks: { color: '#8891ab' } }
    }
  }

  return (
    <div className="card">
      <div className="panel-title">Queries Replayed (Live) <span className="badge">last 60 min</span></div>
      <Line data={data} options={options} />
    </div>
  )
}
