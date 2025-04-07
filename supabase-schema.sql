-- Create users table that extends Supabase auth.users
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    profile_image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create runs table to track running activities
CREATE TABLE public.runs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    distance FLOAT NOT NULL, -- in kilometers
    time INTEGER NOT NULL, -- in seconds
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create view for leaderboard
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

-- Set up Row Level Security (RLS)
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Everyone can view profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

-- Users can update their own profiles
CREATE POLICY "Users can update their own profiles" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Everyone can view runs
CREATE POLICY "Runs are viewable by everyone" 
ON public.runs FOR SELECT USING (true);

-- Users can insert their own runs
CREATE POLICY "Users can insert their own runs" 
ON public.runs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own runs
CREATE POLICY "Users can update their own runs" 
ON public.runs FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own runs
CREATE POLICY "Users can delete their own runs" 
ON public.runs FOR DELETE USING (auth.uid() = user_id); 