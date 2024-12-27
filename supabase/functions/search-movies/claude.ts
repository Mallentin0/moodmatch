const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');

export async function analyzePrompt(prompt: string): Promise<any> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `You are "MovieRecommender Claude," an AI assistant for moodwatch.ai.
        
        Parse this prompt to identify key attributes and return ONLY a JSON object with these fields:
        - genre (string): Primary genre (e.g., comedy, thriller)
        - mood (string): Tone/mood (e.g., funny, dark)
        - year (number or null): Specific year or decade mentioned
        - keywords (array): Additional search terms
        - streaming (array): Mentioned streaming platforms
        
        For this prompt: "${prompt}"
        
        Return valid JSON only, no other text.`
      }]
    })
  });

  const data = await response.json();
  if (!data.content || !data.content[0] || !data.content[0].text) {
    throw new Error('Invalid Claude API response');
  }

  return JSON.parse(data.content[0].text);
}