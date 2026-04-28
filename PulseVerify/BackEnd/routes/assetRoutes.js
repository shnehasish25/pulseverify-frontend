import express from 'express';
import { handleNewUpload, getAllAssets, getAssetById, getAssetStatus, updateAsset, deleteAsset } from '../controllers/assetController.js';
import { checkAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All asset routes are protected
router.use(checkAuth);

router.get('/', getAllAssets);
router.get('/:id', getAssetById);
router.get('/:id/status', getAssetStatus);

// Upload endpoint accepts a real file via multipart form data
// Multer parses the file and makes it available as req.file
router.post('/upload', upload.single('file'), handleNewUpload);

router.put('/:id', updateAsset);
router.delete('/:id', deleteAsset);

export default router;
