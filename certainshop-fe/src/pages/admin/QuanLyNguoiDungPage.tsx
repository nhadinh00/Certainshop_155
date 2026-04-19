import { useState, useEffect, useCallback } from 'react';
import { Search, UserCheck, UserX, Shield, Eye, Plus, Pencil, X, Users } from 'lucide-react';
import { adminApi } from '../../services/api';
import type { NguoiDungAdmin } from '../../services/api';
import { formatDate } from '../../utils/format';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuthStore } from '../../stores/authStore';

type ModalMode = null | 'detail' | 'create' | 'edit';

export default function QuanLyNguoiDungPage() {
  const [danhSach, setDanhSach] = useState<NguoiDungAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [tuKhoa, setTuKhoa] = useState('');
  const [trang, setTrang] = useState(0);
  const [tongTrang, setTongTrang] = useState(0);
  const [tabVaiTro, setTabVaiTro] = useState<string>('');
  const [tabTrangThai, setTabTrangThai] = useState<string>('');
  const { isAdmin } = useAuthStore();

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedUser, setSelectedUser] = useState<NguoiDungAdmin | null>(null);
  const [formData, setFormData] = useState({ tenDangNhap: '', matKhau: '', hoTen: '', email: '', soDienThoai: '' });
  const [submitting, setSubmitting] = useState(false);

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: '', message: '', onConfirm: () => {} });

  const load = useCallback(() => {
    setLoading(true);
    const dangHoatDong = tabTrangThai === '' ? undefined : tabTrangThai === 'true';
    adminApi.danhSachNguoiDung({ tuKhoa: tuKhoa || undefined, trang, tenVaiTro: tabVaiTro || undefined, dangHoatDong })
      .then(r => {
        setDanhSach(r.data.duLieu?.nguoiDung || []);
        setTongTrang(r.data.duLieu?.tongTrang || 0);
      })
      .finally(() => setLoading(false));
  }, [tuKhoa, trang, tabVaiTro, tabTrangThai]);

  useEffect(() => { load(); }, [load]);

  // ====== Actions ======

  const handleToggleActive = (u: NguoiDungAdmin) => {
    const action = u.dangHoatDong ? 'khóa' : 'mở khóa';
    const roleName = u.vaiTro?.tenVaiTro === 'NHAN_VIEN' ? 'nhân viên' : 'khách hàng';
    setConfirmDialog({
      open: true,
      title: u.dangHoatDong ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa',
      message: `Bạn có chắc chắn muốn ${action} tài khoản ${roleName} "${u.hoTen}"?`,
      onConfirm: async () => {
        try {
          await adminApi.doiTrangThaiNguoiDung(u.id, !u.dangHoatDong);
          toast.success(u.dangHoatDong ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
          load();
        } catch {
          toast.error('Có lỗi xảy ra');
        }
        setConfirmDialog(prev => ({ ...prev, open: false }));
      },
    });
  };

  const handleDoiVaiTro = (u: NguoiDungAdmin, vaiTroId: number) => {
    const newRole = vaiTroId === 2 ? 'Nhân viên' : 'Khách hàng';
    setConfirmDialog({
      open: true,
      title: 'Xác nhận đổi vai trò',
      message: `Bạn có chắc chắn muốn đổi vai trò của "${u.hoTen}" thành ${newRole}?`,
      onConfirm: async () => {
        try {
          await adminApi.doiVaiTroNguoiDung(u.id, vaiTroId);
          toast.success('Đã đổi vai trò');
          load();
        } catch {
          toast.error('Có lỗi xảy ra');
        }
        setConfirmDialog(prev => ({ ...prev, open: false }));
      },
    });
  };

  const openDetail = (u: NguoiDungAdmin) => {
    setSelectedUser(u);
    setModalMode('detail');
  };

  const openCreate = () => {
    setFormData({ tenDangNhap: '', matKhau: '', hoTen: '', email: '', soDienThoai: '' });
    setModalMode('create');
  };

  const openEdit = (u: NguoiDungAdmin) => {
    setSelectedUser(u);
    setFormData({ tenDangNhap: u.tenDangNhap, matKhau: '', hoTen: u.hoTen || '', email: u.email || '', soDienThoai: u.soDienThoai || '' });
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedUser(null);
  };

  const handleCreateSubmit = async () => {
    if (!formData.tenDangNhap || !formData.matKhau || !formData.hoTen || !formData.email) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.taoNhanVien({
        tenDangNhap: formData.tenDangNhap,
        matKhau: formData.matKhau,
        hoTen: formData.hoTen,
        email: formData.email,
        soDienThoai: formData.soDienThoai || undefined,
      });
      toast.success('Tạo nhân viên thành công');
      closeModal();
      load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { thongDiep?: string } } })?.response?.data?.thongDiep || 'Có lỗi xảy ra';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedUser || !formData.hoTen || !formData.email) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.capNhatNguoiDung(selectedUser.id, {
        hoTen: formData.hoTen,
        email: formData.email,
        soDienThoai: formData.soDienThoai || undefined,
      });
      toast.success('Cập nhật thành công');
      closeModal();
      load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { thongDiep?: string } } })?.response?.data?.thongDiep || 'Có lỗi xảy ra';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ====== Helpers ======

  const vaiTroLabel = (vt: NguoiDungAdmin['vaiTro']) => {
    const ten = vt?.tenVaiTro || '';
    if (ten === 'ADMIN') return <span className="badge badge-red text-xs">Admin</span>;
    if (ten === 'NHAN_VIEN') return <span className="badge badge-blue text-xs">Nhân viên</span>;
    if (ten === 'KHACH_HANG') return <span className="badge badge-gray text-xs">Khách hàng</span>;
    return <span className="badge badge-gray text-xs">{ten || 'Không xác định'}</span>;
  };

  const getTenVaiTro = (u: NguoiDungAdmin) => u.vaiTro?.tenVaiTro || '';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="mb-10">
  <h2 className="text-3xl font-light tracking-tighter text-[#1A1A1A]">
    Quản lý <span className="font-serif italic text-[#7B8062]">người dùng</span>
  </h2>
  <div className="w-10 h-[1px] bg-[#7B8062] mt-3"></div>
