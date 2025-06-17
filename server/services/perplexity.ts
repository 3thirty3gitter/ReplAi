import { contextBuilder, type ProjectContext, type UserIntent } from './contextBuilder';

export interface CodeAssistanceRequest {
  message: string;
  projectId?: number;
  code?: string;
  language?: string;
  context?: string;
}

export interface CodeAssistanceResponse {
  message: string;
  plan?: {
    name: string;
    description: string;
    type: string;
    features: string[];
    technologies: string[];
    preview: {
      title: string;
      description: string;
      sections: string[];
    };
  };
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
    
    const systemPrompt = `You are an expert AI coding assistant integrated into an IDE, similar to Replit's AI agent. You have full-stack development capabilities and can:

1. **Context Understanding**: Analyze project structures, dependencies, and user intent
2. **Complete App Generation**: Create full-stack applications from high-level descriptions
3. **Code Analysis**: Debug, explain, and refactor existing code with deep understanding
4. **Tool Integration**: Work seamlessly with modern development tools and frameworks
5. **Best Practices**: Follow industry standards, clean code principles, and scalable architecture

You provide production-ready code with detailed explanations and comprehensive solutions.`;

    const userPrompt = `**User Request**: ${request.message}`;

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
        temperature: 0.2,
        max_tokens: 3000,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Create plan for app creation requests
    let plan = undefined;
    if (request.message.toLowerCase().includes('build') || request.message.toLowerCase().includes('create')) {
      plan = {
        name: "Custom Web Application",
        description: "A modern web application built with cutting-edge technologies",
        type: "Web Application",
        features: [
          "Modern responsive design",
          "User-friendly interface", 
          "Backend API integration",
          "Database connectivity",
          "Real-time functionality"
        ],
        technologies: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL"],
        preview: {
          title: "Custom Application",
          description: "A comprehensive solution built with modern web technologies",
          sections: ["Dashboard", "Main Features", "User Management", "Settings"]
        }
      };
    }
    
    return {
      message: content,
      plan,
      confidence: 0.9
    };
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
            content: `You are an expert ${language} developer. Generate clean, production-ready code based on the user's requirements. Include comments and follow best practices.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('Perplexity generateCode error:', error);
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
            content: "You are an expert code reviewer and teacher. Explain the provided code clearly, including its purpose, how it works, and any notable patterns or best practices used."
          },
          {
            role: "user",
            content: `Please explain this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('Perplexity explainCode error:', error);
    throw new Error('Failed to explain code: ' + (error as Error).message);
  }
}

export async function debugCode(code: string, language: string, error?: string): Promise<CodeAssistanceResponse> {
  try {
    checkApiKey();
    let prompt = `Debug this ${language} code and suggest fixes:\n\n\`\`\`${language}\n${code}\n\`\`\``;
    
    if (error) {
      prompt += `\n\nError message: ${error}`;
    }
    
    prompt += '\n\nProvide specific suggestions to fix any issues and explain the problems.';

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
            content: "You are an expert debugger. Analyze code for bugs, performance issues, and improvements. Provide clear explanations and actionable solutions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    return {
      message: content,
      confidence: 0.9
    };
  } catch (error) {
    console.error('Perplexity debugCode error:', error);
    throw new Error('Failed to debug code: ' + (error as Error).message);
  }
}