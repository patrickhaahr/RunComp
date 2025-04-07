'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import AddRunForm from '@/components/runs/add-run-form';
import RunList from '@/components/runs/run-list';
import { getProfile, Profile, signOut } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setLoading(true);
        const { profile } = await getProfile(user.id);
        setProfile(profile);
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
  };

  if (authLoading || loading || !user) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {profile?.name}</p>
                <p><span className="font-medium">Email:</span> {profile?.email}</p>
              </div>
            </CardContent>
          </Card>

          <AddRunForm userId={user.id} />
        </div>

        <div>
          <RunList userId={user.id} />
        </div>
      </div>
    </div>
  );
} 