-- Migration to update profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- Drop and recreate leaderboard view to include avg_pace
DROP VIEW IF EXISTS public.leaderboard;

CREATE VIEW public.leaderboard AS
SELECT 
    p.id AS user_id,
    p.name,
    p.profile_image,
    SUM(r.distance) AS total_distance,
    COUNT(r.id) AS total_runs,
    MIN(r.time / r.distance) AS best_pace, -- seconds per kilometer
    AVG(r.time / r.distance) AS avg_pace -- average seconds per kilometer
FROM public.profiles p
LEFT JOIN public.runs r ON p.id = r.user_id
GROUP BY p.id, p.name, p.profile_image
ORDER BY total_distance DESC; 