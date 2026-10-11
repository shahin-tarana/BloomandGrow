const express = require("express");
const { askGardeningAssistant } = require("../services/aiProvider");

const router = express.Router();

router.post("/", async (req, res, next) => {
  const { message, history } = req.body || {};

  if (typeof message !== "string" || message.trim().length < 2 || message.length > 1000) {
    return res.status(400).json({ error: "Please enter a question between 2 and 1,000 characters." });
  }
  if (history !== undefined && (!Array.isArray(history) || history.length > 12 ||
      history.some((item) => !item || !["user", "assistant"].includes(item.role) ||
        typeof item.content !== "string" || item.content.length > 2000))) {
    return res.status(400).json({ error: "Chat history is invalid. Please start a new conversation." });
  }

  try {
    const reply = await askGardeningAssistant(message.trim(), history || []);
    return res.json({ reply });
  } catch (error) {
    if (error.code === "AI_NOT_CONFIGURED") {
      return res.status(503).json({
        error: "The gardening assistant isn't connected yet. Add your AI_API_KEY to the server's .env file, then restart the app."
      });
    }
    if (error.code === "AI_UNAVAILABLE") {
      return res.status(502).json({ error: "Our gardening assistant is taking a little rest. Please try again soon." });
    }
    return next(error);
  }
});

module.exports = router;
