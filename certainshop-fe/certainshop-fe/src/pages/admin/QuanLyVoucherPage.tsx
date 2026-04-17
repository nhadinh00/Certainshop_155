import { useEffect, useState } from 'react';
import { voucherApi } from '../../services/api';
import type { Voucher } from '../../services/api';
import toast from 'react-hot-toast';
import { Trash2, Edit2, Plus } from 'lucide-react';

export default function QuanLyVoucherPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: number | null }>({
    show: false,
    id: null,
  });

  const [formData, setFormData] = useState<Partial<Voucher>>({
    maVoucher: '',
    moTa: '',
    loaiGiam: 'PERCENT',
    giaTriGiam: 0,
    giaTriGiamToiDa: 0,
    giaTriToiThieu: undefined,
    ngayBatDau: '',
    ngayKetThuc: '',
    soLuongToiDa: undefined,
    trangThai: true,
  });

  // Load vouchers
  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const response = await voucherApi.danhSachTatCa();
      if (response.data?.duLieu) {
        setVouchers(response.data.duLieu);
      }
    } catch (error) {
      console.error('Load vouchers error:', error);
      toast.error('Lỗi tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.maVoucher?.trim()) {
      toast.error('Vui lòng nhập mã voucher');
      return;
    }
    if (!formData.ngayBatDau || !formData.ngayKetThuc) {
      toast.error('Vui lòng chọn ngày bắt đầu và kết thúc');
      return;
    }
    if ((formData.giaTriGiam || 0) <= 0) {
      toast.error('Giá trị giảm phải lớn hơn 0');
      return;
    }
    if (formData.loaiGiam === 'PERCENT' && (formData.giaTriGiam || 0) > 100) {
      toast.error('Phần trăm giảm không được vượt quá 100%');
      return;
    }

    try {
      // Convert dates from "YYYY-MM-DD" to ISO datetime format
      const submitData = {
        ...formData,
        ngayBatDau: formData.ngayBatDau ? `${formData.ngayBatDau}T00:00:00` : '',
        ngayKetThuc: formData.ngayKetThuc ? `${formData.ngayKetThuc}T23:59:59` : '',
      };

      if (editingId) {
        await voucherApi.capNhatVoucher(editingId, submitData);
        toast.success('Cập nhật voucher thành công');
      } else {
        await voucherApi.taoVoucher(submitData);
        toast.success('Tạo voucher thành công');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        maVoucher: '',
        moTa: '',
        loaiGiam: 'PERCENT',
        giaTriGiam: 0,
        giaTriGiamToiDa: 0,
        giaTriToiThieu: undefined,
        ngayBatDau: '',
        ngayKetThuc: '',
        soLuongToiDa: undefined,
        trangThai: true,
      });
      loadVouchers();
    } catch (error) {
      console.error('Save voucher error:', error);
      toast.error('Lỗi lưu voucher');
    }
  };

  const handleEdit = (voucher: Voucher) => {
    setFormData({
      ...voucher,
      ngayBatDau: voucher.ngayBatDau ? new Date(voucher.ngayBatDau).toISOString().split('T')[0] : '',
      ngayKetThuc: voucher.ngayKetThuc ? new Date(voucher.ngayKetThuc).toISOString().split('T')[0] : '',
    });
    setEditingId(voucher.id);
    setShowForm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete.id) return;
    try {
      await voucherApi.xoaVoucher(confirmDelete.id);
      toast.success('Xóa voucher thành công');
      setConfirmDelete({ show: false, id: null });
      loadVouchers();
    } catch (error) {
      console.error('Delete voucher error:', error);
      toast.error('Lỗi xóa voucher');
    }
  };

  const filteredVouchers = vouchers.filter((v) =>
    v.maVoucher.toLowerCase().includes(searchText.toLowerCase()) ||
    (v.moTa || '').toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="px-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-light tracking-tight text-[#1A1A1A]">
  Quản lý <span className="font-serif italic text-[#7B8062]">voucher</span>
</h1>

        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({
              maVoucher: '',
              moTa: '',
              loaiGiam: 'PERCENT',
              giaTriGiam: 0,
              giaTriGiamToiDa: 0,
              giaTriToiThieu: undefined,
              ngayBatDau: '',
              ngayKetThuc: '',
              soLuongToiDa: undefined,
              trangThai: true,
            });
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium
  bg-gradient-to-r from-[#7B8062] to-[#9CA986]
  text-white rounded-xl shadow-sm
  hover:shadow-md hover:scale-[1.02]
  active:scale-[0.98]
  transition-all duration-200"
        >
          <Plus size={20} />
          Thêm Voucher
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm mã hoặc mô tả voucher..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full px-4 py-2.5 text-sm bg-white border border-[#F0EEE9] rounded-xl focus:border-[#7B8062] focus:ring-0 transition-all"
        />
      </div>

      {/* Vouchers Table */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Đang tải...</div>
      ) : filteredVouchers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Không có voucher nào</div>
      ) : (
        <div className="bg-white border border-[#F0EEE9] rounded-[2rem] overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-[#FDFCFB] border-b border-[#F0EEE9]">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.25em] text-[#8C8C8C]">Mã Voucher</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.25em] text-[#8C8C8C]">Mô Tả</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.25em] text-[#8C8C8C]">Loại</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.25em] text-[#8C8C8C]">Giá Trị Giảm</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.25em] text-[#8C8C8C]">Ngày BĐ - KT</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.25em] text-[#8C8C8C]">Sử Dụng</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.25em] text-[#8C8C8C]">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {filteredVouchers.map((voucher) => (
                <tr key={voucher.id} className="border-b border-gray-200  hover:bg-[#F7F6F2] hover:scale-[1.01] transition-all duration-300">
                  <td className="px-4 py-3 font-medium text-gray-900">{voucher.maVoucher}</td>
                  <td className="px-4 py-3 text-gray-700">{voucher.moTa || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#F7F6F2] text-[#7B8062]">
  {voucher.loaiGiam === 'PERCENT' ? 'Phần trăm' : 'Fixed'}
</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {voucher.loaiGiam === 'PERCENT' ? `${voucher.giaTriGiam}%` : `${voucher.giaTriGiam.toLocaleString()}đ`}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {new Date(voucher.ngayBatDau).toLocaleDateString('vi-VN')} -
                    <br />
                    {new Date(voucher.ngayKetThuc).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    {voucher.soLuongSuDung} / {voucher.soLuongToiDa || '∞'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleEdit(voucher)}
                      className="p-1.5 text-gray-400 opacity-80 hover:opacity-100 hover:text-[#7B8062] hover:bg-[#F7F6F2] rounded-lg transition-all duration-300"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ show: true, id: voucher.id })}
                      className="p-1.5 text-gray-400 opacity-80 hover:opacity-100 hover:text-[#7B8062] hover:bg-[#F7F6F2] rounded-lg transition-all duration-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
  <div className="bg-[#FDFCFB] rounded-[2rem] shadow-2xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Xác Nhận Xóa</h3>
            <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa voucher này?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmDelete({ show: false, id: null })}
                className="w-full px-4 py-2.5 text-sm bg-white border border-[#F0EEE9] rounded-xl text-gray-700 hover:bg-[#F7F6F2] hover:scale-[1.01] transition-all duration-300 transition font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition font-medium"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#FDFCFB] rounded-[2rem] shadow-2xl max-w-2xl w-full mx-4 p-6 border border-[#F0EEE9]">
            <h3 className="text-2xl font-light tracking-tight text-[#1A1A1A]">
  {editingId ? 'Chỉnh sửa' : 'Tạo'} 
  <span className="font-serif italic text-[#7B8062]"> voucher</span>
</h3>

            <div className="space-y-4">
              {/* Mã Voucher */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C] mb-1">Mã Voucher *</label>
                <input
                  type="text"
                  value={formData.maVoucher || ''}
                  onChange={(e) => setFormData({ ...formData, maVoucher: e.target.value.toUpperCase() })}
                  disabled={!!editingId}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#F0EEE9] rounded-xl focus:border-[#7B8062] focus:ring-0 transition-all duration-300"
                  placeholder="VD: SUMMER2026"
                />
              </div>

              {/* Mô Tả */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C] mb-1">Mô Tả</label>
                <textarea
                  value={formData.moTa || ''}
                  onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#F0EEE9] rounded-xl focus:border-[#7B8062] focus:ring-0 transition-all duration-300"
                  rows={2}
                  placeholder="Mô tả voucher"
                />
              </div>

              {/* Loại Giảm */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C] mb-1">Loại Giảm *</label>
                  <select
                    value={formData.loaiGiam || 'PERCENT'}
                    onChange={(e) => setFormData({ ...formData, loaiGiam: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-[#F0EEE9] rounded-xl focus:border-[#7B8062] focus:ring-0 transition-all duration-300"
                  >
                    <option value="PERCENT">Phần Trăm (%)</option>
                    <option value="FIXED">Fixed (đ)</option>
                  </select>
                </div>

                {/* Giá Trị Giảm */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C] mb-1">
                    Giá Trị Giảm {formData.loaiGiam === 'PERCENT' ? '(%)' : '(đ)'} *
                  </label>
                  <input
                    type="number"
                    value={formData.giaTriGiam || 0}
                    onChange={(e) => setFormData({ ...formData, giaTriGiam: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-[#F0EEE9] rounded-xl focus:border-[#7B8062] focus:ring-0 transition-all duration-300"
                    step="1"
                    min="0"
                    max={formData.loaiGiam === 'PERCENT' ? 100 : undefined}
                  />
                </div>
              </div>

              {/* Giá Trị Giảm Tối Đa */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C] mb-1">Giá Trị Giảm Tối Đa (đ) *</label>
                <input
                  type="number"
                  value={formData.giaTriGiamToiDa || 0}
                  onChange={(e) => setFormData({ ...formData, giaTriGiamToiDa: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#F0EEE9] rounded-xl focus:border-[#7B8062] focus:ring-0 transition-all duration-300"
                  step="1000"
                  min="0"
                  placeholder="VD: 50000"
                />
              </div>

              {/* Giá Trị Tối Thiểu */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C] mb-1">Giá Trị Đơn Hàng Tối Thiểu (đ)</label>
                <input
                  type="number"
                  value={formData.giaTriToiThieu || ''}
                  onChange={(e) => setFormData({ ...formData, giaTriToiThieu: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#F0EEE9] rounded-xl focus:outline-none focus:border-[#7B8062] focus:ring-0 transition-all duration-300"
                  step="1000"
                  min="0"
                  placeholder="VD: 200000 (để trống = không yêu cầu)"
                />
              </div>

              {/* Ngày Bắt Đầu */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C] mb-1">Ngày Bắt Đầu *</label>
                  <input
                    type="date"
                    value={formData.ngayBatDau || ''}
                    onChange={(e) => setFormData({ ...formData, ngayBatDau: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-[#F0EEE9] rounded-xl focus:border-[#7B8062] focus:ring-0 transition-all duration-300"
                  />
                </div>

                {/* Ngày Kết Thúc */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C] mb-1">Ngày Kết Thúc *</label>
                  <input
                    type="date"
                    value={formData.ngayKetThuc || ''}
                    onChange={(e) => setFormData({ ...formData, ngayKetThuc: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-[#F0EEE9] rounded-xl focus:border-[#7B8062] focus:ring-0 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Số Lượng Tối Đa */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C] mb-1">Số Lượng Tối Đa (Để trống = không giới hạn)</label>
                <input
                  type="number"
                  value={formData.soLuongToiDa || ''}
                  onChange={(e) => setFormData({ ...formData, soLuongToiDa: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#F0EEE9] rounded-xl focus:border-[#7B8062] focus:ring-0 transition-all duration-300"
                  step="1"
                  min="1"
                />
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="trangThai"
                  checked={formData.trangThai !== false}
                  onChange={(e) => setFormData({ ...formData, trangThai: e.target.checked })}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#F0EEE9] rounded-xl focus:ring-0 transition-all duration-300"
                  step="1"
                />
                <label htmlFor="trangThai" className="text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C] mb-1">
                  Hoạt động
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="w-full px-4 py-2.5 text-sm bg-white border border-[#F0EEE9] rounded-xl text-gray-700 hover:bg-[#F7F6F2] hover:scale-[1.01] transition-all duration-300 transition font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-[#7B8062] text-white hover:opacity-90 transition-all"
              >
                {editingId ? 'Cập Nhật' : 'Tạo'}
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
