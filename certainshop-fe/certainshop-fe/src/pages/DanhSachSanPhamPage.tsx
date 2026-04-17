import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { sanPhamApi } from '../services/api';
import type { SanPhamItem, DanhMuc, ThuongHieu } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DanhSachSanPhamPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sanPham, setSanPham] = useState<SanPhamItem[]>([]);
  const [danhMuc, setDanhMuc] = useState<DanhMuc[]>([]);
  const [thuongHieu, setThuongHieu] = useState<ThuongHieu[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);

  const tuKhoa = searchParams.get('q') || '';
  const danhMucId = searchParams.get('danhMuc') ? Number(searchParams.get('danhMuc')) : undefined;
  const thuongHieuId = searchParams.get('thuongHieu') ? Number(searchParams.get('thuongHieu')) : undefined;
  const trang = Number(searchParams.get('trang') || 0);

  useEffect(() => {
    sanPhamApi.danhMuc().then(r => setDanhMuc(r.data.duLieu || []));
    sanPhamApi.thuongHieu().then(r => setThuongHieu(r.data.duLieu || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    sanPhamApi.danhSach({ tuKhoa, danhMucId, thuongHieuId, trang, kichThuocTrang: 20 })
      .then(r => {
        const data = r.data.duLieu;
        setSanPham(data?.danhSach || []);
        setTotalPages(data?.tongSoTrang || 0);
        setTotalElements(data?.tongSoBan || 0);
      })
      .finally(() => setLoading(false));
  }, [tuKhoa, danhMucId, thuongHieuId, trang]);

  const setFilter = (key: string, value: string | null) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('trang');
    setSearchParams(p);
  };

  return (
    <div className="bg-[#FDFCFB] min-h-screen font-sans text-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8 border-b border-[#F0EEE9] pb-12">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif italic text-[#1A1A1A] tracking-tight">
              {tuKhoa ? `Kết quả cho: "${tuKhoa}"` : 'Thế giới Tinh tuyển'}
            </h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#8C8C8C] font-bold">
              Khám phá {totalElements.toString().padStart(2, '0')} tác phẩm thiết kế đương đại
            </p>
          </div>
          
          <button 
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-3 px-8 py-4 bg-[#1A1A1A] text-[#F9F7F2] text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#7B8062] transition-all duration-500 lg:hidden shadow-sm"
          >
            <Filter className="w-3 h-3" strokeWidth={3} /> Lọc sản phẩm
          </button>
        </header>

        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Sidebar Filters */}
          <aside className={`w-full lg:w-64 flex-shrink-0 space-y-14 ${filterOpen ? 'block' : 'hidden lg:block'}`}>
            
            {/* Filter Group: Danh mục */}
            <section>
              <h3 className="text-[11px] uppercase tracking-[0.25em] font-black text-[#1A1A1A] mb-8 flex items-center gap-3">
                <span className="w-6 h-[1px] bg-[#7B8062]"></span> Danh mục
              </h3>
              <ul className="space-y-4">
                <li>
                  <button onClick={() => setFilter('danhMuc', null)}
                    className={`text-[12px] tracking-widest uppercase transition-all duration-300 ${!danhMucId ? 'text-[#7B8062] font-black border-b border-[#7B8062] pb-1' : 'text-[#8C8C8C] hover:text-[#1A1A1A]'}`}>
                    Tất cả
                  </button>
                </li>
                {danhMuc.map(dm => (
                  <li key={dm.id}>
                    <button onClick={() => setFilter('danhMuc', String(dm.id))}
                      className={`text-[12px] tracking-widest uppercase transition-all duration-300 ${danhMucId === dm.id ? 'text-[#7B8062] font-black border-b border-[#7B8062] pb-1' : 'text-[#8C8C8C] hover:text-[#1A1A1A]'}`}>
                      {dm.tenDanhMuc}
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {/* Filter Group: Thương hiệu */}
            {thuongHieu.length > 0 && (
              <section>
                <h3 className="text-[11px] uppercase tracking-[0.25em] font-black text-[#1A1A1A] mb-8 flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-[#7B8062]"></span> Thương hiệu
                </h3>
                <ul className="space-y-4">
                  <li>
                    <button onClick={() => setFilter('thuongHieu', null)}
                      className={`text-[12px] tracking-widest uppercase transition-all duration-300 ${!thuongHieuId ? 'text-[#7B8062] font-black border-b border-[#7B8062] pb-1' : 'text-[#8C8C8C] hover:text-[#1A1A1A]'}`}>
                      Tất cả nhãn hàng
                    </button>
                  </li>
                  {thuongHieu.map(th => (
                    <li key={th.id}>
                      <button onClick={() => setFilter('thuongHieu', String(th.id))}
                        className={`text-[12px] tracking-widest uppercase transition-all duration-300 ${thuongHieuId === th.id ? 'text-[#7B8062] font-black border-b border-[#7B8062] pb-1' : 'text-[#8C8C8C] hover:text-[#1A1A1A]'}`}>
                        {th.tenThuongHieu}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Reset Filters */}
            {(danhMucId || thuongHieuId || tuKhoa) && (
              <button 
                onClick={() => { setSearchParams({}); setFilterOpen(false); }}
                className="w-full py-4 border border-[#E5E2D9] text-[10px] uppercase tracking-[0.3em] font-black text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F9F7F2] transition-all duration-500 flex items-center justify-center gap-3"
              >
                <X className="w-3 h-3" strokeWidth={3} /> Xóa lọc
              </button>
            )}
          </aside>

          {/* Main Content: Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="h-96 flex items-center justify-center"><LoadingSpinner /></div>
            ) : sanPham.length === 0 ? (
              <div className="text-center py-32 bg-[#F9F7F2]/30 border border-dashed border-[#E5E2D9] rounded-sm">
                <Search className="w-12 h-12 text-[#E5E2D9] mx-auto mb-6" strokeWidth={1} />
                <p className="font-serif italic text-2xl text-[#1A1A1A] mb-4">Mảnh ghép còn thiếu</p>
                <p className="text-[#8C8C8C] text-[11px] uppercase tracking-[0.2em] mb-8 font-medium">Không tìm thấy sản phẩm phù hợp với yêu cầu của bạn</p>
                <button onClick={() => setSearchParams({})} className="text-[10px] uppercase tracking-[0.3em] font-black text-[#7B8062] border-b border-[#7B8062] pb-2 hover:opacity-60 transition-all">
                  Quay lại bộ sưu tập chính
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-20">
                  {sanPham.map(sp => (
                    <ProductCard key={sp.id} sanPham={sp} />
                  ))}
                </div>

                {/* Pagination: Minimalist Luxury */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-12 mt-24 pt-12 border-t border-[#F0EEE9]">
                    <button
                      disabled={trang === 0}
                      onClick={() => { setFilter('trang', String(trang - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-black disabled:opacity-20 hover:text-[#7B8062] transition-all"
                    >
                      <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" strokeWidth={1} />
                      Trang trước
                    </button>
                    
                    <div className="flex gap-8 items-center">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button key={i}
                          onClick={() => { setFilter('trang', String(i)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className={`text-[11px] tracking-[0.25em] font-bold transition-all relative ${i === trang ? 'text-[#1A1A1A] after:content-[""] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-[1px] after:bg-[#1A1A1A]' : 'text-[#C1C1C1] hover:text-[#1A1A1A]'}`}>
                          {(i + 1).toString().padStart(2, '0')}
                        </button>
                      ))}
                    </div>

                    <button
                      disabled={trang >= totalPages - 1}
                      onClick={() => { setFilter('trang', String(trang + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-black disabled:opacity-20 hover:text-[#7B8062] transition-all"
                    >
                      Trang sau
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={1} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif !important; }
        .tracking-tight { letter-spacing: -0.01em !important; }
      `}</style>
    </div>
  );
}