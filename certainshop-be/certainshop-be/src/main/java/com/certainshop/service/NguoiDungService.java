package com.certainshop.service;

import com.certainshop.constant.VaiTroConst;
import com.certainshop.dto.DangKyDto;
import com.certainshop.entity.GioHang;
import com.certainshop.entity.NguoiDung;
import com.certainshop.entity.VaiTro;
import com.certainshop.repository.GioHangRepository;
import com.certainshop.repository.NguoiDungRepository;
import com.certainshop.repository.VaiTroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class NguoiDungService {

    private final NguoiDungRepository nguoiDungRepository;
    private final VaiTroRepository vaiTroRepository;
    private final GioHangRepository gioHangRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;

    /**
     *      * Đăng ký tài khoản khách hàng mới
     */
    public NguoiDung dangKy(DangKyDto dto) {
        // Validate trùng
        if (nguoiDungRepository.existsByTenDangNhap(dto.getTenDangNhap())) {
            throw new IllegalArgumentException("TÃªn Ä‘Äƒng nháº­p Ä‘Ã£ tá»“n táº¡i");
        }
        if (dto.getEmail() != null && !dto.getEmail().isBlank()
                && nguoiDungRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email Ä‘Ã£ Ä‘Æ°á»£c sá»­ dá»¥ng");
        }
        if (!dto.getMatKhau().equals(dto.getXacNhanMatKhau())) {
            throw new IllegalArgumentException("Máº­t kháº©u xÃ¡c nháº­n khÃ´ng khá»›p");
        }

        VaiTro vaiTroKhach = vaiTroRepository.findByTenVaiTro(VaiTroConst.KHACH_HANG)
                .orElseThrow(() -> new RuntimeException("KhÃ´ng tÃ¬m tháº¥y vai trÃ² KhÃ¡ch hÃ ng"));

        NguoiDung nguoiDung = NguoiDung.builder()
                .tenDangNhap(dto.getTenDangNhap())
                .email(dto.getEmail())
                .matKhauMaHoa(passwordEncoder.encode(dto.getMatKhau()))
                .hoTen(dto.getHoTen())
                .soDienThoai(dto.getSoDienThoai())
                .ngaySinh(dto.getNgaySinh())
                .gioiTinh("nam".equalsIgnoreCase(dto.getGioiTinh()) ? Boolean.TRUE :
                          "nu".equalsIgnoreCase(dto.getGioiTinh()) ? Boolean.FALSE : null)
                .vaiTro(vaiTroKhach)
                .dangHoatDong(true)
                .build();

        nguoiDung = nguoiDungRepository.save(nguoiDung);

        // Tạo giỏ hàng cho khách
        GioHang gioHang = GioHang.builder()
                .nguoiDung(nguoiDung)
                .build();
        gioHangRepository.save(gioHang);

        // Gửi email chào mừng (bất đồng bộ, không block transaction)
        mailService.guiMailChaoMung(
                nguoiDung.getEmail(),
                nguoiDung.getHoTen(),
                nguoiDung.getTenDangNhap()
        );

        return nguoiDung;
    }

    /**
     * Lấy người dùng theo tên đăng nhập
     */
    @Transactional(readOnly = true)
    public Optional<NguoiDung> timTheoTenDangNhap(String tenDangNhap) {
        return nguoiDungRepository.findByTenDangNhap(tenDangNhap);
    }

    /**
     * Lấy người dùng theo ID
     */
    @Transactional(readOnly = true)
    public Optional<NguoiDung> timTheoId(Long id) {
        return nguoiDungRepository.findById(id);
    }

    /**
     * Cập nhật thông tin cá nhân
     */
    public NguoiDung capNhatThongTin(Long id, NguoiDung thongTinMoi) {
        NguoiDung nguoiDung = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng"));

        // Kiểm tra email trùng
        if (thongTinMoi.getEmail() != null && !thongTinMoi.getEmail().isBlank()) {
            if (nguoiDungRepository.existsByEmailAndIdNot(thongTinMoi.getEmail(), id)) {
                throw new IllegalArgumentException("Email Ä‘Ã£ Ä‘Æ°á»£c sá»­ dá»¥ng bá»Ÿi tÃ i khoáº£n khÃ¡c");
            }
            nguoiDung.setEmail(thongTinMoi.getEmail());
        }

        nguoiDung.setHoTen(thongTinMoi.getHoTen());
        nguoiDung.setSoDienThoai(thongTinMoi.getSoDienThoai());
        nguoiDung.setNgaySinh(thongTinMoi.getNgaySinh());
        nguoiDung.setGioiTinh(thongTinMoi.getGioiTinh());

        return nguoiDungRepository.save(nguoiDung);
    }

    /**
     * Đổi mật khẩu
     */
    public void doiMatKhau(Long id, String matKhauCu, String matKhauMoi) {
        NguoiDung nguoiDung = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng"));

        if (!passwordEncoder.matches(matKhauCu, nguoiDung.getMatKhauMaHoa())) {
            throw new IllegalArgumentException("Máº­t kháº©u cÅ© khÃ´ng Ä‘Ãºng");
        }

        nguoiDung.setMatKhauMaHoa(passwordEncoder.encode(matKhauMoi));
        nguoiDung.setLanDoiMatKhauCuoi(LocalDateTime.now());
        nguoiDungRepository.save(nguoiDung);
    }

    /**
     * Cập nhật ảnh đại diện
     */
    public void capNhatAnh(Long id, String duongDanAnh) {
        NguoiDung nguoiDung = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng"));
        nguoiDung.setAnhDaiDien(duongDanAnh);
        nguoiDungRepository.save(nguoiDung);
    }

    /**
     * Lấy danh sách nhân viên/admin (cho admin quản lý)
     */
    @Transactional(readOnly = true)
    public Page<NguoiDung> timKiem(String tuKhoa, Pageable pageable) {
        return nguoiDungRepository.timKiem(tuKhoa, pageable);
    }

    @Transactional(readOnly = true)
    public Page<NguoiDung> timKiem(String tuKhoa, String tenVaiTro, Pageable pageable) {
        return nguoiDungRepository.timKiem(tuKhoa, tenVaiTro, null, pageable);
    }

    @Transactional(readOnly = true)
    public Page<NguoiDung> timKiem(String tuKhoa, String tenVaiTro, Boolean dangHoatDong, Pageable pageable) {
        return nguoiDungRepository.timKiem(tuKhoa, tenVaiTro, dangHoatDong, pageable);
    }

    /**
     * Tạo tài khoản nhân viên (admin)
     */
    public NguoiDung taoNhanVien(NguoiDung nhanVien, String matKhau, Integer vaiTroId) {
        if (nguoiDungRepository.existsByTenDangNhap(nhanVien.getTenDangNhap())) {
            throw new IllegalArgumentException("TÃªn Ä‘Äƒng nháº­p Ä‘Ã£ tá»“n táº¡i");
        }
        if (nhanVien.getEmail() != null && !nhanVien.getEmail().isBlank()
                && nguoiDungRepository.existsByEmail(nhanVien.getEmail())) {
            throw new IllegalArgumentException("Email Ä‘Ã£ Ä‘Æ°á»£c sá»­ dá»¥ng");
        }

        VaiTro vaiTro = vaiTroRepository.findById(vaiTroId)
                .orElseThrow(() -> new RuntimeException("Vai trÃ² khÃ´ng tá»“n táº¡i"));

        nhanVien.setMatKhauMaHoa(passwordEncoder.encode(matKhau));
        nhanVien.setVaiTro(vaiTro);
        nhanVien.setDangHoatDong(true);

        return nguoiDungRepository.save(nhanVien);
    }

    /**
     * Khoá/mở khoá tài khoản
     */
    public void doiTrangThaiTaiKhoan(Long id, boolean dangHoatDong) {
        NguoiDung nguoiDung = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng"));

        // Không cho khoá tài khoản admin cố định (ID = 1)
        if (id == 1L && !dangHoatDong) {
            throw new IllegalArgumentException("KhÃ´ng thá»ƒ khoÃ¡ tÃ i khoáº£n Admin gá»‘c");
        }

        nguoiDung.setDangHoatDong(dangHoatDong);
        nguoiDungRepository.save(nguoiDung);
    }

    /**
     * Đổi vai trò
     */
    public void doiVaiTro(Long nguoiDungId, Integer vaiTroId) {
        if (nguoiDungId == 1L) {
            throw new IllegalArgumentException("KhÃ´ng thá»ƒ thay Ä‘á»•i vai trÃ² Admin gá»‘c");
        }
        NguoiDung nguoiDung = nguoiDungRepository.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng"));
        VaiTro vaiTro = vaiTroRepository.findById(vaiTroId)
                .orElseThrow(() -> new RuntimeException("Vai trÃ² khÃ´ng tá»“n táº¡i"));
        nguoiDung.setVaiTro(vaiTro);
        nguoiDungRepository.save(nguoiDung);
    }

    /**
     * Cập nhật thời gian đăng nhập cuối
     */
    public void capNhatLanDangNhapCuoi(Long id) {
        nguoiDungRepository.findById(id).ifPresent(nd -> {
            nd.setLanDangNhapCuoi(LocalDateTime.now());
            nguoiDungRepository.save(nd);
        });
    }

    @Transactional(readOnly = true)
    public List<VaiTro> layTatCaVaiTro() {
        return vaiTroRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Page<NguoiDung> layTheoVaiTro(String tenVaiTro, Pageable pageable) {
        return nguoiDungRepository.findByTenVaiTro(tenVaiTro, pageable);
    }

    // ======================== QUÊN MẬT KHẨU ========================

    /**
     * Tạo mã đặt lại mật khẩu và gửi email
     */
    public void taoMaDatLaiMatKhau(String email) {
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email không tồn tại trong hệ thống"));

        if (Boolean.FALSE.equals(nguoiDung.getDangHoatDong())) {
            throw new IllegalArgumentException("Tài khoản đã bị khóa");
        }

        String token = UUID.randomUUID().toString();
        nguoiDung.setMaDatLaiMatKhau(token);
        nguoiDung.setThoiGianHetHanDatLaiMK(LocalDateTime.now().plusMinutes(30));
        nguoiDungRepository.save(nguoiDung);

        // Gửi email đặt lại mật khẩu (bất đồng bộ)
        mailService.guiMailDatLaiMatKhau(
                nguoiDung.getEmail(),
                nguoiDung.getHoTen(),
                token
        );
    }

    /**
     * Đặt lại mật khẩu bằng mã token
     */
    public void datLaiMatKhau(String token, String matKhauMoi) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Mã xác nhận không hợp lệ");
        }
        if (matKhauMoi == null || matKhauMoi.length() < 6) {
            throw new IllegalArgumentException("Mật khẩu mới phải có ít nhất 6 ký tự");
        }

        NguoiDung nguoiDung = nguoiDungRepository.findByMaDatLaiMatKhau(token)
                .orElseThrow(() -> new IllegalArgumentException("Mã xác nhận không hợp lệ hoặc đã hết hạn"));

        if (nguoiDung.getThoiGianHetHanDatLaiMK() == null
                || nguoiDung.getThoiGianHetHanDatLaiMK().isBefore(LocalDateTime.now())) {
            // Xóa token hết hạn
            nguoiDung.setMaDatLaiMatKhau(null);
            nguoiDung.setThoiGianHetHanDatLaiMK(null);
            nguoiDungRepository.save(nguoiDung);
            throw new IllegalArgumentException("Mã xác nhận đã hết hạn. Vui lòng yêu cầu lại.");
        }

        nguoiDung.setMatKhauMaHoa(passwordEncoder.encode(matKhauMoi));
        nguoiDung.setMaDatLaiMatKhau(null);
        nguoiDung.setThoiGianHetHanDatLaiMK(null);
        nguoiDung.setLanDoiMatKhauCuoi(LocalDateTime.now());
        nguoiDungRepository.save(nguoiDung);
    }

    // ======================== GOOGLE LOGIN ========================

    /**
     * Xử lý Google login - tìm hoặc tạo user
     */
    public NguoiDung googleLogin(GoogleUserInfo googleUserInfo) {
        // Tìm user theo Google ID
        Optional<NguoiDung> existingUser = nguoiDungRepository.findByGoogleId(googleUserInfo.getGoogleId());
        
        if (existingUser.isPresent()) {
            NguoiDung user = existingUser.get();
            // Cập nhật thông tin nếu có thay đổi
            if (googleUserInfo.getName() != null && !googleUserInfo.getName().equals(user.getHoTen())) {
                user.setHoTen(googleUserInfo.getName());
            }
            if (googleUserInfo.getPicture() != null && !googleUserInfo.getPicture().equals(user.getAnhDaiDien())) {
                user.setAnhDaiDien(googleUserInfo.getPicture());
            }
            user.setLanDangNhapCuoi(LocalDateTime.now());
            return nguoiDungRepository.save(user);
        }

        // Tìm user theo email (có thể đã đăng ký trước)
        Optional<NguoiDung> userByEmail = nguoiDungRepository.findByEmail(googleUserInfo.getEmail());
        if (userByEmail.isPresent()) {
            NguoiDung user = userByEmail.get();
            user.setGoogleId(googleUserInfo.getGoogleId());
            user.setAnhDaiDien(googleUserInfo.getPicture());
            user.setLanDangNhapCuoi(LocalDateTime.now());
            return nguoiDungRepository.save(user);
        }

        // Tạo user mới
        VaiTro vaiTroKhach = vaiTroRepository.findByTenVaiTro(VaiTroConst.KHACH_HANG)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vai trò Khách hàng"));

        // Tạo username từ email
        String username = generateUniqueUsername(googleUserInfo.getEmail());

        NguoiDung newUser = NguoiDung.builder()
                .tenDangNhap(username)
                .googleId(googleUserInfo.getGoogleId())
                .email(googleUserInfo.getEmail())
                .hoTen(googleUserInfo.getName())
                .anhDaiDien(googleUserInfo.getPicture())
                .matKhauMaHoa(passwordEncoder.encode(UUID.randomUUID().toString())) // Random password
                .vaiTro(vaiTroKhach)
                .dangHoatDong(true)
                .lanDangNhapCuoi(LocalDateTime.now())
                .build();

        newUser = nguoiDungRepository.save(newUser);

        // Tạo giỏ hàng
        GioHang gioHang = GioHang.builder()
                .nguoiDung(newUser)
                .build();
        gioHangRepository.save(gioHang);

        // Gửi email chào mừng
        mailService.guiMailChaoMung(
                newUser.getEmail(),
                newUser.getHoTen(),
                newUser.getTenDangNhap()
        );

        return newUser;
    }

    /**
     * Tạo username duy nhất từ email
     */
    private String generateUniqueUsername(String email) {
        String baseUsername = email.split("@")[0].toLowerCase();
        String username = baseUsername;
        int count = 1;

        while (nguoiDungRepository.existsByTenDangNhap(username)) {
            username = baseUsername + count;
            count++;
        }

        return username;
    }
}


