interface PerplexityRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  citations?: string[];
}

export interface AppPlan {
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
}

export async function generateAppPlan(userPrompt: string): Promise<AppPlan> {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY is not configured');
  }

  const systemPrompt = `You are an expert full-stack application architect. Based on the user's request, generate a comprehensive application plan in JSON format with the following structure:

{
  "name": "Application Name",
  "description": "Brief description of the application and its purpose",
  "type": "Application Type (e.g., E-commerce, Social Platform, Productivity, SaaS, etc.)",
  "features": ["Feature 1", "Feature 2", "Feature 3", ...],
  "technologies": ["React", "TypeScript", "Tailwind CSS", "Express.js", "PostgreSQL"],
  "preview": {
    "title": "Preview Title",
    "description": "Marketing description",
    "sections": ["Section 1", "Section 2", "Section 3", ...]
  }
}

Make the plan comprehensive, realistic, and tailored to the user's specific request. Include 8-15 key features that would make this a production-ready, fully functional application. Consider modern web development best practices, user experience, security, and scalability.`;

  const request: PerplexityRequest = {
    model: "llama-3.1-sonar-small-128k-online",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: `Create a comprehensive application plan for: ${userPrompt}. Respond with only valid JSON.`
      }
    ],
    max_tokens: 2000,
    temperature: 0.2,
    top_p: 0.9,
    stream: false
  };

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data: PerplexityResponse = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from Perplexity API');
    }

    // Parse the JSON response, handling markdown code blocks
    try {
      let jsonContent = content.trim();
      
      // Extract JSON from markdown code blocks
      const codeBlockMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonContent = codeBlockMatch[1].trim();
      } else {
        // If no code blocks, try to find JSON object boundaries
        const firstBrace = jsonContent.indexOf('{');
        const lastBrace = jsonContent.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonContent = jsonContent.substring(firstBrace, lastBrace + 1);
        }
      }
      
      const plan: AppPlan = JSON.parse(jsonContent);
      
      // Validate the plan structure
      if (!plan.name || !plan.description || !plan.type || !plan.features || !plan.technologies || !plan.preview) {
        throw new Error('Invalid plan structure received');
      }

      return plan;
    } catch (parseError) {
      console.error('Failed to parse JSON from Perplexity:', parseError);
      console.log('Raw content:', content);
      throw new Error('Perplexity returned invalid JSON format');
    }
  } catch (error) {
    console.error('Perplexity API error:', error);
    throw error;
  }
}