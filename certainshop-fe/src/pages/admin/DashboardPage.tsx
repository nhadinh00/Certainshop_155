import { useState, useEffect, useCallback, useMemo } from 'react';
import { ShoppingCart, Users, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { adminApi } from '../../services/api';
import { formatCurrency, trangThaiDonHangLabel } from '../../utils/format';
import LoadingSpinner from '../../components/LoadingSpinner';
import RevenueChartCard from '../../components/admin/RevenueChartCard';

interface ThongKe {
  doanhThuThang: number;
  doanhThuHomNay: number;
  thongKeTrangThai: Record<string, number>;
  tongKhachHang: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<ThongKe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminApi.tongQuan();
      setData(response.data.duLieu as unknown as ThongKe);
    } catch {
      setError('Không thể tải dữ liệu tổng quan. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const thongKeTrangThai = data?.thongKeTrangThai ?? {};

  const tongDonHang = useMemo(
    () => Object.values(thongKeTrangThai).reduce((a, b) => a + b, 0),
    [thongKeTrangThai],
  );

  const choXacNhan = thongKeTrangThai.CHO_XAC_NHAN ?? 0;
  const tyLeChoXacNhan = tongDonHang > 0 ? Math.round((choXacNhan / tongDonHang) * 100) : 0;

  const cards = useMemo(
    () => [
      { label: 'Doanh thu hôm nay', value: formatCurrency(data?.doanhThuHomNay ?? 0), icon: TrendingUp },
      { label: 'Doanh thu tháng', value: formatCurrency(data?.doanhThuThang ?? 0), icon: Calendar },
      { label: 'Tổng đơn hàng', value: tongDonHang, icon: ShoppingCart },
      { label: 'Khách hàng', value: data?.tongKhachHang ?? 0, icon: Users },
    ],
    [data?.doanhThuHomNay, data?.doanhThuThang, data?.tongKhachHang, tongDonHang],
  );

  const statusEntries = useMemo(
    () => Object.entries(thongKeTrangThai).sort(([, a], [, b]) => b - a),
    [thongKeTrangThai],
  );


  if (loading) return <LoadingSpinner fullPage />;

  if (error) {
    return (
      <div className="bg-[#FDFCFB] min-h-screen px-6 py-8">
        <div className="max-w-xl mx-auto border border-[#F0EEE9] rounded-[2rem] p-6 bg-white text-center">
          <AlertCircle className="w-6 h-6 text-[#7B8062] mx-auto mb-3" />
          <p className="text-sm text-[#1A1A1A] mb-4">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.12em] border border-[#7B8062] text-[#1A1A1A] hover:bg-[#7B8062] hover:text-white transition"
          >
            Tải lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFCFB] min-h-screen px-6 py-8">

      {/* Title */}
      <div className="mb-10 flex items-end justify-between gap-4 flex-wrap">
        <h2 className="text-3xl font-light tracking-tighter text-[#1A1A1A]">
          Tổng <span className="italic text-[#7B8062]">quan</span>
        </h2>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] border border-[#F0EEE9] text-[#1A1A1A] hover:border-[#7B8062] transition"
        >
          Làm mới
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map(c => (
          <div
            key={c.label}
            className="bg-white border border-[#F0EEE9] rounded-[2rem] p-6 hover:shadow-xl hover:shadow-black/5 transition-all duration-500"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-[#8C8C8C]">
                {c.label}
              </span>
              <c.icon className="w-5 h-5 text-[#7B8062]" />
            </div>

            <p className="text-2xl font-semibold text-[#1A1A1A]">
              {c.value}
            </p>
          </div>
        ))}
      </div>

      {/* Alert */}
      {choXacNhan > 0 && (
        <div className="border border-[#F0EEE9] rounded-[2rem] p-5 flex items-center gap-4 mb-10 bg-white">
          <AlertCircle className="w-5 h-5 text-[#7B8062]" />
          <p className="text-sm text-[#1A1A1A]">
            Có <span className="font-semibold">{choXacNhan}</span> đơn hàng đang chờ xác nhận ({tyLeChoXacNhan}%).
          </p>
        </div>
      )}

      <RevenueChartCard />

      {/* Order status */}
      {statusEntries.length > 0 && (
        <div className="bg-white border border-[#F0EEE9] rounded-[2rem] p-8">
          <h3 className="text-lg font-light text-[#1A1A1A] mb-6">
            Trạng thái <span className="italic text-[#7B8062]">đơn hàng</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {statusEntries.map(([key, count]) => {
              const info = trangThaiDonHangLabel[key] || { label: key };
              const ratio = tongDonHang > 0 ? Math.round((count / tongDonHang) * 100) : 0;

              return (
                <div
                  key={key}
                  className="text-center p-5 rounded-2xl border border-[#F0EEE9] hover:border-[#7B8062] transition"
                >
                  <p className="text-2xl font-semibold text-[#1A1A1A]">
                    {count}
                  </p>
                  <p className="text-[10px] text-[#8C8C8C] mt-1">{ratio}%</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C8C8C] mt-2 font-black">
                    {info.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}