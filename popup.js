const STORAGE_KEYS = {
  cards: "contextkit_cards",
  workspace: "contextkit_workspace",
  quickTags: "contextkit_quick_tags"
};

const CATEGORY_OPTIONS = ["工作", "学术", "其他"];
const PLATFORM_CONFIG = [
  { id: "claude", label: "Claude", hosts: ["claude.ai"] },
  { id: "chatgpt", label: "ChatGPT", hosts: ["chat.openai.com", "chatgpt.com"] },
  { id: "gemini", label: "Gemini", hosts: ["gemini.google.com"] },
  { id: "doubao", label: "豆包", hosts: ["www.doubao.com", "doubao.com"] },
  { id: "kimi", label: "Kimi", hosts: ["kimi.moonshot.cn", "www.kimi.com"] },
  { id: "minimax", label: "MiniMax", hosts: ["chat.minimax.io", "agent.minimax.io", "www.minimax.io"] },
  { id: "qianwen", label: "千问", hosts: ["tongyi.aliyun.com", "www.qianwen.com"] },
  { id: "zhipu", label: "智谱清言", hosts: ["chatglm.cn"] },
  { id: "deepseek", label: "DeepSeek", hosts: ["chat.deepseek.com", "www.deepseek.com"] }
];

const EMPTY_OUTPUTS = Object.fromEntries(PLATFORM_CONFIG.map((platform) => [platform.id, ""]));

const DEFAULT_WORKSPACE = {
  activePlatform: "claude",
  outputs: { ...EMPTY_OUTPUTS },
  integrationNeed: "",
  generatedPrompt: ""
};

const QUICK_TAG_SCENES = {
  workplace: {
    label: "职场",
    tags: [
      "提炼核心观点，写成汇报结论",
      "整合成一份完整的活动方案",
      "取最有说服力的表达，润色成发言稿",
      "提取执行步骤，整理成清单"
    ]
  },
  academic: {
    label: "学术",
    tags: [
      "综合三方观点，保留论据和来源",
      "找出共同结论，标注分歧点",
      "整合成文献综述段落",
      "提取最严谨的表述方式"
    ]
  }
};

const DEFAULT_QUICK_TAGS = {
  scene: "workplace",
  selectedTags: {
    workplace: [],
    academic: []
  },
  customTags: {
    workplace: [],
    academic: []
  }
};

const state = {
  cards: [],
  editingId: null,
  currentTab: null,
  workspace: { ...DEFAULT_WORKSPACE },
  filterCategory: "全部",
  quickTags: structuredClone(DEFAULT_QUICK_TAGS),
  deletePromptTag: ""
};

const elements = {
  currentSite: document.getElementById("currentSite"),
  tabButtons: document.querySelectorAll(".tab-btn"),
  cardsPanel: document.getElementById("cardsPanel"),
  workspacePanel: document.getElementById("workspacePanel"),
  formTitle: document.getElementById("formTitle"),
  cardTitle: document.getElementById("cardTitle"),
  cardContent: document.getElementById("cardContent"),
  cardLengthHint: document.getElementById("cardLengthHint"),
  cardCategory: document.getElementById("cardCategory"),
  cardFilter: document.getElementById("cardFilter"),
  saveCardBtn: document.getElementById("saveCardBtn"),
  cancelEditBtn: document.getElementById("cancelEditBtn"),
  exportCardsBtn: document.getElementById("exportCardsBtn"),
  importCardsBtn: document.getElementById("importCardsBtn"),
  importCardsInput: document.getElementById("importCardsInput"),
  cardsList: document.getElementById("cardsList"),
  workspacePlatformTabs: document.getElementById("workspacePlatformTabs"),
  activePlatformLabel: document.getElementById("activePlatformLabel"),
  activePlatformOutput: document.getElementById("activePlatformOutput"),
  integrationNeed: document.getElementById("integrationNeed"),
  workspaceSceneSwitch: document.getElementById("workspaceSceneSwitch"),
  workspaceQuickTags: document.getElementById("workspaceQuickTags"),
  customTagInputWrap: document.getElementById("customTagInputWrap"),
  customTagInput: document.getElementById("customTagInput"),
  generatePromptBtn: document.getElementById("generatePromptBtn"),
  copyPromptBtn: document.getElementById("copyPromptBtn"),
  clearWorkspaceBtn: document.getElementById("clearWorkspaceBtn"),
  generatedPrompt: document.getElementById("generatedPrompt"),
  workspaceStatus: document.getElementById("workspaceStatus")
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bindEvents();
  await Promise.all([loadCards(), loadWorkspace(), loadQuickTags(), loadCurrentTab()]);
  renderPlatformTabs();
  renderQuickTagScenes();
  renderQuickTags();
  updateCardLengthHint();
  renderCards();
  renderWorkspace();
}

