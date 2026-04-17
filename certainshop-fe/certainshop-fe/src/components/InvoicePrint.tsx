import { useRef } from 'react';
import { Printer, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';
import type { DonHang } from '../services/api';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface InvoicePrintProps {
  donHang: DonHang;
  onClose?: () => void;
}

export default function InvoicePrint({ donHang, onClose }: InvoicePrintProps) {
  const printRef = useRef<HTMLDivElement>(null);

  // Cập nhật Style cho cửa sổ In (Print Window)
  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open('', '', 'height=900,width=1000');
    if (!printWindow) {
      alert('Vui lòng cho phép popup để in hóa đơn');
      return;
    }
    printWindow.document.write('<html><head><title>Hóa đơn ' + donHang.maDonHang + '</title>');
    printWindow.document.write(getStyleCSS());
    printWindow.document.write('</head><body>');
    printWindow.document.write('<div class="invoice-container">'); // Thêm wrapper để apply style
    printWindow.document.write(printRef.current.innerHTML);
    printWindow.document.write('</div></body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  // ENTERPRISE-GRADE SOLUTION: Remove classes FIRST, then inject clean CSS
  // This prevents html2canvas from encountering unsupported okch() color functions
  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;

    let container: HTMLElement | null = null;
    try {
      // Clone element
      const clonedElement = element.cloneNode(true) as HTMLElement;
      
      // CRITICAL FIX: Remove ALL Tailwind classes + inline styles BEFORE injecting CSS
      // This prevents okch() color function parsing errors from html2canvas
      clonedElement.querySelectorAll('*').forEach(el => {
        (el as HTMLElement).removeAttribute('class');
        (el as HTMLElement).removeAttribute('style');
      });

      // Inject CLEAN PDF-specific CSS with ONLY standard colors (hex/rgb/rgba)
      const styleTag = document.createElement('style');
      styleTag.textContent = `
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; color: #1f2937; line-height: 1.6; overflow: visible; }
        html { width: 100%; }
        
        /* Main invoice container - no padding, handled by sections */
        div[style*="fontSize: 16px"] {
          width: 100%;
          max-width: 100%;
          min-height: 100%;
          display: block;
          background: #ffffff;
        }
        
        /* ===== HEADER SECTION ===== */
        div.border-b-4, div:has(> h1) { 
          border-bottom: 4px solid #4f46e5; 
          padding-bottom: 28px;
          padding-top: 0;
          margin-bottom: 40px; 
          background: linear-gradient(to right, #ffffff 0%, #f8f5ff 100%);
        }
        
        h1 { 
          font-size: 42px; 
          font-weight: 800; 
          color: #1f2937; 
          margin: 0 0 12px 0; 
          letter-spacing: -0.5px;
        }
        
        h2 { 
          font-size: 18px; 
          font-weight: 700; 
          color: #4f46e5; 
          margin: 24px 0 16px 0; 
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        p { color: #374151; font-size: 15px; margin: 6px 0; }
        
        /* ===== TEXT VARIANTS ===== */
        .text-gray-600 { color: #6b7280; font-size: 16px; margin-top: 8px; }
        .text-gray-500 { color: #9ca3af; font-size: 14px; margin-top: 8px; }
        .text-gray-800 { color: #1f2937; }
        .text-gray-700 { color: #374151; }
        .text-gray-900 { color: #111827; }
        .text-right { text-align: right; }
        
        .text-4xl { font-size: 38px; font-weight: 800; color: #4f46e5; margin-top: 12px; }
        .text-lg { font-size: 17px; }
        .text-base { font-size: 15px; }
        .text-center { text-align: center; }
        .text-xl { font-size: 18px; }
        .text-2xl { font-size: 22px; }
        
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .font-medium { font-weight: 500; }
        
        /* ===== LAYOUT ===== */
        div.grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 32px; 
          margin-bottom: 48px;
        }
        
        /* ===== INFO BOXES ===== */
        .bg-gray-50 { 
          background-color: #f9fafb; 
          padding: 20px; 
          border-radius: 8px; 
          border-left: 5px solid #4f46e5;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
        }
        
        .bg-gray-50 .space-y-3 > div { margin-bottom: 16px; }
        .bg-gray-50 .space-y-3 > div:last-child { margin-bottom: 0; }
        
        .bg-blue-50 { 
          background: linear-gradient(135deg, #f0f4ff 0%, #f8f5ff 100%);
          padding: 20px; 
          border-radius: 8px; 
          border-left: 5px solid #3b82f6;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
        }
        
        .bg-blue-50 .space-y-4 > div { 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          margin-bottom: 14px;
        }
        .bg-blue-50 .space-y-4 > div:last-child { margin-bottom: 0; }
        
        .border-b { 
          border-bottom: 2px solid #e5e7eb; 
          padding-bottom: 12px; 
          margin-bottom: 16px; 
          font-size: 16px; 
          color: #111827; 
          font-weight: 700;
          text-transform: uppercase;
          font-size: 13px;
          letter-spacing: 0.3px;
        }
        
        /* ===== SPACING ===== */
        .mb-3 { margin-bottom: 12px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-10 { margin-bottom: 40px; }
        .ml-2 { margin-left: 8px; }
        .mt-2 { margin-top: 8px; }
        .mt-3 { margin-top: 12px; }
        .mt-4 { margin-top: 16px; }
        .mt-5 { margin-top: 20px; }
        
        /* ===== COLOR UTILITIES ===== */
        .text-indigo-600 { color: #4f46e5; font-weight: 700; }
        .text-green-600 { color: #16a34a; font-weight: 700; }
        
        /* ===== TABLE STYLING ===== */
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 36px 0; 
          background-color: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          border-radius: 4px;
          overflow: hidden;
        }
        
        thead { background: linear-gradient(to right, #4f46e5 0%, #4338ca 100%); }
        th { 
          border: none;
          padding: 16px 14px;
          text-align: left; 
          font-size: 13px; 
          font-weight: 700; 
          color: #ffffff;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        
        td { 
          border-bottom: 1px solid #e5e7eb; 
          padding: 14px; 
          font-size: 14px; 
          color: #374151;
          background-color: #ffffff;
        }
        
        tbody tr { background-color: #ffffff; }
        tbody tr:nth-child(even) { background-color: #fafbfc; }
        tbody tr:last-child td { border-bottom: none; }
        
        /* ===== SUMMARY BOX ===== */
        div.flex { 
          display: flex; 
          justify-content: flex-end; 
          margin-bottom: 40px; 
        }
        
        .w-80 { width: 100%; max-width: 380px; }
        
        .border-l-4 { 
          border-left: 5px solid #4f46e5; 
          background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.1);
        }
        
        .border-l-4 > div { display: flex; justify-content: space-between; align-items: center; }
        
        .border-t-2 { 
          border-top: 2px solid #e5e7eb; 
          padding-top: 16px; 
          margin-top: 16px;
        }
        .pt-4 { padding-top: 16px; }
        
        /* ===== NOTES BOX ===== */
        .bg-yellow-50 { 
          background: linear-gradient(135deg, #fffbeb 0%, #fef9c3 100%);
          border: 2px solid #fde047;
          border-radius: 8px; 
          padding: 20px; 
          margin-bottom: 40px;
          box-shadow: 0 2px 6px rgba(251, 191, 36, 0.1);
        }
        
        .bg-yellow-50 p { 
          color: #78350f; 
          font-size: 14px;
          font-weight: 500;
          line-height: 1.6;
        }
        
        /* ===== FOOTER ===== */
        div.border-t-4 { 
          border-top: 4px solid #4f46e5; 
          padding-top: 36px; 
          margin-top: 48px; 
          text-align: center; 
          color: #6b7280;
          min-height: 120px;
          display: block;
          page-break-inside: avoid;
        }
        
        div.border-t-4 p { 
          margin-top: 10px; 
          font-size: 14px; 
          color: #1f2937;
          font-weight: 500;
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
        }
        
        div.border-t-4 p:first-child {
          margin-top: 0;
          font-weight: 600;
          font-size: 15px;
        }
        
        div.border-t-4 p:last-child { 
          color: #9ca3af; 
          font-size: 12px; 
          margin-top: 12px;
          font-style: italic;
          font-weight: 400;
          white-space: pre-wrap;
          word-break: break-word;
        }
        
        /* ===== UTILITIES ===== */
        button { display: none !important; }
        .bg-white { background-color: #ffffff; padding: 0; }
        .rounded-lg { border-radius: 6px; }
      `;
      clonedElement.insertBefore(styleTag, clonedElement.firstChild);

      // Hide buttons
      clonedElement.querySelectorAll('button').forEach(btn => {
        (btn as HTMLElement).style.display = 'none';
      });

      // Create temporary container with EXACT dimensions for A4 PDF
      // A4 width at 96 DPI = 794px, use 800px for safety margin
      const containerWidth = 800;
      const containerHeight = 1200; // Initial height, will be recalculated
      
      container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = containerWidth + 'px';
      container.style.minHeight = containerHeight + 'px';
      container.style.maxWidth = containerWidth + 'px';
      container.style.backgroundColor = '#ffffff';
      container.style.padding = '0';
      container.style.margin = '0';
      container.style.border = 'none';
      container.style.boxSizing = 'border-box';
      container.style.overflow = 'visible';
      
      container.appendChild(clonedElement);
      document.body.appendChild(container);

      // Let browser fully render and apply clean styles
      // Multiple checks to ensure accurate scrollHeight including footer
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force reflow to calculate accurate dimensions
      const scrollHeight1 = container.scrollHeight;
      await new Promise(resolve => setTimeout(resolve, 100));
      const scrollHeight2 = container.scrollHeight;
      
      // Use the larger value with buffer for footer
      const finalHeight = Math.max(scrollHeight1, scrollHeight2) + 40;
      container.style.minHeight = finalHeight + 'px';
      
      // Final render wait
      await new Promise(resolve => setTimeout(resolve, 100));

      // Render to canvas with exact viewport matching
      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: containerWidth,
        windowHeight: finalHeight,
        ignoreElements: (el: Element) => {
          return el.tagName === 'BUTTON' || el.tagName === 'SCRIPT';
        }
      });

      // Validate canvas
      const imageData = canvas.toDataURL('image/png');
      if (!imageData || imageData.length < 1000) {
        throw new Error('Canvas rendering failed - image data too small');
      }

      // Create PDF with proper page sizing
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
        precision: 2
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const maxWidth = pdfWidth - 2 * margin;
      
      // Calculate image dimensions correctly
      const imgWidth = maxWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add image WITHOUT duplication
      pdf.addImage(imageData, 'PNG', margin, margin, imgWidth, imgHeight);
      
      // Only add additional pages if content truly exceeds one page
      if (imgHeight > pdfHeight - 2 * margin - 5) {
        // Content needs multiple pages - but don't duplicate
        const remainingHeight = imgHeight - (pdfHeight - 2 * margin);
        const pageHeight = pdfHeight - 2 * margin;
        const numPages = Math.ceil(remainingHeight / pageHeight);
        
        for (let i = 0; i < numPages; i++) {
          pdf.addPage();
          const yOffset = -(pdfHeight - 2 * margin) * (i + 1);
          pdf.addImage(imageData, 'PNG', margin, yOffset + margin, imgWidth, imgHeight);
        }
      }

      pdf.save(`hoa-don-${donHang.maDonHang}.pdf`);

      if (container && container.parentElement) {
        document.body.removeChild(container);
        container = null;
      }
    } catch (error) {
      console.error('Invoice download error:', error);
      
      if (container && container.parentElement) {
        try {
          document.body.removeChild(container);
        } catch (e) {
          // Ignore cleanup errors
        }
      }

      const errorMsg = error instanceof Error ? error.message : String(error);
      alert(
        `Lỗi tải xuống hóa đơn:\n${errorMsg}\n\n` +
        `Vui lòng thử lại hoặc sử dụng nút "In hóa đơn" để lưu PDF.`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Action buttons - Styling lại nút bấm */}
      <div className="flex gap-4">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-[#2D2D2D] text-[#F9F7F2] px-6 py-3 text-sm uppercase tracking-widest font-bold hover:bg-[#404040] transition-all"
        >
          <Printer className="w-5 h-5" /> In hóa đơn
        </button>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 border border-[#2D2D2D] text-[#2D2D2D] px-6 py-3 text-sm uppercase tracking-widest font-bold hover:bg-[#F3F0E6] transition-all"
        >
          <Download className="w-5 h-5" /> Tải xuống PDF
        </button>
        {onClose && (
          <button onClick={onClose} className="text-[#8C8C8C] hover:text-[#2D2D2D] text-sm uppercase tracking-widest font-bold underline underline-offset-4">
            Đóng
          </button>
        )}
      </div>

      {/* Invoice template - Luxury Look */}
      <div
        ref={printRef}
        className="bg-[#F9F7F2] rounded-sm shadow-sm" // Nền kem nhạt
        style={{ pageBreakAfter: 'avoid', fontSize: '15px', padding: '0', color: '#1A1A1A' }}
      >
        {/* Header - Thanh lịch & Tối giản */}
        <div className="border-b border-[#E5E2D9] pb-12" style={{ padding: '48px' }}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-4xl font-serif tracking-tight text-[#1A1A1A]">CertainShop</h1>
              <p className="text-[#7B8062] text-sm uppercase tracking-[0.2em] mt-2 font-bold">Premium Minimalist</p>
              <div className="text-[#5C5C5C] text-[12px] mt-4 space-y-1 italic">
                <p>support@certainshop.vn</p>
                <p>Hotline: (111) 222-3333</p>
                <p>Hồ Chí Minh, Việt Nam</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-serif italic text-[#1A1A1A]">Hóa đơn bán hàng</p>
              <p className="text-[#2D2D2D] text-sm font-bold mt-2 uppercase tracking-widest">#{donHang.maDonHang}</p>
              <p className="text-[#8C8C8C] text-[11px] mt-1">{formatDate(donHang.thoiGianTao)}</p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-16 mb-12" style={{ padding: '40px 48px' }}>
          <div className="border-l border-[#7B8062] pl-6">
            <p className="text-[11px] font-bold text-[#8C8C8C] mb-4 uppercase tracking-[0.2em]">Thông tin khách hàng</p>
            <div className="space-y-2">
              <p className="text-lg font-serif text-[#1A1A1A]">{donHang.tenNguoiNhan}</p>
              <p className="text-sm text-[#5C5C5C]">{donHang.sdtNguoiNhan}</p>
              <p className="text-sm text-[#5C5C5C] leading-relaxed max-w-[250px]">{donHang.diaChiGiaoHang}</p>
            </div>
          </div>
          <div className="border-l border-[#E5E2D9] pl-6">
            <p className="text-[11px] font-bold text-[#8C8C8C] mb-4 uppercase tracking-[0.2em]">Chi tiết vận chuyển</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#8C8C8C]">Trạng thái:</span>
                <span className="font-bold text-[#7B8062]">{donHang.trangThaiDonHang}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8C8C8C]">Thanh toán:</span>
                <span className="font-bold">{donHang.daThanhToan ? 'Đã hoàn tất' : 'Chưa thanh toán'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8C8C8C]">Phương thức:</span>
                <span className="italic">{donHang.phuongThucThanhToan}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table - Dùng nét mảnh, không đổ bóng */}
        <div className="mb-10" style={{ padding: '0 48px' }}>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#1A1A1A]">
                <th className="py-4 text-left text-[11px] font-bold uppercase tracking-widest text-[#1A1A1A]">Sản phẩm</th>
                <th className="py-4 text-center text-[11px] font-bold uppercase tracking-widest text-[#1A1A1A]">Đơn giá</th>
                <th className="py-4 text-center text-[11px] font-bold uppercase tracking-widest text-[#1A1A1A]">SL</th>
                <th className="py-4 text-right text-[11px] font-bold uppercase tracking-widest text-[#1A1A1A]">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2D9]">
              {donHang.danhSachChiTiet?.map((ct) => (
                <tr key={ct.id}>
                  <td className="py-6">
                    <p className="font-serif text-base text-[#1A1A1A]">{ct.bienThe?.tenSanPham}</p>
                    <p className="text-[11px] text-[#8C8C8C] mt-1 uppercase tracking-tighter">
                      {ct.bienThe?.tenMauSac} / {ct.bienThe?.kichThuoc}
                    </p>
                  </td>
                  <td className="py-6 text-center text-sm font-light">{formatCurrency(ct.giaTaiThoiDiemMua || 0)}</td>
                  <td className="py-6 text-center text-sm">{ct.soLuong}</td>
                  <td className="py-6 text-right text-sm font-bold text-[#1A1A1A]">{formatCurrency(ct.thanhTien || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end mb-16" style={{ padding: '0 48px' }}>
          <div className="w-64 space-y-3 pt-6 border-t border-[#1A1A1A]">
            <div className="flex justify-between text-xs text-[#5C5C5C] uppercase tracking-widest">
              <span>Tạm tính:</span>
              <span>{formatCurrency(donHang.tongTienHang)}</span>
            </div>
            {donHang.soTienGiamGia > 0 && (
              <div className="flex justify-between text-xs text-[#7B8062] font-bold uppercase tracking-widest">
                <span>Ưu đãi:</span>
                <span>-{formatCurrency(donHang.soTienGiamGia)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-[#5C5C5C] uppercase tracking-widest pb-4">
              <span>Vận chuyển:</span>
              <span>{formatCurrency(donHang.phiVanChuyen || 0)}</span>
            </div>
            <div className="flex justify-between pt-4 border-t border-[#E5E2D9]">
              <span className="font-serif italic text-lg text-[#1A1A1A]">Tổng cộng:</span>
              <span className="font-bold text-xl text-[#1A1A1A]">{formatCurrency(donHang.tongTienThanhToan)}</span>
            </div>
          </div>
        </div>

        {/* Footer Hóa đơn */}
        <div className="border-t border-[#E5E2D9] pt-12 text-center" style={{ padding: '0 48px 64px 48px' }}>
          <p className="font-serif italic text-lg text-[#1A1A1A]">Thank you for choosing us.</p>
          <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C]">
            CERTAINSHOP — TINH HOA THỜI TRANG VIỆT
          </p>
          <p className="mt-8 text-[9px] text-[#C1C1C1] italic">
            Hóa đơn điện tử được khởi tạo vào {formatDate(new Date().toISOString())}
          </p>
        </div>
      </div>
    </div>
  );
}

// Cập nhật CSS cho cửa sổ In
function getStyleCSS(): string {
  return `<style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: 'Times New Roman', serif; background: white; color: #1A1A1A; }
    .invoice-container { width: 100%; max-width: 800px; margin: 0 auto; background: #F9F7F2; min-height: 100vh; }
    h1, h2, .font-serif { font-family: 'Georgia', serif; }
    table { width: 100%; border-collapse: collapse; }
    th { border-bottom: 1px solid #1A1A1A; padding: 15px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; }
    td { border-bottom: 1px solid #E5E2D9; padding: 20px 0; font-size: 14px; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
  </style>`;
}
