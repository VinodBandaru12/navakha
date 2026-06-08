import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

// ── TEXT SEGMENT HELPER ──────────────────────────────────
function parseTextSegments(text) {
  if (!text) return []

  const segments = []
  // Global regex finds ALL mermaid and chartjs blocks in document order
  const blockRe = /```(mermaid|chartjs)\n([\s\S]*?)```/g
  let lastIndex = 0
  let match

  while ((match = blockRe.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index).trim()
    if (before) segments.push({ type: 'text', content: before })
    segments.push({ type: match[1], content: match[2].trim() })
    lastIndex = match.index + match[0].length
  }

  const after = text.slice(lastIndex).trim()
  if (after) segments.push({ type: 'text', content: after })

  return segments.length > 0 ? segments : [{ type: 'text', content: text }]
}

// ── PARSER ──────────────────────────────────────────────
function parseSegments(raw) {
  console.log('=== PARSE SEGMENTS CALLED ===')
  console.log('Has widget tag:', raw?.includes('<!--WIDGET_START-->'))

  if (!raw) return [{ type: 'text', content: '' }]

  const hasWidgetMarker = raw.includes('<!--WIDGET_START-->')
  const hasRawHTML = /<(div|button|input|table|canvas|form)\s/i.test(raw)

  if (hasRawHTML && !hasWidgetMarker) {
    console.log('RAW HTML DETECTED - rendering as widget')
    return [{ type: 'widget', content: raw }]
  }

  if (!hasWidgetMarker) {
    return parseTextSegments(raw)
  }

  const segments = []
  const parts = raw.split('<!--WIDGET_START-->')

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]

    if (i === 0) {
      if (part.trim()) segments.push(...parseTextSegments(part.trim()))
      continue
    }

    const endIdx = part.indexOf('<!--WIDGET_END-->')

    if (endIdx === -1) {
      const content = part.trim()
      console.log('Widget content (no end marker) length:', content.length)
      segments.push({ type: 'widget', content })
    } else {
      const widgetContent = part.slice(0, endIdx).trim()
      const afterWidget = part.slice(endIdx + '<!--WIDGET_END-->'.length).trim()

      console.log('Widget content length:', widgetContent.length)
      if (widgetContent) segments.push({ type: 'widget', content: widgetContent })
      if (afterWidget) segments.push(...parseTextSegments(afterWidget))
    }
  }

  return segments.length > 0 ? segments : [{ type: 'text', content: raw }]
}

