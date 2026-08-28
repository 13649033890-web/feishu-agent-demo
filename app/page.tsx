"use client";

import {
  type ChangeEvent,
  type ElementType,
  type KeyboardEvent,
  useState,
} from "react";
import {
  Article,
  ArrowRight,
  ArrowUpRight,
  At,
  Bell,
  BookOpen,
  CalendarBlank,
  CaretRight,
  ChartBar,
  ChartLineUp,
  Check,
  CheckCircle,
  CheckSquare,
  ChatCircleDots,
  ClipboardText,
  Database,
  DotsThree,
  DotsThreeVertical,
  DownloadSimple,
  Eye,
  FadersHorizontal,
  FolderOpen,
  Gear,
  GitBranch,
  House,
  Lightning,
  LinkSimple,
  MagnifyingGlass,
  Microphone,
  NotePencil,
  Paperclip,
  PaperPlaneTilt,
  Plus,
  ShieldCheck,
  Smiley,
  Sparkle,
  Star,
  Table,
  TrendUp,
  UsersThree,
  VideoCamera,
  WarningCircle,
} from "@phosphor-icons/react";

type Mode = "personal" | "boss";
type NavId =
  | "messages"
  | "docs"
  | "calendar"
  | "tables"
  | "tasks"
  | "contacts"
  | "meetings"
  | "favorites"
  | "more";
type MessageRole = "user" | "assistant";
type SendStatus = "idle" | "preview" | "confirmed";

type ChatMessage = {
  id: string;
  role: MessageRole;
  text: string;
  detail?: string;
};

type NavItem = {
  id: NavId;
  label: string;
  icon: ElementType;
  badge?: string;
};

const navItems: NavItem[] = [
  { id: "messages", label: "消息", icon: ChatCircleDots, badge: "8" },
  { id: "docs", label: "云文档", icon: Article },
  { id: "calendar", label: "日历", icon: CalendarBlank },
  { id: "tables", label: "多维表格", icon: Table },
  { id: "tasks", label: "任务", icon: CheckSquare },
  { id: "contacts", label: "联系人", icon: UsersThree },
  { id: "meetings", label: "视频会议", icon: VideoCamera },
  { id: "favorites", label: "收藏", icon: Star },
  { id: "more", label: "更多", icon: DotsThree },
];

const conversations = [
  {
    id: "agent",
    title: "爆炒空心菜的飞书 CLI",
    preview: "我把今天新增的 8 条资料整理好了",
    time: "刚刚",
    tone: "agent",
    status: "智能体",
  },
  {
    id: "weekly",
    title: "大搜经营周报",
    preview: "周报草稿已更新，待你审核",
    time: "12:01",
    tone: "doc",
    status: "",
  },
  {
    id: "review",
    title: "需求评审 · PMO",
    preview: "有 3 项需求等待补充结论",
    time: "11:10",
    tone: "team",
    status: "",
  },
  {
    id: "data",
    title: "数据口径同步",
    preview: "通过率口径已同步至指标字典",
    time: "昨天",
    tone: "data",
    status: "",
  },
  {
    id: "archive",
    title: "项目资料归档",
    preview: "新增 5 个文件，点击查看清单",
    time: "昨天",
    tone: "folder",
    status: "",
  },
  {
    id: "ops",
    title: "产品运营协作群",
    preview: "小驼：已整理本周共识和待办",
    time: "8月26日",
    tone: "team",
    status: "",
  },
];

const inboxItems = [
  {
    icon: ClipboardText,
    title: "会议结论 · 首页搜索改版",
    meta: "飞书妙记 · 10:42",
    tag: "会议结论",
    tagTone: "blue",
  },
  {
    icon: Article,
    title: "大搜周报数据补充说明",
    meta: "云文档 · 11:18",
    tag: "项目背景",
    tagTone: "purple",
  },
  {
    icon: LinkSimple,
    title: "竞品截图与临时想法",
    meta: "聊天附件 · 14:06",
    tag: "待确认",
    tagTone: "orange",
  },
];

const workflowSteps = [
  { title: "竞品分析", note: "形成对比维度", icon: Eye, color: "blue" },
  { title: "PRD 草稿", note: "补齐目标与方案", icon: NotePencil, color: "purple" },
  { title: "取数与口径", note: "生成 SQL 任务", icon: Database, color: "teal" },
  { title: "实验复盘", note: "设计指标与结论", icon: ChartLineUp, color: "orange" },
  { title: "UI 草图", note: "输出页面结构", icon: FadersHorizontal, color: "pink" },
];

