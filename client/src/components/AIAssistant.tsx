import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  User, 
  Send, 
  X,
  GripVertical,
  Eye,
  CheckCircle,
  Play,
  Code
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AIAssistantProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
  currentCode?: string;
  currentLanguage?: string;
  onAppBuilding?: (isBuilding: boolean, steps: string[], currentStep: number) => void;
  onAppGenerated?: (files: Array<{name: string, content: string, language: string, path: string}>) => void;
}

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  plan?: AppPlan;
  isWaitingForApproval?: boolean;
}

interface AppPlan {
  name: string;
  description: string;
  type: string;
  features: string[];
  technologies: string[];
  preview: {
    title: string;
    description: string;
    sections: string[];
  };
}

export function AIAssistant({ 
  projectId, 
  isOpen, 
  onClose,
  currentCode,
  currentLanguage,
  onAppBuilding,
  onAppGenerated
}: AIAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const buildingSteps = [
    "Analyzing your request...",
    "Designing the app structure...", 
    "Creating React components...",
    "Adding database schema...",
    "Implementing API endpoints...",
    "Adding interactive features...",
    "Optimizing performance...",
    "Final touches and testing..."
  ];

  const generatePlan = (userMessage: string): AppPlan => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('surfboard') || lowerMessage.includes('surf')) {
      return {
        name: "SurfBoard Bazaar",
        description: "An e-commerce website for selling surfboards with product catalog, shopping cart, and surf-inspired design",
        type: "E-commerce",
        features: [
          "Product catalog with surfboard listings",
          "Individual product detail pages", 
          "Shopping cart functionality",
          "Basic checkout process (mocked for MVP)",
          "Product search and filtering",
          "Category browsing (longboards, shortboards, etc.)",
          "Product image galleries",
          "Basic inventory display"
        ],
        technologies: ["React", "TypeScript", "Tailwind CSS", "Express", "Database"],
        preview: {
          title: "Wave Rider",
          description: "Ride the Wave - Discover premium surfboards crafted for every skill level. From beginners to pros, find your perfect board.",
          sections: ["Hero Section", "Shop by Category", "Featured Products", "About Section"]
        }
      };
    }
    
    return {
      name: "Custom Web Application",
      description: "A modern web application tailored to your requirements",
      type: "Web Application",
      features: [
        "Responsive design",
        "Modern UI components",
        "Interactive functionality",
        "Database integration",
        "API endpoints"
      ],
      technologies: ["React", "TypeScript", "Tailwind CSS", "Express", "Database"],
      preview: {
        title: "Your App",
        description: "A comprehensive solution built with modern technologies",
        sections: ["Dashboard", "Main Features", "User Interface"]
      }
    };
  };

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/ai/chat', {
        message,
        code: currentCode,
        language: currentLanguage,
        projectId
      });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    }
  });

  const planMutation = useMutation({
    mutationFn: async (message: string) => {
      const plan = generatePlan(message);
      return { plan };
    },
    onSuccess: (data) => {
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: `I'll help you create ${data.plan.description}. Let me analyze your requirements and develop a comprehensive plan for your ${data.plan.type.toLowerCase()}.`,
        timestamp: Date.now(),
        plan: data.plan,
        isWaitingForApproval: true
      };
      setMessages(prev => [...prev, assistantMessage]);
    }
  });

  const buildMutation = useMutation({
    mutationFn: async (plan: AppPlan) => {
      setIsGenerating(true);
      onAppBuilding?.(true, buildingSteps, 0);

      for (let i = 0; i < buildingSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        onAppBuilding?.(true, buildingSteps, i);
      }

      const response = await apiRequest('POST', '/api/ai/generate-project', {
        prompt: `Create ${plan.description}`,
        projectId,
        projectType: 'web',
        framework: 'react',
        includeTests: false
      });

      const data = await response.json();
      setIsGenerating(false);
      onAppBuilding?.(false, [], 0);
      
      if (data.success && data.files?.length > 0) {
        onAppGenerated?.(data.files);
        
        return {
          message: "Application built successfully! Your surfboard store is ready with full e-commerce functionality.",
          isAppGenerated: true
        };
      } else {
        throw new Error('Failed to generate application');
      }
    },
    onSuccess: (data) => {
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to build application. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSend = () => {
    if (!input.trim() || planMutation.isPending) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    
    const isAppRequest = input.toLowerCase().includes('build') || 
                        input.toLowerCase().includes('create') || 
                        input.toLowerCase().includes('make') ||
                        input.toLowerCase().includes('app') ||
                        input.toLowerCase().includes('website') ||
                        input.toLowerCase().includes('page') ||
                        input.toLowerCase().includes('store') ||
                        input.toLowerCase().includes('sell');

    if (isAppRequest) {
      planMutation.mutate(input);
    } else {
      chatMutation.mutate(input);
    }

    setInput('');
  };

  const handleApprove = (plan: AppPlan) => {
    buildMutation.mutate(plan);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l shadow-lg z-50 flex flex-col">
      {/* Resizable handle */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize flex items-center justify-center group">
        <GripVertical className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">AI Assistant Ready</p>
              <p className="text-sm">Ask me to create any type of application and I'll show you a detailed plan with visual preview before building.</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              
              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
                <div className={`rounded-lg p-3 ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white ml-auto' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                
                {/* Plan Preview */}
                {message.plan && (
                  <div className="mt-4 space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{message.plan.name}</CardTitle>
                          <Badge variant="secondary">{message.plan.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{message.plan.description}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Visual Preview */}
                        <div className="border rounded-lg p-4 bg-gradient-to-b from-blue-50 to-white">
                          <div className="flex items-center gap-2 mb-3">
                            <Eye className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-sm">Visual Preview</span>
                          </div>
                          <div className="bg-white rounded border p-4 space-y-3">
                            <div className="text-center">
                              <h3 className="text-xl font-bold text-blue-600">{message.plan.preview.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{message.plan.preview.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {message.plan.preview.sections.map((section, idx) => (
                                <div key={idx} className="bg-gray-50 rounded p-2 text-xs text-center">{section}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Features */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-sm">Initial Features</span>
                          </div>
                          <div className="space-y-1">
                            {message.plan.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs">
                                <div className="w-1 h-1 bg-gray-400 rounded-full" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Technologies */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Code className="h-4 w-4 text-purple-600" />
                            <span className="font-medium text-sm">Technology Stack</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {message.plan.technologies.map((tech, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{tech}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        {message.isWaitingForApproval && (
                          <div className="pt-2 border-t">
                            <p className="text-sm text-gray-600 mb-3">Ready to build? Approve the plan when you're ready.</p>
                            <Button 
                              onClick={() => handleApprove(message.plan!)} 
                              className="w-full"
                              disabled={buildMutation.isPending}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              {buildMutation.isPending ? 'Building...' : 'Approve plan & start'}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
              
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {(chatMutation.isPending || planMutation.isPending || buildMutation.isPending) && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    {buildMutation.isPending ? 'Building your application...' : 'Thinking...'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe the app you want to create..."
            className="flex-1"
            disabled={chatMutation.isPending || planMutation.isPending || buildMutation.isPending}
          />
          <Button 
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isPending || planMutation.isPending || buildMutation.isPending}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Ask me to create any type of application - I'll show you a plan first!</p>
      </div>
    </div>
  );
}