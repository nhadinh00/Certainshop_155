import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tags, Ticket,
  LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const navItems = [
  { to: '/quan-ly', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/quan-ly/san-pham', label: 'Sản phẩm', icon: Package },
  { to: '/quan-ly/don-hang', label: 'Đơn hàng', icon: ShoppingCart },
  { to: '/quan-ly/nguoi-dung', label: 'Khách hàng', icon: Users },
  { to: '/quan-ly/thuoc-tinh', label: 'Thuộc tính', icon: Tags },
  { to: '/quan-ly/voucher', label: 'Voucher', icon: Ticket },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();

  return (
    <div className="flex h-screen bg-[#FDFCFB]"> {/* Nền trang giấy trắng ngà */}
      {/* Sidebar - Tối giản & Sang trọng */}
      <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-[#1A1A1A] flex flex-col transition-all duration-500 ease-in-out z-20 shadow-2xl`}>
        
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-center border-b border-[#2D2D2D] px-4">
          {!collapsed ? (
            <Link to="/" className="text-[#F9F7F2] font-serif italic text-xl tracking-tight">
              Certain<span className="text-[#7B8062] not-italic font-sans font-bold ml-1">Shop</span>
            </Link>
          ) : (
            <div className="w-8 h-8 bg-[#7B8062] rounded-sm flex items-center justify-center text-[#F9F7F2] font-bold">C</div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 px-3 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-sm transition-all duration-300 group ${
                  isActive 
                    ? 'bg-[#7B8062] text-white shadow-lg shadow-[#7B8062]/20' 
                    : 'text-[#8C8C8C] hover:text-[#F9F7F2] hover:bg-[#2D2D2D]'
                }`
              }
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110`} strokeWidth={1.5} />
              {!collapsed && (
                <span className="text-[13px] uppercase tracking-[0.15em] font-medium transition-opacity duration-300">
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse Toggle & Logout */}
        <div className="p-4 border-t border-[#2D2D2D] bg-[#151515]">
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-2 mb-2 text-[#5C5C5C] hover:text-[#F9F7F2] transition-colors"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={logout} 
            className="w-full flex items-center gap-4 px-4 py-3 text-[#8C8C8C] hover:text-[#FF6B6B] hover:bg-[#2D1D1D] transition-all duration-300 rounded-sm group"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:-translate-x-1 transition-transform" strokeWidth={1.5} />
            {!collapsed && <span className="text-[11px] uppercase tracking-widest font-bold">Hệ thống - Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header - Tinh tế */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#E5E2D9] flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <div className="h-1 w-12 bg-[#7B8062]"></div>
            <h1 className="font-serif italic text-2xl text-[#1A1A1A]">Bảng điều khiển</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-sm font-bold text-[#1A1A1A]">{user?.hoTen}</span>
              <span className="text-[10px] uppercase tracking-widest text-[#8C8C8C]">Quản trị viên</span>
            </div>
            <div className="w-10 h-10 border border-[#7B8062] p-0.5 rounded-full group cursor-pointer transition-transform hover:rotate-12">
              <div className="w-full h-full bg-[#F3F0E6] rounded-full flex items-center justify-center overflow-hidden">
                <span className="text-[#7B8062] font-bold text-sm">
                   {user?.hoTen?.[0] || 'A'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-8 lg:p-12">
          {/* Wrapper cho content để luôn có cảm giác thoáng đãng */}
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* CSS Custom Scrollbar cho Sidebar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2D2D2D; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #7B8062; }
      `}</style>
    </div>
  );
}