import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { genId, now } from '@/lib/utils';

export interface CardData {
  id: string;
  title: string;
  content: string;
  description: string;
  tags: string[];
  model: string;
  created_at: number;
  updated_at: number;
}

function rowToCard(row: any): CardData {
  return {
    ...row,
    tags: JSON.parse(row.tags || '[]'),
  };
}

// GET /api/cards — 获取卡片列表，支持搜索和标签筛选
export async function GET(req: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  const tag = searchParams.get('tag')?.trim();

  let sql = 'SELECT * FROM cards';
  const conditions: string[] = [];
  const params: any[] = [];

  if (q) {
    conditions.push('(title LIKE ? OR content LIKE ? OR description LIKE ?)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (tag) {
    conditions.push('tags LIKE ?');
    params.push(`%"${tag}"%`);
  }

  if (conditions.length) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY updated_at DESC';

  const rows = db.prepare(sql).all(...params);
  return NextResponse.json({ cards: rows.map(rowToCard) });
}

// POST /api/cards — 创建新卡片
export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();

  const { title, content, description, tags, model } = body;
  if (!title || !content) {
    return NextResponse.json({ error: 'title 和 content 不能为空' }, { status: 400 });
  }

  const id = genId();
  const ts = now();

  db.prepare(`
    INSERT INTO cards (id, title, content, description, tags, model, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, content, description || '', JSON.stringify(tags || []), model || '', ts, ts);

  const row = db.prepare('SELECT * FROM cards WHERE id = ?').get(id);
  return NextResponse.json({ card: rowToCard(row) }, { status: 201 });
}
