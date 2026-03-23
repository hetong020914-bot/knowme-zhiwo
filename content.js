const STORAGE_KEYS = {
  cards: "contextkit_cards",
  workspace: "contextkit_workspace",
  quickTags: "contextkit_quick_tags"
};

const CATEGORY_OPTIONS = ["工作", "学术", "其他"];
const FAB_POSITION_KEY = "contextkit_fab_position_v1";
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

const SITE_CONFIG = {
  "claude.ai": {
    platformId: "claude",
    inputSelectors: ['div[contenteditable="true"]'],
    responseSelectors: ["div[data-is-streaming]", "div.font-claude-message", "article"],
    enableInlineCapture: true
  },
  "chat.openai.com": {
    platformId: "chatgpt",
    inputSelectors: ['div[contenteditable="true"]'],
    responseSelectors: ['[data-message-author-role="assistant"]'],
    enableInlineCapture: true
  },
  "chatgpt.com": {
    platformId: "chatgpt",
    inputSelectors: ['div[contenteditable="true"]'],
    responseSelectors: ['[data-message-author-role="assistant"]'],
    enableInlineCapture: true
  },
  "gemini.google.com": {
    platformId: "gemini",
    inputSelectors: ['div[contenteditable="true"].ql-editor', "rich-textarea div[contenteditable]"],
    responseSelectors: ["model-response", ".model-response-text", "message-content"],
    enableInlineCapture: true
  },
  "www.doubao.com": {
    platformId: "doubao",
    inputSelectors: ['div[contenteditable="true"]', "textarea"],
    responseSelectors: ["[data-testid='message-content']", ".message-content", ".assistant-message", "article"],
    enableInlineCapture: false
  },
  "doubao.com": {
    platformId: "doubao",
    inputSelectors: ['div[contenteditable="true"]', "textarea"],
    responseSelectors: ["[data-testid='message-content']", ".message-content", ".assistant-message", "article"],
    enableInlineCapture: false
  },
  "kimi.moonshot.cn": {
    platformId: "kimi",
    inputSelectors: ['div[contenteditable="true"]', "textarea"],
    responseSelectors: [".markdown", ".segment-assistant", "article"],
    enableInlineCapture: false
  },
  "www.kimi.com": {
    platformId: "kimi",
    inputSelectors: ['div[contenteditable="true"]', "textarea"],
    responseSelectors: [".markdown", ".segment-assistant", "article"],
    enableInlineCapture: false
  },
  "chat.minimax.io": {
    platformId: "minimax",
    inputSelectors: ['div[contenteditable="true"]', "textarea"],
    responseSelectors: [".assistant-message", ".message-content", "article"],
    enableInlineCapture: false
  },
  "agent.minimax.io": {
    platformId: "minimax",
    inputSelectors: ['div[contenteditable="true"]', "textarea"],
    responseSelectors: [".assistant-message", ".message-content", "article"],
    enableInlineCapture: false
  },
  "www.minimax.io": {
    platformId: "minimax",
    inputSelectors: ['div[contenteditable="true"]', "textarea"],
    responseSelectors: [".assistant-message", ".message-content", "article"],
    enableInlineCapture: false
  },
  "tongyi.aliyun.com": {
    platformId: "qianwen",
    inputSelectors: ['div[contenteditable="true"]', "textarea"],
    responseSelectors: [".answer-content", ".markdown-body", ".assistant-message", "article"],
    enableInlineCapture: false
  },
  "www.qianwen.com": {
    platformId: "qianwen",
    inputSelectors: ['div[contenteditable="true"]', "textarea"],
    responseSelectors: [".answer-content", ".markdown-body", ".assistant-message", "article"],
    enableInlineCapture: false
  },
  "chatglm.cn": {
    platformId: "zhipu",
    inputSelectors: ['div[contenteditable="true"]', "textarea"],
    responseSelectors: [".markdown-body", ".assistant-message", ".message-content", "article"],
    enableInlineCapture: false
  },
  "chat.deepseek.com": {
    platformId: "deepseek",
    inputSelectors: ['div[contenteditable="true"]', "textarea"],
    responseSelectors: ['[data-role="assistant"]', ".message-content", ".markdown-body", "article"],
    enableInlineCapture: false
  },
  "www.deepseek.com": {
    platformId: "deepseek",
    inputSelectors: ['div[contenteditable="true"]', "textarea"],
    responseSelectors: ['[data-role="assistant"]', ".message-content", ".markdown-body", "article"],
    enableInlineCapture: false
  }
};

const appState = {
  cards: [],
  editingId: null,
  workspace: { ...DEFAULT_WORKSPACE },
  quickTags: structuredClone(DEFAULT_QUICK_TAGS),
  filterCategory: "全部",
  ui: null,
  responseObserver: null,
  dragState: null,
  deletePromptTag: ""
};

init();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "INJECT_CARD") {
    const target = findInputTarget();

    if (!target) {
      sendResponse({ success: false, error: "当前页面未找到可注入的对话框" });
      return;
    }

    sendResponse(
      appendToInput(target, message.payload?.content || "")
        ? { success: true }
        : { success: false, error: "注入失败，请重试" }
    );
    return;
  }

  if (message?.type === "CAPTURE_LATEST") {
    sendResponse({ success: false, error: "当前版本请手动复制粘贴回复内容。" });
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local" || !appState.ui) {
    return;
  }

  if (changes[STORAGE_KEYS.cards]) {
    appState.cards = Array.isArray(changes[STORAGE_KEYS.cards].newValue)
      ? changes[STORAGE_KEYS.cards].newValue
      : [];
    renderCards();
  }

  if (changes[STORAGE_KEYS.workspace]) {
    appState.workspace = normalizeWorkspace(changes[STORAGE_KEYS.workspace].newValue);
    renderPlatformTabs();
    renderWorkspace();
  }

  if (changes[STORAGE_KEYS.quickTags]) {
    appState.quickTags = normalizeQuickTags(changes[STORAGE_KEYS.quickTags].newValue);
    renderQuickTagScenes();
    renderQuickTags();
  }
});

