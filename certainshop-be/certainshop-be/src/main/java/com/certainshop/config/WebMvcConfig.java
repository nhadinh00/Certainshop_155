package com.certainshop.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

        private final UploadStorageProperties uploadStorageProperties;

        public WebMvcConfig(UploadStorageProperties uploadStorageProperties) {
                this.uploadStorageProperties = uploadStorageProperties;
        }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
                // Phục vụ ảnh từ thư mục cấu hình tuyệt đối và giữ fallback cho dữ liệu cũ.
                String uploadRootUri = uploadStorageProperties.getUploadsRootDir().toUri().toString();
                String legacyUploadRootUri = uploadStorageProperties.getLegacyUploadsRootDir().toUri().toString();

        registry.addResourceHandler("/uploads/**")
                                .addResourceLocations(uploadRootUri, legacyUploadRootUri);

        // CSS, JS, images tĩnh
        registry.addResourceHandler("/css/**")
                .addResourceLocations("classpath:/static/css/");
        registry.addResourceHandler("/js/**")
                .addResourceLocations("classpath:/static/js/");
        registry.addResourceHandler("/img/**")
                .addResourceLocations("classpath:/static/img/");
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
