import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { formatDate } from "../../utils/formatDate";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

/**
 * Groups upload records by day and renders a 14-day activity trend line.
 */
export default function UploadsChart({ uploads = [] }) {
  const { labels, data } = useMemo(() => {
    const days = 14;
    const buckets = new Map();
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      buckets.set(d.toDateString(), 0);
    }

    uploads.forEach((u) => {
      const d = new Date(u.upload_date);
      const key = d.toDateString();
      if (buckets.has(key)) {
        buckets.set(key, buckets.get(key) + (u.imported_count || 0));
      }
    });

    return {
      labels: Array.from(buckets.keys()).map((k) => formatDate(k)),
      data: Array.from(buckets.values()),
    };
  }, [uploads]);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Projects added",
        data,
        borderColor: "#1E63FF",
        backgroundColor: (ctx) => {
          const { chart } = ctx;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return "rgba(30,99,255,0.15)";
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(30,99,255,0.25)");
          gradient.addColorStop(1, "rgba(30,99,255,0)");
          return gradient;
        },
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "#1E63FF",
        borderWidth: 2.5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0A2540",
        padding: 10,
        cornerRadius: 8,
        titleFont: { family: "Inter", weight: "600" },
        bodyFont: { family: "Inter" },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#5B6B82", font: { family: "Inter", size: 11 }, maxRotation: 0 },
      },
      y: {
        grid: { color: "#E8EDF5" },
        ticks: { color: "#5B6B82", font: { family: "Inter", size: 11 }, precision: 0 },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
}