</div>
        {isAdmin() && (
          <button
  onClick={openCreate}
  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium
  bg-gradient-to-r from-[#7B8062] to-[#9CA986]
  text-white rounded-xl shadow-sm
  hover:shadow-md hover:scale-[1.02]
  active:scale-[0.98]
  transition-all duration-200"
>
  <Plus className="w-4 h-4" />
  Thêm nhân viên
</button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#F0EEE9] rounded-[2rem] p-4 mb-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input-field pl-9 text-sm" placeholder="Tìm tên, email, SĐT..."
              value={tuKhoa} onChange={e => { setTuKhoa(e.target.value); setTrang(0); }} />
          </div>
          <div className="flex items-center gap-1 ml-auto">
            {[
              { label: 'Tất cả', value: '' },
              { label: 'Khách hàng', value: 'KHACH_HANG' },
              { label: 'Nhân viên', value: 'NHAN_VIEN' },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => { setTabVaiTro(tab.value); setTrang(0); }}
                className={`px-3 py-1.5 text-sm rounded-full font-medium transition-all ${
                  tabVaiTro === tab.value
                    ? 'bg-[#F7F6F2] text-gray-500 hover:bg-[#ECEAE4]'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {/* Status filter */}
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">Trạng thái:</span>
          {[
            { label: 'Tất cả', value: '' },
            { label: 'Đang hoạt động', value: 'true' },
            { label: 'Đã khóa', value: 'false' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => { setTabTrangThai(tab.value); setTrang(0); }}
              className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
                tabTrangThai === tab.value
                  ? 'bg-[#7B8062] text-white'
                  : 'bg-[#F7F6F2] text-gray-500 hover:bg-[#ECEAE4]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner /> : (
        <div className="bg-white border border-[#F0EEE9] rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
          <table className="w-full text-sm">
            <thead className="bg-[#FDFCFB] border-b border-[#F0EEE9]">
              <tr>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.25em] text-[#8C8C8C] font-semibold">Người dùng</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.25em] text-[#8C8C8C] font-semibold">Liên hệ</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.25em] text-[#8C8C8C] font-semibold">Vai trò</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.25em] text-[#8C8C8C] font-semibold">Ngày tạo</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.25em] text-[#8C8C8C] font-semibold">Trạng thái</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.25em] text-[#8C8C8C] font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {danhSach.map(u => (
                <tr
  key={u.id}
  className="group transition-all duration-300 hover:bg-[#F7F6F2] hover:shadow-sm"
>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#F7F6F2] rounded-full flex items-center justify-center flex-shrink-0 border border-[#F0EEE9]">
                        <span className="text-[#7B8062] font-semibold text-sm">{u.hoTen?.[0] || '?'}</span>
                      </div>
                      <div>
                        <span className="text-[#1A1A1A] font-medium tracking-tight">{u.hoTen}</span>
                        <p className="text-[11px] text-[#8C8C8C] tracking-wide">@{u.tenDangNhap}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{u.email}</p>
                    <p className="text-gray-400 text-xs">{u.soDienThoai}</p>
                  </td>
                  <td className="px-4 py-3">{vaiTroLabel(u.vaiTro)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(u.thoiGianTao)}</td>
                  <td className="px-4 py-3">
                    {u.dangHoatDong ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EEF1E8] text-[#7B8062]">Hoạt động</span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FDECEC] text-red-500">Bị khóa</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openDetail(u)}
                        title="Xem chi tiết"
                        className="p-2 rounded-full text-gray-400 hover:bg-[#F7F6F2] hover:text-[#7B8062] transition-all duration-200">
                        <Eye className="w-4 h-4" />
                      </button>
                      {isAdmin() && getTenVaiTro(u) === 'NHAN_VIEN' && (
                        <button onClick={() => openEdit(u)}
                          title="Sửa thông tin"
                          className="p-2 rounded-full text-gray-400 hover:bg-[#F7F6F2] hover:text-[#7B8062] transition-all duration-200">
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {isAdmin() && getTenVaiTro(u) !== 'ADMIN' && (
                        <button onClick={() => handleToggleActive(u)}
                          title={u.dangHoatDong ? 'Khóa tài khoản' : 'Mở khóa'}
                          className={`p-1.5 transition-colors ${u.dangHoatDong ? 'text-gray-400 hover:text-red-500' : 'text-gray-400 hover:text-green-600'}`}>
                          {u.dangHoatDong ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      )}
                      {isAdmin() && getTenVaiTro(u) === 'KHACH_HANG' && (
                        <button onClick={() => handleDoiVaiTro(u, 2)}
                          title="Thăng lên Nhân viên"
                          className="p-2 rounded-full text-gray-400 hover:bg-[#F7F6F2] hover:text-[#7B8062] transition-all duration-200">
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                      {isAdmin() && getTenVaiTro(u) === 'NHAN_VIEN' && (
                        <button onClick={() => handleDoiVaiTro(u, 3)}
                          title="Hạ xuống Khách hàng"
                          className="text-xs px-2 py-1 text-red-500 hover:bg-red-50 rounded transition-colors">
                          Hạ cấp
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {danhSach.length === 0 && (
                <tr>
  <td colSpan={6} className="text-center py-14">
    <p className="text-gray-400 text-sm">Không có người dùng</p>
  </td>
</tr>
              )}
            </tbody>
          </table>
          {tongTrang > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
              <button disabled={trang === 0} onClick={() => setTrang(t => t - 1)} className="btn-secondary text-sm">Trước</button>
              <span className="px-3 py-2 text-sm text-gray-600">{trang + 1}/{tongTrang}</span>
              <button disabled={trang >= tongTrang - 1} onClick={() => setTrang(t => t + 1)} className="btn-secondary text-sm">Sau</button>
            </div>
          )}
        </div>
      )}

      {/* ====== Confirm Dialog ====== */}
{confirmDialog.open && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-[#FDFCFB] rounded-[2rem] border border-[#F0EEE9] shadow-2xl max-w-sm w-full mx-4 overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 border-b border-[#F0EEE9] bg-gradient-to-r from-[#F7F6F2] to-white">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C] mb-1">
          Xác nhận hành động
        </p>
        <h3 className="text-lg font-light text-[#1A1A1A]">
          {confirmDialog.title}
        </h3>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <p className="text-sm text-gray-600 leading-relaxed">
          {confirmDialog.message}
        </p>
      </div>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-[#F0EEE9] flex justify-end gap-3">
        <button
          onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
          className="px-4 py-2 text-sm rounded-lg border border-[#F0EEE9]
          text-gray-600 hover:bg-[#F7F6F2] transition"
        >
          Hủy
        </button>

        <button
          onClick={confirmDialog.onConfirm}
          className="px-5 py-2.5 text-sm font-medium rounded-xl
          bg-[#7B8062] text-white
          hover:bg-[#6c7156]
          transition-all duration-300
          shadow-sm hover:shadow-md"
        >
          Xác nhận
        </button>
      </div>

    </div>
  </div>
)}

      {/* ====== Detail Modal ====== */}
{modalMode === 'detail' && selectedUser && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-[#FDFCFB] rounded-[2rem] border border-[#F0EEE9] shadow-2xl max-w-md w-full mx-4 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0EEE9] bg-gradient-to-r from-[#F7F6F2] to-white">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C] mb-1">
            Thông tin
          </p>
          <h3 className="text-xl font-light text-[#1A1A1A]">
            Chi tiết <span className="font-serif italic text-[#7B8062]">người dùng</span>
          </h3>
        </div>

        <button
          onClick={closeModal}
          className="p-2 rounded-full hover:bg-[#F0EEE9] transition"
        >
          <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">

        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#F7F6F2] rounded-full flex items-center justify-center">
            <span className="text-[#7B8062] font-bold text-xl">
              {selectedUser.hoTen?.[0] || '?'}
            </span>
          </div>

          <div>
            <p className="text-lg font-medium text-[#1A1A1A]">
              {selectedUser.hoTen}
            </p>
            <p className="text-sm text-[#8C8C8C]">
              @{selectedUser.tenDangNhap}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">

          <div className="bg-[#F7F6F2] rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C] mb-1">
              Email
            </p>
            <p className="text-sm font-medium text-[#1A1A1A]">
              {selectedUser.email || '—'}
            </p>
          </div>

          <div className="bg-[#F7F6F2] rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C] mb-1">
              SĐT
            </p>
            <p className="text-sm font-medium text-[#1A1A1A]">
              {selectedUser.soDienThoai || '—'}
            </p>
          </div>

          <div className="bg-[#F7F6F2] rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C] mb-1">
              Vai trò
            </p>
            <div className="mt-1">
              {vaiTroLabel(selectedUser.vaiTro)}
            </div>
          </div>

          <div className="bg-[#F7F6F2] rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C] mb-1">
              Trạng thái
            </p>
            <div className="mt-1">
              {selectedUser.dangHoatDong ? (
                <span className="badge badge-green text-xs">Hoạt động</span>
              ) : (
                <span className="badge badge-red text-xs">Bị khóa</span>
              )}
            </div>
          </div>

          <div className="col-span-2 bg-[#F7F6F2] rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C] mb-1">
              Ngày tạo
            </p>
            <p className="text-sm font-medium text-[#1A1A1A]">
              {formatDate(selectedUser.thoiGianTao)}
            </p>
          </div>

        </div>

      </div>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-[#F0EEE9] flex justify-end">
        <button
          onClick={closeModal}
          className="px-4 py-2 text-sm rounded-lg border border-[#F0EEE9]
          text-gray-600 hover:bg-[#F7F6F2] transition"
        >
          Đóng
        </button>
      </div>

    </div>
  </div>
)}

      {/* ====== Create / Edit Modal ====== */}
{(modalMode === 'create' || modalMode === 'edit') && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-[#FDFCFB] rounded-[2rem] border border-[#F0EEE9] shadow-2xl max-w-md w-full mx-4 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0EEE9] bg-gradient-to-r from-[#F7F6F2] to-white">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C] mb-1">
            {modalMode === 'create' ? 'Tạo mới' : 'Cập nhật'}
          </p>
          <h3 className="text-xl font-light text-[#1A1A1A]">
            {modalMode === 'create' ? (
              <>Thêm <span className="font-serif italic text-[#7B8062]">nhân viên</span></>
            ) : (
              <>Sửa <span className="font-serif italic text-[#7B8062]">{selectedUser?.hoTen}</span></>
            )}
          </h3>
        </div>

        <button
          onClick={closeModal}
          className="p-2 rounded-full hover:bg-[#F0EEE9] transition"
        >
          <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
        </button>
      </div>

      {/* Form */}
      <div className="px-6 py-6 space-y-5">

        {modalMode === 'create' && (
          <>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C] mb-1">
                Tên đăng nhập *
              </label>
              <input
                className="w-full px-4 py-2.5 text-sm rounded-xl
                bg-[#FDFCFB] border border-[#F0EEE9]
                focus:border-[#7B8062] outline-none transition"
                value={formData.tenDangNhap}
                onChange={e => setFormData(p => ({ ...p, tenDangNhap: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C] mb-1">
                Mật khẩu *
              </label>
              <input
                type="password"
                className="w-full px-4 py-2.5 text-sm rounded-xl
                bg-[#FDFCFB] border border-[#F0EEE9]
                focus:border-[#7B8062] outline-none transition"
                value={formData.matKhau}
                onChange={e => setFormData(p => ({ ...p, matKhau: e.target.value }))}
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C] mb-1">
            Họ tên *
          </label>
          <input
            className="w-full px-4 py-2.5 text-sm rounded-xl
            bg-[#FDFCFB] border border-[#F0EEE9]
            focus:border-[#7B8062] outline-none transition"
            value={formData.hoTen}
            onChange={e => setFormData(p => ({ ...p, hoTen: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C] mb-1">
            Email *
          </label>
          <input
            type="email"
            className="w-full px-4 py-2.5 text-sm rounded-xl
            bg-[#FDFCFB] border border-[#F0EEE9]
            focus:border-[#7B8062] outline-none transition"
            value={formData.email}
            onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C] mb-1">
            Số điện thoại
          </label>
          <input
            className="w-full px-4 py-2.5 text-sm rounded-xl
            bg-[#FDFCFB] border border-[#F0EEE9]
            focus:border-[#7B8062] outline-none transition"
            value={formData.soDienThoai}
            onChange={e => setFormData(p => ({ ...p, soDienThoai: e.target.value }))}
          />
        </div>

      </div>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-[#F0EEE9] flex justify-end gap-3">
        <button
          onClick={closeModal}
          className="px-4 py-2 text-sm rounded-lg border border-[#F0EEE9]
          text-gray-600 hover:bg-[#F7F6F2] transition"
          disabled={submitting}
        >
          Hủy
        </button>

        <button
          onClick={modalMode === 'create' ? handleCreateSubmit : handleEditSubmit}
          className="px-5 py-2.5 text-sm font-medium rounded-xl
          bg-[#7B8062] text-white
          hover:bg-[#6c7156]
          transition-all duration-300
          shadow-sm hover:shadow-md"
          disabled={submitting}
        >
          {submitting
            ? 'Đang xử lý...'
            : modalMode === 'create'
              ? 'Tạo nhân viên'
              : 'Lưu thay đổi'}
        </button>
      </div>

    </div>
    
  </div>
)}
<style>{`
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,700&display=swap');
  
  .font-serif {
    font-family: 'Playfair Display', serif !important;
  }
`}</style>
    </div>
    
  );
}
