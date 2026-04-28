import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Asset from '../models/Asset.js';
import { generatePHash } from '../services/hashService.js';
import { analyzeWithVision } from '../services/visionService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedDataPath = path.join(__dirname, '../data/seedData.json');

// ── In-memory processing status tracker ─────────────────────────────────────
// Allows the frontend to poll for background processing status (pHash + Vision)
const processingStatus = new Map();

// ── Helper: read seed data safely ───────────────────────────────────────────
const getSeedData = () => {
  const data = fs.readFileSync(seedDataPath, 'utf-8');
  return JSON.parse(data);
};

// ── Helper: check if MongoDB is connected ────────────────────────────────────
const isDbConnected = () => mongoose.connection.readyState === 1;

// ── Helper: format seed assets consistently ──────────────────────────────────
const formatSeedAssets = () => {
  const seedData = getSeedData();
  return seedData.assets.map((asset, index) => ({
    ...asset,
    _id: `seed_asset_${index}`,
    _isSeed: true,
    // thumbnail field from seedData is a real Unsplash URL — always pass it through.
    // The url field is a descriptive name (pulseverify.test/...) NOT a real image.
    thumbnail: asset.thumbnail || asset.url,
    createdAt: new Date(Date.now() - index * 86400000).toISOString(),
  }));
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/assets
// Returns a **merged** array: real MongoDB assets + demo seed data.
// The seed data provides a rich prototype UI; real uploads appear alongside.
// ─────────────────────────────────────────────────────────────────────────────
export const getAllAssets = async (_req, res) => {
  try {
    let dbAssets = [];

    if (isDbConnected()) {
      dbAssets = await Asset.find().sort({ createdAt: -1 }).lean();
    }

    // Always include seed data so the demo looks populated
    const seedAssets = formatSeedAssets();

    // Real user uploads first, then seed data
    const merged = [...dbAssets, ...seedAssets];

    return res.status(200).json(merged);
  } catch (error) {
    console.error("Error in getAllAssets:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch assets." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/assets/:id
// Returns a single asset by ID (supports both MongoDB ObjectIds and seed IDs).
// ─────────────────────────────────────────────────────────────────────────────
export const getAssetById = async (req, res) => {
  try {
    const { id } = req.params;

    // Try MongoDB first
    if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const asset = await Asset.findById(id).lean();
      if (asset) return res.status(200).json(asset);
    }

    // Seed data fallback
    const seedData = getSeedData();
    const seedIndex = parseInt(id.replace('seed_asset_', ''), 10);
    const asset = seedData.assets[isNaN(seedIndex) ? 0 : seedIndex];

    if (!asset) {
      return res.status(404).json({ success: false, message: "Asset not found." });
    }

    return res.status(200).json({
      ...asset,
      _id: id,
      _isSeed: true,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in getAssetById:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch asset." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/assets/upload
// Accepts a real file upload via Multer (multipart/form-data).
// Automatically triggers pHash generation and Vision API analysis in the
// background. The user does NOT need to manually click "Analyze."
//
// The "Add Asset" flow:
//   Upload → pHash Fingerprint → Vision API Analysis → MongoDB Save → Done
// ─────────────────────────────────────────────────────────────────────────────
export const handleNewUpload = async (req, res) => {
  try {
    const uploaderId = req.user?.uid || 'anonymous';

    // req.file is populated by Multer middleware (from middleware/upload.js)
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded. Send a file with field name 'file'." });
    }

    // Build paths — the file is already saved to BackEnd/uploads/ by Multer
    const relativePath = `/uploads/${req.file.filename}`;          // for DB storage
    const absolutePath = path.resolve(req.file.path);              // for Jimp / pHash
    const baseUrl = `${req.protocol}://${req.get('host')}`;        // e.g. http://localhost:5000
    const thumbnailUrl = `${baseUrl}${relativePath}`;              // full public URL

    const format = req.file.mimetype;                              // e.g. image/png
    const isImage = format.startsWith('image/');

    if (isDbConnected()) {
      const newAsset = await Asset.create({
        url: relativePath,
        thumbnail: thumbnailUrl,
        uploaderId,
        pHash: "processing...",
        aiAnalysis: { isOfficial: false, confidence: 0, reasoning: "Processing..." },
        status: 'Processing',
        metadata: {
          format,
          size: req.file.size,
          title: req.file.originalname.replace(/\.[^.]+$/, ''),
        },
      });

      // Initialize processing status tracker
      const trackingId = newAsset._id.toString();
      processingStatus.set(trackingId, {
        phase: 'uploading',
        progress: 100,
        message: 'Upload complete. Starting analysis…',
        startedAt: Date.now(),
      });

      res.status(202).json({
        success: true,
        message: "Asset upload received. pHash generation and AI analysis started automatically.",
        asset: newAsset,
        trackingId,
      });

      // Fire-and-forget background processing — pHash + Vision API
      // For images, pass the local file path so Jimp can read it directly.
      // For videos, pass the public URL (Vision API needs a URL; pHash will use a frame).
      const analysisSource = isImage ? absolutePath : thumbnailUrl;
      processAssetBackground(newAsset._id, analysisSource).catch(console.error);
    } else {
      // Mock response when DB is offline — still a real file, just not persisted
      const mockAsset = {
        _id: `mock_${Date.now()}`,
        url: relativePath,
        thumbnail: thumbnailUrl,
        uploaderId,
        pHash: "mock_hash",
        aiAnalysis: { isOfficial: true, confidence: 95, reasoning: "Mock analysis — DB offline." },
        status: 'Verified',
        createdAt: new Date().toISOString(),
      };
      return res.status(202).json({
        success: true,
        message: "Asset received (seed-data mode).",
        asset: mockAsset,
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ success: false, message: "Server error during upload." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/assets/:id/status
// Returns the real-time processing status of an asset being analyzed.
// The frontend can poll this to show progress.
// ─────────────────────────────────────────────────────────────────────────────
export const getAssetStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = processingStatus.get(id);

    if (status) {
      return res.status(200).json({ success: true, ...status });
    }

    // If not in memory, try DB
    if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const asset = await Asset.findById(id).select('status pHash aiAnalysis').lean();
      if (asset) {
        return res.status(200).json({
          success: true,
          phase: asset.status === 'Processing' ? 'analyzing' : 'complete',
          progress: asset.status === 'Processing' ? 50 : 100,
          message: asset.status === 'Processing'
            ? 'Analysis in progress…'
            : `Analysis complete. Status: ${asset.status}`,
          asset,
        });
      }
    }

    return res.status(404).json({ success: false, message: "Asset not found." });
  } catch (error) {
    console.error("Status check error:", error);
    return res.status(500).json({ success: false, message: "Failed to check status." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/assets/:id
// Updates an existing asset. Only works for real (non-seed) assets.
// ─────────────────────────────────────────────────────────────────────────────
export const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;

    if (id.startsWith('seed_asset_')) {
      return res.status(403).json({ success: false, message: "Cannot modify demo assets." });
    }

    if (!isDbConnected() || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid asset ID." });
    }

    const updated = await Asset.findByIdAndUpdate(id, req.body, { new: true, lean: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Asset not found." });
    }

    return res.status(200).json({ success: true, asset: updated });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ success: false, message: "Failed to update asset." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/assets/:id
// Deletes an asset. Only works for real (non-seed) assets.
// ─────────────────────────────────────────────────────────────────────────────
export const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;

    if (id.startsWith('seed_asset_')) {
      return res.status(403).json({ success: false, message: "Cannot delete demo assets." });
    }

    if (!isDbConnected() || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid asset ID." });
    }

    const deleted = await Asset.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Asset not found." });
    }

    return res.status(200).json({ success: true, message: "Asset deleted." });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete asset." });
  }
};

// ── Background processor ─────────────────────────────────────────────────────
// Automatically runs pHash generation AND Vision API analysis when an asset
// is uploaded. The user never needs to manually trigger analysis.
const processAssetBackground = async (assetId, imageUrl) => {
  const trackingId = assetId.toString();

  try {
    console.log(`🔍 Starting automated analysis for asset ${assetId}`);

    // ── Phase 1: Perceptual Hash generation ─────────────────────────────────
    processingStatus.set(trackingId, {
      phase: 'hashing',
      progress: 30,
      message: 'Generating perceptual fingerprint (pHash)…',
      startedAt: Date.now(),
    });

    const hash = await generatePHash(imageUrl).catch((err) => {
      console.error("Hashing failed:", err);
      return "hash_failed";
    });

    // ── Phase 2: Vision API / AI Analysis ───────────────────────────────────
    processingStatus.set(trackingId, {
      phase: 'analyzing',
      progress: 60,
      message: 'Running AI content analysis (Vision API)…',
      startedAt: Date.now(),
    });

    const aiReport = await analyzeWithVision(imageUrl);

    // ── Phase 3: Save results ───────────────────────────────────────────────
    processingStatus.set(trackingId, {
      phase: 'finalizing',
      progress: 90,
      message: 'Saving analysis results…',
      startedAt: Date.now(),
    });

    const finalStatus = aiReport.isOfficial ? 'Verified' : 'Flagged';

    await Asset.findByIdAndUpdate(assetId, {
      pHash: hash,
      aiAnalysis: {
        isOfficial: aiReport.isOfficial,
        confidence: aiReport.confidence,
        reasoning: aiReport.reasoning,
        labels: aiReport.labels || [],
        logos: aiReport.logos || [],
      },
      status: finalStatus,
    });

    // ── Complete ────────────────────────────────────────────────────────────
    processingStatus.set(trackingId, {
      phase: 'complete',
      progress: 100,
      message: `Analysis complete. Asset is ${finalStatus}.`,
      result: {
        pHash: hash,
        aiReport,
        status: finalStatus,
      },
      completedAt: Date.now(),
    });

    console.log(`✅ Completed automated analysis for asset ${assetId}: ${finalStatus}`);

    // Clean up status after 10 minutes
    setTimeout(() => processingStatus.delete(trackingId), 10 * 60 * 1000);
  } catch (err) {
    console.error(`❌ Background processing failed for asset ${assetId}:`, err);

    processingStatus.set(trackingId, {
      phase: 'error',
      progress: 0,
      message: 'Analysis failed. Please try re-uploading.',
      error: err.message,
    });

    await Asset.findByIdAndUpdate(assetId, { status: 'Flagged' }).catch(() => {});
  }
};