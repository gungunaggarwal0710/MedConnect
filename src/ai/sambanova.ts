'use server';

/**
 * @fileOverview SambaNova Cloud API Service for MedConnect+
 * This file handles all direct interactions with the SambaNova LLM.
 */

export async function sambanovaChat(prompt: string, systemPrompt?: string) {
  const apiKey = process.env.SAMBANOVA_API_KEY;
  const model = process.env.SAMBANOVA_MODEL || 'meta-llama-3.1-405b-instruct';

  if (!apiKey) {
    throw new Error('SAMBANOVA_API_KEY is missing. Please add it to your environment variables.');
  }

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  try {
    const response = await fetch('https://api.sambanova.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.1, // Low temperature for accuracy
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`SambaNova API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error('SambaNova API Call Failed:', error);
    throw error;
  }
}
