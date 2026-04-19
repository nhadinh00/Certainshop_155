import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sanPhamApi } from '../services/api';
import type { SanPhamItem, DanhMuc } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';

export default function DanhMucSanPhamPage() {
  const { duongDan } = useParams<{ duongDan: string }>();
  const [sanPhamList, setSanPhamList] = useState<SanPhamItem[]>([]);
  const [danhMuc, setDanhMuc] = useState<DanhMuc | null>(null);
  const [loading, setLoading] = useState(true);
  const [trang, setTrang] = useState(0);
  const [tongTrang, setTongTrang] = useState(0);
  const [tongSoBan, setTongSoBan] = useState(0);

  useEffect(() => {
    if (!duongDan) return;
    sanPhamApi.danhMuc().then(r => {
      const dm = (r.data.duLieu || []).find(d => d.duongDan === duongDan);
      setDanhMuc(dm || null);
    });
  }, [duongDan]);

  const load = useCallback(() => {
    if (!duongDan) return;
    setLoading(true);
    sanPhamApi.sanPhamTheoDanhMuc(duongDan, trang, 12)
      .then(r => {
        const data = r.data.duLieu;
        setSanPhamList(data?.danhSach || []);
        setTongTrang(data?.tongSoTrang || 0);
        setTongSoBan(data?.tongSoBan || 0);
      })
      .finally(() => setLoading(false));
  }, [duongDan, trang]);

  useEffect(() => { setTrang(0); }, [duongDan]);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="bg-[#FDFCFB] min-h-screen font-sans text-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        
        {/* Breadcrumb - Tinh tế & Mảnh */}
        <nav className="flex items-center gap-4 text-[10px] uppercase tracking-[0.25em] text-[#8C8C8C] mb-16 font-bold">
          <Link to="/" className="hover:text-[#7B8062] transition-colors flex items-center gap-1.5">
            <Home className="w-3 h-3" strokeWidth={2} /> Trang chủ
          </Link>
          <span className="text-[#E5E2D9] font-light">/</span>
          <Link to="/san-pham" className="hover:text-[#7B8062] transition-colors">Cửa hàng</Link>
          {danhMuc && (
            <>
              <span className="text-[#E5E2D9] font-light">/</span>
              <span className="text-[#1A1A1A]">{danhMuc.tenDanhMuc}</span>
            </>
          )}
        </nav>

        {/* Header - Typography Serif & Trục dọc xanh đặc trưng */}
        <div className="relative mb-20 border-l-[3px] border-[#7B8062] pl-10">
          <h1 className="text-5xl md:text-6xl font-serif italic text-[#1A1A1A] leading-tight tracking-tight">
            {danhMuc?.tenDanhMuc || 'Bộ sưu tập'}
          </h1>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-6">
            {danhMuc?.moTa && (
              <p className="text-[#8C8C8C] text-[15px] max-w-2xl leading-relaxed font-medium italic opacity-80">
                "{danhMuc.moTa}"
              </p>
            )}
            {!loading && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#C1C1C1] font-black">
                  Số lượng tác phẩm
                </span>
                <span className="text-2xl font-serif italic text-[#7B8062]">
                  {tongSoBan.toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="py-32 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : sanPhamList.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-16">
              {sanPhamList.map(sp => (
                <ProductCard key={sp.id} sanPham={sp} />
              ))}
            </div>

            {/* Pagination - Minimalist Luxury */}
            {tongTrang > 1 && (
              <div className="flex items-center justify-center gap-12 mt-24 pt-12 border-t border-[#F0EEE9]">
                <button
                  disabled={trang === 0}
                  onClick={() => {
                    setTrang(t => t - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group flex items-center gap-2 text-[10px] uppercase tracking-widest font-black disabled:opacity-20 hover:text-[#7B8062] transition-all"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" strokeWidth={1} />
                  Trước
                </button>

                <div className="flex items-center gap-8">
                  {Array.from({ length: tongTrang }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setTrang(i);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`text-[11px] tracking-[0.2em] font-bold transition-all duration-500 relative ${
                        trang === i 
                          ? 'text-[#1A1A1A] after:content-[""] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-[1px] after:bg-[#1A1A1A]' 
                          : 'text-[#C1C1C1] hover:text-[#1A1A1A]'
                      }`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </button>
                  ))}
                </div>

                <button
                  disabled={trang >= tongTrang - 1}
                  onClick={() => {
                    setTrang(t => t + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group flex items-center gap-2 text-[10px] uppercase tracking-widest font-black disabled:opacity-20 hover:text-[#7B8062] transition-all"
                >
                  Sau
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={1} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-40 bg-[#F9F7F2]/50 border border-dashed border-[#E5E2D9] rounded-sm">
            <span className="text-5xl block mb-8 font-serif italic opacity-20 text-[#1A1A1A]">The Void</span>
            <p className="text-[#8C8C8C] text-[11px] uppercase tracking-[0.4em] mb-10 font-bold">Chưa có sản phẩm trong bộ sưu tập này</p>
            <Link to="/san-pham" className="inline-block text-[#1A1A1A] text-[10px] uppercase tracking-[0.3em] font-black border-b border-[#1A1A1A] pb-3 hover:text-[#7B8062] hover:border-[#7B8062] transition-all">
              Khám phá tất cả sản phẩm
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif !important; }
        .tracking-tight { letter-spacing: -0.02em !important; }
      `}</style>
    </div>
  );
}