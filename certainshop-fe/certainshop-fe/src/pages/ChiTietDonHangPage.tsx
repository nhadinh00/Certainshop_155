import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Printer, CheckCircle2, Package, Truck, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { donHangApi } from '../services/api';
import type { DonHang } from '../services/api';
import { formatCurrency, formatDate, trangThaiDonHangLabel, getImageUrl, handleImgError } from '../utils/format';
import LoadingSpinner from '../components/LoadingSpinner';
import InvoicePrint from '../components/InvoicePrint';

const STEPS_COD = ['CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DANG_XU_LY', 'DANG_GIAO', 'HOAN_TAT'];
const STEPS_VNPAY = ['CHO_THANH_TOAN', 'DA_THANH_TOAN', 'DANG_XU_LY', 'DANG_GIAO', 'HOAN_TAT'];

export default function ChiTietDonHangPage() {
  const { maDonHang } = useParams<{ maDonHang: string }>();
  const [donHang, setDonHang] = useState<DonHang | null>(null);
  const [loading, setLoading] = useState(true);
  const [huyLoading, setHuyLoading] = useState(false);
  const [xacNhanLoading, setXacNhanLoading] = useState(false);
  const [showPrint, setShowPrint] = useState(false);

  const load = () => {
    if (!maDonHang) return;
    setLoading(true);
    donHangApi.chiTiet(maDonHang)
      .then(r => setDonHang(r.data.duLieu))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [maDonHang]);

  const huyDon = async () => {
    if (!donHang || !confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    setHuyLoading(true);
    try {
      await donHangApi.huyDon(donHang.maDonHang);
      toast.success('Đã hủy đơn hàng');
      load();
    } catch {
      toast.error('Không thể hủy đơn hàng');
    } finally {
      setHuyLoading(false);
    }
  };

  const xacNhanNhanHang = async () => {
    if (!donHang) return;
    setXacNhanLoading(true);
    try {
      await donHangApi.xacNhanNhanHang(donHang.maDonHang);
      toast.success('Đã xác nhận nhận hàng');
      load();
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setXacNhanLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!donHang) return <div className="text-center py-32 font-serif italic text-[#8C8C8C] tracking-normal">Không tìm thấy đơn hàng</div>;

  const tt = trangThaiDonHangLabel[donHang.trangThaiDonHang] || { label: donHang.trangThaiDonHang, color: 'gray' };
  const steps = donHang.phuongThucThanhToan === 'VNPAY' ? STEPS_VNPAY : STEPS_COD;
  const currentStep = steps.indexOf(donHang.trangThaiDonHang);
  const isHuy = donHang.trangThaiDonHang === 'DA_HUY';

  return (
    <div className="bg-[#FDFCFB] min-h-screen font-sans text-[#1A1A1A]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-[#E5E2D9]">
          <div>
            <Link to="/don-hang-cua-toi" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#8C8C8C] hover:text-[#C5B49C] transition-colors mb-4 group font-bold">
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Quay lại danh sách
            </Link>
            <h1 className="text-4xl font-serif italic text-[#4A4540] tracking-normal">Đơn hàng #{donHang.maDonHang}</h1>
            <p className="text-[10px] uppercase tracking-widest text-[#C1C1C1] mt-2 font-bold">Khởi tạo ngày {formatDate(donHang.thoiGianTao)}</p>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => setShowPrint(true)} className="p-3 border border-[#E5E2D9] text-[#4A4540] hover:bg-[#4A4540] hover:text-white transition-all rounded-full">
                <Printer className="w-4 h-4" />
             </button>
             <span className="px-5 py-2.5 border border-[#C5B49C] text-[#C5B49C] text-[10px] font-black uppercase tracking-widest bg-[#C5B49C]/5 rounded-full">
                {tt.label}
             </span>
          </div>
        </div>

        {/* Journey Tracker */}
        {!isHuy && currentStep >= 0 && (
          <div className="mb-16 px-4">
            <div className="flex items-center relative">
              {steps.map((step, idx) => {
                const s = trangThaiDonHangLabel[step];
                const isDone = idx <= currentStep;
                const isCurrent = idx === currentStep;
                
                return (
                  <div key={step} className="flex-1 flex flex-col items-center relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-700 ${
                      isDone ? 'bg-[#4A4540] border-[#4A4540] text-white' : 'bg-white border-[#E5E2D9] text-[#C1C1C1]'
                    } ${isCurrent ? 'ring-4 ring-[#C5B49C]/20 scale-110' : ''}`}>
                      {isDone ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-xs font-serif italic tracking-normal">{idx + 1}</span>}
                    </div>
                    <span className={`text-[9px] uppercase tracking-tighter mt-4 font-black text-center w-20 leading-tight ${
                      isCurrent ? 'text-[#4A4540]' : 'text-[#C1C1C1]'
                    }`}>
                      {s?.label}
                    </span>
                    {idx < steps.length - 1 && (
                      <div className={`absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-[1px] -z-10 ${
                        idx < currentStep ? 'bg-[#4A4540]' : 'bg-[#E5E2D9]'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Product List */}
            <section>
              <h3 className="text-[11px] uppercase tracking-[0.2em] font-black text-[#4A4540] mb-8 flex items-center gap-3">
                <Package className="w-4 h-4 text-[#C5B49C]" strokeWidth={2} /> Chi tiết sản phẩm
              </h3>
              <div className="space-y-6">
                {donHang.danhSachChiTiet?.map(ct => (
                  <div key={ct.id} className="flex gap-6 group">
                    <div className="w-24 h-32 overflow-hidden bg-[#F9F7F2] rounded-2xl border border-[#E5E2D9]">
                      <img 
                        src={getImageUrl(ct.bienThe?.anhChinh)} 
                        alt={ct.bienThe?.tenSanPham}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={handleImgError} 
                      />
                    </div>
                    <div className="flex-1 border-b border-[#F0EEE9] pb-6 flex justify-between">
                      <div>
                        <Link to={ct.bienThe?.duongDanSanPham ? `/san-pham/${ct.bienThe.duongDanSanPham}` : '#'}
                          className="text-lg font-serif italic text-[#4A4540] hover:text-[#C5B49C] transition-colors tracking-normal">
                          {ct.bienThe?.tenSanPham}
                        </Link>
                        <div className="flex gap-4 mt-2 text-[10px] text-[#8C8C8C] uppercase tracking-widest font-bold">
                          {ct.bienThe?.tenMauSac && <span>Màu: {ct.bienThe.tenMauSac}</span>}
                          {ct.bienThe?.kichThuoc && <span>Size: {ct.bienThe.kichThuoc}</span>}
                        </div>
                        <p className="text-[10px] text-[#C5B49C] mt-1 font-bold italic">Số lượng: {ct.soLuong}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#4A4540]">{formatCurrency(ct.thanhTien || (ct.giaTaiThoiDiemMua * ct.soLuong))}</p>
                        <p className="text-[10px] text-[#C1C1C1] mt-1 font-medium">{formatCurrency(ct.giaTaiThoiDiemMua)} / cái</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Timeline History */}
            {donHang.lichSuTrangThai && (
               <section className="bg-[#F9F7F2] p-8 rounded-[2rem] border border-[#E5E2D9]">
                  <h3 className="text-[11px] uppercase tracking-[0.2em] font-black text-[#4A4540] mb-8 flex items-center gap-3">
                    <Clock className="w-4 h-4 text-[#C5B49C]" strokeWidth={2} /> Lịch sử vận chuyển
                  </h3>
                  <div className="space-y-8 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[#C5B49C]/30">
                    {donHang.lichSuTrangThai.map((ls, idx) => (
                      <div key={idx} className="flex gap-6 relative">
                        <div className="w-[15px] h-[15px] rounded-full bg-white border-2 border-[#C5B49C] mt-1 shrink-0 z-10" />
                        <div>
                          <p className="text-xs font-black text-[#4A4540] uppercase tracking-wider">{trangThaiDonHangLabel[ls.trangThai]?.label || ls.trangThai}</p>
                          <p className="text-[11px] text-[#8C8C8C] mt-1.5 font-medium leading-relaxed italic">{ls.ghiChu || 'Cập nhật trạng thái hệ thống'}</p>
                          <p className="text-[9px] text-[#C1C1C1] uppercase tracking-[0.1em] mt-2 font-bold">{formatDate(ls.thoiGianTao)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </section>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            
            {/* Recipient Card */}
            <div className="p-8 border border-[#E5E2D9] rounded-[2.5rem] bg-white shadow-sm">
              <h3 className="text-[11px] uppercase tracking-[0.2em] font-black text-[#4A4540] mb-6 flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#C5B49C]" strokeWidth={2} /> Giao hàng tới
              </h3>
              <div className="text-sm text-[#1A1A1A] space-y-2">
                <p className="font-serif italic text-2xl text-[#4A4540] tracking-normal">{donHang.tenNguoiNhan}</p>
                <p className="text-[#8C8C8C] font-bold tracking-tight">{donHang.sdtNguoiNhan}</p>
                <div className="h-px bg-[#F0EEE9] my-4" />
                <p className="text-[#8C8C8C] font-medium leading-relaxed text-xs">
                  {donHang.diaChiGiaoHang}
                </p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-8 border border-[#E5E2D9] bg-[#4A4540] rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl" />
               <h3 className="relative z-10 text-[11px] uppercase tracking-[0.2em] font-black text-[#C5B49C] mb-8 flex items-center gap-3">
                <CreditCard className="w-4 h-4" strokeWidth={2} /> Quyết toán
              </h3>
              <div className="relative z-10 space-y-4 text-xs tracking-wide">
                <div className="flex justify-between text-white/60 font-bold uppercase text-[10px]">
                  <span>Tổng tiền hàng</span>
                  <span className="text-white">{formatCurrency(donHang.tongTienHang)}</span>
                </div>
                <div className="flex justify-between text-white/60 font-bold uppercase text-[10px]">
                  <span>Vận chuyển</span>
                  <span className="text-[#C5B49C]">Miễn phí</span>
                </div>
                {donHang.soTienGiamGia > 0 && (
                  <div className="flex justify-between text-[#C5B49C] font-bold uppercase text-[10px]">
                    <span>Ưu đãi</span>
                    <span>-{formatCurrency(donHang.soTienGiamGia)}</span>
                  </div>
                )}
                <div className="pt-6 border-t border-white/10 mt-6">
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-serif italic tracking-normal">Tổng cộng</span>
                    <span className="text-3xl font-light tracking-tighter text-[#C5B49C]">{formatCurrency(donHang.tongTienThanhToan)}</span>
                  </div>
                </div>
              </div>
              <div className="relative z-10 mt-8 p-4 bg-white/5 rounded-2xl text-[9px] uppercase tracking-widest text-white/40 space-y-1 font-bold">
                <p>Phương thức: {donHang.phuongThucThanhToan}</p>
                <p className={donHang.daThanhToan ? "text-[#C5B49C]" : "text-rose-400"}>
                   Trạng thái: {donHang.daThanhToan ? '✓ Đã thanh toán' : 'Chờ thanh toán'}
                </p>
              </div>
            </div>

            {/* Functional Buttons */}
            <div className="space-y-4">
               {donHang.trangThaiDonHang === 'CHO_XAC_NHAN' && (
                <button onClick={huyDon} disabled={huyLoading}
                  className="w-full py-5 border-2 border-rose-100 text-rose-500 text-[10px] uppercase font-black tracking-[0.2em] hover:bg-rose-50 transition-all disabled:opacity-50 rounded-full">
                  {huyLoading ? 'Đang xử lý...' : 'Hủy đơn hàng này'}
                </button>
              )}
              {donHang.trangThaiDonHang === 'DANG_GIAO' && (
                <button onClick={xacNhanNhanHang} disabled={xacNhanLoading}
                  className="w-full py-5 bg-[#C5B49C] text-white text-[10px] uppercase font-black tracking-[0.2em] hover:bg-[#4A4540] transition-all flex items-center justify-center gap-3 shadow-lg rounded-full">
                  <Truck className="w-4 h-4" /> {xacNhanLoading ? 'Đang ghi nhận...' : 'Đã nhận được hàng'}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Print Modal */}
      {showPrint && donHang && (
        <div className="fixed inset-0 bg-[#4A4540]/90 z-50 flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col rounded-[3rem] shadow-2xl">
            <div className="p-8 border-b border-[#E5E2D9] flex justify-between items-center">
              <span className="text-[11px] uppercase tracking-[0.5em] font-black text-[#4A4540]">Hóa đơn điện tử</span>
              <button onClick={() => setShowPrint(false)} className="p-2 hover:bg-[#F9F7F2] rounded-full transition-colors text-[#4A4540]">
                <X className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-12 bg-[#F9F7F2]">
              <div className="bg-white shadow-xl p-10 max-w-2xl mx-auto border border-[#E5E2D9] rounded-sm">
                <InvoicePrint donHang={donHang} onClose={() => setShowPrint(false)} />
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,700&display=swap');

        .font-serif {
          font-family: 'Playfair Display', serif !important;
          font-variant-ligatures: none;
          font-feature-settings: "liga" 0;
        }

        .tracking-normal {
          letter-spacing: 0 !important;
        }
      `}</style>
    </div>
  );
}

function X({ className, strokeWidth }: { className?: string, strokeWidth?: number }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
}