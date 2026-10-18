import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  createExpenseController,
  getTripExpensesController,
  updateExpenseController,
  deleteExpenseController,
} from "../controllers/expenseController.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get("/", getTripExpensesController);
router.post("/", createExpenseController);

router.patch("/:expenseId", updateExpenseController);
router.delete("/:expenseId", deleteExpenseController);

export default router;
