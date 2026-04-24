import 'server-only';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx';

type InlineRun = { text: string; bold?: boolean; italic?: boolean; code?: boolean };

// Минимальный парсер инлайнов: **bold**, *italic*, `code`.
// Не ломаемся на чём-то экзотическом — просто возвращаем текст как есть.
function parseInlines(line: string): InlineRun[] {
  const runs: InlineRun[] = [];
  let i = 0;
  let buf = '';
  const flush = (mods: Partial<InlineRun> = {}) => {
    if (buf) {
      runs.push({ text: buf, ...mods });
      buf = '';
    }
  };
  while (i < line.length) {
    const two = line.slice(i, i + 2);
    if (two === '**') {
      flush();
      const end = line.indexOf('**', i + 2);
      if (end === -1) {
        buf += two;
        i += 2;
        continue;
      }
      runs.push({ text: line.slice(i + 2, end), bold: true });
      i = end + 2;
      continue;
    }
    const ch = line[i];
    if (ch === '*' || ch === '_') {
      flush();
      const end = line.indexOf(ch, i + 1);
      if (end === -1) {
        buf += ch;
        i += 1;
        continue;
      }
      runs.push({ text: line.slice(i + 1, end), italic: true });
      i = end + 1;
      continue;
    }
    if (ch === '`') {
      flush();
      const end = line.indexOf('`', i + 1);
      if (end === -1) {
        buf += ch;
        i += 1;
        continue;
      }
      runs.push({ text: line.slice(i + 1, end), code: true });
      i = end + 1;
      continue;
    }
    buf += ch;
    i += 1;
  }
  flush();
  if (runs.length === 0) runs.push({ text: '' });
  return runs;
}

function runsToTextRuns(runs: InlineRun[]): TextRun[] {
  return runs.map(
    (r) =>
      new TextRun({
        text: r.text,
        bold: r.bold,
        italics: r.italic,
        font: r.code ? 'Consolas' : undefined,
      }),
  );
}

function headingFor(level: number): (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined {
  switch (level) {
    case 1:
      return HeadingLevel.HEADING_1;
    case 2:
      return HeadingLevel.HEADING_2;
    case 3:
      return HeadingLevel.HEADING_3;
    case 4:
      return HeadingLevel.HEADING_4;
    default:
      return HeadingLevel.HEADING_5;
  }
}

export async function markdownToDocx(markdown: string): Promise<Buffer> {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const children: Paragraph[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  const flushCode = () => {
    if (codeBuffer.length === 0) return;
    for (const cl of codeBuffer) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: cl || ' ', font: 'Consolas' })],
          alignment: AlignmentType.LEFT,
        }),
      );
    }
    codeBuffer = [];
  };

  for (const raw of lines) {
    const line = raw.replace(/\t/g, '    ');

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        flushCode();
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    if (line.trim() === '') {
      children.push(new Paragraph({ children: [new TextRun('')] }));
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      children.push(
        new Paragraph({
          heading: headingFor(level),
          children: runsToTextRuns(parseInlines(heading[2])),
        }),
      );
      continue;
    }

    const ul = /^\s*[-*+]\s+(.*)$/.exec(line);
    if (ul) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          children: runsToTextRuns(parseInlines(ul[1])),
        }),
      );
      continue;
    }

    const ol = /^\s*\d+\.\s+(.*)$/.exec(line);
    if (ol) {
      children.push(
        new Paragraph({
          numbering: { reference: 'default-numbering', level: 0 },
          children: runsToTextRuns(parseInlines(ol[1])),
        }),
      );
      continue;
    }

    children.push(
      new Paragraph({ children: runsToTextRuns(parseInlines(line)) }),
    );
  }
  if (inCodeBlock) flushCode();

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'default-numbering',
          levels: [
            {
              level: 0,
              format: 'decimal',
              text: '%1.',
              alignment: AlignmentType.START,
            },
          ],
        },
      ],
    },
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
}
