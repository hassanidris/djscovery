-- Update ReputationHistory.changeReason if it's still a string
DO $$
BEGIN
  -- Check if column exists and is still a string type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reputationhistory' 
    AND column_name = 'changeReason'
    AND data_type = 'character varying'
  ) THEN
    -- Add new column with enum type (nullable initially)
    ALTER TABLE "ReputationHistory" ADD COLUMN "change_reason_new" "ReputationChangeReason";
    
    -- Copy data from old string column to new enum column
    UPDATE "ReputationHistory" 
    SET "change_reason_new" = "changeReason"::text::"ReputationChangeReason";
    
    -- Drop old column
    ALTER TABLE "ReputationHistory" DROP COLUMN "changeReason";
    
    -- Rename new column to original name
    ALTER TABLE "ReputationHistory" RENAME COLUMN "change_reason_new" TO "changeReason";
    
    -- Make column NOT NULL
    ALTER TABLE "ReputationHistory" ALTER COLUMN "changeReason" SET NOT NULL;
  END IF;
END
$$;

-- Update OrganizerReputationHistory.changeReason if it's still a string
DO $$
BEGIN
  -- Check if column exists and is still a string type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizerreputationhistory' 
    AND column_name = 'changeReason'
    AND data_type = 'character varying'
  ) THEN
    -- Add new column with enum type (nullable initially)
    ALTER TABLE "OrganizerReputationHistory" ADD COLUMN "change_reason_new" "ReputationChangeReason";
    
    -- Copy data from old string column to new enum column
    UPDATE "OrganizerReputationHistory" 
    SET "change_reason_new" = "changeReason"::text::"ReputationChangeReason";
    
    -- Drop old column
    ALTER TABLE "OrganizerReputationHistory" DROP COLUMN "changeReason";
    
    -- Rename new column to original name
    ALTER TABLE "OrganizerReputationHistory" RENAME COLUMN "change_reason_new" TO "changeReason";
    
    -- Make column NOT NULL
    ALTER TABLE "OrganizerReputationHistory" ALTER COLUMN "changeReason" SET NOT NULL;
  END IF;
END
$$;

-- Update VenueReputationHistory.changeReason if it's still a string
DO $$
BEGIN
  -- Check if column exists and is still a string type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'venuereputationhistory' 
    AND column_name = 'changeReason'
    AND data_type = 'character varying'
  ) THEN
    -- Add new column with enum type (nullable initially)
    ALTER TABLE "VenueReputationHistory" ADD COLUMN "change_reason_new" "ReputationChangeReason";
    
    -- Copy data from old string column to new enum column
    UPDATE "VenueReputationHistory" 
    SET "change_reason_new" = "changeReason"::text::"ReputationChangeReason";
    
    -- Drop old column
    ALTER TABLE "VenueReputationHistory" DROP COLUMN "changeReason";
    
    -- Rename new column to original name
    ALTER TABLE "VenueReputationHistory" RENAME COLUMN "change_reason_new" TO "changeReason";
    
    -- Make column NOT NULL
    ALTER TABLE "VenueReputationHistory" ALTER COLUMN "changeReason" SET NOT NULL;
  END IF;
END
$$;
