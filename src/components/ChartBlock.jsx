import { useEffect, useRef, useState } from 'react';

function ensureChartJS() {
  if (window.Chart) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[data-chartjs]')) {
      // Already loading — wait for it
      const check = setInterval(() => {
        if (window.Chart) { clearInterval(check); resolve(); }
      }, 50);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js';
    script.setAttribute('data-chartjs', '');
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function ChartBlock({ code }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    ensureChartJS()
      .then(() => {
        if (cancelled || !canvasRef.current) return;
        try {
          const config = JSON.parse(code.trim());
          if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
          }
          chartRef.current = new window.Chart(canvasRef.current, {
            ...config,
            options: { responsive: true, maintainAspectRatio: false, ...config.options },
          });
        } catch (e) {
          if (!cancelled) setError('Invalid chart config: ' + e.message);
        }
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load chart renderer');
      });

    return () => {
      cancelled = true;
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [code]);

  if (error) {
    return (
      <div className="my-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div
      className="my-4 p-3 bg-white rounded-xl border border-slate-200 shadow-sm"
      style={{ position: 'relative', height: '320px', width: '100%' }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
