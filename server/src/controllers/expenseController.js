import {
  createExpense,
  getTripExpenses,
  updateExpense,
  deleteExpense,
} from "../services/expenseService.js";
import { validateCreateExpense } from "../validators/expenseValidator.js";

function parsePositiveId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function createExpenseController(req, res) {
  const tripId = parsePositiveId(req.params.tripId);
  const userId = parsePositiveId(req.user?.userId);

  if (!tripId) {
    return res.status(400).json({ message: "Invalid trip ID." });
  }

  if (!userId) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const validationError = validateCreateExpense(req.body);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const expense = await createExpense({
      tripId,
      userId,
      name: req.body.name,
      amountPaise: req.body.amountPaise,
      payerId: req.body.payerId,
      participantIds: req.body.participantIds,
      sharingMode: req.body.sharingMode ?? "EQUAL",
      participantShares: req.body.participantShares ?? [],
    });

    return res.status(201).json({
      message: "Expense created successfully.",
      expense,
    });
  } catch (error) {
    if (error.message === "Trip not found or you are not a member.") {
      return res.status(404).json({ message: error.message });
    }

    if (error.message === "Payer and participants must belong to this trip.") {
      return res.status(400).json({ message: error.message });
    }

    console.error("Create expense error:", error);

    return res.status(500).json({
      message: "Unable to create expense.",
    });
  }
}

export async function getTripExpensesController(req, res) {
  const tripId = parsePositiveId(req.params.tripId);
  const userId = parsePositiveId(req.user?.userId);

  if (!tripId) {
    return res.status(400).json({ message: "Invalid trip ID." });
  }

  if (!userId) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const expenses = await getTripExpenses(tripId, userId);

    return res.status(200).json({ expenses });
  } catch (error) {
    if (error.message === "Trip not found or you are not a member.") {
      return res.status(404).json({ message: error.message });
    }

    console.error("Get expenses error:", error);

    return res.status(500).json({
      message: "Unable to fetch expenses.",
    });
  }
}

export async function updateExpenseController(req, res) {
  const tripId = parsePositiveId(req.params.tripId);
  const expenseId = parsePositiveId(req.params.expenseId);
  const userId = parsePositiveId(req.user?.userId);

  if (!tripId || !expenseId) {
    return res.status(400).json({ message: "Invalid trip or expense ID." });
  }

  if (!userId) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const validationError = validateCreateExpense(req.body);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const expense = await updateExpense({
      tripId,
      expenseId,
      userId,
      name: req.body.name,
      amountPaise: req.body.amountPaise,
      payerId: req.body.payerId,
      participantIds: req.body.participantIds,
      sharingMode: req.body.sharingMode ?? "EQUAL",
      participantShares: req.body.participantShares ?? [],
    });

    return res.status(200).json({
      message: "Expense updated successfully.",
      expense,
    });
  } catch (error) {
    if (error.message === "Trip not found or you are not a member.") {
      return res.status(404).json({ message: error.message });
    }

    if (error.message === "Expense not found.") {
      return res.status(404).json({ message: error.message });
    }

    if (error.message === "Payer and participants must belong to this trip.") {
      return res.status(400).json({ message: error.message });
    }

    console.error("Update expense error:", error);
    return res.status(500).json({ message: "Unable to update expense." });
  }
}

export async function deleteExpenseController(req, res) {
  const tripId = parsePositiveId(req.params.tripId);
  const expenseId = parsePositiveId(req.params.expenseId);
  const userId = parsePositiveId(req.user?.userId);

  if (!tripId || !expenseId) {
    return res.status(400).json({ message: "Invalid trip or expense ID." });
  }

  if (!userId) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const result = await deleteExpense({ tripId, expenseId, userId });
    return res.status(200).json(result);
  } catch (error) {
    if (error.message === "Trip not found or you are not a member.") {
      return res.status(404).json({ message: error.message });
    }

    if (error.message === "Expense not found.") {
      return res.status(404).json({ message: error.message });
    }

    console.error("Delete expense error:", error);
    return res.status(500).json({ message: "Unable to delete expense." });
  }
}
