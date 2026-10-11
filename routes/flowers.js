const express = require("express");
const flowers = require("../data/flowers");
const tips = require("../data/tips");

const router = express.Router();

router.get("/tips", (_req, res) => {
  res.json(tips);
});

router.get("/", (_req, res) => {
  res.json(flowers);
});

router.get("/:slug", (req, res) => {
  const flower = flowers.find((item) => item.slug === req.params.slug);
  if (!flower) return res.status(404).json({ error: "We couldn't find that flower." });
  return res.json(flower);
});

module.exports = router;
