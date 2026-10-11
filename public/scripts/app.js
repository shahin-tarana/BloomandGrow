const state = { flowers: [], tips: [], category: "All blooms", query: "", history: [], busy: false };
const flowerGrid = document.querySelector("#flower-grid");
const flowerCount = document.querySelector("#flower-count");
const categoryFilters = document.querySelector("#category-filters");
const flowerEmpty = document.querySelector("#flower-empty");
const tipsGrid = document.querySelector("#tips-grid");
const searchInput = document.querySelector("#garden-search");
const searchFeedback = document.querySelector("#search-feedback");
const dialog = document.querySelector("#flower-dialog");
const dialogContent = document.querySelector("#dialog-content");
const chatMessages = document.querySelector("#chat-messages");
const chatInput = document.querySelector("#chat-input");
const chatButton = document.querySelector("#chat-form button");
const chatHistory = [];

function fallbackImage(image) {
  image.addEventListener("error", () => {
    if (image.dataset.fallback && image.src !== image.dataset.fallback) {
      image.src = image.dataset.fallback;
    } else {
      image.src = "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=80";
    }
    image.dataset.fallback = "";
  }, { once: true });
}

function flowerMatches(flower, query) {
  const text = Object.values(flower).join(" ").toLowerCase();
  return text.includes(query);
}

function renderCategories() {
  const categories = ["All blooms", ...new Set(state.flowers.map((flower) => flower.category))];
  categoryFilters.replaceChildren();
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `filter-chip${state.category === category ? " selected" : ""}`;
    button.textContent = category;
    button.setAttribute("aria-pressed", String(state.category === category));
    button.addEventListener("click", () => {
      state.category = category;
      renderCategories();
      renderFlowers();
    });
    categoryFilters.append(button);
  });
}

function renderFlowers() {
  const visible = state.flowers.filter((flower) =>
    (state.category === "All blooms" || flower.category === state.category) &&
    flowerMatches(flower, state.query)
  );
  flowerGrid.replaceChildren();
  visible.forEach((flower, index) => {
    const card = document.createElement("article");
    card.className = "flower-card";
    card.style.animationDelay = `${Math.min(index, 8) * 35}ms`;
    card.innerHTML = `
      <div class="flower-image-box">
        <img class="flower-image" src="${flower.image}" alt="${flower.name} in bloom" loading="lazy">
        <span class="flower-category">${flower.category}</span>
      </div>
      <div class="flower-card-body">
        <h3>${flower.name}</h3>
        <span class="flower-botanical">${flower.botanicalName}</span>
        <p>${flower.description}</p>
        <button class="flower-details" type="button" data-slug="${flower.slug}" aria-label="View growing details for ${flower.name}">Get to know it <span>→</span></button>
      </div>`;
    fallbackImage(card.querySelector("img"));
    card.querySelector(".flower-details").addEventListener("click", () => showFlower(flower.slug));
    flowerGrid.append(card);
  });
  flowerCount.textContent = `${visible.length} ${visible.length === 1 ? "bloom" : "blooms"} to fall for`;
  flowerEmpty.hidden = visible.length > 0;
}

function renderTips() {
  tipsGrid.replaceChildren();
  state.tips.forEach((tip) => {
    const card = document.createElement("article");
    card.className = "tip-card";
    card.innerHTML = `<span class="tip-icon" aria-hidden="true">${tip.icon}</span><span class="tip-category">${tip.category}</span><h3>${tip.title}</h3><p>${tip.text}</p>`;
    tipsGrid.append(card);
  });
}

function showFlower(slug) {
  const flower = state.flowers.find((item) => item.slug === slug);
  if (!flower) return;
  const sections = [
    ["Ideal climate", flower.climate], ["Temperature", flower.temperature],
    ["Sunlight", flower.sunlight], ["Soil", flower.soil],
    ["Watering", flower.watering], ["Fertilizer", flower.fertilizer],
    ["Planting", flower.planting], ["Propagation", flower.propagation],
    ["Pests & diseases", flower.pests], ["Seasonal care", flower.seasonal]
  ];
  dialogContent.innerHTML = `
    <div class="dialog-hero"><img src="${flower.image}" alt="${flower.name} flower"><h2 id="dialog-title">${flower.name}</h2></div>
    <div class="dialog-body">
      <span class="dialog-botanical">${flower.botanicalName}</span>
      <p class="dialog-description">${flower.description}</p>
      <div class="flower-fact"><strong>A little flower fact</strong><br>${flower.fact}</div>
      <div class="detail-grid">${sections.map(([heading, text]) => `<section class="detail-item"><h3>${heading}</h3><p>${text}</p></section>`).join("")}</div>
    </div>`;
  fallbackImage(dialogContent.querySelector("img"));
  dialog.showModal();
}

