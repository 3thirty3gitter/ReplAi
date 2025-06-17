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

function buildSystemPrompt(intent: UserIntent | null, context: ProjectContext | null): string {
  let systemPrompt = `You are an expert AI coding assistant integrated into an IDE, similar to Replit's AI agent. You have full-stack development capabilities and can:

1. **Context Understanding**: Analyze entire project structures, dependencies, and user intent
2. **Complete App Generation**: Create full-stack applications from high-level descriptions
3. **Code Analysis**: Debug, explain, and refactor existing code with deep understanding
4. **Tool Integration**: Work seamlessly with modern development tools and frameworks
5. **Best Practices**: Follow industry standards, clean code principles, and scalable architecture

You provide production-ready code with detailed explanations and comprehensive solutions.`;

  if (intent) {
    systemPrompt += `\n\n**Current User Intent**: ${intent.type} - ${intent.description}`;
    if (intent.appType) systemPrompt += `\n**Application Type**: ${intent.appType}`;
    if (intent.domain) systemPrompt += `\n**Domain**: ${intent.domain}`;
    if (intent.complexity) systemPrompt += `\n**Complexity Level**: ${intent.complexity}`;
    if (intent.features && intent.features.length > 0) {
      systemPrompt += `\n**Required Features**: ${intent.features.join(', ')}`;
    }
    if (intent.technologies && intent.technologies.length > 0) {
      systemPrompt += `\n**Preferred Technologies**: ${intent.technologies.join(', ')}`;
    }
  }

  if (context) {
    systemPrompt += `\n\n**Project Context**:`;
    systemPrompt += `\n- Project: ${context.project.name} (${context.project.description})`;
    systemPrompt += `\n- Total Files: ${context.files.length}`;
    systemPrompt += `\n- Dependencies: ${context.dependencies.length > 0 ? context.dependencies.join(', ') : 'None detected'}`;
    
    if (context.errors.length > 0) {
      systemPrompt += `\n- Current Issues: ${context.errors.join(', ')}`;
    }

    // Add file structure overview
    const codeFiles = context.files.filter(f => !f.isDirectory && f.content);
    if (codeFiles.length > 0) {
      systemPrompt += `\n- Code Files: ${codeFiles.map(f => `${f.name} (${f.language})`).join(', ')}`;
    }
  }

  return systemPrompt;
}

function buildUserPrompt(
  request: CodeAssistanceRequest, 
  context: ProjectContext | null,
  intent: UserIntent | null
): string {
  let userPrompt = `**User Request**: ${request.message}`;

  // Add current code context if provided
  if (request.code && request.language) {
    userPrompt += `\n\n**Current Code Context** (${request.language}):\n\`\`\`${request.language}\n${request.code}\n\`\`\``;
  }

  // Add relevant project files for context (limit to avoid token overflow)
  if (context && context.files.length > 0) {
    const relevantFiles = context.files
      .filter(f => !f.isDirectory && f.content && f.content.trim().length > 0)
      .slice(0, 2); // Limit to most relevant files
    
    if (relevantFiles.length > 0) {
      userPrompt += `\n\n**Existing Project Files**:`;
      relevantFiles.forEach(file => {
        const truncatedContent = file.content!.length > 800 ? 
          file.content!.substring(0, 800) + '\n... (truncated)' : 
          file.content!;
        userPrompt += `\n\n**${file.path}** (${file.language}):\n\`\`\`${file.language}\n${truncatedContent}\n\`\`\``;
      });
    }
  }

  // Add intent-specific instructions
  if (intent) {
    switch (intent.type) {
      case 'create_app':
        userPrompt += `\n\n**Task**: Create a ${intent.complexity} ${intent.appType || 'web application'} with the following requirements:`;
        if (intent.features && intent.features.length > 0) {
          userPrompt += `\n- Features: ${intent.features.join(', ')}`;
        }
        userPrompt += `\n- Provide a detailed development plan and implementation strategy`;
        userPrompt += `\n- Include file structure, key components, and technical approach`;
        break;
      case 'debug':
        userPrompt += `\n\n**Debug Task**: Analyze the provided code and identify any issues, bugs, or improvements needed.`;
        break;
      case 'explain':
        userPrompt += `\n\n**Explanation Task**: Provide a comprehensive explanation of the code functionality, architecture, and implementation details.`;
        break;
      case 'generate_feature':
        userPrompt += `\n\n**Feature Development**: Implement the requested functionality within the existing codebase structure.`;
        break;
      case 'modify_code':
        userPrompt += `\n\n**Code Modification**: Update the existing code according to the specified requirements.`;
        break;
    }
  }

  return userPrompt;
}

function extractAppPlan(content: string, intent: UserIntent): any {
  // Create a structured plan based on the AI response and user intent
  const plan = {
    name: intent.appType ? `${intent.appType.charAt(0).toUpperCase() + intent.appType.slice(1)} Application` : "Custom Web Application",
    description: intent.description || "A modern web application built with cutting-edge technologies",
    type: intent.appType || "Web Application",
    features: intent.features || [
      "Modern responsive design",
      "User-friendly interface", 
      "Backend API integration",
      "Database connectivity",
      "Real-time functionality"
    ],
    technologies: intent.technologies && intent.technologies.length > 0 ? 
      intent.technologies : 
      ["React", "TypeScript", "Node.js", "Express", "PostgreSQL"],
    preview: {
      title: intent.appType ? 
        `${intent.appType.charAt(0).toUpperCase() + intent.appType.slice(1)} Platform` : 
        "Custom Application",
      description: intent.description || "A comprehensive solution built with modern web technologies",
      sections: intent.appType === 'e-commerce' ? 
        ["Product Catalog", "Shopping Cart", "User Authentication", "Payment Integration"] :
        intent.appType === 'social' ?
        ["User Profiles", "Feed", "Messaging", "Content Sharing"] :
        ["Dashboard", "Main Features", "User Management", "Settings"]
    }
  };

  return plan;
}

export async function getCodeAssistance(request: CodeAssistanceRequest): Promise<CodeAssistanceResponse> {
  try {
    checkApiKey();
    
    // Gather comprehensive context like Replit AI agent
    let context: ProjectContext | null = null;
    let intent: UserIntent | null = null;

    if (request.projectId) {
      try {
        context = await contextBuilder.gatherProjectContext(request.projectId);
        intent = contextBuilder.analyzeUserIntent(request.message);
      } catch (error) {
        console.warn('Could not gather project context:', error);
      }
    }

    const systemPrompt = buildSystemPrompt(intent, context);
    const userPrompt = buildUserPrompt(request, context, intent);

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
    
    // For app creation requests, try to extract a plan
    let plan = null;
    if (intent?.type === 'create_app') {
      plan = extractAppPlan(content, intent);
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