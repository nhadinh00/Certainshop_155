import { useEffect, useMemo, useRef } from 'react';
import { AlertCircle, BarChart3, RefreshCcw, TrendingUp } from 'lucide-react';
import {
  Chart,
  registerables,
  type ChartOptions,
  type ScriptableContext,
  type TooltipItem,
} from 'chart.js';
import { useRevenueChartData } from '../../hooks/useRevenueChartData';

Chart.register(...registerables);

const getGradient = (
  ctx: CanvasRenderingContext2D,
  chartArea: { top: number; bottom: number },
  colors: [string, string],
) => {
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(1, colors[1]);
  return gradient;
};

const ChartSkeleton = () => {
  return (
    <div className="h-[320px] sm:h-[380px] rounded-2xl border border-[#EBEEF2] bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] p-6 animate-pulse">
      <div className="mb-5 h-5 w-56 rounded bg-[#E2E8F0]" />
      <div className="flex h-[260px] items-end gap-3">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="flex-1 rounded-t-md bg-[#CBD5E1]"
            style={{ height: `${30 + ((index * 37) % 70)}%` }}
          />
        ))}
      </div>
    </div>
  );
};

export default function RevenueChartCard() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart<any, any, any> | null>(null);

  const {
    range,
    setRange,
    data,
    loading,
    error,
    refetch,
    chartType,
    hasMeaningfulData,
    maxRevenue,
    maxRevenueIndex,
    totalRevenue,
    formatMoneyVN,
  } = useRevenueChartData();

  const labels = useMemo(() => data.map((item) => item.shortLabel), [data]);
  const values = useMemo(() => data.map((item) => item.revenue), [data]);

  useEffect(() => {
    if (!canvasRef.current || loading || error || !hasMeaningfulData) {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
      return;
    }

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 850,
        easing: 'easeOutCubic',
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: '#0F172A',
          padding: 12,
          displayColors: false,
          titleColor: '#E2E8F0',
          bodyColor: '#F8FAFC',
          callbacks: {
            title: (tooltipItems: TooltipItem<'line' | 'bar'>[]) => {
              const i = tooltipItems[0]?.dataIndex ?? 0;
              return data[i]?.fullLabel ?? labels[i] ?? '';
            },
            label: (context: TooltipItem<'line' | 'bar'>) => `Doanh thu: ${formatMoneyVN(Number(context.raw) || 0)}`,
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Thời gian',
            color: '#475569',
            font: {
              size: 12,
              weight: 600,
            },
          },
          ticks: {
            color: '#64748B',
            maxRotation: 0,
            autoSkip: true,
          },
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Doanh thu (VNĐ)',
            color: '#475569',
            font: {
              size: 12,
              weight: 600,
            },
          },
          ticks: {
            color: '#64748B',
            callback: (value: string | number) => formatMoneyVN(Number(value) || 0),
          },
          grid: {
            color: '#E2E8F0',
            lineWidth: 1,
          },
        },
      },
    };

    if (chartType === 'bar') {
      const barData = {
        labels,
        datasets: [
          {
            label: 'Doanh thu',
            data: values,
            borderWidth: 0,
            borderRadius: 10,
            maxBarThickness: 44,
            backgroundColor: '#60A5FA',
          },
        ],
      };

      const instance = new Chart(ctx, {
        type: 'bar',
        data: barData,
        options: commonOptions as ChartOptions<'bar'>,
      });
      chartRef.current = instance;

      const area = instance.chartArea;
      if (area) {
        const normalBar = getGradient(ctx, area, ['rgba(59, 130, 246, 0.95)', 'rgba(59, 130, 246, 0.35)']);
        const maxBar = getGradient(ctx, area, ['rgba(249, 115, 22, 0.95)', 'rgba(249, 115, 22, 0.45)']);

        instance.data.datasets[0].backgroundColor = (scriptableCtx: ScriptableContext<'bar'>) => {
          return scriptableCtx.dataIndex === maxRevenueIndex ? maxBar : normalBar;
        };

        instance.update();
      }
    } else {
      const lineData = {
        labels,
        datasets: [
          {
            label: 'Doanh thu',
            data: values,
            borderWidth: 3,
            borderColor: '#0284C7',
            backgroundColor: 'rgba(14, 165, 233, 0.18)',
            fill: true,
            tension: 0.35,
            pointRadius: (scriptableCtx: ScriptableContext<'line'>) => {
              return scriptableCtx.dataIndex === maxRevenueIndex ? 6 : 3;
            },
            pointHoverRadius: (scriptableCtx: ScriptableContext<'line'>) => {
              return scriptableCtx.dataIndex === maxRevenueIndex ? 8 : 5;
            },
            pointBackgroundColor: (scriptableCtx: ScriptableContext<'line'>) => {
              return scriptableCtx.dataIndex === maxRevenueIndex ? '#F97316' : '#0284C7';
            },
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 2,
          },
        ],
      };

      const lineOptions = {
        ...commonOptions,
        elements: {
          line: {
            tension: 0.35,
          },
        },
      };

      const instance = new Chart(ctx, {
        type: 'line',
        data: lineData,
        options: lineOptions as ChartOptions<'line'>,
      });
      chartRef.current = instance;

      const area = instance.chartArea;
      if (area) {
        const lineFill = getGradient(ctx, area, ['rgba(14, 165, 233, 0.35)', 'rgba(14, 165, 233, 0.03)']);
        instance.data.datasets[0].backgroundColor = lineFill;
        instance.update();
      }
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [
    chartType,
    data,
    error,
    formatMoneyVN,
    hasMeaningfulData,
    labels,
    loading,
    maxRevenueIndex,
    values,
  ]);

  return (
    <section className="mb-10 rounded-[2rem] border border-[#E2E8F0] bg-white p-5 sm:p-8 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-[#0F172A]">
            <BarChart3 className="h-5 w-5 text-[#0284C7]" />
            Doanh thu theo thời gian
          </h3>
          <p className="mt-1 text-sm text-[#64748B]">
            Theo dõi xu hướng doanh thu theo ngày hoặc theo tháng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-1">
            <button
              type="button"
              onClick={() => setRange('7d')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                range === '7d' ? 'bg-[#0284C7] text-white shadow-sm' : 'text-[#334155] hover:bg-[#E2E8F0]'
              }`}
            >
              7 ngày gần nhất
            </button>
            <button
              type="button"
              onClick={() => setRange('12m')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                range === '12m' ? 'bg-[#0284C7] text-white shadow-sm' : 'text-[#334155] hover:bg-[#E2E8F0]'
              }`}
            >
              12 tháng gần nhất
            </button>
          </div>

          <button
            type="button"
            onClick={refetch}
            className="inline-flex items-center gap-1 rounded-lg border border-[#CBD5E1] px-3 py-1.5 text-xs font-semibold text-[#334155] transition hover:border-[#0284C7] hover:text-[#0284C7]"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Làm mới
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[#E2E8F0] bg-gradient-to-r from-[#ECFEFF] to-[#F0F9FF] p-4">
          <p className="text-xs uppercase tracking-wide text-[#64748B]">Tổng doanh thu kỳ này</p>
          <p className="mt-1 text-xl font-bold text-[#0F172A]">{formatMoneyVN(totalRevenue)}</p>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-gradient-to-r from-[#FFF7ED] to-[#FFEDD5] p-4">
          <p className="text-xs uppercase tracking-wide text-[#9A3412]">Đỉnh doanh thu</p>
          <p className="mt-1 flex items-center gap-2 text-xl font-bold text-[#9A3412]">
            <TrendingUp className="h-5 w-5" />
            {formatMoneyVN(maxRevenue)}
          </p>
        </div>
      </div>

      {loading ? (
        <ChartSkeleton />
      ) : error ? (
        <div className="flex h-[320px] sm:h-[380px] flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 text-center">
          <AlertCircle className="mb-2 h-6 w-6 text-red-500" />
          <p className="mb-1 text-sm font-semibold text-red-700">Không thể tải dữ liệu biểu đồ</p>
          <p className="mb-4 text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={refetch}
            className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
          >
            Thử lại
          </button>
        </div>
      ) : !hasMeaningfulData ? (
        <div className="flex h-[320px] sm:h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-6 text-center">
          <BarChart3 className="mb-2 h-6 w-6 text-[#94A3B8]" />
          <p className="text-sm font-semibold text-[#334155]">Chưa có dữ liệu doanh thu trong kỳ này</p>
          <p className="mt-1 text-sm text-[#64748B]">
            Hệ thống vẫn hiển thị đầy đủ mốc thời gian, nhưng tất cả đang là 0 đ.
          </p>
        </div>
      ) : (
        <div className="h-[320px] sm:h-[380px] rounded-2xl bg-gradient-to-b from-[#FFFFFF] via-[#F8FAFC] to-[#F1F5F9] p-2 sm:p-3">
          <canvas ref={canvasRef} />
        </div>
      )}
    </section>
  );
}
