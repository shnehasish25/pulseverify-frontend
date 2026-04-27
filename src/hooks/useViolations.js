import { useState, useEffect, useCallback } from 'react';
import axios from '../utils/axios.js';
import { useAuth } from '../context/AuthContext';

export const useViolations = () => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchViolations = useCallback(async () => {
    // Don't fire API calls until auth is resolved and user is logged in
    if (authLoading || !isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get('/api/violations');
      
      // Transform backend data to match frontend UI expectations
      const transformedViolations = response.data.map((v, index) => {
        // Derive severity level based on confidence
        const level = v.confidence >= 90 ? 'Critical' : (v.confidence >= 70 ? 'Medium' : 'Low');
        const statusMap = {
          'Open': 'open',
          'Under Review': 'open',
          'Takedown Issued': 'takedown_sent',
          'Resolved': 'resolved',
          'Dismissed': 'dismissed',
        };

        // Use coordinates from seed data (lng, lat format) or fall back
        const lng = v.coordinates?.[0] ?? v.lng ?? 0;
        const lat = v.coordinates?.[1] ?? v.lat ?? 0;

        return {
          id: v._id,
          title: `Pirated on ${v.platform || 'Unknown'}`,
          originalTitle: `Master Asset ${v.masterAssetId?.toString().substring(0, 5) || 'Unknown'}`,
          originalThumb: v.masterAssetUrl || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=225&fit=crop",
          detectedTitle: `Detected on ${v.platform || 'Unknown'}`,
          detectedThumb: v.suspectUrl,
          platform: v.platform || 'Unknown',
          similarity: Math.round(v.confidence),
          level: level,
          detectedAt: new Date(v.detectedAt).toLocaleString(),
          pulseId: `PV-${v._id.toString().substring(0, 8).toUpperCase()}`,
          aiConfidence: Math.round(v.confidence * 0.98),
          // Use rich modification list from seed data, or fall back
          modifications: v.modifications || [v.aiContext || "Matches Master Hash"],
          // Rich AI context for the evidence board
          aiContext: v.aiContext || "No AI context available.",
          matchedLogos: v.matchedLogos || [],
          detectedVia: v.detectedVia || "Automated scan",
          estimatedReach: v.estimatedReach || "Unknown",
          uploaderProfile: v.uploaderProfile || "Unknown",
          sourceUrl: v.suspectUrl,
          status: statusMap[v.status] || 'open',
          rawStatus: v.status,
          
          // Map properties — use real data from seed/DB
          region: v.country || "Unknown",
          country: v.country || "Unknown",
          city: v.city || "Unknown",
          time: new Date(v.detectedAt).toLocaleTimeString(),
          coords: [lng, lat],
        };
      });

      setViolations(transformedViolations);
      setError(null);
    } catch (err) {
      console.error("useViolations fetch error:", err);
      setError(err.response?.data?.message || 'Failed to fetch violations');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const detectViolation = async (suspectUrl, platform) => {
    try {
      const response = await axios.post('/api/violations/detect', { suspectUrl, platform });
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchViolations();
  }, [fetchViolations]);

  return { violations, loading, error, refetch: fetchViolations, detectViolation };
};
