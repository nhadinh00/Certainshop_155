import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, ClipboardList, PhoneCall, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface PaymentResult {
  status: 'success' | 'error';
  maDonHang: string;
  maGiaoDich?: string;
  tongTienThanhToan?: number;
  message?: string;
}

export default function VNPayReturnPage() {
  const [loading, setLoading] = useState(true);
  const [kq, setKq] = useState<PaymentResult | null>(null);
  const [soGiay, setSoGiay] = useState(8);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const layKetQua = () => {
      const params = new URLSearchParams(location.search);
      const status = params.get('status');
      const maDonHang = params.get('maDonHang') || '';
      const maGiaoDich = params.get('maGiaoDich') || '';
      const tongTienStr = params.get('tongTienThanhToan');
      const tongTien = tongTienStr ? parseFloat(tongTienStr) : undefined;
      const message = params.get('message') || '';

      if (status === 'success') {
        setKq({
          status: 'success', maDonHang, maGiaoDich,
          tongTienThanhToan: tongTien,
          message: message || 'Giao dịch đã được xác thực thành công'
        });
      } else {
        setKq({
          status: 'error', maDonHang,
          message: message || 'Yêu cầu thanh toán bị từ chối'
        });
      }
      setLoading(false);
    };

    const timer = setTimeout(layKetQua, 2000); // Tăng delay để tạo cảm giác bảo mật cao
    return () => clearTimeout(timer);
  }, [location.search]);

  useEffect(() => {
    if (!kq || kq.status !== 'success') return;
    const timer = setInterval(() => setSoGiay(prev => prev - 1), 1000);
    const redirect = setTimeout(() => navigate(`/don-hang-cua-toi/${kq.maDonHang}`), 8000);
    return () => { clearInterval(timer); clearTimeout(redirect); };
  }, [kq, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFB]">
        <div className="relative mb-10">
          <div className="w-24 h-24 border border-[#F0EEE9] rounded-full flex items-center justify-center">
            <div className="w-16 h-16 border-t-2 border-[#7B8062] rounded-full animate-spin"></div>
          </div>
          <ShieldCheck className="absolute inset-0 m-auto w-6 h-6 text-[#7B8062] animate-pulse" />
        </div>
        <h2 className="text-2xl font-serif italic text-[#1A1A1A]">Đang bảo mật giao dịch...</h2>
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#8C8C8C] mt-4 font-black">Vui lòng giữ kết nối ổn định</p>
      </div>
    );
  }

  if (!kq) return null; // Hoặc xử lý lỗi xác thực tương tự style bên dưới

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center py-12 px-6 font-sans">
      <div className="max-w-xl w-full">
        <div className="bg-white border border-[#F0EEE9] rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-1000 animate-in zoom-in-95">
          
          {/* Status Branding Section */}
          <div className={`py-16 text-center border-b border-[#F0EEE9] ${kq.status === 'success' ? 'bg-[#F2F4ED]/30' : 'bg-[#FDF2F2]/30'}`}>
            <div className="mb-8 relative inline-flex items-center justify-center">
              {kq.status === 'success' ? (
                <div className="w-28 h-28 rounded-full border border-[#7B8062]/20 flex items-center justify-center">
                   <CheckCircle2 className="w-16 h-16 text-[#7B8062]" strokeWidth={1} />
                </div>
              ) : (
                <div className="w-28 h-28 rounded-full border border-rose-200 flex items-center justify-center">
                   <XCircle className="w-16 h-16 text-rose-800/40" strokeWidth={1} />
                </div>
              )}
            </div>
            <h1 className="text-4xl font-serif italic text-[#1A1A1A] mb-3">
              {kq.status === 'success' ? 'Giao dịch hoàn tất' : 'Giao dịch gián đoạn'}
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C] font-black">{kq.message}</p>
          </div>

          <div className="p-10 sm:p-14">
            {/* Transaction Receipt Style */}
            <div className="space-y-6 mb-12">
              <div className="flex justify-between items-end">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#8C8C8C]">Mã định danh đơn hàng</span>
                <span className="text-sm font-bold tracking-tighter text-[#1A1A1A]">#{kq.maDonHang || 'N/A'}</span>
              </div>
              
              <div className="h-px bg-[#F0EEE9]" />

              {kq.tongTienThanhToan && (
                <div className="flex justify-between items-end">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#8C8C8C]">Giá trị sở hữu</span>
                  <span className="text-3xl font-serif italic text-[#1A1A1A]">
                    {formatCurrency(kq.tongTienThanhToan)}
                  </span>
                </div>
              )}

              {kq.maGiaoDich && (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#8C8C8C]">Chứng thực VNPay</span>
                  <span className="text-[10px] font-medium text-[#1A1A1A] bg-[#F0EEE9] px-3 py-1 rounded-full uppercase tracking-widest">
                    {kq.maGiaoDich}
                  </span>
                </div>
              )}
            </div>

            {/* Notification Bar */}
            <div className={`flex gap-5 p-6 rounded-2xl mb-12 border transition-all ${kq.status === 'success' ? 'bg-[#F2F4ED] border-[#7B8062]/10' : 'bg-rose-50 border-rose-100'}`}>
              {kq.status === 'success' ? (
                <ClipboardList className="w-5 h-5 text-[#7B8062] shrink-0" />
              ) : (
                <PhoneCall className="w-5 h-5 text-rose-800/60 shrink-0" />
              )}
              <p className={`text-[11px] leading-relaxed font-bold uppercase tracking-wider ${kq.status === 'success' ? 'text-[#7B8062]' : 'text-rose-800/70'}`}>
                {kq.status === 'success' 
                  ? 'Tuyệt vời. Hệ thống đang tiến hành lưu trữ và đóng gói bưu phẩm của bạn ngay lập tức.' 
                  : 'Đừng quá lo lắng. Nếu tài khoản của bạn đã bị trừ phí, vui lòng liên hệ đội ngũ nghệ nhân để được hỗ trợ thủ công.'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4">
              {kq.status === 'success' ? (
                <button
                  onClick={() => navigate(`/don-hang-cua-toi/${kq.maDonHang}`)}
                  className="group w-full flex items-center justify-center gap-4 py-5 bg-[#1A1A1A] text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-full hover:bg-[#7B8062] transition-all duration-500 shadow-2xl shadow-black/10 active:scale-[0.98]"
                >
                  Kiểm tra bưu phẩm <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/dat-hang`)}
                  className="w-full py-5 bg-rose-900 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-full hover:bg-rose-950 transition-all shadow-xl active:scale-[0.98]"
                >
                  Thực hiện lại giao dịch
                </button>
              )}
              
              <button
                onClick={() => navigate('/don-hang-cua-toi')}
                className="w-full py-5 text-[#8C8C8C] font-black text-[11px] uppercase tracking-[0.3em] hover:text-[#1A1A1A] transition-all"
              >
                Trở về bộ sưu tập đơn
              </button>
            </div>

            {/* Visual Countdown */}
            {kq.status === 'success' && (
              <div className="mt-12 flex flex-col items-center gap-4">
                <div className="w-32 bg-[#F0EEE9] h-[2px] rounded-full overflow-hidden relative">
                  <div 
                    className="absolute inset-y-0 left-0 bg-[#7B8062] transition-all duration-1000 ease-linear"
                    style={{ width: `${(soGiay / 8) * 100}%` }}
                  />
                </div>
                <p className="text-[8px] text-[#8C8C8C] font-black uppercase tracking-[0.5em]">
                  Tự động chuyển tiếp sau <span className="text-[#1A1A1A]">{soGiay}s</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif !important; }
      `}</style>
    </div>
  );
}