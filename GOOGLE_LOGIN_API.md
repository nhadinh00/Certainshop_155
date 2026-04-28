# Google Login API Reference

## Endpoints

### POST /api/auth/google-login
Authenticate user with Google token and receive JWT

#### Request
```http
POST /api/auth/google-login HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "idToken": "GOOGLE_ACCESS_TOKEN_FROM_FRONTEND"
}
```

#### Success Response (200 OK)
```json
{
  "thanhCong": true,
  "thongBao": "Đăng nhập Google thành công",
  "duLieu": {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlcjEyMyIsImlhdCI6MTcwMjU4MTIzNCwiZXhwIjoxNzAyNjY3NjM0LCJyb2xlcyI6WyJST0xFX0tIQUNIX0hBTkcifX0.abc123...",
    "tokenType": "Bearer",
    "nguoiDung": {
      "id": 1,
      "tenDangNhap": "testuser123",
      "hoTen": "Test User",
      "email": "testuser@example.com",
      "soDienThoai": "",
      "vaiTro": "KHACH_HANG",
      "anhDaiDien": "https://lh3.googleusercontent.com/a/default-user"
    }
  }
}
```

#### Error Response (401 Unauthorized)
```json
{
  "thanhCong": false,
  "thongBao": "Xác minh Google token thất bại: Invalid Google token",
  "maLoi": 401
}
```

#### Error Response (500 Internal Server Error)
```json
{
  "thanhCong": false,
  "thongBao": "Lỗi khi xử lý đăng nhập Google",
  "maLoi": 500
}
```

## cURL Examples

### Test Google Login with Token
```bash
curl -X POST http://localhost:8080/api/auth/google-login \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "YOUR_GOOGLE_ACCESS_TOKEN_HERE"
  }'
```

### Using Returned JWT Token
```bash
curl -X GET http://localhost:8080/api/auth/toi \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Create Shopping Cart (Auto-done on Google Login)
```bash
curl -X GET http://localhost:8080/api/gio-hang \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Frontend Implementation

### Using GoogleLoginButton Component
```tsx
import GoogleLoginButton from './components/GoogleLoginButton';

export default function MyPage() {
  return (
    <div>
      <GoogleLoginButton text="Sign in with Google" />
    </div>
  );
}
```

### Manual Google Login Implementation
```tsx
import { useGoogleLogin } from '@react-oauth/google';
import { authApi } from './services/api';
import { useAuthStore } from './stores/authStore';

export default function MyComponent() {
  const { setAuth } = useAuthStore();

  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        const response = await authApi.googleLogin(codeResponse.access_token);
        const { token, nguoiDung } = response.data.duLieu;
        setAuth(token, nguoiDung);
        // Redirect user
      } catch (error) {
        console.error('Login failed:', error);
      }
    },
    flow: 'implicit',
  });

  return (
    <button onClick={() => googleLogin()}>
      Sign in with Google
    </button>
  );
}
```

## Backend Service Methods

### GoogleAuthService
```java
// Verify and extract user info from Google token
GoogleUserInfo userInfo = googleAuthService.extractUserInfo(idToken);
// Returns: { googleId, email, name, picture }
```

### NguoiDungService
```java
// Handle Google login - creates user if new, updates if exists
NguoiDung user = nguoiDungService.googleLogin(googleUserInfo);
```

### JwtUtil
```java
// Generate JWT token from UserDetails
String token = jwtUtil.taoToken(userDetails);

// Extract username from token
String tenDangNhap = jwtUtil.layTenDangNhap(token);

// Verify token validity
boolean isValid = jwtUtil.tokenHopLe(token);
```

## Database Queries

### Find User by Google ID
```sql
SELECT * FROM NguoiDung 
WHERE GoogleId = 'google_user_id_here';
```

### Find Users with Google Login Linked
```sql
SELECT Id, TenDangNhap, Email, HoTen, GoogleId, AnhDaiDien 
FROM NguoiDung 
WHERE GoogleId IS NOT NULL;
```

### Check If Email Has Google Linked
```sql
SELECT Id, TenDangNhap, GoogleId 
FROM NguoiDung 
WHERE Email = 'user@example.com' AND GoogleId IS NOT NULL;
```

### Get Last Login Time
```sql
SELECT Id, TenDangNhap, Email, LanDangNhapCuoi 
FROM NguoiDung 
WHERE GoogleId IS NOT NULL 
ORDER BY LanDangNhapCuoi DESC;
```