const businessRows = [
  { line: "大搜", owner: "PM-01", meetings: 8, progress: 78, pass: "87.5%", tone: "blue" },
  { line: "酒店", owner: "PM-02", meetings: 6, progress: 71, pass: "83.3%", tone: "purple" },
  { line: "机票", owner: "PM-03", meetings: 5, progress: 62, pass: "60.0%", tone: "orange" },
  { line: "度假", owner: "PM-04", meetings: 5, progress: 58, pass: "80.0%", tone: "teal" },
];

const sourceLabels = [
  { label: "飞书云文档", icon: Article },
  { label: "会议纪要", icon: VideoCamera },
  { label: "聊天附件", icon: LinkSimple },
  { label: "Git 复盘索引", icon: GitBranch },
];

function AgentAvatar({ small = false }: { small?: boolean }) {
  return (
    <span className={`agent-avatar ${small ? "agent-avatar-small" : ""}`} aria-hidden="true">
      <span className="avatar-sun" />
      <span className="avatar-horizon" />
      <Sparkle className="avatar-sparkle" size={small ? 12 : 18} weight="fill" />
    </span>
  );
}

function ConversationAvatar({ tone }: { tone: string }) {
  if (tone === "agent") return <AgentAvatar small />;

  const Icon =
    tone === "doc"
      ? Article
      : tone === "data"
        ? ChartBar
        : tone === "folder"
          ? FolderOpen
          : UsersThree;

  return (
    <span className={`conversation-avatar conversation-avatar-${tone}`} aria-hidden="true">
      <Icon size={18} weight="duotone" />
    </span>
  );
}

function Tag({ children, tone = "neutral" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`tag tag-${tone}`}>{children}</span>;
}

