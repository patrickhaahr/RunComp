import { getLeaderboard, getRuns, LeaderboardEntry, Run } from "@/lib/supabase";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

type Props = {
  params: { userId: string };
};

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours > 0 ? hours + "h " : ""}${minutes}m ${secs}s`;
}

function formatPace(seconds: number) {
  const rounded = Math.round(seconds);
  const mins = Math.floor(rounded / 60);
  const secs = rounded % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}/km`;
}

export default async function Page({ params: { userId } }: Props) {
  const { leaderboard, error: lbError } = await getLeaderboard();
  if (lbError) {
    return (
      <div className="w-full max-w-3xl mx-auto py-12 text-center">
        <p className="text-red-500">Error loading stats: {lbError.message}</p>
      </div>
    );
  }

  const entry = leaderboard?.find((e: LeaderboardEntry) => e.user_id === userId);
  if (!entry) {
    return (
      <div className="w-full max-w-3xl mx-auto py-12 text-center">
        <p>User not found.</p>
      </div>
    );
  }

  const { runs, error: runsError } = await getRuns(userId);
  if (runsError) {
    return (
      <div className="w-full max-w-3xl mx-auto py-12 text-center">
        <p className="text-red-500">Error loading runs: {runsError.message}</p>
      </div>
    );
  }

  const sortedRuns = runs ? [...runs].sort((a: Run, b: Run) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) : [];

  return (
    <div className="w-full max-w-3xl mx-auto py-8 space-y-6">
      <Link href="/" className="inline-block text-sm text-primary hover:underline" aria-label="Back to Leaderboard">
        ← Back to Leaderboard
      </Link>

      <Card className="p-4">
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {entry.profile_image ? (
              <AvatarImage src={entry.profile_image} alt={entry.display_name} />
            ) : (
              <AvatarFallback>{entry.display_name.charAt(0)}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{entry.display_name}</h1>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant="outline" className="px-2 py-1 flex items-center">
                <Activity className="h-4 w-4 mr-1" />
                {entry.total_distance.toFixed(1)} km
              </Badge>
              <Badge variant="outline" className="px-2 py-1">
                {entry.total_runs} runs
              </Badge>
              {entry.best_pace && (
                <Badge variant="outline" className="px-2 py-1">
                  Best: {formatPace(entry.best_pace)}
                </Badge>
              )}
              {entry.avg_pace && (
                <Badge variant="outline" className="px-2 py-1">
                  Avg: {formatPace(entry.avg_pace)}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {sortedRuns.map((run: Run) => (
          <Card key={run.id}>
            <CardContent className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">{new Date(run.created_at).toLocaleDateString()}</p>
                <p className="mt-1">Distance: {run.distance.toFixed(1)} km</p>
              </div>
              <div className="text-right">
                <p>Time: {formatTime(run.time)}</p>
                <p>Pace: {run.distance > 0 ? formatPace(run.time / run.distance) : "-"}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}