async function init() {
  await Promise.all([loadCards(), loadWorkspace(), loadQuickTags()]);
  inferActivePlatformFromSite();
  createFloatingApp();
  renderPlatformTabs();
  renderQuickTagScenes();
  renderQuickTags();
  renderCards();
  renderWorkspace();
  updateCardLengthHint();
  observeResponses();
  processResponseButtons();
}

async function loadCards() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.cards);
  appState.cards = Array.isArray(result[STORAGE_KEYS.cards]) ? result[STORAGE_KEYS.cards] : [];
}

async function loadWorkspace() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.workspace);
  appState.workspace = normalizeWorkspace(result[STORAGE_KEYS.workspace]);
}

async function loadQuickTags() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.quickTags);
  appState.quickTags = normalizeQuickTags(result[STORAGE_KEYS.quickTags]);
}

function normalizeWorkspace(rawWorkspace) {
  const raw = rawWorkspace || {};
  const outputs = { ...EMPTY_OUTPUTS, ...(raw.outputs || {}) };

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

async function saveCards() {
  await chrome.storage.local.set({ [STORAGE_KEYS.cards]: appState.cards });
}

async function saveWorkspace() {
  await chrome.storage.local.set({ [STORAGE_KEYS.workspace]: appState.workspace });
}

async function saveQuickTags() {
  await chrome.storage.local.set({ [STORAGE_KEYS.quickTags]: appState.quickTags });
}

function getCurrentSiteConfig() {
  return SITE_CONFIG[window.location.hostname] || null;
}

function getPlatform(platformId) {
  return PLATFORM_CONFIG.find((platform) => platform.id === platformId) || PLATFORM_CONFIG[0];
}

function inferActivePlatformFromSite() {
  const siteConfig = getCurrentSiteConfig();
  if (siteConfig) {
    appState.workspace.activePlatform = siteConfig.platformId;
  }
}

function createFloatingApp() {
  if (document.getElementById("contextkit-host")) {
    return;
  }

  const host = document.createElement("div");
  host.id = "contextkit-host";
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });

  shadow.innerHTML = `
    <style>
      :host { all: initial; }
      * { box-sizing: border-box; }
      .ck-launcher {
        position: fixed; width: 58px; height: 58px; border: none; border-radius: 18px;
        background: linear-gradient(135deg, #534ab7 0%, #746ce0 100%); color: #fff;
        font: 700 15px/1 "PingFang SC", "Microsoft YaHei", sans-serif;
        box-shadow: 0 18px 34px rgba(83, 74, 183, 0.28); cursor: grab; z-index: 2147483646;
        user-select: none; touch-action: none;
      }
      .ck-panel {
        position: fixed; width: 360px; max-height: min(560px, calc(100vh - 32px)); overflow-y: auto;
        border-radius: 22px; background: radial-gradient(circle at top right, rgba(83,74,183,0.18), transparent 30%), linear-gradient(180deg, #f8f7ff 0%, #ffffff 38%);
        border: 1px solid rgba(83,74,183,0.12); box-shadow: 0 24px 60px rgba(31,35,64,0.18); padding: 14px;
        color: #1f2340; font-family: "PingFang SC", "Microsoft YaHei", sans-serif; z-index: 2147483646;
      }
      .ck-hidden { display: none; }
      .ck-header { background: linear-gradient(135deg, #534ab7 0%, #6a61d1 100%); color: #fff; border-radius: 18px; padding: 14px; }
      .ck-brand { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
      .ck-title { margin: 0; font-size: 19px; font-weight: 700; }
      .ck-subtitle { margin: 4px 0 0; font-size: 12px; opacity: 0.88; }
      .ck-close { border: none; width: 32px; height: 32px; border-radius: 10px; background: rgba(255,255,255,0.16); color: #fff; cursor: pointer; font-size: 18px; }
      .ck-site-badge { display: inline-flex; margin-top: 12px; padding: 6px 10px; border-radius: 999px; background: rgba(255,255,255,0.16); font-size: 12px; }
      .ck-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 14px 0; }
      .ck-tab { border: none; border-radius: 12px; padding: 10px 12px; background: #efedff; color: #534ab7; font-size: 13px; font-weight: 700; cursor: pointer; }
      .ck-tab.ck-active, .ck-scene-button.ck-active, .ck-quick-tag.ck-active, .ck-platform-tab.ck-active { background: #534ab7; color: #fff; }
      .ck-panel-body { display: none; }
      .ck-panel-body.ck-active { display: block; }
      .ck-box, .ck-item, .ck-backup-box { background: #fff; border: 1px solid #e5e7f2; border-radius: 16px; box-shadow: 0 10px 24px rgba(31,35,64,0.06); }
      .ck-box, .ck-backup-box { padding: 14px; }
      .ck-item { padding: 14px; margin-top: 10px; }
      .ck-section-title { margin: 0 0 12px; font-size: 14px; font-weight: 700; }
      .ck-field { margin-bottom: 10px; }
      .ck-label { display: block; margin-bottom: 6px; font-size: 12px; color: #6b6f86; }
      .ck-input, .ck-textarea, .ck-select { width: 100%; border: 1px solid #e5e7f2; border-radius: 12px; padding: 10px 12px; font-size: 13px; color: #1f2340; background: #fff; font-family: inherit; }
      .ck-textarea { resize: vertical; min-height: 84px; }
      .ck-row, .ck-actions, .ck-toolbar, .ck-platform-tabs, .ck-scene-switch, .ck-quick-tags { display: flex; gap: 8px; flex-wrap: wrap; }
      .ck-btn { border: none; border-radius: 12px; padding: 10px 12px; font-size: 13px; cursor: pointer; font-family: inherit; }
      .ck-btn-primary { background: #534ab7; color: #fff; }
      .ck-btn-secondary { background: #efedff; color: #534ab7; }
      .ck-btn-danger { background: #fff1f4; color: #d94b6a; }
      .ck-btn-ghost { background: #f7f7fc; color: #1f2340; }
      .ck-card-title { margin: 0; font-size: 14px; font-weight: 700; }
      .ck-card-top { display: flex; justify-content: space-between; gap: 8px; align-items: flex-start; }
      .ck-tag { padding: 4px 8px; border-radius: 999px; background: #f3f1ff; color: #534ab7; font-size: 11px; font-weight: 700; }
      .ck-card-content { margin: 10px 0 12px; font-size: 12px; line-height: 1.6; color: #444a66; white-space: pre-wrap; word-break: break-word; }
      .ck-empty { padding: 24px 16px; text-align: center; font-size: 12px; color: #6b6f86; border: 1px dashed #d9dbec; border-radius: 16px; background: rgba(255,255,255,0.75); }
      .ck-platform-tab, .ck-scene-button, .ck-quick-tag { border: 1px solid transparent; border-radius: 999px; background: #f3f1ff; color: #534ab7; padding: 7px 10px; font-size: 12px; cursor: pointer; }
      .ck-single-output { min-height: 158px; }
      .ck-output { min-height: 140px; background: #f8f8ff; }
      .ck-status, .ck-hint, .ck-subtle { min-height: 18px; margin-top: 8px; font-size: 12px; color: #6b6f86; }
      .ck-status.ck-success { color: #24a06b; }
      .ck-status.ck-error { color: #d94b6a; }
      .ck-hint.ck-warning { color: #b07d00; }
      .ck-file { display: none; }
      .ck-custom-wrap { display: none; width: 100%; }
      .ck-custom-wrap.ck-visible { display: block; }
      .ck-mini-delete { padding: 7px 10px; border-radius: 999px; background: #fff1f4; color: #d94b6a; font-size: 12px; border: none; }
      .ck-category-row { display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: end; }
    </style>

    <button class="ck-launcher" id="ckLauncher">KM</button>
    <section class="ck-panel ck-hidden" id="ckPanel">
      <div class="ck-header">
        <div class="ck-brand">
          <div>
            <h2 class="ck-title">KnowMe-知我</h2>
            <p class="ck-subtitle">每次对话从“认识你”开始</p>
          </div>
          <button class="ck-close" id="ckClose">×</button>
        </div>
        <div class="ck-site-badge" id="ckCurrentSite"></div>
      </div>

      <div class="ck-tabs">
        <button class="ck-tab ck-active" data-tab="cards">背景卡片</button>
        <button class="ck-tab" data-tab="workspace">整合工作台</button>
      </div>

      <section class="ck-panel-body ck-active" id="ckCardsPanel">
        <div class="ck-box">
          <h3 class="ck-section-title" id="ckFormTitle">新建背景卡片</h3>
          <div class="ck-field">
            <label class="ck-label" for="ckCardTitle">标题</label>
            <input class="ck-input" id="ckCardTitle" type="text" />
          </div>
          <div class="ck-field">
            <label class="ck-label" for="ckCardContent">正文内容</label>
            <textarea class="ck-textarea" id="ckCardContent"></textarea>
            <div class="ck-hint" id="ckCardLengthHint">当前 0 字</div>
          </div>
          <div class="ck-field">
            <div class="ck-category-row">
              <div>
                <label class="ck-label" for="ckCardCategory">分类标签</label>
                <select class="ck-select" id="ckCardCategory">
                  <option value="工作">工作</option>
                  <option value="学术">学术</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label class="ck-label" for="ckCardFilter">列表筛选</label>
                <select class="ck-select" id="ckCardFilter" style="min-width: 120px;">
                  <option value="全部">全部分类</option>
                  <option value="工作">工作</option>
                  <option value="学术">学术</option>
                  <option value="其他">其他</option>
                </select>
              </div>
            </div>
          </div>
          <div class="ck-actions">
            <button class="ck-btn ck-btn-primary" id="ckSaveCardBtn">保存卡片</button>
            <button class="ck-btn ck-btn-secondary ck-hidden" id="ckCancelEditBtn">取消编辑</button>
          </div>
          <div class="ck-subtle">注入方式：追加到当前输入内容末尾</div>
        </div>
        <div id="ckCardsList"></div>
        <div class="ck-backup-box">
          <h3 class="ck-section-title">数据备份</h3>
          <div class="ck-actions">
            <button class="ck-btn ck-btn-ghost" id="ckExportCardsBtn">导出卡片</button>
            <button class="ck-btn ck-btn-ghost" id="ckImportCardsBtn">导入卡片</button>
            <input class="ck-file" id="ckImportCardsInput" type="file" accept="application/json,.json" />
          </div>
          <div class="ck-subtle">导出为JSON文件，可用于备份或换设备恢复</div>
        </div>
      </section>

      <section class="ck-panel-body" id="ckWorkspacePanel">
        <div class="ck-box">
          <h3 class="ck-section-title">整合工作台</h3>
          <div class="ck-field">
            <label class="ck-label">平台切换</label>
            <div class="ck-platform-tabs" id="ckWorkspacePlatformTabs"></div>
          </div>
          <div class="ck-field">
            <label class="ck-label" id="ckActivePlatformLabel" for="ckActivePlatformOutput">当前平台输出</label>
            <textarea class="ck-textarea ck-single-output" id="ckActivePlatformOutput"></textarea>
          </div>
          <div class="ck-field">
            <label class="ck-label" for="ckIntegrationNeed">整合需求</label>
            <textarea class="ck-textarea" id="ckIntegrationNeed" placeholder="这里填写你自己的补充要求，这部分不会被快捷标签覆盖"></textarea>
          </div>
          <div class="ck-field">
            <label class="ck-label">快捷标签</label>
            <div class="ck-scene-switch" id="ckWorkspaceSceneSwitch"></div>
          </div>
          <div class="ck-quick-tags" id="ckWorkspaceQuickTags"></div>
          <div class="ck-custom-wrap" id="ckCustomTagInputWrap">
            <input class="ck-input" id="ckCustomTagInput" type="text" placeholder="输入自定义标签，按回车保存" />
          </div>
          <div class="ck-subtle">快捷标签仅作用于下方提示词生成，不会改动上面的整合需求输入框。国产AI请手动复制粘贴回复到当前平台输出框。</div>
          <div class="ck-actions">
            <button class="ck-btn ck-btn-primary" id="ckGenerateBtn">生成提示词</button>
            <button class="ck-btn ck-btn-secondary" id="ckCopyBtn">复制提示词</button>
            <button class="ck-btn ck-btn-danger" id="ckClearBtn">清空工作台</button>
          </div>
          <div class="ck-field" style="margin-top: 12px;">
            <label class="ck-label" for="ckGeneratedPrompt">生成结果</label>
            <textarea class="ck-textarea ck-output" id="ckGeneratedPrompt" readonly></textarea>
          </div>
          <div class="ck-status" id="ckStatus"></div>
        </div>
      </section>
    </section>
  `;

  const ui = {
    launcher: shadow.getElementById("ckLauncher"),
    panel: shadow.getElementById("ckPanel"),
    close: shadow.getElementById("ckClose"),
    currentSite: shadow.getElementById("ckCurrentSite"),
    rootTabs: shadow.querySelectorAll(".ck-tab"),
    cardsPanel: shadow.getElementById("ckCardsPanel"),
    workspacePanel: shadow.getElementById("ckWorkspacePanel"),
    formTitle: shadow.getElementById("ckFormTitle"),
    cardTitle: shadow.getElementById("ckCardTitle"),
    cardContent: shadow.getElementById("ckCardContent"),
    cardLengthHint: shadow.getElementById("ckCardLengthHint"),
    cardCategory: shadow.getElementById("ckCardCategory"),
    cardFilter: shadow.getElementById("ckCardFilter"),
    saveCardBtn: shadow.getElementById("ckSaveCardBtn"),
    cancelEditBtn: shadow.getElementById("ckCancelEditBtn"),
    exportCardsBtn: shadow.getElementById("ckExportCardsBtn"),
    importCardsBtn: shadow.getElementById("ckImportCardsBtn"),
    importCardsInput: shadow.getElementById("ckImportCardsInput"),
    cardsList: shadow.getElementById("ckCardsList"),
    workspacePlatformTabs: shadow.getElementById("ckWorkspacePlatformTabs"),
    activePlatformLabel: shadow.getElementById("ckActivePlatformLabel"),
    activePlatformOutput: shadow.getElementById("ckActivePlatformOutput"),
    integrationNeed: shadow.getElementById("ckIntegrationNeed"),
    workspaceSceneSwitch: shadow.getElementById("ckWorkspaceSceneSwitch"),
    workspaceQuickTags: shadow.getElementById("ckWorkspaceQuickTags"),
    customTagInputWrap: shadow.getElementById("ckCustomTagInputWrap"),
    customTagInput: shadow.getElementById("ckCustomTagInput"),
    generateBtn: shadow.getElementById("ckGenerateBtn"),
    copyBtn: shadow.getElementById("ckCopyBtn"),
    clearBtn: shadow.getElementById("ckClearBtn"),
    generatedPrompt: shadow.getElementById("ckGeneratedPrompt"),
    status: shadow.getElementById("ckStatus")
  };

  appState.ui = ui;
  ui.currentSite.textContent = `当前网站：${getPlatform(getCurrentSiteConfig()?.platformId).label}`;
  bindUiEvents();
  applySavedLauncherPosition();
  window.addEventListener("resize", handleViewportChange);
}

