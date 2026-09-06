/// <reference types="vite/client" />
/* eslint-disable @next/next/no-img-element -- Vite serves these small local PNG assets directly; no Next image server is used. */
/* Native elements and individual assets; deliberately no chat state or handlers. */
import { BellSlash, CaretDown, ListDashes, MagnifyingGlass, PlusCircle } from '@phosphor-icons/react';
import './feishu-sidebar.css';

const asset = (name: string) => `${import.meta.env.BASE_URL}feishu-avatars/${name}.png`;

const navigation = [
  ['messages', '消息'], ['docs', '云文档'], ['calendar', '日历'],
  ['tables', '多维表格'], ['tasks', '任务'], ['contacts', '联系人'],
  ['meetings', '视频会议'], ['favorites', '收藏'], ['otp', 'OTP'],
  ['search', 'Q全局搜索'], ['partner', '豆包工作伙伴'], ['more', '更多'],
  ['doubao', '豆包工作'], ['apps', '应用中心'], ['workbench', '工作台'],
  ['approval', '审批'],
];

const threads: { avatar: string; title: string; preview: string; time: string; tag?: string; tagTone?: string; unread?: string; muted?: boolean }[] = [
  { avatar: 'landscape', title: '张家琴zhang', preview: '[图片]', time: '13:48' },
  { avatar: 'secondhand', title: 'Q二手闲置群', preview: '白晶 撤回了一条消息', time: '12:52', muted: true },
  { avatar: 'alerts', title: '大搜线上自动报警群', preview: '酒店搜索工程 - 交个朋友热线：【s...', time: '11:01', unread: '71', muted: true },
  { avatar: 'assistant', title: '张家琴zhang的智能伙...', preview: '工作简报 · 9月6日（周日） 一、昨日小结...', time: '08:04', tag: '智能体', tagTone: 'agent' },
  { avatar: 'ai', title: 'AI睡不着 | 开放型社区', preview: '崔宸: 有点强啊，GPT真回来了终于不用忍...', time: '昨天', tag: '公开', tagTone: 'public' },
  { avatar: 'coupons', title: '赠券问题咨询', preview: '赠券失败问题反馈: @张家琴zhang> 领取...', time: '昨天' },
  { avatar: 'pmo', title: '项目小助手', preview: '【已延期】PMO: FD-428118 （ http://pm...', time: '昨天', tag: '机器人', tagTone: 'bot' },
  { avatar: 'hongmeng', title: '鸿蒙发布', preview: '关安心: @张赛赛 合下release再打...', time: '昨天', tag: '公开', tagTone: 'public', muted: true },
  { avatar: 'public-product', title: '公共产品', preview: '范文慧: 范文慧今日居家日报：1、无行...', time: '9月4日' },
  { avatar: 'aigc', title: 'AIGC相关问题群', preview: '', time: '9月4日' },
];

function Avatar({ name, label }: { name: string; label: string }) {
  return name === 'aigc'
    ? <span className="fs-avatar fs-aigc" aria-label={label}>AIGC<br />相关</span>
    : <img className="fs-avatar" src={asset(name)} alt={label} draggable={false} />;
}

export default function FeishuSidebar() {
  return <>
    <aside className="app-rail fs-rail" aria-label="飞书导航">
      <div className="fs-profile-row">
        <Avatar name="landscape" label="个人头像" />
        <PlusCircle size={19} aria-label="新建" />
      </div>
      <div className="fs-search"><MagnifyingGlass size={17} /><span>搜索 (Ctrl + K)</span></div>
      <nav className="fs-navigation" aria-label="应用导航">
        {navigation.map(([id, label]) => <div key={id}
          className={`fs-nav-item${id === 'messages' ? ' fs-current' : ''}${['doubao', 'apps', 'workbench'].includes(id) ? ' fs-indented' : ''}`}
          aria-current={id === 'messages' ? 'page' : undefined}>
          {id === 'more' ? <span className="fs-more"><CaretDown size={12} weight="fill" /></span>
            : <img className="fs-nav-icon" src={asset(`nav-${id}`)} alt="" draggable={false} />}
          <span className="fs-nav-label">{label}</span>
          {id === 'messages' && <span className="fs-nav-badge">1</span>}
        </div>)}
      </nav>
    </aside>
    <aside className="conversation-pane fs-conversations" aria-label="会话列表">
      <div className="fs-list-heading"><ListDashes size={19} /><h1>消息</h1></div>
      <div className="fs-shortcuts" aria-label="常用会话">
        {[['landscape', '张家琴zh'], ['ma', '马树更'], ['landscape', '爆炒空心菜']].map(([name, label], index) =>
          <div className={`fs-shortcut${index === 2 ? ' fs-shortcut-current' : ''}`} key={label}>
            <Avatar name={name} label={`${label}头像`} /><span>{label}</span>
          </div>)}
      </div>
      <div className="fs-thread-list" role="list" tabIndex={0} aria-label="会话，可滚动查看">
        {threads.map(thread => <div className="fs-thread" key={thread.title} role="listitem">
          <div className="fs-thread-avatar"><Avatar name={thread.avatar} label={`${thread.title}头像`} />
            {thread.unread && <span className="fs-unread">{thread.unread}</span>}
          </div>
          <div className="fs-thread-content">
            <div className="fs-thread-top"><span className="fs-thread-title">{thread.title}</span>
              {thread.tag && <span className={`fs-tag fs-tag-${thread.tagTone}`}>{thread.tag}</span>}
              <time>{thread.time}</time>
            </div>
            <div className="fs-thread-bottom"><span>{thread.preview}</span>{thread.muted && <BellSlash size={13} aria-label="已静音" />}</div>
          </div>
        </div>)}
      </div>
    </aside>
  </>;
}
