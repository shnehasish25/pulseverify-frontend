import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Violation from "../models/Violation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedDataPath = path.join(__dirname, '../data/seedData.json');

const getSeedData = () => {
  const data = fs.readFileSync(seedDataPath, 'utf-8');
  return JSON.parse(data);
};

const isDbConnected = () => mongoose.connection.readyState === 1;

// @route   GET /api/comparisons
// @desc    Get all comparisons (violations)
// @access  Private
export const getAllComparisons = async (_req, res) => {
  try {
    if (isDbConnected()) {
      const comparisons = await Violation.find().sort({ detectedAt: -1 }).lean();
      if (comparisons.length > 0) {
        return res.status(200).json(comparisons);
      }
    }

    // Seed data fallback
    const seedData = getSeedData();
    const comparisons = seedData.violations.map((v, index) => {
      const masterIndex = index % seedData.assets.length;
      return {
        ...v,
        _id: `seed_violation_${index}`,
        masterAssetId: `seed_asset_${masterIndex}`,
        masterAssetUrl: seedData.assets[masterIndex].url,
        detectedAt: new Date(Date.now() - index * 3600000 * 6).toISOString(),
      };
    });

    return res.status(200).json(comparisons);
  } catch (error) {
    console.error("Error fetching comparisons:", error);
    return res.status(500).json({ success: false, message: "Server error while fetching comparisons." });
  }
};

// @route   GET /api/comparisons/:id
// @desc    Get specific comparison by ID
// @access  Private
export const getComparisonById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const comparison = await Violation.findById(id).lean();
      if (comparison) return res.status(200).json(comparison);
    }

    // Seed data fallback
    const seedData = getSeedData();
    const seedIndex = parseInt(id.replace('seed_violation_', ''), 10);
    const idx = isNaN(seedIndex) ? 0 : seedIndex;
    const violation = seedData.violations[idx];

    if (!violation) {
      return res.status(404).json({ success: false, message: "Comparison not found." });
    }

    const masterIndex = idx % seedData.assets.length;
    return res.status(200).json({
      ...violation,
      _id: id,
      masterAssetId: `seed_asset_${masterIndex}`,
      masterAssetUrl: seedData.assets[masterIndex].url,
      detectedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching comparison by ID:", error);
    return res.status(500).json({ success: false, message: "Server error while fetching comparison." });
  }
};
