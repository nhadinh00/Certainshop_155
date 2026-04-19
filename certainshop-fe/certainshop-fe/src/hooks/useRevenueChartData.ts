import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../../src/services/api';

export type RevenueRange = '7d' | '12m';

export interface RevenuePoint {
  key: string;
  shortLabel: string;
  fullLabel: string;
  revenue: number;
}

type RawRevenueEntry = Record<string, unknown> | unknown[];

const DATE_KEYS = ['date', 'ngay', 'thoiGian', 'thoiGianTao'];
const REVENUE_KEYS = ['revenue', 'doanhThu', 'tongTien', 'tongDoanhThu', 'thanhTien'];

const formatMoneyVN = (value: number): string => {
  return `${new Intl.NumberFormat('vi-VN').format(Math.max(0, Math.round(value)))} đ`;
};

const toDateParam = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const toMonthKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const parseDate = (raw: unknown): Date | null => {
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw;

  if (typeof raw === 'number' && Number.isFinite(raw)) {
    const parsedFromMs = new Date(raw);
    if (!Number.isNaN(parsedFromMs.getTime())) return parsedFromMs;
  }

  if (typeof raw === 'string' && raw.trim()) {
    const normalized = raw.length === 7 ? `${raw}-01` : raw;
    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
};

const parseRevenue = (raw: unknown): number => {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;

  if (typeof raw === 'string') {
    const normalized = raw.replace(/[^\d.-]/g, '');
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }

  return 0;
};

const pickByKeys = (record: Record<string, unknown>, keys: string[]): unknown => {
  for (const key of keys) {
    if (key in record) return record[key];
  }
  return undefined;
};

const toRawList = (payload: unknown): RawRevenueEntry[] => {
  if (Array.isArray(payload)) return payload as RawRevenueEntry[];

  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.chiTiet)) return obj.chiTiet as RawRevenueEntry[];
    if (Array.isArray(obj.data)) return obj.data as RawRevenueEntry[];
    if (Array.isArray(obj.items)) return obj.items as RawRevenueEntry[];
  }

  return [];
};

const buildSlots = (range: RevenueRange, today = new Date()): RevenuePoint[] => {
  if (range === '7d') {
    const start = new Date(today);
    start.setDate(today.getDate() - 6);

    return Array.from({ length: 7 }, (_, index) => {
      const d = new Date(start);
      d.setDate(start.getDate() + index);
      const key = toDateParam(d);

      return {
        key,
        shortLabel: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        fullLabel: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        revenue: 0,
      };
    });
  }

  const start = new Date(today.getFullYear(), today.getMonth() - 11, 1);

  return Array.from({ length: 12 }, (_, index) => {
    const d = new Date(start);
    d.setMonth(start.getMonth() + index);

    return {
      key: toMonthKey(d),
      shortLabel: d.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }),
      fullLabel: `Tháng ${d.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}`,
      revenue: 0,
    };
  });
};

export function useRevenueChartData() {
  const [range, setRange] = useState<RevenueRange>('7d');
  const [data, setData] = useState<RevenuePoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenue = useCallback(async (activeRange: RevenueRange) => {
    const now = new Date();
    const denNgay = toDateParam(now);
    const tuNgayDate = new Date(now);

    if (activeRange === '7d') {
      tuNgayDate.setDate(now.getDate() - 6);
    } else {
      tuNgayDate.setMonth(now.getMonth() - 11);
      tuNgayDate.setDate(1);
    }

    const tuNgay = toDateParam(tuNgayDate);

    setLoading(true);
    setError(null);

    try {
      const response = await adminApi.doanhThu(tuNgay, denNgay);
      const payload = response.data?.duLieu;
      const rows = toRawList(payload);
      const grouped = new Map<string, number>();

      rows.forEach((entry) => {
        try {
          let rawDate: unknown;
          let rawRevenue: unknown;

          if (Array.isArray(entry)) {
            [rawDate, rawRevenue] = entry;
          } else if (entry && typeof entry === 'object') {
            const obj = entry as Record<string, unknown>;
            rawDate = pickByKeys(obj, DATE_KEYS);
            rawRevenue = pickByKeys(obj, REVENUE_KEYS);
          } else {
            return;
          }

          const parsedDate = parseDate(rawDate);
          if (!parsedDate) return;

          const bucket = activeRange === '7d' ? toDateParam(parsedDate) : toMonthKey(parsedDate);
          const revenue = parseRevenue(rawRevenue);
          grouped.set(bucket, (grouped.get(bucket) ?? 0) + revenue);
        } catch (parseError) {
          console.error('[RevenueChart] parse row failed', {
            parseError,
            entry,
          });
        }
      });

      const slots = buildSlots(activeRange, now);
      const merged = slots.map((slot) => ({
        ...slot,
        revenue: grouped.get(slot.key) ?? 0,
      }));

      setData(merged);
    } catch (apiError) {
      console.error('[RevenueChart] fetch failed', {
        apiError,
        request: { tuNgay, denNgay, activeRange },
      });
      setData(buildSlots(activeRange, now));
      setError('Không thể tải dữ liệu doanh thu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRevenue(range);
  }, [fetchRevenue, range]);

  const refetch = useCallback(() => {
    fetchRevenue(range);
  }, [fetchRevenue, range]);

  const hasMeaningfulData = useMemo(() => data.some((item) => item.revenue > 0), [data]);

  const chartType = useMemo<'bar' | 'line'>(() => {
    return data.length <= 8 ? 'bar' : 'line';
  }, [data.length]);

  const maxRevenue = useMemo(() => {
    return data.reduce((max, item) => Math.max(max, item.revenue), 0);
  }, [data]);

  const maxRevenueIndex = useMemo(() => {
    if (!data.length) return -1;
    return data.findIndex((item) => item.revenue === maxRevenue);
  }, [data, maxRevenue]);

  const totalRevenue = useMemo(() => {
    return data.reduce((sum, item) => sum + item.revenue, 0);
  }, [data]);

  return {
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
  };
}
