-- Add audit action for hard-deleting custom colors.
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'COLOR_DELETED';
