-- Create the ContactCategory enum
CREATE TYPE "ContactCategory" AS ENUM (
  'GENERAL_ENQUIRY',
  'SUPPORT',
  'REPORT_A_PROBLEM',
  'BUSINESS_PARTNERSHIPS',
  'PRESS_MEDIA'
);

-- Convert existing text values to enum values
ALTER TABLE "ContactSubmission"
  ALTER COLUMN "category" TYPE "ContactCategory"
  USING CASE "category"
    WHEN 'General enquiry' THEN 'GENERAL_ENQUIRY'
    WHEN 'Support' THEN 'SUPPORT'
    WHEN 'Report a problem' THEN 'REPORT_A_PROBLEM'
    WHEN 'Business & partnerships' THEN 'BUSINESS_PARTNERSHIPS'
    WHEN 'Press & media' THEN 'PRESS_MEDIA'
    ELSE 'GENERAL_ENQUIRY'
  END::"ContactCategory";
