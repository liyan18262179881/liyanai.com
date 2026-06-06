// ── 粒子球 canvas ──────────────────────────────────────────────
const canvas = document.querySelector("#particle-field");
const ctx = canvas ? canvas.getContext("2d", { alpha: true }) : null;
const points = [];
const pointer = { x: 0, y: 0 };
const particleFocus = { x: 0, y: 0, targetX: 0, targetY: 0 };
let width = 0, height = 0, dpr = 1, radius = 240, frame = 0;

function resize() {
  if (!canvas) return;
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
  if (!canvas) return;
  points.length = 0;
  const total = width < 680 ? 520 : 860;
  const offset = 2 / total;
  const increment = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < total; i++) {
    const y = i * offset - 1 + offset / 2;
    const ring = Math.sqrt(1 - y * y);
    const phi = i * increment;
    points.push({ x: Math.cos(phi) * ring, y, z: Math.sin(phi) * ring, size: Math.random() * 1.2 + 0.55, speed: Math.random() * 0.45 + 0.65 });
  }
}

function rotate(point, angleX, angleY) {
  const sinX = Math.sin(angleX), cosX = Math.cos(angleX);
  const sinY = Math.sin(angleY), cosY = Math.cos(angleY);
  const y = point.y * cosX - point.z * sinX;
  const z = point.y * sinX + point.z * cosX;
  const x = point.x * cosY + z * sinY;
  return { x, y, z: -point.x * sinY + z * cosY };
}

function render() {
  if (!ctx) return;
  frame += 0.01;
  ctx.clearRect(0, 0, width, height);
  particleFocus.x += (particleFocus.targetX - particleFocus.x) * 0.045;
  particleFocus.y += (particleFocus.targetY - particleFocus.y) * 0.045;
  const cx = particleFocus.x, cy = particleFocus.y;
  const mouseX = pointer.x * 0.18, mouseY = pointer.y * 0.12;
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
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, ${Math.floor(18 + alpha * 42)}, ${Math.floor(74 + alpha * 48)}, ${alpha})`;
    ctx.arc(x, y, point.size * perspective, 0, Math.PI * 2);
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

// ── reveal 动画 ────────────────────────────────────────────────
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

// ── 项目案例数据 ───────────────────────────────────────────────
const caseData = {
  agent: {
    kicker: "案例 01", title: "AI 传染病调查系统",
    desc: "为疾控一线调查人员设计 AI 多轮对话、信息抽取、传播链溯源和评估闭环，把高压现场的流调任务变成可记录、可校验、可协同的系统流程。",
    link: "./cases/agent.html",
    metrics: [["核心指标", "单次流调时长从 60 分钟压缩至 30 分钟，效率提升 50%"], ["北极星指标", "信息采集完整率 85%"], ["产品价值", "让 AI 在合规场景里稳定辅助一线调查"]],
    flow: [["01", "现场跟访与痛点拆解"], ["02", "Prompt 四层架构与多轮状态机"], ["03", "NER + LLM 校验与传播链建模"], ["04", "低分样本回捞与两周迭代闭环"]],
  },
  rag: {
    kicker: "案例 02", title: "AI 电子胸牌系统",
    desc: "面向应急演练前线救援人员，设计集动态身份展示、任务状态、GPS 感知、AI 动态提醒和一键求援于一体的智能 Agent App，6支救援队伍、240多台硬件设备交付使用。",
    link: "./cases/rag.html",
    metrics: [["核心指标", "6支救援队伍、240多台硬件设备，3次演练验证"], ["北极星指标", "弱网环境下核心流程完整可用"], ["产品价值", "把高压现场应急响应变为可记录、可协同的 Agent 产品"]],
    flow: [["01", "需求分析，MVP 聚焦前线手机端"], ["02", "Agent 能力设计：任务获取、SOP 查询、状态上报、一键救援"], ["03", "高压戴手套场景：大按钮、少输入、强反馈交互设计"], ["04", "输出完整 PRD，覆盖 P0/P1/P2 功能分级与验收指标"]],
  },
  growth: {
    kicker: "案例 03", title: "AI 小红书营销内容生成",
    desc: "面向中型新消费品牌，独立完成从立项到上线的 AIGC 营销工具，覆盖内容生成、发布前风控、发布后监控和商业化验证。",
    link: "./cases/growth.html",
    metrics: [["核心指标", "单篇内容全链路生成时长＜1分钟，较人工创作效率提升超90%"], ["北极星指标", "违规内容生成前拦截"], ["产品价值", "把 AIGC 生成效率转成可验证的商业闭环"]],
    flow: [["01", "竞品分析与 MVP 功能清单"], ["02", "标题、正文、标签 Prompt 工程"], ["03", "垂直场景模型微调与效果评估"], ["04", "1 个月内协同研发设计算法上线"]],
  },
};

// ── 文章数据 ───────────────────────────────────────────────────
const articleData = {
  article1: {
    tag: "职场观察",
    title: "FDE 是什么：不是销售工程师，也不是咨询顾问",
    body: `<p>AI Agent 时代的部署难题正在催生一场角色革命。从 Palantir 发明的 FDE 模式到 OpenAI、Anthropic、Google 的集体跟进，这种将工程师派驻客户现场的做法，正在成为解决 AI 落地最后一公里的关键。</p>
