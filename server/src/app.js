import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

import prisma from "./config/database.js";

app.get("/api/db-test", async (req, res) => {
  try {
    const users = await prisma.user.findMany();

    res.json({
      status: "ok",
      message: "Database connected successfully",
      users,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

export default app;
