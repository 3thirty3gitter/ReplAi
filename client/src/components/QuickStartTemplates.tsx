import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  CheckSquare, 
  Globe, 
  User, 
  ShoppingCart, 
  MessageSquare,
  Calendar,
  Camera,
  Music,
  GamepadIcon,
  Zap,
  Sparkles,
  BarChart3,
  FileText,
  Building2,
  Briefcase,
  Heart,
  Users,
  Newspaper,
  Smartphone,
  Code2,
  Database,
  Shield,
  Cloud
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
  prompt: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
}

const templates: Template[] = [
  {
    id: 'todo-app',
    name: 'Todo App',
    description: 'Task manager with drag & drop, categories, and local storage',
    icon: CheckSquare,
    tags: ['React', 'Local Storage', 'Drag & Drop'],
    prompt: 'Build a complete todo app with drag and drop functionality, task categories, due dates, priority levels, and local storage persistence. Include filtering, search, and statistics.',
    difficulty: 'Beginner',
    estimatedTime: '5-10 min'
  },
  {
    id: 'calculator',
    name: 'Calculator',
    description: 'Scientific calculator with history and keyboard support',
    icon: Calculator,
    tags: ['JavaScript', 'Math', 'History'],
    prompt: 'Create a scientific calculator with basic and advanced operations, calculation history, keyboard support, and memory functions. Include a clean, modern interface.',
    difficulty: 'Beginner',
    estimatedTime: '3-8 min'
  },
  {
    id: 'weather-app',
    name: 'Weather Dashboard',
    description: 'Weather app with forecasts, maps, and location search',
    icon: Globe,
    tags: ['API', 'Geolocation', 'Charts'],
    prompt: 'Build a weather dashboard with current weather, 7-day forecast, weather maps, location search, and favorite cities. Include beautiful weather animations and charts.',
    difficulty: 'Intermediate',
    estimatedTime: '8-12 min'
  },
  {
    id: 'portfolio',
    name: 'Portfolio Website',
    description: 'Professional portfolio with projects, skills, and contact form',
    icon: User,
    tags: ['Portfolio', 'Responsive', 'Contact Form'],
    prompt: 'Create a professional portfolio website with hero section, about me, skills showcase, project gallery with filtering, testimonials, and working contact form.',
    difficulty: 'Intermediate',
    estimatedTime: '10-15 min'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Store',
    description: 'Online store with cart, checkout, and product management',
    icon: ShoppingCart,
    tags: ['E-commerce', 'Cart', 'Checkout'],
    prompt: 'Build an e-commerce store with product catalog, shopping cart, checkout process, user authentication, order management, and admin panel.',
    difficulty: 'Advanced',
    estimatedTime: '15-20 min'
  },
  {
    id: 'chat-app',
    name: 'Chat Application',
    description: 'Real-time messaging with rooms and file sharing',
    icon: MessageSquare,
    tags: ['Real-time', 'WebSocket', 'File Upload'],
    prompt: 'Create a real-time chat application with multiple rooms, private messaging, file sharing, emoji support, and user presence indicators.',
    difficulty: 'Advanced',
    estimatedTime: '12-18 min'
  },
  {
    id: 'calendar',
    name: 'Event Calendar',
    description: 'Interactive calendar with events, reminders, and scheduling',
    icon: Calendar,
    tags: ['Calendar', 'Events', 'Scheduling'],
    prompt: 'Build an interactive calendar application with event creation, scheduling, reminders, recurring events, and different view modes (month, week, day).',
    difficulty: 'Intermediate',
    estimatedTime: '10-15 min'
  },
  {
    id: 'photo-gallery',
    name: 'Photo Gallery',
    description: 'Image gallery with upload, filters, and slideshow',
    icon: Camera,
    tags: ['Images', 'Upload', 'Filters'],
    prompt: 'Create a photo gallery with image upload, drag & drop organization, filters, slideshow mode, and image editing capabilities.',
    difficulty: 'Intermediate',
    estimatedTime: '8-12 min'
  },
  {
    id: 'music-player',
    name: 'Music Player',
    description: 'Audio player with playlists, visualizer, and controls',
    icon: Music,
    tags: ['Audio', 'Playlists', 'Visualizer'],
    prompt: 'Build a music player with playlist management, audio visualizer, shuffle/repeat modes, and modern player controls with waveform display.',
    difficulty: 'Advanced',
    estimatedTime: '12-18 min'
  },
  {
    id: 'game',
    name: 'Simple Game',
    description: 'Interactive game with score tracking and levels',
    icon: GamepadIcon,
    tags: ['Game', 'Canvas', 'Score'],
    prompt: 'Create a simple but engaging game (like Snake, Tetris, or Memory) with score tracking, levels, high scores, and smooth animations.',
    difficulty: 'Advanced',
    estimatedTime: '15-25 min'
  },
  {
    id: 'data-dashboard',
    name: 'Analytics Dashboard',
    description: 'Data visualization with interactive charts and metrics',
    icon: BarChart3,
    tags: ['Analytics', 'Charts', 'Data'],
    prompt: 'Build a comprehensive analytics dashboard with interactive charts, real-time data visualization, filtering options, and export capabilities. Include line charts, bar charts, pie charts, and key metrics.',
    difficulty: 'Advanced',
    estimatedTime: '20-30 min'
  },
  {
    id: 'blog-cms',
    name: 'Blog & CMS',
    description: 'Content management system with rich text editor',
    icon: FileText,
    tags: ['CMS', 'Blog', 'Content'],
    prompt: 'Create a complete blog platform with rich text editor, post management, categories, tags, search functionality, and SEO optimization. Include admin dashboard and comment system.',
    difficulty: 'Advanced',
    estimatedTime: '25-35 min'
  },
  {
    id: 'crm-system',
    name: 'CRM System',
    description: 'Customer relationship management with pipeline tracking',
    icon: Building2,
    tags: ['CRM', 'Business', 'Sales'],
    prompt: 'Develop a CRM system with contact management, sales pipeline, task scheduling, email integration, and reporting. Include lead tracking and conversion analytics.',
    difficulty: 'Advanced',
    estimatedTime: '30-40 min'
  },
  {
    id: 'project-management',
    name: 'Project Manager',
    description: 'Team collaboration with task boards and tracking',
    icon: Briefcase,
    tags: ['Projects', 'Teams', 'Tasks'],
    prompt: 'Build a project management tool with Kanban boards, task assignment, time tracking, file sharing, and team collaboration. Include Gantt charts and progress reports.',
    difficulty: 'Advanced',
    estimatedTime: '25-35 min'
  },
  {
    id: 'social-platform',
    name: 'Social Network',
    description: 'Social platform with posts, messaging, and profiles',
    icon: Users,
    tags: ['Social', 'Messaging', 'Community'],
    prompt: 'Create a social networking platform with user profiles, posts, comments, direct messaging, friend connections, and activity feeds. Include privacy settings and notifications.',
    difficulty: 'Advanced',
    estimatedTime: '35-45 min'
  },
  {
    id: 'learning-platform',
    name: 'Learning Platform',
    description: 'Online education with courses and progress tracking',
    icon: FileText,
    tags: ['Education', 'Courses', 'Learning'],
    prompt: 'Build an online learning platform with course creation, video lessons, quizzes, progress tracking, and certificates. Include student dashboard and instructor tools.',
    difficulty: 'Advanced',
    estimatedTime: '30-40 min'
  },
  {
    id: 'inventory-system',
    name: 'Inventory Manager',
    description: 'Stock management with tracking and alerts',
    icon: Database,
    tags: ['Inventory', 'Stock', 'Management'],
    prompt: 'Develop an inventory management system with product tracking, stock levels, purchase orders, supplier management, and low-stock alerts. Include barcode scanning simulation.',
    difficulty: 'Advanced',
    estimatedTime: '25-35 min'
  }
];