<h3>FDE 是什么？</h3>
<p>FDE（Forward Deployed Engineer，前沿部署工程师）是一种介于工程师与咨询顾问之间的新型角色。他们不坐在总部写代码，而是嵌入客户现场，直接面对真实的业务流程、系统环境和使用者。</p>
<p>这个角色最早由 Palantir 系统性地实践。Palantir 的产品非常复杂，客户也大多是政府机构或大型企业，仅靠远程支持根本无法落地。FDE 的出现，让"交付"从"部署完成"变成了"真正跑起来、业务真的在用"。</p>
<h3>FDE 和销售工程师有什么区别？</h3>
<p>销售工程师（SE）的核心任务是"帮客户理解产品、促成成交"，他在销售漏斗里。FDE 的核心任务是"在客户现场把产品真正跑起来"，他在交付链路里。SE 的成功标准是签单，FDE 的成功标准是业务价值。</p>
<h3>为什么 AI 时代特别需要 FDE？</h3>
<p>AI 产品，尤其是 Agent 类产品，落地比传统软件难得多。难点不在于 API 接不上，而在于：数据质量参差不齐、业务流程不标准、用户不知道怎么用、效果验证缺乏标准。这些问题在客户现场才能看见，在总部是看不见的。</p>
<p>FDE 存在的意义，就是把"产品能力"和"业务场景"之间的那道墙打通。他不只是解决技术问题，更是帮客户定义什么叫"AI 用起来了"。</p>
<h3>对 AI 产品经理的启示</h3>
<p>FDE 模式给 AI 产品经理最大的启示是：交付不等于上线。真正的落地，需要有人深入现场，理解一线痛点，把产品能力翻译成业务语言，并建立可持续的反馈闭环。这件事，有时候不是靠功能迭代解决的，而是靠"有人在场"。</p>`,
  },
  article2: {
    tag: "AI 交互",
    title: "别再逼用户写 Prompt 了，那是产品经理的无能",
    body: `<p>对话框正成为 AI 产品的设计雷区，它表面提供无限可能，实则暴露了产品经理的懒惰与无能。</p>
