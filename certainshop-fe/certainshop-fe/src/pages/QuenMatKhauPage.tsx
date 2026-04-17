import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

export default function QuenMatKhauPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [daGui, setDaGui] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Vui lòng nhập email');
      return;
    }
    setLoading(true);
    try {
      await authApi.quenMatKhau(email.trim());
      setDaGui(true);
      toast.success('Liên kết đặt lại mật khẩu đã được gửi!');
    } catch (err: any) {
      const msg = err?.response?.data?.thongBao || 'Có lỗi xảy ra';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-light text-[#1A1A1A] mb-2 tracking-wide text-center">Quên mật khẩu</h1>
          <p className="text-[#8C8C8C] text-sm text-center mb-8">
            Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu
          </p>

          {daGui ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-[#7B8062]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-[#7B8062]" />
              </div>
              <h2 className="text-lg font-medium text-[#1A1A1A] mb-2">Kiểm tra hộp thư</h2>
              <p className="text-[#8C8C8C] text-sm mb-6">
                Chúng tôi đã gửi liên kết đặt lại mật khẩu đến <strong className="text-[#1A1A1A]">{email}</strong>.
                <br />Liên kết sẽ hết hạn sau 30 phút.
              </p>
              <button
                onClick={() => { setDaGui(false); setEmail(''); }}
                className="text-[#7B8062] text-sm font-bold hover:underline uppercase tracking-widest"
              >
                Gửi lại
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-[#E5E2D9] focus-within:border-[#7B8062] transition-colors py-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#8C8C8C] font-bold block mb-1">Email</label>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-[#8C8C8C] mr-2" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-transparent outline-none text-[#1A1A1A] placeholder:text-[#D1D1D1] text-sm py-2 font-medium"
                    autoFocus
                  />
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
                  <Mail className="w-4 h-4" />
                )}
                {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
