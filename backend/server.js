import express from "express";
import cookieParser from "cookie-parser";
import { protectRoute } from "./middleware/protectRoute.js";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import movieRoutes from "./routes/movies.route.js";
import searchRoutes from "./routes/search.route.js";
import tvRoutes from "./routes/tv.route.js";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import helmet from "helmet";
import path from "path";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;
const _dirname = path.resolve();
app.use(express.json());
app.use(helmet());
app.use(cookieParser());
if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    })
  );
}

app.use("/api/auth", authRoutes);
app.use("/api/v1/movie", protectRoute, movieRoutes);
app.use("/api/v1/search", protectRoute, searchRoutes);
app.use("/api/v1/tv", protectRoute, tvRoutes);
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  connectDB();
});
