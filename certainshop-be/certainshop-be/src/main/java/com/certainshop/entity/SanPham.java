package com.certainshop.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "SanPham")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SanPham {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Long id;

    @Column(name = "MaSanPham", length = 50)
    private String maSanPham;

    @Column(name = "TenSanPham", length = 255)
    private String tenSanPham;

    @Column(name = "MoTa", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;

    @Column(name = "GiaGoc", precision = 18, scale = 2)
    private BigDecimal giaGoc;

    @Column(name = "GiaBan", precision = 18, scale = 2)
    private BigDecimal giaBan;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "DanhMucId")
    private DanhMuc danhMuc;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ThuongHieuId")
    private ThuongHieu thuongHieu;

    @Column(name = "AnhChinh", length = 500)
    private String anhChinh;

    @Column(name = "DuongDan", length = 255)
    private String duongDan;

    @Column(name = "TrangThaiSanPham", length = 30)
    private String trangThaiSanPham = "DANG_BAN"; // DANG_BAN | NGUNG_BAN | HET_HANG

    @Column(name = "TrangThai", nullable = false)
    private Boolean trangThai = true; // true = active, false = deleted (soft delete)

    @Column(name = "ThoiGianTao")
    private LocalDateTime thoiGianTao;

    @Column(name = "ThoiGianCapNhat")
    private LocalDateTime thoiGianCapNhat;

    @OneToMany(mappedBy = "sanPham", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<BienThe> danhSachBienThe;

    // Helper for backward compatibility
    public boolean isTrangThai() {
        return "DANG_BAN".equals(trangThaiSanPham);
    }

    public void setTrangThai(boolean active) {
        // Update BOTH the Boolean flag AND the status string
        this.trangThai = active;  //  Set soft-delete flag
        this.trangThaiSanPham = active ? "DANG_BAN" : "NGUNG_BAN";  //  Set status
    }

    @PrePersist
    protected void truocKhiTao() {
        LocalDateTime now = LocalDateTime.now();
        thoiGianTao = now;
        thoiGianCapNhat = now;  // Set on creation too
        if (trangThaiSanPham == null) trangThaiSanPham = "DANG_BAN";
        if (trangThai == null) trangThai = true;
    }

    @PreUpdate
    protected void truocKhiCapNhat() {
        thoiGianCapNhat = LocalDateTime.now();
    }
}
