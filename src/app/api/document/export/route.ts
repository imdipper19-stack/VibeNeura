import { NextRequest } from 'next/server';
import { z } from 'zod';
import { markdownToDocx } from '@/lib/documents/build';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  filename: z.string().min(1).max(200),
  markdown: z.string().min(1).max(500_000),
});

function safeFilename(name: string): string {
  let n = name.trim().replace(/[\\/:*?"<>|]+/g, '_');
  if (!/\.docx$/i.test(n)) n += '.docx';
  if (n.length > 200) n = n.slice(-200);
  return n;
}

export async function POST(req: NextRequest) {
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Invalid payload' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const buffer = await markdownToDocx(body.markdown);
    const filename = safeFilename(body.filename);
    const bytes = new Uint8Array(buffer);
    return new Response(bytes, {
      status: 200,
      headers: {
        'content-type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'content-disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'cache-control': 'no-store',
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Build failed', message: e?.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
