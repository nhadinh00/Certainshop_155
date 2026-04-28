# Google Login Implementation Guide

## Overview
This document provides a comprehensive guide for the Google OAuth2 login implementation for the CertainShop React + Spring Boot application.

## Architecture

### Frontend (React + TypeScript)
- Uses `@react-oauth/google` library to handle Google authentication
- `GoogleLoginButton` component wraps the Google sign-in functionality
- Sends access token to backend for verification
- Stores JWT token and user info in Zustand store

### Backend (Spring Boot)
- Verifies Google access token using Google API Client library
- Creates/updates user in database on successful authentication
- Generates JWT token for session management
- Automatically creates shopping cart for new Google users

## Implementation Details

### 1. Dependencies

**Backend (pom.xml):**
```xml
<!-- Google API Client -->
<dependency>
    <groupId>com.google.auth</groupId>
    <artifactId>google-auth-library-oauth2-http</artifactId>
    <version>1.14.0</version>
</dependency>
<dependency>
    <groupId>com.google.oauth-client</groupId>
    <artifactId>google-oauth-client</artifactId>
    <version>1.36.0</version>
</dependency>
<dependency>
    <groupId>com.google.apis</groupId>
    <artifactId>google-api-client</artifactId>
    <version>1.36.2</version>
</dependency>
```

**Frontend (package.json):**
- `@react-oauth/google`: ^0.13.5 (already installed)

### 2. Configuration

**application.properties:**
```properties
# Google OAuth
app.google.client-id=34289910572-cg6241qhtp4067apids09o0hef3mdfga.apps.googleusercontent.com
```

### 3. Database Schema

**Migration V006**: Adds `GoogleId` column to `NguoiDung` table
```sql
ALTER TABLE NguoiDung ADD GoogleId NVARCHAR(255) NULL UNIQUE;
```

**Migration V007**: Makes `MatKhauMaHoa` nullable for Google users
```sql
ALTER TABLE NguoiDung ALTER COLUMN MatKhauMaHoa NVARCHAR(255) NULL;
```

### 4. Backend Components

#### GoogleAuthService
Location: `src/main/java/com/certainshop/service/GoogleAuthService.java`

Responsible for:
- Verifying Google ID tokens
- Extracting user information from the token payload
- Handling token verification errors

```java
public GoogleUserInfo extractUserInfo(String idToken)
```

#### GoogleUserInfo
Location: `src/main/java/com/certainshop/service/GoogleUserInfo.java`

DTO containing:
- `googleId`: Unique Google user identifier
- `email`: User's email
- `name`: User's display name
- `picture`: User's profile picture URL

#### NguoiDungService Google Login
Method: `googleLogin(GoogleUserInfo googleUserInfo)`

Logic:
1. Check if user exists by Google ID → update and return
2. Check if user exists by email → link Google ID and return
3. Create new user with generated username from email
4. Create shopping cart for new user
5. Send welcome email

#### AuthApiController Endpoint
Endpoint: `POST /api/auth/google-login`

Request:
```json
{
  "idToken": "google_access_token"
}
```

Response:
```json
{
  "thanhCong": true,
  "thongBao": "Đăng nhập Google thành công",
  "duLieu": {
    "token": "jwt_token",
    "tokenType": "Bearer",
    "nguoiDung": {
      "id": 1,
      "tenDangNhap": "user_email",
      "hoTen": "User Name",
      "email": "user@example.com",
      "vaiTro": "KHACH_HANG",
      "anhDaiDien": "profile_picture_url",
      ...
    }
  }
}
```

### 5. Frontend Components

#### GoogleLoginButton
Location: `src/components/GoogleLoginButton.tsx`

Features:
- Uses `useGoogleLogin` hook with implicit flow
- Handles successful/failed login
- Calls `/api/auth/google-login` endpoint
- Stores JWT and user info in auth store
- Redirects to appropriate page (admin dashboard or home)

Usage:
```tsx
<GoogleLoginButton text="Đăng nhập với Google" />
```

#### DangNhapPage Update
Added Google login button with divider between traditional and Google login methods

### 6. GoogleOAuthProvider Setup
Location: `src/main.tsx`

Wraps entire React app with `GoogleOAuthProvider`:
```tsx
<GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
  <App />
</GoogleOAuthProvider>
```

### 7. API Service Update
Location: `src/services/api.ts`

Added method:
```typescript
googleLogin: (accessToken: string) =>
  api.post<ApiResponse<{ token: string; tokenType: string; nguoiDung: User }>>
    ('/auth/google-login', { idToken: accessToken })
```

## User Flow

