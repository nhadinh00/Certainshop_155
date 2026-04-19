import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, AlertCircle, Sparkles, Star } from 'lucide-react';
import { sanPhamApi } from '../services/api';
import type { SanPhamItem, DanhMuc } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function TrangChuPage() {
  const [sanPhamBanChay, setSanPhamBanChay] = useState<SanPhamItem[]>([]);
  const [sanPhamMoi, setSanPhamMoi] = useState<SanPhamItem[]>([]);
  const [danhMuc, setDanhMuc] = useState<DanhMuc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [banChayRes, moiRes, dmRes] = await Promise.all([
        sanPhamApi.banChay().catch(() => ({ data: { duLieu: [] } })),
        sanPhamApi.moi().catch(() => ({ data: { duLieu: [] } })),
        sanPhamApi.danhMuc().catch(() => ({ data: { duLieu: [] } }))
      ]);
      
      setSanPhamBanChay(banChayRes?.data?.duLieu || []);
      setSanPhamMoi(moiRes?.data?.duLieu || []);
      setDanhMuc(dmRes?.data?.duLieu || []);
    } catch (err) {
      setError('Hệ thống đang bảo trì. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center px-4 font-sans">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-[#C5B49C] mx-auto mb-6" />
          <h2 className="text-2xl font-serif italic text-[#1A1A1A] mb-4">Trải nghiệm bị gián đoạn</h2>
          <p className="text-[#8C8C8C] text-[10px] uppercase tracking-[0.4em] font-black mb-8">{error}</p>
          <button onClick={loadData} className="px-10 py-4 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-[0.3em] font-black hover:bg-[#7B8062] transition-all">
            Thử lại ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFCFB] text-[#1A1A1A] font-sans">
      {/* Hero Banner - Editorial Style */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden border-b border-[#F0EEE9]">
        <div className="max-w-7xl mx-auto px-6 py-20 w-full grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-black text-[#7B8062]">
              <Sparkles className="w-3 h-3" />
              <span>New Collection 2026</span>
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-light tracking-tighter leading-[0.9] text-[#1A1A1A]">
              Nâng tầm <br />
              <span className="font-serif italic text-[#7B8062]">Phong cách</span>
            </h1>
            
            <p className="text-[#8C8C8C] text-sm md:text-base max-w-md leading-relaxed font-medium">
              Khám phá sự kết hợp hoàn hảo giữa chất liệu thượng hạng và tư duy thiết kế tối giản đương đại.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <Link to="/san-pham" className="px-12 py-5 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-[0.3em] font-black hover:bg-[#7B8062] transition-all flex items-center justify-center gap-3">
                Mua sắm ngay <ArrowRight className="w-3 h-3" />
              </Link>
              <Link to="/san-pham?moi=true" className="px-12 py-5 border border-[#1A1A1A] text-[#1A1A1A] text-[11px] uppercase tracking-[0.3em] font-black hover:bg-[#1A1A1A] hover:text-white transition-all text-center">
                Hàng mới về
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/5] bg-[#F0EEE9] overflow-hidden rounded-[4rem] shadow-[0_40px_80px_rgba(0,0,0,0.03)]">
              <img 
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000" 
                alt="Fashion Editorial" 
                className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000 scale-105 hover:scale-100"
              />
              <div className="absolute bottom-10 left-10 bg-white/90 backdrop-blur p-6 rounded-3xl hidden md:block border border-[#F0EEE9]">
                <div className="flex items-center gap-4">
                  <Star className="w-4 h-4 text-[#7B8062] fill-current" />
                  <div>
                    <p className="text-sm font-serif italic text-[#1A1A1A]">4.9/5.0 Rating</p>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-[#8C8C8C] font-black">Standard Excellence</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Minimalist Icons */}
      <section className="border-b border-[#F0EEE9]">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { icon: <Truck className="w-5 h-5" />, title: 'Vận chuyển', desc: 'An toàn & Nhanh chóng' },
            { icon: <Shield className="w-5 h-5" />, title: 'Bảo hành', desc: 'Chính hãng 12 tháng' },
            { icon: <RefreshCw className="w-5 h-5" />, title: 'Đổi trả', desc: '30 ngày miễn phí' },
            { icon: <Headphones className="w-5 h-5" />, title: 'Hỗ trợ', desc: 'Tận tâm 24/7' },
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-3 group cursor-default">
              <div className="w-12 h-12 rounded-full border border-[#F0EEE9] flex items-center justify-center text-[#8C8C8C] group-hover:border-[#7B8062] group-hover:text-[#7B8062] transition-all duration-500">
                {f.icon}
              </div>
              <p className="text-[11px] uppercase tracking-[0.3em] font-black text-[#1A1A1A]">{f.title}</p>
              <p className="text-[9px] uppercase tracking-widest text-[#8C8C8C] font-bold">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories - Editorial Grid */}
      {danhMuc.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-3xl font-light tracking-tighter text-[#1A1A1A] mb-4">
              Danh mục <span className="font-serif italic text-[#7B8062]">Chọn lọc</span>
            </h2>
            <div className="w-12 h-[1px] bg-[#7B8062]"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {danhMuc.slice(0, 6).map((dm) => (
              <Link key={dm.id} to={`/danh-muc/${dm.duongDan}`}
                className="group relative aspect-[3/4] bg-white rounded-[2.5rem] border border-[#F0EEE9] flex flex-col items-center justify-center p-6 hover:shadow-2xl hover:shadow-black/5 transition-all duration-500">
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">👕</div>
                <span className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-[0.2em] text-center">{dm.tenDanhMuc}</span>
                <p className="text-[8px] uppercase tracking-widest text-[#8C8C8C] mt-2 opacity-0 group-hover:opacity-100 transition-opacity font-bold">Khám phá</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals - Modern Grid */}
      {sanPhamMoi.length > 0 && (
        <section className="bg-white py-24 border-y border-[#F0EEE9]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-16">
              <div>
                <h2 className="text-3xl font-light tracking-tighter text-[#1A1A1A]">Hàng <span className="font-serif italic text-[#7B8062]">Mới về</span></h2>
                <p className="text-[9px] uppercase tracking-[0.3em] text-[#8C8C8C] mt-2 font-black">Làn gió mới cho tủ đồ của bạn</p>
              </div>
              <Link to="/san-pham" className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A1A1A] border-b border-[#1A1A1A] pb-1 hover:text-[#7B8062] hover:border-[#7B8062] transition-all">
                Xem tất cả
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {sanPhamMoi.slice(0, 10).map(sp => (
                <div key={sp.id} className="hover:-translate-y-2 transition-transform duration-500">
                  <ProductCard sanPham={sp} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Luxury Promo Banner */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="relative bg-[#1A1A1A] rounded-[4rem] overflow-hidden grid lg:grid-cols-2 items-center shadow-2xl shadow-black/10">
          <div className="p-12 lg:p-20 text-[#FDFCFB] space-y-8">
            <span className="text-[9px] uppercase tracking-[0.5em] font-black text-[#7B8062]">Privilege Club</span>
            <h3 className="text-4xl md:text-5xl font-light tracking-tighter leading-tight">
              Đặc quyền <span className="font-serif italic text-[#7B8062]">Ưu đãi</span> <br />
              Lên tới 50%
            </h3>
            <p className="text-sm text-[#8C8C8C] font-medium leading-relaxed max-w-sm">
              Dành riêng cho thành viên hệ thống khi mua sắm bộ sưu tập Xuân Hè. Tham gia ngay để nhận bản tin phong cách.
            </p>
            <div className="pt-4">
              <Link to="/san-pham" className="inline-block bg-[#FDFCFB] text-[#1A1A1A] px-12 py-5 text-[11px] uppercase tracking-[0.3em] font-black hover:bg-[#F0EEE9] transition-all">
                Nhận ưu đãi ngay
              </Link>
            </div>
          </div>
          <div className="h-full min-h-[400px]">
            <img 
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1000" 
              alt="Promo" 
              className="w-full h-full object-cover grayscale opacity-70"
            />
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {sanPhamBanChay.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-24 pt-0">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light tracking-tighter text-[#1A1A1A]">Sản phẩm <span className="font-serif italic text-[#7B8062]">Nổi bật</span></h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {sanPhamBanChay.slice(0, 10).map(sp => (
              <div key={sp.id} className="hover:-translate-y-2 transition-transform duration-500">
                <ProductCard sanPham={sp} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Nhúng Font Playfair Display tương tự code Profile */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&display=swap');
        .font-serif { font-family: 'Playfair Display', serif !important; }
        .font-sans { font-family: 'Inter', sans-serif !important; }
      `}</style>
    </div>
  );
}