// In-browser document parser — no backend or embeddings needed
// Supports: PDF, TXT, MD, HTML, CSS, XML, JSON, and all code files

import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

function block(type, content) {
  const c = content?.trim();
  return c ? { type, content: c } : null;
}

const CODE_EXTS = new Set([
  'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'cs',
  'go', 'rb', 'rs', 'php', 'swift', 'kt', 'yaml', 'yml',
]);

// ── Markdown ──────────────────────────────────────────────────────────────────

function parseMD(text) {
  const blocks = [];
  const lines = text.split('\n');
  let inCode = false;
  let codeLines = [];
  let paraLines = [];

  const flushPara = () => {
    if (paraLines.length) { blocks.push(block('paragraph', paraLines.join('\n'))); paraLines = []; }
  };

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCode) { blocks.push(block('code', codeLines.join('\n'))); codeLines = []; inCode = false; }
      else { flushPara(); inCode = true; }
    } else if (inCode) {
      codeLines.push(line);
    } else if (line.startsWith('# ')) {
      flushPara(); blocks.push(block('heading1', line.slice(2).trim()));
    } else if (/^#{2,}\s/.test(line)) {
      flushPara(); blocks.push(block('heading2', line.replace(/^#+\s/, '').trim()));
    } else if (!line.trim()) {
      flushPara();
    } else {
      paraLines.push(line);
    }
  }
  flushPara();
  if (codeLines.length) blocks.push(block('code', codeLines.join('\n')));
  return blocks.filter(Boolean);
}

// ── Plain text ────────────────────────────────────────────────────────────────

function parseTXT(text) {
  return text.split(/\n{2,}/).map(para => {
    const p = para.trim();
    if (!p) return null;
    const first = p.split('\n')[0].trim();
    const isHeading = first.length > 3 && first.length < 80 &&
      first === first.toUpperCase() && /[A-Z]/.test(first);
    return block(isHeading ? 'heading2' : 'paragraph', p);
  }).filter(Boolean);
}

// ── HTML ──────────────────────────────────────────────────────────────────────

function parseHTML(text) {
  const doc = new DOMParser().parseFromString(text, 'text/html');
  const blocks = [];

  function walk(el) {
    for (const child of el.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        const t = child.textContent.trim();
        if (t) blocks.push(block('paragraph', t));
        continue;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      const tag = child.tagName.toLowerCase();
      const txt = child.textContent.trim();
      if (!txt) continue;
      if (tag === 'h1') { blocks.push(block('heading1', txt)); continue; }
      if (tag === 'h2' || tag === 'h3') { blocks.push(block('heading2', txt)); continue; }
      if (tag === 'p') { blocks.push(block('paragraph', txt)); continue; }
      if (tag === 'pre' || tag === 'code') { blocks.push(block('code', txt)); continue; }
      if (tag === 'ul' || tag === 'ol') {
        const items = Array.from(child.querySelectorAll('li')).map(li => '- ' + li.textContent.trim());
        if (items.length) blocks.push(block('list', items.join('\n')));
        continue;
      }
      if (tag === 'table') {
        const rows = [];
        child.querySelectorAll('tr').forEach((tr, i) => {
          const cells = Array.from(tr.querySelectorAll('th,td')).map(td => td.textContent.trim());
          if (!cells.length) return;
          rows.push('| ' + cells.join(' | ') + ' |');
          if (i === 0) rows.push('| ' + cells.map(() => '---').join(' | ') + ' |');
        });
        if (rows.length > 1) blocks.push(block('table', rows.join('\n')));
        continue;
      }
      walk(child);
    }
  }

  walk(doc.body);
  return blocks.filter(Boolean);
}

// ── CSS ───────────────────────────────────────────────────────────────────────

function parseCSS(text) {
  const blocks = [];
  const re = /([^{]+)\{([^}]+)\}/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const selector = m[1].trim();
    const props = m[2].trim().split(';').map(s => s.trim()).filter(Boolean).join(';\n  ');
    if (selector && props) blocks.push(block('code', `${selector} {\n  ${props}\n}`));
  }
  return blocks.filter(Boolean);
}

// ── XML ───────────────────────────────────────────────────────────────────────

