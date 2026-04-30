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

const EXT_TO_LANG: Record<string, string> = {
  '.py': 'python', '.js': 'javascript', '.ts': 'typescript', '.tsx': 'tsx',
  '.jsx': 'jsx', '.java': 'java', '.cpp': 'cpp', '.c': 'c', '.cs': 'csharp',
  '.go': 'go', '.rs': 'rust', '.rb': 'ruby', '.php': 'php', '.swift': 'swift',
  '.kt': 'kotlin', '.sql': 'sql', '.sh': 'bash', '.yml': 'yaml', '.yaml': 'yaml',
  '.json': 'json', '.xml': 'xml', '.html': 'html', '.css': 'css', '.scss': 'scss',
  '.r': 'r', '.m': 'matlab', '.lua': 'lua',
};

function detectLang(filename: string): string {
  const ext = filename.toLowerCase().match(/\.\w+$/)?.[0] ?? '';
  return EXT_TO_LANG[ext] ?? '';
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

export async function parseXlsx(dataUrl: string): Promise<ParsedDoc> {
  const buffer = stripDataUrl(dataUrl);
  try {
    const XLSX = await import('xlsx');
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const parts: string[] = [];
    for (const name of wb.SheetNames) {
      const sheet = wb.Sheets[name];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      const lines = csv.split('\n').filter((l) => l.trim());
      if (lines.length === 0) continue;
      const header = lines[0].split(',');
      const rows = lines.slice(1).map((l) => l.split(','));
      let md = `## ${name}\n\n`;
      md += '| ' + header.join(' | ') + ' |\n';
      md += '| ' + header.map(() => '---').join(' | ') + ' |\n';
      for (const row of rows) {
        md += '| ' + row.join(' | ') + ' |\n';
      }
      parts.push(md);
    }
    const combined = parts.join('\n\n');
    const { markdown, truncated } = truncate(combined);
    return { markdown: neutralizeControlTags(markdown), truncated, warnings: [] };
  } catch (e: any) {
    return {
      markdown: '',
      truncated: false,
      warnings: [`Не удалось прочитать XLSX: ${e?.message ?? 'unknown error'}`],
    };
  }
}

export async function parseCsv(dataUrl: string): Promise<ParsedDoc> {
  const buffer = stripDataUrl(dataUrl);
  try {
    const text = buffer.toString('utf-8');
    const lines = text.split('\n').filter((l) => l.trim());
    if (lines.length === 0) return { markdown: '', truncated: false, warnings: [] };
    const header = lines[0].split(',');
    let md = '| ' + header.join(' | ') + ' |\n';
    md += '| ' + header.map(() => '---').join(' | ') + ' |\n';
    for (const line of lines.slice(1)) {
      md += '| ' + line.split(',').join(' | ') + ' |\n';
    }
    const { markdown, truncated } = truncate(md);
    return { markdown: neutralizeControlTags(markdown), truncated, warnings: [] };
  } catch (e: any) {
    return {
      markdown: '',
      truncated: false,
      warnings: [`Не удалось прочитать CSV: ${e?.message ?? 'unknown error'}`],
    };
  }
}

export async function parseText(dataUrl: string): Promise<ParsedDoc> {
  const buffer = stripDataUrl(dataUrl);
  try {
    const text = buffer.toString('utf-8');
    const { markdown, truncated } = truncate(text);
    return { markdown: neutralizeControlTags(markdown), truncated, warnings: [] };
  } catch (e: any) {
    return {
      markdown: '',
      truncated: false,
      warnings: [`Не удалось прочитать файл: ${e?.message ?? 'unknown error'}`],
    };
  }
}

export async function parseCode(dataUrl: string, filename: string): Promise<ParsedDoc> {
  const buffer = stripDataUrl(dataUrl);
  try {
    const text = buffer.toString('utf-8');
    const lang = detectLang(filename);
    const wrapped = `\`\`\`${lang}\n${text}\n\`\`\``;
    const { markdown, truncated } = truncate(wrapped);
    return { markdown: neutralizeControlTags(markdown), truncated, warnings: [] };
  } catch (e: any) {
    return {
      markdown: '',
      truncated: false,
      warnings: [`Не удалось прочитать код: ${e?.message ?? 'unknown error'}`],
    };
  }
}
