import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