function parseXML(text) {
  try {
    const doc = new DOMParser().parseFromString(text, 'text/xml');
    const blocks = [];
    function walk(el, depth) {
      if (el.children.length === 0) {
        const val = el.textContent.trim();
        if (val) blocks.push(block('paragraph', `${el.tagName}: ${val}`));
        return;
      }
      blocks.push(block(depth === 0 ? 'heading1' : 'heading2', el.tagName));
      for (const child of el.children) walk(child, depth + 1);
    }
    walk(doc.documentElement, 0);
    return blocks.filter(Boolean);
  } catch {
    return parseTXT(text);
  }
}

// ── JSON ──────────────────────────────────────────────────────────────────────

function parseJSON(text) {
  try {
    const obj = JSON.parse(text);
    return [block('code', JSON.stringify(obj, null, 2))].filter(Boolean);
  } catch {
    return parseTXT(text);
  }
}

// ── Code files ────────────────────────────────────────────────────────────────

function parseCode(text) {
  const lines = text.split('\n');
  const funcRe = /^(export\s+)?(default\s+)?(async\s+)?function\s+\w+|^(export\s+)?class\s+\w+|^def\s+\w+|^public\s+/;
  const blocks = [];
  let chunk = [];
  for (const line of lines) {
    if (funcRe.test(line.trim()) && chunk.length > 2) {
      blocks.push(block('code', chunk.join('\n')));
      chunk = [line];
    } else {
      chunk.push(line);
    }
  }
  if (chunk.length) blocks.push(block('code', chunk.join('\n')));
  return blocks.filter(Boolean);
}

// ── PDF ───────────────────────────────────────────────────────────────────────

// A row is "table-like" when its items have large gaps between them (table cell spacing).
// 25 PDF points ≈ 0.35 inch — much wider than normal word spacing (2-5 pts).
function isTableRow(row) {
  if (row.items.length < 2) return false;
  for (let i = 1; i < row.items.length; i++) {
    const prev = row.items[i - 1];
    const prevEnd = prev.transform[4] + (prev.width > 0 ? prev.width : prev.str.length * 5);
    if (row.items[i].transform[4] - prevEnd > 25) return true;
  }
  return false;
}

// Cluster X positions into column buckets and build a markdown table string.
// Returns null if fewer than 2 columns can be detected.
function buildMarkdownTable(tableRows) {
  const tol = 15; // pts — how close two X positions must be to share a column

  const allXs = tableRows.flatMap(r => r.items.map(i => i.transform[4]));
  allXs.sort((a, b) => a - b);
  const colXs = [];
  for (const x of allXs) {
    if (!colXs.some(c => Math.abs(c - x) <= tol)) colXs.push(x);
  }
  colXs.sort((a, b) => a - b);
  if (colXs.length < 2) return null;

  const mdRows = tableRows.map(row => {
    const cells = colXs.map(cx => {
      const matched = row.items
        .filter(i => Math.abs(i.transform[4] - cx) <= tol * 2)
        .map(i => i.str.trim())
        .join(' ');
      return matched;
    });
    return '| ' + cells.join(' | ') + ' |';
  });

  const sep = '| ' + colXs.map(() => '---').join(' | ') + ' |';
  mdRows.splice(1, 0, sep);
  return mdRows.join('\n');
}

// Emit a run of plain-text rows as paragraph/heading blocks.
function emitTextRows(rows, blocks) {
  const lines = rows.map(r => r.items.map(i => i.str).join(' ').trim()).filter(Boolean);
  let paraLines = [];
  const flushPara = () => {
    if (!paraLines.length) return;
    const text = paraLines.join(' ').trim();
    if (!text) { paraLines = []; return; }
    const isHeading = text.length < 80 &&
      (text === text.toUpperCase() || /^[A-Z][^a-z]{0,3}[A-Z]/.test(text));
    blocks.push(block(isHeading ? 'heading2' : 'paragraph', text));
    paraLines = [];
  };
  for (const line of lines) {
    paraLines.push(line);
    if (paraLines.length >= 6) flushPara();
  }
  flushPara();
}

