import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function ErrorDonut({ breakdown, total }) {
  const data = {
    labels: Object.keys(breakdown),
    datasets: [{
      data: Object.values(breakdown),
      backgroundColor: ['#ff5d7a', '#e8b84b', '#8b6bff', '#2dd4c8'],
      borderColor: '#121a2c',
      borderWidth: 3
    }]
  }

  const options = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 10, padding: 14, font: { size: 11 }, color: '#8891ab' }
      }
    }
  }

  return (
    <div className="card">
      <div className="panel-title">Errors by Type <span className="badge">{total} total</span></div>
      <Doughnut data={data} options={options} />
    </div>
  )
}