// ── WIDGET IFRAME ────────────────────────────────────────
function WidgetFrame({ html }) {
  const [height, setHeight] = useState(250)

  useEffect(() => {
    console.log('WidgetFrame html length:', html?.length)
    console.log('WidgetFrame html preview:', html?.slice(0, 120))
  }, [html])

  const fullDoc = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    padding: 20px;
    background: #ffffff;
    color: #1a1a1a;
    line-height: 1.6;
  }
  h1,h2,h3,h4 { margin-bottom: 12px; color: #0f172a; }
  p { margin-bottom: 10px; }
  button {
    padding: 8px 18px;
    border-radius: 8px;
    border: 1px solid #dee2e6;
    background: #f8f9fa;
    cursor: pointer;
    font-size: 14px;
    font-family: inherit;
    transition: all 0.15s;
    margin: 4px;
  }
  button:hover { background: #185FA5; color: white; border-color: #185FA5; }
  input[type=range] { width: 100%; accent-color: #185FA5; margin: 6px 0; }
  input[type=number], input[type=text], select {
    padding: 8px 12px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    width: 100%;
  }
  table { border-collapse: collapse; width: 100%; margin: 10px 0; }
  td, th { padding: 8px 12px; border: 1px solid #dee2e6; font-size: 14px; text-align: left; }
  th { background: #f8f9fa; font-weight: 600; }
  canvas { max-width: 100% !important; }
  .card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 16px;
    margin: 10px 0;
  }
  label { display: block; margin-bottom: 4px; font-size: 13px; font-weight: 500; color: #374151; }
</style>
</head>
<body>
${html}
<script>
  function reportHeight() {
    window.parent.postMessage(
      { type: 'navakha-resize', h: document.body.scrollHeight + 40 },
      '*'
    )
  }
  window.addEventListener('load', reportHeight)
  setTimeout(reportHeight, 200)
  setTimeout(reportHeight, 600)
  new MutationObserver(reportHeight)
    .observe(document.body, { subtree: true, childList: true, attributes: true })
<\/script>
</body>
</html>`

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'navakha-resize') {
        setHeight(Math.min(Math.max(e.data.h, 150), 700))
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden',
      background: 'white',
      margin: '12px 0'
    }}>
      <div style={{
        padding: '6px 14px',
        background: '#f0fdf4',
        borderBottom: '1px solid #bbf7d0',
        fontSize: '12px',
        color: '#166534',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: '500'
      }}>
        <span style={{
          width: '8px', height: '8px',
          borderRadius: '50%',
          background: '#22c55e',
          display: 'inline-block'
        }}/>
        Interactive widget
      </div>
      <iframe
        srcDoc={fullDoc}
        sandbox="allow-scripts"
        style={{
          width: '100%',
          height: height + 'px',
          border: 'none',
          display: 'block',
          transition: 'height 0.3s ease'
        }}
        title="Interactive demo"
      />
    </div>
  )
}

// ── MERMAID ──────────────────────────────────────────────
function MermaidBlock({ code }) {
  const ref = useRef()
  const [error, setError] = useState(false)
  // Stable unique ID per instance — never regenerated on re-render
  const idRef = useRef('mmd-' + Date.now() + '-' + Math.random().toString(36).slice(2))

  useEffect(() => {
    if (!code?.trim()) return
    let cancelled = false

    const render = async () => {
      try {
        const m = await import('https://esm.sh/mermaid@11/dist/mermaid.esm.min.mjs')
        if (cancelled) return
        m.default.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: 'base',
          themeVariables: {
            primaryColor: '#E6F1FB',
            primaryBorderColor: '#185FA5',
            primaryTextColor: '#0C447C',
            lineColor: '#185FA5',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '14px'
          }
        })
        const cleanCode = code.replace(/<br\/>/g, '\n').replace(/<br>/g, '\n').trim()
        const { svg } = await m.default.render(idRef.current, cleanCode)
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg
          const svgEl = ref.current.querySelector('svg')
          if (svgEl) { svgEl.style.maxWidth = '100%'; svgEl.style.height = 'auto' }
        }
      } catch (err) {
        console.error('Mermaid render error:', err)
        if (!cancelled) setError(true)
      }
    }

    render()
    return () => { cancelled = true }
  }, [code])

  if (error) return (
    <pre style={{
      background: '#f8f9fa', padding: '12px', borderRadius: '8px',
      fontSize: '12px', overflowX: 'auto', border: '1px solid #e2e8f0',
      whiteSpace: 'pre-wrap'
    }}>{code}</pre>
  )

  return (
    <div
      ref={ref}
      style={{
        background: '#f8faff', borderRadius: '10px', padding: '16px',
        overflowX: 'auto', border: '1px solid #B5D4F4',
        margin: '10px 0', minHeight: '80px',
        display: 'flex', justifyContent: 'center', alignItems: 'center'
      }}
    />
  )
}

// ── CHART.JS ─────────────────────────────────────────────
function ChartBlock({ json }) {
  const canvasRef = useRef()
  const instanceRef = useRef()

  useEffect(() => {
    let config
    try { config = JSON.parse(json) } catch { return }

    const render = () => {
      if (!canvasRef.current) return
      if (instanceRef.current) instanceRef.current.destroy()
      instanceRef.current = new window.Chart(canvasRef.current, config)
    }

    if (window.Chart) {
      render()
    } else {
      const s = document.createElement('script')
      s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js'
      s.onload = render
      document.head.appendChild(s)
    }

    return () => { if (instanceRef.current) instanceRef.current.destroy() }
  }, [json])

  return (
    <div style={{
      position: 'relative', height: '300px',
      background: 'white', borderRadius: '10px',
      padding: '12px', border: '1px solid #e2e8f0',
      margin: '10px 0'
    }}>
      <canvas ref={canvasRef} />
    </div>
  )
}

// ── CODE BLOCK ───────────────────────────────────────────
function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      background: '#1e1e2e', borderRadius: '10px',
      overflow: 'hidden', margin: '10px 0',
      border: '1px solid #313244'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '6px 14px',
        background: '#313244'
      }}>
        <span style={{ fontSize: '12px', color: '#cdd6f4', fontWeight: '500' }}>
          {(lang || 'code').toUpperCase()}
        </span>
        <button onClick={copy} style={{
          background: 'transparent', border: 'none',
          color: copied ? '#a6e3a1' : '#cdd6f4',
          fontSize: '12px', cursor: 'pointer', padding: '2px 8px'
        }}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre style={{
        margin: 0, padding: '14px 16px',
        overflowX: 'auto', fontSize: '13px',
        lineHeight: '1.6', color: '#cdd6f4',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
      }}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

// ── MAIN COMPONENT ───────────────────────────────────────
export default function VisualRenderer({ text }) {
  console.log('=== VISUAL RENDERER CALLED ===')
  console.log('Text length:', text?.length)
  console.log('Has WIDGET_START:', text?.includes('<!--WIDGET_START-->'))

  if (!text) return null
  const segments = parseSegments(text)
  console.log('Segments found:', segments.map(s => s.type))

  return (
    <div style={{ width: '100%' }}>
      {segments.map((seg, i) => {
        if (seg.type === 'widget')  return <WidgetFrame  key={i} html={seg.content} />
        if (seg.type === 'mermaid') return <MermaidBlock key={i} code={seg.content} />
        if (seg.type === 'chartjs') return <ChartBlock   key={i} json={seg.content} />
        if (seg.type === 'code')    return <CodeBlock    key={i} lang={seg.lang} code={seg.content} />
        return (
          <div key={i} style={{ lineHeight: '1.7', fontSize: '15px' }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                h1: ({children}) => <h1 style={{fontSize:'22px',fontWeight:'600',margin:'16px 0 8px',color:'#0f172a'}}>{children}</h1>,
                h2: ({children}) => <h2 style={{fontSize:'19px',fontWeight:'600',margin:'14px 0 6px',color:'#0f172a'}}>{children}</h2>,
                h3: ({children}) => <h3 style={{fontSize:'16px',fontWeight:'600',margin:'12px 0 6px',color:'#185FA5'}}>{children}</h3>,
                p:  ({children}) => <p  style={{margin:'0 0 10px',lineHeight:'1.7'}}>{children}</p>,
                strong: ({children}) => <strong style={{fontWeight:'600',color:'#0f172a'}}>{children}</strong>,
                ul: ({children}) => <ul style={{paddingLeft:'20px',margin:'8px 0'}}>{children}</ul>,
                ol: ({children}) => <ol style={{paddingLeft:'20px',margin:'8px 0'}}>{children}</ol>,
                li: ({children}) => <li style={{margin:'4px 0',lineHeight:'1.6'}}>{children}</li>,
                blockquote: ({children}) => <blockquote style={{borderLeft:'3px solid #185FA5',paddingLeft:'12px',margin:'10px 0',color:'#64748b',fontStyle:'italic'}}>{children}</blockquote>,
                code: ({inline, className, children}) => {
                  if (inline) return <code style={{background:'#f1f5f9',padding:'2px 6px',borderRadius:'4px',fontFamily:'monospace',fontSize:'13px'}}>{children}</code>
                  return <code>{children}</code>
                },
                table: ({children}) => <table style={{borderCollapse:'collapse',width:'100%',margin:'10px 0'}}>{children}</table>,
                th: ({children}) => <th style={{padding:'8px 12px',border:'1px solid #e2e8f0',background:'#f8fafc',fontWeight:'600',textAlign:'left'}}>{children}</th>,
                td: ({children}) => <td style={{padding:'8px 12px',border:'1px solid #e2e8f0'}}>{children}</td>,
              }}
            >
              {seg.content}
            </ReactMarkdown>
          </div>
        )
      })}
    </div>
  )
}
