import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ShoppingCart, 
  Users, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Briefcase,
  Heart,
  Camera,
  BookOpen,
  TrendingUp,
  Zap,
  Clock,
  Star,
  Download
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  buildTime: string;
  features: string[];
  preview: string;
  components: Array<{
    type: string;
    name: string;
    config: Record<string, any>;
  }>;
  database: Array<{
    name: string;
    fields: Array<{
      name: string;
      type: string;
      required: boolean;
    }>;
  }>;
  workflows: Array<{
    name: string;
    trigger: string;
    steps: Array<{
      type: string;
      config: Record<string, any>;
    }>;
  }>;
}

const templates: ProjectTemplate[] = [
  {
    id: 'ecommerce-store',
    name: 'E-commerce Store',
    description: 'Complete online store with product catalog, shopping cart, and payment processing',
    category: 'E-commerce',
    icon: ShoppingCart,
    difficulty: 'Intermediate',
    buildTime: '15 minutes',
    features: ['Product Catalog', 'Shopping Cart', 'User Accounts', 'Payment Processing', 'Order Management'],
    preview: '/templates/ecommerce-preview.jpg',
    components: [
      { type: 'header', name: 'Store Header', config: { logo: 'Store Logo', navigation: ['Products', 'Cart', 'Account'] } },
      { type: 'product-grid', name: 'Product Grid', config: { columns: 3, showPrice: true, showRating: true } },
      { type: 'cart', name: 'Shopping Cart', config: { showQuantity: true, allowCoupons: true } }
    ],
    database: [
      {
        name: 'products',
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'price', type: 'number', required: true },
          { name: 'description', type: 'textarea', required: true },
          { name: 'image_url', type: 'url', required: false },
          { name: 'stock', type: 'number', required: true }
        ]
      },
      {
        name: 'orders',
        fields: [
          { name: 'customer_email', type: 'email', required: true },
          { name: 'total_amount', type: 'number', required: true },
          { name: 'status', type: 'text', required: true },
          { name: 'order_date', type: 'date', required: true }
        ]
      }
    ],
    workflows: [
      {
        name: 'Order Confirmation',
        trigger: 'form_submit',
        steps: [
          { type: 'save_to_database', config: { table: 'orders' } },
          { type: 'send_email', config: { template: 'order_confirmation' } }
        ]
      }
    ]
  },
  {
    id: 'blog-platform',
    name: 'Blog Platform',
    description: 'Personal or business blog with content management and reader engagement',
    category: 'Content',
    icon: FileText,
    difficulty: 'Beginner',
    buildTime: '10 minutes',
    features: ['Article Publishing', 'Comments', 'Categories', 'Search', 'Email Subscription'],
    preview: '/templates/blog-preview.jpg',
    components: [
      { type: 'header', name: 'Blog Header', config: { title: 'My Blog', showSearch: true } },
      { type: 'article-list', name: 'Article List', config: { showExcerpt: true, showDate: true } },
      { type: 'sidebar', name: 'Sidebar', config: { showCategories: true, showRecentPosts: true } }
    ],
    database: [
      {
        name: 'posts',
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'content', type: 'textarea', required: true },
          { name: 'author', type: 'text', required: true },
          { name: 'category', type: 'text', required: false },
          { name: 'published_date', type: 'date', required: true }
        ]
      }
    ],
    workflows: [
      {
        name: 'New Post Notification',
        trigger: 'database_change',
        steps: [
          { type: 'send_email', config: { template: 'new_post_notification', audience: 'subscribers' } }
        ]
      }
    ]
  },
  {
    id: 'event-management',
    name: 'Event Management',
    description: 'Plan and manage events with registration, ticketing, and attendee communication',
    category: 'Events',
    icon: Calendar,
    difficulty: 'Intermediate',
    buildTime: '20 minutes',
    features: ['Event Creation', 'Ticket Sales', 'Registration Forms', 'Email Reminders', 'Check-in System'],
    preview: '/templates/events-preview.jpg',
    components: [
      { type: 'event-card', name: 'Event Card', config: { showDate: true, showLocation: true, showPrice: true } },
      { type: 'registration-form', name: 'Registration Form', config: { fields: ['name', 'email', 'phone'] } },
      { type: 'ticket-counter', name: 'Ticket Counter', config: { showAvailable: true, maxPerPerson: 5 } }
    ],
    database: [
      {
        name: 'events',
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'textarea', required: true },
          { name: 'date', type: 'date', required: true },
          { name: 'location', type: 'text', required: true },
          { name: 'price', type: 'number', required: false },
          { name: 'max_attendees', type: 'number', required: true }
        ]
      },
      {
        name: 'registrations',
        fields: [
          { name: 'event_id', type: 'number', required: true },
          { name: 'attendee_name', type: 'text', required: true },
          { name: 'attendee_email', type: 'email', required: true },
          { name: 'ticket_count', type: 'number', required: true }
        ]
      }
    ],
    workflows: [
      {
        name: 'Event Reminder',
        trigger: 'schedule',
        steps: [
          { type: 'send_email', config: { template: 'event_reminder', timing: '24_hours_before' } }
        ]
      }
    ]
  },
  {
    id: 'portfolio-website',
    name: 'Portfolio Website',
    description: 'Showcase your work and skills with a professional portfolio',
    category: 'Portfolio',
    icon: Briefcase,
    difficulty: 'Beginner',
    buildTime: '8 minutes',
    features: ['Project Gallery', 'About Section', 'Contact Form', 'Resume Download', 'Testimonials'],
    preview: '/templates/portfolio-preview.jpg',
    components: [
      { type: 'hero-section', name: 'Hero Section', config: { showPhoto: true, showCTA: true } },
      { type: 'project-gallery', name: 'Project Gallery', config: { layout: 'grid', showTags: true } },
      { type: 'contact-form', name: 'Contact Form', config: { fields: ['name', 'email', 'message'] } }
    ],
    database: [
      {
        name: 'projects',
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'textarea', required: true },
          { name: 'image_url', type: 'url', required: false },
          { name: 'project_url', type: 'url', required: false },
          { name: 'technologies', type: 'text', required: false }
        ]
      }
    ],
    workflows: [
      {
        name: 'Contact Form Submission',
        trigger: 'form_submit',
        steps: [
          { type: 'send_email', config: { template: 'contact_notification', to: 'owner' } }
        ]
      }
    ]
  },
  {
    id: 'restaurant-website',
    name: 'Restaurant Website',
    description: 'Restaurant website with menu, reservations, and online ordering',
    category: 'Food & Dining',
    icon: Heart,
    difficulty: 'Intermediate',
    buildTime: '18 minutes',
    features: ['Digital Menu', 'Table Reservations', 'Online Ordering', 'Location & Hours', 'Reviews'],
    preview: '/templates/restaurant-preview.jpg',
    components: [
      { type: 'menu-display', name: 'Menu Display', config: { categories: true, prices: true, images: true } },
      { type: 'reservation-form', name: 'Reservation Form', config: { dateTime: true, partySize: true } },
      { type: 'location-map', name: 'Location Map', config: { showDirections: true, showHours: true } }
    ],
    database: [
      {
        name: 'menu_items',
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'textarea', required: true },
          { name: 'price', type: 'number', required: true },
          { name: 'category', type: 'text', required: true },
          { name: 'available', type: 'boolean', required: true }
        ]
      },
      {
        name: 'reservations',
        fields: [
          { name: 'customer_name', type: 'text', required: true },
          { name: 'customer_phone', type: 'text', required: true },
          { name: 'date_time', type: 'date', required: true },
          { name: 'party_size', type: 'number', required: true }
        ]
      }
    ],
    workflows: [
      {
        name: 'Reservation Confirmation',
        trigger: 'form_submit',
        steps: [
          { type: 'save_to_database', config: { table: 'reservations' } },
          { type: 'send_notification', config: { template: 'reservation_confirmed' } }
        ]
      }
    ]
  },
  {
    id: 'learning-platform',
    name: 'Learning Platform',
    description: 'Online course platform with lessons, quizzes, and progress tracking',
    category: 'Education',
    icon: BookOpen,
    difficulty: 'Advanced',
    buildTime: '25 minutes',
    features: ['Course Catalog', 'Video Lessons', 'Quizzes', 'Progress Tracking', 'Certificates'],
    preview: '/templates/learning-preview.jpg',
    components: [
      { type: 'course-card', name: 'Course Card', config: { showProgress: true, showRating: true } },
      { type: 'video-player', name: 'Video Player', config: { showControls: true, autoProgress: true } },
      { type: 'quiz-component', name: 'Quiz Component', config: { multipleChoice: true, showResults: true } }
    ],
    database: [
      {
        name: 'courses',
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'textarea', required: true },
          { name: 'instructor', type: 'text', required: true },
          { name: 'duration', type: 'text', required: false },
          { name: 'difficulty', type: 'text', required: true }
        ]
      },
      {
        name: 'enrollments',
        fields: [
          { name: 'student_email', type: 'email', required: true },
          { name: 'course_id', type: 'number', required: true },
          { name: 'progress', type: 'number', required: true },
          { name: 'enrollment_date', type: 'date', required: true }
        ]
      }
    ],
    workflows: [
      {
        name: 'Course Completion',
        trigger: 'database_change',
        steps: [
          { type: 'send_email', config: { template: 'certificate_earned' } }
        ]
      }
    ]
  }
];

