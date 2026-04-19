import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

export default function DatLaiMatKhauPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [matKhauMoi, setMatKhauMoi] = useState('');
  const [xacNhan, setXacNhan] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [thanhCong, setThanhCong] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (matKhauMoi.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (matKhauMoi !== xacNhan) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (!token) {
      toast.error('Liên kết không hợp lệ');
      return;
    }
    setLoading(true);
    try {
      await authApi.datLaiMatKhau(token, matKhauMoi);
      setThanhCong(true);
      toast.success('Đặt lại mật khẩu thành công!');
    } catch (err: any) {
      const msg = err?.response?.data?.thongBao || 'Có lỗi xảy ra';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-medium text-[#1A1A1A] mb-4">Liên kết không hợp lệ</h1>
          <p className="text-[#8C8C8C] text-sm mb-6">Vui lòng kiểm tra lại email hoặc yêu cầu đặt lại mật khẩu mới.</p>
          <Link to="/quen-mat-khau" className="text-[#7B8062] font-bold text-sm hover:underline uppercase tracking-widest">
            Yêu cầu đặt lại mật khẩu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Link to="/dang-nhap" className="inline-flex items-center gap-2 text-[#8C8C8C] hover:text-[#1A1A1A] text-xs uppercase tracking-[0.2em] font-bold transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Quay lại đăng nhập
          </Link>
        </div>

        <div className="bg-white border border-[#E5E2D9] p-10 shadow-sm">
          {thanhCong ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-[#7B8062]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#7B8062]" />
              </div>
              <h2 className="text-lg font-medium text-[#1A1A1A] mb-2">Đặt lại mật khẩu thành công!</h2>
              <p className="text-[#8C8C8C] text-sm mb-6">
                Bạn có thể đăng nhập bằng mật khẩu mới.
              </p>
              <button
                onClick={() => navigate('/dang-nhap')}
                className="bg-[#1A1A1A] text-[#F9F7F2] py-3 px-8 uppercase tracking-[0.3em] text-[11px] font-bold hover:bg-[#7B8062] transition-all duration-500 active:scale-[0.98]"
              >
                Đi đến đăng nhập
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-light text-[#1A1A1A] mb-2 tracking-wide text-center">Đặt lại mật khẩu</h1>
              <p className="text-[#8C8C8C] text-sm text-center mb-8">
                Nhập mật khẩu mới cho tài khoản của bạn
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Mật khẩu mới */}
                <div className="border-b border-[#E5E2D9] focus-within:border-[#7B8062] transition-colors py-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#8C8C8C] font-bold block mb-1">Mật khẩu mới</label>
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 text-[#8C8C8C] mr-2" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={matKhauMoi}
                      onChange={e => setMatKhauMoi(e.target.value)}
                      placeholder="Ít nhất 6 ký tự"
                      className="w-full bg-transparent outline-none text-[#1A1A1A] placeholder:text-[#D1D1D1] text-sm py-2 font-medium"
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="text-[#8C8C8C] hover:text-[#7B8062] px-2 transition-colors">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Xác nhận mật khẩu */}
                <div className="border-b border-[#E5E2D9] focus-within:border-[#7B8062] transition-colors py-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#8C8C8C] font-bold block mb-1">Xác nhận mật khẩu</label>
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 text-[#8C8C8C] mr-2" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={xacNhan}
                      onChange={e => setXacNhan(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      className="w-full bg-transparent outline-none text-[#1A1A1A] placeholder:text-[#D1D1D1] text-sm py-2 font-medium"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-[#8C8C8C] hover:text-[#7B8062] px-2 transition-colors">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1A1A1A] text-[#F9F7F2] py-4 uppercase tracking-[0.3em] text-[11px] font-bold hover:bg-[#7B8062] transition-all duration-500 disabled:bg-[#C1C1C1] flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-[#F9F7F2] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
