import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { KeywordEntrySchema } from '@/lib/types';
import { putItem, getByPk, getByPkAll } from '@/lib/aws/dynamo';

const mem: Record<string, any> = { store: {} };
const TABLE = process.env.DYNAMO_TABLE_KEYWORDS || 'seo_blog_forge_keywords';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get('topic');
  if (topic) {
    const { fallback, items } = await getByPk(TABLE, `KEYWORDS#${topic}`, 'v1');
    if (fallback) return NextResponse.json(mem.store[topic] ? [mem.store[topic]] : []);
    return NextResponse.json(items);
  }
  const { fallback, items } = await getByPkAll(TABLE, 'KEYWORDS#INDEX');
  if (fallback) return NextResponse.json(Object.values(mem.store));
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = KeywordEntrySchema.parse(body);
    const now = new Date().toISOString();
    const id = parsed.id || randomUUID();
    const item = { pk: `KEYWORDS#${parsed.topic}`, sk: 'v1', id, ...parsed, createdAt: parsed.createdAt || now };
    const res = await putItem(TABLE, item);
    if (res.fallback) {
      mem.store[parsed.topic] = item;
      mem.store[`INDEX#${id}`] = { pk: 'KEYWORDS#INDEX', sk: id, ...item };
    }
    return NextResponse.json({ ok: true, id, topic: parsed.topic });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Invalid payload' }, { status: 400 });
  }
}
