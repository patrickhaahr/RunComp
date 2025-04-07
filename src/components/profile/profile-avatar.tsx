'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Upload, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type ProfileAvatarProps = {
  imageUrl?: string;
  size?: number;
  onImageChange: (base64Image: string) => void;
  className?: string;
  showUploadButton?: boolean;
};

export default function ProfileAvatar({
  imageUrl,
  size = 100,
  onImageChange,
  className,
  showUploadButton = false
}: ProfileAvatarProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Set initial preview if imageUrl exists
  useEffect(() => {
    if (imageUrl) {
      setPreview(imageUrl);
    }
  }, [imageUrl]);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    try {
      setUploading(true);
      const file = e.target.files[0];
      
      // Check file type
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
        throw new Error('Only image files (JPEG, PNG, GIF) are supported');
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }
      
      // Convert to base64
      const base64 = await fileToBase64(file);
      
      // Set preview
      setPreview(base64);
      
      // Send base64 data to parent
      onImageChange(base64);
    } catch (error) {
      console.error('Error processing image:', error);
      alert(error instanceof Error ? error.message : 'Failed to process image');
    } finally {
      setUploading(false);
    }
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <Avatar className="relative" style={{ width: size, height: size }}>
        {preview ? (
          <AvatarImage src={preview} alt="Profile" />
        ) : (
          <AvatarFallback>
            <User className="h-1/2 w-1/2" />
          </AvatarFallback>
        )}
      </Avatar>
      
      {showUploadButton && (
        <div className="relative">
          <Button 
            variant="outline" 
            size="sm" 
            type="button" 
            className="flex items-center gap-2"
            disabled={uploading}
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload Image'}
          </Button>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
      )}
    </div>
  );
} 