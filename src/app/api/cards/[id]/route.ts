import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { now } from '@/lib/utils';

function rowToCard(row: any) {
  return { ...row, tags: JSON.parse(row.tags || '[]') };
}

// GET /api/cards/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM cards WHERE id = ?').get(params.id);
  if (!row) return NextResponse.json({ error: '卡片不存在' }, { status: 404 });
  return NextResponse.json({ card: rowToCard(row) });
}

// PUT /api/cards/[id] — 更新卡片，同时保存旧版本
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM cards WHERE id = ?').get(params.id) as any;
  if (!existing) return NextResponse.json({ error: '卡片不存在' }, { status: 404 });

  const body = await req.json();
  const { title, content, description, tags, model } = body;

  // 如果 content 变了，保存旧版本到 card_versions
  if (content && content !== existing.content) {
    const { genId } = await import('@/lib/utils');
    db.prepare(`
      INSERT INTO card_versions (id, card_id, content, version_note, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(genId(), params.id, existing.content, '', now());
  }

  const ts = now();
  db.prepare(`
    UPDATE cards SET
      title = ?, content = ?, description = ?, tags = ?, model = ?, updated_at = ?
    WHERE id = ?
  `).run(
    title ?? existing.title,
    content ?? existing.content,
    description ?? existing.description,
    JSON.stringify(tags ?? JSON.parse(existing.tags || '[]')),
    model ?? existing.model,
    ts,
    params.id,
  );

  const row = db.prepare('SELECT * FROM cards WHERE id = ?').get(params.id);
  return NextResponse.json({ card: rowToCard(row) });
}

// DELETE /api/cards/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getDb();
  const result = db.prepare('DELETE FROM cards WHERE id = ?').run(params.id);
  if (result.changes === 0) return NextResponse.json({ error: '卡片不存在' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
