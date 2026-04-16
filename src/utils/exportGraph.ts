import type { Message } from '../components/MessageBubble';

export function downloadChatAsGraph(messages: Message[]) {
  if (messages.length === 0) return;

  let mermaidStr = 'graph TD\n';
  mermaidStr += '  classDef default fill:#0f172a,stroke:#334155,stroke-width:2px,color:#f8fafc,rx:12,ry:12;\n';
  
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    // Sanitize message content for the mermaid label
    const safeContent = msg.content
      .replace(/"/g, "'")
      .replace(/[\n\r]+/g, " ")
      .replace(/[<>{}()]/g, "") // remove characters that break mermaid syntax
      .substring(0, 70) + (msg.content.length > 70 ? '...' : '');
      
    const nodeId = `msg_${i}`;
    let nodeLabel = '';
    
    // Using (...) creates rounded rectangle nodes
    if (msg.role === 'user') {
      nodeLabel = `User: ${safeContent}`;
      mermaidStr += `  ${nodeId}("👤 ${nodeLabel}")\n`;
      // Vibrant blue for user
      mermaidStr += `  style ${nodeId} fill:#2563eb,stroke:#93c5fd,color:#ffffff,stroke-width:2px\n`;
    } else {
      nodeLabel = `xAI (${msg.modelName || 'agent'}): ${safeContent}`;
      mermaidStr += `  ${nodeId}("🤖 ${nodeLabel}")\n`;
      // Deep purple/slate for AI
      mermaidStr += `  style ${nodeId} fill:#1e1b4b,stroke:#a855f7,color:#ffffff,stroke-width:2px\n`;
    }
    
    if (i > 0) {
      mermaidStr += `  msg_${i-1} --> ${nodeId}\n`;
    }
  }
  
  // Custom link styles for connections
  mermaidStr += `  linkStyle default stroke:#64748b,stroke-width:2px,fill:none;\n`;

  // Self-contained HTML file using Mermaid
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>xAI Conversation Graph</title>
  <style>
    body {
      background-color: #030712;
      color: white;
      font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0;
      margin: 0;
      min-height: 100vh;
      overflow-x: hidden;
    }
    body::before {
      content: '';
      position: fixed;
      top: -20%; left: -10%;
      width: 600px; height: 600px;
      background: rgba(37, 99, 235, 0.15);
      border-radius: 50%;
      filter: blur(120px);
      z-index: -1;
    }
    body::after {
      content: '';
      position: fixed;
      bottom: -20%; right: -10%;
      width: 600px; height: 600px;
      background: rgba(147, 51, 234, 0.15);
      border-radius: 50%;
      filter: blur(120px);
      z-index: -1;
    }
    .header {
      width: 100%;
      padding: 25px 0;
      text-align: center;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255,255,255,0.05);
      margin-bottom: 40px;
      position: sticky;
      top: 0;
      z-index: 10;
      box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
    }
    h1 {
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0;
      background: linear-gradient(to right, #60a5fa, #c084fc, #f472b6);
      -webkit-background-clip: text;
      color: transparent;
    }
    p.subtitle {
      color: #94a3b8;
      font-size: 0.95rem;
      margin-top: 8px;
      margin-bottom: 0px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .mermaid-wrapper {
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(20px);
      padding: 40px;
      border-radius: 32px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05);
      max-width: 90vw;
      width: auto;
      overflow: auto;
      margin-bottom: 60px;
      transition: transform 0.3s ease;
    }
    .mermaid-wrapper:hover {
      box-shadow: 0 35px 60px -15px rgba(168, 85, 247, 0.2), inset 0 0 0 1px rgba(255,255,255,0.1);
    }
    svg {
      filter: drop-shadow(0 10px 15px rgba(0,0,0,0.4));
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>xAI Network Node</h1>
    <p class="subtitle">Interactive Dialogue Blueprint</p>
  </div>
  <div class="mermaid-wrapper">
    <div class="mermaid">
${mermaidStr}
    </div>
  </div>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ 
      startOnLoad: true, 
      theme: 'dark', 
      securityLevel: 'loose',
      fontFamily: 'Inter, ui-sans-serif, system-ui'
    });
  </script>
</body>
</html>`;

  // Trigger download
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `xAI-Chat-Graph-${dateStr}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
