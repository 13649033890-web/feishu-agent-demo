"use client";

import {
  type ChangeEvent,
  type ElementType,
  type KeyboardEvent,
  useRef,
  useState,
} from "react";
import {
  Article,
  ArrowCounterClockwise,
  ArrowRight,
  ArrowUpRight,
  ArrowsOut,
  At,
  Bell,
  BookOpen,
  CalendarBlank,
  CaretDown,
  CaretRight,
  ChartLineUp,
  Check,
  CheckCircle,
  CheckSquare,
  ChatCircleDots,
  ClipboardText,
  ClockCounterClockwise,
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
  NotePencil,
  PaperPlaneTilt,
  Plus,
  Robot,
  Scissors,
  ShieldCheck,
  Smiley,
  Sparkle,
  Star,
  Table,
  TextAa,
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

type ScriptStage = "skill" | "workflow" | "agent";

type ScriptDetail =
  | { kind: "table"; headers: string[]; rows: string[][]; note?: string }
  | { kind: "steps"; steps: { title: string; note: string }[] }
  | { kind: "outline"; items: string[] };

type OutputAttachment = { name: string; excerpt: string[] };

type ScriptCardPayload = {
  nodeId: string;
  stage: ScriptStage;
  stageLabel: string;
  summary: string;
  detail: ScriptDetail;
  invoking?: boolean;
  invokeName?: string;
  durationLabel?: string;
  thinkingSteps?: string[];
  outputAttachment?: OutputAttachment;
};

type ScriptNode = {
  id: string;
  stage: ScriptStage;
  stageLabel: string;
  quickLabel: string;
  slug: string;
  sampleInput: string;
  keywords: string[];
  summary: string;
  detail: ScriptDetail;
  thinkingSteps?: string[];
  inputAttachment?: string;
  outputAttachment?: OutputAttachment;
};

type ChatMessage = {
  id: string;
  role: MessageRole;
  text: string;
  detail?: string;
  card?: ScriptCardPayload;
  attachment?: string;
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
    title: "飞书智能体演示",
    preview: "我把今天新增的 8 条资料整理好了",
    time: "刚刚",
    tone: "agent",
    status: "智能体",
  },
  {
    id: "weekly",
    title: "产品运营周报",
    preview: "本周进展已整理，待你审核",
    time: "12:01",
    tone: "doc",
    status: "",
  },
  {
    id: "review",
    title: "公共产品通知",
    preview: "本次功能更新已同步",
    time: "11:10",
    tone: "label-orange",
    label: "公共品",
    status: "",
  },
  {
    id: "data",
    title: "运营协作群",
    preview: "运营团队日常协作与沟通",
    time: "昨天",
    tone: "label-blue",
    label: "运营协作",
    status: "",
  },
  {
    id: "archive",
    title: "数据分析小组",
    preview: "数据分析与指标讨论",
    time: "昨天",
    tone: "folder",
    status: "",
  },
  {
    id: "ops",
    title: "项目管理助手",
    preview: "请及时跟进任务进度",
    time: "8月26日",
    tone: "label-navy",
    label: "PMO",
    status: "机器人",
    tagTone: "orange",
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

// 脚本化演示引擎的触发映射表（DEMO_SCRIPT_ENGINE_SPEC.md 2.2 节）。
// 只改这里就能调整关键词和文案，不需要碰下面的匹配/渲染逻辑。
// Skill 进快捷指令 tab；工作流 + Agent 进任务 tab（见 composer 里的两个 tab）。
const skillNodes: ScriptNode[] = [
  {
    id: "skill-ab-test",
    stage: "skill",
    stageLabel: "Skill",
    quickLabel: "AB 实验分析",
    slug: "AB-Skill",
    sampleInput: "请你调用AB Skill，为我分析本次实验数据，需要看整体和分业务线和老客与老客三个分类",
    keywords: ["AB 实验", "实验分析", "AB实验", "AB-Skill", "AB Skill"],
    summary: "AB 实验分析已完成",
    inputAttachment: "AB实验-分页面-分意图-分业务线-天_20260826160522.xlsx",
    outputAttachment: {
      name: "已接微服务意图词条拓展结论_更新版.docx",
      excerpt: [
        "实验号 260730_co_other_city_num：评估 suggestion 页词条数量由 15 增加至 18 的效果",
        "整体订单量涨了 114.1 单/天，展示 UV 基本持平（微降 0.45%）",
        "点击-订单转化率涨了 0.11 个百分点，S2O 涨了 0.05 个百分点",
      ],
    },
    detail: {
      kind: "table",
      headers: ["指标", "A 组（原策略）", "B 组（新策略）"],
      rows: [
        ["样本量", "6,240", "6,240"],
        ["转化率", "18.4%", "21.7%"],
        ["显著性", "—", "p < 0.01"],
      ],
      note: "结论：B 组策略提升明显，建议下周全量。",
    },
  },
  {
    id: "skill-sql",
    stage: "skill",
    stageLabel: "Skill",
    quickLabel: "坑位取数",
    slug: "bigsearch-weekly-sql",
    sampleInput: "使用 $bigsearch-weekly-sql，更新2026.8.10截至8月26日的周 数据",
    keywords: ["取数", "坑位数据", "曝光点击", "bigsearch-weekly-sql"],
    summary: "取数已完成，结果表已生成",
    detail: {
      kind: "table",
      headers: ["坑位 ID", "曝光", "点击", "点击率"],
      rows: [
        ["PID-0231", "128,400", "9,760", "7.6%"],
        ["PID-0245", "96,120", "5,180", "5.4%"],
        ["PID-0312", "71,900", "6,530", "9.1%"],
      ],
      note: "数据来源：演示环境模拟结果，非真实取数。",
    },
  },
  {
    id: "skill-prd",
    stage: "skill",
    stageLabel: "Skill",
    quickLabel: "PRD 大纲",
    slug: "prd-outline",
    sampleInput: "帮我起一版需求文档的大纲",
    keywords: ["PRD", "需求文档", "prd-outline"],
    summary: "PRD 大纲已生成",
    detail: {
      kind: "outline",
      items: [
        "背景与问题：现状数据 + 用户反馈摘要",
        "目标与范围：本期要解决什么、不做什么",
        "方案设计：核心流程与关键交互",
        "数据埋点：需要新增的指标与事件",
        "风险与排期：依赖项、里程碑",
      ],
    },
  },
];

const taskNodes: ScriptNode[] = [
  {
    id: "workflow-query-fetch",
    stage: "workflow",
    stageLabel: "工作流",
    quickLabel: "今日query抓取",
    slug: "query-fetch-workflow",
    sampleInput: "帮我抓取一下今天的搜索 query",
    keywords: ["今日query抓取", "query抓取", "抓取query", "搜索query", "query-fetch-workflow"],
    summary: "今日 query 抓取工作流已完成",
    detail: {
      kind: "steps",
      steps: [
        { title: "抓取来源", note: "站内搜索日志 · 今日 00:00 至当前" },
        { title: "筛选逻辑", note: "按搜索量降序 · 过滤测试与内部账号 · 归并同义 query" },
        { title: "结果摘要", note: "共抓取 128 条有效 query，Top 5 已生成榜单，3 条为新增热搜" },
      ],
    },
  },
  {
    id: "agent-daily-report",
    stage: "agent",
    stageLabel: "Agent",
    quickLabel: "查看今日日报",
    slug: "daily-report-agent",
    sampleInput: "帮我看下今日日报",
    keywords: ["今日日报", "查看日报", "日报", "daily-report-agent"],
    summary: "今日日报已生成",
    detail: {
      kind: "outline",
      items: [
        "项目进展：FD-430797 审批通过，已新建 PMO 项目群",
        "日程：晚间 19:30-21:30 团队聚会，无会议冲突",
        "未处理待办：2 条待推进、1 条待他人回复",
        "今日规划：已按优先级排好 4 项待办",
      ],
    },
  },
  {
    id: "agent-weekly-report",
    stage: "agent",
    stageLabel: "Agent",
    quickLabel: "完成本周周报",
    slug: "weekly-report-agent",
    sampleInput: "帮我写一下本周周报",
    keywords: ["本周周报", "写周报", "周报", "weekly-report-agent"],
    summary: "本周周报初稿已生成",
    detail: {
      kind: "outline",
      items: [
        "本周进展摘要：3 个项目关键节点已完成",
        "关键指标变化：核心转化率环比 +2.3%",
        "风险与待办：2 项待跟进事项已标注负责人",
        "下周计划：优先推进 FD-430797 与 PRD 评审",
      ],
    },
  },
  {
    id: "agent-prd-analysis",
    stage: "agent",
    stageLabel: "Agent",
    quickLabel: "新建需求分析",
    slug: "qunar-write-prd",
    sampleInput:
      "请你调用qunar-write-prd为我完成一份需要文档，如果无法调用请直接告知，这个需求简要概括就是热门推荐现在没有租车的词条，V3接口（用户历史行为接口）现在有租车的数据了，点击数据里带了租车的点击还有城市信息，即多增加召回数据，但是排序规则不变。具体我将附上聊天记录供你参考",
    keywords: ["新建需求分析", "需求分析", "qunar-write-prd"],
    summary: "需求分析文档已创建",
    inputAttachment: "产品需求讨论_聊天记录.txt",
    outputAttachment: {
      name: "【PRD需求文档】大搜中间页热门推荐新增租车召回.docx",
      excerpt: [
        "核心结论：热门推荐新增租车行为召回，仅使用点击、订单、支付三类有效行为；搜索行为不接入",
        "排序规则不变：新增候选与其他业务候选共同参与现有排序，不修改排序特征、权重、展示位",
        "验收方式：AB 实验 · 租车词条点击率、订单转化率，连续 14 个自然日观察",
      ],
    },
    detail: {
      kind: "steps",
      steps: [
        { title: "背景梳理", note: "热门推荐尚未消费租车用户行为，V3 接口已覆盖租车点击/订单/支付，具备接入条件" },
        { title: "方案确认", note: "仅新增候选来源，不改动排序规则、权重与展示位" },
        { title: "下一步", note: "已生成待评审 PRD 初稿，等待你确认" },
      ],
    },
  },
];

const scriptNodes: ScriptNode[] = [...skillNodes, ...taskNodes];

function matchScriptNode(text: string): ScriptNode | undefined {
  return scriptNodes.find((node) => node.keywords.some((keyword) => text.includes(keyword)));
}

function defaultThinkingSteps(stage: ScriptStage, label: string): string[] {
  if (stage === "skill") return ["解析关键词并匹配 Skill", `调用 ${label} 处理`, "生成结构化结果"];
  if (stage === "workflow") return ["拆解任务为多个步骤", "按顺序执行工作流节点", "汇总产出并生成结果卡"];
  return ["读取相关飞书数据来源", "生成内容草稿", "整理成可执行的结果"];
}

function randomDurationLabel(): string {
  const minutes = Math.floor(Math.random() * 12) + 1;
  const seconds = Math.floor(Math.random() * 60);
  return `${minutes}m ${seconds}s`;
}

function AgentAvatar({ small = false }: { small?: boolean }) {
  return (
    <span className={`agent-avatar ${small ? "agent-avatar-small" : ""}`} aria-hidden="true">
      <span className="avatar-sun" />
      <span className="avatar-horizon" />
      <Sparkle className="avatar-sparkle" size={small ? 12 : 18} weight="fill" />
    </span>
  );
}

function ConversationAvatar({ tone, label }: { tone: string; label?: string }) {
  if (tone === "agent") return <AgentAvatar small />;

  if (tone.startsWith("label-") && label) {
    return (
      <span className={`conversation-avatar conversation-avatar-${tone}`} aria-hidden="true">
        {label}
      </span>
    );
  }

  const Icon = tone === "doc" ? Article : tone === "folder" ? FolderOpen : UsersThree;

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

const stageIcons: Record<ScriptStage, ElementType> = {
  skill: Lightning,
  workflow: GitBranch,
  agent: Robot,
};

const stageTagTone: Record<ScriptStage, string> = {
  skill: "blue",
  workflow: "purple",
  agent: "agent-tag",
};

// Claude 风格的"已处理 Xs"折叠条：调用中显示动效，完成后折叠成耗时摘要，
// 点开可看简短的思考步骤（不代表真实处理时间，仅用于还原飞书智能体的调用观感）。
function ThinkingDisclosure({ card }: { card: ScriptCardPayload }) {
  const [open, setOpen] = useState(false);

  if (card.invoking) {
    return (
      <div className="thinking-disclosure thinking-disclosure-active">
        <span className="thinking-live">
          <span className="thinking-dot" aria-hidden="true" />
          正在思考…
        </span>
      </div>
    );
  }

  return (
    <div className="thinking-disclosure">
      <button className="thinking-disclosure-toggle" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
        已处理 {card.durationLabel}
        <CaretRight className={`script-card-caret ${open ? "open" : ""}`} size={12} />
      </button>
      {open && card.thinkingSteps && card.thinkingSteps.length > 0 && (
        <ul className="thinking-steps">
          {card.thinkingSteps.map((step) => <li key={step}>{step}</li>)}
        </ul>
      )}
    </div>
  );
}

// 输出文档卡片：点开可看脱敏摘要，"在飞书云文档中打开"仅作演示提示（不会跳转真实文档）。
function DocumentCard({
  name,
  excerpt,
  onOpen,
}: {
  name: string;
  excerpt?: string[];
  onOpen: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="document-card">
      <button className="document-card-header" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
        <Article size={15} weight="duotone" />
        <span className="document-card-name">{name}</span>
        <CaretRight className={`script-card-caret ${open ? "open" : ""}`} size={13} />
      </button>
      {open && (
        <div className="document-card-body">
          {excerpt && excerpt.length > 0 ? (
            <ul className="document-card-excerpt">{excerpt.map((line) => <li key={line}>{line}</li>)}</ul>
          ) : (
            <p className="document-card-placeholder">脱敏输入数据 · 仅用于本次分析上下文</p>
          )}
          <button className="text-action" onClick={onOpen}><ArrowUpRight size={13} /> 在飞书云文档中打开</button>
        </div>
      )}
    </div>
  );
}

function ScriptResultCard({
  card,
  expanded,
  onToggle,
}: {
  card: ScriptCardPayload;
  expanded: boolean;
  onToggle: () => void;
}) {
  const StageIcon = stageIcons[card.stage];
  return (
    <div className={`script-card script-card-${card.stage}`}>
      <button className="script-card-summary" onClick={onToggle} aria-expanded={expanded}>
        <span className="script-card-stage-icon"><StageIcon size={13} weight="fill" /></span>
        <Tag tone={stageTagTone[card.stage]}>{card.stageLabel}</Tag>
        <span className="script-card-summary-text">{card.summary}</span>
        <CaretRight className={`script-card-caret ${expanded ? "open" : ""}`} size={13} />
      </button>
      {expanded && (
        <div className="script-card-detail">
          {card.detail.kind === "table" && (
            <>
              <table className="script-card-table">
                <thead>
                  <tr>{card.detail.headers.map((header) => <th key={header}>{header}</th>)}</tr>
                </thead>
                <tbody>
                  {card.detail.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
                  ))}
                </tbody>
              </table>
              {card.detail.note && <p className="script-card-note">{card.detail.note}</p>}
            </>
          )}
          {card.detail.kind === "steps" && (
            <div className="script-card-steps">
              {card.detail.steps.map((step, index) => (
                <div className="script-card-step" key={step.title}>
                  <span className="script-card-step-index">{index + 1}</span>
                  <div><strong>{step.title}</strong><span>{step.note}</span></div>
                </div>
              ))}
            </div>
          )}
          {card.detail.kind === "outline" && (
            <ul className="script-card-outline">
              {card.detail.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function AgentProactiveNote({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  return (
    <div className="message-row assistant agent-proactive-note">
      <AgentAvatar small />
      <div className="message-content">
        <button className="agent-note-summary" onClick={onToggle} aria-expanded={expanded}>
          <span>昨晚整理了 12 条待办，3 条需要你确认</span>
          <CaretRight className={`script-card-caret ${expanded ? "open" : ""}`} size={13} />
        </button>
        {expanded && (
          <div className="script-card-detail agent-note-detail">
            <div className="script-card-steps">
              <div className="script-card-step"><span className="script-card-step-index">1</span><div><strong>会议结论已归档</strong><span>首页搜索改版会议纪要 · 已生成待办 2 条</span></div></div>
              <div className="script-card-step"><span className="script-card-step-index">2</span><div><strong>周报草稿已生成</strong><span>基于本周数据自动填充，等待你审核措辞</span></div></div>
              <div className="script-card-step"><span className="script-card-step-index">3</span><div><strong>1 条异常待确认</strong><span>机票线通过率环比下降，需要你判断是否升级提醒</span></div></div>
            </div>
          </div>
        )}
      </div>
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

function AgentWelcome({
  onOpenBoss,
  onOpenSkills,
  onQuickTip,
}: {
  onOpenBoss: () => void;
  onOpenSkills: () => void;
  onQuickTip: () => void;
}) {
  return (
    <section className="agent-welcome">
      <div className="welcome-avatar-wrap">
        <AgentAvatar />
        <span className="welcome-live-dot" />
      </div>
      <div className="welcome-copy">
        <h2><span className="welcome-wave" aria-hidden="true">👋</span> Hi <span className="welcome-mention">@张家琴zhang</span>，我来上班啦！</h2>
        <p>
          从今天起，你在飞书里多了一位随叫随到的 AI 同事：常规工作直接交给我，遇到复杂需求，我还能拉上 Skill 专家和工作流一起推进。
        </p>
        <ol className="welcome-feature-list">
          <li><strong>日常工作交给我：</strong>取数、PRD 大纲、AB 实验分析，一句话直接开工</li>
          <li><strong>多步任务自动编排：</strong>“今日 query 抓取”这类工作流，一次运行到底</li>
          <li><strong>重要动态我留意：</strong>晚间自动整理收件箱，早上你只需要审核判断</li>
          <li><strong>专属 Agent 随叫随到：</strong>日报、周报、需求分析，一键召唤</li>
        </ol>
        <div className="welcome-actions">
          <button onClick={onOpenSkills}>看看能帮你做什么</button>
          <button onClick={onQuickTip}>零门槛上手</button>
          <button className="welcome-action-primary" onClick={onOpenBoss}>一键召唤专家 <ArrowUpRight size={13} /></button>
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
  showInboxPanel,
  showWorkflowPanel,
  reviewStarted,
  workflowStarted,
  onStartReview,
  onRunWorkflow,
  onOpenBoss,
  onOpenSkills,
  onQuickTip,
  onSelectSource,
}: {
  showInboxPanel: boolean;
  showWorkflowPanel: boolean;
  reviewStarted: boolean;
  workflowStarted: boolean;
  onStartReview: () => void;
  onRunWorkflow: () => void;
  onOpenBoss: () => void;
  onOpenSkills: () => void;
  onQuickTip: () => void;
  onSelectSource: (label: string) => void;
}) {
  return (
    <>
      <AgentWelcome onOpenBoss={onOpenBoss} onOpenSkills={onOpenSkills} onQuickTip={onQuickTip} />

      {showInboxPanel && (
        <>
          <div className="workspace-intro-row">
            <div><span className="section-kicker">PERSONAL PM DESK · 08/27</span><h3>今天，智能体先替你收好这些事</h3></div>
            <ModeSwitch mode="personal" onChange={(next) => { if (next === "boss") onOpenBoss(); }} />
          </div>

          <SourcePills onSelect={onSelectSource} />
          <InboxCard reviewStarted={reviewStarted} onStartReview={onStartReview} />
        </>
      )}

      {showWorkflowPanel && (
        <>
          <div className="section-heading compact-heading">
            <div><span className="section-kicker">SKILL ORCHESTRATION</span><h3>从一句需求到一套交付物</h3></div>
            <Tag tone="neutral"><GitBranch size={13} /> 可追溯工作流</Tag>
          </div>
          <WorkflowCard workflowStarted={workflowStarted} onRun={onRunWorkflow} />
        </>
      )}

      {showInboxPanel && (
        <div className="daily-note">
          <BookOpen size={15} weight="duotone" />
          <span>晚间复盘会把 AI 可独立完成的任务放进收件箱，明早你只需要审核、修正和做判断。</span>
        </div>
      )}
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
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [agentNoteExpanded, setAgentNoteExpanded] = useState(false);
  const [activeQuickTab, setActiveQuickTab] = useState<"skill" | "task" | null>(null);
  const [showInboxPanel, setShowInboxPanel] = useState(false);
  const [showWorkflowPanel, setShowWorkflowPanel] = useState(false);
  const [showAgentNote, setShowAgentNote] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const composerTarget =
    selectedConversation === "agent"
      ? "张家琴的智能体"
      : (conversations.find((item) => item.id === selectedConversation)?.title ?? "智能体");

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

  const clearAgentConversation = () => {
    setChatMessages([]);
    setExpandedCards({});
    setSequenceIndex(0);
    setAgentNoteExpanded(false);
    setActiveQuickTab(null);
    setShowInboxPanel(false);
    setShowWorkflowPanel(false);
    setShowAgentNote(false);
    setReviewStarted(false);
    setWorkflowStarted(false);
    setSendStatus("idle");
    setInput("");
    setAttachedFile("");
  };

  const handleNavClick = (item: NavItem) => {
    setActiveNav(item.id);
    if (item.id === "messages") {
      openPersonalMode();
      clearAgentConversation();
      showToast("会话已清空，可以重新开始演示");
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

  const toggleCard = (id: string) => {
    setExpandedCards((current) => ({ ...current, [id]: !current[id] }));
  };

  // 点击快捷指令 / 任务只是把 "/skill-slug 预置话术" 填进输入框并聚焦（见 prefillComposer），
  // 真正发送后才会走到这里：先弹出"正在思考…"的调用条（参照 Claude 的工具调用样式），
  // 短暂延迟后折叠成"已处理 Xs"，再展开结果卡和产出文档，而不是把文案直接写死成一句话。
  const runScriptedInvocation = (node: ScriptNode, userText?: string) => {
    setActiveQuickTab(null);
    const stamp = Date.now();
    const userId = `${stamp}-user`;
    const assistantId = `${stamp}-assistant`;
    const durationLabel = randomDurationLabel();
    const thinkingSteps = node.thinkingSteps ?? defaultThinkingSteps(node.stage, node.quickLabel);

    setChatMessages((current) => [
      ...current,
      { id: userId, role: "user" as MessageRole, text: userText ?? node.sampleInput, attachment: node.inputAttachment },
      {
        id: assistantId,
        role: "assistant" as MessageRole,
        text: node.stage === "skill" ? "已收到，处理完成：" : node.stage === "workflow" ? "工作流已执行完成：" : "已完成：",
        card: {
          nodeId: node.id,
          stage: node.stage,
          stageLabel: node.stageLabel,
          summary: node.summary,
          detail: node.detail,
          invoking: true,
          invokeName: node.quickLabel,
          durationLabel,
          thinkingSteps,
          outputAttachment: node.outputAttachment,
        },
      },
    ]);

    window.setTimeout(() => {
      setChatMessages((current) =>
        current.map((message) =>
          message.id === assistantId && message.card
            ? { ...message, card: { ...message.card, invoking: false } }
            : message
        )
      );
      if (node.id === "agent-daily-report") revealInbox();
    }, 900);

    const nodeIndex = scriptNodes.findIndex((item) => item.id === node.id);
    if (nodeIndex >= 0) setSequenceIndex((nodeIndex + 1) % scriptNodes.length);
  };

  // 快捷指令 / 任务点击后不再直接发送，只把 "/skill-slug 预置话术" 填进输入框并聚焦，
  // 用户可以在发送前自己编辑（参照 Claude 点击调用后仍可自行输入的交互）。
  const prefillComposer = (node: ScriptNode) => {
    setActiveQuickTab(null);
    setInput(`/${node.slug} ${node.sampleInput}`);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const showPermissionScope = () => {
    setChatMessages((current) => [
      ...current,
      {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        text:
          "知识与信息：训练知识有截止时间，太新的信息需要联网搜索补充；不知道的事我会直说，不会编造。\n" +
          "访问边界：只能访问你所在飞书租户内、你有权限查看的文档和群聊；跨租户或你没有权限的资源我看不到。\n" +
          "写操作：默认停在确认卡，不会自动发送消息或修改正式文档，等你确认后才会执行。",
      },
    ]);
  };

  const revealInbox = () => {
    setShowInboxPanel(true);
    setReviewStarted(true);
  };

  const revealWorkflow = () => {
    setShowWorkflowPanel(true);
    setWorkflowStarted(true);
  };

  const revealAgentNote = () => {
    setShowAgentNote(true);
    showToast("Agent 待办通知已出现");
  };

  // Agent 层待办卡片、晚间复盘、工作流三块面板默认不展示，只有点对应入口或
  // 命中关键词才会出现（页面加载时保持空白会话，贴近真实飞书新会话的样子）。
  const dashboardTriggers: { keywords: string[]; reveal: () => void }[] = [
    { keywords: ["晚间复盘", "收件箱"], reveal: revealInbox },
    { keywords: ["运行工作流", "PM 工作流", "工作流编排"], reveal: revealWorkflow },
    { keywords: ["待办", "查看待办"], reveal: revealAgentNote },
  ];

  // 隐藏容错机制（DEMO_SCRIPT_ENGINE_SPEC.md 3.2）：双击空输入框，或输入固定词“继续”，
  // 不依赖关键词是否命中，直接推进到下一个剧本节点，防止现场卡壳。第一次触发先揭示
  // Agent 待办卡片，之后再按顺序推进 Skill / 工作流节点。
  const forceAdvance = () => {
    if (!showAgentNote) {
      revealAgentNote();
      return;
    }
    const node = scriptNodes[sequenceIndex % scriptNodes.length];
    runScriptedInvocation(node);
    showToast("已推进到下一个演示节点");
  };

  const resetDemo = () => {
    setChatMessages([]);
    setExpandedCards({});
    setSequenceIndex(0);
    setAgentNoteExpanded(false);
    setShowInboxPanel(false);
    setShowWorkflowPanel(false);
    setShowAgentNote(false);
    setReviewStarted(false);
    setWorkflowStarted(false);
    setSendStatus("idle");
    setInput("");
    setAttachedFile("");
    setMode("personal");
    setActiveNav("messages");
    setSelectedConversation("agent");
    setActiveQuickTab(null);
    showToast("演示已重置，可以重新彩排");
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text) {
      showToast("先输入一句想交给智能体处理的事");
      return;
    }

    if (text === "继续") {
      forceAdvance();
      setInput("");
      setAttachedFile("");
      return;
    }

    const dashboardHit = dashboardTriggers.find((entry) => entry.keywords.some((keyword) => text.includes(keyword)));
    if (dashboardHit) {
      dashboardHit.reveal();
      setChatMessages((current) => [...current, { id: `${Date.now()}-user`, role: "user", text }]);
      setInput("");
      setAttachedFile("");
      return;
    }

    const node = matchScriptNode(text);
    if (node) {
      runScriptedInvocation(node, text);
    } else {
      setChatMessages((current) => [
        ...current,
        { id: `${Date.now()}-user`, role: "user", text },
        { id: `${Date.now()}-assistant`, role: "assistant", text: "收到。我会先拆解任务、标注证据与风险，再把可执行的下一步放进结果卡。", detail: "演示响应 · 未调用真实飞书数据" },
      ]);
    }
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
        <button className="rail-add" aria-label="新建" onClick={() => showToast("新建：可发起会话、文档或日程")}>
          <Plus size={15} weight="bold" />
        </button>
        <button className="rail-search" onClick={() => showToast("搜索已打开：可搜索会话、文档和智能体")} aria-label="搜索">
          <MagnifyingGlass size={17} weight="bold" />
          <span>搜索 (Ctrl+K)</span>
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
                <span className="rail-icon-wrap"><Icon size={18} weight={activeNav === item.id ? "fill" : "regular"} /></span>
                <span className="rail-item-label">{item.label}</span>
                {item.badge && <b className="rail-badge">{item.badge}</b>}
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

        <div className="conversation-tabs" aria-label="快捷会话">
          <button className="quick-contact" onClick={() => handleConversationClick("agent")}>
            <span className="quick-contact-avatar quick-contact-scenery" />
            <span>小张</span>
          </button>
          <button className="quick-contact" onClick={() => handleConversationClick("weekly")}>
            <span className="quick-contact-avatar quick-contact-portrait" />
            <span>小朱</span>
          </button>
          <button className="quick-contact" onClick={() => handleConversationClick("agent")}>
            <span className="quick-contact-avatar quick-contact-agent" />
            <span>张家琴的智能体</span>
          </button>
        </div>

        <div className="conversation-list">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              className={`conversation-item ${selectedConversation === conversation.id ? "selected" : ""}`}
              onClick={() => handleConversationClick(conversation.id)}
            >
              <ConversationAvatar tone={conversation.tone} label={conversation.label} />
              <span className="conversation-copy"><strong>{conversation.title}</strong><span>{conversation.preview}</span></span>
              <span className="conversation-meta"><time>{conversation.time}</time>{conversation.status && <Tag tone={conversation.tagTone ?? "agent-tag"}>{conversation.status}</Tag>}</span>
            </button>
          ))}
        </div>

        <div className="conversation-footer"><span className="online-dot" /> 已同步 6 个会话 <button onClick={() => showToast("同步完成")}>刷新</button></div>
      </aside>

      <section className="chat-shell">
        <header className="chat-topbar">
          <div className="agent-header-content">
            <div className="chat-title-block">
              <ConversationAvatar tone={selectedConversation === "agent" ? "agent" : "team"} />
              <div><h1>{selectedConversation === "agent" ? "张家琴的智能体" : conversations.find((item) => item.id === selectedConversation)?.title}</h1><p>{selectedConversation === "agent" ? "智能体 · 在线" : "飞书会话 · 脱敏演示"}</p></div>
              {selectedConversation === "agent" && <Tag tone="agent-tag">智能体</Tag>}
            </div>
            {selectedConversation === "agent" && (
              <nav className="agent-function-tabs" aria-label="智能体功能">
                <button className={mode === "personal" ? "active" : ""} onClick={openPersonalMode}><ChatCircleDots size={15} weight="fill" />消息</button>
                <button onClick={() => { openPersonalMode(); revealInbox(); showToast("晚间复盘计划已生成"); }}><ClipboardText size={15} weight="fill" />晚间复盘</button>
                <button onClick={() => { openPersonalMode(); revealWorkflow(); showToast("工作流已开始：生成 PRD 草稿"); }}><Sparkle size={15} weight="fill" />工作流</button>
                <button className="agent-tab-more" onClick={() => showToast("更多智能体能力后续接入")} aria-label="更多功能"><Plus size={17} /></button>
              </nav>
            )}
          </div>
          <div className="chat-top-actions">
            <button className="top-action" aria-label="会话记录" onClick={() => showToast("会话信息：演示模式，不连接真实账号")}><ClockCounterClockwise size={19} /></button>
            <button className="top-action" aria-label="搜索会话" onClick={() => showToast("在当前会话中搜索")}><MagnifyingGlass size={19} /></button>
            <button className="top-action" aria-label="添加成员" onClick={() => showToast("智能体会话暂不添加成员")}><UsersThree size={19} /></button>
            <button className="top-action" aria-label="编辑会话" onClick={() => showToast("会话名称由演示配置固定")}><NotePencil size={19} /></button>
            <button className="top-action" aria-label="设置" onClick={() => showToast("智能体设置已打开")}><Gear size={19} /></button>
            <button className="top-action" aria-label="重置演示" title="重置演示（用于反复彩排）" onClick={resetDemo}><ArrowCounterClockwise size={19} /></button>
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
                  showInboxPanel={showInboxPanel}
                  showWorkflowPanel={showWorkflowPanel}
                  reviewStarted={reviewStarted}
                  workflowStarted={workflowStarted}
                  onStartReview={() => { setReviewStarted(true); showToast("晚间复盘计划已生成"); }}
                  onRunWorkflow={() => { setWorkflowStarted(true); showToast("工作流开始运行：先生成 PRD 草稿"); }}
                  onOpenBoss={openBossMode}
                  onOpenSkills={() => setActiveQuickTab("skill")}
                  onQuickTip={() => showToast("小技巧：输入关键词或点“快捷指令 / 任务”都能直接触发")}
                  onSelectSource={(label) => showToast(`${label}：演示中显示已授权来源`)}
                />
              ) : (
                <>
                  <div className="boss-mode-switch"><ModeSwitch mode="boss" onChange={(next) => { if (next === "personal") openPersonalMode(); }} /></div>
                  <BossDashboard sendStatus={sendStatus} onPrepareSend={() => { setSendStatus("preview"); showToast("已生成发送前确认卡"); }} onConfirmSend={() => { setSendStatus("confirmed"); showToast("演示完成：消息未真实发送"); }} />
                </>
              )}

              {mode === "personal" && (
                <div className="chat-messages" aria-live="polite">
                  {showAgentNote && (
                    <AgentProactiveNote expanded={agentNoteExpanded} onToggle={() => setAgentNoteExpanded((current) => !current)} />
                  )}
                  {chatMessages.map((message) => (
                    <div className={`message-row ${message.role}`} key={message.id}>
                      {message.role === "assistant" && <AgentAvatar small />}
                      <div className="message-content">
                        {message.attachment && (
                          <span className="input-attachment-chip"><Article size={12} weight="duotone" />{message.attachment}</span>
                        )}
                        {message.card ? (
                          <>
                            <ThinkingDisclosure card={message.card} />
                            {!message.card.invoking && (
                              <>
                                <div className="message-bubble message-bubble-card">{message.text}</div>
                                <ScriptResultCard
                                  card={message.card}
                                  expanded={!!expandedCards[message.id]}
                                  onToggle={() => toggleCard(message.id)}
                                />
                                {message.card.outputAttachment && (
                                  <DocumentCard
                                    name={message.card.outputAttachment.name}
                                    excerpt={message.card.outputAttachment.excerpt}
                                    onOpen={() => showToast("演示：飞书云文档预览已打开（脱敏内容）")}
                                  />
                                )}
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="message-bubble">{message.text}</div>
                            {message.detail && <span className="message-detail">{message.detail}</span>}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="composer-wrap">
          <div className="composer">
            {mode === "personal" && (
              <div className="quick-instruction-bar">
                <div className="quick-tab-row">
                  <button
                    className={`quick-instruction-toggle ${activeQuickTab === "skill" ? "active" : ""}`}
                    onClick={() => setActiveQuickTab((current) => (current === "skill" ? null : "skill"))}
                    aria-expanded={activeQuickTab === "skill"}
                  >
                    <Lightning size={13} weight="fill" />
                    快捷指令
                    <CaretDown size={11} className={activeQuickTab === "skill" ? "open" : ""} />
                  </button>
                  <button
                    className={`quick-instruction-toggle ${activeQuickTab === "task" ? "active" : ""}`}
                    onClick={() => setActiveQuickTab((current) => (current === "task" ? null : "task"))}
                    aria-expanded={activeQuickTab === "task"}
                  >
                    <Robot size={13} weight="fill" />
                    任务
                    <CaretDown size={11} className={activeQuickTab === "task" ? "open" : ""} />
                  </button>
                  <button className="quick-instruction-toggle quick-permission-btn" onClick={showPermissionScope}>
                    <ShieldCheck size={13} weight="fill" />
                    查看权限范围
                  </button>
                </div>
                {activeQuickTab === "skill" && (
                  <div className="quick-instruction-menu">
                    {skillNodes.map((node) => (
                      <button
                        key={node.id}
                        className="quick-instruction-item"
                        onClick={() => prefillComposer(node)}
                      >
                        <Tag tone="blue">{node.stageLabel}</Tag>
                        <span>{node.quickLabel}</span>
                      </button>
                    ))}
                  </div>
                )}
                {activeQuickTab === "task" && (
                  <div className="quick-instruction-menu">
                    {taskNodes.map((node) => (
                      <button
                        key={node.id}
                        className="quick-instruction-item"
                        onClick={() => prefillComposer(node)}
                      >
                        <Tag tone={node.stage === "workflow" ? "purple" : "agent-tag"}>{node.stageLabel}</Tag>
                        <span>{node.quickLabel}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="composer-input-row">
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleInputKeyDown}
                onDoubleClick={() => { if (!input.trim()) forceAdvance(); }}
                placeholder={`发送给 ${composerTarget}`}
                aria-label="发送给智能体"
              />
            </div>
            <div className="composer-tools">
              <div className="composer-tools-left">
                <button className="composer-tool" title="文本格式" onClick={() => showToast("文本格式面板已打开")}><TextAa size={17} /></button>
                <button className="composer-tool" title="添加表情" onClick={() => showToast("表情面板已打开")}><Smiley size={17} /></button>
                <button className="composer-tool" title="提及成员" onClick={() => setInput((current) => `${current}@`)}><At size={17} /></button>
                <button className="composer-tool" title="更多格式" onClick={() => showToast("更多格式操作")}><Scissors size={16} /><CaretDown size={9} /></button>
                <label className="composer-tool" title="添加附件"><Plus size={18} /><input type="file" onChange={handleFilePick} /></label>
              </div>
              <div className="composer-tools-right">
                <button className="composer-tool" title="展开" onClick={() => showToast("展开输入框")}><ArrowsOut size={15} /></button>
                <div className="send-split">
                  <button className={`send-button ${input.trim() ? "ready" : ""}`} onClick={sendMessage} aria-label="发送"><PaperPlaneTilt size={16} weight="fill" /></button>
                  <button className="send-caret" aria-label="发送选项" onClick={() => showToast("发送选项：定时发送")}><CaretDown size={10} weight="bold" /></button>
                </div>
              </div>
            </div>
            <div className="composer-footer"><span>{attachedFile ? `已添加：${attachedFile}` : "Enter 发送 · Shift + Enter 换行"}</span><span><ShieldCheck size={13} /> 演示模式 · 不会真实读取或发送</span></div>
          </div>
        </div>
      </section>

      {toast && <div className="toast" role="status"><CheckCircle size={16} weight="fill" />{toast}</div>}
    </main>
  );
}