function bindUiEvents() {
  const ui = appState.ui;

  ui.rootTabs.forEach((tab) => {
    tab.addEventListener("click", () => switchRootTab(tab.dataset.tab));
  });
  ui.close.addEventListener("click", closePanel);
  ui.saveCardBtn.addEventListener("click", saveCardFromUi);
  ui.cancelEditBtn.addEventListener("click", resetForm);
  ui.cardContent.addEventListener("input", updateCardLengthHint);
  ui.cardFilter.addEventListener("change", () => {
    appState.filterCategory = ui.cardFilter.value;
    renderCards();
  });
  ui.exportCardsBtn.addEventListener("click", exportCards);
  ui.importCardsBtn.addEventListener("click", () => ui.importCardsInput.click());
  ui.importCardsInput.addEventListener("change", importCards);
  ui.activePlatformOutput.addEventListener("input", syncWorkspaceFromUi);
  ui.integrationNeed.addEventListener("input", syncWorkspaceFromUi);
  ui.customTagInput.addEventListener("keydown", handleCustomTagInput);
  ui.generateBtn.addEventListener("click", generatePrompt);
  ui.copyBtn.addEventListener("click", copyGeneratedPrompt);
  ui.clearBtn.addEventListener("click", clearWorkspace);
  initLauncherDrag();
}