function bindEvents() {
  elements.tabButtons.forEach((button) => {
    button.addEventListener("click", () => switchRootTab(button.dataset.tab));
  });

  elements.saveCardBtn.addEventListener("click", saveCard);
  elements.cancelEditBtn.addEventListener("click", resetForm);
  elements.cardContent.addEventListener("input", updateCardLengthHint);
  elements.cardFilter.addEventListener("change", () => {
    state.filterCategory = elements.cardFilter.value;
    renderCards();
  });
  elements.exportCardsBtn.addEventListener("click", exportCards);
  elements.importCardsBtn.addEventListener("click", () => elements.importCardsInput.click());
  elements.importCardsInput.addEventListener("change", importCards);
  elements.activePlatformOutput.addEventListener("input", syncWorkspaceFromForm);
  elements.integrationNeed.addEventListener("input", syncWorkspaceFromForm);
  elements.customTagInput.addEventListener("keydown", handleCustomTagInput);
  elements.generatePromptBtn.addEventListener("click", generatePrompt);
  elements.copyPromptBtn.addEventListener("click", copyGeneratedPrompt);
  elements.clearWorkspaceBtn.addEventListener("click", clearWorkspace);

  chrome.storage.onChanged.addListener(handleStorageChanged);
}

async function loadCards() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.cards);
  state.cards = Array.isArray(result[STORAGE_KEYS.cards]) ? result[STORAGE_KEYS.cards] : [];
}

async function loadWorkspace() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.workspace);
  state.workspace = normalizeWorkspace(result[STORAGE_KEYS.workspace]);
}

async function loadQuickTags() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.quickTags);
  state.quickTags = normalizeQuickTags(result[STORAGE_KEYS.quickTags]);
}

async function loadCurrentTab() {
  state.currentTab = await getActiveTab();
  elements.currentSite.textContent = `当前网站：${getPlatformByUrl(state.currentTab?.url)?.label || "其他网站"}`;

  const inferredPlatform = getPlatformByUrl(state.currentTab?.url);
  if (inferredPlatform) {
    state.workspace.activePlatform = inferredPlatform.id;
  }
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0] || null;
}

function handleStorageChanged(changes, areaName) {
  if (areaName !== "local") {
    return;
  }

  if (changes[STORAGE_KEYS.cards]) {
    state.cards = Array.isArray(changes[STORAGE_KEYS.cards].newValue)
      ? changes[STORAGE_KEYS.cards].newValue
      : [];
    renderCards();
  }

  if (changes[STORAGE_KEYS.workspace]) {
    state.workspace = normalizeWorkspace(changes[STORAGE_KEYS.workspace].newValue);
    renderPlatformTabs();
    renderWorkspace();
  }

  if (changes[STORAGE_KEYS.quickTags]) {
    state.quickTags = normalizeQuickTags(changes[STORAGE_KEYS.quickTags].newValue);
    renderQuickTagScenes();
    renderQuickTags();
  }
}

