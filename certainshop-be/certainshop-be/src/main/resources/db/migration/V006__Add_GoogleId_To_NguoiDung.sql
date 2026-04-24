-- Add GoogleId column to NguoiDung table for Google OAuth integration
ALTER TABLE NguoiDung ADD GoogleId NVARCHAR(255) NULL UNIQUE;
