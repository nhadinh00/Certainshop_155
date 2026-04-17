import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, ChevronRight, Minus, Plus, X, Info, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { sanPhamApi, gioHangApi } from '../services/api';
import type { SanPhamDetail } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { formatCurrency, getImageUrl, handleImgError } from '../utils/format';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ChiTietSanPhamPage() {
  const { duongDan } = useParams<{ duongDan: string }>();
  const [sanPham, setSanPham] = useState<SanPhamDetail | null>(null);
  const [soLuong, setSoLuong] = useState(1);
  const [selectedAnh, setSelectedAnh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const { isLoggedIn, isNhanVien, isAdmin } = useAuthStore();
  const { increment } = useCartStore();
  const navigate = useNavigate();

  const isStaffOrAdmin = isNhanVien() || isAdmin();

  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<number | null>(null);

  const bienThe = useMemo(() => sanPham?.bienThe || [], [sanPham]);

  const colors = useMemo(() =>
    [...new Map(bienThe.filter(bt => bt.mauSac).map(bt => [bt.mauSac!.id, bt.mauSac!])).values()],
    [bienThe]);
  const sizes = useMemo(() =>
    [...new Map(bienThe.filter(bt => bt.kichThuoc).map(bt => [bt.kichThuoc!.id, bt.kichThuoc!])).values()],
    [bienThe]);
  const selectedBienThe = useMemo(() =>
    bienThe.find(bt =>
      (!selectedColor || bt.mauSac?.id === selectedColor) &&
      (!selectedSize || bt.kichThuoc?.id === selectedSize) &&
      (!selectedMaterial || bt.chatLieu?.id === selectedMaterial)
    ) ?? null,
    [bienThe, selectedColor, selectedSize, selectedMaterial]);

  useEffect(() => {
    if (!duongDan) return;
    setLoading(true);
    sanPhamApi.chiTiet(duongDan).then(r => {
      const sp = r.data.duLieu;
      setSanPham(sp);
      const def = sp.bienThe?.find((bt: any) => bt.macDinh) || sp.bienThe?.[0] || null;
      if (def) {
        setSelectedColor(def.mauSac?.id ?? null);
        setSelectedSize(def.kichThuoc?.id ?? null);
        setSelectedMaterial(def.chatLieu?.id ?? null);
      }
      setSelectedAnh(0);
      setSoLuong(1);
    }).catch(() => {
      toast.error('Không tìm thấy sản phẩm');
    }).finally(() => setLoading(false));
  }, [duongDan]);

  useEffect(() => { setSelectedAnh(0); }, [selectedBienThe?.id]);

  const handleAddToCart = async () => {
    if (!isLoggedIn()) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      navigate('/dang-nhap');
      return;
    }
    if (isStaffOrAdmin) {
      toast.error('Tài khoản nhân viên/quản trị không thể mua hàng tại đây.');
      return;
    }
    if (!selectedBienThe) {
      toast.error('Vui lòng chọn đầy đủ tùy chọn');
      return;
    }
    if (selectedBienThe.soLuongTon < soLuong) {
      toast.error(`Chỉ còn ${selectedBienThe.soLuongTon} sản phẩm`);
      return;
    }
    try {
      await gioHangApi.them(selectedBienThe.id, soLuong);
      for (let i = 0; i < soLuong; i++) increment();
      toast.success('Đã thêm vào giỏ hàng!');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!sanPham) return <div className="text-center py-32 font-serif italic text-gray-400 tracking-normal">Không tìm thấy sản phẩm</div>;

  const images = (() => {
    if (selectedBienThe?.hinhAnh?.length) return selectedBienThe.hinhAnh;
    const withImages = bienThe.find(bt => bt.hinhAnh?.length);
    return withImages?.hinhAnh || [];
  })();
  const gia = selectedBienThe?.gia ?? sanPham.giaBan ?? 0;

  return (
    <div className="bg-[#FDFCFB] font-sans text-[#1A1A1A]">
      <div className="max-w-[1440px] mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative group bg-white overflow-hidden aspect-[3/4] rounded-[2rem] border border-[#E5E2D9]">
              {images.length > 0 ? (
                <>
                  <img
                    src={getImageUrl(images[selectedAnh]?.duongDan)}
                    alt={sanPham.tenSanPham}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    onError={handleImgError}
                  />
                  {images.length > 1 && (
                    <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setSelectedAnh(i => Math.max(0, i - 1))}
                        className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-[#4A4540] hover:text-white transition-all shadow-sm">
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button onClick={() => setSelectedAnh(i => Math.min(images.length - 1, i + 1))}
                        className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-[#4A4540] hover:text-white transition-all shadow-sm">
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-200 text-8xl">👕</div>
              )}
            </div>
            
            <div className="flex gap-4 overflow-x-auto no-scrollbar pt-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedAnh(i)}
                  className={`relative w-24 h-32 shrink-0 overflow-hidden transition-all duration-300 rounded-xl border-2 ${i === selectedAnh ? 'border-[#C5B49C]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={getImageUrl(img.duongDan)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="lg:col-span-5 flex flex-col">
            <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#C1C1C1] mb-6 font-black">
              <Link to="/" className="hover:text-[#4A4540]">Home</Link>
              <span>/</span>
              <span className="text-[#4A4540]">{sanPham.danhMuc?.tenDanhMuc}</span>
            </nav>

            <h1 className="text-5xl font-serif italic text-[#4A4540] leading-tight mb-6 tracking-normal">{sanPham.tenSanPham}</h1>
            
            <div className="flex items-center gap-6 mb-10">
              <span className="text-3xl font-light text-[#C5B49C] tracking-tighter">{formatCurrency(gia)}</span>
              {sanPham.giaGoc > gia && (
                <span className="text-lg text-[#C1C1C1] line-through decoration-[#C5B49C]/50 font-medium">{formatCurrency(sanPham.giaGoc)}</span>
              )}
            </div>

            <div className="space-y-10 pb-10 border-b border-[#F0EEE9]">
              {/* Colors */}
              {colors.length > 0 && (
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] font-black text-[#4A4540] mb-5 block">
                    Màu sắc — <span className="text-[#C5B49C] italic font-serif lowercase tracking-normal">{colors.find(c => c.id === selectedColor)?.tenMauSac || 'chưa chọn'}</span>
                  </label>
                  <div className="flex gap-4 flex-wrap">
                    {colors.map(c => (
                      <button key={c.id} onClick={() => setSelectedColor(c.id)}
                        className={`w-11 h-11 rounded-full border-2 p-1 transition-all ${selectedColor === c.id ? 'border-[#C5B49C] scale-110 shadow-lg' : 'border-transparent'}`}>
                        <div className="w-full h-full rounded-full border border-black/5 shadow-inner" style={{ backgroundColor: c.maHex || '#ccc' }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {sizes.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <label className="text-[11px] uppercase tracking-[0.2em] font-black text-[#4A4540]">Chọn kích cỡ</label>
                    <button className="text-[9px] uppercase tracking-widest font-black text-[#C1C1C1] hover:text-[#4A4540] underline underline-offset-4">Size Guide</button>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {sizes.map(s => {
                      const available = bienThe.some(bt =>
                        bt.kichThuoc?.id === s.id &&
                        (!selectedColor || bt.mauSac?.id === selectedColor) &&
                        bt.soLuongTon > 0
                      );
                      return (
                        <button key={s.id} onClick={() => setSelectedSize(s.id)}
                          disabled={!available}
                          className={`min-w-[70px] h-12 flex items-center justify-center px-4 rounded-full border-2 text-[11px] font-black tracking-widest transition-all ${
                            selectedSize === s.id
                              ? 'bg-[#4A4540] text-white border-[#4A4540] shadow-lg'
                              : available
                              ? 'border-[#E5E2D9] text-[#4A4540] hover:border-[#4A4540]'
                              : 'border-gray-100 text-gray-200 cursor-not-allowed line-through'
                          }`}>
                          {s.tenKichThuoc}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-10">
                <label className="text-[11px] uppercase tracking-[0.2em] font-black text-[#4A4540]">Số lượng</label>
                <div className="flex items-center bg-white border-2 border-[#E5E2D9] rounded-full h-12 px-2 shadow-sm">
                  <button onClick={() => setSoLuong(q => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-[#F9F7F2] rounded-full transition-colors">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-center text-sm font-black text-[#4A4540]">{soLuong}</span>
                  <button onClick={() => setSoLuong(q => Math.min((selectedBienThe?.soLuongTon || 99), q + 1))} className="w-8 h-8 flex items-center justify-center hover:bg-[#F9F7F2] rounded-full transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-10 space-y-5">
              {isStaffOrAdmin ? (
                <div className="bg-[#4A4540] p-8 rounded-[2rem] text-white shadow-xl">
                  <p className="flex items-center gap-2 text-[10px] uppercase font-black text-[#C5B49C] mb-5 tracking-[0.2em]">
                    <Info className="w-4 h-4" /> Management Portal
                  </p>
                  <button onClick={() => setShowInfo(true)}
                    className="w-full py-5 bg-white text-[#4A4540] rounded-full text-[11px] uppercase tracking-[0.2em] font-black hover:bg-[#C5B49C] hover:text-white transition-all">
                    Kiểm tra tồn kho chi tiết
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <button onClick={handleAddToCart}
                    disabled={!selectedBienThe || selectedBienThe.soLuongTon === 0}
                    className="h-16 rounded-full border-2 border-[#4A4540] text-[#4A4540] text-[11px] uppercase tracking-[0.2em] font-black hover:bg-[#4A4540] hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-30">
                    <ShoppingCart className="w-4 h-4" strokeWidth={2.5} /> Thêm vào giỏ
                  </button>
                  <button onClick={async () => { await handleAddToCart(); navigate('/gio-hang'); }}
                    disabled={!selectedBienThe || selectedBienThe.soLuongTon === 0}
                    className="h-16 rounded-full bg-[#C5B49C] text-white text-[11px] uppercase tracking-[0.2em] font-black hover:bg-[#4A4540] transition-all shadow-lg shadow-[#C5B49C]/20 disabled:opacity-30">
                    Mua ngay
                  </button>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-[#F0EEE9] pt-10">
               <div className="flex flex-col items-center text-center gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-[#F9F7F2] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Truck className="w-5 h-5 text-[#C5B49C]" strokeWidth={1.5} />
                  </div>
                  <span className="text-[9px] uppercase tracking-widest font-black text-[#8C8C8C] leading-relaxed">Free Delivery<br/><span className="text-[#C1C1C1]">từ 1.000.000đ</span></span>
               </div>
               <div className="flex flex-col items-center text-center gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-[#F9F7F2] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <RotateCcw className="w-5 h-5 text-[#C5B49C]" strokeWidth={1.5} />
                  </div>
                  <span className="text-[9px] uppercase tracking-widest font-black text-[#8C8C8C] leading-relaxed">7 Ngày Đổi Trả<br/><span className="text-[#C1C1C1]">tận nơi nhanh chóng</span></span>
               </div>
               <div className="flex flex-col items-center text-center gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-[#F9F7F2] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-5 h-5 text-[#C5B49C]" strokeWidth={1.5} />
                  </div>
                  <span className="text-[9px] uppercase tracking-widest font-black text-[#8C8C8C] leading-relaxed">Chính Hãng 100%<br/><span className="text-[#C1C1C1]">CertainShop cam kết</span></span>
               </div>
            </div>

            {/* Description Section */}
            <div className="mt-16 bg-[#F9F7F2] p-10 rounded-[2.5rem] border border-[#E5E2D9]">
                <h3 className="text-[12px] uppercase tracking-[0.3em] font-black text-[#4A4540] mb-6 flex items-center gap-3">
                  <Info className="w-4 h-4 text-[#C5B49C]" /> Câu chuyện sản phẩm
                </h3>
                <p className="text-[13px] text-[#8C8C8C] leading-loose font-medium italic whitespace-pre-wrap tracking-normal">
                  {sanPham.moTa}
                </p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Info Modal */}
      {isStaffOrAdmin && showInfo && (
        <div className="fixed inset-0 bg-[#4A4540]/90 z-50 flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl rounded-[3rem]">
            <div className="p-8 border-b border-[#F0EEE9] flex justify-between items-center bg-[#FDFCFB]">
              <span className="text-[11px] uppercase tracking-[0.5em] font-black text-[#4A4540]">Inventory Intelligence</span>
              <button onClick={() => setShowInfo(false)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-all">
                <X className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 bg-[#F9F7F2]">
               <div className="grid grid-cols-2 gap-10 mb-10 bg-white p-8 rounded-3xl border border-[#E5E2D9]">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-black text-[#C1C1C1] tracking-widest">Mã sản phẩm</p>
                    <p className="font-serif italic text-xl text-[#4A4540] tracking-normal">{sanPham.maSanPham}</p>
                  </div>
                  <div className="space-y-2 text-right">
                    <p className="text-[10px] uppercase font-black text-[#C1C1C1] tracking-widest">Thương hiệu</p>
                    <p className="font-serif italic text-xl text-[#4A4540] tracking-normal">{sanPham.thuongHieu?.tenThuongHieu}</p>
                  </div>
               </div>
               
               <h4 className="text-[11px] uppercase font-black mb-6 tracking-[0.2em] text-[#4A4540] px-2">Chi tiết tồn kho biến thể</h4>
               <div className="bg-white rounded-3xl border border-[#E5E2D9] overflow-hidden divide-y divide-[#F0EEE9]">
                  {sanPham.bienThe?.map((bt) => (
                    <div key={bt.id} className="p-6 flex justify-between items-center hover:bg-[#FDFCFB] transition-colors">
                       <span className="text-[11px] font-black uppercase tracking-wider text-[#8C8C8C]">
                          {bt.mauSac?.tenMauSac} / {bt.kichThuoc?.tenKichThuoc} / {bt.chatLieu?.tenChatLieu}
                       </span>
                       <span className={`text-sm font-black ${bt.soLuongTon > 10 ? 'text-[#C5B49C]' : 'text-rose-500'}`}>
                          {bt.soLuongTon} <span className="text-[10px] uppercase ml-1 tracking-tighter">đơn vị</span>
                       </span>
                    </div>
                  ))}
               </div>
            </div>
            <div className="p-8 border-t border-[#F0EEE9] bg-white">
              <button onClick={() => setShowInfo(false)} className="w-full py-5 bg-[#4A4540] text-white rounded-full text-[11px] uppercase font-black tracking-[0.3em] hover:bg-[#C5B49C] transition-all">Hoàn tất kiểm tra</button>
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

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}