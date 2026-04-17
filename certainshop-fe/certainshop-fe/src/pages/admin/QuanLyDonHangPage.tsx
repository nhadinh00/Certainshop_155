import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronDown, ChevronUp, Eye, X } from 'lucide-react';
import { adminApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import type { DonHang } from '../../services/api';
import { formatCurrency, formatDate, trangThaiDonHangLabel, getImageUrl, handleImgError } from '../../utils/format';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const TRANG_THAI_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'CHO_THANH_TOAN', label: 'Chờ thanh toán' },
  { value: 'CHO_XAC_NHAN',   label: 'Chờ xác nhận' },
  { value: 'DA_XAC_NHAN',    label: 'Đã xác nhận' },
  { value: 'DANG_XU_LY',     label: 'Đang xử lý' },
  { value: 'DANG_GIAO',      label: 'Đang giao' },
  { value: 'DA_GIAO',        label: 'Đã giao' },
  { value: 'HOAN_TAT',       label: 'Hoàn tất' },
  { value: 'HOAN_THANH',     label: 'Hoàn thành' },
  { value: 'DA_HUY',         label: 'Đã hủy' },
];

// Luồng chuyển trạng thái thuận chiều — backend quyết định key thực tế
const CHUYEN_TIEP: Record<string, string> = {
  'CHO_THANH_TOAN': 'CHO_XAC_NHAN', // COD order: initial → awaiting confirmation
  'DA_THANH_TOAN':  'CHO_XAC_NHAN', // VNPay order: paid → awaiting confirmation
  'CHO_XAC_NHAN': 'DA_XAC_NHAN',    // awaiting confirmation → admin confirmed (inventory deducted)
  'DA_XAC_NHAN':  'DANG_XU_LY',     // confirmed → processing
  'DANG_XU_LY':   'DANG_GIAO',      // processing → shipping
  'DANG_GIAO':    'HOAN_TAT',       // shipping → completed
};

// Helper to get status label and color
const getStatusDisplay = (trangThai: string): { label: string; color: string } => {
  return trangThaiDonHangLabel[trangThai] || { label: trangThai, color: 'gray' };
};

