import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gioHangApi, donHangApi, taiKhoanApi, ghnApi, voucherApi } from '../services/api';
import type { GioHang, DiaChi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { formatCurrency, getImageUrl, handleImgError, PLACEHOLDER_IMG } from '../utils/format';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { MapPin, Tag, ChevronRight } from 'lucide-react';

// Validation helpers
const isValidPhoneNumber = (phone: string): boolean => /^(\+84|0)[0-9]{9,10}$/.test(phone.replace(/\s/g, ''));
const isValidName = (name: string): boolean => name.trim().length >= 3 && name.trim().length <= 100;

export default function DatHangPage() {
  const [gioHang, setGioHang] = useState<GioHang | null>(null);
  const [diaChiList, setDiaChiList] = useState<DiaChi[]>([]);
  const [selectedDiaChi, setSelectedDiaChi] = useState<DiaChi | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [maVoucher, setMaVoucher] = useState('');
  const [voucherInfo, setVoucherInfo] = useState<{ maVoucher: string; giaTriGiam: number; giaTriSauGiam: number; hopLe: boolean } | null>(null);
  const [phuongThuc, setPhuongThuc] = useState('COD');
  const [ghiChu, setGhiChu] = useState('');
  const [tenNguoiNhan, setTenNguoiNhan] = useState('');
  const [sdtNguoiNhan, setSdtNguoiNhan] = useState('');
  const [diaChiGiaoHang, setDiaChiGiaoHang] = useState('');
  
  const [phiVanChuyen, setPhiVanChuyen] = useState<number>(0);
  const [loadingShip, setLoadingShip] = useState(false);

  const { isLoggedIn } = useAuthStore();
  const { setCount } = useCartStore();
  const navigate = useNavigate();
  const shippingCalledRef = useRef<number | undefined>(undefined);

  const tinhPhiVanChuyen = useCallback(async (maHuyen: number, maXa: string) => {
    setLoadingShip(true);
    try {
      const tongKg = gioHang?.danhSachChiTiet?.length || 1;
      const trongLuongGram = tongKg * 300;
      const res = await ghnApi.tinhPhi(maHuyen, maXa, trongLuongGram);
      setPhiVanChuyen(res.data.duLieu?.fee || 35000);
    } catch {
      setPhiVanChuyen(35000);
    } finally {
      setLoadingShip(false);
    }
  }, [gioHang]);

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/dang-nhap'); return; }
    
    Promise.all([
      gioHangApi.lay(),
      taiKhoanApi.danhSachDiaChi(),
      taiKhoanApi.layThongTin(),
    ]).then(([cart, diaChiRes, thongTinRes]) => {
      const c = cart.data.duLieu;
      if (!c?.danhSachChiTiet?.length) { navigate('/gio-hang'); return; }
      setGioHang(c);
      const dcs = diaChiRes.data.duLieu || [];
      setDiaChiList(dcs);
      
      const macDinh = dcs.find(dc => dc.laMacDinh) || dcs[0] || null;
      setSelectedDiaChi(macDinh);
      
      if (macDinh) {
        setTenNguoiNhan(macDinh.hoTen || '');
        setSdtNguoiNhan(macDinh.soDienThoai || '');
        setDiaChiGiaoHang(`${macDinh.diaChiDong1}, ${macDinh.phuongXa}, ${macDinh.quanHuyen}, ${macDinh.tinhThanh}`);
      } else {
        const nd = thongTinRes.data.duLieu;
        setTenNguoiNhan(nd.hoTen || '');
        setSdtNguoiNhan(nd.soDienThoai || '');
      }
    }).finally(() => setLoading(false));
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (!selectedDiaChi?.maHuyenGHN || !selectedDiaChi.maXaGHN) {
      setPhiVanChuyen(0); return;
    }
    if (!shippingCalledRef.current || selectedDiaChi.id !== shippingCalledRef.current) {
      shippingCalledRef.current = selectedDiaChi.id;
      tinhPhiVanChuyen(selectedDiaChi.maHuyenGHN, selectedDiaChi.maXaGHN);
    }
  }, [selectedDiaChi, tinhPhiVanChuyen]);

  const handleDiaChiChange = (dc: DiaChi) => {
    setSelectedDiaChi(dc);
    setTenNguoiNhan(dc.hoTen || '');
    setSdtNguoiNhan(dc.soDienThoai || '');
    setDiaChiGiaoHang(`${dc.diaChiDong1}, ${dc.phuongXa}, ${dc.quanHuyen}, ${dc.tinhThanh}`);
  };

  const handleKiemTraVoucher = async () => {
    if (!maVoucher.trim()) { toast.error('Vui lòng nhập mã voucher'); return; }
    try {
      const tongHang = gioHang?.danhSachChiTiet?.reduce((s, ct) => s + (ct.donGia || ct.bienThe?.gia || 0) * ct.soLuong, 0) || 0;
      const res = await voucherApi.tinhGiaTriGiam(maVoucher.toUpperCase().trim(), tongHang);
      const data = res.data?.duLieu;
      if (data?.hopLe) {
        setVoucherInfo(data);
        toast.success(`Áp dụng thành công - Giảm ${formatCurrency(data.giaTriGiam)}`);
      } else {
        toast.error('Mã không khả dụng');
        setVoucherInfo(null);
      }
    } catch {
      toast.error('Lỗi kiểm tra mã');
      setVoucherInfo(null);
    }
  };

  const handleDatHang = async () => {
    if (!isValidName(tenNguoiNhan) || !isValidPhoneNumber(sdtNguoiNhan) || !diaChiGiaoHang) {
      toast.error('Vui lòng hoàn thiện thông tin giao hàng'); return;
    }
    setSubmitting(true);
    try {
      const payload: any = {
        tenNguoiNhan: tenNguoiNhan.trim(),
        soDienThoai: sdtNguoiNhan.replace(/\s/g, ''),
        diaChiCuThe: diaChiGiaoHang.trim(),
        phuongThucThanhToan: phuongThuc,
        ghiChu: ghiChu.trim() || null,
        maVoucher: voucherInfo?.maVoucher || null,
        phiVanChuyen,
      };
      if (selectedDiaChi?.id) {
        Object.assign(payload, {
          diaChiId: selectedDiaChi.id,
          tenTinh: selectedDiaChi.tinhThanh, tenHuyen: selectedDiaChi.quanHuyen, tenXa: selectedDiaChi.phuongXa,
          maTinhGHN: selectedDiaChi.maTinhGHN, maHuyenGHN: selectedDiaChi.maHuyenGHN, maXaGHN: selectedDiaChi.maXaGHN
        });
      }
      const res = await donHangApi.datHang(payload);
      const duLieu = res.data.duLieu as any;
      setCount(0);
      if (phuongThuc === 'VNPAY' && duLieu?.urlThanhToan) {
        window.location.href = duLieu.urlThanhToan; return;
      }
      toast.success('Đặt hàng thành công');
      navigate(`/don-hang-cua-toi/${duLieu?.maDonHang}`);
    } catch {
      toast.error('Đặt hàng thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const tongHang = gioHang?.danhSachChiTiet?.reduce((s, ct) => s + (ct.donGia || ct.bienThe?.gia || 0) * ct.soLuong, 0) || 0;
  const tongThanhToan = tongHang - (voucherInfo?.giaTriGiam || 0) + phiVanChuyen;

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="min-h-screen bg-[#F9F7F2] font-sans text-[#2D2D2D] pb-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Breadcrumb style header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-light tracking-tighter mb-2">
            Thanh toán <span className="font-serif italic text-[#7B8062]">Đơn hàng</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#A6A6A6] font-bold">Hoàn tất trải nghiệm mua sắm của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column - Form */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* 1. Shipping Section */}
            <section>
              <div className="flex items-center gap-3 mb-6 border-b border-[#E5E2D9] pb-2">
                <MapPin className="w-4 h-4 text-[#7B8062]" />
                <h2 className="text-[13px] uppercase tracking-[0.2em] font-bold">Thông tin nhận hàng</h2>
              </div>

              {diaChiList.length > 0 && (
                <div className="grid grid-cols-1 gap-3 mb-6">
                  {diaChiList.map(dc => (
                    <button key={dc.id} onClick={() => handleDiaChiChange(dc)}
                      className={`text-left p-5 rounded-sm border transition-all ${selectedDiaChi?.id === dc.id ? 'border-[#7B8062] bg-white shadow-sm' : 'border-[#E5E2D9] bg-transparent opacity-60'}`}>
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold tracking-tight">{dc.hoTen} <span className="mx-2 font-light text-[#A6A6A6]">|</span> {dc.soDienThoai}</p>
                        {selectedDiaChi?.id === dc.id && <div className="w-2 h-2 rounded-full bg-[#7B8062]" />}
                      </div>
                      <p className="text-xs mt-2 text-[#5C5C5C] leading-relaxed">{dc.diaChiDong1}, {dc.phuongXa}, {dc.quanHuyen}, {dc.tinhThanh}</p>
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="text-[9px] uppercase tracking-widest text-[#A6A6A6] mb-1 block ml-1 font-bold">Họ tên</label>
                    <input value={tenNguoiNhan} onChange={e => setTenNguoiNhan(e.target.value)} 
                      className="w-full bg-transparent border-b border-[#E5E2D9] py-2 focus:border-[#7B8062] outline-none text-sm transition-colors" />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-[#A6A6A6] mb-1 block ml-1 font-bold">Số điện thoại</label>
                    <input value={sdtNguoiNhan} onChange={e => setSdtNguoiNhan(e.target.value)} 
                      className="w-full bg-transparent border-b border-[#E5E2D9] py-2 focus:border-[#7B8062] outline-none text-sm transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-[#A6A6A6] mb-1 block ml-1 font-bold">Địa chỉ chi tiết</label>
                  <input value={diaChiGiaoHang} onChange={e => setDiaChiGiaoHang(e.target.value)}
                    className="w-full bg-transparent border-b border-[#E5E2D9] py-2 focus:border-[#7B8062] outline-none text-sm transition-colors" />
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-[#A6A6A6] mb-1 block ml-1 font-bold">Ghi chú yêu cầu</label>
                  <input value={ghiChu} onChange={e => setGhiChu(e.target.value)}
                    placeholder="VD: Giao giờ hành chính..."
                    className="w-full bg-transparent border-b border-[#E5E2D9] py-2 focus:border-[#7B8062] outline-none text-sm italic transition-colors" />
                </div>
              </div>
            </section>

            {/* 2. Payment Section */}
            <section>
              <div className="flex items-center gap-3 mb-6 border-b border-[#E5E2D9] pb-2">
                <Tag className="w-4 h-4 text-[#7B8062]" />
                <h2 className="text-[13px] uppercase tracking-[0.2em] font-bold">Phương thức & Ưu đãi</h2>
              </div>
              
              <div className="flex gap-4 mb-8">
                {[
                  { id: 'COD', label: 'Thanh toán COD', sub: 'Khi nhận hàng' },
                  { id: 'VNPAY', label: 'Ví VNPAY', sub: 'Cổng thanh toán' }
                ].map(item => (
                  <button key={item.id} onClick={() => setPhuongThuc(item.id)}
                    className={`flex-1 p-4 border transition-all text-center ${phuongThuc === item.id ? 'border-[#2D2D2D] bg-[#2D2D2D] text-white' : 'border-[#E5E2D9] text-[#5C5C5C]'}`}>
                    <p className="text-[11px] font-bold uppercase tracking-widest">{item.label}</p>
                    <p className={`text-[9px] uppercase mt-1 ${phuongThuc === item.id ? 'text-[#A6A6A6]' : 'text-[#A6A6A6]'}`}>{item.sub}</p>
                  </button>
                ))}
              </div>

              <div className="relative group">
                <input value={maVoucher} onChange={e => setMaVoucher(e.target.value.toUpperCase())}
                  placeholder="MÃ ƯU ĐÃI (VOUCHER)" 
                  className="w-full bg-white border border-[#E5E2D9] px-6 py-4 text-[11px] tracking-[0.2em] outline-none focus:border-[#7B8062] transition-all" />
                <button onClick={handleKiemTraVoucher} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#7B8062] hover:text-[#2D2D2D] transition-colors uppercase tracking-widest">
                  Áp dụng
                </button>
              </div>
            </section>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 sm:p-12 border border-[#E5E2D9] shadow-sm sticky top-32">
              <h3 className="font-serif italic text-2xl mb-8 border-b border-[#F9F7F2] pb-4">Đơn hàng của bạn</h3>
              
              <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {gioHang?.danhSachChiTiet?.map(ct => (
                  <div key={ct.id} className="flex gap-4 items-center">
                    <div className="w-16 h-20 bg-[#F9F7F2] shrink-0 overflow-hidden">
                      <img src={ct.bienThe?.anhChinh ? getImageUrl(ct.bienThe.anhChinh) : PLACEHOLDER_IMG}
                        className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all" onError={handleImgError} alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[12px] font-bold uppercase tracking-tight text-[#2D2D2D] line-clamp-1">{ct.bienThe?.tenSanPham}</h4>
                      <p className="text-[10px] text-[#A6A6A6] mt-1">SỐ LƯỢNG: {ct.soLuong}</p>
                      <p className="text-[12px] font-light mt-1">{formatCurrency(ct.donGia || ct.bienThe?.gia || 0)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-[#F9F7F2]">
                <div className="flex justify-between text-[11px] uppercase tracking-widest text-[#5C5C5C]">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(tongHang)}</span>
                </div>
                {voucherInfo && (
                  <div className="flex justify-between text-[11px] uppercase tracking-widest text-[#7B8062]">
                    <span>Giảm giá</span>
                    <span>-{formatCurrency(voucherInfo.giaTriGiam)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[11px] uppercase tracking-widest text-[#5C5C5C]">
                  <span>Vận chuyển {loadingShip && '...'}</span>
                  <span>{formatCurrency(phiVanChuyen)}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-[#2D2D2D]/10">
                  <span className="text-[13px] font-bold uppercase tracking-[0.2em]">Tổng cộng</span>
                  <span className="text-xl font-light tracking-tighter">{formatCurrency(tongThanhToan)}</span>
                </div>
              </div>

              <button onClick={handleDatHang} disabled={submitting}
                className="w-full bg-[#2D2D2D] text-white py-5 mt-10 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-[#404040] transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                {submitting ? 'Đang xử lý...' : 'Hoàn tất đặt hàng'}
                {!submitting && <ChevronRight className="w-3 h-3" />}
              </button>
              
              <p className="text-[9px] text-center text-[#A6A6A6] mt-6 leading-relaxed uppercase tracking-widest">
                Bằng cách đặt hàng, bạn đồng ý với các <br/> điều khoản dịch vụ của CertainShop.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}