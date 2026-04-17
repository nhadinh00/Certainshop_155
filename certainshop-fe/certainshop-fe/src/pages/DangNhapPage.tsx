import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function DangNhapPage() {
  const [tenDangNhap, setTenDangNhap] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenDangNhap.trim() || !matKhau.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.dangNhap(tenDangNhap.trim(), matKhau);
      const { token, nguoiDung } = res.data.duLieu;
      setAuth(token, nguoiDung);
      toast.success(`Chào mừng trở lại, ${nguoiDung.hoTen || nguoiDung.tenDangNhap}!`);
      
      if (nguoiDung.vaiTro === 'ADMIN' || nguoiDung.vaiTro === 'NHAN_VIEN') {
        navigate('/quan-ly');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.thongBao || 'Tên đăng nhập hoặc mật khẩu không đúng';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex flex-col lg:flex-row-reverse font-sans text-[#1A1A1A]">
      {/* Cột hình ảnh (Bên phải) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1A1A1A] items-center justify-center p-12 relative overflow-hidden">
        <div className="relative z-10 text-center">
            <h2 className="text-[#F9F7F2] font-serif italic text-6xl mb-6 tracking-normal">Welcome Back</h2>
            <p className="text-[#7B8062] uppercase tracking-[0.4em] text-[10px] font-bold">CertainShop Management</p>
        </div>
        <div className="absolute bottom-[-20%] left-[-10%] w-96 h-96 rounded-full bg-[#7B8062]/10 blur-3xl"></div>
      </div>

      {/* Cột Form đăng nhập */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Nút quay lại */}
          <Link to="/" className="inline-flex items-center gap-2 text-[#8C8C8C] hover:text-[#7B8062] transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Trở về trang chủ</span>
          </Link>

          <div className="mb-12 text-center lg:text-left">
            <h1 className="text-4xl font-serif italic text-[#1A1A1A] mb-3 tracking-normal">Đăng nhập</h1>
            <p className="text-[#8C8C8C] text-[13px] tracking-wide font-medium">
              Truy cập vào tài khoản cá nhân của bạn.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Tên đăng nhập */}
            <div className="relative border-b border-[#E5E2D9] focus-within:border-[#7B8062] transition-colors py-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#8C8C8C] block mb-1 font-bold">Tên người dùng</label>
              <input
                type="text"
                value={tenDangNhap}
                onChange={e => setTenDangNhap(e.target.value)}
                placeholder="Nhập tên đăng nhập của bạn"
                className="w-full bg-transparent outline-none text-[#1A1A1A] placeholder:text-[#D1D1D1] text-sm py-2 font-medium"
                autoComplete="username"
                autoFocus
              />
            </div>

            {/* Mật khẩu */}
            <div className="relative border-b border-[#E5E2D9] focus-within:border-[#7B8062] transition-colors py-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#8C8C8C] font-bold">Mật khẩu</label>
                <Link to="/quen-mat-khau" className="text-[10px] text-[#7B8062] hover:underline uppercase tracking-widest font-bold">Quên?</Link>
              </div>
              <div className="flex items-center">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={matKhau}
                  onChange={e => setMatKhau(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent outline-none text-[#1A1A1A] text-sm py-2 font-medium"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-[#8C8C8C] hover:text-[#7B8062] px-2 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1A1A1A] text-[#F9F7F2] py-4 uppercase tracking-[0.3em] text-[11px] font-bold hover:bg-[#7B8062] transition-all duration-500 disabled:bg-[#C1C1C1] flex items-center justify-center gap-3 active:scale-[0.98]">
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-[#F9F7F2] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  {loading ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống'}
                </button>
            </div>
          </form>

          <div className="mt-16 pt-8 border-t border-[#E5E2D9] text-center">
            <p className="text-[#8C8C8C] text-[11px] uppercase tracking-[0.15em] font-medium">
              Bạn mới đến đây?{' '}
              <Link to="/dang-ky" className="text-[#1A1A1A] font-bold hover:text-[#7B8062] underline underline-offset-8 transition-colors ml-2">
                Tạo tài khoản mới
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,700&display=swap');
        
        .font-serif {
          font-family: 'Playfair Display', serif !important;
        }

        .tracking-normal {
          letter-spacing: 0 !important;
        }
      `}</style>
    </div>
  );
}