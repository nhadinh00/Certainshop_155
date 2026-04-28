-- Make MatKhauMaHoa nullable for Google OAuth users
ALTER TABLE NguoiDung ALTER COLUMN MatKhauMaHoa NVARCHAR(255) NULL;
