import { Link } from 'react-router-dom';
import type { SanPhamItem } from '../services/api';
import { formatCurrency, getImageUrl, handleImgError } from '../utils/format';

interface Props {
  sanPham: SanPhamItem;
}

export default function ProductCard({ sanPham }: Props) {
  const isGiamGia = sanPham.giaGoc > sanPham.giaBan;

  return (
    <Link to={`/san-pham/${sanPham.duongDan}`}
      className="group bg-transparent flex flex-col transition-all duration-500">
      
      {/* Container Ảnh - Tối giản, bỏ bo góc tròn lớn, dùng border rất mảnh */}
      <div className="relative overflow-hidden bg-[#F3F0E6] aspect-[3/4] border border-[#E5E2D9]">
        <img
          src={getImageUrl(sanPham.anhChinh)}
          alt={sanPham.tenSanPham}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          onError={handleImgError}
        />
        
        {/* Overlay nút "Xem chi tiết" - Thay màu Indigo bằng mảng màu mờ nhẹ */}
        <div className="absolute inset-0 bg-[#1A1A1A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-[#F9F7F2] text-[#1A1A1A] text-[10px] uppercase tracking-[0.2em] font-bold px-6 py-3 shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
             Xem chi tiết
          </div>
        </div>

        {/* Badge Trạng thái - Nhỏ gọn, tinh tế */}
        {sanPham.trangThaiSanPham === 'HET_HANG' ? (
          <div className="absolute top-0 left-0 bg-[#2D2D2D]/80 text-[#F9F7F2] text-[9px] uppercase tracking-widest px-3 py-1.5">
            Hết hàng
          </div>
        ) : isGiamGia && (
          <div className="absolute top-0 right-0 bg-[#7B8062] text-white text-[9px] uppercase tracking-widest px-3 py-1.5">
            Sale
          </div>
        )}
      </div>

      {/* Thông tin sản phẩm - Typography là chìa khóa */}
      <div className="py-5 flex flex-col items-center text-center">
        {sanPham.danhMuc && (
          <span className="text-[10px] text-[#8C8C8C] uppercase tracking-[0.15em] mb-2 font-medium">
            {sanPham.danhMuc.tenDanhMuc}
          </span>
        )}
        
        <h3 className="text-sm font-serif italic text-[#1A1A1A] line-clamp-1 mb-2 group-hover:text-[#7B8062] transition-colors duration-300">
          {sanPham.tenSanPham}
        </h3>

        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#1A1A1A]">
            {formatCurrency(sanPham.giaBan)}
          </span>
          {isGiamGia && (
            <span className="text-[11px] text-[#C1C1C1] line-through font-light">
              {formatCurrency(sanPham.giaGoc)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}