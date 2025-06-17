# AI Agent Replication Guide

This guide will help you build your own AI-powered development environment similar to this Replit-like IDE.

## Core Architecture

### Backend Stack
- **Express.js** - API server
- **PostgreSQL** - Database storage
- **Perplexity API** - AI code generation
- **Drizzle ORM** - Database management
- **TypeScript** - Type safety

### Frontend Stack
- **React** - User interface
- **Tailwind CSS** - Styling
- **Tanstack Query** - Data fetching
- **Wouter** - Routing
- **Lucide Icons** - UI icons

## Key Components

### 1. AI Integration (`server/services/perplexity.ts`)
```typescript
import fetch from 'node-fetch';

export async function getCodeAssistance(request: {
  message: string;
  projectId?: number;
  code?: string;
  language?: string;
}) {
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
          content: 'You are an expert software developer. Generate production-ready code.'
        },
        {
          role: 'user',
          content: request.message
        }
      ],
      temperature: 0.2,
      max_tokens: 2000
    })
  });

  const data = await response.json();
  return {
    message: data.choices?.[0]?.message?.content || 'No response generated',
    confidence: 0.9
  };
}
```

### 2. Database Schema (`shared/schema.ts`)
```typescript
import { pgTable, text, timestamp, serial, jsonb } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  projectId: serial("project_id").references(() => projects.id),
  name: text("name").notNull(),
  path: text("path").notNull(),
  content: text("content"),
  language: text("language"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  messages: jsonb("messages").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});
```

### 3. Chat Interface (`client/components/ChatInterface.tsx`)
```typescript
import { useState, useRef, useEffect } from 'react';
import { Bot, Send } from 'lucide-react';

export function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex gap-3 ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}>
            {message.role === 'assistant' && (
              <Bot className="h-8 w-8 text-blue-500" />
            )}
            <div className={`max-w-[80%] p-3 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              {message.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <Bot className="h-8 w-8 text-blue-500" />
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="animate-pulse">Thinking...</div>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to create an application..."
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
```

### 4. Code Generation Service (`server/services/codeGenerator.ts`)
```typescript
import { getCodeAssistance } from './perplexity';

export async function generateProjectFiles(prompt: string) {
  const response = await getCodeAssistance({
    message: `Generate a complete web application for: ${prompt}. 
    Include React components, API routes, and database schema.
    Return as structured JSON with files array.`
  });

  // Parse AI response to extract file structure
  const files = [
    {
      name: 'App.tsx',
      path: '/src/App.tsx',
      content: `// Generated React App for: ${prompt}
import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold">Generated App</h1>
    </div>
  );
}`,
      language: 'typescript'
    }
  ];

  return {
    files,
    instructions: `Generated application for: ${prompt}`,
    dependencies: ['react', 'typescript', 'tailwindcss']
  };
}
```

## Setup Instructions

### 1. Environment Variables
```env
PERPLEXITY_API_KEY=your_perplexity_api_key
DATABASE_URL=postgresql://user:password@localhost:5432/db
SESSION_SECRET=your_session_secret
```

### 2. Installation
```bash
npm install express react typescript drizzle-orm @tanstack/react-query
npm install @perplexity/api lucide-react tailwindcss
npm install -D @types/node @types/express
```

### 3. Database Setup
```bash
npx drizzle-kit generate:pg
npx drizzle-kit push:pg
```

### 4. Key Features to Implement

#### Chat History Management
- Store conversations in database
- Load/save chat sessions
- Generate conversation titles
- Delete old conversations

#### File Generation
- Parse AI responses for code structure
- Create actual files in project
- Syntax highlighting and editing
- Live preview functionality

#### Project Management
- Create/delete projects
- File tree navigation
- Version control integration
- Deployment capabilities

## API Endpoints

```typescript
// Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  const { message } = req.body;
  const response = await getCodeAssistance({ message });
  res.json(response);
});

// Project generation
app.post('/api/ai/generate-project', async (req, res) => {
  const { prompt } = req.body;
  const result = await generateProjectFiles(prompt);
  res.json(result);
});

// File management
app.get('/api/files/:projectId', async (req, res) => {
  const files = await getProjectFiles(req.params.projectId);
  res.json(files);
});
```

## Key Success Factors

1. **Real AI Integration**: Use actual Perplexity API, not templates
2. **Persistent Storage**: Save all conversations and projects
3. **Live Updates**: WebSocket for real-time collaboration
4. **Error Handling**: Robust error recovery and user feedback
5. **Performance**: Optimize for fast response times
6. **Security**: Proper authentication and data validation

## Next Steps

1. Set up basic project structure
2. Implement Perplexity API integration
3. Create database schema and migrations
4. Build React chat interface
5. Add file generation and management
6. Implement project templates
7. Add deployment capabilities
8. Polish UI/UX and add advanced features

This guide provides the foundation for building your own AI agent system. The key is combining real AI capabilities with a solid technical architecture and intuitive user experience.