const path = require("path");
const express = require("express");
require("dotenv").config();

const flowerRoutes = require("./routes/flowers");
const chatRoutes = require("./routes/chat");

const app = express();
const port = Number(process.env.PORT) || 3000;

app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));
app.use("/api/flowers", flowerRoutes);
app.use("/api/chat", chatRoutes);
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ error: "Please send valid JSON." });
  }
  console.error("Request error:", error);
  return res.status(500).json({ error: "Something went wrong. Please try again." });
});

app.listen(port, () => {
  console.log(`Bloom & Grow is blooming at http://localhost:${port}`);
});
