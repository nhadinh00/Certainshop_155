package com.certainshop.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.Base64;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class GoogleAuthService {

    @Value("${app.google.client-id}")
    private String googleClientId;

    private final ObjectMapper objectMapper;

    /**
     * Extract user info from Google JWT token
     * The token is in format: header.payload.signature
     * We decode the payload part which contains user information
     */
    public GoogleUserInfo extractUserInfo(String accessToken) {
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setBearerAuth(accessToken);
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>("", headers);
            
            org.springframework.http.ResponseEntity<Map> response = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v3/userinfo", 
                    org.springframework.http.HttpMethod.GET, 
                    entity, 
                    Map.class);
                    
            @SuppressWarnings("unchecked")
            Map<String, Object> userInfo = response.getBody();
            if (userInfo == null) {
                throw new RuntimeException("Failed to get user info from Google");
            }
            
            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");
            String picture = (String) userInfo.get("picture");
            String sub = (String) userInfo.get("sub");
            
            if (email == null || sub == null) {
                throw new RuntimeException("Missing required claims in Google response");
            }

            return GoogleUserInfo.builder()
                    .googleId(sub)
                    .email(email)
                    .name(name != null ? name : email.split("@")[0])
                    .picture(picture)
                    .build();
        } catch (Exception e) {
            log.error("Failed to extract user info using Google access token: {}", e.getMessage());
            throw new RuntimeException("Invalid Google token: " + e.getMessage());
        }
    }
}


