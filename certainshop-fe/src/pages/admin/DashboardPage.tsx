import { useState, useEffect } from 'react';
import { ShoppingCart, Users, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { adminApi } from '../../services/api';
import { formatCurrency, trangThaiDonHangLabel } from '../../utils/format';
import LoadingSpinner from '../../components/LoadingSpinner';

interface ThongKe {
  doanhThuThang: number;
  doanhThuHomNay: number;
  thongKeTrangThai: Record<string, number>;
  tongKhachHang: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<ThongKe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.tongQuan()
      .then(r => setData(r.data.duLieu as unknown as ThongKe))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  const choXacNhan = data?.thongKeTrangThai?.CHO_XAC_NHAN ?? 0;
  const tongDonHang = Object.values(data?.thongKeTrangThai || {}).reduce((a, b) => a + b, 0);

  const cards = [
    { label: 'Doanh thu hôm nay', value: formatCurrency(data?.doanhThuHomNay ?? 0), icon: TrendingUp },
    { label: 'Doanh thu tháng', value: formatCurrency(data?.doanhThuThang ?? 0), icon: Calendar },
    { label: 'Tổng đơn hàng', value: tongDonHang, icon: ShoppingCart },
    { label: 'Khách hàng', value: data?.tongKhachHang ?? 0, icon: Users },
  ];

  return (
    <div className="bg-[#FDFCFB] min-h-screen px-6 py-8 font-sans">

      {/* Title */}
      <div className="mb-10">
        <h2 className="text-3xl font-light tracking-tighter text-[#1A1A1A]">
          Tổng <span className="font-serif italic text-[#7B8062]">quan</span>
        </h2>
        <div className="w-10 h-[1px] bg-[#7B8062] mt-3"></div>
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
            Có <span className="font-semibold">{choXacNhan}</span> đơn hàng đang chờ xác nhận.
          </p>
        </div>
      )}

      {/* Order status */}
      {data?.thongKeTrangThai && Object.keys(data.thongKeTrangThai).length > 0 && (
        <div className="bg-white border border-[#F0EEE9] rounded-[2rem] p-8">
          <h3 className="text-lg font-light text-[#1A1A1A] mb-6">
            Trạng thái <span className="font-serif italic text-[#7B8062]">đơn hàng</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {Object.entries(data.thongKeTrangThai).map(([key, count]) => {
              const info = trangThaiDonHangLabel[key] || { label: key };

              return (
                <div
                  key={key}
                  className="text-center p-5 rounded-2xl border border-[#F0EEE9] hover:border-[#7B8062] transition"
                >
                  <p className="text-2xl font-semibold text-[#1A1A1A]">
                    {count}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C8C8C] mt-2 font-black">
                    {info.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&display=swap');
        .font-serif { font-family: 'Playfair Display', serif !important; }
        .font-sans { font-family: 'Inter', sans-serif !important; }
      `}</style>
    </div>
  );
}