function SourcePills({ onSelect }: { onSelect: (label: string) => void }) {
  return (
    <div className="source-pills" aria-label="数据来源">
      {sourceLabels.map(({ label, icon: Icon }) => (
        <button key={label} className="source-pill" onClick={() => onSelect(label)}>
          <Icon size={14} weight="duotone" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) {
  return (
    <div className="mode-switch" role="tablist" aria-label="智能体工作视角">
      <button
        role="tab"
        aria-selected={mode === "personal"}
        className={mode === "personal" ? "active" : ""}
        onClick={() => onChange("personal")}
      >
        <House size={15} weight="duotone" />
        个人管家
      </button>
      <button
        role="tab"
        aria-selected={mode === "boss"}
        className={mode === "boss" ? "active" : ""}
        onClick={() => onChange("boss")}
      >
        <ChartLineUp size={15} weight="duotone" />
        老板驾驶舱
      </button>
    </div>
  );
}

function AgentWelcome({ onOpenBoss }: { onOpenBoss: () => void }) {
  return (
    <section className="agent-welcome">
      <div className="welcome-avatar-wrap">
        <AgentAvatar />
        <span className="welcome-live-dot" />
      </div>
      <div className="welcome-copy">
        <div className="eyebrow">
          <span className="eyebrow-dot" />
          演示环境 · Codex + Claude 已接入
        </div>
        <h2>晚上整理，早上只做判断</h2>
        <p>
          把散落在飞书里的资料交给我。我会先整理成可追溯的知识和草稿，涉及发送、改写或正式更新时，再交给你确认。
        </p>
        <div className="welcome-trust">
          <span><ShieldCheck size={14} weight="duotone" /> 原始资料不覆盖</span>
          <span><GitBranch size={14} weight="duotone" /> 版本可回溯</span>
          <button onClick={onOpenBoss}>切换老板视角 <ArrowUpRight size={13} /></button>
        </div>
      </div>
    </section>
  );
}

function InboxCard({
  reviewStarted,
  onStartReview,
}: {
  reviewStarted: boolean;
  onStartReview: () => void;
}) {
  return (
    <section className="surface-card inbox-card">
      <div className="card-heading">
        <div className="card-heading-main">
          <span className="card-icon card-icon-blue"><FolderOpen size={19} weight="duotone" /></span>
          <div>
            <h4>今日收件箱</h4>
            <p>8 条原始资料 · 等待今晚自动整理</p>
          </div>
        </div>
        <Tag tone="low">低风险整理</Tag>
      </div>

      <div className="intake-stats">
        <div><strong>8</strong><span>新增资料</span></div>
        <div><strong>3</strong><span>会议结论</span></div>
        <div><strong>2</strong><span>待确认项</span></div>
        <div><strong>4</strong><span>可生成草稿</span></div>
      </div>

      <div className="inbox-list">
        {inboxItems.map(({ icon: Icon, title, meta, tag, tagTone }) => (
          <div className="inbox-row" key={title}>
            <span className="inbox-row-icon"><Icon size={16} weight="duotone" /></span>
            <div className="inbox-row-copy">
              <strong>{title}</strong>
              <span>{meta}</span>
            </div>
            <Tag tone={tagTone}>{tag}</Tag>
            <CaretRight className="row-arrow" size={16} />
          </div>
        ))}
      </div>

      {!reviewStarted ? (
        <button className="primary-action full-action" onClick={onStartReview}>
          <Lightning size={16} weight="fill" />
          开始晚间复盘
          <span className="action-hint">预计 2 分钟</span>
        </button>
      ) : (
        <div className="review-result">
          <div className="review-result-header">
            <span className="success-mark"><Check size={14} weight="bold" /></span>
            <div><strong>复盘计划已生成</strong><span>将创建索引、草稿和待确认清单，不改动原始资料</span></div>
            <Tag tone="success">可执行</Tag>
          </div>
          <div className="review-flow">
            <span>读取 8 条资料</span><ArrowRight size={14} />
            <span>建立 4 个关联</span><ArrowRight size={14} />
            <span>生成 3 份草稿</span>
          </div>
          <button className="secondary-action" onClick={() => window.alert("演示：审核清单已展开")}>打开审核清单</button>
        </div>
      )}
    </section>
  );
}

function WorkflowCard({
  workflowStarted,
  onRun,
}: {
  workflowStarted: boolean;
  onRun: () => void;
}) {
  return (
    <section className="surface-card workflow-card">
      <div className="card-heading">
        <div className="card-heading-main">
          <span className="card-icon card-icon-purple"><Sparkle size={19} weight="fill" /></span>
          <div>
            <h4>PM 工作流编排</h4>
            <p>把 Skill 串成一条可追踪的交付链</p>
          </div>
        </div>
        <span className="workflow-count">5 个 Skill</span>
      </div>

      <div className="workflow-steps">
        {workflowSteps.map(({ title, note, icon: Icon, color }, index) => (
          <div className={`workflow-step ${workflowStarted && index < 3 ? "done" : ""}`} key={title}>
            <span className={`workflow-step-icon workflow-${color}`}><Icon size={17} weight="duotone" /></span>
            <div><strong>{title}</strong><span>{note}</span></div>
            {index < workflowSteps.length - 1 && <ArrowRight className="workflow-arrow" size={14} />}
          </div>
        ))}
      </div>

      <div className="workflow-bottom">
        <div className="workflow-contract"><CheckCircle size={15} weight="fill" /> 输出包含：任务 · 证据 · 产物 · 下一步 · 风险等级</div>
        {!workflowStarted ? (
          <button className="secondary-action" onClick={onRun}>运行这条工作流 <ArrowRight size={15} /></button>
        ) : (
          <span className="workflow-running"><span className="pulse-dot" /> 已生成 PRD 初稿 · 等待取数</span>
        )}
      </div>
    </section>
  );
}

function PersonalWorkspace({
  reviewStarted,
  workflowStarted,
  onStartReview,
  onRunWorkflow,
  onOpenBoss,
  onSelectSource,
}: {
  reviewStarted: boolean;
  workflowStarted: boolean;
  onStartReview: () => void;
  onRunWorkflow: () => void;
  onOpenBoss: () => void;
  onSelectSource: (label: string) => void;
}) {
  return (
    <>
      <AgentWelcome onOpenBoss={onOpenBoss} />

      <div className="workspace-intro-row">
        <div><span className="section-kicker">PERSONAL PM DESK · 08/27</span><h3>今天，智能体先替你收好这些事</h3></div>
        <ModeSwitch mode="personal" onChange={(next) => { if (next === "boss") onOpenBoss(); }} />
      </div>

      <SourcePills onSelect={onSelectSource} />
      <InboxCard reviewStarted={reviewStarted} onStartReview={onStartReview} />

      <div className="section-heading compact-heading">
        <div><span className="section-kicker">SKILL ORCHESTRATION</span><h3>从一句需求到一套交付物</h3></div>
        <Tag tone="neutral"><GitBranch size={13} /> 可追溯工作流</Tag>
      </div>
      <WorkflowCard workflowStarted={workflowStarted} onRun={onRunWorkflow} />

      <div className="daily-note">
        <BookOpen size={15} weight="duotone" />
        <span>晚间复盘会把 AI 可独立完成的任务放进收件箱，明早你只需要审核、修正和做判断。</span>
      </div>
    </>
  );
}

function MetricCard({
  label,
  value,
  suffix,
  trend,
  tone,
}: {
  label: string;
  value: string;
  suffix?: string;
  trend: string;
  tone: string;
}) {
  return (
    <div className={`metric-card metric-${tone}`}>
      <div className="metric-label"><span className="metric-dot" />{label}</div>
      <div className="metric-value">{value}<small>{suffix}</small></div>
      <div className="metric-trend"><TrendUp size={13} weight="bold" /> {trend}</div>
    </div>
  );
}

function BossDashboard({
  sendStatus,
  onPrepareSend,
  onConfirmSend,
}: {
  sendStatus: SendStatus;
  onPrepareSend: () => void;
  onConfirmSend: () => void;
}) {
  return (
    <>
      <section className="boss-hero">
        <div className="boss-hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> 经营判断 · 数据均来自已授权范围</div>
          <h2>老板驾驶舱</h2>
          <p>一句话看清本周各业务线的上会量、进度和通过率，结论附带口径与来源。</p>
        </div>
        <div className="boss-hero-badge"><ChartLineUp size={27} weight="duotone" /><span>本周<br /><strong>实时汇总</strong></span></div>
      </section>

      <div className="workspace-intro-row boss-intro-row">
        <div><span className="section-kicker">WEEKLY REVIEW · 08/24—08/30</span><h3>需求 FR 会议 · 业务线全景</h3></div>
        <ModeSwitch mode="boss" onChange={() => undefined} />
      </div>

      <div className="filter-row">
        <button className="filter-chip active">本周 08/24—08/30 <CaretRight size={13} /></button>
        <button className="filter-chip">全部业务线 <CaretRight size={13} /></button>
        <button className="filter-chip"><DownloadSimple size={14} /> 导出摘要</button>
        <span className="data-updated"><span className="online-dot" /> 数据更新于 16:20</span>
      </div>

      <div className="metric-grid">
        <MetricCard label="上会需求" value="24" suffix="项" trend="较上周 +4" tone="blue" />
        <MetricCard label="平均进度" value="68" suffix="%" trend="较上周 +6%" tone="purple" />
        <MetricCard label="整体通过率" value="75" suffix="%" trend="较上周 +8%" tone="teal" />
        <MetricCard label="待决策事项" value="5" suffix="项" trend="需要关注" tone="orange" />
      </div>

      <section className="surface-card table-card">
        <div className="table-card-heading">
          <div><h4>业务线 / PM 明细</h4><p>已按上会数量降序排列 · 4 个业务线</p></div>
          <button className="icon-button" aria-label="查看明细"><DotsThreeVertical size={18} /></button>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>业务线</th><th>负责人</th><th>上会数</th><th>当前进度</th><th>通过率</th><th /></tr></thead>
            <tbody>
              {businessRows.map((row) => (
                <tr key={row.line}>
                  <td><span className={`line-mark line-${row.tone}`} /> <strong>{row.line}</strong></td>
                  <td><span className="owner-avatar">{row.owner.slice(-2)}</span>{row.owner}</td>
                  <td><strong>{row.meetings}</strong> 项</td>
                  <td><div className="progress-cell"><span className="progress-bar"><i style={{ width: `${row.progress}%` }} /></span><b>{row.progress}%</b></div></td>
                  <td><span className={`pass-rate ${row.pass === "60.0%" ? "warning" : ""}`}>{row.pass}</span></td>
                  <td><CaretRight size={15} className="row-arrow" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-source"><ShieldCheck size={14} weight="duotone" /> 来源：本周需求 FR 多维表格 · 指标字典 v1.4 <button>查看口径</button></div>
      </section>

      <section className="insight-grid">
        <div className="insight-card insight-primary">
          <div className="insight-title"><span className="card-icon card-icon-teal"><Lightning size={17} weight="fill" /></span><div><span className="section-kicker">AI 判断</span><h4>优先关注机票线</h4></div><Tag tone="low">需决策</Tag></div>
          <p>机票线通过率为 60%，低于整体 75%。当前有 2 项需求卡在“方案补充”，建议在下次 FR 前确认数据口径。</p>
          <div className="insight-footer"><span><WarningCircle size={14} /> 证据：4 条需求记录</span><button onClick={onPrepareSend}>准备通知 <ArrowRight size={14} /></button></div>
        </div>
        <div className="insight-card insight-secondary">
          <div className="insight-title"><span className="card-icon card-icon-purple"><BookOpen size={17} weight="duotone" /></span><div><span className="section-kicker">指标口径</span><h4>每个结论都有出处</h4></div></div>
          <p>上会数按会议记录中的“已上会”状态统计；通过率 = 已通过需求 ÷ 已完成评审需求。</p>
          <button className="text-action"><Eye size={14} /> 展开完整定义</button>
        </div>
      </section>

      {sendStatus !== "idle" && (
        <section className={`send-review-card ${sendStatus === "confirmed" ? "send-confirmed" : ""}`}>
          <div className="send-review-heading"><span className="card-icon card-icon-orange"><Bell size={18} weight="duotone" /></span><div><h4>{sendStatus === "confirmed" ? "通知草稿已留档" : "发送前确认"}</h4><p>{sendStatus === "confirmed" ? "演示已完成，消息未真实发送。" : "这是一个写操作，先确认收件人、内容和影响范围。"}</p></div><button className="icon-button" onClick={() => undefined} aria-label="关闭"><span aria-hidden="true">×</span></button></div>
          <div className="recipient-row"><span>收件人</span><Tag tone="neutral">PM-03 · 机票线负责人</Tag><Tag tone="neutral">业务线群 · 需求 FR</Tag></div>
          <div className="message-draft"><span>消息草稿</span><p>【进度提醒】本周机票线需求通过率为 60%，有 2 项需求待补充方案，请在周五 FR 前更新。</p></div>
          {sendStatus === "preview" && <div className="send-actions"><button className="secondary-action" onClick={onPrepareSend}><NotePencil size={15} /> 编辑草稿</button><button className="primary-action" onClick={onConfirmSend}><ShieldCheck size={15} /> 确认发送（演示）</button></div>}
        </section>
      )}

      <div className="daily-note"><ShieldCheck size={15} weight="duotone" /><span>写操作默认停在确认卡：真实系统中，未点击确认前不会修改正式文档或发送消息。</span></div>
    </>
  );
}

function ConversationPreview({ onBack }: { onBack: () => void }) {
  return (
    <div className="conversation-preview">
      <div className="preview-empty-icon"><ChatCircleDots size={26} weight="duotone" /></div>
      <h2>这是一个脱敏的演示会话</h2>
      <p>本页面只在“爆炒空心菜的飞书 CLI”会话中展示智能体能力。</p>
      <button className="primary-action" onClick={onBack}>回到智能体会话 <ArrowRight size={15} /></button>
    </div>
  );
}

export default function Home() {
  const [activeNav, setActiveNav] = useState<NavId>("messages");
  const [selectedConversation, setSelectedConversation] = useState("agent");
  const [mode, setMode] = useState<Mode>("personal");
  const [reviewStarted, setReviewStarted] = useState(false);
  const [workflowStarted, setWorkflowStarted] = useState(false);
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const [input, setInput] = useState("");
  const [attachedFile, setAttachedFile] = useState("");
  const [toast, setToast] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const openBossMode = () => {
    setMode("boss");
    setActiveNav("tables");
    setSelectedConversation("agent");
  };

  const openPersonalMode = () => {
    setMode("personal");
    setActiveNav("messages");
    setSelectedConversation("agent");
  };

  const handleNavClick = (item: NavItem) => {
    setActiveNav(item.id);
    if (item.id === "messages") {
      openPersonalMode();
      return;
    }
    if (item.id === "tables") {
      openBossMode();
      return;
    }
    showToast(`${item.label}已保留飞书原生入口，智能体演示聚焦于消息会话`);
  };

  const handleConversationClick = (conversationId: string) => {
    setSelectedConversation(conversationId);
    if (conversationId !== "agent") showToast("该会话使用脱敏占位内容，智能体能力只在 CLI 会话中展示");
  };

  const handleFilePick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAttachedFile(file.name);
    showToast(`已加入收件箱：${file.name}`);
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text) {
      showToast("先输入一句想交给智能体处理的事");
      return;
    }

    const assistantText = text.includes("通过率") || text.includes("上会")
      ? "我会读取本周需求 FR 多维表格，先返回指标、口径和来源；如果你要通知负责人，我会先生成确认卡。"
      : text.includes("复盘") || text.includes("收件箱")
        ? "收到。我会把原始资料和 AI 派生结果分开整理，输出可审核的索引、待办和草稿。"
        : "收到。我会先拆解任务、标注证据与风险，再把可执行的下一步放进结果卡。";

    setChatMessages((current) => [
      ...current,
      { id: `${Date.now()}-user`, role: "user", text },
      { id: `${Date.now()}-assistant`, role: "assistant", text: assistantText, detail: "演示响应 · 未调用真实飞书数据" },
    ]);
    setInput("");
    setAttachedFile("");
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <main className="app-frame">
      <aside className="app-rail">
        <button className="profile-orb" aria-label="打开个人菜单" onClick={() => showToast("演示账号：产品经理 · 工作台")}>Z</button>
        <button className="rail-search" onClick={() => showToast("搜索已打开：可搜索会话、文档和智能体")} aria-label="搜索">
          <MagnifyingGlass size={19} weight="bold" />
          <span>搜索</span>
          <kbd>⌘ K</kbd>
        </button>

        <nav className="rail-nav" aria-label="应用导航">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`rail-item ${activeNav === item.id ? "active" : ""}`}
                onClick={() => handleNavClick(item)}
                aria-current={activeNav === item.id ? "page" : undefined}
              >
                <span className="rail-icon-wrap"><Icon size={20} weight={activeNav === item.id ? "fill" : "duotone"} />{item.badge && <b>{item.badge}</b>}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="rail-bottom">
          <button className="rail-item" onClick={() => showToast("近期下载：暂无新文件")}><span className="rail-icon-wrap"><DownloadSimple size={20} weight="duotone" /></span><span>下载</span></button>
          <button className="rail-item" onClick={() => showToast("工作台设置已打开")}><span className="rail-icon-wrap"><Gear size={20} weight="duotone" /></span><span>设置</span></button>
        </div>
      </aside>

      <aside className="conversation-pane">
        <div className="conversation-header">
          <div className="conversation-title"><ChatCircleDots size={25} weight="duotone" /><h1>消息</h1><span className="unread-badge">8</span></div>
          <div className="conversation-actions"><button className="icon-button" aria-label="新建会话" onClick={() => showToast("新会话已准备：选择一个智能体开始")}><Plus size={20} weight="bold" /></button><button className="icon-button" aria-label="更多消息设置" onClick={() => showToast("消息筛选已打开")}><DotsThreeVertical size={19} /></button></div>
        </div>

        <div className="conversation-tabs"><button className="active">全部</button><button onClick={() => showToast("未读会话已筛选")}>未读 <span>8</span></button><button onClick={() => showToast("已置顶会话已筛选")}>置顶</button></div>

        <div className="conversation-list">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              className={`conversation-item ${selectedConversation === conversation.id ? "selected" : ""}`}
              onClick={() => handleConversationClick(conversation.id)}
            >
              <ConversationAvatar tone={conversation.tone} />
              <span className="conversation-copy"><strong>{conversation.title}</strong><span>{conversation.preview}</span></span>
              <span className="conversation-meta"><time>{conversation.time}</time>{conversation.status && <Tag tone="agent-tag">{conversation.status}</Tag>}</span>
            </button>
          ))}
        </div>

        <div className="conversation-footer"><span className="online-dot" /> 已同步 6 个会话 <button onClick={() => showToast("同步完成")}>刷新</button></div>
      </aside>

      <section className="chat-shell">
        <header className="chat-topbar">
          <div className="chat-title-block">
            <ConversationAvatar tone={selectedConversation === "agent" ? "agent" : "team"} />
            <div><h1>{selectedConversation === "agent" ? "爆炒空心菜的飞书 CLI" : conversations.find((item) => item.id === selectedConversation)?.title}</h1><p>{selectedConversation === "agent" ? "智能体 · 在线" : "飞书会话 · 脱敏演示"}</p></div>
            {selectedConversation === "agent" && <Tag tone="agent-tag">智能体</Tag>}
          </div>
          <div className="chat-top-actions">
            <button className="top-action" aria-label="查看会话信息" onClick={() => showToast("会话信息：演示模式，不连接真实账号")}><Eye size={20} /></button>
            <button className="top-action" aria-label="搜索会话" onClick={() => showToast("在当前会话中搜索")}><MagnifyingGlass size={20} /></button>
            <button className="top-action" aria-label="添加成员" onClick={() => showToast("智能体会话暂不添加成员")}><UsersThree size={20} /></button>
            <button className="top-action" aria-label="编辑会话" onClick={() => showToast("会话名称由演示配置固定")}><NotePencil size={20} /></button>
            <button className="top-action" aria-label="设置" onClick={() => showToast("智能体设置已打开")}><Gear size={20} /></button>
          </div>
        </header>

        {selectedConversation !== "agent" ? (
          <div className="chat-body"><ConversationPreview onBack={() => { setSelectedConversation("agent"); setMode("personal"); setActiveNav("messages"); }} /></div>
        ) : (
          <div className="chat-body">
            <div className="chat-stream">
              <div className="date-divider"><span>8月27日</span></div>
              {mode === "personal" ? (
                <PersonalWorkspace
                  reviewStarted={reviewStarted}
                  workflowStarted={workflowStarted}
                  onStartReview={() => { setReviewStarted(true); showToast("晚间复盘计划已生成"); }}
                  onRunWorkflow={() => { setWorkflowStarted(true); showToast("工作流开始运行：先生成 PRD 草稿"); }}
                  onOpenBoss={openBossMode}
                  onSelectSource={(label) => showToast(`${label}：演示中显示已授权来源`)}
                />
              ) : (
                <>
                  <div className="boss-mode-switch"><ModeSwitch mode="boss" onChange={(next) => { if (next === "personal") openPersonalMode(); }} /></div>
                  <BossDashboard sendStatus={sendStatus} onPrepareSend={() => { setSendStatus("preview"); showToast("已生成发送前确认卡"); }} onConfirmSend={() => { setSendStatus("confirmed"); showToast("演示完成：消息未真实发送"); }} />
                </>
              )}

              {chatMessages.length > 0 && (
                <div className="chat-messages" aria-live="polite">
                  {chatMessages.map((message) => (
                    <div className={`message-row ${message.role}`} key={message.id}>
                      {message.role === "assistant" && <AgentAvatar small />}
                      <div className="message-content"><div className="message-bubble">{message.text}</div>{message.detail && <span className="message-detail">{message.detail}</span>}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="composer-wrap">
          <div className="composer">
            <div className="composer-tools">
              <label className="composer-tool" title="添加附件"><Paperclip size={19} /><input type="file" onChange={handleFilePick} /></label>
              <button className="composer-tool" title="添加表情" onClick={() => showToast("表情面板已打开")}><Smiley size={19} /></button>
              <button className="composer-tool" title="提及成员" onClick={() => setInput((current) => `${current}@`)}><At size={19} /></button>
              <button className="composer-tool" title="插入快捷操作" onClick={() => showToast("快捷操作：复盘 / 查数 / 生成草稿")}><Plus size={19} /></button>
              <button className="composer-tool" title="语音输入" onClick={() => showToast("演示中暂不录音，直接输入即可")}><Microphone size={19} /></button>
            </div>
            <div className="composer-input-row">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder={mode === "boss" ? "问问本周业务进展、通过率或异常…" : "把想法、文件或一句需求交给智能体…"}
                aria-label="发送给智能体"
              />
              <button className={`send-button ${input.trim() ? "ready" : ""}`} onClick={sendMessage} aria-label="发送"><PaperPlaneTilt size={20} weight="fill" /></button>
            </div>
            <div className="composer-footer"><span>{attachedFile ? `已添加：${attachedFile}` : "Enter 发送 · Shift + Enter 换行"}</span><span><ShieldCheck size={13} /> 演示模式 · 不会真实读取或发送</span></div>
          </div>
        </div>
      </section>

      {toast && <div className="toast" role="status"><CheckCircle size={16} weight="fill" />{toast}</div>}
    </main>
  );
}
