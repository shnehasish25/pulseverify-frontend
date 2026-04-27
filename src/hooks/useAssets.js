import { useState, useEffect, useCallback } from 'react';
import axios from '../utils/axios.js';
import { useAuth } from '../context/AuthContext';

// ── Fallback thumbnail map ────────────────────────────────────────────────────
// Used when DB assets have stale fake URLs (pulseverify.test / pulseverify.storage).
// Keys match league names (case-insensitive). Values are real Unsplash CDN URLs.
const SPORT_THUMBNAILS = {
  'premier league': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=640&h=360&fit=crop&q=80',
  'nba':            'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=640&h=360&fit=crop&q=80',
  'formula 1':      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&h=360&fit=crop&q=80',
  'wimbledon':      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=640&h=360&fit=crop&q=80',
  'nfl':            'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=640&h=360&fit=crop&q=80',
};

// Returns true when a URL is known to be a fake/non-loadable placeholder
const isFakeUrl = (url = '') =>
  url.includes('pulseverify.test') ||
  url.includes('pulseverify.storage') ||
  url === '' || url === null;

// Resolve the best displayable thumbnail from an asset object
const resolveThumbnail = (asset) => {
  const BACKEND = import.meta.env.VITE_API_URL || 'https://pulseverify.onrender.com';

  // 1. Use explicit thumbnail field if it's real
  if (asset.thumbnail && !isFakeUrl(asset.thumbnail)) return asset.thumbnail;

  // 2. Real upload stored as relative /uploads/ path → build absolute URL
  if (asset.url?.startsWith('/uploads/')) return `${BACKEND}${asset.url}`;

  // 3. Use url directly if it looks like a real external URL
  if (asset.url && !isFakeUrl(asset.url)) return asset.url;

  // 4. Fall back to sport-specific thumbnail based on league name
  const league = (asset.metadata?.league || '').toLowerCase();
  for (const [key, thumb] of Object.entries(SPORT_THUMBNAILS)) {
    if (league.includes(key)) return thumb;
  }

  // 5. Generic sport placeholder
  return 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=640&h=360&fit=crop&q=80';
};

export const useAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchAssets = useCallback(async () => {
    // Don't fire API calls until auth is resolved and user is logged in
    if (authLoading || !isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get('/assets');
      
      // Transform backend data to match frontend UI expectations
      const transformedAssets = response.data.map(asset => {
        const title = asset.metadata?.league
          ? `${asset.metadata.league} — ${asset.metadata.title || asset.url.split('/').pop()}`
          : asset.url.split('/').pop() || 'Uploaded Media';

        return {
          id: asset._id,
          title,
          thumbnail: resolveThumbnail(asset),
          type: asset.metadata?.format?.includes('video') ? 'video' : 'image',
          status: asset.status === 'Processing' ? 'Scanning' : (asset.status === 'Verified' ? 'Secure' : 'Violated'),
          violations: 0,
          pulseId: `PV-${asset._id.toString().substring(0, 8).toUpperCase()}`,
          uploadedAt: new Date(asset.createdAt).toLocaleDateString(),
        };
      });

      setAssets(transformedAssets);
      setError(null);
    } catch (err) {
      console.error("useAssets fetch error:", err);
      setError(err.response?.data?.message || 'Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return { assets, loading, error, refetch: fetchAssets };
};
