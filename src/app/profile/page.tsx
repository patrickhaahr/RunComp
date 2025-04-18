'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import AddRunForm from '@/components/runs/add-run-form';
import RunList from '@/components/runs/run-list';
import ProfileAvatar from '@/components/profile/profile-avatar';
import { getProfile, Profile, signOut, updateProfile, updateUserEmail, updateUserPassword, updateUserDisplayName } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Home } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formConfirmPassword, setFormConfirmPassword] = useState('');
  const [formProfileImage, setFormProfileImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState('profile');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runRefreshTrigger, setRunRefreshTrigger] = useState(0);

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

  const openEditDialog = () => {
    if (profile && user) {
      setFormDisplayName(user.user_metadata?.display_name || '');
      setFormEmail(user.email || '');
      setFormProfileImage(profile.profile_image || '');
      setFormPassword('');
      setFormConfirmPassword('');
      setActiveTab('profile');
      setError(null);
      setEditDialogOpen(true);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user || !profile) return;
    
    setUpdating(true);
    setError(null);
    
    if (activeTab === 'profile') {
      // Simple validation for profile tab
      if (!formDisplayName.trim() || !formEmail.trim()) {
        setError('Display name and email are required');
        setUpdating(false);
        return;
      }
      
      // Update display name if changed
      if (formDisplayName !== user.user_metadata?.display_name) {
        const { error: displayNameError } = await updateUserDisplayName(formDisplayName);
        
        if (displayNameError) {
          setError(displayNameError.message);
          setUpdating(false);
          return;
        }
      }
      
      // Only update email if it has changed
      if (formEmail !== user.email) {
        const { error: emailError } = await updateUserEmail(formEmail);
        
        if (emailError) {
          setError(emailError.message);
          setUpdating(false);
          return;
        }
      }
      
      // Update profile image
      const { error: profileError } = await updateProfile(user.id, {
        profile_image: formProfileImage
      });
      
      if (profileError) {
        setError(profileError.message);
        setUpdating(false);
        return;
      }
      
      // Update local state with new values
      setProfile({
        ...profile,
        profile_image: formProfileImage
      });
      
      // Since we updated auth email or display name, refresh the page to get updated user session
      if (formEmail !== user.email || formDisplayName !== user.user_metadata?.display_name) {
        setUpdating(false);
        setEditDialogOpen(false);
        router.refresh();
        return;
      }
    } else if (activeTab === 'password') {
      // Password validation
      if (!formPassword) {
        setError('Password is required');
        setUpdating(false);
        return;
      }
      
      if (formPassword.length < 6) {
        setError('Password must be at least 6 characters');
        setUpdating(false);
        return;
      }
      
      if (formPassword !== formConfirmPassword) {
        setError('Passwords do not match');
        setUpdating(false);
        return;
      }
      
      // Update password
      const { error: passwordError } = await updateUserPassword(formPassword);
      
      if (passwordError) {
        setError(passwordError.message);
        setUpdating(false);
        return;
      }
    }
    
    setUpdating(false);
    setEditDialogOpen(false);
  };

  const handleProfileImageChange = (base64Image: string) => {
    setFormProfileImage(base64Image);
  };

  // Handler for when a new run is added
  const handleRunAdded = () => {
    // Increment the refresh trigger to cause the run list to update
    setRunRefreshTrigger(prev => prev + 1);
  };

  if (authLoading || loading || !user) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        {/* Main content skeleton */}
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-8">
            {/* Profile card skeleton */}
            <Skeleton className="h-48 w-full rounded-md" />
            {/* Add run form skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
          {/* Runs list skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Your Profile</h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Your personal information</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={openEditDialog}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-6">
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {user.user_metadata?.display_name}</p>
                  <p><span className="font-medium">Email:</span> {user?.email}</p>
                </div>
                <ProfileAvatar 
                  imageUrl={profile?.profile_image}
                  size={80}
                  onImageChange={() => {}}
                  className="flex-shrink-0"
                  showUploadButton={false}
                />
              </div>
            </CardContent>
          </Card>

          <AddRunForm userId={user.id} onRunAdded={handleRunAdded} />
        </div>

        <div>
          <RunList userId={user.id} refreshTrigger={runRefreshTrigger} />
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            
            {error && (
              <div className="text-sm text-red-500 mt-4">
                {error}
              </div>
            )}
            
            <div className="min-h-[350px] grid place-items-center">
              <TabsContent value="profile" className="w-full space-y-6 data-[state=inactive]:hidden">
                <div className="flex justify-center">
                  <ProfileAvatar 
                    imageUrl={formProfileImage} 
                    size={120}
                    onImageChange={handleProfileImageChange}
                    showUploadButton={true}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input 
                    id="displayName" 
                    value={formDisplayName} 
                    onChange={(e) => setFormDisplayName(e.target.value)}
                    disabled={updating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formEmail} 
                    onChange={(e) => setFormEmail(e.target.value)}
                    disabled={updating}
                  />
                  <p className="text-xs text-muted-foreground">
                    Note: Changing your email will require you to verify the new address
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="password" className="w-full space-y-6 data-[state=inactive]:hidden">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input 
                    id="password" 
                    type="password"
                    value={formPassword} 
                    onChange={(e) => setFormPassword(e.target.value)}
                    disabled={updating}
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password"
                    value={formConfirmPassword} 
                    onChange={(e) => setFormConfirmPassword(e.target.value)}
                    disabled={updating}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={updating}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProfile} disabled={updating}>
              {updating ? 'Updating...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 