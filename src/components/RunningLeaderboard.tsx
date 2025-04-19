"use client";

import { useEffect, useState } from "react";
import { supabase, LeaderboardEntry } from "@/lib/supabase";
import { useAuth } from "./auth/auth-provider";
import { Button } from "./ui/button";
import { LeaderboardView } from "./LeaderboardView";
import { format, getWeek, startOfWeek, endOfWeek, add, getYear, differenceInCalendarYears, differenceInCalendarMonths, differenceInCalendarISOWeeks } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

const leaderboardCache: Record<string, { data: LeaderboardEntry[]; timestamp: number }> = {};

export const RunningLeaderboard = () => {
  const { } = useAuth();
  const [timeframe, setTimeframe] = useState<'all'|'year'|'month'|'week'>('all');
  const [offset, setOffset] = useState(0);

  // The earliest data start date of the app
  const startDate = new Date(2025, 3, 1); // April 1, 2025

  // Compute how many periods back we can go for this timeframe
  const maxOffset = (() => {
    const now = new Date();
    if (timeframe === 'year') return differenceInCalendarYears(now, startDate);
    if (timeframe === 'month') return differenceInCalendarMonths(now, startDate);
    if (timeframe === 'week') return differenceInCalendarISOWeeks(now, startDate);
    return 0;
  })();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const noData = !leaderboard || leaderboard.length === 0;

  // Compute human-friendly label for current timeframe
  const getTimeframeLabel = () => {
    const now = new Date();
    switch (timeframe) {
      case 'year':
        return `Year: ${getYear(add(now, { years: -offset }))}`;
      case 'month':
        return format(add(now, { months: -offset }), 'LLLL yyyy');
      case 'week': {
        const dateRef = add(now, { weeks: -offset });
        const weekNum = getWeek(dateRef, { weekStartsOn: 1 });
        const start = startOfWeek(dateRef, { weekStartsOn: 1 });
        const end = endOfWeek(dateRef, { weekStartsOn: 1 });
        return `Week ${weekNum}: ${format(start, 'd')}–${format(end, 'd MMM')}`;
      }
      default:
        return 'All Time';
    }
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      // Try cache first
      const cacheKey = `${timeframe}_${offset}`;
      const nowTs = Date.now();
      const cached = leaderboardCache[cacheKey];
      if (cached && nowTs - cached.timestamp < 2 * 60 * 1000) {
        setLeaderboard(cached.data);
        setLoading(false);
        return;
      }
      // Fetch via RPC for arbitrary period
      const { data, error } = await supabase.rpc('get_leaderboard_period', { period: timeframe, period_offset: offset });
      
      if (error) {
        setError(error.message);
      } else {
        const sortedLeaderboard = [...(data || [])].sort((a: LeaderboardEntry, b: LeaderboardEntry) => {
          const distanceA = a.total_distance ?? 0;
          const distanceB = b.total_distance ?? 0;
          return distanceB - distanceA;
        });
        // Filter out users with zero runs
        const filteredLeaderboard = sortedLeaderboard.filter(entry => entry.total_runs > 0);
        // Cache for 2 minutes
        leaderboardCache[cacheKey] = { data: filteredLeaderboard, timestamp: nowTs };
        setLeaderboard(filteredLeaderboard);
      }
      
      setLoading(false);
    };
    
    fetchLeaderboard();
  }, [timeframe, offset]);

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Unified control row skeleton */}
        <div className="flex justify-between items-center gap-2 mb-6">
          {/* Empty space on left */}
          <div className="w-4"></div>
          
          {/* Timeframe selector skeletons in CENTER */}
          <div className="flex justify-center items-center gap-1">
            {['all', 'year', 'month', 'week'].map((_, idx) => (
              <Skeleton key={idx} className="h-8 w-20" />
            ))}
          </div>
          
          {/* Navigation button skeletons on RIGHT */}
          <div className="flex items-center gap-1">
            {timeframe !== 'all' && (
              <>
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </>
            )}
          </div>
        </div>
        
        {/* Leaderboard entries skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-20 w-full" />
          ))}
        </div>
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

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Control row with timeframe selectors centered and navigation on right */}
      <div className="flex justify-between items-center gap-2 mb-6">
        {/* Empty space on left for balance */}
        <div className="w-16"></div>
        
        {/* Timeframe selectors in CENTER */}
        <div className="flex justify-center items-center gap-1">
          {[
            { value: 'all', label: 'All Time' },
            { value: 'year', label: 'Year' },
            { value: 'month', label: 'Month' },
            { value: 'week', label: 'Week' },
          ].map(({ value, label }) => (
            <Button
              key={value}
              variant={timeframe === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(value as 'all'|'year'|'month'|'week')}
              aria-pressed={timeframe === value}
            >
              {label}
            </Button>
          ))}
        </div>
        
        {/* Navigation buttons on RIGHT */}
        <div className="flex items-center gap-1 min-w-16 justify-end">
          {timeframe !== 'all' && maxOffset > 0 && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setOffset(o => Math.min(maxOffset, o + 1))}
                disabled={offset >= maxOffset}
                aria-label="Previous period"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setOffset(o => Math.max(0, o - 1))}
                disabled={offset <= 0}
                aria-label="Next period"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Leaderboard display */}
      {noData ? (
        <div className="w-full max-w-3xl mx-auto py-12 text-center">
          <p className="mb-4">No runs recorded</p>
        </div>
      ) : (
        <LeaderboardView 
          entries={leaderboard!} 
          label={getTimeframeLabel()} 
          isFinished={offset > 0} 
        />
      )}
    </div>
  );
}; 