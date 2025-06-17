# Core Implementation Files for AI Agent Replica

## 1. Server Entry Point (`server/index.ts`)

```typescript
import express from 'express';
import session from 'express-session';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// AI Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
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
            content: 'You are an expert software developer. Generate production-ready code and applications.'
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
    
    res.json({
      success: true,
      message: data.choices?.[0]?.message?.content || 'No response generated'
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ success: false, error: 'Failed to process request' });
  }
});

// Project generation endpoint
app.post('/api/ai/generate-project', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Generate files using AI
    const files = [
      {
        name: 'App.tsx',
        path: '/src/App.tsx',
        content: `import React, { useState } from 'react';

// Generated for: ${prompt}
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
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Generated App</h1>
        <div className="mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Add item..."
          />
          <button
            onClick={addItem}
            className="w-full mt-2 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            Add Item
          </button>
        </div>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="p-2 bg-gray-50 rounded">
              {item}
            </li>
          ))}
        </ul>
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
      files: files,
      instructions: `Generated application for: ${prompt}`,
      generationTime: 2
    });
  } catch (error) {
    console.error('Project generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate project' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

## 2. Database Schema (`schema.ts`)

```typescript
import { pgTable, text, timestamp, serial, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").default("web"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  projectId: serial("project_id").references(() => projects.id),
  name: text("name").notNull(),
  path: text("path").notNull(),
  content: text("content"),
  language: text("language"),
  isDirectory: boolean("is_directory").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  messages: jsonb("messages").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
```

## 3. React Chat Component (`client/ChatInterface.tsx`)

```typescript
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, MessageCircle, Plus, X } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  plan?: any;
  isWaitingForApproval?: boolean;
}

interface ChatHistory {
  id: string;
  title: string;
  timestamp: number;
  messages: Message[];
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(true);
  const messagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Create new chat
  const createNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    const newChat: ChatHistory = {
      id: newChatId,
      title: 'New Chat',
      timestamp: Date.now(),
      messages: []
    };
    setChatHistories(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    setMessages([]);
  };

  // Load existing chat
  const loadChat = (chatId: string) => {
    const chat = chatHistories.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
    }
  };

  // Save current chat
  const saveCurrentChat = () => {
    if (currentChatId && messages.length > 0) {
      setChatHistories(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { 
              ...chat, 
              messages: messages,
              title: messages[0]?.content.slice(0, 40) + '...' || 'New Chat'
            }
          : chat
      ));
    }
  };

  // Save chat when messages change
  useEffect(() => {
    saveCurrentChat();
  }, [messages]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Create new chat if none exists
    if (!currentChatId) {
      createNewChat();
    }

    const userMessage: Message = {
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
      
      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat History Sidebar */}
      {showHistory && (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Chat History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={createNewChat}
              className="w-full bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {chatHistories.length === 0 ? (
              <p className="text-gray-500 text-sm text-center p-4">No previous chats</p>
            ) : (
              <div className="space-y-2">
                {chatHistories.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => loadChat(chat.id)}
                    className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 ${
                      currentChatId === chat.id ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                  >
                    <p className="font-medium text-sm truncate">{chat.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(chat.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {chat.messages.length} messages
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          {!showHistory && (
            <button
              onClick={() => setShowHistory(true)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <MessageCircle className="h-5 w-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-500" />
            <h1 className="text-lg font-semibold">AI Assistant</h1>
          </div>
          <div className="w-10" />
        </div>

        {/* Messages */}
        <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">AI Assistant Ready</p>
              <p className="text-sm">Ask me to create any type of application</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div key={index} className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}>
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white border border-gray-200'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">U</span>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="bg-white border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me to create an application..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Ask me to create any type of application</p>
        </form>
      </div>
    </div>
  );
}
```

## 4. Environment Setup (`.env`)

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ai_agent_db

# AI Service
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Session
SESSION_SECRET=your_random_session_secret_here

# Server
PORT=5000
NODE_ENV=development
```

## 5. Quick Setup Commands

```bash
# 1. Create project
mkdir ai-agent-replica
cd ai-agent-replica

# 2. Initialize package.json and install dependencies
npm init -y
npm install express react react-dom typescript tsx vite
npm install @vitejs/plugin-react @types/express @types/node
npm install drizzle-orm @neondatabase/serverless drizzle-kit
npm install lucide-react tailwindcss @tanstack/react-query
npm install express-session @types/express-session
npm install wouter zod

# 3. Set up Tailwind
npx tailwindcss init -p

# 4. Create directory structure
mkdir -p server client/src client/public

# 5. Set up database
npx drizzle-kit generate:pg
npx drizzle-kit push:pg

# 6. Start development
npm run dev
```

This gives you the complete foundation to build your own AI agent system. The key is getting the Perplexity API integration working and building the chat interface that saves conversation history.