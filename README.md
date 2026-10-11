# Bloom & Grow 🌷

A colourful, responsive gardening guide built with Node.js, Express, and vanilla HTML, CSS, and JavaScript. Browse ten flower profiles, search plant-care advice, explore practical gardening tips, and ask the AI garden buddy a question.

## Run locally

1. Install Node.js 18 or newer.
2. Install dependencies:

   ```sh
   npm install
   ```

3. (Optional) Configure the AI assistant:

   ```sh
   cp .env.example .env
   ```

   Add your provider's API key to `AI_API_KEY`. The integration uses an OpenAI-compatible chat completions API. Set `AI_API_URL` and `AI_MODEL` if your provider uses a different endpoint or model. The key stays on the server and is never sent to the browser. Without a key, the rest of the app works normally and the chat gives a friendly setup message.

4. Start the server:

   ```sh
   npm start
   ```

   Visit [http://localhost:3000](http://localhost:3000). For automatic restarts during development, use `npm run dev`.

## Try the features

- Browse the flower guide, filter by category, or open a flower card for growing conditions, care, propagation, and pest information.
- Search for flower names or terms such as “watering”, “sun”, or “soil” to find matching flowers and gardening tips.
- Use the gardening tips section for advice on soil, watering, containers, seeds, pruning, pests, and indoor plants.
- Ask the garden buddy a question, try one of the suggested prompts, and use the refresh button to start a new conversation. Configure `AI_API_KEY` first for generated answers.
- Check the API directly: `GET /api/flowers`, `GET /api/flowers/roses`, `GET /api/flowers/tips`, and `POST /api/chat` with JSON such as `{"message":"How do I grow roses at home?"}`.
- `GET /api/health` reports whether the server is running.

## Deploy to Render

1. Push the project to a Git repository. `.env` and `node_modules` are excluded by `.gitignore`; do not commit API keys.
2. In Render, create a **Web Service** and connect the repository.
3. Select **Node** as the runtime, use `npm install` as the build command, and `npm start` as the start command. Render provides the `PORT` environment variable.
4. In the service's **Environment** settings, add `AI_API_KEY`. If needed, also set `AI_API_URL` and `AI_MODEL`. Do not add quotes around the values.
5. Deploy. The app serves its static frontend and API from the same service. No database or separate frontend hosting is needed.

## Project layout

```text
data/               Local flower and gardening-tip content
public/             HTML, stylesheets, and browser JavaScript
routes/             Express flower and chat API routes
services/           Modular AI provider integration
server.js           Express app entry point
.env.example        Environment variable template
```

The chat endpoint currently expects an OpenAI-compatible `POST /chat/completions` API response. The provider can be changed in `services/aiProvider.js` without changing the frontend.
