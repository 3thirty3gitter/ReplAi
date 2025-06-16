export interface CodeAssistanceRequest {
  code: string;
  language: string;
  prompt: string;
  context?: string;
}

export interface CodeAssistanceResponse {
  suggestion: string;
  explanation: string;
  confidence: number;
}

function checkApiKey() {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error("PERPLEXITY_API_KEY environment variable is required");
  }
}

export async function getCodeAssistance(request: CodeAssistanceRequest): Promise<CodeAssistanceResponse> {
  try {
    checkApiKey();
    const systemPrompt = `You are an expert programming assistant. Help users with:
- Code optimization and improvements
- Bug fixes and debugging
- Feature implementations
- Best practices and code review
- Code explanations

Respond with JSON in this format: { "suggestion": "improved code or suggestion", "explanation": "detailed explanation", "confidence": number_between_0_and_1 }`;

    const userPrompt = `Language: ${request.language}
Current Code:
\`\`\`${request.language}
${request.code}
\`\`\`

Request: ${request.prompt}

${request.context ? `Additional Context: ${request.context}` : ''}

Please provide a helpful response with code suggestions and explanations.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    
    try {
      const result = JSON.parse(content);
      return {
        suggestion: result.suggestion || "I can help you with your code.",
        explanation: result.explanation || "Let me analyze your request.",
        confidence: Math.max(0, Math.min(1, result.confidence || 0.8))
      };
    } catch (parseError) {
      // If JSON parsing fails, return the raw content
      return {
        suggestion: content,
        explanation: "Here's my response to your coding question.",
        confidence: 0.7
      };
    }
  } catch (error) {
    console.error('Perplexity API error:', error);
    throw new Error('Failed to get code assistance: ' + (error as Error).message);
  }
}

export async function generateCode(prompt: string, language: string = 'javascript'): Promise<string> {
  try {
    checkApiKey();
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: `You are a code generation expert. Generate clean, well-commented ${language} code based on user requirements. Only return the code, no explanations.`
          },
          {
            role: "user",
            content: `Generate ${language} code for: ${prompt}`
          }
        ],
        temperature: 0.2,
        max_tokens: 1500,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || `// Generated ${language} code for: ${prompt}`;
  } catch (error) {
    console.error('Perplexity API error:', error);
    throw new Error('Failed to generate code: ' + (error as Error).message);
  }
}

export async function explainCode(code: string, language: string): Promise<string> {
  try {
    checkApiKey();
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "You are a code explanation expert. Explain code clearly and concisely, breaking down complex concepts for easy understanding."
          },
          {
            role: "user",
            content: `Explain this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Unable to explain the code at this time.';
  } catch (error) {
    console.error('Perplexity API error:', error);
    throw new Error('Failed to explain code: ' + (error as Error).message);
  }
}

export async function debugCode(code: string, language: string, error?: string): Promise<CodeAssistanceResponse> {
  try {
    checkApiKey();
    const prompt = `Debug this ${language} code${error ? ` that's producing this error: ${error}` : ''}:

\`\`\`${language}
${code}
\`\`\`

Find potential issues and provide fixes.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: `You are a debugging expert. Analyze code for bugs, errors, and potential issues. 
            Respond with JSON in this format: { "suggestion": "fixed code", "explanation": "what was wrong and how to fix it", "confidence": number_between_0_and_1 }`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    
    try {
      const result = JSON.parse(content);
      return {
        suggestion: result.suggestion || "Let me analyze your code for issues.",
        explanation: result.explanation || "I'll help you debug this code.",
        confidence: Math.max(0, Math.min(1, result.confidence || 0.8))
      };
    } catch (parseError) {
      return {
        suggestion: content,
        explanation: "Here's my analysis of your code.",
        confidence: 0.7
      };
    }
  } catch (error) {
    console.error('Perplexity API error:', error);
    throw new Error('Failed to debug code: ' + (error as Error).message);
  }
}