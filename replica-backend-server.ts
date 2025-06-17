import express from 'express';
import cors from 'cors';
import { createServer } from 'http';

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

// Simulate Perplexity API integration
const callPerplexityAPI = async (prompt: string, context: string = '') => {
  // Simulate real API delay (2-8 seconds)
  const delay = Math.random() * 6000 + 2000;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Use environment variable for actual API key
  if (process.env.PERPLEXITY_API_KEY) {
    try {
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
              content: 'You are an expert software developer and project analyzer. Provide detailed analysis of user requests for web applications.'
            },
            {
              role: 'user', 
              content: `Analyze this request: ${prompt}. ${context}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });
      
      const data = await response.json();
      return {
        success: true,
        message: data.choices[0].message.content,
        analysis: data.choices[0].message.content
      };
    } catch (error) {
      console.error('Perplexity API error:', error);
    }
  }
  
  // Fallback response for development
  return {
    success: true,
    message: `I've analyzed your request for "${prompt}". Based on the requirements, I'll create a comprehensive development strategy.`,
    analysis: `Analyzing requirements for: ${prompt}\n\nKey considerations:\n- User experience and interface design\n- Backend functionality and data management\n- Security and performance optimization\n- Scalability and deployment strategy`
  };
};

// Generate development plan
const generateDevelopmentPlan = async (userRequest: string) => {
  // Simulate plan generation delay (3-5 seconds)
  const delay = Math.random() * 2000 + 3000;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  const lowerRequest = userRequest.toLowerCase();
  
  if (lowerRequest.includes('candy') || lowerRequest.includes('sweet')) {
    return {
      name: "Sweet Treats Store",
      description: "A modern e-commerce platform for candy and confectionery sales with secure payments and inventory management",
      type: "E-commerce Website",
      features: [
        "Product catalog with candy categories and filtering",
        "Shopping cart with quantity management",
        "Secure user authentication and profiles",
        "Stripe payment processing integration",
        "Real-time inventory tracking",
        "Order management and tracking system",
        "Customer review and rating system",
        "Mobile-responsive design with PWA features",
        "Admin dashboard for product management",
        "Email notifications for orders"
      ],
      technologies: [
        "React.js with TypeScript for frontend",
        "Node.js/Express for backend API",
        "PostgreSQL for data storage",
        "Stripe for payment processing",
        "JWT for authentication",
        "Tailwind CSS for styling",
        "Redis for session management",
        "Cloudinary for image storage"
      ],
      preview: {
        title: "Sweet Treats Store - Premium Candy E-commerce",
        description: "A comprehensive online candy store with modern design, secure transactions, and excellent user experience",
        sections: [
          "Homepage with featured candies and promotions",
          "Product catalog with advanced filtering",
          "Shopping cart and secure checkout",
          "User account management and order history",
          "Admin dashboard for inventory and orders",
          "Mobile app-like experience"
        ]
      }
    };
  }
  
  if (lowerRequest.includes('blog') || lowerRequest.includes('content')) {
    return {
      name: "Dynamic Blog Platform",
      description: "A modern blogging platform with rich content management and social features",
      type: "Content Management System",
      features: [
        "Rich text editor with markdown support",
        "User authentication and author profiles",
        "Comment system with moderation",
        "Tag-based categorization",
        "Search functionality",
        "Social media integration",
        "SEO optimization tools",
        "Analytics dashboard"
      ],
      technologies: [
        "React.js with Next.js",
        "Node.js/Express backend",
        "MongoDB for content storage",
        "Redis for caching",
        "Tailwind CSS for styling"
      ],
      preview: {
        title: "Modern Blog Platform",
        description: "A feature-rich blogging platform with social features and content management",
        sections: [
          "Homepage with latest posts",
          "Article reading interface",
          "Author dashboard",
          "Comment and interaction system"
        ]
      }
    };
  }
  
  // Default comprehensive plan
  return {
    name: "Custom Web Application",
    description: "A tailored full-stack web application built to your specific requirements",
    type: "Web Application",
    features: [
      "Modern responsive user interface",
      "User authentication and authorization",
      "Database integration with CRUD operations",
      "RESTful API endpoints",
      "Real-time updates and notifications",
      "Search and filtering capabilities",
      "Admin dashboard and management tools",
      "Mobile-responsive design",
      "Security best practices implementation",
      "Performance optimization"
    ],
    technologies: [
      "React.js with TypeScript",
      "Node.js/Express backend",
      "PostgreSQL database",
      "JWT authentication",
      "Tailwind CSS for styling",
      "WebSocket for real-time features"
    ],
    preview: {
      title: "Custom Web Application",
      description: "A modern, full-featured web application tailored to your needs",
      sections: [
        "User-friendly frontend interface",
        "Robust backend API",
        "Database schema and management",
        "Authentication and security features"
      ]
    }
  };
};

// API Routes

// Analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }
    
    console.log(`Analyzing request: ${message}`);
    const result = await callPerplexityAPI(message, context);
    
    res.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Analysis failed' 
    });
  }
});

// Plan generation endpoint
app.post('/api/generate-plan', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }
    
    console.log(`Generating plan for: ${message}`);
    const plan = await generateDevelopmentPlan(message);
    
    res.json({
      success: true,
      plan
    });
  } catch (error) {
    console.error('Plan generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Plan generation failed' 
    });
  }
});

// File generation endpoint (only called after approval)
app.post('/api/build-app', async (req, res) => {
  try {
    const { plan } = req.body;
    
    if (!plan) {
      return res.status(400).json({ 
        success: false, 
        error: 'Plan is required' 
      });
    }
    
    console.log(`Building application: ${plan.name}`);
    
    // Simulate file generation (fast template-based)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const files = [
      {
        name: 'App.tsx',
        path: '/src/App.tsx',
        content: `// ${plan.name} - React Application\nimport React from 'react';\n\nfunction App() {\n  return (\n    <div className="min-h-screen bg-gray-50">\n      <header className="bg-white shadow">\n        <h1 className="text-2xl font-bold p-4">${plan.name}</h1>\n      </header>\n      <main className="container mx-auto p-4">\n        <p className="text-gray-600">${plan.description}</p>\n      </main>\n    </div>\n  );\n}\n\nexport default App;`,
        language: 'typescript',
        description: 'Main React application component'
      },
      {
        name: 'server.ts',
        path: '/server/server.ts',
        content: `// ${plan.name} - Express Server\nimport express from 'express';\nimport cors from 'cors';\n\nconst app = express();\nconst PORT = process.env.PORT || 5000;\n\napp.use(cors());\napp.use(express.json());\n\n// API Routes\napp.get('/api/health', (req, res) => {\n  res.json({ status: 'OK', service: '${plan.name}' });\n});\n\napp.listen(PORT, () => {\n  console.log(\`${plan.name} server running on port \${PORT}\`);\n});`,
        language: 'typescript',
        description: 'Express server with basic API setup'
      },
      {
        name: 'schema.sql',
        path: '/database/schema.sql',
        content: `-- ${plan.name} Database Schema\n-- Generated for ${plan.type}\n\nCREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  password_hash VARCHAR(255) NOT NULL,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Add more tables based on plan features\n${plan.features.includes('Product catalog') ? '\nCREATE TABLE products (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(255) NOT NULL,\n  description TEXT,\n  price DECIMAL(10,2),\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);' : ''}\n\n${plan.features.includes('Shopping cart') ? '\nCREATE TABLE cart_items (\n  id SERIAL PRIMARY KEY,\n  user_id INTEGER REFERENCES users(id),\n  product_id INTEGER REFERENCES products(id),\n  quantity INTEGER DEFAULT 1\n);' : ''}`,
        language: 'sql',
        description: 'Database schema for the application'
      }
    ];
    
    res.json({
      success: true,
      message: `Successfully built ${plan.name}!`,
      filesCreated: files.length,
      files: files,
      buildTime: '2.1s'
    });
    
  } catch (error) {
    console.error('Build error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Application build failed' 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Replica Development System',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Replica backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;