/**
 * Splits an AI response string into logical blocks for inline reply targeting.
 * Blocks are split by: headings, paragraph groups, numbered list items, or
 * code/mermaid/chartjs fences treated as single blocks.
 *
 * Returns an array of { id, content } objects.
 */
export function parseIntoBlocks(text) {
  if (!text || typeof text !== 'string') return [{ id: 0, content: text || '' }];

  // Short responses (< 100 words) → single block, no inline reply icon shown
  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount < 100) {
    return [{ id: 0, content: text.trim(), short: true }];
  }

  const lines = text.split('\n');
  const blocks = [];
  let current = [];

  const flushCurrent = () => {
    const joined = current.join('\n').trim();
    if (joined) blocks.push(joined);
    current = [];
  };

  let inFence = false;
  let inWidget = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Widget block: treat everything between WIDGET_START and WIDGET_END as one block
    if (!inFence && !inWidget && line.includes('<!--WIDGET_START-->')) {
      flushCurrent();
      inWidget = true;
      current.push(line);
      // If WIDGET_END is on the same line, close immediately
      if (line.includes('<!--WIDGET_END-->')) {
        inWidget = false;
        flushCurrent();
      }
      continue;
    }

    if (inWidget) {
      current.push(line);
      if (line.includes('<!--WIDGET_END-->')) {
        inWidget = false;
        flushCurrent();
      }
      continue;
    }

    const fenceMatch = line.match(/^```(\w*)/);

    if (fenceMatch && !inFence) {
      // Start of code fence — flush previous text, begin fence block
      flushCurrent();
      inFence = true;
      current.push(line);
      continue;
    }

    if (inFence && line.startsWith('```')) {
      // End of fence — include closing backticks and flush as its own block
      current.push(line);
      inFence = false;
      flushCurrent();
      continue;
    }

    if (inFence) {
      current.push(line);
      continue;
    }

    // Headings start a new block
    if (/^#{1,4}\s/.test(line)) {
      flushCurrent();
      current.push(line);
      continue;
    }

    // Numbered list items (1. 2. etc.) — each is its own block
    if (/^\d+\.\s/.test(line)) {
      // Collect consecutive list items as one block
      if (current.length > 0 && !/^\d+\.\s/.test(current[current.length - 1])) {
        flushCurrent();
      }
      current.push(line);
      continue;
    }

    // Blank line separates paragraph blocks
    if (line.trim() === '') {
      if (current.length > 0) {
        current.push(line);
        // Only flush on double blank or after substantial content
        if (current.join('\n').trim().split(/\s+/).length >= 20) {
          flushCurrent();
        }
      }
      continue;
    }

    current.push(line);
  }

  flushCurrent();

  return blocks.map((content, id) => ({ id, content }));
}
