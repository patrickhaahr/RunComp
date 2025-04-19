"use client";

import { useEffect, useState } from "react";
import { getLeaderboard, LeaderboardEntry } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useAuth } from "./auth/auth-provider";
import { Button } from "./ui/button";

export const RunningLeaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const { leaderboard, error } = await getLeaderboard();
      
      if (error) {
        setError(error.message);
      } else {
        // Sort the leaderboard by total_distance (treating null as 0)
        const sortedLeaderboard = [...(leaderboard || [])].sort((a, b) => {
          const distanceA = a.total_distance === null ? 0 : a.total_distance;
          const distanceB = b.total_distance === null ? 0 : b.total_distance;
          return distanceB - distanceA; // Sort by descending order
        });
        setLeaderboard(sortedLeaderboard);
      }
      
      setLoading(false);
    };
    
    fetchLeaderboard();
  }, []);

  // Format pace helper function
  const formatPace = (seconds: number) => {
    if (!seconds) return null;
    // Round to nearest second
    const roundedSeconds = Math.round(seconds);
    const minutes = Math.floor(roundedSeconds / 60);
    const secs = roundedSeconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}/km`;
  };

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto py-12 text-center">
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto py-12 text-center">
        <p className="text-red-500">Error loading leaderboard: {error}</p>
      </div>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto py-12 text-center">
        <p className="mb-4">No runs recorded yet. Be the first!</p>
        {user ? (
          <Button asChild>
            <Link href="/profile">Add Your Run</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/signin">Sign In to Participate</Link>
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header with auth state */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Running Leaderboard</h1>
        {user ? (
          <Button asChild>
            <Link href="/profile">Your Profile</Link>
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Champion card */}
      {leaderboard.length > 0 && (
        <Link
          href={`/users/${leaderboard[0].user_id}`}
          className="block"
          aria-label={`View ${leaderboard[0].display_name}'s stats`}
        >
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-16" />
            <CardContent className="p-6 pt-0 -mt-8">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-900 shadow-md">
                  {leaderboard[0].profile_image ? (
                    <AvatarImage src={leaderboard[0].profile_image} alt={leaderboard[0].display_name} />
                  ) : (
                    <AvatarFallback>{leaderboard[0].display_name.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                
                <div className="mt-3 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <h2 className="text-xl font-bold">{leaderboard[0].display_name}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">Leading the competition</p>
                </div>
                
                <div className="flex gap-3 mt-4 flex-wrap justify-center">
                  <Badge variant="outline" className="px-3 py-1 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                    <Activity className="h-3.5 w-3.5 mr-1.5" />
                    {leaderboard[0].total_distance !== null ? leaderboard[0].total_distance.toFixed(1) : "0"} km
                  </Badge>
                  
                  <Badge variant="outline" className="px-3 py-1">
                    {leaderboard[0].total_runs || 0} runs
                  </Badge>

                  {leaderboard[0].best_pace && (
                    <Badge variant="outline" className="px-3 py-1">
                      Best pace: {formatPace(leaderboard[0].best_pace)}
                    </Badge>
                  )}
                  
                  {leaderboard[0].avg_pace && (
                    <Badge variant="outline" className="px-3 py-1">
                      Avg pace: {formatPace(leaderboard[0].avg_pace)}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}
      
      {/* Runners up list */}
      <div className="space-y-2">
        {leaderboard.slice(1).map((runner, index) => (
          <Link
            key={runner.user_id}
            href={`/users/${runner.user_id}`}
            className="block transition-all hover:shadow"
            aria-label={`View ${runner.display_name}'s stats`}
          >
            <Card className={cn(
              "border-0",
              index === 0 && "border-l-4 border-l-gray-300 dark:border-l-gray-600"
            )}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium">
                  {index + 2}
                </div>
                
                <Avatar className="h-10 w-10 border border-muted">
                  {runner.profile_image ? (
                    <AvatarImage src={runner.profile_image} alt={runner.display_name} />
                  ) : (
                    <AvatarFallback>{runner.display_name.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{runner.display_name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {runner.total_distance !== null ? runner.total_distance.toFixed(1) : "0"} km • {runner.total_runs || 0} runs
                    {runner.best_pace && ` • Best: ${formatPace(runner.best_pace)}`}
                    {runner.avg_pace && ` • Avg: ${formatPace(runner.avg_pace)}`}
                  </p>
                </div>
                
                {index === 0 && (
                  <Badge variant="secondary" className="hidden sm:flex gap-1 items-center">
                    <Medal className="h-3 w-3" />
                    <span>Silver</span>
                  </Badge>
                )}
                
                {index === 1 && (
                  <Badge variant="secondary" className="hidden sm:flex gap-1 items-center text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 dark:hover:bg-amber-900">
                    <Medal className="h-3 w-3" />
                    <span>Bronze</span>
                  </Badge>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}; 