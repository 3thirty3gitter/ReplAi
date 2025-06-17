#!/bin/bash

echo "🚀 Deploying AI Agent Replica..."

# Create project directory structure
mkdir -p ai-agent-replica/server
mkdir -p ai-agent-replica/client/src
mkdir -p ai-agent-replica/client/public

cd ai-agent-replica

# Copy package.json
cp ../replica-package.json package.json

# Copy server files
cp ../replica-server.ts server/index.ts
cp ../replica-schema.ts server/schema.ts

# Copy client files
cp ../replica-client-index.html client/index.html
cp ../replica-client-main.tsx client/src/main.tsx
cp ../replica-client-chat.tsx client/src/Chat.tsx
cp ../replica-client-index.css client/src/index.css

# Copy configuration files
cp ../replica-vite.config.ts vite.config.ts
cp ../replica-drizzle.config.ts drizzle.config.ts
cp ../replica-tailwind.config.js tailwind.config.js
cp ../replica-postcss.config.js postcss.config.js
cp ../replica-tsconfig.json tsconfig.json
cp ../replica-env.example .env.example

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "✅ AI Agent Replica deployed successfully!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env"
echo "2. Add your PERPLEXITY_API_KEY"
echo "3. Set up PostgreSQL database"
echo "4. Run 'npm run dev' to start"
echo ""
echo "Your replica is ready! 🎉"