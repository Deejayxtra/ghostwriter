import express from "express";
import cors from "cors";
import "dotenv/config";
import generateRouter from "../routes/generate.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json({ limit: "1mb" }));
app.use("/api", generateRouter);
app.get("/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Ghostwriter API on :${PORT}`));