interface QuickStartTemplatesProps {
  onSelectTemplate: (prompt: string) => void;
  onClose: () => void;
}

export function QuickStartTemplates({ onSelectTemplate, onClose }: QuickStartTemplatesProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const filteredTemplates = templates.filter(template => 
    selectedDifficulty === 'all' || template.difficulty === selectedDifficulty
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Sparkles className="h-6 w-6 mr-2 text-blue-600" />
                Quick Start Templates
              </h2>
              <p className="text-gray-600">Choose a template to get started building your application</p>
            </div>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
          
          <div className="flex gap-2 mt-4">
            {['all', 'Beginner', 'Intermediate', 'Advanced'].map((difficulty) => (
              <Button
                key={difficulty}
                variant={selectedDifficulty === difficulty ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDifficulty(difficulty)}
                className="capitalize"
              >
                {difficulty === 'all' ? 'All Levels' : difficulty}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => {
              const IconComponent = template.icon;
              return (
                <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <IconComponent className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="outline" 
                              className={getDifficultyColor(template.difficulty)}
                            >
                              {template.difficulty}
                            </Badge>
                            <span className="text-xs text-gray-500">{template.estimatedTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-3">{template.description}</CardDescription>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => {
                        onSelectTemplate(template.prompt);
                        onClose();
                      }}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Generate This App
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}