function normalizeWorkspace(rawWorkspace) {
  const raw = rawWorkspace || {};
  const outputs = {
    ...EMPTY_OUTPUTS,
    ...(raw.outputs || {})
  };

  if (typeof raw.claudeOutput === "string") {
    outputs.claude = raw.claudeOutput;
  }

  if (typeof raw.chatgptOutput === "string") {
    outputs.chatgpt = raw.chatgptOutput;
  }

  if (typeof raw.geminiOutput === "string") {
    outputs.gemini = raw.geminiOutput;
  }

  return {
    activePlatform: PLATFORM_CONFIG.some((platform) => platform.id === raw.activePlatform)
      ? raw.activePlatform
      : DEFAULT_WORKSPACE.activePlatform,
    outputs,
    integrationNeed: typeof raw.integrationNeed === "string" ? raw.integrationNeed : "",
    generatedPrompt: typeof raw.generatedPrompt === "string" ? raw.generatedPrompt : ""
  };
}

function normalizeQuickTags(rawQuickTags) {
  const raw = rawQuickTags || {};
  return {
    scene: QUICK_TAG_SCENES[raw.scene] ? raw.scene : DEFAULT_QUICK_TAGS.scene,
    selectedTags: {
      workplace: Array.isArray(raw.selectedTags?.workplace) ? raw.selectedTags.workplace : [],
      academic: Array.isArray(raw.selectedTags?.academic) ? raw.selectedTags.academic : []
    },
    customTags: {
      workplace: Array.isArray(raw.customTags?.workplace) ? raw.customTags.workplace : [],
      academic: Array.isArray(raw.customTags?.academic) ? raw.customTags.academic : []
    }
  };
}

async function saveCardsToStorage() {
  await chrome.storage.local.set({ [STORAGE_KEYS.cards]: state.cards });
}

async function saveWorkspaceToStorage() {
  await chrome.storage.local.set({ [STORAGE_KEYS.workspace]: state.workspace });
}

async function saveQuickTagsToStorage() {
  await chrome.storage.local.set({ [STORAGE_KEYS.quickTags]: state.quickTags });
}

function switchRootTab(tabName) {
  elements.tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });

  elements.cardsPanel.classList.toggle("active", tabName === "cards");
  elements.workspacePanel.classList.toggle("active", tabName === "workspace");
}

function getPlatformByUrl(url = "") {
  try {
    const hostname = new URL(url).hostname;
    return PLATFORM_CONFIG.find((platform) => platform.hosts.includes(hostname)) || null;
  } catch (error) {
    return null;
  }
}

function getActivePlatform() {
  return PLATFORM_CONFIG.find((platform) => platform.id === state.workspace.activePlatform) || PLATFORM_CONFIG[0];
}

function renderPlatformTabs() {
  elements.workspacePlatformTabs.innerHTML = "";

  PLATFORM_CONFIG.forEach((platform) => {
    const button = document.createElement("button");
    button.className = `platform-tab${state.workspace.activePlatform === platform.id ? " active" : ""}`;
    button.textContent = platform.label;
    button.addEventListener("click", () => switchWorkspacePlatform(platform.id));
    elements.workspacePlatformTabs.appendChild(button);
  });
}

function switchWorkspacePlatform(platformId) {
  state.workspace.activePlatform = platformId;
  renderPlatformTabs();
  renderWorkspace();
  saveWorkspaceToStorage();
}

function renderQuickTagScenes() {
  elements.workspaceSceneSwitch.innerHTML = "";

  Object.entries(QUICK_TAG_SCENES).forEach(([sceneKey, scene]) => {
    const button = document.createElement("button");
    button.className = `scene-button${state.quickTags.scene === sceneKey ? " active" : ""}`;
    button.textContent = scene.label;
    button.addEventListener("click", () => switchQuickTagScene(sceneKey));
    elements.workspaceSceneSwitch.appendChild(button);
  });
}

function switchQuickTagScene(sceneKey) {
  state.quickTags.scene = sceneKey;
  state.deletePromptTag = "";
  elements.customTagInputWrap.classList.remove("visible");
  saveQuickTagsToStorage();
  renderQuickTagScenes();
  renderQuickTags();
}