function initLauncherDrag() {
  const ui = appState.ui;
  ui.launcher.addEventListener("pointerdown", (event) => {
    const rect = ui.launcher.getBoundingClientRect();
    appState.dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originLeft: rect.left,
      originTop: rect.top,
      moved: false
    };
    ui.launcher.setPointerCapture(event.pointerId);
  });

  ui.launcher.addEventListener("pointermove", (event) => {
    if (!appState.dragState || event.pointerId !== appState.dragState.pointerId) {
      return;
    }

    const deltaX = event.clientX - appState.dragState.startX;
    const deltaY = event.clientY - appState.dragState.startY;
    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      appState.dragState.moved = true;
    }
    if (!appState.dragState.moved) {
      return;
    }

    setLauncherPosition(
      clamp(appState.dragState.originLeft + deltaX, 8, window.innerWidth - ui.launcher.offsetWidth - 8),
      clamp(appState.dragState.originTop + deltaY, 8, window.innerHeight - ui.launcher.offsetHeight - 8)
    );

    if (!ui.panel.classList.contains("ck-hidden")) {
      positionPanelNearLauncher();
    }
  });

  ui.launcher.addEventListener("pointerup", (event) => {
    if (!appState.dragState || event.pointerId !== appState.dragState.pointerId) {
      return;
    }

    if (appState.dragState.moved) {
      persistLauncherPosition();
    } else {
      togglePanel();
    }

    appState.dragState = null;
  });
}

