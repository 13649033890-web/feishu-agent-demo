import { useState } from "react";
import {
  ArrowRight,
  ChartLineUp,
  CheckCircle,
  ClipboardText,
  Sparkle,
} from "@phosphor-icons/react";

type View = "personal" | "boss";

export default function Home() {
  const shellPath = window.location.pathname.startsWith("/feishu-agent-demo")
    ? "/feishu-agent-demo/feishu-shell.png"
    : "/feishu-shell.png";
  const [view, setView] = useState<View>("personal");
  const [reviewReady, setReviewReady] = useState(false);
  const [notice, setNotice] = useState("");

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2400);
  };

  return (
    <main className="demo-stage">
      <div className="feishu-window">
        <img
          className="feishu-shell"
          src={shellPath}
          alt="脱敏的飞书桌面端演示界面"
        />

        <section className="agent-workspace" aria-label="智能体工作区">
          {view === "personal" ? (
            <div className="agent-card">
              <div className="agent-card-heading">
                <span className="agent-card-icon"><Sparkle size={17} weight="fill" /></span>
                <div>
                  <strong>个人 PM 管家</strong>
                  <span>今晚整理，明早只做判断</span>
                </div>
                <span className="demo-tag">演示</span>
              </div>

              {!reviewReady ? (
                <>
                  <p className="agent-card-copy">
                    今日已归集 8 条资料：会议结论、项目背景和待确认事项。我会生成可追溯的索引与草稿，不修改原始资料。
                  </p>
                  <div className="agent-checklist">
                    <span><CheckCircle size={15} weight="fill" /> 3 条会议结论</span>
                    <span><CheckCircle size={15} weight="fill" /> 2 项待确认</span>
                    <span><CheckCircle size={15} weight="fill" /> 4 份草稿</span>
                  </div>
                  <div className="agent-actions">
                    <button
                      className="agent-primary"
                      onClick={() => {
                        setReviewReady(true);
                        showNotice("晚间复盘计划已生成");
                      }}
                    >
                      <ClipboardText size={16} weight="fill" />
                      开始晚间复盘
                    </button>
                    <button className="agent-secondary" onClick={() => setView("boss")}>
                      老板驾驶舱 <ArrowRight size={15} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="review-summary">
                    <span><CheckCircle size={18} weight="fill" /></span>
                    <div>
                      <strong>复盘计划已生成</strong>
                      <p>将建立 4 个关联、生成 3 份草稿，并保留所有原始资料。</p>
                    </div>
                  </div>
                  <div className="agent-actions">
                    <button className="agent-secondary" onClick={() => showNotice("审核清单已展开（演示）")}>
                      查看审核清单 <ArrowRight size={15} />
                    </button>
                    <button className="agent-secondary" onClick={() => setView("boss")}>
                      老板驾驶舱 <ChartLineUp size={15} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="agent-card boss-card">
              <div className="agent-card-heading">
                <span className="agent-card-icon agent-card-icon-blue"><ChartLineUp size={18} weight="fill" /></span>
                <div>
                  <strong>老板驾驶舱</strong>
                  <span>本周需求 FR · 脱敏模拟数据</span>
                </div>
                <span className="demo-tag">本周</span>
              </div>
              <div className="metric-row">
                <span><b>24</b><small>上会需求</small></span>
                <span><b>68%</b><small>平均进度</small></span>
                <span><b>75%</b><small>通过率</small></span>
              </div>
              <p className="agent-card-copy">机票线通过率为 60%，有 2 项需求待补充方案；建议在下次 FR 前确认数据口径。</p>
              <div className="agent-actions">
                <button className="agent-primary" onClick={() => showNotice("已生成发送前确认卡（演示）")}>
                  准备通知 <ArrowRight size={15} />
                </button>
                <button className="agent-secondary" onClick={() => setView("personal")}>
                  返回个人管家
                </button>
              </div>
            </div>
          )}
        </section>

        {notice && <div className="agent-toast" role="status"><CheckCircle size={16} weight="fill" />{notice}</div>}
      </div>
    </main>
  );
}
