export function validateCreateTrip(req, res, next) {
  const { name, description } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ message: "Group name is required" });
  }

  if (name.trim().length > 100) {
    return res
      .status(400)
      .json({ message: "Group name cannot exceed 100 characters" });
  }

  if (
    description !== undefined &&
    description !== null &&
    typeof description !== "string"
  ) {
    return res.status(400).json({ message: "Description must be text" });
  }

  if (typeof description === "string" && description.length > 500) {
    return res
      .status(400)
      .json({ message: "Description cannot exceed 500 characters" });
  }

  next();
}

export function validateTripId(req, res, next) {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ message: "Invalid group ID" });
  }

  next();
}