function renderQuickTags() {
  const sceneKey = state.quickTags.scene;
  const baseTags = QUICK_TAG_SCENES[sceneKey].tags;
  const customTags = state.quickTags.customTags[sceneKey];
  const selectedTags = new Set(state.quickTags.selectedTags[sceneKey]);

  elements.workspaceQuickTags.innerHTML = "";

  [...baseTags, ...customTags].forEach((tag) => {
    const button = document.createElement("button");
    button.className = `quick-tag${selectedTags.has(tag) ? " active" : ""}`;
    button.textContent = tag;
    button.addEventListener("click", () => toggleQuickTag(tag));

    if (customTags.includes(tag)) {
      let timer = null;

      button.addEventListener("pointerdown", () => {
        timer = window.setTimeout(() => {
          state.deletePromptTag = tag;
          renderQuickTags();
        }, 600);
      });

      ["pointerup", "pointerleave", "pointercancel"].forEach((eventName) => {
        button.addEventListener(eventName, () => {
          if (timer) {
            window.clearTimeout(timer);
            timer = null;
          }
        });
      });
    }

    elements.workspaceQuickTags.appendChild(button);

    if (state.deletePromptTag === tag && customTags.includes(tag)) {
      const deleteButton = document.createElement("button");
      deleteButton.className = "mini-delete";
      deleteButton.textContent = `删除「${tag}」`;
      deleteButton.addEventListener("click", () => deleteCustomTag(tag));
      elements.workspaceQuickTags.appendChild(deleteButton);
    }
  });

  const addButton = document.createElement("button");
  addButton.className = "quick-tag";
  addButton.textContent = "＋ 自定义";
  addButton.addEventListener("click", () => {
    elements.customTagInputWrap.classList.toggle("visible");
    if (elements.customTagInputWrap.classList.contains("visible")) {
      elements.customTagInput.focus();
    }
  });
  elements.workspaceQuickTags.appendChild(addButton);
}

function toggleQuickTag(tag) {
  const sceneKey = state.quickTags.scene;
  const selected = new Set(state.quickTags.selectedTags[sceneKey]);

  if (selected.has(tag)) {
    selected.delete(tag);
  } else {
    selected.add(tag);
  }

  state.quickTags.selectedTags[sceneKey] = Array.from(selected);
  state.deletePromptTag = "";
  saveQuickTagsToStorage();
  renderQuickTags();
}

function handleCustomTagInput(event) {
  if (event.key !== "Enter") {
    return;
  }

  event.preventDefault();
  const sceneKey = state.quickTags.scene;
  const value = elements.customTagInput.value.trim();

  if (!value) {
    return;
  }

  const merged = new Set([
    ...QUICK_TAG_SCENES[sceneKey].tags,
    ...state.quickTags.customTags[sceneKey]
  ]);

  if (!merged.has(value)) {
    state.quickTags.customTags[sceneKey].push(value);
  }

  elements.customTagInput.value = "";
  elements.customTagInputWrap.classList.remove("visible");
  saveQuickTagsToStorage();
  renderQuickTags();
}

function deleteCustomTag(tag) {
  const sceneKey = state.quickTags.scene;
  state.quickTags.customTags[sceneKey] = state.quickTags.customTags[sceneKey].filter((item) => item !== tag);
  state.quickTags.selectedTags[sceneKey] = state.quickTags.selectedTags[sceneKey].filter((item) => item !== tag);
  state.deletePromptTag = "";
  saveQuickTagsToStorage();
  renderQuickTags();
}

function getVisibleCards() {
  return state.filterCategory === "全部"
    ? state.cards
    : state.cards.filter((card) => card.category === state.filterCategory);
}

function renderCards() {
  const visibleCards = getVisibleCards();

  if (!visibleCards.length) {
    elements.cardsList.innerHTML = `<div class="empty">${
      state.cards.length ? "当前筛选下没有卡片。" : "还没有背景卡片，先创建一张吧。"
    }</div>`;
    return;
  }

  elements.cardsList.innerHTML = "";

  visibleCards.forEach((card) => {
    const cardNode = document.createElement("div");
    cardNode.className = "card";
    cardNode.innerHTML = `
      <div class="card-head">
        <h3 class="card-title"></h3>
        <span class="tag"></span>
      </div>
      <div class="card-content"></div>
      <div class="row-actions">
        <button class="btn-primary inject-btn">注入</button>
        <button class="btn-secondary edit-btn">编辑</button>
        <button class="btn-danger delete-btn">删除</button>
      </div>
    `;

    cardNode.querySelector(".card-title").textContent = card.title;
    cardNode.querySelector(".tag").textContent = card.category;
    cardNode.querySelector(".card-content").textContent = card.content;
    cardNode.querySelector(".inject-btn").addEventListener("click", async (event) => {
      await injectCard(card, event.currentTarget);
    });
    cardNode.querySelector(".edit-btn").addEventListener("click", () => startEdit(card.id));
    cardNode.querySelector(".delete-btn").addEventListener("click", () => deleteCard(card.id));
    elements.cardsList.appendChild(cardNode);
  });
}

