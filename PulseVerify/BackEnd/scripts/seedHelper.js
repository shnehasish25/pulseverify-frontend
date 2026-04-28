import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Asset from '../models/Asset.js';
import Violation from '../models/Violation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedDataPath = path.join(__dirname, '../data/seedData.json');

/**
 * Seed Data Helper
 * Automatically populates the MongoDB collections from seedData.json
 * if the database is empty. Safe to call on every server start.
 */
export const seedIfEmpty = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log("⚠️  DB not connected — skipping auto-seed.");
      return;
    }

    const assetCount = await Asset.countDocuments();
    const violationCount = await Violation.countDocuments();

    if (assetCount > 0 || violationCount > 0) {
      console.log(`📦 Database already has data (${assetCount} assets, ${violationCount} violations). Skipping seed.`);
      return;
    }

    console.log("🌱 Database is empty — seeding from seedData.json...");

    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));

    // Insert assets
    const insertedAssets = await Asset.insertMany(seedData.assets);
    console.log(`   ✅ Inserted ${insertedAssets.length} assets.`);

    // Insert violations linked to the inserted assets
    const violationsToInsert = seedData.violations.map((violation, index) => {
      const masterAsset = insertedAssets[index % insertedAssets.length];
      return {
        ...violation,
        masterAssetId: masterAsset._id,
        masterAssetUrl: masterAsset.url,
        detectedAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
      };
    });

    const insertedViolations = await Violation.insertMany(violationsToInsert);
    console.log(`   ✅ Inserted ${insertedViolations.length} violations.`);
    console.log("🌱 Database seeding complete!");
  } catch (error) {
    console.error("⚠️  Auto-seed failed (non-fatal):", error.message);
    // Non-fatal — the app continues with seed-data file fallback
  }
};
