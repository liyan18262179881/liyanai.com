const canvas = document.querySelector("#particle-field");
const ctx = canvas.getContext("2d", { alpha: true });
const points = [];
const pointer = { x: 0, y: 0 };
const particleFocus = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
};
let width = 0;
let height = 0;
let dpr = 1;
let radius = 240;
let frame = 0;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  radius = Math.min(width * 0.28, height * 0.36, 290);
  particleFocus.x = particleFocus.x || width * 0.68;
  particleFocus.y = particleFocus.y || height * 0.36;
  particleFocus.targetX = particleFocus.targetX || particleFocus.x;
  particleFocus.targetY = particleFocus.targetY || particleFocus.y;
}

function seedSphere() {
  points.length = 0;
  const total = width < 680 ? 520 : 860;
  const offset = 2 / total;
  const increment = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < total; i += 1) {
    const y = i * offset - 1 + offset / 2;
    const ring = Math.sqrt(1 - y * y);
    const phi = i * increment;
    points.push({
      x: Math.cos(phi) * ring,
      y,
      z: Math.sin(phi) * ring,
      size: Math.random() * 1.2 + 0.55,
      speed: Math.random() * 0.45 + 0.65,
    });
  }
}

function rotate(point, angleX, angleY) {
  const sinX = Math.sin(angleX);
  const cosX = Math.cos(angleX);
  const sinY = Math.sin(angleY);
  const cosY = Math.cos(angleY);

  const y = point.y * cosX - point.z * sinX;
  const z = point.y * sinX + point.z * cosX;
  const x = point.x * cosY + z * sinY;
  const nextZ = -point.x * sinY + z * cosY;

  return { x, y, z: nextZ };
}

function render() {
  frame += 0.01;
  ctx.clearRect(0, 0, width, height);

  particleFocus.x += (particleFocus.targetX - particleFocus.x) * 0.045;
  particleFocus.y += (particleFocus.targetY - particleFocus.y) * 0.045;

  const cx = particleFocus.x;
  const cy = particleFocus.y;
  const mouseX = pointer.x * 0.18;
  const mouseY = pointer.y * 0.12;

  const lowerGlow = ctx.createLinearGradient(0, height * 0.48, 0, height);
  lowerGlow.addColorStop(0, "rgba(255, 21, 79, 0)");
  lowerGlow.addColorStop(0.62, "rgba(255, 21, 79, 0.12)");
  lowerGlow.addColorStop(1, "rgba(60, 0, 16, 0.28)");
  ctx.fillStyle = lowerGlow;
  ctx.fillRect(0, height * 0.42, width, height * 0.58);

  points.forEach((point) => {
    const p = rotate(point, frame * point.speed + mouseX, -frame * 0.65 + mouseY);
    const perspective = 1.55 / (2.15 - p.z);
    const x = cx + p.x * radius * perspective;
    const y = cy + p.y * radius * 0.58 * perspective;
    const alpha = Math.max(0.12, (p.z + 1.2) / 2.6);
    const size = point.size * perspective;

    ctx.beginPath();
    ctx.fillStyle = `rgba(255, ${Math.floor(18 + alpha * 42)}, ${Math.floor(74 + alpha * 48)}, ${alpha})`;
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.beginPath();
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.25);
  glow.addColorStop(0, "rgba(255, 21, 79, 0.08)");
  glow.addColorStop(0.55, "rgba(255, 21, 79, 0.04)");
  glow.addColorStop(1, "rgba(255, 21, 79, 0)");
  ctx.fillStyle = glow;
  ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
  ctx.fill();

  requestAnimationFrame(render);
}

function handlePointer(event) {
  pointer.x = (event.clientX / width - 0.5) || 0;
  pointer.y = (event.clientY / height - 0.5) || 0;
}

function moveParticleFocus(event) {
  if (event.target.closest("a, button, input, textarea, .case-modal, .ai-version-panel")) return;
  particleFocus.targetX = event.clientX;
  particleFocus.targetY = event.clientY;
}

// reveal: 元素默认可见，observer 仅用于可选的动画增强
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0, rootMargin: "0px 0px -40px 0px" }
);

