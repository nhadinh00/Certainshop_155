package com.certainshop.controller.api;

import com.certainshop.dto.ApiResponse;
import com.certainshop.entity.NguoiDung;
import com.certainshop.service.NguoiDungService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/quan-ly/nguoi-dung")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','NHAN_VIEN')")
public class QuanLyNguoiDungApiController {

    private final NguoiDungService nguoiDungService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> danhSach(
            @RequestParam(defaultValue = "") String tuKhoa,
            @RequestParam(defaultValue = "0") int trang,
            @RequestParam(defaultValue = "20") int kichThuocTrang,
            @RequestParam(required = false) String tenVaiTro,
            @RequestParam(required = false) Boolean dangHoatDong) {
        Pageable pageable = PageRequest.of(trang, kichThuocTrang);
        String tuKhoaFilter = tuKhoa.isEmpty() ? null : tuKhoa;
        String vaiTroFilter = (tenVaiTro != null && !tenVaiTro.isBlank()) ? tenVaiTro : null;
        Page<NguoiDung> page = nguoiDungService.timKiem(tuKhoaFilter, vaiTroFilter, dangHoatDong, pageable);
        Map<String, Object> result = Map.of(
                "nguoiDung", page.getContent(),
                "tongSo", page.getTotalElements(),
                "tongTrang", page.getTotalPages(),
                "trang", trang
        );
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NguoiDung>> chiTiet(@PathVariable Long id) {
        return nguoiDungService.timTheoId(id)
                .map(nd -> ResponseEntity.ok(ApiResponse.ok(nd)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NguoiDung>> capNhat(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            NguoiDung thongTinMoi = new NguoiDung();
            thongTinMoi.setHoTen(body.get("hoTen"));
            thongTinMoi.setEmail(body.get("email"));
            thongTinMoi.setSoDienThoai(body.get("soDienThoai"));
            NguoiDung updated = nguoiDungService.capNhatThongTin(id, thongTinMoi);
            return ResponseEntity.ok(ApiResponse.ok(updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.loi(e.getMessage()));
        }
    }

    @PutMapping("/{id}/trang-thai")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> doiTrangThai(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        Boolean dangHoatDong = body.get("dangHoatDong");
        if (dangHoatDong == null) {
            return ResponseEntity.badRequest().body(ApiResponse.loi("Thiếu trạng thái"));
        }
        try {
            nguoiDungService.doiTrangThaiTaiKhoan(id, dangHoatDong);
            String msg = dangHoatDong ? "Đã kích hoạt tài khoản" : "Đã khóa tài khoản";
            return ResponseEntity.ok(ApiResponse.ok(msg, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.loi(e.getMessage()));
        }
    }

    @PutMapping("/{id}/vai-tro")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> doiVaiTro(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        Integer vaiTroId = body.get("vaiTroId");
        if (vaiTroId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.loi("Thiếu vaiTroId"));
        }
        try {
            nguoiDungService.doiVaiTro(id, vaiTroId);
            return ResponseEntity.ok(ApiResponse.ok("Đổi vai trò thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.loi(e.getMessage()));
        }
    }

    @PostMapping("/nhan-vien")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NguoiDung>> taoNhanVien(
            @RequestBody Map<String, Object> body) {
        try {
            NguoiDung nv = new NguoiDung();
            nv.setTenDangNhap((String) body.get("tenDangNhap"));
            nv.setEmail((String) body.get("email"));
            nv.setHoTen((String) body.get("hoTen"));
            nv.setSoDienThoai((String) body.get("soDienThoai"));
            String matKhau = (String) body.get("matKhau");
            Integer vaiTroId = body.get("vaiTroId") instanceof Integer i ? i : 2;
            NguoiDung saved = nguoiDungService.taoNhanVien(nv, matKhau, vaiTroId);
            return ResponseEntity.ok(ApiResponse.ok("Tạo nhân viên thành công", saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.loi(e.getMessage()));
        }
    }
}

