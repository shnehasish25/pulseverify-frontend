import mongoose from "mongoose";

const violationSchema = new mongoose.Schema({
  masterAssetId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Asset', 
    required: true 
  },
  masterAssetUrl: {
    type: String
  },
  suspectUrl: { 
    type: String, 
    required: true 
  },
  pHashDistance: { 
    type: Number, 
    required: true 
  }, // Hamming distance to master asset
  confidence: { 
    type: Number, 
    required: true 
  },
  detectedAt: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    enum: ['Open', 'Under Review', 'Takedown Issued', 'Resolved', 'Dismissed'], 
    default: 'Open' 
  },
  platform: { 
    type: String,
    default: 'Unknown'
  }, // e.g., 'Twitter', 'YouTube', 'Unknown'
  aiContext: { 
    type: String 
  }, // Additional reasoning from AI
  coordinates: {
    type: [Number]
  },
  country: {
    type: String
  },
  city: {
    type: String
  },
  // ── Rich evidence fields ────────────────────────────────────────────────────
  modifications: {
    type: [String],
    default: []
  }, // e.g. ["Bitrate reduction", "Audio re-encoding"]
  matchedLogos: {
    type: [String],
    default: []
  }, // e.g. ["Premier League watermark visible", "Sky Sports bug"]
  detectedVia: {
    type: String,
    default: 'Automated pHash scan'
  },
  estimatedReach: {
    type: String,
    default: 'Unknown'
  },
  uploaderProfile: {
    type: String,
    default: 'Unknown'
  }
});

export default mongoose.model("Violation", violationSchema);
