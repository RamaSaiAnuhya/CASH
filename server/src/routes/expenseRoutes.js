import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  createExpenseController,
  getTripExpensesController,
} from "../controllers/expenseController.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get("/", getTripExpensesController);
router.post("/", createExpenseController);

export default router;
