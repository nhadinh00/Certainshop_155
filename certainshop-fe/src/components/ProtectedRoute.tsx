import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
  onlyKhachHang?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false, onlyKhachHang = false }: Props) {
  const auth = useAuthStore();
  const location = useLocation();

  // Kiểm tra nếu store đang trong trạng thái load dữ liệu từ LocalStorage
  // Nếu bạn chưa có biến isInitialized, hãy bỏ qua check này hoặc thêm vào store
  if (auth.hasOwnProperty('isInitialized') && !(auth as any).isInitialized) {
    return <LoadingSpinner fullPage text="Đang xác thực..." />;
  }

  if (!auth.isLoggedIn()) {
    // Redirect về đăng nhập và lưu lại trang đang xem
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
  }

  const checkIsAdmin = auth.isNhanVien();

  if (requireAdmin && !checkIsAdmin) {
    return <Navigate to="/" replace />;
  }

  if (onlyKhachHang && checkIsAdmin) {
    return <Navigate to="/quan-ly" replace />;
  }

  return <>{children}</>;
}