### New User (First Time Google Login)
1. User clicks "Đăng nhập với Google"
2. Google authentication popup appears
3. User authenticates with Google
4. Frontend sends access token to backend
5. Backend creates new user with:
   - Username: generated from email
   - Google ID: linked
   - Profile picture: from Google
   - Default role: KHACH_HANG (Customer)
6. Backend creates shopping cart
7. Backend generates JWT token
8. Frontend stores JWT and user info
9. User redirected to home page

### Existing User (Returning Google Login)
1. User clicks "Đăng nhập với Google"
2. Google authentication popup appears
3. Backend finds user by Google ID or email
4. Backend updates last login time
5. Backend generates JWT token
6. Frontend stores JWT and user info
7. User redirected accordingly

### Email Matching
If a user:
1. Registers traditionally with email: user@example.com
2. Later tries Google login with same email
3. Backend links Google ID to existing account
4. No duplicate users created

## Security Considerations

1. **Token Verification**: Google tokens are verified server-side using Google API Client
2. **CORS**: Only trusted origins can send requests to auth endpoints
3. **JWT**: Tokens are short-lived (24 hours) and verified on each request
4. **Password**: Google users get random password during account creation (never used)
5. **Database**: GoogleId is unique and indexed for security

## Testing

### Test Google Login Flow
1. Start backend: `mvn spring-boot:run`
2. Start frontend: `npm run dev`
3. Navigate to login page: http://localhost:5173/dang-nhap
4. Click "Đăng nhập với Google"
5. Authenticate with Google account
6. Verify JWT token in browser localStorage
7. Verify user profile in database

### Test User Linking
1. Register new user traditionally with email: test@example.com
2. Logout
3. Click "Đăng nhập với Google"
4. Authenticate with same email (test@example.com)
5. Verify no duplicate user created
6. Verify GoogleId linked to existing user

## Troubleshooting

### Issue: "Invalid Google token"
- **Cause**: Token verification failed
- **Solution**: Verify Client ID matches in frontend and backend
- **Check**: `app.google.client-id` in application.properties

### Issue: "Google login button not showing"
- **Cause**: GoogleOAuthProvider not wrapping app
- **Solution**: Verify `main.tsx` has GoogleOAuthProvider
- **Check**: Reload page and check browser console for errors

### Issue: "CORS error when calling /api/auth/google-login"
- **Cause**: CORS not configured
- **Solution**: Verify backend CORS settings
- **Check**: `app.cors.allowedOrigins` in application.properties

### Issue: Duplicate users being created
- **Cause**: Email matching logic not working
- **Solution**: Verify email is provided in Google token
- **Check**: Google account has verified email

## Database Queries

### Find user by Google ID
```sql
SELECT * FROM NguoiDung WHERE GoogleId = 'google_id_value';
```

### Find users who linked Google later
```sql
SELECT * FROM NguoiDung WHERE GoogleId IS NOT NULL AND GoogleId != '';
```

### Check user profile picture from Google
```sql
SELECT TenDangNhap, Email, AnhDaiDien FROM NguoiDung 
WHERE GoogleId IS NOT NULL;
```

## API Endpoint Reference

### POST /api/auth/google-login
Authenticate with Google token

**Request:**
```bash
curl -X POST http://localhost:8080/api/auth/google-login \
  -H "Content-Type: application/json" \
  -d '{"idToken": "google_access_token"}'
```

**Success Response (200):**
```json
{
  "thanhCong": true,
  "thongBao": "Đăng nhập Google thành công",
  "duLieu": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "nguoiDung": {
      "id": 123,
      "tenDangNhap": "user_email",
      "hoTen": "User Name",
      "email": "user@example.com",
      "soDienThoai": "",
      "vaiTro": "KHACH_HANG",
      "anhDaiDien": "https://..."
    }
  }
}
```

**Error Response (401):**
```json
{
  "thanhCong": false,
  "thongBao": "Xác minh Google token thất bại: ...",
  "maLoi": 401
}
```

## Future Enhancements

1. **Refresh Token**: Implement refresh token for extended sessions
2. **Scope Permissions**: Request additional Google permissions (calendar, drive, etc.)
3. **Social Linking**: Allow linking multiple social accounts
4. **Profile Sync**: Periodically sync user profile from Google
5. **One-Tap Sign-Up**: Implement Google One-Tap for faster signup

## References

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [React Google Login Library](https://github.com/react-oauth/react-oauth.google)
- [Google API Client Library for Java](https://github.com/googleapis/google-api-java-client)
- [Spring Boot Security](https://spring.io/projects/spring-security)
