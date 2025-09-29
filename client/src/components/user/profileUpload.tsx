"user client";
import React, { useState } from 'react';

const ProfilePictureUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null); // To display the uploaded image

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setMessage(''); // Clear previous messages
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select an image file first.');
      return;
    }

    setLoading(true);
    setMessage('Uploading...');

    try {
      const token = localStorage.getItem('token'); // Get JWT token from localStorage
      if (!token) {
        setMessage('Error: You are not logged in. Please log in first.');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      // 'image' must match the field name in your Multer middleware: upload.single("image")
      formData.append('image', selectedFile);

      const response = await fetch('http://localhost:5000/api/upload/profile', {
        method: 'POST',
        headers: {
          // IMPORTANT: Do NOT manually set 'Content-Type' to 'multipart/form-data'.
          // When you use FormData, the browser automatically sets the correct Content-Type header
          // including the boundary string. Manually setting it will break the upload.
          'Authorization': `Bearer ${token}`,
        },
        body: formData, // Send the FormData object directly
      });

      if (response.ok) {
        const data = await response.json();
        setMessage('Profile picture uploaded successfully!');
        setImageUrl(data.imageUrl); // Assuming your backend sends back imageUrl
        console.log('Upload success:', data);
        // You might want to update the user's state or refetch user data here
      } else {
        const errorData = await response.json();
        setMessage(`Upload failed: ${errorData.message || 'Unknown error'}`);
        console.error('Upload error:', errorData);
      }
    } catch (error: any) {
      setMessage(`An unexpected error occurred: ${error.message}`);
      console.error('Network or other error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px', margin: '20px auto' }}>
      <h2>Upload Profile Picture</h2>

      {imageUrl && (
        <div style={{ marginBottom: '15px' }}>
          <p>Uploaded Image:</p>
          <img src={imageUrl} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
        </div>
      )}

      <input
        type="file"
        accept="image/*" // Restrict to image files
        onChange={handleFileChange}
        disabled={loading}
        style={{ marginBottom: '15px' }}
      />

      <button onClick={handleUpload} disabled={!selectedFile || loading}>
        {loading ? 'Uploading...' : 'Upload Image'}
      </button>

      {message && <p style={{ marginTop: '15px', color: message.includes('Error') || message.includes('failed') ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
};

export default ProfilePictureUpload;