'use client';

import { useState } from 'react';
import { addRun } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

type AddRunFormProps = {
  userId: string;
  onRunAdded?: () => void;
};

export default function AddRunForm({ userId, onRunAdded }: AddRunFormProps) {
  const router = useRouter();
  const [distance, setDistance] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate inputs
    const distanceNum = parseFloat(distance);
    if (isNaN(distanceNum) || distanceNum <= 0) {
      setError('Please enter a valid distance');
      setLoading(false);
      return;
    }

    // Calculate total time in seconds
    const hoursNum = parseInt(hours) || 0;
    const minutesNum = parseInt(minutes) || 0;
    const secondsNum = parseInt(seconds) || 0;
    const totalSeconds = hoursNum * 3600 + minutesNum * 60 + secondsNum;

    if (totalSeconds <= 0) {
      setError('Please enter a valid time');
      setLoading(false);
      return;
    }

    // Add run to database
    const { error: runError } = await addRun({
      user_id: userId,
      distance: distanceNum,
      time: totalSeconds,
    });

    if (runError) {
      setError(runError.message);
      setLoading(false);
      return;
    }

    // Reset form and refresh page
    setDistance('');
    setHours('');
    setMinutes('');
    setSeconds('');
    setLoading(false);
    
    // Notify parent component about the new run
    if (onRunAdded) {
      onRunAdded();
    }
    
    // Refresh page to show new run
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Run</CardTitle>
        <CardDescription>Record your latest running activity</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="distance">Distance (km)</Label>
            <Input
              id="distance"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="5.00"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Time</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div>
                <Input
                  type="number"
                  min="0"
                  placeholder="Hours"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </div>
              <div>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="Minutes"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                />
              </div>
              <div>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="Seconds"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                />
              </div>
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
        <CardFooter className="pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Run'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 