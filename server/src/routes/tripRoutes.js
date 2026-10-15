import { Router } from "express";

import {
  createTrip,
  joinTrip,
  listTrips,
} from "../controllers/tripController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// All trip operations require a valid JWT.
router.use(authMiddleware);

router.post("/", createTrip);
router.post("/join", joinTrip);
router.get("/", listTrips);

export default router;
