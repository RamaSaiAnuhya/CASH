import {
  createTrip as createTripService,
  joinTrip as joinTripService,
  getUserTrips,
} from "../services/tripService.js";

function getUserId(req) {
  // Assumes your JWT middleware sets req.user.userId.
  return req.user?.userId;
}

export async function createTrip(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const { name } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Trip name is required",
      });
    }

    const trip = await createTripService(userId, name);

    return res.status(201).json({
      message: "Trip created successfully",
      trip,
    });
  } catch (error) {
    console.error("Create trip error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Could not create trip",
    });
  }
}

export async function joinTrip(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const { groupCode } = req.body;

    if (typeof groupCode !== "string" || !groupCode.trim()) {
      return res.status(400).json({
        message: "Group code is required",
      });
    }

    const result = await joinTripService(userId, groupCode);

    return res.status(200).json({
      message: result.alreadyMember
        ? "You are already a member of this trip"
        : "Joined trip successfully",
      trip: result.trip,
      alreadyMember: result.alreadyMember,
    });
  } catch (error) {
    console.error("Join trip error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Could not join trip",
    });
  }
}

export async function listTrips(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const trips = await getUserTrips(userId);

    return res.status(200).json({ trips });
  } catch (error) {
    console.error("List trips error:", error);

    return res.status(500).json({
      message: "Could not fetch trips",
    });
  }
}
