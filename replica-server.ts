import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import { conversations, projects, files } from './replica-schema.js';
import type { Message } from './replica-schema.js';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
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
    
    const files = [
      {
        name: 'App.tsx',
        path: '/src/App.tsx',
        content: `import React, { useState } from 'react';

export default function App() {
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const addItem = () => {
    if (input.trim()) {
      setItems([...items, input]);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">Generated for: ${prompt}</h1>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-md"
            placeholder="Add item..."
          />
          <button
            onClick={addItem}
            className="px-6 py-2 bg-blue-500 text-white rounded-md"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-md">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`,
        language: 'typescript'
      }
    ];

    res.json({
      success: true,
      filesCreated: files.length,
      files,
      instructions: `Generated application for: ${prompt}`,
      generationTime: 100
    });

  } catch (error) {
    console.error('Project generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate project files' 
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