function readLauncherPosition() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FAB_POSITION_KEY) || "null");
    if (parsed && Number.isFinite(parsed.left) && Number.isFinite(parsed.top)) {
      return parsed;
    }
  } catch (error) {
    return null;
  }
  return null;
}

function applySavedLauncherPosition() {
  const saved = readLauncherPosition();
  if (saved) {
    setLauncherPosition(saved.left, saved.top);
    return;
  }
  setLauncherPosition(window.innerWidth - 78, window.innerHeight - 82);
}

function persistLauncherPosition() {
  const rect = appState.ui.launcher.getBoundingClientRect();
  window.localStorage.setItem(FAB_POSITION_KEY, JSON.stringify({ left: rect.left, top: rect.top }));
}

function setLauncherPosition(left, top) {
  appState.ui.launcher.style.left = `${left}px`;
  appState.ui.launcher.style.top = `${top}px`;
}

function handleViewportChange() {
  const rect = appState.ui.launcher.getBoundingClientRect();
  setLauncherPosition(
    clamp(rect.left, 8, window.innerWidth - appState.ui.launcher.offsetWidth - 8),
    clamp(rect.top, 8, window.innerHeight - appState.ui.launcher.offsetHeight - 8)
  );
  persistLauncherPosition();
}

function togglePanel() {
  const willShow = appState.ui.panel.classList.contains("ck-hidden");
  appState.ui.panel.classList.toggle("ck-hidden");
  if (willShow) {
    renderPlatformTabs();
    renderQuickTagScenes();
    renderQuickTags();
    renderCards();
    renderWorkspace();
    positionPanelNearLauncher();
  }
}

function closePanel() {
  appState.ui.panel.classList.add("ck-hidden");
}

function positionPanelNearLauncher() {
  const launcherRect = appState.ui.launcher.getBoundingClientRect();
  const margin = 12;

  requestAnimationFrame(() => {
    const panelRect = appState.ui.panel.getBoundingClientRect();
    const left = clamp(launcherRect.right - panelRect.width, margin, window.innerWidth - panelRect.width - margin);
    const top = clamp(launcherRect.top - panelRect.height - 12, margin, window.innerHeight - panelRect.height - margin);
    appState.ui.panel.style.left = `${left}px`;
    appState.ui.panel.style.top = `${top}px`;
  });
}

function switchRootTab(tabName) {
  appState.ui.rootTabs.forEach((tab) => {
    tab.classList.toggle("ck-active", tab.dataset.tab === tabName);
  });
  appState.ui.cardsPanel.classList.toggle("ck-active", tabName === "cards");
  appState.ui.workspacePanel.classList.toggle("ck-active", tabName === "workspace");
}

function renderPlatformTabs() {
  const container = appState.ui.workspacePlatformTabs;
  container.innerHTML = "";

  PLATFORM_CONFIG.forEach((platform) => {
    const button = document.createElement("button");
    button.className = `ck-platform-tab${appState.workspace.activePlatform === platform.id ? " ck-active" : ""}`;
    button.textContent = platform.label;
    button.addEventListener("click", () => switchWorkspacePlatform(platform.id));
    container.appendChild(button);
  });
}

function switchWorkspacePlatform(platformId) {
  appState.workspace.activePlatform = platformId;
  renderPlatformTabs();
  renderWorkspace();
  saveWorkspace();
}