async function loadGarden() {
  try {
    const [flowerResponse, tipResponse] = await Promise.all([fetch("/api/flowers"), fetch("/api/flowers/tips")]);
    if (!flowerResponse.ok || !tipResponse.ok) throw new Error("Garden data could not be loaded.");
    [state.flowers, state.tips] = await Promise.all([flowerResponse.json(), tipResponse.json()]);
    renderCategories();
    renderFlowers();
    renderTips();
    applySearch(searchInput.value);
  } catch (error) {
    flowerGrid.innerHTML = '<p class="empty-state">We couldn’t gather the garden just now. Please refresh to try again.</p>';
    console.error(error);
  }
}

function applySearch(value, announce = false) {
  state.query = value.trim().toLowerCase();
  if (state.query && state.category !== "All blooms") {
    state.category = "All blooms";
    renderCategories();
  }
  renderFlowers();
  let matchingTips = 0;
  tipsGrid.querySelectorAll(".tip-card").forEach((card) => {
    const matches = !state.query || card.textContent.toLowerCase().includes(state.query);
    card.hidden = !matches;
    if (matches) matchingTips += 1;
  });
  if (announce) {
    const total = flowerGrid.querySelectorAll(".flower-card").length + matchingTips;
    searchFeedback.textContent = state.query
      ? `${total} ${total === 1 ? "garden match" : "garden matches"} — flowers and tips included.`
      : "Showing all the good things growing here.";
    document.querySelector("#flowers").scrollIntoView({ behavior: "smooth" });
  } else {
    searchFeedback.textContent = "";
  }
}

function addMessage(role, text, typing = false) {
  const row = document.createElement("div");
  row.className = `message ${role === "user" ? "user-message" : "assistant-message"}`;
  if (role !== "user") {
    const avatar = document.createElement("span");
    avatar.className = "message-avatar";
    avatar.textContent = "✿";
    row.append(avatar);
  }
  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  if (typing) {
    bubble.setAttribute("aria-label", "Garden buddy is thinking");
    bubble.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
  } else {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    bubble.append(paragraph);
  }
  row.append(bubble);
  chatMessages.append(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return row;
}

async function sendQuestion(question) {
  if (state.busy || !question.trim()) return;
  state.busy = true;
  chatButton.disabled = true;
  addMessage("user", question);
  const pending = addMessage("assistant", "", true);
  chatInput.value = "";
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: question, history: chatHistory.slice(-10) })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "We couldn't get an answer just now.");
    pending.remove();
    addMessage("assistant", data.reply);
    chatHistory.push({ role: "user", content: question }, { role: "assistant", content: data.reply });
  } catch (error) {
    pending.remove();
    addMessage("assistant", error.message || "Our garden buddy is taking a little rest. Please try again soon.");
  } finally {
    state.busy = false;
    chatButton.disabled = false;
    chatInput.focus();
  }
}

document.querySelector("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  applySearch(searchInput.value, true);
});
searchInput.addEventListener("input", () => applySearch(searchInput.value));
document.querySelector("#chat-form").addEventListener("submit", (event) => {
  event.preventDefault();
  sendQuestion(chatInput.value);
});
document.querySelectorAll(".prompt-chip").forEach((button) => {
  button.addEventListener("click", () => {
    chatInput.value = button.textContent;
    document.querySelector("#assistant").scrollIntoView({ behavior: "smooth" });
    chatInput.focus();
  });
});
document.querySelector("#chat-reset").addEventListener("click", () => {
  chatHistory.length = 0;
  chatMessages.replaceChildren();
  addMessage("assistant", "A fresh page in the garden! 🌱 What would you like to know?");
});
document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
document.querySelectorAll(".hero-image-wrap img").forEach(fallbackImage);
const menuToggle = document.querySelector(".menu-toggle");
menuToggle.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(open));
  document.querySelector(".main-nav").classList.toggle("open", open);
});
document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelector(".main-nav").classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

loadGarden();
