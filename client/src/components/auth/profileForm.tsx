import { useFormContext } from 'react-hook-form';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';
import { useEffect, useState } from 'react';

export const ProfilePictureUpload = () => {
  const { register, watch, setValue } = useFormContext();
  const [preview, setPreview] = useState<string | null>(null);

  const file = watch('profilePicture')?.[0];

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="w-full">
      <Label htmlFor="profilePicture">Upload Profile Picture</Label>
      <Input
        id="profilePicture"
        type="file"
        accept="image/*"
        {...register('profilePicture')}
      />
      {preview && (
        <div className="mt-2">
          <img
            src={preview}
            alt="Preview"
            className="w-20 h-20 rounded-full object-cover border"
          />
        </div>
      )}
    </div>
  );
};