const caseData = {
  agent: {
    kicker: "案例 01",
    title: "AI 传染病调查系统",
    desc:
      "为疾控一线调查人员设计 AI 多轮对话、信息抽取、传播链溯源和评估闭环，把高压现场的流调任务变成可记录、可校验、可协同的系统流程。",
    link: "./cases/agent.html",
    metrics: [
      ["核心指标", "单次流调 90 分钟 → 40 分钟"],
      ["北极星指标", "信息采集完整率 85%"],
      ["产品价值", "让 AI 在合规场景里稳定辅助一线调查"],
    ],
    flow: [
      ["01", "现场跟访与痛点拆解"],
      ["02", "Prompt 四层架构与多轮状态机"],
      ["03", "NER + LLM 校验与传播链建模"],
      ["04", "低分样本回捞与两周迭代闭环"],
    ],
  },
  rag: {
    kicker: "案例 02",
    title: "AI 电子胸牌系统",
    desc:
      "面向应急演练前线救援人员，设计集动态身份展示、任务状态、GPS 感知、AI 动态提醒和一键求援于一体的智能 Agent App，从立项到 MVP 独立交付仅 2 个月。",
    link: "./cases/rag.html",
    metrics: [
      ["核心指标", "覆盖 6 支救援队、60 台设备，3 次演练验证"],
      ["北极星指标", "弱网环境下核心流程完整可用"],
      ["产品价值", "把高压现场应急响应变为可记录、可协同的 Agent 产品"],
    ],
    flow: [
      ["01", "需求分析，MVP 聚焦前线手机端"],
      ["02", "Agent 能力设计：任务获取、SOP 查询、状态上报、一键救援"],
      ["03", "高压戴手套场景：大按钮、少输入、强反馈交互设计"],
      ["04", "输出完整 PRD，覆盖 P0/P1/P2 功能分级与验收指标"],
    ],
  },
  growth: {
    kicker: "案例 03",
    title: "AI 小红书营销内容生成",
    desc:
      "面向中型新消费品牌，独立完成从立项到上线的 AIGC 营销工具，覆盖内容生成、发布前风控、发布后监控和商业化验证。",
    link: "./cases/growth.html",
    metrics: [
      ["核心指标", "笔记生成成功率 92%"],
      ["北极星指标", "用户付费转化率 18%"],
      ["产品价值", "把 AIGC 生成效率转成可验证的商业闭环"],
    ],
    flow: [
      ["01", "竞品分析与 MVP 功能清单"],
      ["02", "标题、正文、标签 Prompt 工程"],
      ["03", "垂直场景模型微调与效果评估"],
      ["04", "3 个月内协同研发设计算法上线"],
    ],
  },
};

const assistantAnswers = {
  fit: [
    "🏓 乒乓球",
    "打了好多年了，最近在练反手拧拉。喜欢乒乓球的节奏感——每一拍都要快速判断、快速决策，和做产品需求分析挺像的。",
  ],
  projects: [
    "📚 读书",
    "偏爱非虚构类，最近在读《置身事内》。喜欢那种能把复杂系统讲清楚的书，读完会想拿来和真实项目对照着看。",
  ],
  stack: [
    "🎙️ 小宇宙",
    "播客是我通勤和做家务的标配。喜欢听访谈类节目，不同行业的人讲自己的判断和选择，比刷信息流有意思多了。",
  ],
};

const aiChatAnswers = {
  strength:
    "她最擅长把真实业务现场拆成可落地的 AI 产品方案：从需求调研、流程拆解、Prompt/RAG/ASR/NER 技术路径，到评估集、指标体系和跨团队上线推进。她不是只会写需求，而是能把模型能力、业务目标和合规边界放在一起判断。",
  hardcase:
    "最难的案例是 AI 传染病调查系统。难点在于场景高压、数据敏感、政府合规要求高，还要让一线调查人员真的愿意用。她通过现场跟访拆解痛点，设计多轮对话状态机和 Prompt 四层架构，并建立 500+ 条脱敏评估集，最终把单次流调从 90 分钟压缩到 40 分钟。",
  method:
    "她的设计方法论可以概括为：先进入业务现场，定义真实问题；再判断 AI 是否值得介入；然后收敛 MVP 和模型边界；最后用评估体系和业务指标持续迭代。她特别关注准确率、完整率、幻觉控制、用户采纳率和合规风险。",
  startup:
    "适合创业公司，尤其适合需要 0→1 验证 AI 产品方向的团队。她有独立完成产品立项、竞品分析、MVP 功能清单、PRD、原型、跨团队推进和上线验证的经验，也能和算法、研发、设计一起快速收敛方案。",
  projects:
    "她的代表项目有三个：AI 传染病调查系统（疾控政务，LLM+RAG+ASR 私有化部署，流调效率提升 50%）、AI 电子胸牌系统（应急救援 Agent App，2 个月独立交付 MVP，3 次演练验证）、AI 小红书营销内容生成（AIGC 营销工具，付费转化 18%）。",
  stack:
    "她熟悉的 AI 产品技术栈包括 Prompt 工程、RAG、Agent 设计、ASR、NER、Qwen、BGE、Milvus、Neo4j、LangChain、Seedance、Dify、FastGPT，也有模型微调、数据标注规范、评估集构建和 AI 效果评估经验。",
  experience:
    "她有 3 段工作经历：乐马优途科技（2025.4—2026.5，AI产品经理，负责全平台营销内容生成平台0→1）、晶硕信息科技（2021.3—2025.4，AI产品经理，负责医疗与应急两条AI产品线，落地国家疾控中心及多个地方疾控中心）、江苏企优托集团（2018.7—2021.3，产品经理，主导线上获客链路0→1）。",
  contact:
    "可以通过邮箱 1836883018@qq.com 或电话 182 6217 9881 联系她。她的目标方向是 AI 产品经理、LLM 应用产品、RAG/Agent 产品、AI 医疗/政务/B 端智能化产品。",
  default:
    "这个问题我可以从她的简历信息里回答：她是 6 年产品经验、2 年 AI 产品经验的 AI 产品经理，核心优势是 0→1 落地、AI 产品全链路能力、评估驱动和跨团队交付。代表项目包括 AI 传染病调查系统、AI 电子胸牌系统和 AI 营销内容生成平台。你可以问我：最擅长什么、最难的案例、工作经历、适合创业公司吗。",
};

