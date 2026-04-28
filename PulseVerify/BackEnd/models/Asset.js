import mongoose from "mongoose";

const assetSchema = new mongoose.Schema({
  url: { 
    type: String, 
    required: true 
  },
  thumbnail: {
    type: String,
    default: null
  }, // Real displayable image/video URL (Unsplash CDN for seeds, /uploads/ for real uploads)
  pHash: { 
    type: String, 
    required: true, 
    index: true 
  }, // Perceptual Hash for fingerprinting
  uploaderId: { 
    type: String, 
    required: true 
  }, // Firebase UID
  aiAnalysis: {
    isOfficial: { type: Boolean, required: true },
    confidence: { type: Number, required: true },
    reasoning: { type: String },
    logos: [{
      description: String,
      score: Number
    }]
  },
  status: { 
    type: String, 
    enum: ['Processing', 'Verified', 'Flagged'], 
    default: 'Processing' 
  },
  metadata: {
    format: String,
    size: Number,
    league: String,
    title: String,
    duration: String,
    resolution: String
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model("Asset", assetSchema);
