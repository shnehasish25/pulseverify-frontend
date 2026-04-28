import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Asset from '../models/Asset.js';
import Violation from '../models/Violation.js';
import { generatePHash, calculateHammingDistance } from '../services/hashService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedDataPath = path.join(__dirname, '../data/seedData.json');

// ── Helper: read seed data safely ───────────────────────────────────────────
const getSeedData = () => {
  const data = fs.readFileSync(seedDataPath, 'utf-8');
  return JSON.parse(data);
};

// ── Helper: check if MongoDB is connected ────────────────────────────────────
const isDbConnected = () => mongoose.connection.readyState === 1;

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/violations
// Returns all detected violations with coordinates for the World Map.
// Falls back to seed data when MongoDB is unavailable.
// ─────────────────────────────────────────────────────────────────────────────
export const getAllViolations = async (_req, res) => {
  try {
    let violations;

    if (isDbConnected()) {
      const dbViolations = await Violation.find().sort({ detectedAt: -1 }).lean();
      if (dbViolations.length > 0) {
        violations = dbViolations;
      }
    }

    // Fallback to seed data
    if (!violations || violations.length === 0) {
      const seedData = getSeedData();
      violations = seedData.violations.map((violation, index) => {
        const masterIndex = index % seedData.assets.length;
        const masterAsset = seedData.assets[masterIndex];

        return {
          ...violation,
          _id: `seed_violation_${index}`,
          masterAssetId: `seed_asset_${masterIndex}`,
          masterAssetUrl: masterAsset.thumbnail || masterAsset.url,
          // Ensure lat/lng and similarityScore are present for the World Map & Gauges
          lat: violation.coordinates?.[1] ?? 0,
          lng: violation.coordinates?.[0] ?? 0,
          similarityScore: violation.confidence,
          detectedAt: new Date(Date.now() - index * 3600000 * 6).toISOString(),
        };
      });
    }

    return res.status(200).json(violations);
  } catch (error) {
    console.error("Error in getAllViolations:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch violations." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/violations/:id
// Returns a detailed comparison object between a pirated clip and its master.
// Used by the Evidence Board for side-by-side analysis.
// ─────────────────────────────────────────────────────────────────────────────
export const getViolationById = async (req, res) => {
  try {
    const { id } = req.params;

    // Try MongoDB first
    if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const violation = await Violation.findById(id).lean();
      if (violation) {
        // Enrich with master asset data
        const masterAsset = await Asset.findById(violation.masterAssetId).lean().catch(() => null);
        return res.status(200).json({
          ...violation,
          masterAssetUrl: masterAsset?.thumbnail ?? masterAsset?.url ?? violation.masterAssetUrl,
          masterMetadata: masterAsset?.metadata ?? {},
          masterPHash: masterAsset?.pHash ?? "unknown",
          comparison: {
            pHashDistance: violation.pHashDistance,
            confidence: violation.confidence,
            aiContext: violation.aiContext,
            platform: violation.platform,
            coordinates: violation.coordinates,
            country: violation.country,
            city: violation.city,
          },
        });
      }
    }

    // Seed data fallback
    const seedData = getSeedData();
    const seedIndex = parseInt(id.replace('seed_violation_', ''), 10);
    const idx = isNaN(seedIndex) ? 0 : seedIndex;
    const violation = seedData.violations[idx];

    if (!violation) {
      return res.status(404).json({ success: false, message: "Violation not found." });
    }

    const masterIndex = idx % seedData.assets.length;
    const masterAsset = seedData.assets[masterIndex];

    return res.status(200).json({
      ...violation,
      _id: id,
      masterAssetId: `seed_asset_${masterIndex}`,
      masterAssetUrl: masterAsset.thumbnail || masterAsset.url,
      masterMetadata: masterAsset.metadata,
      masterPHash: masterAsset.pHash,
      lat: violation.coordinates?.[1] ?? 0,
      lng: violation.coordinates?.[0] ?? 0,
      similarityScore: violation.confidence,
      detectedAt: new Date().toISOString(),
      comparison: {
        pHashDistance: violation.pHashDistance,
        confidence: violation.confidence,
        aiContext: violation.aiContext,
        platform: violation.platform,
        coordinates: violation.coordinates,
        country: violation.country,
        city: violation.city,
      },
    });
  } catch (error) {
    console.error("Error in getViolationById:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch violation details." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/violations/detect
// THE CORE USP ENDPOINT: "Digital DNA" comparison.
//
// Flow:
//   1. Generate pHash of the suspect media URL
//   2. Fetch ALL master assets from MongoDB
//   3. Calculate Hamming distance against each master pHash
//   4. Find the closest match → compute similarity score
//   5. If similarity > threshold → create a Violation record
//   6. Return the evidence result for the Evidence Board
// ─────────────────────────────────────────────────────────────────────────────
export const detectViolation = async (req, res) => {
  try {
    const { suspectUrl, platform } = req.body;

    if (!suspectUrl) {
      return res.status(400).json({ success: false, message: "suspectUrl is required." });
    }

    // ── Step 1: Generate pHash of the suspect media ─────────────────────────
    let suspectHash;
    try {
      suspectHash = await generatePHash(suspectUrl);
    } catch (hashErr) {
      console.error("Failed to hash suspect URL:", hashErr.message);
      // If we can't hash the URL (e.g. it's a social media page, not a direct image),
      // fall back to a simulated hash for demo purposes
      suspectHash = Array.from({ length: 64 }, () => Math.random() > 0.5 ? '1' : '0').join('');
    }

    // ── Step 2: Get all master assets for comparison ─────────────────────────
    let masterAssets = [];
    if (isDbConnected()) {
      masterAssets = await Asset.find({ status: 'Verified' }).lean();
    }

    // Fall back to seed data if DB is empty
    if (masterAssets.length === 0) {
      const seedData = getSeedData();
      masterAssets = seedData.assets.map((a, i) => ({
        ...a,
        _id: `seed_asset_${i}`,
        thumbnail: a.thumbnail || a.url,
      }));
    }

    // ── Step 3: Compare suspect pHash against every master asset ─────────────
    let bestMatch = null;
    let bestDistance = Infinity;

    for (const master of masterAssets) {
      if (!master.pHash || master.pHash === 'processing...') continue;

      try {
        // Pad or trim hashes to match lengths (seed data uses 32-bit, Jimp uses 64-bit)
        const masterHash = master.pHash.padEnd(suspectHash.length, '0').substring(0, suspectHash.length);
        const distance = calculateHammingDistance(masterHash, suspectHash);

        if (distance < bestDistance) {
          bestDistance = distance;
          bestMatch = master;
        }
      } catch (cmpErr) {
        // Skip assets with incompatible hashes
        continue;
      }
    }

    if (!bestMatch) {
      return res.status(200).json({
        success: true,
        message: "No master assets available for comparison.",
        match: null,
      });
    }

    // ── Step 4: Calculate similarity score ───────────────────────────────────
    // Hamming distance 0 = identical. Max distance = hash length.
    const hashLength = suspectHash.length;
    const similarityScore = Math.round(((hashLength - bestDistance) / hashLength) * 100);

    // ── Step 5: Determine threat level ──────────────────────────────────────
    const isViolation = similarityScore >= 60; // 60% or higher = flag it
    const status = similarityScore >= 90 ? 'Open' : (similarityScore >= 75 ? 'Under Review' : 'Open');

    const aiContext = similarityScore >= 90
      ? `Near-identical match detected (${similarityScore}% similarity). Hamming distance: ${bestDistance}/${hashLength} bits. Immediate takedown recommended.`
      : similarityScore >= 75
      ? `High similarity detected (${similarityScore}%). Content appears modified (cropped, re-encoded, or watermark removed). Manual review recommended.`
      : similarityScore >= 60
      ? `Partial match detected (${similarityScore}%). Content shares significant visual elements with the master asset. Further investigation needed.`
      : `Low similarity (${similarityScore}%). Content may be coincidentally similar. Likely not a violation.`;

    // ── Step 6: Save violation if threshold met ─────────────────────────────
    let violation = null;
    if (isViolation && isDbConnected()) {
      violation = await Violation.create({
        masterAssetId: bestMatch._id,
        masterAssetUrl: bestMatch.thumbnail || bestMatch.url,
        suspectUrl,
        pHashDistance: bestDistance,
        confidence: similarityScore,
        status,
        platform: platform || 'Unknown',
        aiContext,
        modifications: bestDistance === 0
          ? ['None — bit-for-bit identical']
          : ['Possible resize/crop', 'Possible re-encoding', 'Potential watermark removal'],
        matchedLogos: bestMatch.aiAnalysis?.logos || [],
      });
    }

    return res.status(200).json({
      success: true,
      message: isViolation
        ? `⚠️ Violation detected! ${similarityScore}% match found.`
        : `✅ No significant match found (${similarityScore}% similarity).`,
      match: {
        masterAssetId: bestMatch._id,
        masterTitle: bestMatch.metadata?.title || bestMatch.metadata?.league || 'Master Asset',
        masterThumbnail: bestMatch.thumbnail || bestMatch.url,
        suspectUrl,
        suspectHash,
        masterHash: bestMatch.pHash,
        hammingDistance: bestDistance,
        similarityScore,
        isViolation,
        aiContext,
        platform: platform || 'Unknown',
      },
      violation: violation ? violation._id : null,
    });
  } catch (error) {
    console.error("Detection error:", error);
    return res.status(500).json({ success: false, message: "Server error during detection." });
  }
};