interface ProjectTemplatesProps {
  onSelectTemplate: (template: ProjectTemplate) => void;
}

export function ProjectTemplates({ onSelectTemplate }: ProjectTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const createProjectMutation = useMutation({
    mutationFn: async (template: ProjectTemplate) => {
      return apiRequest('POST', '/api/projects/from-template', {
        templateId: template.id,
        name: template.name,
        components: template.components,
        database: template.database,
        workflows: template.workflows
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Project created successfully",
        description: "Your new project has been created from the template"
      });
      setIsCreating(false);
      setSelectedTemplate(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to create project",
        description: (error as Error).message,
        variant: "destructive"
      });
      setIsCreating(false);
    }
  });

  const handleCreateProject = () => {
    if (selectedTemplate) {
      setIsCreating(true);
      createProjectMutation.mutate(selectedTemplate);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Templates</h1>
          <p className="text-gray-600">Start building with professionally designed templates. No coding required.</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => {
            const Icon = template.icon;
            return (
              <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <p className="text-sm text-gray-500">{template.category}</p>
                      </div>
                    </div>
                    <Badge className={getDifficultyColor(template.difficulty)}>
                      {template.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{template.buildTime}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Star className="h-4 w-4" />
                      <span>{template.features.length} features</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {template.features.slice(0, 3).map(feature => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {template.features.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-3">
                          <Icon className="h-6 w-6 text-blue-600" />
                          <span>{template.name}</span>
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">What you'll get:</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2 flex items-center">
                                <Zap className="h-4 w-4 mr-2 text-blue-500" />
                                Features
                              </h4>
                              <ul className="space-y-1 text-sm text-gray-600">
                                {template.features.map(feature => (
                                  <li key={feature} className="flex items-center">
                                    <span className="w-1 h-1 bg-blue-500 rounded-full mr-2" />
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Database Tables</h4>
                              <ul className="space-y-1 text-sm text-gray-600">
                                {template.database.map(table => (
                                  <li key={table.name} className="flex items-center">
                                    <span className="w-1 h-1 bg-green-500 rounded-full mr-2" />
                                    {table.name} ({table.fields.length} fields)
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-2">Automated Workflows:</h3>
                          <div className="space-y-2">
                            {template.workflows.map(workflow => (
                              <div key={workflow.name} className="p-3 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-sm">{workflow.name}</h4>
                                <p className="text-xs text-gray-600">
                                  Triggers on {workflow.trigger} → {workflow.steps.length} automated steps
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                          <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateProject} disabled={isCreating}>
                            {isCreating ? 'Creating...' : 'Create Project'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">Try adjusting your search or category filters</p>
          </div>
        )}
      </div>
    </div>
  );
}