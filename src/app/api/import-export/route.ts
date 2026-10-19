import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { genId, now } from '@/lib/utils';

// POST /api/import — 批量导入卡片
export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const cards = Array.isArray(body) ? body : body.cards;

  if (!Array.isArray(cards)) {
    return NextResponse.json({ error: '需要卡片数组' }, { status: 400 });
  }

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO cards (id, title, content, description, tags, model, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let count = 0;
  const tx = db.transaction(() => {
    for (const c of cards) {
      if (!c.title || !c.content) continue;
      stmt.run(
        c.id || genId(),
        c.title,
        c.content,
        c.description || '',
        JSON.stringify(c.tags || []),
        c.model || '',
        c.created_at || now(),
        c.updated_at || now(),
      );
      count++;
    }
  });
  tx();

  return NextResponse.json({ imported: count });
}

// GET /api/export — 导出全部卡片
export async function GET() {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM cards ORDER BY updated_at DESC').all() as any[];
  const cards = rows.map((r) => ({ ...r, tags: JSON.parse(r.tags || '[]') }));
  return NextResponse.json({ cards });
}
