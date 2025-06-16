import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  HelpCircle, 
  Search, 
  Book, 
  Video, 
  MessageSquare, 
  Zap, 
  Code, 
  Palette, 
  Database, 
  Rocket,
  ChevronRight,
  ExternalLink,
  Play,
  CheckCircle
} from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: 'getting-started' | 'ai-assistant' | 'visual-builder' | 'database' | 'deployment' | 'troubleshooting';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  content: string;
  tags: string[];
}

const helpArticles: HelpArticle[] = [
  {
    id: 'first-app',
    title: 'Create Your First App in 5 Minutes',
    description: 'Learn how to build a complete application using our AI Assistant',
    category: 'getting-started',
    difficulty: 'Beginner',
    estimatedTime: '5 min',
    tags: ['tutorial', 'ai', 'quickstart'],
    content: `# Create Your First App in 5 Minutes

Welcome! Let's build your first application together.

## Step 1: Use the AI Assistant
1. Click on the "AI" tab in the main interface
2. Click "Browse App Templates" for pre-made examples
3. Or type: "Build a todo app with drag and drop"
4. Click "Generate Complete Project"

## Step 2: Watch the Magic
The AI will create multiple files for your app:
- HTML structure
- CSS styling  
- JavaScript functionality
- Complete working application

## Step 3: See Your App
- Check the file explorer on the left
- Click on files to view the code
- Your app is ready to use!

## What's Next?
- Try the Visual Builder for drag-and-drop editing
- Add a database using the Database tab
- Deploy your app with one click`
  },
  {
    id: 'ai-prompts',
    title: 'How to Write Effective AI Prompts',
    description: 'Master the art of communicating with AI to get exactly what you want',
    category: 'ai-assistant',
    difficulty: 'Beginner',
    estimatedTime: '3 min',
    tags: ['ai', 'prompts', 'tips'],
    content: `# How to Write Effective AI Prompts

## Be Specific and Descriptive
Instead of: "Make an app"
Try: "Build a recipe sharing app with user accounts, favorites, and search"

## Include Desired Features
- "with user authentication"
- "including a shopping cart"
- "with drag and drop functionality"
- "responsive for mobile devices"

## Specify the Type
- "Build a landing page for..."
- "Create a dashboard that shows..."
- "Make a game where players..."
- "Design a form to collect..."

## Great Example Prompts
- "Build a expense tracker with categories, charts, and monthly reports"
- "Create a portfolio website with project gallery, about section, and contact form"
- "Make a weather app with 7-day forecast, location search, and weather maps"
- "Build a chat application with multiple rooms and file sharing"`
  },
  {
    id: 'visual-builder',
    title: 'Using the Visual Builder',
    description: 'Create beautiful interfaces without writing code',
    category: 'visual-builder',
    difficulty: 'Beginner',
    estimatedTime: '4 min',
    tags: ['visual', 'drag-drop', 'ui'],
    content: `# Using the Visual Builder

## Getting Started
1. Click the "Visual" tab in the main interface
2. Choose from pre-built components on the left
3. Drag components onto your canvas
4. Customize properties in the right panel

## Available Components
- **Text & Headers**: Add titles, paragraphs, and labels
- **Buttons**: Call-to-action and navigation buttons
- **Forms**: Input fields, dropdowns, checkboxes
- **Layout**: Containers, grids, and sections
- **Media**: Images, videos, and icons

## Pro Tips
- Start with a container for better organization
- Use the grid system for responsive layouts
- Preview your design in different screen sizes
- Connect forms to your database for data collection`
  },
  {
    id: 'database-setup',
    title: 'Setting Up Your Database',
    description: 'Store and manage your application data',
    category: 'database',
    difficulty: 'Intermediate',
    estimatedTime: '6 min',
    tags: ['database', 'data', 'storage'],
    content: `# Setting Up Your Database

## Creating Tables
1. Go to the "Database" tab
2. Click "Add New Table"
3. Define your fields (name, email, etc.)
4. Set field types (text, number, date)
5. Mark required fields

## Field Types
- **Text**: Names, descriptions, URLs
- **Number**: Prices, quantities, ratings
- **Boolean**: Yes/no, active/inactive
- **Date**: Created dates, deadlines
- **Email**: User email addresses

## Relationships
Connect tables together:
- One-to-Many: User has many posts
- Many-to-Many: Posts have many tags

## Best Practices
- Use descriptive table and field names
- Set up relationships between related data
- Mark important fields as required
- Consider data validation rules`
  },
  {
    id: 'deployment',
    title: 'Deploy Your App to the World',
    description: 'Make your application available online',
    category: 'deployment',
    difficulty: 'Beginner',
    estimatedTime: '3 min',
    tags: ['deployment', 'hosting', 'live'],
    content: `# Deploy Your App to the World

## Quick Deployment
1. Click the "Deploy" tab
2. Choose your environment (staging/production)
3. Configure your domain settings
4. Click "Deploy Now"

## Domain Options
- **Free subdomain**: yourapp.example.com
- **Custom domain**: Connect your own domain

## Features Included
- Automatic SSL certificates
- CDN for fast loading
- Automatic scaling
- Health monitoring

## After Deployment
- Test your live application
- Share the URL with others
- Monitor performance metrics
- Update anytime with one click`
  }
];