function renderWorkspace() {
  const activePlatform = getActivePlatform();
  elements.activePlatformLabel.textContent = `${activePlatform.label} 输出`;
  elements.activePlatformOutput.value = state.workspace.outputs[activePlatform.id] || "";
  elements.integrationNeed.value = state.workspace.integrationNeed;
  elements.generatedPrompt.value = state.workspace.generatedPrompt;
}

async function saveCard() {
  const title = elements.cardTitle.value.trim();
  const content = elements.cardContent.value.trim();
  const category = elements.cardCategory.value;

  if (!title || !content) {
    showWorkspaceStatus("标题和正文内容不能为空。", "error");
    return;
  }

  if (state.editingId) {
    state.cards = state.cards.map((card) =>
      card.id === state.editingId ? { ...card, title, content, category } : card
    );
  } else {
    state.cards.unshift({
      id: crypto.randomUUID(),
      title,
      content,
      category,
      createdAt: Date.now()
    });
  }

  await saveCardsToStorage();
  resetForm();
  renderCards();
}

function startEdit(cardId) {
  const card = state.cards.find((item) => item.id === cardId);
  if (!card) {
    return;
  }

  state.editingId = card.id;
  elements.formTitle.textContent = "编辑背景卡片";
  elements.cardTitle.value = card.title;
  elements.cardContent.value = card.content;
  elements.cardCategory.value = card.category;
  elements.cancelEditBtn.style.display = "inline-flex";
  updateCardLengthHint();
}

async function deleteCard(cardId) {
  state.cards = state.cards.filter((card) => card.id !== cardId);
  await saveCardsToStorage();

  if (state.editingId === cardId) {
    resetForm();
  }

  renderCards();
}

function resetForm() {
  state.editingId = null;
  elements.formTitle.textContent = "新建背景卡片";
  elements.cardTitle.value = "";
  elements.cardContent.value = "";
  elements.cardCategory.value = CATEGORY_OPTIONS[0];
  elements.cancelEditBtn.style.display = "none";
  updateCardLengthHint();
}

function updateCardLengthHint() {
  const length = elements.cardContent.value.trim().length;
  elements.cardLengthHint.textContent =
    length > 500 ? `当前 ${length} 字，内容较长，注入后建议检查。` : `当前 ${length} 字`;
  elements.cardLengthHint.className = length > 500 ? "hint warning" : "hint";
}

async function injectCard(card, button) {
  state.currentTab = await getActiveTab();

  if (!state.currentTab?.id) {
    flashButton(button, false, "不可用");
    return;
  }

  try {
    const response = await chrome.tabs.sendMessage(state.currentTab.id, {
      type: "INJECT_CARD",
      payload: { content: card.content }
    });

    flashButton(button, Boolean(response?.success), response?.success ? "已注入！" : response?.error || "失败");
  } catch (error) {
    flashButton(button, false, "不可注入");
  }
}

function flashButton(button, success, text) {
  const originalText = button.textContent;
  const originalClass = button.className;
  button.textContent = text;
  button.disabled = true;
  button.className = success ? "btn-primary" : "btn-danger";

  window.setTimeout(() => {
    button.textContent = originalText;
    button.disabled = false;
    button.className = originalClass;
  }, 1400);
}

function syncWorkspaceFromForm() {
  const activePlatform = getActivePlatform();
  state.workspace.outputs[activePlatform.id] = elements.activePlatformOutput.value;
  state.workspace.integrationNeed = elements.integrationNeed.value;
  state.workspace.generatedPrompt = elements.generatedPrompt.value;
  saveWorkspaceToStorage();
}

