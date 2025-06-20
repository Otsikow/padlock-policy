
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoUpdate: (url: string) => void;
}

const ProfilePhotoUpload = ({ currentPhotoUrl, onPhotoUpdate }: ProfilePhotoUploadProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      if (!user) {
        throw new Error('You must be logged in to upload a photo.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      onPhotoUpdate(data.publicUrl);

      toast({
        title: "Profile photo updated!",
        description: "Your profile photo has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error uploading photo",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="w-24 h-24">
          <AvatarImage src={currentPhotoUrl} alt="Profile" />
          <AvatarFallback className="text-lg">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-2 -right-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="avatar-upload"
          />
          <label htmlFor="avatar-upload">
            <Button
              size="sm"
              className="rounded-full w-8 h-8 p-0"
              disabled={uploading}
              asChild
            >
              <span className="cursor-pointer">
                {uploading ? <Upload className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </span>
            </Button>
          </label>
        </div>
      </div>
      <p className="text-sm text-gray-500 text-center">
        Click the camera icon to upload a new photo
      </p>
    </div>
  );
};

export default ProfilePhotoUpload;
