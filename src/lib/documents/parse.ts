import 'server-only';
import mammoth from 'mammoth';

const MAX_CHARS = 200_000;

export type ParsedDoc = {
  markdown: string;
  truncated: boolean;
  warnings: string[];
};

function stripDataUrl(dataUrl: string): Buffer {
  const m = /^data:[^;]+;base64,(.+)$/.exec(dataUrl);
  const b64 = m ? m[1] : dataUrl;
  return Buffer.from(b64, 'base64');
}

// Экранируем управляющий тег, чтобы содержимое документа не могло внедрить
// фейковый <vn-doc> и подделать "файл" в ответе ассистента.
function neutralizeControlTags(s: string): string {
  return s.replace(/<vn-doc\b/gi, '<vn‑doc').replace(/<\/vn-doc>/gi, '</vn‑doc>');
}

export async function parseDocx(dataUrl: string): Promise<ParsedDoc> {
  const buffer = stripDataUrl(dataUrl);
  try {
    const result = await (mammoth as any).convertToMarkdown(
      { buffer },
      {
        convertImage: mammoth.images.imgElement(() => Promise.resolve({ src: '' })),
      },
    );
    let md = (result.value ?? '').trim();
    const warnings = (result.messages ?? []).map((m: any) => String(m.message ?? m));
    let truncated = false;
    if (md.length > MAX_CHARS) {
      md = md.slice(0, MAX_CHARS);
      truncated = true;
    }
    md = neutralizeControlTags(md);
    return { markdown: md, truncated, warnings };
  } catch (e: any) {
    return {
      markdown: '',
      truncated: false,
      warnings: [`Не удалось прочитать DOCX: ${e?.message ?? 'unknown error'}`],
    };
  }
}
