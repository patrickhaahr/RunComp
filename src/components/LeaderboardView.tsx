"use client";

import { LeaderboardEntry } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export type LeaderboardViewProps = {
  entries: LeaderboardEntry[];
  label?: string;
  isFinished?: boolean;
};

export const LeaderboardView = ({ entries, label, isFinished = false }: LeaderboardViewProps) => {
  const formatPace = (seconds: number) => {
    if (!seconds) return null;
    const rounded = Math.round(seconds);
    const mins = Math.floor(rounded / 60);
    const secs = rounded % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}/km`;
  };

  const champion = entries[0];

  return (
    <>
      {/* Champion card */}
      {champion && (
        <Link
          href={`/users/${champion.user_id}`}
          className="block"
          aria-label={`View ${champion.display_name}'s stats`}
        >
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="relative bg-gradient-to-r from-amber-500 to-yellow-400 h-16 flex items-center justify-center">
              {label && (
                <span className="text-white font-semibold text-lg">
                  {label}
                </span>
              )}
            </div>
            <CardContent className="p-6 pt-0 -mt-8">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-900 shadow-md">
                  {champion.profile_image ? (
                    <AvatarImage src={champion.profile_image} alt={champion.display_name} />
                  ) : (
                    <AvatarFallback>{champion.display_name.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                <div className="mt-3 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <h2 className="text-xl font-bold">{champion.display_name}</h2>
                  </div>
                  {isFinished && label && (
                    <p className="text-sm text-muted-foreground mb-1">{label} Leader</p>
                  )}
                  {!isFinished && (
                    <p className="text-sm text-muted-foreground mb-1">Leading the competition</p>
                  )}
                </div>
                <div className="flex gap-3 mt-4 flex-wrap justify-center">
                  <Badge variant="outline" className="px-3 py-1 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                    <Activity className="h-3.5 w-3.5 mr-1.5" />
                    {champion.total_distance !== null ? champion.total_distance.toFixed(1) : "0"} km
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">
                    {champion.total_runs || 0} runs
                  </Badge>
                  {champion.best_pace && (
                    <Badge variant="outline" className="px-3 py-1">
                      Best pace: {formatPace(champion.best_pace)}
                    </Badge>
                  )}
                  {champion.avg_pace && (
                    <Badge variant="outline" className="px-3 py-1">
                      Avg pace: {formatPace(champion.avg_pace)}
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
        {entries.slice(1).map((runner, index) => (
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
    </>
  );
}; 