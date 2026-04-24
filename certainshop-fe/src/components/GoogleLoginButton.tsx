import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../services/api';

interface GoogleLoginButtonProps {
  text?: string;
  className?: string;
}

export default function GoogleLoginButton({ 
  text = 'Đăng nhập với Google', 
  className = '' 
}: GoogleLoginButtonProps) {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        // Send the credential response to backend for verification
        // The access_token is used to fetch user info from Google
        const response = await authApi.googleLogin(codeResponse.access_token);
        const { token, nguoiDung } = response.data.duLieu;
        
        // Lưu token và user info vào store
        setAuth(token, nguoiDung);
        
        toast.success(`Chào mừng, ${nguoiDung.hoTen || nguoiDung.tenDangNhap}!`);
        
        // Điều hướng tới trang thích hợp
        if (nguoiDung.vaiTro === 'ADMIN' || nguoiDung.vaiTro === 'NHAN_VIEN') {
          navigate('/quan-ly');
        } else {
          navigate('/');
        }
      } catch (error: any) {
        const msg = error?.response?.data?.thongBao || 'Đăng nhập Google thất bại';
        toast.error(msg);
        console.error('Google login error:', error);
      }
    },
    onError: () => {
      toast.error('Đăng nhập Google thất bại');
    },
    flow: 'implicit',
    prompt: 'select_account',
  });

  return (
    <button
      onClick={() => googleLogin()}
      className={`w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition ${className}`}
    >
      <svg width="20" height="20" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19c1.33-4.02 5.17-7.04 9.46-7.04z"></path>
        <path fill="#34A853" d="M46.3 24.5c0-1.3-.1-2.6-.32-3.85H24v7.3h11.5c-.5 2.72-2.2 5.02-4.6 6.56v5.7h7.44c4.3-3.97 6.76-9.8 6.76-16.71z"></path>
        <path fill="#FBBC05" d="M10.53 28.75c-.48-1.45-.76-2.99-.76-4.75s.27-3.3.76-4.75l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.03z"></path>
        <path fill="#4285F4" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.44-5.7c-2.05 1.38-4.68 2.2-8.45 2.2-6.29 0-11.66-4.27-13.39-10.02l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
      </svg>
      <span>{text}</span>
    </button>
  );
}
