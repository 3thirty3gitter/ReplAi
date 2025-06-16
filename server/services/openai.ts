import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured. Please add your API key in Settings.");
  }
  
  // Create new client if none exists or API key changed
  if (!openaiClient) {
    openaiClient = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  
  return openaiClient;
}

// Reset client when API key changes
export function resetOpenAIClient() {
  openaiClient = null;
}

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

export async function getCodeAssistance(request: CodeAssistanceRequest): Promise<CodeAssistanceResponse> {
  try {
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

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      suggestion: result.suggestion || "I need more information to provide a helpful suggestion.",
      explanation: result.explanation || "Please provide more details about what you'd like help with.",
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5))
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to get code assistance: ' + (error as Error).message);
  }
}

export async function generateCode(prompt: string, language: string = 'javascript'): Promise<string> {
  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a code generation expert. Generate clean, well-commented, production-ready code in ${language}. Only return the code, no explanations.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 2000
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('OpenAI code generation error:', error);
    throw new Error('Failed to generate code: ' + (error as Error).message);
  }
}

export async function explainCode(code: string, language: string): Promise<string> {
  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a code explanation expert. Provide clear, detailed explanations of code functionality, breaking down complex parts into understandable concepts."
        },
        {
          role: "user",
          content: `Please explain this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    return response.choices[0].message.content || 'Unable to explain the code.';
  } catch (error) {
    console.error('OpenAI code explanation error:', error);
    throw new Error('Failed to explain code: ' + (error as Error).message);
  }
}

export async function debugCode(code: string, language: string, error?: string): Promise<CodeAssistanceResponse> {
  try {
    const prompt = `Debug this ${language} code${error ? ` that's producing this error: ${error}` : ''}:

\`\`\`${language}
${code}
\`\`\`

Find potential issues and provide fixes.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
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
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 1000
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      suggestion: result.suggestion || "No specific issues found in the code.",
      explanation: result.explanation || "The code appears to be syntactically correct.",
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5))
    };
  } catch (error) {
    console.error('OpenAI debugging error:', error);
    throw new Error('Failed to debug code: ' + (error as Error).message);
  }
}