function renderQuickTagScenes() {
  const container = appState.ui.workspaceSceneSwitch;
  container.innerHTML = "";

  Object.entries(QUICK_TAG_SCENES).forEach(([sceneKey, scene]) => {
    const button = document.createElement("button");
    button.className = `ck-scene-button${appState.quickTags.scene === sceneKey ? " ck-active" : ""}`;
    button.textContent = scene.label;
    button.addEventListener("click", () => switchQuickTagScene(sceneKey));
    container.appendChild(button);
  });
}

function switchQuickTagScene(sceneKey) {
  appState.quickTags.scene = sceneKey;
  appState.deletePromptTag = "";
  appState.ui.customTagInputWrap.classList.remove("ck-visible");
  saveQuickTags();
  renderQuickTagScenes();
  renderQuickTags();
}

function renderQuickTags() {
  const container = appState.ui.workspaceQuickTags;
  const sceneKey = appState.quickTags.scene;
  const baseTags = QUICK_TAG_SCENES[sceneKey].tags;
  const customTags = appState.quickTags.customTags[sceneKey];
  const selectedTags = new Set(appState.quickTags.selectedTags[sceneKey]);

  container.innerHTML = "";

  [...baseTags, ...customTags].forEach((tag) => {
    const button = document.createElement("button");
    button.className = `ck-quick-tag${selectedTags.has(tag) ? " ck-active" : ""}`;
    button.textContent = tag;
    button.addEventListener("click", () => toggleQuickTag(tag));

    if (customTags.includes(tag)) {
      let timer = null;
      button.addEventListener("pointerdown", () => {
        timer = window.setTimeout(() => {
          appState.deletePromptTag = tag;
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

    container.appendChild(button);

    if (appState.deletePromptTag === tag && customTags.includes(tag)) {
      const deleteButton = document.createElement("button");
      deleteButton.className = "ck-mini-delete";
      deleteButton.textContent = `删除「${tag}」`;
      deleteButton.addEventListener("click", () => deleteCustomTag(tag));
      container.appendChild(deleteButton);
    }
  });

  const addButton = document.createElement("button");
  addButton.className = "ck-quick-tag";
  addButton.textContent = "＋ 自定义";
  addButton.addEventListener("click", () => {
    appState.ui.customTagInputWrap.classList.toggle("ck-visible");
    if (appState.ui.customTagInputWrap.classList.contains("ck-visible")) {
      appState.ui.customTagInput.focus();
    }
  });
  container.appendChild(addButton);
}

function toggleQuickTag(tag) {
  const sceneKey = appState.quickTags.scene;
  const selected = new Set(appState.quickTags.selectedTags[sceneKey]);
  selected.has(tag) ? selected.delete(tag) : selected.add(tag);
  appState.quickTags.selectedTags[sceneKey] = Array.from(selected);
  appState.deletePromptTag = "";
  saveQuickTags();
  renderQuickTags();
}

function handleCustomTagInput(event) {
  if (event.key !== "Enter") {
    return;
  }

  event.preventDefault();
  const sceneKey = appState.quickTags.scene;
  const value = appState.ui.customTagInput.value.trim();
  if (!value) {
    return;
  }

  const existing = new Set([...QUICK_TAG_SCENES[sceneKey].tags, ...appState.quickTags.customTags[sceneKey]]);
  if (!existing.has(value)) {
    appState.quickTags.customTags[sceneKey].push(value);
  }

  appState.ui.customTagInput.value = "";
  appState.ui.customTagInputWrap.classList.remove("ck-visible");
  saveQuickTags();
  renderQuickTags();
}

function deleteCustomTag(tag) {
  const sceneKey = appState.quickTags.scene;
  appState.quickTags.customTags[sceneKey] = appState.quickTags.customTags[sceneKey].filter((item) => item !== tag);
  appState.quickTags.selectedTags[sceneKey] = appState.quickTags.selectedTags[sceneKey].filter((item) => item !== tag);
  appState.deletePromptTag = "";
  saveQuickTags();
  renderQuickTags();
}

function getVisibleCards() {
  return appState.filterCategory === "全部"
    ? appState.cards
    : appState.cards.filter((card) => card.category === appState.filterCategory);
}

function renderCards() {
  const visibleCards = getVisibleCards();
  if (!visibleCards.length) {
    appState.ui.cardsList.innerHTML = `<div class="ck-empty">${
      appState.cards.length ? "当前筛选下没有卡片。" : "还没有背景卡片，先创建一张吧。"
    }</div>`;
    return;
  }

  appState.ui.cardsList.innerHTML = "";

  visibleCards.forEach((card) => {
    const cardNode = document.createElement("div");
    cardNode.className = "ck-item";
    cardNode.innerHTML = `
      <div class="ck-card-top">
        <h4 class="ck-card-title"></h4>
        <span class="ck-tag"></span>
      </div>
      <div class="ck-card-content"></div>
      <div class="ck-row">
        <button class="ck-btn ck-btn-primary ck-inject-btn">注入</button>
        <button class="ck-btn ck-btn-secondary ck-edit-btn">编辑</button>
        <button class="ck-btn ck-btn-danger ck-delete-btn">删除</button>
      </div>
    `;

    cardNode.querySelector(".ck-card-title").textContent = card.title;
    cardNode.querySelector(".ck-tag").textContent = card.category;
    cardNode.querySelector(".ck-card-content").textContent = card.content;
    cardNode.querySelector(".ck-inject-btn").addEventListener("click", async (event) => {
      await injectCard(card, event.currentTarget);
    });
    cardNode.querySelector(".ck-edit-btn").addEventListener("click", () => startEdit(card.id));
    cardNode.querySelector(".ck-delete-btn").addEventListener("click", () => deleteCard(card.id));
    appState.ui.cardsList.appendChild(cardNode);
  });
}

function renderWorkspace() {
  const activePlatform = getPlatform(appState.workspace.activePlatform);
  appState.ui.activePlatformLabel.textContent = `${activePlatform.label} 输出`;
  appState.ui.activePlatformOutput.value = appState.workspace.outputs[activePlatform.id] || "";
  appState.ui.integrationNeed.value = appState.workspace.integrationNeed;
  appState.ui.generatedPrompt.value = appState.workspace.generatedPrompt;
}

async function saveCardFromUi() {
  const title = appState.ui.cardTitle.value.trim();
  const content = appState.ui.cardContent.value.trim();
  const category = appState.ui.cardCategory.value;

  if (!title || !content) {
    showStatus("标题和正文内容不能为空。", "error");
    return;
  }

  if (appState.editingId) {
    appState.cards = appState.cards.map((card) =>
      card.id === appState.editingId ? { ...card, title, content, category } : card
    );
  } else {
    appState.cards.unshift({
      id: crypto.randomUUID(),
      title,
      content,
      category,
      createdAt: Date.now()
    });
  }

  await saveCards();
  resetForm();
  renderCards();
}

function startEdit(cardId) {
  const card = appState.cards.find((item) => item.id === cardId);
  if (!card) {
    return;
  }

  appState.editingId = card.id;
  appState.ui.formTitle.textContent = "编辑背景卡片";
  appState.ui.cardTitle.value = card.title;
  appState.ui.cardContent.value = card.content;
  appState.ui.cardCategory.value = card.category;
  appState.ui.cancelEditBtn.classList.remove("ck-hidden");
  updateCardLengthHint();
}

async function deleteCard(cardId) {
  appState.cards = appState.cards.filter((card) => card.id !== cardId);
  await saveCards();

  if (appState.editingId === cardId) {
    resetForm();
  }

  renderCards();
}

function resetForm() {
  appState.editingId = null;
  appState.ui.formTitle.textContent = "新建背景卡片";
  appState.ui.cardTitle.value = "";
  appState.ui.cardContent.value = "";
  appState.ui.cardCategory.value = CATEGORY_OPTIONS[0];
  appState.ui.cancelEditBtn.classList.add("ck-hidden");
  updateCardLengthHint();
}

function updateCardLengthHint() {
  const length = appState.ui.cardContent.value.trim().length;
  appState.ui.cardLengthHint.textContent =
    length > 500 ? `当前 ${length} 字，内容较长，注入后建议检查。` : `当前 ${length} 字`;
  appState.ui.cardLengthHint.className = length > 500 ? "ck-hint ck-warning" : "ck-hint";
}

async function injectCard(card, button) {
  const target = findInputTarget();
  if (!target) {
    flashButton(button, false, "未找到输入框");
    return;
  }

  flashButton(button, appendToInput(target, card.content), "已注入！");
}

function flashButton(button, success, text) {
  const originalText = button.textContent;
  const originalClass = button.className;
  button.textContent = success ? text : "失败";
  button.disabled = true;
  button.className = success ? "ck-btn ck-btn-primary" : "ck-btn ck-btn-danger";

  window.setTimeout(() => {
    button.textContent = originalText;
    button.disabled = false;
    button.className = originalClass;
  }, 1400);
}

function syncWorkspaceFromUi() {
  const activePlatform = getPlatform(appState.workspace.activePlatform);
  appState.workspace.outputs[activePlatform.id] = appState.ui.activePlatformOutput.value;
  appState.workspace.integrationNeed = appState.ui.integrationNeed.value;
  appState.workspace.generatedPrompt = appState.ui.generatedPrompt.value;
  saveWorkspace();
}

function generatePrompt() {
  syncWorkspaceFromUi();
  appState.workspace.generatedPrompt = buildPrompt();
  appState.ui.generatedPrompt.value = appState.workspace.generatedPrompt;
  saveWorkspace();
  showStatus("提示词已生成，可直接复制使用。", "success");
}

function buildPrompt() {
  const selectedTags = appState.quickTags.selectedTags[appState.quickTags.scene];
  const mergedNeed = [appState.workspace.integrationNeed.trim(), selectedTags.join("；").trim()]
    .filter(Boolean)
    .join("\n");
  const sections = PLATFORM_CONFIG
    .map((platform) => {
      const text = appState.workspace.outputs[platform.id]?.trim();
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
  const text = appState.ui.generatedPrompt.value.trim();
  if (!text) {
    showStatus("请先生成提示词。", "error");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    showStatus("提示词已复制到剪贴板。", "success");
  } catch (error) {
    showStatus("复制失败，请重试。", "error");
  }
}

async function clearWorkspace() {
  appState.workspace = normalizeWorkspace(DEFAULT_WORKSPACE);
  inferActivePlatformFromSite();
  renderPlatformTabs();
  renderWorkspace();
  await saveWorkspace();
  showStatus("工作台已清空。", "success");
}

function showStatus(message, type = "") {
  appState.ui.status.textContent = message;
  appState.ui.status.className = `ck-status ${type ? `ck-${type}` : ""}`.trim();
}

function exportCards() {
  if (!appState.cards.length) {
    showStatus("没有可导出的卡片。", "error");
    return;
  }

  const blob = new Blob([JSON.stringify({ cards: appState.cards }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `knowme-cards-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showStatus("卡片已导出为 JSON。", "success");
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

    const existing = new Set(appState.cards.map((card) => `${card.title}::${card.category}::${card.content}`));
    importedCards.forEach((card) => {
      const key = `${card.title}::${card.category}::${card.content}`;
      if (!existing.has(key)) {
        existing.add(key);
        appState.cards.unshift(card);
      }
    });

    await saveCards();
    renderCards();
    showStatus(`成功导入 ${importedCards.length} 张卡片。`, "success");
  } catch (error) {
    showStatus("导入失败，请检查 JSON 格式。", "error");
  } finally {
    event.target.value = "";
  }
}

function observeResponses() {
  if (appState.responseObserver) {
    appState.responseObserver.disconnect();
  }

  appState.responseObserver = new MutationObserver(() => {
    processResponseButtons();
  });

  appState.responseObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function processResponseButtons() {
  const siteConfig = getCurrentSiteConfig();
  if (!siteConfig?.enableInlineCapture) {
    return;
  }

  const candidates = [];
  siteConfig.responseSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((node) => {
      if (node instanceof HTMLElement) {
        candidates.push(node);
      }
    });
  });

  filterNestedCandidates(candidates).forEach((node) => {
    if (node.dataset.contextkitBound === "true") {
      return;
    }

    const text = extractResponseText(node);
    if (text.length < 40) {
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "加入整合工作台";
    button.dataset.contextkitAction = "capture";
    button.style.marginTop = "12px";
    button.style.padding = "8px 12px";
    button.style.border = "none";
    button.style.borderRadius = "999px";
    button.style.background = "#534ab7";
    button.style.color = "#fff";
    button.style.cursor = "pointer";
    button.style.fontSize = "12px";

    button.addEventListener("click", async () => {
      const latestText = extractResponseText(node);
      appState.workspace.outputs[siteConfig.platformId] = latestText;
      appState.workspace.activePlatform = siteConfig.platformId;
      await saveWorkspace();
      renderPlatformTabs();
      renderWorkspace();
      showStatus(`已加入 ${getPlatform(siteConfig.platformId).label} 工作台。`, "success");
    });

    node.appendChild(button);
    node.dataset.contextkitBound = "true";
  });
}

function filterNestedCandidates(nodes) {
  const uniqueNodes = Array.from(new Set(nodes));
  return uniqueNodes.filter((node) => !uniqueNodes.some((otherNode) => otherNode !== node && otherNode.contains(node)));
}

function extractResponseText(node) {
  const clone = node.cloneNode(true);
  clone.querySelectorAll('[data-contextkit-action="capture"]').forEach((button) => {
    button.remove();
  });
  return (clone.innerText || clone.textContent || "").replace(/\n{3,}/g, "\n\n").trim();
}

function findInputTarget() {
  const selectors = getCurrentSiteConfig()?.inputSelectors || [];
  for (const selector of selectors) {
    const target = Array.from(document.querySelectorAll(selector)).find((node) => isVisible(node) && !isReadOnly(node));
    if (target) {
      return target;
    }
  }
  return null;
}

function isVisible(element) {
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return style.display !== "none" && style.visibility !== "hidden" && rect.height > 0;
}

function isReadOnly(element) {
  return (
    element.getAttribute("aria-disabled") === "true" ||
    element.getAttribute("contenteditable") === "false" ||
    element.hasAttribute("disabled") ||
    element.hasAttribute("readonly")
  );
}

function appendToInput(target, content) {
  const existingText = getEditorText(target);
  const nextText = existingText ? `${existingText.trimEnd()}\n\n${content}` : content;
  target.focus();

  if (replaceEditorContent(target, nextText)) {
    dispatchEditorEvents(target);
    placeCursorAtEnd(target);
    return true;
  }

  return false;
}

function getEditorText(target) {
  if ("value" in target && typeof target.value === "string") {
    return target.value;
  }
  return (target.innerText || target.textContent || "").trim();
}

function replaceEditorContent(target, value) {
  return tryExecCommandReplace(target, value) || setEditorText(target, value);
}

function tryExecCommandReplace(target, value) {
  try {
    if ("value" in target && typeof target.value === "string") {
      target.value = value;
      return true;
    }

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(target);
    selection.removeAllRanges();
    selection.addRange(range);
    const result = document.execCommand("insertText", false, value);
    selection.removeAllRanges();
    return result;
  } catch (error) {
    return false;
  }
}

function setEditorText(target, value) {
  try {
    if ("value" in target && typeof target.value === "string") {
      target.value = value;
      return true;
    }

    target.innerHTML = "";
    value.split("\n").forEach((line) => {
      const block = document.createElement(target.classList.contains("ql-editor") ? "p" : "div");
      block.textContent = line || "";
      target.appendChild(block);
    });
    return true;
  } catch (error) {
    return false;
  }
}

function placeCursorAtEnd(target) {
  try {
    if ("selectionStart" in target && typeof target.selectionStart === "number") {
      target.selectionStart = target.selectionEnd = target.value.length;
      return;
    }
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(target);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  } catch (error) {
    return;
  }
}

function dispatchEditorEvents(target) {
  ["input", "change"].forEach((eventName) => {
    target.dispatchEvent(new Event(eventName, { bubbles: true }));
  });

  try {
    target.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        inputType: "insertText",
        data: null
      })
    );
  } catch (error) {
    return;
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
