package com.certainshop.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
public class UploadStorageProperties {

    private final Path uploadImagesDir;
    private final Path uploadsRootDir;
    private final Path legacyUploadsRootDir;

    public UploadStorageProperties(@Value("${app.upload.dir:${user.home}/certainshop/uploads/images}") String configuredUploadDir) {
        this.uploadImagesDir = Paths.get(configuredUploadDir).toAbsolutePath().normalize();
        this.uploadsRootDir = this.uploadImagesDir.getParent();
        this.legacyUploadsRootDir = Paths.get("uploads").toAbsolutePath().normalize();
    }

    @PostConstruct
    void ensureDirectoriesExist() throws IOException {
        Files.createDirectories(uploadImagesDir);
    }

    public Path getUploadImagesDir() {
        return uploadImagesDir;
    }

    public Path getUploadsRootDir() {
        return uploadsRootDir;
    }

    public Path getLegacyUploadsRootDir() {
        return legacyUploadsRootDir;
    }

    public String toPublicImagePath(String fileName) {
        return "/uploads/images/" + fileName;
    }
}