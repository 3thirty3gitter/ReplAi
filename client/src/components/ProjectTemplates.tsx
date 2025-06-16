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
  Download,
  Globe,
  Building,
  Utensils,
  GraduationCap,
  Music,
  Gamepad2
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
    id: 'personal-portfolio',
    name: 'Personal Portfolio',
    description: 'Professional portfolio website to showcase your work and skills',
    category: 'Personal',
    icon: Users,
    difficulty: 'Beginner',
    buildTime: '5 minutes',
    features: ['About Section', 'Project Gallery', 'Contact Form', 'Resume Download', 'Responsive Design'],
    preview: 'Modern single-page portfolio with hero section, project showcases, and contact information',
    components: [
      { type: 'hero', name: 'Hero Section', config: { title: 'Your Name', subtitle: 'Your Profession', backgroundImage: '' } },
      { type: 'about', name: 'About Section', config: { description: 'Tell your story...', skills: ['Skill 1', 'Skill 2'] } },
      { type: 'portfolio', name: 'Project Gallery', config: { layout: 'grid', showCategories: true } },
      { type: 'contact', name: 'Contact Form', config: { fields: ['name', 'email', 'message'], submitAction: 'email' } }
    ],
    database: [
      {
        name: 'projects',
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'textarea', required: true },
          { name: 'image_url', type: 'url', required: false },
          { name: 'project_url', type: 'url', required: false },
          { name: 'category', type: 'text', required: true }
        ]
      }
    ],
    workflows: [
      {
        name: 'Contact Form Submission',
        trigger: 'form_submit',
        steps: [
          { type: 'validate_email', config: { field: 'email' } },
          { type: 'send_email', config: { to: 'your@email.com', template: 'contact_form' } },
          { type: 'store_message', config: { table: 'contacts' } }
        ]
      }
    ]
  },
  
  {
    id: 'business-landing',
    name: 'Business Landing Page',
    description: 'Professional landing page for your business with lead capture',
    category: 'Business',
    icon: Building,
    difficulty: 'Beginner',
    buildTime: '10 minutes',
    features: ['Hero Section', 'Services Overview', 'Testimonials', 'Lead Capture Form', 'Call-to-Action'],
    preview: 'Clean business landing page with service highlights and customer testimonials',
    components: [
      { type: 'hero', name: 'Business Hero', config: { headline: 'Your Business Solution', cta: 'Get Started' } },
      { type: 'services', name: 'Services Grid', config: { layout: '3-column', showIcons: true } },
      { type: 'testimonials', name: 'Customer Reviews', config: { autoplay: true, showRatings: true } },
      { type: 'lead-form', name: 'Lead Capture', config: { fields: ['name', 'email', 'company'], offer: 'Free Consultation' } }
    ],
    database: [
      {
        name: 'leads',
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'email', type: 'email', required: true },
          { name: 'company', type: 'text', required: false },
          { name: 'phone', type: 'text', required: false },
          { name: 'source', type: 'text', required: true }
        ]
      }
    ],
    workflows: [
      {
        name: 'Lead Generation',
        trigger: 'form_submit',
        steps: [
          { type: 'store_lead', config: { table: 'leads' } },
          { type: 'send_welcome_email', config: { template: 'welcome_lead' } },
          { type: 'notify_sales', config: { email: 'sales@company.com' } }
        ]
      }
    ]
  },

  {
    id: 'blog-platform',
    name: 'Blog Platform',
    description: 'Complete blogging platform with content management and comments',
    category: 'Content',
    icon: FileText,
    difficulty: 'Intermediate',
    buildTime: '20 minutes',
    features: ['Article Management', 'Comment System', 'Categories & Tags', 'Search Function', 'RSS Feed'],
    preview: 'Modern blog with article listings, full post views, and interactive comments',
    components: [
      { type: 'blog-header', name: 'Blog Header', config: { title: 'My Blog', tagline: 'Thoughts and Ideas' } },
      { type: 'article-list', name: 'Article Feed', config: { pagination: true, excerpt: true } },
      { type: 'article-view', name: 'Full Article', config: { showAuthor: true, showDate: true } },
      { type: 'comment-system', name: 'Comments', config: { requireApproval: true, allowReplies: true } }
    ],
    database: [
      {
        name: 'articles',
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'content', type: 'textarea', required: true },
          { name: 'excerpt', type: 'textarea', required: false },
          { name: 'author', type: 'text', required: true },
          { name: 'category', type: 'text', required: true },
          { name: 'published_date', type: 'date', required: true }
        ]
      },
      {
        name: 'comments',
        fields: [
          { name: 'article_id', type: 'number', required: true },
          { name: 'author_name', type: 'text', required: true },
          { name: 'author_email', type: 'email', required: true },
          { name: 'content', type: 'textarea', required: true },
          { name: 'approved', type: 'boolean', required: true }
        ]
      }
    ],
    workflows: [
      {
        name: 'Comment Moderation',
        trigger: 'comment_submit',
        steps: [
          { type: 'spam_check', config: { service: 'akismet' } },
          { type: 'store_comment', config: { table: 'comments', status: 'pending' } },
          { type: 'notify_moderator', config: { email: 'admin@blog.com' } }
        ]
      }
    ]
  },

  {
    id: 'event-booking',
    name: 'Event Booking System',
    description: 'Event management platform with ticket booking and payment processing',
    category: 'Events',
    icon: Calendar,
    difficulty: 'Advanced',
    buildTime: '30 minutes',
    features: ['Event Listings', 'Ticket Booking', 'Payment Processing', 'User Accounts', 'Email Confirmations'],
    preview: 'Complete event platform with calendar view, booking forms, and payment integration',
    components: [
      { type: 'event-calendar', name: 'Event Calendar', config: { view: 'month', showCategories: true } },
      { type: 'event-details', name: 'Event Page', config: { showMap: true, showWeather: true } },
      { type: 'booking-form', name: 'Ticket Booking', config: { ticketTypes: ['General', 'VIP'], paymentMethods: ['card', 'paypal'] } },
      { type: 'user-dashboard', name: 'User Dashboard', config: { showBookings: true, allowCancellation: true } }
    ],
    database: [
      {
        name: 'events',
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'textarea', required: true },
          { name: 'date', type: 'date', required: true },
          { name: 'location', type: 'text', required: true },
          { name: 'capacity', type: 'number', required: true },
          { name: 'price', type: 'number', required: true }
        ]
      },
      {
        name: 'bookings',
        fields: [
          { name: 'event_id', type: 'number', required: true },
          { name: 'customer_email', type: 'email', required: true },
          { name: 'ticket_quantity', type: 'number', required: true },
          { name: 'total_amount', type: 'number', required: true },
          { name: 'booking_status', type: 'text', required: true }
        ]
      }
    ],
    workflows: [
      {
        name: 'Ticket Purchase',
        trigger: 'booking_submit',
        steps: [
          { type: 'check_availability', config: { table: 'events' } },
          { type: 'process_payment', config: { gateway: 'stripe' } },
          { type: 'create_booking', config: { table: 'bookings' } },
          { type: 'send_confirmation', config: { template: 'booking_confirmation' } }
        ]
      }
    ]
  },

  {
    id: 'restaurant-menu',
    name: 'Restaurant Website',
    description: 'Restaurant website with digital menu and online ordering',
    category: 'Food & Dining',
    icon: Utensils,
    difficulty: 'Intermediate',
    buildTime: '15 minutes',
    features: ['Digital Menu', 'Online Ordering', 'Table Reservations', 'Location Info', 'Customer Reviews'],
    preview: 'Appetizing restaurant site with menu browsing and reservation system',
    components: [
      { type: 'restaurant-hero', name: 'Restaurant Header', config: { name: 'Restaurant Name', cuisine: 'Italian' } },
      { type: 'menu-display', name: 'Digital Menu', config: { categories: ['Appetizers', 'Mains', 'Desserts'], showPrices: true } },
      { type: 'reservation-form', name: 'Table Booking', config: { timeSlots: true, partySize: true } },
      { type: 'location-info', name: 'Contact & Hours', config: { showMap: true, showHours: true } }
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
          { name: 'date', type: 'date', required: true },
          { name: 'time', type: 'text', required: true },
          { name: 'party_size', type: 'number', required: true }
        ]
      }
    ],
    workflows: [
      {
        name: 'Table Reservation',
        trigger: 'reservation_submit',
        steps: [
          { type: 'check_availability', config: { table: 'reservations' } },
          { type: 'create_reservation', config: { table: 'reservations' } },
          { type: 'send_confirmation', config: { template: 'reservation_confirmation' } },
          { type: 'add_to_calendar', config: { calendar: 'restaurant_bookings' } }
        ]
      }
    ]
  },

  {
    id: 'learning-platform',
    name: 'Online Course Platform',
    description: 'Educational platform with courses, lessons, and progress tracking',
    category: 'Education',
    icon: GraduationCap,
    difficulty: 'Advanced',
    buildTime: '25 minutes',
    features: ['Course Catalog', 'Video Lessons', 'Progress Tracking', 'Quizzes', 'Certificates'],
    preview: 'Modern learning platform with course organization and student progress tracking',
    components: [
      { type: 'course-catalog', name: 'Course Listings', config: { layout: 'grid', showRatings: true } },
      { type: 'lesson-player', name: 'Video Player', config: { showNotes: true, showTranscript: true } },
      { type: 'quiz-system', name: 'Interactive Quizzes', config: { multipleChoice: true, timedQuizzes: true } },
      { type: 'progress-tracker', name: 'Student Dashboard', config: { showCertificates: true, showStats: true } }
    ],
    database: [
      {
        name: 'courses',
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'textarea', required: true },
          { name: 'instructor', type: 'text', required: true },
          { name: 'duration', type: 'text', required: true },
          { name: 'difficulty', type: 'text', required: true }
        ]
      },
      {
        name: 'enrollments',
        fields: [
          { name: 'student_email', type: 'email', required: true },
          { name: 'course_id', type: 'number', required: true },
          { name: 'progress', type: 'number', required: true },
          { name: 'completed', type: 'boolean', required: true },
          { name: 'enrollment_date', type: 'date', required: true }
        ]
      }
    ],
    workflows: [
      {
        name: 'Course Completion',
        trigger: 'lesson_complete',
        steps: [
          { type: 'update_progress', config: { table: 'enrollments' } },
          { type: 'check_completion', config: { threshold: 100 } },
          { type: 'generate_certificate', config: { template: 'course_certificate' } },
          { type: 'send_congratulations', config: { template: 'course_complete' } }
        ]
      }
    ]
  }
];

