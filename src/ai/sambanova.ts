'use server';

interface ImageMessage {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string }; // base64 image
}

export async function sambanovaChat(
  prompt: string, 
  systemPrompt?: string,
  imageBase64?: string // NEW: Medical image
) {
  const apiKey = process.env.SAMBANOVA_API_KEY;
  const model = process.env.SAMBANOVA_MODEL || 'Llama-3.2-11B-Vision-Instruct'; // ✅ VISION MODEL

  if (!apiKey) throw new Error('SAMBANOVA_API_KEY missing');

  const messages: any[] = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  // Multimodal message with image + text
  const content: ImageMessage[] = [];
  if (imageBase64) {
    content.push(
      { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
      { type: 'text', text: prompt }
    );
  } else {
    content.push({ type: 'text', text: prompt });
  }

  messages.push({ role: 'user', content });

  try {
    const response = await fetch('https://api.sambanova.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`SambaNova [${response.status}]: ${errorData.error?.message || 'Failed'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error: any) {
    throw new Error(`AI Error: ${error.message}`);
  }
}
