/**
 * Exports a conversation and its messages as a Markdown file download.
 */
export function exportConversationAsMarkdown(conversation, messages) {
  const lines = [];
  lines.push(`# ${conversation.title}`);
  lines.push(`\n_Exported from Navakha on ${new Date().toLocaleDateString()}_\n`);
  lines.push('---\n');

  for (const msg of messages) {
    if (msg.role === 'system') continue;
    const label = msg.role === 'user' ? '**You**' : '**Navakha**';
    lines.push(`${label}\n`);
    lines.push(msg.content);
    lines.push('\n---\n');
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