function generatePrompt() {
  syncWorkspaceFromForm();
  state.workspace.generatedPrompt = buildPrompt();
  elements.generatedPrompt.value = state.workspace.generatedPrompt;
  saveWorkspaceToStorage();
  showWorkspaceStatus("提示词已生成，可直接复制使用。", "success");
}

function buildPrompt() {
  const selectedTags = state.quickTags.selectedTags[state.quickTags.scene];
  const mergedNeed = [state.workspace.integrationNeed.trim(), selectedTags.join("；").trim()]
    .filter(Boolean)
    .join("\n");
  const sections = PLATFORM_CONFIG
    .map((platform) => {
      const text = state.workspace.outputs[platform.id]?.trim();
      return text ? `${platform.label} 输出：\n${text}` : "";
    })
    .filter(Boolean);

  return [
    "你现在是一个高级内容整合助手。请基于以下多个模型的输出，生成一版最终结果。",
    "",
    "【整合需求】",
    mergedNeed || "请综合优点，输出更清晰、更完整、更可直接使用的最终版本。",
    "",
    sections.length ? sections.join("\n\n") : "暂未提供任何平台输出。",
    "",
    "请输出时遵循以下原则：",
    "1. 优先保留信息密度高、逻辑清楚、表达自然的内容。",
    "2. 删除重复、冲突或冗余表述，必要时主动重组结构。",
    "3. 如果多个版本存在明显差异，请给出你认为更合理的整合方案。",
    "4. 直接输出最终整合结果，不要逐条点评各来源。"
  ].join("\n");
}

async function copyGeneratedPrompt() {
  const text = elements.generatedPrompt.value.trim();

  if (!text) {
    showWorkspaceStatus("请先生成提示词。", "error");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    showWorkspaceStatus("提示词已复制到剪贴板。", "success");
  } catch (error) {
    showWorkspaceStatus("复制失败，请重试。", "error");
  }
}

async function clearWorkspace() {
  state.workspace = normalizeWorkspace(DEFAULT_WORKSPACE);
  renderPlatformTabs();
  renderWorkspace();
  await saveWorkspaceToStorage();
  showWorkspaceStatus("工作台已清空。", "success");
}

function showWorkspaceStatus(message, type = "") {
  elements.workspaceStatus.textContent = message;
  elements.workspaceStatus.className = `status ${type}`.trim();
}

function exportCards() {
  if (!state.cards.length) {
    showWorkspaceStatus("没有可导出的卡片。", "error");
    return;
  }

  const blob = new Blob([JSON.stringify({ cards: state.cards }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `knowme-cards-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showWorkspaceStatus("卡片已导出为 JSON。", "success");
}

async function importCards(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    const parsed = JSON.parse(await file.text());
    const rawCards = Array.isArray(parsed) ? parsed : parsed?.cards;

    if (!Array.isArray(rawCards)) {
      throw new Error("invalid");
    }

    const importedCards = rawCards
      .map((card) => ({
        id: typeof card.id === "string" ? card.id : crypto.randomUUID(),
        title: typeof card.title === "string" ? card.title.trim() : "",
        content: typeof card.content === "string" ? card.content.trim() : "",
        category: CATEGORY_OPTIONS.includes(card.category) ? card.category : CATEGORY_OPTIONS[2],
        createdAt: Number.isFinite(card.createdAt) ? card.createdAt : Date.now()
      }))
      .filter((card) => card.title && card.content);

    const existing = new Set(state.cards.map((card) => `${card.title}::${card.category}::${card.content}`));
    importedCards.forEach((card) => {
      const key = `${card.title}::${card.category}::${card.content}`;
      if (!existing.has(key)) {
        existing.add(key);
        state.cards.unshift(card);
      }
    });

    await saveCardsToStorage();
    renderCards();
    showWorkspaceStatus(`成功导入 ${importedCards.length} 张卡片。`, "success");
  } catch (error) {
    showWorkspaceStatus("导入失败，请检查 JSON 格式。", "error");
  } finally {
    event.target.value = "";
  }
}
