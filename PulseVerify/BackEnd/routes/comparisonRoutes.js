import express from "express";
import { getAllComparisons, getComparisonById } from "../controllers/comparisonController.js";
import { checkAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", checkAuth, getAllComparisons);
router.get("/:id", checkAuth, getComparisonById);

export default router;
