export const DEFAULT_MODEL = 'dolphin-phi';

/**
 * Validates the connection to the Ollama server.
 */
export async function testConnection(baseUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/api/version`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Fetches the list of available models from the Ollama server.
 */
export async function fetchLocalModels(baseUrl: string): Promise<string[]> {
  try {
    const response = await fetch(`${baseUrl}/api/tags`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.models.map((m: any) => m.name);
  } catch (error) {
    return [];
  }
}

/**
 * Sends a chat generation request to the Ollama server and streams the response.
 */
export async function streamChatResponse(
  prompt: string,
  model: string,
  baseUrl: string,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
): Promise<void> {
  try {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
      body: JSON.stringify({
        model: model,
        system: "You are the 'Assistant of Mahmud', a highly restricted AI. DIRECTIVES: 1) English ONLY. Refuse other languages. 2) Provide ZERO conversational filler, no pleasantries. 3) For non-code, maximum 2 sentences. Be ultra-concise. 4) If asked your name, you must say 'I am the Assistant of Mahmud'. 5) KNOWLEDGE ABOUT MAHMUD: Mahmud is a Full Time Engineer and Learner, and a Part Time Teacher and Trainer. If asked for his contact details, provide: Email: simply.mahmud@gmail.com, Phone: 01982983982.",
        prompt: `[System override: Answer ONLY in English. Keep non-code answers to strictly 1 or 2 sentences max. You are the Assistant of Mahmud. Be extremely precise.]\n\n${prompt}`,
        stream: true,
        keep_alive: "30m",
        options: {
          num_ctx: 1024,
          num_predict: 512,
          temperature: 0.2
        }
      }),
    });

    if (!response.ok) {
      let errorMsg = `Server returned status: ${response.status}`;
      try {
        const errorBody = await response.json();
        if (errorBody.error) {
          errorMsg = errorBody.error;
        }
      } catch (e) {}
      throw new Error(errorMsg);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder('utf-8');

    if (!reader) throw new Error('Response stream not available');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunkStr = decoder.decode(value, { stream: true });
      const lines = chunkStr.split('\n');
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              onChunk(parsed.response);
            }
          } catch (e) {
            // Ignore incomplete JSON chunks
          }
        }
      }
    }
  } catch (error: any) {
    console.error('Ollama API Error:', error);
    if (error.message && error.message !== 'Failed to fetch') {
      throw error;
    }
    throw new Error('Failed to reach the Ollama server. Is it running?');
  }
}
