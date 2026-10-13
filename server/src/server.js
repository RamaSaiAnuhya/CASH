import app from "./app.js";
import authRoutes from "./routes/authRoutes.js";

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.use("/api/auth", authRoutes);
