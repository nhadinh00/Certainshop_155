import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { gioHangApi, sanPhamApi } from '../services/api';
import type { DanhMuc } from '../services/api';

export default function Header() {
  const { user, logout, isLoggedIn, isNhanVien } = useAuthStore();
  const { count, setCount } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [danhMuc, setDanhMuc] = useState<DanhMuc[]>([]);
  const [tuKhoa, setTuKhoa] = useState('');

  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sanPhamApi.danhMuc()
      .then(r => setDanhMuc(r.data.duLieu || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isLoggedIn() || isNhanVien()) {
      setCount(0);
      return;
    }

    gioHangApi.lay()
      .then(r => {
        const items = r.data.duLieu?.danhSachChiTiet;
        setCount(items ? items.length : 0);
      })
      .catch(() => {});
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/dang-nhap');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (tuKhoa.trim()) {
      navigate(`/tim-kiem?q=${encodeURIComponent(tuKhoa.trim())}`);
      setTuKhoa('');
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-[#F9F7F2]/80 border-b border-[#E5E2D9]">
      <div className="max-w-7xl mx-auto px-4">

        {/* MAIN */}
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 min-w-[180px]">
            <div className="w-10 h-10 border border-black flex items-center justify-center">
              <span className="font-serif italic text-xl">C</span>
            </div>
            <span className="font-serif italic text-2xl text-black">
              CertainShop
            </span>
          </Link>

          {/* SEARCH */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-6 hidden md:block">
            <div className="relative bg-white border border-[#E5E2D9] rounded-full px-4 py-2 shadow-sm focus-within:border-[#7B8062]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={tuKhoa}
                onChange={e => setTuKhoa(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-8 pr-2 py-1 bg-transparent outline-none text-sm"
              />
            </div>
          </form>

          {/* ACTIONS */}
          <div className="flex items-center gap-5 min-w-[180px] justify-end">

            {/* CART */}
            <Link to="/gio-hang" className="relative group">
              <ShoppingCart className="w-5 h-5 text-black group-hover:scale-110 transition" />

              {count > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 text-[10px] bg-black text-white flex items-center justify-center rounded-full">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>

            {/* USER */}
            {isLoggedIn() ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-[#EFEDE6] transition"
                >
                  <div className="w-8 h-8 rounded-full border flex items-center justify-center text-sm">
                    {(user?.hoTen || user?.tenDangNhap || 'U').charAt(0).toUpperCase()}
                  </div>

                  <span className="hidden md:block text-[11px] uppercase tracking-widest">
                    {user?.hoTen || user?.tenDangNhap}
                  </span>

                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border shadow-md py-2 rounded-md">

                    <Link to="/tai-khoan/thong-tin"
                      className="block px-4 py-2 text-sm hover:bg-gray-100">
                      Tài khoản của tôi
                    </Link>

                    {!isNhanVien() && (
                      <Link to="/don-hang-cua-toi"
                        className="block px-4 py-2 text-sm hover:bg-gray-100">
                        Đơn hàng của tôi
                      </Link>
                    )}

                    {isNhanVien() && (
                      <Link to="/quan-ly"
                        className="block px-4 py-2 text-sm hover:bg-gray-100">
                        Quản lý
                      </Link>
                    )}

                    <div className="border-t my-2" />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4 text-[11px] uppercase tracking-widest">
                <Link to="/dang-nhap" className="text-gray-500 hover:text-black">
                  Đăng nhập
                </Link>
                <Link to="/dang-ky" className="border-b border-black hover:text-[#7B8062]">
                  Đăng ký
                </Link>
              </div>
            )}

            {/* MOBILE */}
            <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* NAV */}
        <nav className="hidden lg:flex gap-8 py-4 text-[12px] uppercase tracking-wider text-gray-500 border-t">
          <Link to="/" className="hover:text-black transition">Trang chủ</Link>

          <Link to="/san-pham" className="hover:text-black font-medium text-black">
            Tất cả sản phẩm
          </Link>

          {danhMuc.slice(0, 6).map(dm => (
            <Link
              key={dm.id}
              to={`/danh-muc/${dm.duongDan}`}
              className="relative group hover:text-black transition"
            >
              {dm.tenDanhMuc}
              <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-black group-hover:w-full transition-all"></span>
            </Link>
          ))}
        </nav>

        {/* MOBILE MENU */}
        {menuOpen && (
          <nav className="lg:hidden border-t py-3 flex flex-col gap-2 text-sm">
            <Link to="/" onClick={() => setMenuOpen(false)}>Trang chủ</Link>
            <Link to="/san-pham" onClick={() => setMenuOpen(false)}>Tất cả sản phẩm</Link>

            {danhMuc.map(dm => (
              <Link
                key={dm.id}
                to={`/danh-muc/${dm.duongDan}`}
                onClick={() => setMenuOpen(false)}
              >
                {dm.tenDanhMuc}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}