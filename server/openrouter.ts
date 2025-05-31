export async function generateCompletion(
  apiKey: string,
  prompt: string,
  model: string,
  temperature: number,
  systemPrompt?: string
): Promise<{ content: string; tokensUsed: number }> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://openrouter-studio.replit.app',
      'X-Title': 'OpenRouter Studio',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        ...(systemPrompt ? [{
          role: 'system',
          content: systemPrompt,
        }] : []),
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: temperature,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `OpenRouter API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response format from OpenRouter API');
  }

  return {
    content: data.choices[0].message.content,
    tokensUsed: data.usage?.total_tokens || 0,
  };
}