-- AlterEnum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'NotificationType'
      AND e.enumlabel = 'EVENT_COMPLETED'
  ) THEN
    ALTER TYPE "NotificationType" ADD VALUE 'EVENT_COMPLETED';
  END IF;
END $$;
