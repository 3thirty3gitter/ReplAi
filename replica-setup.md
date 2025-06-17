# AI Agent Replica - Quick Setup Guide

## 1. Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Perplexity API key

## 2. Installation Commands

```bash
# Create project directory
mkdir ai-agent-replica
cd ai-agent-replica

# Initialize and install dependencies
npm init -y
npm install express react react-dom typescript tsx vite @vitejs/plugin-react
npm install drizzle-orm @neondatabase/serverless drizzle-kit
npm install lucide-react tailwindcss @tanstack/react-query
npm install express-session cors dotenv zod
npm install @types/express @types/express-session @types/cors @types/node
npm install concurrently autoprefixer postcss
```

## 3. File Structure

Copy these files from the replica project:
- `replica-package.json` → `package.json`
- `replica-server.ts` → `server/index.ts`
- `replica-schema.ts` → `server/schema.ts`
- `replica-chat.tsx` → `client/src/Chat.tsx`
- `replica-env.example` → `.env`

## 4. Configuration Files

### Vite Config (`vite.config.ts`)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  },
  resolve: {
    alias: {
      '@': '/client/src'
    }
  }
})
```

### Tailwind Config (`tailwind.config.js`)
```javascript
module.exports = {
  content: [
    "./client/src/**/*.{js,ts,jsx,tsx}",
    "./client/index.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Drizzle Config (`drizzle.config.ts`)
```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './server/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

## 5. Entry Files

### HTML Entry (`client/index.html`)
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Agent Replica</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### React Entry (`client/src/main.tsx`)
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Chat from './Chat'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Chat />
    </QueryClientProvider>
  </React.StrictMode>,
)
```

## 6. Environment Setup

1. Copy `.env.example` to `.env`
2. Get Perplexity API key from https://www.perplexity.ai/settings/api
3. Set up PostgreSQL database
4. Update `.env` with your credentials:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/ai_replica
PERPLEXITY_API_KEY=pplx-your-api-key-here
SESSION_SECRET=your-random-secret
PORT=3001
```

## 7. Database Setup

```bash
# Generate migration files
npm run db:generate

# Push schema to database
npm run db:push
```

## 8. Start Development

```bash
# Start both server and client
npm run dev

# Or start separately:
npm run server  # Port 3001
npm run client  # Port 3000
```

## 9. Testing

Visit `http://localhost:3000` to access your AI agent replica.

Test with prompts like:
- "Create a todo application"
- "Build an e-commerce website"
- "Make a dashboard for analytics"

## 10. Key Features

✅ **Real Perplexity AI Integration** - No mock data or templates
✅ **Chat History Management** - Persistent conversation storage
✅ **Application Generation** - Creates actual React components
✅ **Plan Approval Workflow** - Review before building
✅ **Responsive Design** - Works on all devices

## Troubleshooting

**API Key Issues**: Ensure PERPLEXITY_API_KEY is set correctly
**Database Errors**: Check DATABASE_URL connection string
**CORS Issues**: Server runs on 3001, client on 3000 with proxy
**Missing Dependencies**: Run `npm install` in project root

## Next Steps

1. Add file editing capabilities
2. Implement live preview iframe
3. Add deployment integration
4. Create project templates
5. Add user authentication

Your AI agent replica is now ready to duplicate the core functionality of this system!