import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../../src/services/api';

export type RevenueMode = 'day' | 'month' | 'year';
export type RevenueRange = '7d' | '30d' | '12m';

export interface RevenuePoint {
  key: string;
  shortLabel: string;
  fullLabel: string;
  revenue: number;
}

type RawRevenueEntry = Record<string, unknown> | unknown[];
export type ParsedRevenueEntry = { date: Date; revenue: number };

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

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const addMonths = (date: Date, months: number): Date => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const formatDayLabel = (date: Date): string => {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}-${m}`;
};

const formatMonthLabel = (date: Date): string => {
  return `Tháng ${date.getMonth() + 1}`;
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

const resolveQuickRange = (range: RevenueRange, today = new Date()) => {
  if (range === '7d') {
    const denNgayDate = new Date(today);
    const tuNgayDate = addDays(denNgayDate, -6);
    return {
      mode: 'day' as RevenueMode,
      tuNgay: toDateParam(tuNgayDate),
      denNgay: toDateParam(denNgayDate),
    };
  }

  if (range === '30d') {
    const denNgayDate = new Date(today);
    const tuNgayDate = addDays(denNgayDate, -29);
    return {
      mode: 'month' as RevenueMode,
      tuNgay: toDateParam(tuNgayDate),
      denNgay: toDateParam(denNgayDate),
    };
  }

  const denNgayDate = new Date(today);
  const tuNgayDate = new Date(denNgayDate.getFullYear(), denNgayDate.getMonth() - 11, 1);
  return {
    mode: 'year' as RevenueMode,
    tuNgay: toDateParam(tuNgayDate),
    denNgay: toDateParam(denNgayDate),
  };
};

const buildDaySlots = (tuNgay: string, denNgay: string): RevenuePoint[] => {
  const start = parseDate(tuNgay);
  const end = parseDate(denNgay);
  if (!start || !end || start > end) return [];

  const slots: RevenuePoint[] = [];
  let current = new Date(start);

  while (current <= end) {
    const key = toDateParam(current);
    slots.push({
      key,
      shortLabel: formatDayLabel(current),
      fullLabel: current.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      revenue: 0,
    });
    current = addDays(current, 1);
  }

  return slots;
};

const buildMonthSlots = (tuNgay: string, denNgay: string): RevenuePoint[] => {
  const start = parseDate(tuNgay);
  const end = parseDate(denNgay);
  if (!start || !end || start > end) return [];

  const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
  const monthEnd = new Date(end.getFullYear(), end.getMonth(), 1);

  const slots: RevenuePoint[] = [];
  let current = new Date(monthStart);

  while (current <= monthEnd) {
    slots.push({
      key: toMonthKey(current),
      shortLabel: formatMonthLabel(current),
      fullLabel: `${formatMonthLabel(current)} ${current.getFullYear()}`,
      revenue: 0,
    });
    current = addMonths(current, 1);
  }

  return slots;
};

const parseRows = (rows: RawRevenueEntry[]): ParsedRevenueEntry[] => {
  const parsedRows: ParsedRevenueEntry[] = [];

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

      parsedRows.push({
        date: parsedDate,
        revenue: parseRevenue(rawRevenue),
      });
    } catch (parseError) {
      console.error('[RevenueChart] parse row failed', {
        parseError,
        entry,
      });
    }
  });

  return parsedRows;
};

export const groupByMonth = (rows: ParsedRevenueEntry[]): Map<string, number> => {
  const grouped = new Map<string, number>();
  rows.forEach((row) => {
    const key = toMonthKey(row.date);
    grouped.set(key, (grouped.get(key) ?? 0) + row.revenue);
  });
  return grouped;
};

const groupByDay = (rows: ParsedRevenueEntry[]): Map<string, number> => {
  const grouped = new Map<string, number>();
  rows.forEach((row) => {
    const key = toDateParam(row.date);
    grouped.set(key, (grouped.get(key) ?? 0) + row.revenue);
  });
  return grouped;
};

const mergeSlots = (slots: RevenuePoint[], grouped: Map<string, number>): RevenuePoint[] => {
  return slots.map((slot) => ({
    ...slot,
    revenue: grouped.get(slot.key) ?? 0,
  }));
};

const buildEmptySlots = (mode: RevenueMode, tuNgay: string, denNgay: string): RevenuePoint[] => {
  if (mode === 'year') {
    return buildMonthSlots(tuNgay, denNgay);
  }

  return buildDaySlots(tuNgay, denNgay);
};

export function useRevenueChartData() {
  const initial = useMemo(() => resolveQuickRange('7d'), []);

  const [range, setRange] = useState<RevenueRange | null>('7d');
  const [mode, setMode] = useState<RevenueMode>(initial.mode);
  const [tuNgay, setTuNgay] = useState<string>(initial.tuNgay);
  const [denNgay, setDenNgay] = useState<string>(initial.denNgay);
  const [appliedTuNgay, setAppliedTuNgay] = useState<string>(initial.tuNgay);
  const [appliedDenNgay, setAppliedDenNgay] = useState<string>(initial.denNgay);
  const [appliedMode, setAppliedMode] = useState<RevenueMode>(initial.mode);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [data, setData] = useState<RevenuePoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const validateDateRange = useCallback((startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 'Vui lòng chọn đầy đủ từ ngày và đến ngày.';
    if (endDate < startDate) return 'Đến ngày không được nhỏ hơn từ ngày.';
    return null;
  }, []);

  const applyRange = useCallback(
    (nextMode: RevenueMode, nextTuNgay: string, nextDenNgay: string) => {
      const invalid = validateDateRange(nextTuNgay, nextDenNgay);
      if (invalid) {
        setValidationError(invalid);
        return false;
      }

      setValidationError(null);
      setAppliedMode(nextMode);
      setAppliedTuNgay(nextTuNgay);
      setAppliedDenNgay(nextDenNgay);
      return true;
    },
    [validateDateRange],
  );

  const fetchRevenue = useCallback(async (activeMode: RevenueMode, startDate: string, endDate: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminApi.doanhThu(startDate, endDate);
      const payload = response.data?.duLieu;
      const rows = toRawList(payload);
      const parsedRows = parseRows(rows);

      const slots = buildEmptySlots(activeMode, startDate, endDate);
      const grouped = activeMode === 'year' ? groupByMonth(parsedRows) : groupByDay(parsedRows);
      setData(mergeSlots(slots, grouped));
    } catch (apiError) {
      console.error('[RevenueChart] fetch failed', {
        apiError,
        request: { tuNgay: startDate, denNgay: endDate, mode: activeMode },
      });
      setData(buildEmptySlots(activeMode, startDate, endDate));
      setError('Không thể tải dữ liệu doanh thu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRevenue(appliedMode, appliedTuNgay, appliedDenNgay);
  }, [appliedDenNgay, appliedMode, appliedTuNgay, fetchRevenue]);

  const applyQuickRange = useCallback((nextRange: RevenueRange) => {
    const resolved = resolveQuickRange(nextRange);
    setRange(nextRange);
    setMode(resolved.mode);
    setTuNgay(resolved.tuNgay);
    setDenNgay(resolved.denNgay);
    applyRange(resolved.mode, resolved.tuNgay, resolved.denNgay);
  }, [applyRange]);

  const applyCustomFilter = useCallback(() => {
    const applied = applyRange(mode, tuNgay, denNgay);
    if (applied) {
      setRange(null);
    }
    return applied;
  }, [applyRange, denNgay, mode, tuNgay]);

  const resetFilter = useCallback(() => {
    applyQuickRange('7d');
  }, [applyQuickRange]);

  const refetch = useCallback(() => {
    fetchRevenue(appliedMode, appliedTuNgay, appliedDenNgay);
  }, [appliedDenNgay, appliedMode, appliedTuNgay, fetchRevenue]);

  const hasMeaningfulData = useMemo(() => data.some((item) => item.revenue > 0), [data]);

  const chartType = useMemo<'bar' | 'line'>(() => {
    if (appliedMode === 'day') return 'line';
    return 'bar';
  }, [appliedMode]);

  const maxRevenue = useMemo(() => {
    return data.reduce((max, item) => Math.max(max, item.revenue), 0);
  }, [data]);

  const maxRevenueIndex = useMemo(() => {
    if (!data.length || maxRevenue <= 0) return -1;
    return data.findIndex((item) => item.revenue === maxRevenue);
  }, [data, maxRevenue]);

  const totalRevenue = useMemo(() => {
    return data.reduce((sum, item) => sum + item.revenue, 0);
  }, [data]);

  return {
    mode,
    range,
    tuNgay,
    denNgay,
    validationError,
    setTuNgay,
    setDenNgay,
    applyQuickRange,
    applyCustomFilter,
    resetFilter,
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
