import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { donHangApi } from '../services/api';
import type { DonHang } from '../services/api';
import { formatCurrency, formatDate, trangThaiDonHangLabel } from '../utils/format';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DonHangCuaToiPage() {
  const [danhSach, setDanhSach] = useState<DonHang[]>([]);
  const [loading, setLoading] = useState(true);
  const [trang, setTrang] = useState(0);
  const [tongTrang, setTongTrang] = useState(0);

  useEffect(() => {
    setLoading(true);
    donHangApi.danhSachCuaToi(trang)
      .then(r => {
        setDanhSach(r.data.duLieu?.danhSach || []);
        setTongTrang(r.data.duLieu?.tongSoTrang || 0);
      })
      .finally(() => setLoading(false));
  }, [trang]);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="bg-[#F9F7F2] min-h-screen text-[#1A1A1A]">
      <div className="max-w-4xl mx-auto px-4 py-12">

        <h1 className="text-4xl font-serif italic mb-8">Đơn hàng của tôi</h1>

        {danhSach.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-[#C1C1C1] mx-auto mb-4" />
            <p className="text-[#8C8C8C] text-lg mb-6">Bạn chưa có đơn hàng nào</p>
            <Link
              to="/san-pham"
              className="inline-block bg-[#1A1A1A] text-[#F9F7F2] px-6 py-3 uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#7B8062] transition"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {danhSach.map(dh => {
              const tt = trangThaiDonHangLabel[dh.trangThaiDonHang] || { label: dh.trangThaiDonHang, color: 'gray' };

              return (
                <Link
                  key={dh.id}
                  to={`/don-hang-cua-toi/${dh.maDonHang}`}
                  className="block bg-white rounded-2xl border border-[#E5E2D9] p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-semibold text-[#1A1A1A]">#{dh.maDonHang}</span>
                      <span className="text-[#8C8C8C] text-sm ml-3">{formatDate(dh.thoiGianTao)}</span>
                    </div>

                    <span className={`text-xs px-3 py-1 rounded-full border ${
                      tt.color === 'green'
                        ? 'text-green-600 border-green-200 bg-green-50'
                        : tt.color === 'red'
                        ? 'text-red-600 border-red-200 bg-red-50'
                        : 'text-[#7B8062] border-[#E5E2D9] bg-[#F9F7F2]'
                    }`}>
                      {tt.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#8C8C8C]">{dh.soMatHang} sản phẩm</p>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#7B8062]">
                        {formatCurrency(dh.tongTienThanhToan)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#C1C1C1]" />
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Pagination */}
            {tongTrang > 1 && (
              <div className="flex justify-center items-center gap-3 mt-8">
                <button
                  disabled={trang === 0}
                  onClick={() => setTrang(t => t - 1)}
                  className="px-4 py-2 border border-[#E5E2D9] text-sm hover:bg-[#E5E2D9] disabled:opacity-50"
                >
                  Trước
                </button>

                <span className="px-4 py-2 text-sm text-[#8C8C8C]">
                  {trang + 1} / {tongTrang}
                </span>

                <button
                  disabled={trang >= tongTrang - 1}
                  onClick={() => setTrang(t => t + 1)}
                  className="px-4 py-2 border border-[#E5E2D9] text-sm hover:bg-[#E5E2D9] disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,700&display=swap');
        .font-serif {
          font-family: 'Playfair Display', serif !important;
        }
      `}</style>
    </div>
  );
}