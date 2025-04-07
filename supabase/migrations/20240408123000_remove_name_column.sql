/*
  Migration: Remove name column from profiles table
  
  This migration:
  1. Alters the profiles table to make the name column nullable (first step)
  2. Updates the leaderboard view to use user_metadata.display_name instead of profiles.name
  3. Removes the name column from the profiles table
*/

-- First make the name column nullable so existing records don't break
ALTER TABLE public.profiles 
ALTER COLUMN name DROP NOT NULL;

-- Drop the leaderboard view as it references the name column
DROP VIEW IF EXISTS public.leaderboard;

-- Create the updated leaderboard view using auth.users.raw_user_meta_data->>'display_name'
CREATE VIEW public.leaderboard AS
SELECT 
    p.id AS user_id,
    (SELECT au.raw_user_meta_data->>'display_name' 
     FROM auth.users au 
     WHERE au.id = p.id) AS display_name,
    p.profile_image,
    SUM(r.distance) AS total_distance,
    COUNT(r.id) AS total_runs,
    MIN(r.time / r.distance) AS best_pace, -- seconds per kilometer
    AVG(r.time / r.distance) AS avg_pace -- average seconds per kilometer
FROM public.profiles p
LEFT JOIN public.runs r ON p.id = r.user_id
GROUP BY p.id, p.profile_image
ORDER BY total_distance DESC;

-- Now remove the name column completely
ALTER TABLE public.profiles
DROP COLUMN name; 