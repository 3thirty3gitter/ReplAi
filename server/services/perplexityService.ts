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

  const systemPrompt = `You are an expert web application architect. Based on the user's request, generate a comprehensive application plan in JSON format with the following structure:

{
  "name": "Application Name",
  "description": "Brief description of the application",
  "type": "Application Type (e.g., E-commerce, Social Platform, Productivity, etc.)",
  "features": ["Feature 1", "Feature 2", "Feature 3", ...],
  "technologies": ["React", "TypeScript", "Tailwind CSS", "Express.js", "PostgreSQL"],
  "preview": {
    "title": "Preview Title",
    "description": "Marketing description",
    "sections": ["Section 1", "Section 2", "Section 3", ...]
  }
}

Make the plan comprehensive, realistic, and tailored to the user's specific request. Include 8-12 key features that would make this a production-ready application.`;

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

    // Parse the JSON response
    try {
      const plan: AppPlan = JSON.parse(content);
      
      // Validate the plan structure
      if (!plan.name || !plan.description || !plan.type || !plan.features || !plan.technologies || !plan.preview) {
        throw new Error('Invalid plan structure received');
      }

      return plan;
    } catch (parseError) {
      // If JSON parsing fails, create a fallback plan based on the user's request
      return createFallbackPlan(userPrompt);
    }
  } catch (error) {
    console.error('Perplexity API error:', error);
    // Return a fallback plan if the API fails
    return createFallbackPlan(userPrompt);
  }
}

function createFallbackPlan(userPrompt: string): AppPlan {
  const lowerPrompt = userPrompt.toLowerCase();
  
  if (lowerPrompt.includes('surfboard') || lowerPrompt.includes('surf')) {
    return {
      name: "SurfBoard Store",
      description: "A professional e-commerce website for selling surfboards with modern design and full shopping functionality",
      type: "E-commerce",
      features: [
        "Product catalog with surfboard listings",
        "Individual product detail pages",
        "Shopping cart functionality",
        "Secure checkout process",
        "Product search and filtering",
        "Category browsing (longboards, shortboards, funboards)",
        "Product image galleries",
        "Inventory management",
        "Customer reviews and ratings",
        "Responsive mobile design",
        "User account management",
        "Order tracking system"
      ],
      technologies: ["React", "TypeScript", "Tailwind CSS", "Express.js", "PostgreSQL"],
      preview: {
        title: "Wave Rider Surfboards",
        description: "Ride the Wave - Premium surfboards crafted for every skill level. From beginners to pros, find your perfect board.",
        sections: ["Hero Section", "Featured Products", "Shop by Category", "About Us", "Customer Reviews", "Contact"]
      }
    };
  }
  
  if (lowerPrompt.includes('todo') || lowerPrompt.includes('task')) {
    return {
      name: "Task Manager Pro",
      description: "A comprehensive task management application with project organization and team collaboration features",
      type: "Productivity",
      features: [
        "Create and manage tasks",
        "Project organization",
        "Priority levels and due dates",
        "Progress tracking",
        "Categories and tags",
        "Search and filtering",
        "Task completion analytics",
        "Team collaboration",
        "File attachments",
        "Notifications and reminders",
        "Calendar integration",
        "Export functionality"
      ],
      technologies: ["React", "TypeScript", "Tailwind CSS", "Express.js", "PostgreSQL"],
      preview: {
        title: "TaskFlow",
        description: "Organize your work and life with powerful task management",
        sections: ["Dashboard", "Task Lists", "Projects", "Analytics", "Team", "Calendar"]
      }
    };
  }
  
  if (lowerPrompt.includes('blog') || lowerPrompt.includes('content')) {
    return {
      name: "Blog Platform",
      description: "A modern content management system for creating and managing blog posts with rich editing capabilities",
      type: "Content Management",
      features: [
        "Rich text editor",
        "Post creation and editing",
        "Category management",
        "Tag system",
        "Comment system",
        "User authentication",
        "Search functionality",
        "SEO optimization",
        "Image upload and management",
        "Draft and publish workflow",
        "Analytics dashboard",
        "Responsive design"
      ],
      technologies: ["React", "TypeScript", "Tailwind CSS", "Express.js", "PostgreSQL"],
      preview: {
        title: "ContentHub",
        description: "Share your stories with the world through beautiful, engaging blog posts",
        sections: ["Latest Posts", "Categories", "About", "Contact", "Archive"]
      }
    };
  }
  
  // Generic application plan
  return {
    name: "Custom Web Application",
    description: "A modern web application tailored to your specific requirements with full-stack functionality",
    type: "Web Application",
    features: [
      "Responsive design",
      "Modern UI components",
      "User authentication",
      "Database integration",
      "API endpoints",
      "Search functionality",
      "Data visualization",
      "Real-time updates",
      "Mobile optimization",
      "Security features",
      "Performance optimization",
      "Analytics integration"
    ],
    technologies: ["React", "TypeScript", "Tailwind CSS", "Express.js", "PostgreSQL"],
    preview: {
      title: "Your Custom App",
      description: "A comprehensive solution built with modern technologies to meet your specific needs",
      sections: ["Dashboard", "Main Features", "Analytics", "Settings", "Support"]
    }
  };
}