let activeModal = null;
let lastFocusedElement = null;

function fillList(container, items) {
  if (!container) return;
  container.innerHTML = items
    .map(
      ([label, value]) => `
        <div>
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
      `
    )
    .join("");
}

function openLayer(layer) {
  if (!layer) return;
  lastFocusedElement = document.activeElement;
  activeModal = layer;
  layer.classList.add("is-open");
  layer.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  const closeButton = layer.querySelector(".modal-close");
  if (closeButton) closeButton.focus();
}

function closeLayer(layer = activeModal) {
  if (!layer) return;
  layer.classList.remove("is-open");
  layer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  activeModal = null;
  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
}

window.openCaseModal = function openCaseModal(caseKey) {
  const data = caseData[caseKey];
  const layer = document.querySelector("#case-modal");
  if (!data || !layer) return;

  document.querySelector("#case-modal-kicker").textContent = data.kicker;
  document.querySelector("#case-modal-title").textContent = data.title;
  document.querySelector("#case-modal-desc").textContent = data.desc;
  document.querySelector("#case-modal-link").setAttribute("href", data.link);
  fillList(document.querySelector("#case-modal-metrics"), data.metrics);
  fillList(document.querySelector("#case-modal-flow"), data.flow);
  openLayer(layer);
}

window.openContactModal = function openContactModal() {
  openLayer(document.querySelector("#contact-modal"));
}

function resolveAiChatAnswer(question) {
  const text = question.trim().toLowerCase();
  if (!text) return "";
  if (text.includes("擅长") || text.includes("优势") || text.includes("能力")) return aiChatAnswers.strength;
  if (text.includes("难") || text.includes("挑战") || text.includes("案例")) return aiChatAnswers.hardcase;
  if (text.includes("方法") || text.includes("设计") || text.includes("思路")) return aiChatAnswers.method;
  if (text.includes("创业") || text.includes("早期") || text.includes("0→1") || text.includes("0-1")) {
    return aiChatAnswers.startup;
  }
  if (text.includes("项目") || text.includes("作品") || text.includes("做过")) return aiChatAnswers.projects;
  if (text.includes("技术") || text.includes("rag") || text.includes("agent") || text.includes("llm")) return aiChatAnswers.stack;
  if (text.includes("工作") || text.includes("经历") || text.includes("公司") || text.includes("任职")) return aiChatAnswers.experience;
  if (text.includes("联系") || text.includes("邮箱") || text.includes("电话") || text.includes("面试")) return aiChatAnswers.contact;
  return aiChatAnswers.default;
}

function appendAiMessage(role, text) {
  const messages = document.querySelector("#ai-version-messages");
  if (!messages || !text) return;
  const message = document.createElement("div");
  message.className = `ai-message ${role}`;
  message.innerHTML = `<p>${text}</p>${role === "bot" ? "<time>刚刚</time>" : ""}`;
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
}

function askAiVersion(question) {
  const trimmed = question.trim();
  if (!trimmed) return;
  appendAiMessage("user", trimmed);
  window.setTimeout(() => {
    appendAiMessage("bot", resolveAiChatAnswer(trimmed));
  }, 180);
}

