import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET /api/tags — 获取所有标签及计数
export async function GET() {
  const db = getDb();
  const rows = db.prepare('SELECT tags FROM cards').all() as any[];

  const tagMap = new Map<string, number>();
  for (const row of rows) {
    const tags: string[] = JSON.parse(row.tags || '[]');
    for (const t of tags) {
      tagMap.set(t, (tagMap.get(t) || 0) + 1);
    }
  }

  const tags = Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({ tags });
}
