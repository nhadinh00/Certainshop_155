import { Loader2 } from 'lucide-react';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({ size = 'md', text, fullPage = false }: Props) {
  // Điều chỉnh kích thước icon nhỏ lại một chút để trông thanh thoát hơn
  const sizes = { 
    sm: 'w-4 h-4', 
    md: 'w-6 h-6', 
    lg: 'w-10 h-10' 
  };

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Vòng tròn tĩnh làm nền phía sau (optional - tạo cảm giác cao cấp) */}
        <div className={`${sizes[size]} border-2 border-[#E5E2D9] rounded-full absolute`}></div>
        
        {/* Icon xoay chính - Đổi màu sang Xanh rêu (Sage Green) */}
        <Loader2 
          className={`${sizes[size]} animate-spin text-[#7B8062] stroke-[1px] relative z-10`} 
        />
      </div>

      {text && (
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#8C8C8C] font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center">
        {spinnerContent}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinnerContent}
    </div>
  );
}