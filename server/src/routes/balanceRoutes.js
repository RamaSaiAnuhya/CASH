import { Router } from "express";
import { getTripBalancesController } from "../controllers/balanceController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/:tripId/balances", authMiddleware, getTripBalancesController);

export default router;