<h3>对话框的陷阱</h3>
<p>很多 AI 产品的核心交互就是一个输入框，然后告诉用户"你可以问我任何问题"。这听起来很强大，实际上是把所有的认知负担都转移给了用户。用户不知道能问什么、怎么问、问了会得到什么——这不是赋能，这是甩锅。</p>
<p>更大的问题是：大多数用户并不是 Prompt 工程师。他们不知道如何描述自己的需求，不会用结构化语言表达上下文，也不知道哪些信息对 AI 有用。一个好的产品应该帮用户弥补这个差距，而不是把这个差距暴露出来。</p>
<h3>从"问答"到"选择"</h3>
<p>更好的设计方向是：让 AI 主动捕捉意图，而不是被动等待指令。这意味着：预填充常见场景、提供结构化引导、根据上下文主动推荐动作、把"输入"变成"选择"。</p>
<p>当用户打开一个营销文案工具，他不应该面对一个空白输入框，而应该看到"选择你的产品类型""描述核心卖点""选择目标用户"这样的结构化引导。</p>
<h3>意图捕捉是产品设计的责任</h3>
<p>Prompt 设计不应该是用户的作业，而是产品经理的作业。把"写好 Prompt"的门槛留给用户，是在用技术复杂性掩盖产品设计的失职。好的 AI 产品，应该把最好的 Prompt 藏在产品交互里，让用户在不知不觉中完成最有效的表达。</p>
<p>未来的 AI 交互设计趋势，是从"对话"走向"协作"，从"输入"走向"引导"，从"无限可能"走向"精准可控"。这才是产品经理真正应该交付的价值。</p>`,
  },
  article3: {
    tag: "AI 产品",
    title: "为什么你的 AI 不是听不懂，而是「没拿住整件事」？",
    body: `<p>AI 产品中最让人抓狂的"健忘症"和"左右互搏"问题，往往不是技术缺陷而是设计漏洞。</p>
<h3>AI 的"没拿住整件事"是什么感受？</h3>
<p>用户和 AI 聊了十几轮，突然发现 AI 忘了最开始说的约束条件；或者同一个问题，前后得到了两个矛盾的答案；或者用户改了一个细节，AI 把之前所有的设定都重置了。这些体验，不是因为 AI 不聪明，而是因为上下文管理出了问题。</p>
<h3>四大上下文管理策略</h3>
<p><strong>1. 关键信息显式锚定</strong>：把用户最重要的约束和目标，在每一轮对话开始时重新注入到 Prompt 里，而不是依赖模型自己"记住"。</p>
<p><strong>2. 状态显形设计</strong>：让用户随时能看到"AI 现在理解的是什么"，降低信息不对称。可以是一个可编辑的摘要面板，也可以是每轮对话前的确认提示。</p>
<p><strong>3. 主动遗忘机制</strong>：不是所有历史信息都有价值，过期的、被覆盖的信息应该被清除，而不是无差别地塞进上下文窗口。</p>
<p><strong>4. 多轮状态机设计</strong>：把对话过程拆解成有限的状态节点，每个状态明确知道自己在整件事里处于哪一步，需要什么输入，可以产生什么输出。</p>
<h3>让 AI 学会"主动遗忘"</h3>
<p>这听起来反直觉，但主动遗忘是上下文管理里最难也最重要的能力。当用户说"算了，我换个思路"，AI 需要知道哪些之前的信息应该保留，哪些应该抛弃。没有主动遗忘机制的 AI，会把所有历史负担都背在身上，最终在矛盾信息里"左右互搏"。</p>
<p>上下文管理不是一个纯技术问题，它是产品设计问题。解决它，需要产品经理深度参与对话流程设计，而不仅仅是写一段系统 Prompt 然后祈祷模型自己解决。</p>`,
  },
  article4: {
    tag: "AI Agent",
    title: "Function Call：AI Agent 的手和脚",
    body: `<p>大模型天生不擅长处理事实，它需要"手和脚"。Function Call 就是连接大模型推理能力和真实世界执行能力的桥梁。</p>
