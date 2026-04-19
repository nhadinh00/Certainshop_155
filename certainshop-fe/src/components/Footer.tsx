import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#F9F7F2] text-[#1A1A1A] mt-20 border-t border-[#E5E2D9]">
      <div className="max-w-7xl mx-auto px-4 py-16">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* BRAND */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 border border-[#1A1A1A] flex items-center justify-center">
                <span className="font-serif italic text-lg">C</span>
              </div>
              <span className="font-serif italic text-xl">
                CertainShop
              </span>
            </div>

            <p className="text-[13px] text-[#8C8C8C] leading-relaxed">
              Phong cách tối giản, chất lượng chọn lọc.  
              Nâng tầm trải nghiệm sống hiện đại.
            </p>
          </div>

          {/* PRODUCTS */}
          <div>
            <h3 className="text-[11px] uppercase tracking-widest mb-4 text-[#8C8C8C]">
              Sản phẩm
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/san-pham" className="hover:text-[#7B8062] transition-colors">
                  Tất cả sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/danh-muc/ao" className="hover:text-[#7B8062] transition-colors">
                  Áo
                </Link>
              </li>
              <li>
                <Link to="/danh-muc/quan" className="hover:text-[#7B8062] transition-colors">
                  Quần
                </Link>
              </li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h3 className="text-[11px] uppercase tracking-widest mb-4 text-[#8C8C8C]">
              Hỗ trợ
            </h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-[#7B8062]">Chính sách đổi trả</a></li>
              <li><a href="#" className="hover:text-[#7B8062]">Hướng dẫn mua hàng</a></li>
              <li><a href="#" className="hover:text-[#7B8062]">Liên hệ</a></li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-[11px] uppercase tracking-widest mb-4 text-[#8C8C8C]">
              Liên hệ
            </h3>
            <ul className="space-y-3 text-sm text-[#1A1A1A]">
              <li>📞 0123 456 789</li>
              <li>✉️ support@certainshop.vn</li>
              <li>📍 Hồ Chí Minh, Việt Nam</li>
            </ul>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="mt-12 pt-6 border-t border-[#E5E2D9] text-center text-[11px] uppercase tracking-widest text-[#8C8C8C]">
          © 2025 CertainShop. All rights reserved.
        </div>

      </div>
    </footer>
  );
}