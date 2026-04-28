import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import Asset from '../models/Asset.js';
import Violation from '../models/Violation.js';

// Read JSON file
const seedDataPath = path.join(__dirname, '../data/seedData.json');
const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    console.log('Clearing existing data...');
    await Asset.deleteMany({});
    await Violation.deleteMany({});

    console.log('Inserting Assets...');
    const insertedAssets = await Asset.insertMany(seedData.assets);
    
    // Distribute violations among inserted assets to link them properly
    const violationsToInsert = seedData.violations.map((violation, index) => {
      // Pick a random master asset or round-robin
      const masterAsset = insertedAssets[index % insertedAssets.length];
      
      return {
        ...violation,
        masterAssetId: masterAsset._id,
        // Use the thumbnail (real Unsplash URL) for the Evidence Board comparison view
        masterAssetUrl: masterAsset.thumbnail || masterAsset.url,
        detectedAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)) // Random past dates
      };
    });

    console.log('Inserting Violations...');
    await Violation.insertMany(violationsToInsert);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