async function parsePDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const blocks = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    // Group text items into rows by Y position
    const lineMap = new Map();
    for (const item of content.items) {
      if (!item.str?.trim()) continue;
      const y = Math.round(item.transform[5]);
      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y).push(item);
    }

    const sortedYs = [...lineMap.keys()].sort((a, b) => b - a);
    const rows = sortedYs.map(y => ({
      y,
      items: lineMap.get(y).sort((a, b) => a.transform[4] - b.transform[4]),
    }));

    // Segment rows into runs of table rows vs plain-text rows
    const segments = [];
    let seg = null;
    for (const row of rows) {
      const tableRow = isTableRow(row);
      if (!seg || seg.isTable !== tableRow) {
        seg = { isTable: tableRow, rows: [row] };
        segments.push(seg);
      } else {
        seg.rows.push(row);
      }
    }

    for (const s of segments) {
      if (s.isTable && s.rows.length >= 2) {
        const tbl = buildMarkdownTable(s.rows);
        if (tbl) blocks.push(block('table', tbl));
        else emitTextRows(s.rows, blocks);
      } else {
        emitTextRows(s.rows, blocks);
      }
    }
  }

  return blocks.filter(Boolean);
}

// ── DOCX ──────────────────────────────────────────────────────────────────────

async function parseDOCX(file) {
  const arrayBuffer = await file.arrayBuffer();
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
  return parseHTML(html);
}

// ── XLSX ──────────────────────────────────────────────────────────────────────

async function parseXLSX(file) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const blocks = [];
  for (const sheetName of workbook.SheetNames) {
    blocks.push(block('heading1', sheetName));
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    const rows = csv.split('\n').filter(r => r.replace(/,/g, '').trim());
    if (!rows.length) continue;
    // First row as header, rest as table markdown
    const headers = rows[0].split(',');
    const sep = headers.map(() => '---').join(' | ');
    const mdRows = [
      '| ' + headers.join(' | ') + ' |',
      '| ' + sep + ' |',
      ...rows.slice(1).map(r => '| ' + r.split(',').join(' | ') + ' |'),
    ];
    blocks.push(block('table', mdRows.join('\n')));
  }
  return blocks.filter(Boolean);
}

// ── File reader helper ────────────────────────────────────────────────────────

function readAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// ── Simple keyword relevance (used by full-doc chat) ─────────────────────────

export function findRelevantBlocks(query, blocks, topN = 5) {
  const queryWords = new Set(
    query.toLowerCase().split(/\W+/).filter(w => w.length > 2)
  );
  const scored = blocks.map(b => {
    const words = b.content.toLowerCase().split(/\W+/);
    const score = words.filter(w => queryWords.has(w)).length;
    return { block: b, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, topN);
  return (top.some(x => x.score > 0) ? top : scored.slice(0, topN))
    .map(x => x.block);
}

// ── Render content generator (visual display, stored in DB) ──────────────────

export async function generateRenderContent(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'pdf') {
    const rawFileData = await file.arrayBuffer();
    return { rawFileData };
  }

  if (ext === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
    return { renderHtml: html };
  }

  if (ext === 'xlsx' || ext === 'xls') {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const parts = workbook.SheetNames.map(name => {
      const sheet = workbook.Sheets[name];
      const html = XLSX.utils.sheet_to_html(sheet);
      return `<h3 class="xlsx-sheet-name">Sheet: ${name}</h3>${html}`;
    });
    return { renderHtml: parts.join('<div class="xlsx-divider"></div>') };
  }

  return null;
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function parseFileInBrowser(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'pdf')  return parsePDF(file);
  if (ext === 'docx') return parseDOCX(file);
  if (ext === 'xlsx' || ext === 'xls') return parseXLSX(file);

  const text = await readAsText(file);

  if (ext === 'md')                  return parseMD(text);
  if (ext === 'txt')                 return parseTXT(text);
  if (ext === 'html' || ext === 'htm') return parseHTML(text);
  if (ext === 'css')                 return parseCSS(text);
  if (ext === 'xml')                 return parseXML(text);
  if (ext === 'json')                return parseJSON(text);
  if (CODE_EXTS.has(ext))            return parseCode(text);

  return parseTXT(text);
}
