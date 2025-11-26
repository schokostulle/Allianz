import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const supabase = createClient(
  "https://bbeczprdumbeqcutqopr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiZWN6cHJkdW1iZXFjdXRxb3ByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjMzMTgsImV4cCI6MjA3NzMzOTMxOH0.j2DiRK_40cSiFOM8KdA9DzjLklC9hXH_Es6mHPOvPQk"
);