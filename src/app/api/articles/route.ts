import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { ArticleSchema } from '@/lib/types';
import { putItem, getByPk, getByPkAll } from '@/lib/aws/dynamo';

const mem: Record<string, any> = { store: {} };
const TABLE = process.env.DYNAMO_TABLE_ARTICLES || 'seo_blog_forge_articles';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  if (slug) {
    const { fallback, items } = await getByPk(TABLE, `ARTICLE#${slug}`, 'v1');
    if (fallback) { const item = mem.store[slug]; return NextResponse.json(item ? [item] : []); }
    return NextResponse.json(items);
  }
  const { fallback, items } = await getByPkAll(TABLE, 'ARTICLE#INDEX');
  if (fallback) return NextResponse.json(Object.values(mem.store));
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ArticleSchema.parse(body);
    const now = new Date().toISOString();
    const id = parsed.id || randomUUID();
    const item = { pk: `ARTICLE#${parsed.slug}`, sk: 'v1', id, ...parsed, createdAt: parsed.createdAt || now, updatedAt: now };
    const res = await putItem(TABLE, item);
    if (res.fallback) {
      mem.store[parsed.slug] = item;
      mem.store[`INDEX#${id}`] = { pk: 'ARTICLE#INDEX', sk: id, ...item };
    }
    return NextResponse.json({ ok: true, id, slug: parsed.slug });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Invalid payload' }, { status: 400 });
  }
}