export default function QuanLyDonHangPage() {
  const [danhSach, setDanhSach] = useState<DonHang[]>([]);
  const [loading, setLoading] = useState(true);
  const [tuKhoa, setTuKhoa] = useState('');
  const [trangThai, setTrangThai] = useState('');
  const [trang, setTrang] = useState(0);
  const [tongTrang, setTongTrang] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [chiTietDonHang, setChiTietDonHang] = useState<DonHang | null>(null);
  const [modalDonHang, setModalDonHang] = useState<DonHang | null>(null);

  // Confirm dialog state for Staff transition
  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; maDonHang: string; trangThaiMoi: string; ghiChu: string }>({
    show: false, maDonHang: '', trangThaiMoi: '', ghiChu: ''
  });

  const { isAdmin } = useAuthStore();

  const load = useCallback(() => {
    setLoading(true);
    adminApi.danhSachDonHang({ trangThai: trangThai || undefined, tuKhoa: tuKhoa || undefined, trang })
      .then(r => {
        setDanhSach(r.data.duLieu?.danhSach || []);
        setTongTrang(r.data.duLieu?.tongSoTrang || 0);
      })
      .finally(() => setLoading(false));
  }, [trangThai, tuKhoa, trang]);

  useEffect(() => { load(); }, [load]);

  const toggleExpand = async (maDonHang: string) => {
    if (expanded === maDonHang) {
      setExpanded(null);
      setChiTietDonHang(null);
      return;
    }
    try {
      const r = await adminApi.chiTietDonHang(maDonHang);
      setChiTietDonHang(r.data.duLieu);
      setExpanded(maDonHang);
    } catch {
      toast.error('Không thể tải chi tiết');
    }
  };

  const xemChiTiet = async (maDonHang: string) => {
    try {
      const r = await adminApi.chiTietDonHang(maDonHang);
      setModalDonHang(r.data.duLieu);
    } catch {
      toast.error('Không thể tải chi tiết đơn hàng');
    }
  };

  const chuyenTrangThai = async (maDonHang: string, trangThaiMoi: string, ghiChu = '') => {
    // Staff phải confirm, Admin không cần
    if (!isAdmin()) {
      setConfirmDialog({ show: true, maDonHang, trangThaiMoi, ghiChu });
      return;
    }

    // Admin không cần confirm, execute ngay
    await executeChuyenTrangThai(maDonHang, trangThaiMoi, ghiChu);
  };

  const executeChuyenTrangThai = async (maDonHang: string, trangThaiMoi: string, ghiChu = '') => {
    try {
      await adminApi.capNhatTrangThaiDonHang(maDonHang, trangThaiMoi, ghiChu);
      toast.success('Đã cập nhật trạng thái');
      load();
      if (expanded === maDonHang) {
        setExpanded(null);
        setChiTietDonHang(null);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.thongBao || 'Cập nhật thất bại';
      toast.error(errorMessage);
    }
  };

  return (
    <div>
      <div className="mb-10">
      <h2 className="text-3xl font-light tracking-tighter text-[#1A1A1A]">
      Quản lý <span className="font-serif italic text-[#7B8062]">đơn hàng</span>
      </h2>
      <div className="w-10 h-[1px] bg-[#7B8062] mt-3"></div>
    </div>
      <div className="bg-white border border-[#F0EEE9] rounded-[2rem] p-4 mb-5 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pl-9 text-sm" placeholder="Tìm mã đơn, người nhận..."
            value={tuKhoa} onChange={e => { setTuKhoa(e.target.value); setTrang(0); }} />
        </div>
        <select className="input-field w-44 text-sm" value={trangThai}
          onChange={e => { setTrangThai(e.target.value); setTrang(0); }}>
          {TRANG_THAI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white border border-[#F0EEE9] rounded-[2rem] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#FDFCFB] border-b border-[#F0EEE9]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-[#8C8C8C] uppercase tracking-[0.2em] text-[10px] font-black">Mã đơn</th>
                <th className="text-left px-4 py-3 font-medium text-[#8C8C8C] uppercase tracking-[0.2em] text-[10px] font-black">Người nhận</th>
                <th className="text-left px-4 py-3 font-medium text-[#8C8C8C] uppercase tracking-[0.2em] text-[10px] font-black">Ngày đặt</th>
                <th className="text-left px-4 py-3 font-medium text-[#8C8C8C] uppercase tracking-[0.2em] text-[10px] font-black">Tổng tiền</th>
                <th className="text-left px-4 py-3 font-medium text-[#8C8C8C] uppercase tracking-[0.2em] text-[10px] font-black">Trạng thái</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {danhSach.map(dh => {
                const tt = getStatusDisplay(dh.trangThaiDonHang);
                const nextState = CHUYEN_TIEP[dh.trangThaiDonHang];
                const nextLabel = nextState ? getStatusDisplay(nextState).label : null;
                const isExpanded = expanded === dh.maDonHang;
                return (
                  <tr key={dh.maDonHang} className="group hover:bg-[#F7F6F2]">
                    <td className="px-4 py-3">
                      <span className="font-mono font-medium text-[#1A1A1A]">#{dh.maDonHang}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{dh.tenNguoiNhan}</p>
                      <p className="text-gray-400 text-xs">{dh.sdtNguoiNhan}</p>
                    </td>
                    <td className="px-4 py-3 text-[#8C8C8C]">{formatDate(dh.thoiGianTao)}</td>
                    <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{formatCurrency(dh.tongTienThanhToan)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge badge-${tt.color} w-fit`}>{tt.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => xemChiTiet(dh.maDonHang)}
                          className="p-1 text-[#7B8062] hover:text-[#5f644d] hover:bg-[#F7F6F2] rounded transition-colors"
                          title="Xem chi tiết">
                          <Eye className="w-4 h-4" />
                        </button>
                        {nextLabel && (
                          <button
                            onClick={() => chuyenTrangThai(dh.maDonHang, nextState)}
                            className="text-xs px-2 py-1 bg-[#F7F6F2] text-[#7B8062] rounded hover:bg-[#ECEAE4] transition-colors whitespace-nowrap">
                            → {nextLabel}
                          </button>
                        )}
                        {dh.trangThaiDonHang === 'CHO_XAC_NHAN' && (
                          <button
                            onClick={() => chuyenTrangThai(dh.maDonHang, 'DA_HUY', 'Admin hủy đơn')}
                            className="text-xs px-2 py-1 bg-[#F7F6F2] text-[#8C8C8C] rounded hover:bg-[#ECEAE4] transition-colors">
                            Hủy
                          </button>
                        )}
                        <button onClick={() => toggleExpand(dh.maDonHang)}
                          className="p-1 text-gray-400 hover:text-[#8C8C8C]">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Expanded detail rows */}
              {danhSach.map(dh => {
                const isExpanded = expanded === dh.maDonHang;
                if (!isExpanded || !chiTietDonHang) return null;
                return (
                  <tr key={`detail-${dh.maDonHang}`}>
                    <td colSpan={6} className="p-0">
                      <div className="bg-[#FDFCFB] px-6 py-4 border-t border-[#F0EEE9]">
                        <div className="text-xs text-[#8C8C8C] space-y-1 mb-3">
                          <p><span className="font-medium">Địa chỉ: </span>{chiTietDonHang.diaChiGiaoHang}</p>
                          <p><span className="font-medium">Ghi chú: </span>{chiTietDonHang.ghiChu || '—'}</p>
                          <p><span className="font-medium">Thanh toán: </span>{chiTietDonHang.phuongThucThanhToan} · {chiTietDonHang.daThanhToan ? '✓ Đã TT' : 'Chưa TT'}</p>
                        </div>
                        <div className="space-y-2">
                          {chiTietDonHang.danhSachChiTiet?.map(ct => {
                            const donGia = ct.giaTaiThoiDiemMua || 0;
                            const displayThanhTien = ct.thanhTien || donGia * ct.soLuong;
                            return (
                              <div key={ct.id} className="flex items-center gap-3 text-xs">
                                <img src={getImageUrl(ct.bienThe?.anhChinh)} alt=""
                                  className="w-10 h-10 rounded object-cover bg-white border"
                                  onError={handleImgError} />
                                <span className="font-medium text-gray-800 flex-1">{ct.bienThe?.tenSanPham}</span>
                                <span className="text-[#8C8C8C]">
                                  {[ct.bienThe?.tenMauSac, ct.bienThe?.kichThuoc].filter(Boolean).join(' / ')}
                                </span>
                                <span className="text-[#8C8C8C]">×{ct.soLuong}</span>
                                <span className="font-semibold text-[#8C8C8C]">{formatCurrency(displayThanhTien)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {danhSach.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">Không có đơn hàng</td></tr>
              )}
            </tbody>
          </table>
          {tongTrang > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-[#F0EEE9]">
              <button disabled={trang === 0} onClick={() => setTrang(t => t - 1)} className="btn-secondary text-sm">Trước</button>
              <span className="px-3 py-2 text-sm text-[#8C8C8C]">{trang + 1}/{tongTrang}</span>
              <button disabled={trang >= tongTrang - 1} onClick={() => setTrang(t => t + 1)} className="btn-secondary text-sm">Sau</button>
            </div>
          )}
        </div>
      )}

      {/* Modal Chi Tiết Đơn Hàng - Popup ở giữa màn hình */}
      {modalDonHang && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-[#F0EEE9] px-6 py-4 flex justify-between items-center border-b">
              <div>
                <h2 className="text-lg font-bold text-[#1A1A1A]">Chi tiết đơn hàng</h2>
                <p className="text-sm text-[#8C8C8C]">#{modalDonHang.maDonHang}</p>
              </div>
              <button
                onClick={() => setModalDonHang(null)}
                className="p-1 hover:bg-[#F7F6F2] rounded transition-colors text-[#1A1A1A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Thông tin khách hàng */}
              <div>
                <h3 className="font-bold text-[#1A1A1A] mb-3">👤 Thông tin khách hàng</h3>
                <div className="bg-[#F7F6F2] rounded-2xl border border-[#F0EEE9] p-4 space-y-2 text-sm">
                  <p><span className="font-medium text-[#8C8C8C]">Tên:</span> <span className="text-[#1A1A1A]">{modalDonHang.tenNguoiNhan}</span></p>
                  <p><span className="font-medium text-[#8C8C8C]">SĐT:</span> <span className="text-[#1A1A1A]">{modalDonHang.sdtNguoiNhan}</span></p>
                  <p><span className="font-medium text-[#8C8C8C]">Địa chỉ:</span> <span className="text-[#1A1A1A]">{modalDonHang.diaChiGiaoHang}</span></p>
                  <p><span className="font-medium text-[#8C8C8C]">Ngày đặt:</span> <span className="text-[#1A1A1A]">{formatDate(modalDonHang.thoiGianTao)}</span></p>
                </div>
              </div>

              {/* Thông tin thanh toán */}
              <div className="grid grid-cols-2 gap-4">
                {/* Payment Status */}
                <div>
                  <h3 className="font-bold text-[#1A1A1A] mb-3">💳 Thanh toán</h3>
                  <div className="bg-[#F7F6F2] rounded-2xl border border-[#F0EEE9] p-4 space-y-2 text-sm border border-[#F0EEE9]">
                    <p><span className="font-medium text-[#8C8C8C]">Phương thức:</span> <span className="text-[#1A1A1A] font-semibold">{modalDonHang.phuongThucThanhToan}</span></p>
                    <p>
                      <span className="font-medium text-[#8C8C8C]">Tình trạng:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${modalDonHang.daThanhToan ? 'bg-[#F7F6F2] text-[#7B8062]' : 'bg-[#F7F6F2] text-[#7B8062]'}`}>
                        {modalDonHang.daThanhToan ? '✓ Đã thanh toán' : '⏳ Chưa thanh toán'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Order Processing Status */}
                <div>
                  <h3 className="font-bold text-[#1A1A1A] mb-3">📦 Xử lý</h3>
                  <div className="bg-[#F7F6F2] rounded-2xl border border-[#F0EEE9] p-4 space-y-2 text-sm border border-[#F0EEE9]">
                    <p>
                      <span className="font-medium text-[#8C8C8C]">Trạng thái:</span>
                    </p>
                    <p>
                      {(() => {
                        const tt = trangThaiDonHangLabel[modalDonHang.trangThaiDonHang] || { label: modalDonHang.trangThaiDonHang, color: 'gray' };
                        return <span className={`badge badge-${tt.color} inline-block px-3 py-1 rounded-full font-bold`}>{tt.label}</span>;
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ghi chú */}
              {modalDonHang.ghiChu && (
                <div>
                  <h3 className="font-bold text-[#1A1A1A] mb-3">📝 Ghi chú</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl border border-[#F0EEE9] p-4 text-sm text-[#8C8C8C]">
                    {modalDonHang.ghiChu}
                  </div>
                </div>
              )}

              {/* Danh sách sản phẩm */}
              <div>
                <h3 className="font-bold text-[#1A1A1A] mb-3">📦 Sản phẩm</h3>
                <div className="space-y-3">
                  {modalDonHang.danhSachChiTiet?.map(ct => {
                    const donGia = ct.giaTaiThoiDiemMua || 0;
                    const displayThanhTien = ct.thanhTien || donGia * ct.soLuong;
                    return (
                      <div key={ct.id} className="flex gap-4 p-3 bg-[#F7F6F2] rounded-2xl border border-[#F0EEE9]">
                        <img
                          src={getImageUrl(ct.bienThe?.anhChinh)}
                          alt=""
                          className="w-16 h-16 rounded object-cover bg-white border border-[#F0EEE9]"
                          onError={handleImgError}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-[#1A1A1A]">{ct.bienThe?.tenSanPham}</p>
                          <p className="text-xs text-[#8C8C8C] mt-1">
                            {[ct.bienThe?.tenMauSac, ct.bienThe?.kichThuoc].filter(Boolean).join(' / ')}
                          </p>
                          <p className="text-xs text-[#8C8C8C] mt-1">
                            {formatCurrency(donGia)} × {ct.soLuong}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#1A1A1A]">{formatCurrency(displayThanhTien)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tóm tắt chi phí */}
              <div className="border-t-2 border-[#F0EEE9] pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#8C8C8C]">Tạm tính:</span>
                    <span className="font-medium text-[#1A1A1A]">{formatCurrency(modalDonHang.tongTienThanhToan || 0)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span className="text-[#1A1A1A]">Tổng cộng:</span>
                    <span className="text-[#7B8062]">{formatCurrency(modalDonHang.tongTienThanhToan || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Action Buttons */}
            <div className="sticky bottom-0 bg-[#FDFCFB] border-t border-[#F0EEE9]   px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => setModalDonHang(null)}
                className="px-4 py-2 text-sm font-medium text-[#8C8C8C] bg-white border border-[#F0EEE9] rounded-2xl border border-[#F0EEE9] hover:bg-[#F7F6F2] transition-colors">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Confirm Dialog */}
      {confirmDialog.show && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl border border-[#F0EEE9]">
          <div className="bg-white rounded-2xl border border-[#F0EEE9] p-6 max-w-sm mx-4 shadow-xl shadow-black/5 ">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Xác nhận chuyển trạng thái</h3>
            <p className="ttext-[#8C8C8C] mb-2">Bạn có chắc muốn chuyển trạng thái đơn hàng này?</p>
            <p className="text-sm text-[#8C8C8C] mb-6">Đơn: <span className="font-medium">{confirmDialog.maDonHang}</span> → <span className="font-medium">{getStatusDisplay(confirmDialog.trangThaiMoi).label}</span></p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setConfirmDialog({ show: false, maDonHang: '', trangThaiMoi: '', ghiChu: '' })}
                className="px-4 py-2 text-sm font-medium text-[#8C8C8C] bg-[#F7F6F2] rounded-2xl border border-[#F0EEE9] hover:bg-[#ECEAE4] transition-colors">
                Hủy
              </button>
              <button 
                onClick={async () => {
                  await executeChuyenTrangThai(confirmDialog.maDonHang, confirmDialog.trangThaiMoi, confirmDialog.ghiChu);
                  setConfirmDialog({ show: false, maDonHang: '', trangThaiMoi: '', ghiChu: '' });
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-[#7B8062] rounded-2xl border border-[#F0EEE9] hover:bg-[#ECEAE4] transition-colors">
                Xác nhận
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