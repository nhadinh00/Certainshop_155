import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft, Minus, Plus, ChevronRight, Info } from 'lucide-react';
import { gioHangApi } from '../services/api';
import type { GioHang } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { formatCurrency, getImageUrl, handleImgError, PLACEHOLDER_IMG } from '../utils/format';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function GioHangPage() {
  const [gioHang, setGioHang] = useState<GioHang | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const { isLoggedIn } = useAuthStore();
  const { setCount } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/dang-nhap');
      return;
    }
    fetchCart();
  }, [isLoggedIn, navigate]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await gioHangApi.lay();
      setGioHang(res.data.duLieu);
      setCount(res.data.duLieu?.danhSachChiTiet?.length || 0);
    } catch {
      toast.error('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleCapNhat = async (chiTietId: number, soLuong: number) => {
    if (soLuong < 1) return;
    setUpdating(chiTietId);
    try {
      const res = await gioHangApi.capNhat(chiTietId, soLuong);
      setGioHang(res.data.duLieu);
      setCount(res.data.duLieu?.danhSachChiTiet?.length || 0);
    } catch {
      toast.error('Có lỗi khi cập nhật');
    } finally {
      setUpdating(null);
    }
  };

  const handleXoa = async (chiTietId: number) => {
    setUpdating(chiTietId);
    try {
      await gioHangApi.xoa(chiTietId);
      await fetchCart();
      toast.success('Đã xóa khỏi giỏ hàng');
    } catch {
      toast.error('Có lỗi khi xóa');
    } finally {
      setUpdating(null);
    }
  };

  const getDonGia = (ct: any) => ct.donGia || ct.bienThe?.gia || 0;
  const getThanhTien = (ct: any) => getDonGia(ct) * ct.soLuong;
  const tongTien = gioHang?.danhSachChiTiet?.reduce((sum, ct) => sum + getThanhTien(ct), 0) || 0;

  if (loading) return <LoadingSpinner fullPage />;

  if (!gioHang?.danhSachChiTiet?.length) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex flex-col items-center justify-center px-6">
        <div className="relative mb-10">
          <div className="w-40 h-40 bg-white rounded-[3rem] rotate-12 absolute inset-0 shadow-sm" />
          <div className="w-40 h-40 bg-[#C5B49C]/10 rounded-[3rem] -rotate-6 absolute inset-0" />
          <div className="w-40 h-40 bg-white rounded-[3rem] flex items-center justify-center relative shadow-sm border border-[#E8E2D9]">
            <ShoppingBag className="w-16 h-16 text-[#C5B49C] stroke-[1px]" />
          </div>
        </div>
        <h2 className="text-3xl font-serif italic text-[#4A4540] mb-4 tracking-normal">Giỏ hàng đang đợi bạn</h2>
        <p className="text-[#A8A29A] mb-10 text-center max-w-xs text-sm leading-relaxed uppercase tracking-widest font-bold">
          Hãy lấp đầy giỏ hàng bằng những sản phẩm tuyệt vời nhất
        </p>
        <Link to="/san-pham" className="group flex items-center gap-4 px-10 py-5 bg-[#C5B49C] text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-[#4A4540] transition-all duration-500 shadow-xl">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" /> 
          Khám phá ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F9F7F2] min-h-screen py-12 lg:py-20 font-sans text-[#2D2A26]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="border-l-2 border-[#C5B49C] pl-8">
            <h1 className="text-5xl font-light tracking-tighter text-[#4A4540]">
              Giỏ hàng <span className="font-serif italic text-[#C5B49C] text-4xl tracking-normal">Bag</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.5em] text-[#A8A29A] mt-3 font-bold">
              Kiểm tra lại các món đồ của bạn
            </p>
          </div>
          <div className="bg-white/50 backdrop-blur-md px-8 py-4 rounded-3xl border border-white shadow-sm">
             <span className="text-[10px] uppercase tracking-widest text-[#A8A29A] font-bold">Số lượng: </span>
             <span className="text-lg font-serif italic text-[#C5B49C] tracking-normal"> {gioHang.danhSachChiTiet.length} món</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 space-y-6">
            {gioHang.danhSachChiTiet.map(ct => {
              const bt = ct.bienThe;
              const thanhTien = getThanhTien(ct);
              const isUpdating = updating === ct.id;

              return (
                <div key={ct.id} className="group bg-white rounded-[2.5rem] p-6 border border-[#E8E2D9] shadow-[0_15px_40px_rgba(197,180,156,0.05)] hover:shadow-md transition-all duration-500 flex flex-col sm:flex-row gap-8 relative overflow-hidden">
                  <div className="relative shrink-0 p-1 bg-[#F9F7F2] rounded-[2rem]">
                    <Link to={bt?.duongDanSanPham ? `/san-pham/${bt.duongDanSanPham}` : '#'}>
                      <img
                        src={bt?.anhChinh ? getImageUrl(bt.anhChinh) : PLACEHOLDER_IMG}
                        alt={bt?.tenSanPham}
                        className="w-full sm:w-36 h-44 sm:h-36 object-cover rounded-[1.8rem] group-hover:scale-105 transition-transform duration-700"
                        onError={handleImgError}
                      />
                    </Link>
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div>
                      <div className="flex justify-between items-start gap-6">
                        <Link 
                          to={bt?.duongDanSanPham ? `/san-pham/${bt.duongDanSanPham}` : '#'}
                          className="text-xl font-serif italic text-[#4A4540] hover:text-[#C5B49C] transition-colors line-clamp-2 tracking-normal"
                        >
                          {bt?.tenSanPham || 'Sản phẩm'}
                        </Link>
                        <button 
                          onClick={() => handleXoa(ct.id)} 
                          disabled={isUpdating}
                          className="p-3 text-[#A8A29A] hover:text-rose-400 bg-[#F9F7F2] rounded-2xl transition-all active:scale-90"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 mt-4">
                        {bt?.tenMauSac && (
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase tracking-widest text-[#A8A29A] font-bold">Màu:</span>
                            <span className="text-[11px] font-bold text-[#4A4540]">{bt.tenMauSac}</span>
                          </div>
                        )}
                        {bt?.kichThuoc && (
                          <div className="flex items-center gap-2 border-l border-[#E8E2D9] pl-4">
                            <span className="text-[9px] uppercase tracking-widest text-[#A8A29A] font-bold">Size:</span>
                            <span className="text-[11px] font-bold text-[#4A4540]">{bt.kichThuoc}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-6 mt-8">
                      <div className="flex items-center bg-[#F9F7F2] p-1.5 rounded-full border border-[#E8E2D9]">
                        <button
                          onClick={() => handleCapNhat(ct.id, ct.soLuong - 1)}
                          disabled={ct.soLuong <= 1 || isUpdating}
                          className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-[#4A4540] hover:text-[#C5B49C] disabled:opacity-30 transition-all active:scale-90"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="w-12 text-center">
                          {isUpdating ? (
                            <div className="w-3 h-3 border-2 border-[#C5B49C] border-t-transparent rounded-full animate-spin mx-auto" />
                          ) : (
                            <span className="text-xs font-black text-[#4A4540]">{ct.soLuong}</span>
                          )}
                        </div>

                        <button
                          onClick={() => handleCapNhat(ct.id, ct.soLuong + 1)}
                          disabled={isUpdating}
                          className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-[#4A4540] hover:text-[#C5B49C] disabled:opacity-30 transition-all active:scale-90"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-widest text-[#A8A29A] font-bold mb-1">Giá trị món đồ</p>
                        <p className="text-xl font-light tracking-tighter text-[#C5B49C]">{formatCurrency(thanhTien)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <Link to="/san-pham" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#C5B49C] hover:text-[#4A4540] transition-colors mt-4 ml-4 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
              Tiếp tục tìm kiếm sản phẩm
            </Link>
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-10">
            <div className="bg-[#4A4540] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
              
              <div className="relative z-10">
                {/* FIX TẠI ĐÂY: Thêm tracking-normal và bọc chữ */}
                <h3 className="text-2xl font-serif italic mb-10 border-b border-white/10 pb-6 tracking-normal">
                  Thông tin <span className="inline-block">túi tiền</span>
                </h3>

                <div className="space-y-6 mb-10 pb-10 border-b border-white/10">
                  <div className="flex justify-between items-center text-white/50 text-[11px] font-bold uppercase tracking-widest">
                    <span>Tạm tính</span>
                    <span className="text-white">{formatCurrency(tongTien)}</span>
                  </div>
                  <div className="flex justify-between items-center text-white/50 text-[11px] font-bold uppercase tracking-widest">
                    <span>Vận chuyển</span>
                    <span className="text-[#C5B49C]">Miễn phí</span>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-2xl flex items-start gap-3">
                    <Info className="w-4 h-4 text-[#C5B49C] shrink-0" />
                    <p className="text-[9px] text-white/40 leading-relaxed font-medium">
                      Thuế VAT và phí đóng gói sẽ được tính cụ thể tại bước thanh toán cuối cùng.
                    </p>
                  </div>

                  <div className="flex justify-between items-end pt-4">
                    <span className="text-xl font-serif italic tracking-normal">Tổng tiền</span>
                    <span className="text-3xl font-light tracking-tighter text-[#C5B49C]">{formatCurrency(tongTien)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => navigate('/dat-hang')}
                    className="group w-full bg-[#C5B49C] hover:bg-white hover:text-[#4A4540] text-white py-6 rounded-full text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500 flex items-center justify-center gap-3 shadow-xl active:scale-95"
                  >
                    Thanh toán đơn hàng
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </button>
                  
                  <div className="pt-6 flex justify-center gap-6 opacity-30">
                     <div className="w-8 h-5 bg-white rounded-sm" />
                     <div className="w-8 h-5 bg-white rounded-sm" />
                     <div className="w-8 h-5 bg-white rounded-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Thêm Google Font để hỗ trợ tiếng Việt tốt nhất */
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,700&display=swap');

        .font-serif {
          font-family: 'Playfair Display', serif !important;
          /* Tắt ligatures để tránh các trình duyệt tự nối ký tự lỗi */
          font-variant-ligatures: none;
          font-feature-settings: "liga" 0;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}