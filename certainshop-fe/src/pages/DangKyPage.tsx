import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function DangKyPage() {
  const [form, setForm] = useState({
    tenDangNhap: '', matKhau: '', xacNhanMatKhau: '',
    hoTen: '', email: '', soDienThoai: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tenDangNhap || !form.matKhau || !form.hoTen) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    
    setLoading(true);
    try {
      const res = await authApi.dangKy({
        tenDangNhap: form.tenDangNhap.trim(),
        matKhau: form.matKhau,
        xacNhanMatKhau: form.xacNhanMatKhau,
        hoTen: form.hoTen.trim(),
        email: form.email.trim(),
        soDienThoai: form.soDienThoai.trim() || undefined,
      });
      const { token, nguoiDung } = res.data.duLieu;
      setAuth(token, nguoiDung);
      toast.success('Chào mừng bạn đến với CertainShop!');
      navigate('/');
    } catch (err: any) {
      const data = err?.response?.data;
      toast.error(data?.thongBao || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex flex-col lg:flex-row font-sans text-[#1A1A1A]">
      {/* Cột trái: Hình ảnh thương hiệu */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#7B8062] items-center justify-center p-12 relative overflow-hidden">
        <div className="relative z-10 text-center">
            <h2 className="text-[#F9F7F2] font-serif italic text-6xl mb-6 tracking-normal">The Art of Living</h2>
            <p className="text-[#F9F7F2]/80 uppercase tracking-[0.4em] text-[10px] font-bold">Minimalism • Organic • Quality</p>
        </div>
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
      </div>

      {/* Cột phải: Form đăng ký */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-[#8C8C8C] hover:text-[#7B8062] transition-colors mb-10 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Quay lại cửa hàng</span>
          </Link>

          <div className="mb-10">
            <h1 className="text-4xl font-serif italic text-[#1A1A1A] mb-3 tracking-normal">Gia nhập cộng đồng</h1>
            <p className="text-[#8C8C8C] text-[13px] tracking-wide font-medium">Tạo tài khoản để nhận những ưu đãi đặc quyền nhất.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="grid grid-cols-1 gap-7">
              {/* Họ tên */}
              <div className="relative border-b border-[#E5E2D9] focus-within:border-[#7B8062] transition-colors py-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#8C8C8C] font-bold block mb-1">Họ tên *</label>
                <input type="text" value={form.hoTen} onChange={set('hoTen')}
                  placeholder="Nguyễn Văn A" className="w-full bg-transparent outline-none text-[#1A1A1A] placeholder:text-[#D1D1D1] text-sm py-2 font-medium" />
              </div>

              {/* Tên đăng nhập */}
              <div className="relative border-b border-[#E5E2D9] focus-within:border-[#7B8062] transition-colors py-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#8C8C8C] font-bold block mb-1">Tên đăng nhập *</label>
                <input type="text" value={form.tenDangNhap} onChange={set('tenDangNhap')}
                  placeholder="nguyenvana" className="w-full bg-transparent outline-none text-[#1A1A1A] text-sm py-2 font-medium" />
              </div>

              {/* Email & Số điện thoại */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                <div className="relative border-b border-[#E5E2D9] focus-within:border-[#7B8062] transition-colors py-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#8C8C8C] font-bold block mb-1">Email</label>
                  <input type="email" value={form.email} onChange={set('email')}
                    placeholder="email@example.com" className="w-full bg-transparent outline-none text-[#1A1A1A] text-sm py-2 font-medium" />
                </div>
                <div className="relative border-b border-[#E5E2D9] focus-within:border-[#7B8062] transition-colors py-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#8C8C8C] font-bold block mb-1">Điện thoại</label>
                  <input type="tel" value={form.soDienThoai} onChange={set('soDienThoai')}
                    placeholder="09xxx" className="w-full bg-transparent outline-none text-[#1A1A1A] text-sm py-2 font-medium" />
                </div>
              </div>

              {/* Mật khẩu */}
              <div className="relative border-b border-[#E5E2D9] focus-within:border-[#7B8062] transition-colors py-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#8C8C8C] font-bold block mb-1">Mật khẩu *</label>
                <div className="flex items-center">
                  <input type={showPass ? 'text' : 'password'} value={form.matKhau} onChange={set('matKhau')}
                    placeholder="••••••" className="w-full bg-transparent outline-none text-[#1A1A1A] text-sm py-2 font-medium" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="text-[#8C8C8C] hover:text-[#7B8062]">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Xác nhận mật khẩu */}
              <div className="relative border-b border-[#E5E2D9] focus-within:border-[#7B8062] transition-colors py-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#8C8C8C] font-bold block mb-1">Xác nhận mật khẩu *</label>
                <input type={showPass ? 'text' : 'password'} value={form.xacNhanMatKhau} onChange={set('xacNhanMatKhau')}
                  placeholder="••••••" className="w-full bg-transparent outline-none text-[#1A1A1A] text-sm py-2 font-medium" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#1A1A1A] text-[#F9F7F2] py-4 uppercase tracking-[0.3em] text-[11px] font-bold hover:bg-[#7B8062] transition-all duration-500 disabled:bg-[#C1C1C1] flex items-center justify-center gap-3">
              {loading ? (
                <span className="w-4 h-4 border-2 border-[#F9F7F2] border-t-transparent rounded-full animate-spin" />
              ) : <UserPlus className="w-4 h-4" />}
              {loading ? 'Đang khởi tạo...' : 'Đăng ký tài khoản'}
            </button>
          </form>

          <div className="mt-12 pt-6 border-t border-[#E5E2D9] text-center">
            <p className="text-[#8C8C8C] text-[11px] uppercase tracking-widest font-medium">
              Đã là một phần của chúng tôi?{' '}
              <Link to="/dang-nhap" className="text-[#1A1A1A] font-bold hover:text-[#7B8062] underline underline-offset-8 transition-colors ml-2">
                Đăng nhập ngay
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