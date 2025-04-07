'use client';

import { useState, useEffect } from 'react';
import { getRuns, Run, deleteRun, updateRun } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

// Convert time in "1h 20m 30s" format to seconds
function timeToSeconds(timeString: string): number {
  let seconds = 0;
  
  const hoursMatch = timeString.match(/(\d+)h/);
  if (hoursMatch) seconds += parseInt(hoursMatch[1]) * 3600;
  
  const minutesMatch = timeString.match(/(\d+)m/);
  if (minutesMatch) seconds += parseInt(minutesMatch[1]) * 60;
  
  const secondsMatch = timeString.match(/(\d+)s/);
  if (secondsMatch) seconds += parseInt(secondsMatch[1]);
  
  return seconds;
}

type SortOption = 'newest' | 'oldest' | 'distance' | 'pace';

type RunListProps = {
  userId: string;
};

export default function RunList({ userId }: RunListProps) {
  const router = useRouter();
  const [runs, setRuns] = useState<Run[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [page, setPage] = useState(1);
  const runsPerPage = 5;
  
  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRun, setEditingRun] = useState<Run | null>(null);
  const [formDistance, setFormDistance] = useState('');
  const [formTime, setFormTime] = useState('');
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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

  const openEditDialog = (run: Run) => {
    setEditingRun(run);
    setFormDistance(run.distance.toString());
    setFormTime(formatTime(run.time));
    setEditError(null);
    setEditDialogOpen(true);
  };

  const handleUpdateRun = async () => {
    if (!editingRun) return;
    
    try {
      setUpdating(true);
      setEditError(null);
      
      // Validate inputs
      const distance = parseFloat(formDistance);
      if (isNaN(distance) || distance <= 0) {
        throw new Error('Please enter a valid distance');
      }
      
      const time = timeToSeconds(formTime);
      if (time <= 0) {
        throw new Error('Please enter a valid time');
      }
      
      // Update the run
      const { error } = await updateRun(editingRun.id, {
        distance,
        time
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local state
      setRuns(prevRuns => {
        if (!prevRuns) return null;
        
        return prevRuns.map(run => {
          if (run.id === editingRun.id) {
            return { ...run, distance, time };
          }
          return run;
        });
      });
      
      setEditDialogOpen(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update run');
    } finally {
      setUpdating(false);
    }
  };

  const sortedRuns = () => {
    if (!runs) return [];
    
    return [...runs].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'distance':
          return b.distance - a.distance;
        case 'pace':
          // Lower pace (faster) comes first
          const paceA = a.distance > 0 ? a.time / a.distance : Infinity;
          const paceB = b.distance > 0 ? b.time / b.distance : Infinity;
          return paceA - paceB;
        default:
          return 0;
      }
    });
  };

  const paginatedRuns = () => {
    const sorted = sortedRuns();
    const startIndex = (page - 1) * runsPerPage;
    return sorted.slice(startIndex, startIndex + runsPerPage);
  };
  
  const totalPages = runs ? Math.ceil(runs.length / runsPerPage) : 0;

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading your runs...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  if (!runs || runs.length === 0) {
    return <div className="text-center py-4">You haven&apos;t recorded any runs yet.</div>;
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Your Runs</CardTitle>
              <CardDescription>History of your running activities</CardDescription>
            </div>
            <div className="flex items-center">
              <Select value={sortBy} onValueChange={(value: string) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="pace">Pace</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedRuns().map(run => (
              <div key={run.id} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">{run.distance.toFixed(2)} km • {formatTime(run.time)}</p>
                  <p className="text-sm text-muted-foreground">
                    Pace: {formatPace(run.time, run.distance)} • 
                    {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => openEditDialog(run)}
                    className="h-8 w-8 text-primary hover:bg-primary/10"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(run.id)}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrevPage}
                disabled={page === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="text-sm">
                Page {page} of {totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextPage}
                disabled={page === totalPages}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Run Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Run</DialogTitle>
            <DialogDescription>
              Update your running activity
            </DialogDescription>
          </DialogHeader>
          
          {editError && (
            <div className="text-sm text-red-500 mt-4">
              {editError}
            </div>
          )}
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="distance">Distance (km)</Label>
              <Input 
                id="distance" 
                type="number"
                step="0.01"
                min="0.01"
                value={formDistance} 
                onChange={(e) => setFormDistance(e.target.value)}
                disabled={updating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time (e.g., &quot;1h 20m 30s&quot;)</Label>
              <Input 
                id="time" 
                value={formTime} 
                onChange={(e) => setFormTime(e.target.value)}
                placeholder="e.g. 30m 45s"
                disabled={updating}
              />
              <p className="text-xs text-muted-foreground">
                Format: 1h 20m 30s (hours and minutes are optional)
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={updating}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRun} disabled={updating}>
              {updating ? 'Updating...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 