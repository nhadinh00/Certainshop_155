# Google Login Setup Checklist

## Prerequisites
- [ ] Node.js and npm installed
- [ ] Java 17+ installed
- [ ] SQL Server installed and running
- [ ] Google Cloud Console account

## Setup Steps

### 1. Backend Setup

#### Step 1.1: Update Dependencies
- [x] Added Google API libraries to `pom.xml`
- [x] Updated dependencies: google-auth-library-oauth2-http, google-oauth-client, google-api-client

#### Step 1.2: Create Google Auth Service
- [x] Created `GoogleAuthService.java`
- [x] Created `GoogleUserInfo.java` DTO
- [x] Added token verification logic

#### Step 1.3: Update NguoiDung Entity
- [x] Added `googleId` field to `NguoiDung.java`
- [x] Made `matKhauMaHoa` nullable

#### Step 1.4: Update Repository
- [x] Added `findByGoogleId()` method to `NguoiDungRepository`

#### Step 1.5: Update NguoiDungService
- [x] Added `googleLogin()` method
- [x] Added `generateUniqueUsername()` helper method
- [x] Handles new user creation and existing user login

#### Step 1.6: Add API Endpoint
- [x] Added `POST /api/auth/google-login` endpoint
- [x] Updated `AuthApiController` with Google login handler
- [x] Added Google auth service injection

#### Step 1.7: Configuration
- [x] Added Google Client ID to `application.properties`
- [x] Property: `app.google.client-id=34289910572-cg6241qhtp4067apids09o0hef3mdfga.apps.googleusercontent.com`

#### Step 1.8: Database Migrations
- [x] Created `V006__Add_GoogleId_To_NguoiDung.sql`
- [x] Created `V007__Make_MatKhauMaHoa_Nullable.sql`

### 2. Frontend Setup

#### Step 2.1: Verify Dependencies
- [x] `@react-oauth/google` already installed in `package.json`

#### Step 2.2: Create Google Login Button Component
- [x] Created `src/components/GoogleLoginButton.tsx`
- [x] Implemented Google sign-in flow
- [x] Added error handling and toast notifications

#### Step 2.3: Update Login Page
- [x] Updated `src/pages/DangNhapPage.tsx`
- [x] Added Google login button
- [x] Added divider between traditional and Google login

#### Step 2.4: Update API Service
- [x] Added `googleLogin()` method to `authApi`
- [x] Endpoint: `/auth/google-login`

#### Step 2.5: Setup Google OAuth Provider
- [x] Updated `src/main.tsx`
- [x] Wrapped App with `GoogleOAuthProvider`
- [x] Set Client ID: `34289910572-cg6241qhtp4067apids09o0hef3mdfga.apps.googleusercontent.com`

### 3. Testing

#### Before Running
- [ ] Run database migrations
- [ ] Rebuild backend: `mvn clean install`
- [ ] Rebuild frontend: `npm install`

#### Test Traditional Login
- [ ] Start backend on http://localhost:8080
- [ ] Start frontend on http://localhost:5173
- [ ] Test traditional username/password login still works

#### Test Google Login (New User)
- [ ] Navigate to /dang-nhap
- [ ] Click "Đăng nhập với Google"
- [ ] Authenticate with a Google account (never used before)
- [ ] Verify:
  - [ ] JWT token created
  - [ ] User info stored in localStorage
  - [ ] User created in database
  - [ ] Shopping cart created automatically
  - [ ] Profile picture loaded
  - [ ] Redirected to home page

#### Test Google Login (Existing User)
- [ ] Create traditional user: testuser@example.com
- [ ] Logout
- [ ] Click "Đăng nhập với Google"
- [ ] Authenticate with same email
- [ ] Verify:
  - [ ] No duplicate user created
  - [ ] GoogleId linked to existing user
  - [ ] User can login

#### Test Admin/Staff Roles
- [ ] Create traditional admin user
- [ ] Try Google login with different account
- [ ] Verify regular customer access (not admin dashboard)
- [ ] Create admin user via Google if system supports it
- [ ] Verify admin access works

