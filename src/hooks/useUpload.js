import { useState } from 'react';
import axios from '../utils/axios.js';

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadAsset = async (imageUrl) => {
    setIsUploading(true);
    setError(null);
    try {
      const response = await axios.post('/api/assets/upload', { imageUrl });
      setIsUploading(false);
      return response.data.asset;
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
      setIsUploading(false);
      throw err;
    }
  };

  return { uploadAsset, isUploading, error };
};
