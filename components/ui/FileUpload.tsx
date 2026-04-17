'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select a file to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      alert('Upload successful!');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label
        className="button primary block"
        htmlFor="single"
      >
        {uploading ? 'Uploading ...' : 'Upload File'}
      </label>
      <input
        style={{
          visibility: 'hidden',
          position: 'absolute'
        }}
        type="file"
        id="single"
        accept="image/*"
        onChange={uploadFile}
        disabled={uploading}
      />
    </div>
  );
}