### 4. Verification Commands

#### Backend Health Check
```bash
# Check if auth endpoint is accessible
curl -X POST http://localhost:8080/api/auth/toi \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Database Verification
```sql
-- Check if GoogleId column exists
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'NguoiDung' AND COLUMN_NAME = 'GoogleId';

-- Check users with Google login
SELECT * FROM NguoiDung WHERE GoogleId IS NOT NULL;
```

#### Frontend Console Check
- [ ] Open browser DevTools (F12)
- [ ] Go to Console tab
- [ ] No red errors during Google login
- [ ] Token visible in localStorage under `auth-storage`

### 5. Configuration Verification

#### Backend Configuration
```bash
# Verify application.properties has Google Client ID
grep "app.google.client-id" certainshop-be/certainshop-be/src/main/resources/application.properties
```

#### Frontend Configuration
```bash
# Verify main.tsx has GoogleOAuthProvider
grep -A 3 "GoogleOAuthProvider" certainshop-fe/src/main.tsx
```

### 6. Common Issues & Fixes

#### Issue: Port 8080 already in use
```bash
# Kill process on port 8080
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

#### Issue: Database connection fails
```bash
# Verify SQL Server is running
sqlcmd -S localhost -U sa -P 123456
```

#### Issue: Google API libraries not found
```bash
# Rebuild Maven
cd certainshop-be
mvn clean install
```

#### Issue: CORS errors
- Verify `app.cors.allowedOrigins` includes http://localhost:5173
- Check browser console for specific CORS error

### 7. Deployment Checklist

Before deploying to production:
- [ ] Update `app.google.client-id` for production
- [ ] Update `app.cors.allowedOrigins` for production domain
- [ ] Update `app.fe.url` for production frontend URL
- [ ] Run all database migrations
- [ ] Test all authentication flows
- [ ] Verify email delivery (for new user welcome emails)
- [ ] Setup SSL/HTTPS for production
- [ ] Update Google OAuth consent screen
- [ ] Add production domain to Google Cloud Console

### 8. Files Modified/Created

#### Created Files:
- `src/main/java/com/certainshop/service/GoogleAuthService.java`
- `src/main/java/com/certainshop/service/GoogleUserInfo.java`
- `src/main/resources/db/migration/V006__Add_GoogleId_To_NguoiDung.sql`
- `src/main/resources/db/migration/V007__Make_MatKhauMaHoa_Nullable.sql`
- `src/components/GoogleLoginButton.tsx`
- `GOOGLE_LOGIN.md`
- `SETUP_CHECKLIST.md` (this file)

#### Modified Files:
- `pom.xml` - Added Google libraries
- `application.properties` - Added Google Client ID
- `entity/NguoiDung.java` - Added googleId field, nullable password
- `repository/NguoiDungRepository.java` - Added findByGoogleId
- `service/NguoiDungService.java` - Added googleLogin method
- `controller/api/AuthApiController.java` - Added Google login endpoint
- `package.json` - Already has @react-oauth/google
- `src/pages/DangNhapPage.tsx` - Added Google login button
- `src/services/api.ts` - Added googleLogin method
- `src/main.tsx` - Added GoogleOAuthProvider

## Success Criteria

✓ All files created and modified
✓ Backend compiles without errors
✓ Frontend builds without errors
✓ Database migrations run successfully
✓ Traditional login still works
✓ Google login works for new users
✓ Google login works for existing users
✓ User profiles display correctly
✓ Admin/staff roles work correctly
✓ Profile pictures load from Google
✓ Email notifications sent to new users

## Support

For issues or questions, refer to:
1. [GOOGLE_LOGIN.md](./GOOGLE_LOGIN.md) - Detailed implementation guide
2. [Spring Boot Documentation](https://spring.io/projects/spring-boot)
3. [React Google Login Documentation](https://github.com/react-oauth/react-oauth.google)
4. [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
