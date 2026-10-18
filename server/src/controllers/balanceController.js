import { getTripBalances } from "../services/balanceService.js";

export async function getTripBalancesController(req, res) {
  try {
    const tripId = Number(req.params.tripId);
    const userId = Number(req.user.userId);

    if (
      !Number.isSafeInteger(tripId) ||
      tripId <= 0 ||
      !Number.isSafeInteger(userId) ||
      userId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid trip or user ID.",
      });
    }

    const result = await getTripBalances(tripId, userId);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get trip balances error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.statusCode
        ? error.message
        : "Failed to calculate trip balances.",
    });
  }
}