const categories = Array.from(new Set(templates.map(template => template.category)));

interface ProjectTemplatesProps {
  onSelectTemplate: (template: ProjectTemplate) => void;
}

export function ProjectTemplates({ onSelectTemplate }: ProjectTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createProjectMutation = useMutation({
    mutationFn: async (template: ProjectTemplate) => {
      return await apiRequest('POST', '/api/projects', {
        name: template.name,
        description: template.description,
        template: template.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Project Created",
        description: "Your new project has been created successfully!"
      });
      setSelectedTemplate(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive"
      });
    }
  });

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full bg-editor-bg">
      {/* Header */}
      <div className="p-6 border-b border-editor-border">
        <h2 className="text-2xl font-bold text-editor-text mb-4">Choose a Template</h2>
        <p className="text-editor-text-dim mb-6">Start with a pre-built template to get your project up and running quickly</p>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-editor-surface border-editor-border"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === 'All' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('All')}
              size="sm"
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Template Grid */}
      <ScrollArea className="h-full p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => {
            const IconComponent = template.icon;
            return (
              <Card key={template.id} className="bg-editor-surface border-editor-border hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-editor-primary/10 flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-editor-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-editor-text text-lg">{template.name}</CardTitle>
                        <p className="text-sm text-editor-text-dim">{template.category}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge className={getDifficultyColor(template.difficulty)}>
                        {template.difficulty}
                      </Badge>
                      <span className="text-xs text-editor-text-dim flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {template.buildTime}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-editor-text-dim text-sm mb-4 line-clamp-2">
                    {template.description}
                  </p>
                  
                  <div className="mb-4">
                    <p className="text-xs font-medium text-editor-text mb-2">Features:</p>
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

                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setSelectedTemplate(template)}
                        >
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <IconComponent className="h-5 w-5" />
                            <span>{template.name}</span>
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-editor-text-dim">{template.description}</p>
                          <div>
                            <h4 className="font-medium mb-2">Features:</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {template.features.map(feature => (
                                <div key={feature} className="flex items-center space-x-2">
                                  <Star className="h-3 w-3 text-green-500" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Database Tables:</h4>
                            <div className="space-y-2">
                              {template.database.map(table => (
                                <div key={table.name} className="p-2 bg-gray-50 rounded">
                                  <span className="font-medium text-sm">{table.name}</span>
                                  <span className="text-xs text-gray-500 ml-2">
                                    ({table.fields.length} fields)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <Button 
                            onClick={() => createProjectMutation.mutate(template)}
                            disabled={createProjectMutation.isPending}
                            className="w-full"
                          >
                            {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => createProjectMutation.mutate(template)}
                      disabled={createProjectMutation.isPending}
                    >
                      {createProjectMutation.isPending ? 'Creating...' : 'Use Template'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}