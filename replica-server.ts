import express from 'express';
import session from 'express-session';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import { conversations, projects, files } from './replica-schema.js';
import type { Message } from './replica-schema.js';

// CORS middleware implementation
const cors = (req: any, res: any, next: any) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'replica-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Database setup
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/ai_replica'
});
export const db = drizzle(pool);

// AI Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!process.env.PERPLEXITY_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'Perplexity API key required. Please set PERPLEXITY_API_KEY environment variable.' 
      });
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an expert software developer and AI assistant. Help users create applications, write code, and solve technical problems. Be detailed and practical in your responses.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.2,
        max_tokens: 2000
      })
    });

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || 'No response generated';

    res.json({
      success: true,
      message: aiMessage,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process AI request' 
    });
  }
});

// Generate application plan
app.post('/api/ai/generate-plan', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    const planResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'Create a detailed application plan in JSON format. Respond with valid JSON containing: name, description, type, features array, technologies array, and preview object with title, description, and sections array.'
          },
          {
            role: 'user',
            content: `Create an application plan for: ${prompt}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    const data = await planResponse.json();
    const planContent = data.choices?.[0]?.message?.content || '';
    
    let plan;
    try {
      const jsonMatch = planContent.match(/\{[\s\S]*\}/);
      plan = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (parseError) {
      plan = {
        name: "Custom Application",
        description: `A modern application for: ${prompt}`,
        type: "Web Application",
        features: ["Responsive design", "User interface", "Core functionality"],
        technologies: ["React", "TypeScript", "Tailwind CSS"],
        preview: {
          title: "Your Application",
          description: "A custom-built solution",
          sections: ["Main Interface", "Features", "Settings"]
        }
      };
    }

    res.json({ success: true, plan });

  } catch (error) {
    console.error('Plan generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate application plan' 
    });
  }
});

// Generate project files
app.post('/api/ai/generate-project', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!process.env.PERPLEXITY_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'Perplexity API key required for file generation' 
      });
    }

    console.log('Generating application files using Perplexity AI for:', prompt);
    const startTime = Date.now();

    // Generate React component using Perplexity AI
    const reactResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: `Generate a complete React TypeScript component file. Return ONLY the code without explanations or markdown formatting. Create a functional component that implements the requested application with proper TypeScript types, modern React patterns, and Tailwind CSS styling.`
          },
          {
            role: 'user',
            content: `Create a React component for: ${prompt}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    const reactData = await reactResponse.json();
    const reactCode = reactData.choices?.[0]?.message?.content || `// Generated React component for: ${prompt}\nexport default function App() { return <div>Loading...</div>; }`;

    // Generate Express routes using Perplexity AI
    const backendResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: `Generate Express.js TypeScript route handlers. Return ONLY the code without explanations or markdown formatting. Create RESTful API endpoints that support the frontend application with proper error handling and TypeScript types.`
          },
          {
            role: 'user',
            content: `Create Express routes for: ${prompt}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    const backendData = await backendResponse.json();
    const backendCode = backendData.choices?.[0]?.message?.content || `// Generated Express routes for: ${prompt}\nexport const routes = {};`;

    // Generate database schema using Perplexity AI
    const schemaResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: `Generate a Drizzle ORM schema file. Return ONLY the code without explanations or markdown formatting. Create PostgreSQL table definitions using Drizzle ORM syntax with proper TypeScript types and relationships.`
          },
          {
            role: 'user',
            content: `Create database schema for: ${prompt}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    const schemaData = await schemaResponse.json();
    const schemaCode = schemaData.choices?.[0]?.message?.content || `// Generated schema for: ${prompt}\nexport const schema = {};`;

    const files = [
      {
        name: 'App.tsx',
        path: '/client/src/App.tsx',
        content: reactCode,
        language: 'typescript',
        description: 'React frontend application generated by Perplexity AI'
      },
      {
        name: 'routes.ts',
        path: '/server/routes.ts',
        content: backendCode,
        language: 'typescript',
        description: 'Express backend API generated by Perplexity AI'
      },
      {
        name: 'schema.ts',
        path: '/shared/schema.ts',
        content: schemaCode,
        language: 'typescript',
        description: 'Database schema generated by Perplexity AI'
      }
    ];

    const generationTime = Date.now() - startTime;
    console.log(`Generated ${files.length} files in ${generationTime}ms using Perplexity AI`);

    // Store files in database if needed
    for (const file of files) {
      try {
        await db.insert(files).values({
          projectId: 1,
          name: file.name,
          path: file.path,
          content: file.content,
          language: file.language,
          isDirectory: false
        }).onConflictDoNothing();
      } catch (dbError) {
        console.warn('Database storage failed:', dbError);
      }
    }

    res.json({
      success: true,
      filesCreated: files.length,
      files: files.map(f => ({
        name: f.name,
        path: f.path,
        description: f.description
      })),
      instructions: `Generated ${files.length} files using Perplexity AI for your application: ${prompt}`,
      generationTime,
      aiGenerated: true
    });

  } catch (error) {
    console.error('Project generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate project files using AI. Please check your Perplexity API configuration.' 
    });
  }
});

// Conversation management
app.post('/api/conversations', async (req, res) => {
  try {
    const { id, title, messages } = req.body;
    
    await db.insert(conversations).values({
      id,
      title,
      messages: JSON.stringify(messages)
    }).onConflictDoUpdate({
      target: conversations.id,
      set: {
        title,
        messages: JSON.stringify(messages)
      }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save conversation' });
  }
});

app.get('/api/conversations', async (req, res) => {
  try {
    const allConversations = await db.select().from(conversations);
    res.json(allConversations.map(conv => ({
      id: conv.id,
      title: conv.title,
      timestamp: conv.timestamp?.getTime() || Date.now(),
      messages: typeof conv.messages === 'string' ? JSON.parse(conv.messages) : conv.messages
    })));
  } catch (error) {
    res.json([]);
  }
});

app.delete('/api/conversations/:id', async (req, res) => {
  try {
    await db.delete(conversations).where(eq(conversations.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    perplexityConfigured: !!process.env.PERPLEXITY_API_KEY
  });
});

app.listen(port, () => {
  console.log(`🚀 AI Agent Replica running on port ${port}`);
});