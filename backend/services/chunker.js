import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { load as cheerioLoad } from 'cheerio';
import { XMLParser } from 'fast-xml-parser';

// ── Helpers ───────────────────────────────────────────────────────────────────

function block(type, content) {
  const c = content?.trim();
  return c ? { type, content: c } : null;
}

const CODE_EXTS = new Set([
  'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'cs',
  'go', 'rb', 'rs', 'php', 'swift', 'kt',
]);

// ── PDF ───────────────────────────────────────────────────────────────────────

async function parsePDF(buffer) {
  const data = await pdf(buffer);
  const blocks = [];
  const lines = data.text.split('\n');
  let para = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push(block('paragraph', para.join(' ')));
      para = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); continue; }
    const isHeading =
      line.length < 80 &&
      line.length > 3 &&
      line === line.toUpperCase() &&
      /[A-Z]/.test(line);
    if (isHeading) {
      flushPara();
      blocks.push(block('heading2', line));
    } else {
      para.push(line);
    }
  }
  flushPara();
  return blocks.filter(Boolean);
}

// ── HTML (also used by DOCX via mammoth) ─────────────────────────────────────

function parseHTML(htmlString) {
  const $ = cheerioLoad(htmlString);
  const blocks = [];

  $('body').children().each((_, el) => {
    walk($, el, blocks);
  });

  return blocks.filter(Boolean);
}

function walk($, el, blocks) {
  const tag = el.name;
  if (!tag) return;

  if (tag === 'h1') { blocks.push(block('heading1', $(el).text())); return; }
  if (tag === 'h2' || tag === 'h3') { blocks.push(block('heading2', $(el).text())); return; }
  if (tag === 'p') { blocks.push(block('paragraph', $(el).text())); return; }
  if (tag === 'pre' || tag === 'code') { blocks.push(block('code', $(el).text())); return; }

  if (tag === 'table') {
    const rows = [];
    $(el).find('tr').each((i, tr) => {
      const cells = [];
      $(tr).find('th, td').each((_, td) => cells.push($(td).text().trim()));
      if (cells.length) rows.push('| ' + cells.join(' | ') + ' |');
      if (i === 0) rows.push('| ' + cells.map(() => '---').join(' | ') + ' |');
    });
    if (rows.length > 1) blocks.push(block('table', rows.join('\n')));
    return;
  }

  if (tag === 'ul' || tag === 'ol') {
    const items = [];
    $(el).find('li').each((_, li) => items.push('- ' + $(li).text().trim()));
    if (items.length) blocks.push(block('list', items.join('\n')));
    return;
  }

  // recurse into divs / sections
  $(el).children().each((_, child) => walk($, child, blocks));
}

// ── DOCX ──────────────────────────────────────────────────────────────────────

async function parseDOCX(buffer) {
  const { value: html } = await mammoth.convertToHtml({ buffer });
  return parseHTML(html);
}

// ── XLSX ──────────────────────────────────────────────────────────────────────

function parseXLSX(buffer) {
  const workbook = XLSX.read(buffer);
  const blocks = [];
  for (const sheetName of workbook.SheetNames) {
    blocks.push(block('heading1', sheetName));
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (rows.length < 2) continue;
    const header = rows[0].map(String);
    const lines = [
      '| ' + header.join(' | ') + ' |',
      '| ' + header.map(() => '---').join(' | ') + ' |',
      ...rows.slice(1).map(row => '| ' + row.map(String).join(' | ') + ' |'),
    ];
    blocks.push(block('table', lines.join('\n')));
  }
  return blocks.filter(Boolean);
}

// ── CSS ───────────────────────────────────────────────────────────────────────

function parseCSS(text) {
  const blocks = [];
  const re = /([^{]+)\{([^}]+)\}/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const selector = m[1].trim();
    const props = m[2].trim()
      .split(';')
      .map(s => s.trim())
      .filter(Boolean)
      .join(';\n  ');
    blocks.push(block('code', `${selector} {\n  ${props}\n}`));
  }
  return blocks.filter(Boolean);
}

// ── XML ───────────────────────────────────────────────────────────────────────

function parseXML(text) {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const obj = parser.parse(text);
  const blocks = [];

  function traverse(node, depth) {
    if (typeof node === 'string' || typeof node === 'number') {
      blocks.push(block('paragraph', String(node)));
      return;
    }
    if (Array.isArray(node)) { node.forEach(n => traverse(n, depth)); return; }
    if (typeof node === 'object' && node !== null) {
      for (const [key, val] of Object.entries(node)) {
        if (key.startsWith('@_')) continue;
        blocks.push(block(depth === 0 ? 'heading1' : 'heading2', key));
        traverse(val, depth + 1);
      }
    }
  }

  traverse(obj, 0);
  return blocks.filter(Boolean);
}

// ── Markdown ──────────────────────────────────────────────────────────────────

function parseMD(text) {
  const blocks = [];
  const lines = text.split('\n');
  let inCode = false;
  let codeLines = [];
  let paraLines = [];

  const flushPara = () => {
    if (paraLines.length) {
      blocks.push(block('paragraph', paraLines.join('\n')));
      paraLines = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCode) {
        blocks.push(block('code', codeLines.join('\n')));
        codeLines = [];
        inCode = false;
      } else {
        flushPara();
        inCode = true;
      }
    } else if (inCode) {
      codeLines.push(line);
    } else if (line.startsWith('# ')) {
      flushPara();
      blocks.push(block('heading1', line.slice(2)));
    } else if (/^#{2,}\s/.test(line)) {
      flushPara();
      blocks.push(block('heading2', line.replace(/^#+\s/, '')));
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
  return text
    .split(/\n{2,}/)
    .map(para => {
      const p = para.trim();
      if (!p) return null;
      const first = p.split('\n')[0].trim();
      const isHeading =
        first.length > 3 &&
        first.length < 80 &&
        first === first.toUpperCase() &&
        /[A-Z]/.test(first);
      return block(isHeading ? 'heading2' : 'paragraph', p);
    })
    .filter(Boolean);
}

// ── Code files ────────────────────────────────────────────────────────────────

function parseCode(text) {
  const blocks = [];
  const lines = text.split('\n');
  const funcRe = /^(export\s+)?(default\s+)?(async\s+)?function\s+\w+|^(export\s+)?class\s+\w+|^def\s+\w+|^public\s+(static\s+)?\w[\w<>\[\]]+\s+\w+\s*\(/;
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

// ── Main export ───────────────────────────────────────────────────────────────

export async function parseDocument(buffer, filename, mimetype) {
  const ext = filename.split('.').pop().toLowerCase();

  if (ext === 'pdf' || mimetype === 'application/pdf') return parsePDF(buffer);
  if (ext === 'docx' || mimetype?.includes('wordprocessingml')) return parseDOCX(buffer);
  if (ext === 'xlsx' || mimetype?.includes('spreadsheetml')) return parseXLSX(buffer);
  if (ext === 'html' || ext === 'htm') return parseHTML(buffer.toString());
  if (ext === 'css') return parseCSS(buffer.toString());
  if (ext === 'xml') return parseXML(buffer.toString());
  if (ext === 'md') return parseMD(buffer.toString());
  if (ext === 'txt') return parseTXT(buffer.toString());
  if (CODE_EXTS.has(ext)) return parseCode(buffer.toString());
  return parseTXT(buffer.toString());
}
