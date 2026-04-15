import type { Message } from '../components/MessageBubble';

export function downloadChatAsText(messages: Message[]) {
  if (messages.length === 0) return;

  const dateStr = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  
  let textOutput = `xAI Chat Log - ${dateStr}\n`;
  textOutput += `=====================================\n\n`;

  for (const msg of messages) {
    if (msg.role === 'user') {
      textOutput += `[User]\n${msg.content}\n\n`;
    } else {
      const model = msg.modelName || 'agent';
      textOutput += `[xAI (${model})]\n${msg.content}\n\n`;
    }
    textOutput += `-------------------------------------\n\n`;
  }

  const blob = new Blob([textOutput], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `xAI-Chat-Log-${dateStr}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
