'use client';

import { useState, useEffect } from 'react';
import { getRuns, Run, deleteRun } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${secs}s`;
}

function formatPace(seconds: number, distance: number) {
  if (distance === 0) return '-';
  
  const paceSeconds = Math.round(seconds / distance);
  const minutes = Math.floor(paceSeconds / 60);
  const secs = paceSeconds % 60;
  
  return `${minutes}:${secs.toString().padStart(2, '0')} /km`;
}

type RunListProps = {
  userId: string;
};

export default function RunList({ userId }: RunListProps) {
  const router = useRouter();
  const [runs, setRuns] = useState<Run[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRuns = async () => {
      setLoading(true);
      const { runs, error } = await getRuns(userId);
      
      if (error) {
        setError(error.message);
      } else {
        setRuns(runs);
      }
      
      setLoading(false);
    };
    
    fetchRuns();
  }, [userId]);

  const handleDelete = async (runId: string) => {
    if (confirm('Are you sure you want to delete this run?')) {
      const { error } = await deleteRun(runId);
      
      if (error) {
        setError(error.message);
      } else {
        // Remove run from state
        setRuns(runs => runs ? runs.filter(run => run.id !== runId) : null);
        router.refresh();
      }
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading your runs...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  if (!runs || runs.length === 0) {
    return <div className="text-center py-4">You haven't recorded any runs yet.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Runs</CardTitle>
        <CardDescription>History of your running activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {runs.map(run => (
            <div key={run.id} className="flex items-center justify-between border-b pb-3">
              <div>
                <p className="font-medium">{run.distance.toFixed(2)} km • {formatTime(run.time)}</p>
                <p className="text-sm text-muted-foreground">
                  Pace: {formatPace(run.time, run.distance)} • 
                  {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
                </p>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => handleDelete(run.id)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 