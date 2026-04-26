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

function neutralizeControlTags(s: string): string {
  return s.replace(/<vn-doc\b/gi, '<vn‑doc').replace(/<\/vn-doc>/gi, '</vn‑doc>');
}

function truncate(md: string): { markdown: string; truncated: boolean } {
  if (md.length > MAX_CHARS) {
    return { markdown: md.slice(0, MAX_CHARS), truncated: true };
  }
  return { markdown: md, truncated: false };
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
    const { markdown, truncated } = truncate(md);
    return { markdown: neutralizeControlTags(markdown), truncated, warnings };
  } catch (e: any) {
    return {
      markdown: '',
      truncated: false,
      warnings: [`Не удалось прочитать DOCX: ${e?.message ?? 'unknown error'}`],
    };
  }
}

export async function parsePdf(dataUrl: string): Promise<ParsedDoc> {
  const buffer = stripDataUrl(dataUrl);
  try {
    const pdfModule = await import('pdf-parse') as any;
    const pdfParse = pdfModule.default ?? pdfModule;
    const data = await pdfParse(buffer);
    let md = (data.text ?? '').trim();
    const { markdown, truncated } = truncate(md);
    return { markdown: neutralizeControlTags(markdown), truncated, warnings: [] };
  } catch (e: any) {
    return {
      markdown: '',
      truncated: false,
      warnings: [`Не удалось прочитать PDF: ${e?.message ?? 'unknown error'}`],
    };
  }
}

export async function parsePptx(dataUrl: string): Promise<ParsedDoc> {
  const buffer = stripDataUrl(dataUrl);
  try {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(buffer);
    const texts: string[] = [];
    const slideFiles = Object.keys(zip.files)
      .filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))
      .sort();
    for (const slideFile of slideFiles) {
      const xml = await zip.files[slideFile].async('text');
      const slideText = xml
        .replace(/<[^>]+>/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
      if (slideText) texts.push(slideText);
    }
    let md = texts.map((t, i) => `## Слайд ${i + 1}\n${t}`).join('\n\n');
    const { markdown, truncated } = truncate(md);
    return { markdown: neutralizeControlTags(markdown), truncated, warnings: [] };
  } catch (e: any) {
    return {
      markdown: '',
      truncated: false,
      warnings: [`Не удалось прочитать PPTX: ${e?.message ?? 'unknown error'}`],
    };
  }
}
