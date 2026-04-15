import type { Message } from '../components/MessageBubble';

export function downloadChatAsGraph(messages: Message[]) {
  if (messages.length === 0) return;

  let mermaidStr = 'graph TD\n';
  
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    // Sanitize message content for the mermaid label
    const safeContent = msg.content
      .replace(/"/g, "'")
      .replace(/[\n\r]+/g, " ")
      .replace(/[<>{}()]/g, "") // remove characters that break mermaid syntax
      .substring(0, 60) + (msg.content.length > 60 ? '...' : '');
      
    const nodeId = `msg_${i}`;
    let nodeLabel = '';
    
    if (msg.role === 'user') {
      nodeLabel = `User: ${safeContent}`;
      mermaidStr += `  ${nodeId}["👤 ${nodeLabel}"]\n`;
      mermaidStr += `  style ${nodeId} fill:#2563eb,stroke:#1e40af,color:#fff,stroke-width:2px,border-radius:8px\n`;
    } else {
      nodeLabel = `xAI (${msg.modelName || 'agent'}): ${safeContent}`;
      mermaidStr += `  ${nodeId}["🤖 ${nodeLabel}"]\n`;
      mermaidStr += `  style ${nodeId} fill:#1e293b,stroke:#475569,color:#fff,stroke-width:2px,border-radius:8px\n`;
    }
    
    if (i > 0) {
      mermaidStr += `  msg_${i-1} --> ${nodeId}\n`;
    }
  }

  // Self-contained HTML file using Mermaid
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>xAI Conversation Graph</title>
  <style>
    body {
      background-color: #0f172a;
      color: white;
      font-family: ui-sans-serif, system-ui, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      margin: 0;
      min-height: 100vh;
    }
    h1 {
      font-size: 1.5rem;
      margin-bottom: 30px;
      background: linear-gradient(to right, #60a5fa, #c084fc);
      -webkit-background-clip: text;
      color: transparent;
    }
    .mermaid {
      background: #0b0f19;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      border: 1px solid #1e293b;
      max-width: 100%;
      overflow: auto;
    }
  </style>
</head>
<body>
  <h1>xAI Conversation Graph</h1>
  <div class="mermaid">
${mermaidStr}
  </div>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true, theme: 'dark', securityLevel: 'loose' });
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