<h3>大模型的局限：只有脑子没有手</h3>
<p>大模型非常擅长推理、生成、归纳，但它做不到实时查天气、调数据库、发邮件、调用企业内部系统。这不是因为它不聪明，而是因为它的本质是一个语言预测器，不能直接触达外部世界。</p>
<p>Function Call（函数调用）的出现，就是给大模型装上了"手和脚"——让它能够在推理过程中，识别出"我需要调用某个工具"，然后把参数整理好，交给外部系统执行，再把结果拿回来继续推理。</p>
<h3>Function Call 的工作原理</h3>
<p>整个流程可以简化为四步：<strong>① 用户提问 → ② 模型判断需要调用哪个函数、传什么参数 → ③ 外部系统执行函数并返回结果 → ④ 模型基于结果生成最终回答</strong>。</p>
<p>对产品经理来说，关键是理解第②步：模型不是随机选函数，而是根据你在系统 Prompt 里定义的函数描述来判断的。函数描述写得好不好，直接决定 Agent 能不能用对工具。</p>
<h3>对 AI Agent 产品设计的意义</h3>
<p>Function Call 是 AI Agent 能力的基础设施。没有它，Agent 只能"说"，不能"做"。有了它，Agent 才能：查询实时数据、操作文件系统、调用 API、控制外部设备、在多步骤任务里保持行动连贯性。</p>
<p>作为产品经理，设计 Agent 产品时，最重要的工作之一就是定义好工具集合：哪些场景需要哪些工具，工具的描述是否足够清晰，工具调用的边界和权限是否合理。这决定了 Agent 是真的有用，还是只是个花架子。</p>
<h3>一个产品视角的小结</h3>
<p>Function Call 不只是技术实现细节，它是 AI Agent 产品设计的核心框架。理解它，才能在设计 Agent 工作流时，清楚地知道哪些事可以让模型自主决策，哪些事需要人工确认，哪些事根本不该让 AI 碰。</p>`,
  },
};

// ── 兴趣助手回答 ───────────────────────────────────────────────
const assistantAnswers = {
  fit: ["🏓 乒乓球", "打了好多年了，最近在练反手拧拉。喜欢乒乓球的节奏感——每一拍都要快速判断、快速决策，和做产品需求分析挺像的。"],
  projects: ["📚 读书", "偏爱非虚构类，最近在读《置身事内》。喜欢那种能把复杂系统讲清楚的书，读完会想拿来和真实项目对照着看。"],
  stack: ["🎙️ 小宇宙", "播客是我通勤和做家务的标配。喜欢听访谈类节目，不同行业的人讲自己的判断和选择，比刷信息流有意思多了。"],
};

// ── AI 聊天回答 ────────────────────────────────────────────────
const aiChatAnswers = {
  strength: "她最擅长把真实业务现场拆成可落地的 AI 产品方案：从需求调研、流程拆解、Prompt/RAG/ASR/NER 技术路径，到评估集、指标体系和跨团队上线推进。她不是只会写需求，而是能把模型能力、业务目标和合规边界放在一起判断。",
  hardcase: "最难的案例是 AI 传染病调查系统。难点在于场景高压、数据敏感、政府合规要求高，还要让一线调查人员真的愿意用。她通过现场跟访拆解痛点，设计多轮对话状态机和 Prompt 四层架构，并建立 500+ 条脱敏评估集，最终把单次流调时长从 60 分钟压缩至 30 分钟，效率提升 50%。",
  method: "她的设计方法论可以概括为：先进入业务现场，定义真实问题；再判断 AI 是否值得介入；然后收敛 MVP 和模型边界；最后用评估体系和业务指标持续迭代。她特别关注准确率、完整率、幻觉控制、用户采纳率和合规风险。",
  startup: "适合创业公司，尤其适合需要 0→1 验证 AI 产品方向的团队。她有独立完成产品立项、竞品分析、MVP 功能清单、PRD、原型、跨团队推进和上线验证的经验，也能和算法、研发、设计一起快速收敛方案。",
  projects: "她的代表项目有三个：AI 传染病调查系统（疾控政务，LLM+RAG+ASR 私有化部署，流调效率提升 50%）、AI 电子胸牌系统（应急救援 Agent App，6支救援队伍、240多台硬件设备交付使用，3次演练验证）、AI 小红书营销内容生成（AIGC 营销工具，付费转化 18%）。",
  stack: "她熟悉的 AI 产品技术栈包括 Prompt 工程、RAG、Agent 设计、ASR、NER、Qwen、BGE、Milvus、Neo4j、LangChain、Seedance、Dify、FastGPT，也有模型微调、数据标注规范、评估集构建和 AI 效果评估经验。",
  experience: "她有 3 段工作经历：乐马优途科技（2025.4—2026.5，AI产品经理，负责全平台营销内容生成平台0→1）、晶硕信息科技（2021.3—2025.4，AI产品经理，负责医疗与应急两条AI产品线，落地国家疾控中心及多个地方疾控中心）、江苏企优托集团（2018.7—2021.3，产品经理，主导线上获客链路0→1）。",
  contact: "可以通过邮箱 1836883018@qq.com 或电话 182 6217 9881 联系她。她的目标方向是 AI 产品经理、LLM 应用产品、RAG/Agent 产品、AI 医疗/政务/B 端智能化产品。",
  default: "这个问题我可以从她的简历信息里回答：她是 5 年产品经验、3 年 AI 产品经验的 AI 产品经理，核心优势是 0→1 落地、AI 产品全链路能力、评估驱动和跨团队交付。代表项目包括 AI 传染病调查系统、AI 电子胸牌系统和 AI 营销内容生成平台。你可以问我：最擅长什么、最难的案例、工作经历、适合创业公司吗。",
};

// ── 弹窗通用控制 ───────────────────────────────────────────────
let activeModal = null;
let lastFocusedElement = null;

function fillList(container, items) {
  if (!container) return;
  container.innerHTML = items.map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join("");
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

function closeLayer(layer) {
  const target = layer || activeModal;
  if (!target) return;
  target.classList.remove("is-open");
  target.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  activeModal = null;
  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
}

// ── 文章弹窗 ───────────────────────────────────────────────────
window.openArticle = function openArticle(articleKey) {
  const data = articleData[articleKey];
  const layer = document.querySelector("#article-modal");
  if (!data || !layer) return;
  document.querySelector("#article-modal-tag").textContent = data.tag;
  document.querySelector("#article-modal-title").textContent = data.title;
  document.querySelector("#article-modal-body").innerHTML = data.body;
  openLayer(layer);
};

// ── 案例弹窗 ───────────────────────────────────────────────────
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
};

// ── 联系弹窗 ───────────────────────────────────────────────────
window.openContactModal = function openContactModal() {
  openLayer(document.querySelector("#contact-modal"));
};

// ── AI 聊天 ────────────────────────────────────────────────────
function resolveAiChatAnswer(question) {
  const text = question.trim().toLowerCase();
  if (!text) return "";
  if (text.includes("擅长") || text.includes("优势") || text.includes("能力")) return aiChatAnswers.strength;
  if (text.includes("难") || text.includes("挑战") || text.includes("案例")) return aiChatAnswers.hardcase;
  if (text.includes("方法") || text.includes("设计") || text.includes("思路")) return aiChatAnswers.method;
  if (text.includes("创业") || text.includes("早期") || text.includes("0→1") || text.includes("0-1")) return aiChatAnswers.startup;
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
  window.setTimeout(() => appendAiMessage("bot", resolveAiChatAnswer(trimmed)), 180);
}

// ── 事件绑定 ───────────────────────────────────────────────────
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

document.querySelectorAll("[data-open-article]").forEach((button) => {
  button.addEventListener("click", () => openArticle(button.dataset.openArticle));
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => closeLayer(button.closest(".modal-layer")));
});

document.querySelectorAll("[data-close-article-modal]").forEach((el) => {
  el.addEventListener("click", () => closeLayer(document.querySelector("#article-modal")));
});

document.querySelectorAll("[data-assistant-q]").forEach((button) => {
  button.addEventListener("click", () => {
    const chat = document.querySelector("#assistant-chat");
    const answer = assistantAnswers[button.dataset.assistantQ];
    if (!chat || !answer) return;
    chat.innerHTML = `<div class="chat-line user">${answer[0]}</div><div class="chat-line bot">${answer[1]}</div>`;
  });
});

// ── AI 版我面板 ────────────────────────────────────────────────
const aiVersionWidget = document.querySelector("#ai-version-widget");
const aiVersionToggle = document.querySelector(".ai-version-toggle");
const aiVersionPanel = document.querySelector(".ai-version-panel");
const aiVersionClose = document.querySelector(".ai-version-close");
const aiVersionForm = document.querySelector("#ai-version-form");
const aiVersionInput = document.querySelector("#ai-version-input");

function setAiVersionOpen(isOpen) {
  if (!aiVersionWidget || !aiVersionToggle || !aiVersionPanel) return;
  aiVersionWidget.classList.toggle("is-open", isOpen);
  aiVersionToggle.setAttribute("aria-expanded", String(isOpen));
  aiVersionPanel.setAttribute("aria-hidden", String(!isOpen));
  if (isOpen) {
    const rect = aiVersionWidget.getBoundingClientRect();
    if (rect.left + rect.width / 2 > window.innerWidth / 2) {
      aiVersionPanel.style.right = "0"; aiVersionPanel.style.left = "auto";
    } else {
      aiVersionPanel.style.left = "0"; aiVersionPanel.style.right = "auto";
    }
    if (rect.top + rect.height / 2 > window.innerHeight / 2) {
      aiVersionPanel.style.bottom = "6.4rem"; aiVersionPanel.style.top = "auto";
    } else {
      aiVersionPanel.style.top = "6.4rem"; aiVersionPanel.style.bottom = "auto";
    }
  }
  if (isOpen && aiVersionInput) aiVersionInput.focus();
}

if (aiVersionToggle) {
  aiVersionToggle.addEventListener("click", () => {
    setAiVersionOpen(!aiVersionWidget.classList.contains("is-open"));
  });
}
if (aiVersionClose) {
  aiVersionClose.addEventListener("click", () => setAiVersionOpen(false));
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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setAiVersionOpen(false);
    closeLayer();
  }
});

window.addEventListener("resize", () => { resize(); seedSphere(); });
window.addEventListener("pointermove", handlePointer);
window.addEventListener("click", moveParticleFocus);

resize();
seedSphere();
render();

// ── 个人兴趣媒体轮播 ──────────────────────────────────────────
(function () {
  const track = document.getElementById("carousel-track");
  const dotsWrap = document.getElementById("carousel-dots");
  const btnPrev = document.getElementById("carousel-prev");
  const btnNext = document.getElementById("carousel-next");
  if (!track) return;
  const slides = Array.from(track.children);
  const total = slides.length;
  let current = 0, autoTimer = null;
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "carousel-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", "跳转到第 " + (i + 1) + " 张");
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  function goTo(index) {
    const curVideo = slides[current].querySelector("video");
    if (curVideo) curVideo.pause();
    current = (index + total) % total;
    track.style.transform = "translateX(-" + current * 100 + "%)";
    dotsWrap.querySelectorAll(".carousel-dot").forEach((d, i) => d.classList.toggle("active", i === current));
  }
  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }
  btnNext.addEventListener("click", () => { next(); resetAuto(); });
  btnPrev.addEventListener("click", () => { prev(); resetAuto(); });
  function startAuto() {
    autoTimer = setInterval(() => {
      const curVideo = slides[current].querySelector("video");
      if (curVideo && !curVideo.paused) return;
      next();
    }, 5000);
  }
  function resetAuto() { clearInterval(autoTimer); startAuto(); }
  startAuto();
  let touchStartX = 0;
  track.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); resetAuto(); }
  });
})();