## Configuration Reference

### Backend Configuration (application.properties)
```properties
# Google OAuth Configuration
app.google.client-id=34289910572-cg6241qhtp4067apids09o0hef3mdfga.apps.googleusercontent.com

# CORS Configuration
app.cors.allowedOrigins=http://localhost:5173,http://localhost:3000

# JWT Configuration (related)
app.jwt.secret=certainshop-super-secret-jwt-key-2025-must-be-at-least-256-bits-long
app.jwt.expiration=86400000
```

### Frontend Configuration (main.tsx)
```tsx
const GOOGLE_CLIENT_ID = '34289910572-cg6241qhtp4067apids09o0hef3mdfga.apps.googleusercontent.com'

<GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
  <App />
</GoogleOAuthProvider>
```

## Request/Response Flow Diagram

```
┌─────────────┐                                    ┌──────────────┐
│   Browser   │                                    │ Google OAuth │
│  (Frontend) │                                    │    Server    │
└──────┬──────┘                                    └──────┬───────┘
       │                                                  │
       │  1. User clicks "Sign in with Google"           │
       │─────────────────────────────────────────────────│
       │                                                  │
       │  2. Google auth popup                           │
       │<─────────────────────────────────────────────────
       │                                                  │
       │  3. User authenticates                          │
       ├─────────────────────────────────────────────────>
       │                                                  │
       │  4. Google returns access_token                 │
       │<─────────────────────────────────────────────────
       │
       │  5. Send access_token to /api/auth/google-login
       │
       ├──────────────────────┐
       │                      │
       │                      ▼
       │              ┌──────────────────┐
       │              │  Spring Backend  │
       │              │                  │
       │              │ 1. Verify token  │
       │              │ 2. Extract info  │
       │              │ 3. Find/Create   │
       │              │    user in DB    │
       │              │ 4. Create JWT    │
       │              │ 5. Return JWT    │
       │              └──────────────────┘
       │                      │
       │  6. Return JWT token │
       │<─────────────────────┘
       │
       │  7. Store in localStorage
       │  8. Redirect to /
       ▼
   Logged in!
```

## Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Login successful, JWT returned |
| 400 | Bad Request | Missing or invalid request body |
| 401 | Unauthorized | Invalid Google token |
| 500 | Server Error | Internal server error during processing |

## Token Usage

After successful Google login, use the returned JWT token for all subsequent requests:

```bash
curl -X GET http://localhost:8080/api/auth/toi \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

The token is automatically included in all API requests via the axios interceptor in `src/services/api.ts`.

## Troubleshooting

### Token Validation Error
**Issue:** "Invalid Google token"
**Cause:** Token expired or wrong client ID
**Solution:** 
1. Verify `app.google.client-id` in application.properties
2. Check token not older than 1 hour
3. Clear browser cache and retry

### CORS Error
**Issue:** "Access to XMLHttpRequest has been blocked by CORS policy"
**Solution:**
1. Verify frontend URL in `app.cors.allowedOrigins`
2. Check request headers
3. Restart backend after config change

### Database Error
**Issue:** "Duplicate key value violates unique constraint 'GoogleId'"
**Cause:** Multiple users with same Google ID
**Solution:**
1. Manual DB cleanup required
2. Check for data integrity issues
3. Restart app

### Email Mismatch
**Issue:** User gets "duplicate email" error with Google
**Cause:** Email already registered, not linked
**Solution:** User should login traditionally first, then link Google

## Security Notes

1. **Token Verification**: Always verify Google tokens server-side
2. **HTTPS Only**: Use HTTPS in production
3. **Token Storage**: JWT stored in localStorage (consider using HttpOnly cookies)
4. **CORS**: Only allow trusted domains
5. **Rate Limiting**: Implement rate limiting on auth endpoints
6. **Logging**: Log all authentication attempts for security audit

## Performance Optimization

- Google token verification is cached by Google API client
- JWT tokens are lightweight and stateless
- User lookup is indexed by GoogleId for fast retrieval
- Shopping cart creation is asynchronous (non-blocking)

## Production Deployment

Before deploying to production, update:

1. **Client ID**: Use production Client ID from Google Cloud Console
2. **Secret Key**: Use strong secret key in `app.jwt.secret`
3. **CORS Origins**: Update to production domain
4. **Database**: Run migrations on production database
5. **Emails**: Configure email service for production
6. **HTTPS**: Enable SSL/TLS certificate
7. **Monitoring**: Setup logging and monitoring
