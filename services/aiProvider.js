const SYSTEM_PROMPT = `You are Bloom & Grow's kind, practical gardening assistant. Give clear, beginner-friendly advice, with short numbered steps when useful. Prefer organic and pollinator-friendly options. Ask a concise follow-up question when the plant, location, climate, or symptoms are needed to give safe, specific advice. Be honest when a diagnosis is uncertain.`;

async function askGardeningAssistant(message, history) {
  const { AI_API_KEY: apiKey, AI_API_URL: apiUrl, AI_MODEL: model = "gpt-4o-mini" } = process.env;
  if (!apiKey || apiKey === "your-api-key-here") {
    const error = new Error("AI provider is not configured.");
    error.code = "AI_NOT_CONFIGURED";
    throw error;
  }

  let response;
  try {
    response = await fetch(apiUrl || "https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...history.slice(-10).map(({ role, content }) => ({ role, content })),
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
      signal: AbortSignal.timeout(30000)
    });
  } catch (cause) {
    const error = new Error("The AI provider could not be reached.", { cause });
    error.code = "AI_UNAVAILABLE";
    throw error;
  }

  if (!response.ok) {
    console.error(`AI provider returned HTTP ${response.status}.`);
    const error = new Error("The AI provider returned an error.");
    error.code = "AI_UNAVAILABLE";
    throw error;
  }
  let data;
  try {
    data = await response.json();
  } catch (cause) {
    const error = new Error("The AI provider returned an invalid response.", { cause });
    error.code = "AI_UNAVAILABLE";
    throw error;
  }
  const reply = data.choices?.[0]?.message?.content;
  if (typeof reply !== "string" || !reply.trim()) {
    console.error("AI provider response did not include a usable answer.");
    const error = new Error("The AI provider response was invalid.");
    error.code = "AI_UNAVAILABLE";
    throw error;
  }
  return reply.trim();
}

module.exports = { askGardeningAssistant };
