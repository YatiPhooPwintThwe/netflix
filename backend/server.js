import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { protectRoute } from "./middleware/protectRoute.js";
import authRoutes from "./routes/auth.route.js";
import movieRoutes from "./routes/movies.route.js";
import searchRoutes from "./routes/search.route.js";
import tvRoutes from "./routes/tv.route.js";
import { connectDB } from "./lib/db.js";

dotenv.config();

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5003;

// Core middleware
app.use(express.json());
app.use(cookieParser());


app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// CORS only for development when client runs on a different origin
if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: process.env.CLIENT_URL, // e.g. http://localhost:5173
      credentials: true,
    })
  );
}

// API routes (must be BEFORE the SPA fallback)
app.use("/api/auth", authRoutes);
app.use("/api/v1/movie", protectRoute, movieRoutes);
app.use("/api/v1/search", protectRoute, searchRoutes);
app.use("/api/v1/tv", protectRoute, tvRoutes);

// Static files + SPA fallback in production
if (process.env.NODE_ENV === "production") {
  // server.js is in /backend; dist is ../frontend/dist
  const distPath = path.join(__dirname, "..", "frontend", "dist");

  app.use(express.static(distPath));

  // Express v5 wildcard: use '/*' or '/(.*)' (NOT '*')
  app.get("/*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  connectDB();
  console.log(`Server listening on ${PORT}`);
});