const quickTips = [
  {
    icon: Zap,
    title: 'Use AI Templates',
    description: 'Browse pre-made app templates for instant results'
  },
  {
    icon: Code,
    title: 'Ask Specific Questions',
    description: 'Be detailed in your AI prompts for better outputs'
  },
  {
    icon: Palette,
    title: 'Visual First',
    description: 'Start with the visual builder for quick prototypes'
  },
  {
    icon: Database,
    title: 'Plan Your Data',
    description: 'Design your database structure before building features'
  }
];

interface HelpCenterProps {
  onClose: () => void;
}

export function HelpCenter({ onClose }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  const categories = [
    { id: 'all', name: 'All Topics', icon: Book },
    { id: 'getting-started', name: 'Getting Started', icon: Play },
    { id: 'ai-assistant', name: 'AI Assistant', icon: Zap },
    { id: 'visual-builder', name: 'Visual Builder', icon: Palette },
    { id: 'database', name: 'Database', icon: Database },
    { id: 'deployment', name: 'Deployment', icon: Rocket }
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (selectedArticle) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{selectedArticle.title}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getDifficultyColor(selectedArticle.difficulty)}>
                  {selectedArticle.difficulty}
                </Badge>
                <span className="text-sm text-gray-500">{selectedArticle.estimatedTime}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedArticle(null)}>
                Back
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="prose max-w-none">
              {selectedArticle.content.split('\n').map((line, index) => {
                if (line.startsWith('# ')) {
                  return <h1 key={index} className="text-3xl font-bold mb-4">{line.slice(2)}</h1>;
                } else if (line.startsWith('## ')) {
                  return <h2 key={index} className="text-2xl font-semibold mb-3 mt-6">{line.slice(3)}</h2>;
                } else if (line.startsWith('- ')) {
                  return <li key={index} className="ml-4">{line.slice(2)}</li>;
                } else if (line.trim() === '') {
                  return <br key={index} />;
                } else {
                  return <p key={index} className="mb-2">{line}</p>;
                }
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <HelpCircle className="h-6 w-6 mr-2 text-blue-600" />
                Help Center
              </h2>
              <p className="text-gray-600">Learn how to build amazing applications</p>
            </div>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
          
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex h-[calc(90vh-200px)]">
          {/* Sidebar */}
          <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
            <div className="space-y-2">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {category.name}
                  </button>
                );
              })}
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Tips</h3>
              <div className="space-y-3">
                {quickTips.map((tip, index) => {
                  const IconComponent = tip.icon;
                  return (
                    <div key={index} className="p-3 bg-white rounded-md border">
                      <div className="flex items-start">
                        <IconComponent className="h-4 w-4 mr-2 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{tip.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{tip.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{article.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant="outline" 
                            className={getDifficultyColor(article.difficulty)}
                          >
                            {article.difficulty}
                          </Badge>
                          <span className="text-xs text-gray-500">{article.estimatedTime}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-3">{article.description}</CardDescription>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setSelectedArticle(article)}
                    >
                      Read Article
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-8">
                <HelpCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No articles found matching your search.</p>
                <p className="text-sm text-gray-500 mt-1">Try different keywords or browse categories.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}