// reveal 元素默认已可见（CSS opacity:1），无需 observer 强制显示
// observer 仅做可选动画增强
document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));
document.querySelectorAll("[data-case-modal]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    openCaseModal(button.dataset.caseModal);
  });
});
document.querySelectorAll("[data-case-card]").forEach((card) => {
  card.addEventListener("click", (event) => {
    if (event.target.closest("a, button")) return;
    openCaseModal(card.dataset.caseCard);
  });
});
document.querySelectorAll("[data-contact-modal]").forEach((button) => {
  button.addEventListener("click", openContactModal);
});
document.querySelectorAll("[data-assistant-q]").forEach((button) => {
  button.addEventListener("click", () => {
    const chat = document.querySelector("#assistant-chat");
    const answer = assistantAnswers[button.dataset.assistantQ];
    if (!chat || !answer) return;
    chat.innerHTML = `
      <div class="chat-line user">${answer[0]}</div>
      <div class="chat-line bot">${answer[1]}</div>
    `;
  });
});
const aiVersionWidget = document.querySelector("#ai-version-widget");
const aiVersionToggle = document.querySelector(".ai-version-toggle");
const aiVersionPanel = document.querySelector(".ai-version-panel");
const aiVersion关闭 = document.querySelector(".ai-version-close");
const aiVersionForm = document.querySelector("#ai-version-form");
const aiVersionInput = document.querySelector("#ai-version-input");

function setAiVersionOpen(isOpen) {
  if (!aiVersionWidget || !aiVersionToggle || !aiVersionPanel) return;
  aiVersionWidget.classList.toggle("is-open", isOpen);
  aiVersionToggle.setAttribute("aria-expanded", String(isOpen));
  aiVersionPanel.setAttribute("aria-hidden", String(!isOpen));

  if (isOpen) {
    const rect = aiVersionWidget.getBoundingClientRect();
    // 水平方向：widget 在右半屏 → 面板往左，否则往右
    if (rect.left + rect.width / 2 > window.innerWidth / 2) {
      aiVersionPanel.style.right = "0";
      aiVersionPanel.style.left  = "auto";
    } else {
      aiVersionPanel.style.left  = "0";
      aiVersionPanel.style.right = "auto";
    }
    // 垂直方向：widget 在下半屏 → 面板往上，否则往下
    if (rect.top + rect.height / 2 > window.innerHeight / 2) {
      aiVersionPanel.style.bottom = "6.4rem";
      aiVersionPanel.style.top    = "auto";
    } else {
      aiVersionPanel.style.top    = "6.4rem";
      aiVersionPanel.style.bottom = "auto";
    }
  }

  if (isOpen && aiVersionInput) aiVersionInput.focus();
}

// toggle 按钮点击开/关面板（拖拽逻辑会在真正拖动时拦截此事件）
if (aiVersionToggle) {
  aiVersionToggle.addEventListener("click", () => {
    setAiVersionOpen(!aiVersionWidget.classList.contains("is-open"));
  });
}

if (aiVersion关闭) {
  aiVersion关闭.addEventListener("click", () => setAiVersionOpen(false));
}

document.querySelectorAll("[data-ai-chat-q]").forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.aiChatQ;
    const label = button.textContent.trim();
    setAiVersionOpen(true);
    appendAiMessage("user", label);
    window.setTimeout(() => appendAiMessage("bot", aiChatAnswers[key] || aiChatAnswers.default), 180);
  });
});

if (aiVersionForm) {
  aiVersionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!aiVersionInput) return;
    askAiVersion(aiVersionInput.value);
    aiVersionInput.value = "";
  });
}
document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => closeLayer(button.closest(".modal-layer")));
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setAiVersionOpen(false);
    closeLayer();
  }
});

window.addEventListener("resize", () => {
  resize();
  seedSphere();
});
window.addEventListener("pointermove", handlePointer);
window.addEventListener("click", moveParticleFocus);

resize();
seedSphere();
render();


// ── 个人兴趣媒体轮播 ──────────────────────────────────────────
(function () {
  const track   = document.getElementById('carousel-track');
  const dotsWrap = document.getElementById('carousel-dots');
  const btnPrev  = document.getElementById('carousel-prev');
  const btnNext  = document.getElementById('carousel-next');
  if (!track) return;

  const slides = Array.from(track.children);
  const total  = slides.length;
  let current  = 0;
  let autoTimer = null;

  // 生成小圆点
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', '跳转到第 ' + (i + 1) + ' 张');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function goTo(index) {
    // 暂停当前可见视频
    const curVideo = slides[current].querySelector('video');
    if (curVideo) curVideo.pause();

    current = (index + total) % total;
    track.style.transform = 'translateX(-' + current * 100 + '%)';

    // 更新圆点
    dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  btnNext.addEventListener('click', () => { next(); resetAuto(); });
  btnPrev.addEventListener('click', () => { prev(); resetAuto(); });

  // 自动轮播 5 秒（视频幻灯片不自动切换）
  function startAuto() {
    autoTimer = setInterval(() => {
      const curVideo = slides[current].querySelector('video');
      if (curVideo && !curVideo.paused) return; // 视频播放中不自动跳
      next();
    }, 5000);
  }
  function resetAuto() { clearInterval(autoTimer); startAuto(); }
  startAuto();

  // 触摸滑动支持
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); resetAuto(); }
  });
})();
