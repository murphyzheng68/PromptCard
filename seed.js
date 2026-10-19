/**
 * PromptCard 种子数据脚本
 * 用法: node seed.js
 * 作用: 往数据库里塞几张示例提示词卡片，让首次启动就能看到内容
 */
const Database = require('better-sqlite3');
const { mkdirSync, existsSync } = require('fs');
const { dirname, join } = require('path');

const DB_PATH = join(__dirname, 'data', 'promptcard.sqlite');
mkdirSync(dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    description TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    model TEXT DEFAULT '',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS card_versions (
    id TEXT PRIMARY KEY,
    card_id TEXT NOT NULL,
    content TEXT NOT NULL,
    version_note TEXT DEFAULT '',
    created_at INTEGER NOT NULL,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_cards_updated ON cards(updated_at DESC);
  CREATE INDEX IF NOT EXISTS idx_card_versions_card ON card_versions(card_id, created_at DESC);
`);

const now = Date.now();
const seed = [
  {
    id: 'seed-1',
    title: '万能写作助手',
    content: '你是一位资深内容创作者。请根据以下主题写一篇高质量的文章：\n\n主题：{topic}\n\n要求：\n1. 结构清晰，分段明确\n2. 语言生动，避免套话\n3. 字数控制在 {words} 字左右\n4. 结尾给出一句可传播的金句',
    description: '填入主题和字数，即可生成结构完整的文章',
    tags: ['写作', '通用', '内容创作'],
    model: 'GPT-4',
    created_at: now - 86400000 * 3,
    updated_at: now - 3600000 * 2,
  },
  {
    id: 'seed-2',
    title: '代码 Review 专家',
    content: '你是一位严格的代码审查专家。请审查以下代码，从这几个维度给出意见：\n\n1. 潜在 bug 和边界情况\n2. 性能优化点\n3. 可读性和命名\n4. 安全风险\n\n代码：\n```{lang}\n{code}\n```',
    description: '粘贴代码，获得多维度的 review 意见',
    tags: ['编程', '代码审查', '开发'],
    model: 'Claude 3.5',
    created_at: now - 86400000 * 2,
    updated_at: now - 3600000 * 5,
  },
  {
    id: 'seed-3',
    title: '周报生成器',
    content: '帮我把以下零散的工作内容整理成一份结构清晰的周报：\n\n- 列出本周完成的事项\n- 标注每项的进度百分比\n- 突出 1-2 个亮点\n- 列出下周计划\n\n我的工作内容：\n{items}',
    description: '把碎片化的工作记录变成规范周报',
    tags: ['职场', '周报', '效率'],
    model: 'DeepSeek',
    created_at: now - 86400000,
    updated_at: now - 3600000,
  },
  {
    id: 'seed-4',
    title: '苏格拉底式提问导师',
    content: '我想学习 {topic}。请不要直接给我答案，而是用苏格拉底式提问引导我自己思考。每次只问一个问题，等我的回答后再问下一个，逐步带我从浅入深理解这个主题。',
    description: '不喂答案，用提问帮你深度学习任意主题',
    tags: ['学习', '教育', '通用'],
    model: 'Claude 3.5',
    created_at: now - 86400000 * 5,
    updated_at: now - 86400000,
  },
  {
    id: 'seed-5',
    title: '产品文案优化',
    content: '你是一位资深产品文案。请优化以下产品文案，要求：\n1. 抓住用户痛点\n2. 用动词开头，避免形容词堆砌\n3. 每句不超过 15 字\n4. 给出 3 个备选版本\n\n原文案：\n{text}',
    description: '把平庸的产品描述打磨成转化文案',
    tags: ['文案', '产品', '营销'],
    model: 'GPT-4',
    created_at: now - 86400000 * 4,
    updated_at: now - 7200000,
  },
  {
    id: 'seed-6',
    title: '阅读理解助手',
    content: '请阅读以下内容，然后：\n1. 用一句话概括核心观点\n2. 列出 3 个关键论据\n3. 指出作者的潜在假设\n4. 给出一个反方观点\n\n内容：\n{text}',
    description: '不只是总结，而是帮你建立批判性阅读能力',
    tags: ['学习', '阅读', '通用'],
    model: '',
    created_at: now - 86400000 * 6,
    updated_at: now - 86400000 * 2,
  },
];

const stmt = db.prepare(`
  INSERT OR REPLACE INTO cards (id, title, content, description, tags, model, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const tx = db.transaction(() => {
  for (const c of seed) {
    stmt.run(c.id, c.title, c.content, c.description, JSON.stringify(c.tags), c.model, c.created_at, c.updated_at);
  }
});
tx();

console.log(`✅ 已写入 ${seed.length} 张示例卡片到 ${DB_PATH}`);
db.close();
