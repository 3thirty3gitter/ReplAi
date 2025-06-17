import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Toolbar } from "@/components/Toolbar";

import { AIAssistant } from "@/components/AIAssistant";
import { Terminal } from "@/components/Terminal";
import { VisualBuilder } from "@/components/VisualBuilder";
import { DatabaseBuilder } from "@/components/DatabaseBuilder";
import { WorkflowBuilder } from "@/components/WorkflowBuilder";
import { DeploymentCenter } from "@/components/DeploymentCenter";
import { ProjectTemplates } from "@/components/ProjectTemplates";
import { QuickStartTemplates } from "@/components/QuickStartTemplates";
import { HelpCenter } from "@/components/HelpCenter";
import { LivePreview } from "@/components/LivePreview";
import SettingsPage from "./Settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Code2, 
  Layout, 
  Database, 
  Zap, 
  Rocket, 
  FileText,
  Palette,
  Settings,
  HelpCircle,
  Bot,
  Send,
  Play,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FolderTree,
  Terminal as TerminalIcon
} from "lucide-react";
import type { Project, File } from "@shared/schema";

export default function IDE() {
  const [currentProjectId, setCurrentProjectId] = useState<number>(1);

  const [isTerminalMaximized, setIsTerminalMaximized] = useState(false);

  const [activeTab, setActiveTab] = useState<string>('preview');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showFileTree, setShowFileTree] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  
  // Chat history management
  const [chatHistories, setChatHistories] = useState<Array<{
    id: string;
    title: string;
    timestamp: number;
    messages: Array<{
      role: 'user' | 'assistant', 
      content: string, 
      timestamp: number,
      plan?: {
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
      },
      isWaitingForApproval?: boolean;
      isAuditReport?: boolean;
      isCollapsed?: boolean;
      messageTitle?: string;
    }>;
  }>>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [aiMessages, setAIMessages] = useState<Array<{
    role: 'user' | 'assistant', 
    content: string, 
    timestamp: number,
    plan?: {
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
    },
    isWaitingForApproval?: boolean;
    isAuditReport?: boolean;
    isCollapsed?: boolean;
    messageTitle?: string;
  }>>([]);
  const [aiInput, setAIInput] = useState('');
  const [aiPanelWidth, setAiPanelWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(true);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [aiMessages, isAILoading]);

  // Handle resize functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      setAiPanelWidth(Math.max(300, Math.min(800, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Chat history management functions
  const createNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      timestamp: Date.now(),
      messages: []
    };
    setChatHistories(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    setAIMessages([]);
  };

  const loadChat = (chatId: string) => {
    const chat = chatHistories.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setAIMessages(chat.messages);
    }
  };

  const saveCurrentChat = () => {
    if (currentChatId && aiMessages.length > 0) {
      setChatHistories(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { 
              ...chat, 
              messages: aiMessages,
              title: aiMessages[0]?.content.slice(0, 50) + '...' || 'New Chat'
            }
          : chat
      ));
    }
  };

  const deleteChat = (chatId: string) => {
    setChatHistories(prev => prev.filter(c => c.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
      setAIMessages([]);
    }
  };

  // Save chat whenever messages change
  useEffect(() => {
    saveCurrentChat();
  }, [aiMessages]);

  const [isAppBuilding, setIsAppBuilding] = useState(false);
  const [buildingSteps, setBuildingSteps] = useState<string[]>([]);
  const [currentBuildStep, setCurrentBuildStep] = useState(0);
  const [generatedAppFiles, setGeneratedAppFiles] = useState<Array<{name: string, content: string, language: string, path: string}>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all projects
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects']
  });

  // Get current project
  const { data: project } = useQuery<Project>({
    queryKey: ['/api/projects', currentProjectId],
    enabled: !!currentProjectId
  });

  // Get files for current project
  const { data: files = [] } = useQuery<File[]>({
    queryKey: ['/api/files', currentProjectId],
    enabled: !!currentProjectId
  });

  // Handle plan approval and start app generation
  const handlePlanApproval = async (plan: any) => {
    setIsAppBuilding(true);
    setCurrentBuildStep(0);
    setBuildingSteps([
      "Initializing project structure...",
      "Generating React components...",
      "Setting up API endpoints...",
      "Creating database schema...",
      "Configuring authentication...",
      "Finalizing deployment setup..."
    ]);

    // Remove approval waiting state from the message
    setAIMessages(prev => prev.map(msg => 
      msg.plan === plan ? { ...msg, isWaitingForApproval: false } : msg
    ));

    try {
      // Call the actual file generation API
      const response = await apiRequest('POST', '/api/ai/generate-project', {
        prompt: plan.description,
        projectId: currentProjectId,
        projectType: 'web',
        framework: 'react'
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedAppFiles(data.files || []);
        
        // Add success message
        const successMessage = {
          role: 'assistant' as const,
          content: `✅ Application built successfully! Generated ${data.filesCreated} files in ${data.generationTime}ms.\n\n${data.instructions}`,
          timestamp: Date.now(),
          isAuditReport: true,
          messageTitle: "Build Complete - Audit Report"
        };
        setAIMessages(prev => [...prev, successMessage]);
        
        toast({
          title: "Application Built Successfully!",
          description: `Generated ${data.filesCreated} files for your project.`,
        });
        
        // Refresh file list
        queryClient.invalidateQueries({ queryKey: ['/api/files', currentProjectId] });
      } else {
        throw new Error(data.error || 'Failed to generate application');
      }
    } catch (error) {
      console.error('Error generating app:', error);
      const errorMessage = {
        role: 'assistant' as const,
        content: `❌ There was an error building your application. Please try again.`,
        timestamp: Date.now()
      };
      setAIMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Build Failed",
        description: "There was an error generating your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAppBuilding(false);
      setCurrentBuildStep(0);
      setBuildingSteps([]);
    }
  };

  // Generate app plan based on prompt
  const generateAppPlan = (prompt: string) => {
    const lowerMessage = prompt.toLowerCase();
    
    if (lowerMessage.includes('surfboard') || lowerMessage.includes('surf')) {
      return {
        name: "Wave Rider Surfboards",
        description: "A premium e-commerce platform for selling surfboards with customization options and secure payments",
        type: "E-commerce",
        features: [
          "Product catalog with filtering",
          "Surfboard customization tool",
          "Secure payment processing",
          "User accounts and order history",
          "Responsive design for all devices",
          "Admin dashboard for inventory",
          "Customer reviews and ratings",
          "Shipping calculator"
        ],
        technologies: ["React", "TypeScript", "Tailwind CSS", "Express.js", "PostgreSQL", "Stripe"],
        preview: {
          title: "Wave Rider Surfboards",
          description: "Ride the Wave - Premium surfboards crafted for every skill level. From beginners to pros, find your perfect board.",
          sections: ["Hero Section", "Featured Products", "Shop by Category", "About Us", "Contact"]
        }
      };
    }
    
    if (lowerMessage.includes('todo') || lowerMessage.includes('task')) {
      return {
        name: "Task Manager Pro",
        description: "A comprehensive task management application with project organization and team collaboration features",
        type: "Productivity",
        features: [
          "Create and manage tasks",
          "Project organization",
          "Priority levels and due dates",
          "Progress tracking",
          "Categories and tags",
          "Search and filtering",
          "Task completion analytics",
          "Responsive design"
        ],
        technologies: ["React", "TypeScript", "Tailwind CSS", "Express.js", "PostgreSQL"],
        preview: {
          title: "TaskFlow",
          description: "Organize your work and life with powerful task management",
          sections: ["Dashboard", "Task Lists", "Projects", "Analytics"]
        }
      };
    }
    
    // Default plan for general requests
    return {
      name: "Custom Web Application",
      description: "A modern web application tailored to your specific requirements",
      type: "Web Application",
      features: [
        "Responsive design",
        "Modern UI components",
        "Interactive functionality",
        "Database integration",
        "API endpoints",
        "User-friendly interface"
      ],
      technologies: ["React", "TypeScript", "Tailwind CSS", "Express.js", "PostgreSQL"],
      preview: {
        title: "Your Custom App",
        description: "A comprehensive solution built with modern technologies",
        sections: ["Dashboard", "Main Features", "Settings"]
      }
    };
  };

  // AI Chat handler
  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || isAILoading) return;

    // Create new chat if none exists
    if (!currentChatId) {
      createNewChat();
    }

    const userMessage = {
      role: 'user' as const,
      content: aiInput,
      timestamp: Date.now()
    };

    setAIMessages(prev => [...prev, userMessage]);
    const currentInput = aiInput;
    setAIInput('');
    setIsAILoading(true);

    try {
      // Check if this is an app building request
      const isAppRequest = currentInput.toLowerCase().includes('build') || 
                          currentInput.toLowerCase().includes('create') || 
                          currentInput.toLowerCase().includes('make') ||
                          currentInput.toLowerCase().includes('app') ||
                          currentInput.toLowerCase().includes('application') ||
                          currentInput.toLowerCase().includes('website') ||
                          currentInput.toLowerCase().includes('platform') ||
                          currentInput.toLowerCase().includes('system') ||
                          currentInput.toLowerCase().includes('store') ||
                          currentInput.toLowerCase().includes('shop') ||
                          currentInput.toLowerCase().includes('ecommerce') ||
                          currentInput.toLowerCase().includes('blog') ||
                          currentInput.toLowerCase().includes('dashboard') ||
                          currentInput.toLowerCase().includes('todo') ||
                          currentInput.toLowerCase().includes('task') ||
                          currentInput.toLowerCase().includes('social') ||
                          currentInput.toLowerCase().includes('portfolio') ||
                          currentInput.toLowerCase().includes('cms') ||
                          currentInput.toLowerCase().includes('saas');

      if (isAppRequest) {
        // Get AI analysis and then generate plan
        const analysisResponse = await apiRequest('POST', '/api/ai/chat', {
          message: currentInput,
          projectId: currentProjectId
        });

        const analysisData = await analysisResponse.json();
        
        const analysisMessage = {
          role: 'assistant' as const,
          content: analysisData.message || "I understand your request. Let me create a comprehensive plan for your application.",
          timestamp: Date.now(),
          isCollapsed: true,
          messageTitle: "Initial Analysis & Planning"
        };
        setAIMessages(prev => [...prev, analysisMessage]);

        // Generate the detailed plan
        try {
          const planResponse = await apiRequest('POST', '/api/ai/generate-plan', {
            prompt: currentInput
          });
          
          const planData = await planResponse.json();
          
          if (planData.success && planData.plan) {
            const planMessage = {
              role: 'assistant' as const,
              content: `Here's the detailed plan I've created based on your requirements:`,
              timestamp: Date.now(),
              plan: planData.plan,
              isWaitingForApproval: true
            };
            setAIMessages(prev => [...prev, planMessage]);
          } else {
            const plan = generateAppPlan(currentInput);
            const planMessage = {
              role: 'assistant' as const,
              content: `Here's the detailed plan I've created based on your requirements:`,
              timestamp: Date.now(),
              plan: plan,
              isWaitingForApproval: true
            };
            setAIMessages(prev => [...prev, planMessage]);
          }
        } catch (error) {
          const plan = generateAppPlan(currentInput);
          const planMessage = {
            role: 'assistant' as const,
            content: `Here's the detailed plan I've created based on your requirements:`,
            timestamp: Date.now(),
            plan: plan,
            isWaitingForApproval: true
          };
          setAIMessages(prev => [...prev, planMessage]);
        }
      } else {
        // Regular chat response using Perplexity
        const response = await apiRequest('POST', '/api/ai/chat', {
          message: currentInput,
          projectId: currentProjectId
        });

        const data = await response.json();
        const assistantMessage = {
          role: 'assistant' as const,
          content: data.message || "I'm here to help you build applications. What would you like to create?",
          timestamp: Date.now()
        };
        setAIMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error in AI chat:', error);
      const errorMessage = {
        role: 'assistant' as const,
        content: "I'm sorry, there was an error processing your request. Please try again.",
        timestamp: Date.now()
      };
      setAIMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-editor-bg text-editor-text">
      {/* Left Side - AI Assistant (Resizable) */}
      <div 
        className="border-r border-editor-border bg-editor-surface flex flex-col relative"
        style={{ width: `${aiPanelWidth}px` }}
      >
        {/* Resize Handle */}
        <div
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-editor-border hover:bg-editor-primary transition-colors z-10"
          onMouseDown={handleMouseDown}
        />
        
        {/* AI Panel Header */}
        <div className="p-3 border-b border-editor-border bg-editor-bg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-editor-text">AI Assistant</h2>
                <p className="text-xs text-editor-text-dim">Powered by Perplexity</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-editor-text-dim">Ready</span>
            </div>
          </div>
        </div>
        
        {/* AI Chat Interface with History Sidebar */}
        <div className="flex-1 flex bg-editor-surface min-h-0">
          {/* Chat History Sidebar */}
          {showChatHistory && (
            <div className="w-64 border-r border-editor-border bg-editor-bg flex flex-col">
              {/* Sidebar Header */}
              <div className="p-3 border-b border-editor-border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-editor-text">Chat History</h3>
                  <button
                    onClick={() => setShowChatHistory(false)}
                    className="p-1 hover:bg-editor-surface rounded text-editor-text-dim hover:text-editor-text"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={createNewChat}
                  className="w-full bg-editor-primary text-white px-3 py-2 rounded-md text-sm hover:bg-editor-primary/80 flex items-center justify-center gap-2"
                >
                  <Bot className="h-4 w-4" />
                  New Chat
                </button>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                {chatHistories.length === 0 ? (
                  <div className="p-3 text-center text-editor-text-dim text-sm">
                    No previous chats
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {chatHistories.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => loadChat(chat.id)}
                        className={`w-full text-left p-3 rounded-md text-sm hover:bg-editor-surface transition-colors group ${
                          currentChatId === chat.id ? 'bg-editor-surface border border-editor-border' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-editor-text font-medium truncate">
                              {chat.title}
                            </p>
                            <p className="text-xs text-editor-text-dim">
                              {new Date(chat.timestamp).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-editor-text-dim">
                              {chat.messages.length} messages
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat(chat.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-500 hover:text-red-700 transition-opacity"
                          >
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-3 border-b border-editor-border bg-editor-bg flex items-center justify-between">
              {!showChatHistory && (
                <button
                  onClick={() => setShowChatHistory(true)}
                  className="p-1 hover:bg-editor-surface rounded text-editor-text-dim hover:text-editor-text"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-editor-primary" />
                <span className="text-sm font-medium text-editor-text">AI Assistant</span>
              </div>
              <div className="w-6" /> {/* Spacer for alignment */}
            </div>

            {/* Chat Messages */}
            <div ref={chatMessagesRef} className="flex-1 overflow-y-auto p-4 space-y-4 max-h-full">
              {aiMessages.length === 0 && (
                <div className="text-center text-editor-text-dim py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-editor-text-dim" />
                  <p className="text-lg font-medium mb-2 text-editor-text">AI Assistant Ready</p>
                  <p className="text-sm text-editor-text-dim">Ask me to create any type of application and I'll help you build it step by step.</p>
                </div>
              )}
              
              {aiMessages.map((message, index) => (
                <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
                    <div className={`rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-editor-primary text-white ml-auto p-3' 
                        : 'bg-editor-bg text-editor-text border border-editor-border'
                    }`}>
                      {message.messageTitle ? (
                        <div>
                          <button
                            onClick={() => {
                              setAIMessages(prev => prev.map(msg => 
                                msg === message ? { ...msg, isCollapsed: !msg.isCollapsed } : msg
                              ));
                            }}
                            className="w-full flex items-center justify-between p-3 text-left hover:bg-editor-surface"
                          >
                            <span className="text-sm font-medium text-editor-text">{message.messageTitle}</span>
                            {message.isCollapsed ? (
                              <ChevronDown className="h-4 w-4 text-editor-text-dim" />
                            ) : (
                              <ChevronUp className="h-4 w-4 text-editor-text-dim" />
                            )}
                          </button>
                          {!message.isCollapsed && (
                            <div className="px-3 pb-3">
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3">
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      )}
                      
                      {/* Plan Preview */}
                      {message.plan && (
                        <div className="mt-4 bg-editor-surface border border-editor-border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-lg">{message.plan.name.charAt(0)}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-editor-text">{message.plan.name}</h3>
                              <p className="text-xs text-editor-text-dim">{message.plan.type}</p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-editor-text-dim mb-4">{message.plan.description}</p>
                          
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-editor-text mb-2">Key Features:</h4>
                              <ul className="space-y-1">
                                {message.plan.features.map((feature, idx) => (
                                  <li key={idx} className="text-xs text-editor-text-dim flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-editor-primary rounded-full"></div>
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-editor-text mb-2">Technologies:</h4>
                              <div className="flex flex-wrap gap-1">
                                {message.plan.technologies.map((tech, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-editor-bg border border-editor-border rounded text-xs text-editor-text">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-editor-text mb-2">Preview:</h4>
                              <div className="bg-editor-bg border border-editor-border rounded p-3">
                                <h5 className="font-medium text-editor-text text-sm">{message.plan.preview.title}</h5>
                                <p className="text-xs text-editor-text-dim mt-1">{message.plan.preview.description}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {message.plan.preview.sections.map((section, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-editor-surface border border-editor-border rounded text-xs text-editor-text-dim">
                                      {section}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {message.isWaitingForApproval && (
                            <div className="flex gap-2 mt-4 pt-4 border-t border-editor-border">
                              <button
                                onClick={() => handlePlanApproval(message.plan)}
                                className="flex-1 bg-editor-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-editor-primary/80 flex items-center justify-center gap-2"
                              >
                                <Play className="h-4 w-4" />
                                Build This App
                              </button>
                              <button
                                onClick={() => {
                                  setAIMessages(prev => prev.map(msg => 
                                    msg === message ? { ...msg, isWaitingForApproval: false } : msg
                                  ));
                                }}
                                className="px-4 py-2 border border-editor-border text-editor-text rounded-md text-sm hover:bg-editor-surface"
                              >
                                Modify Plan
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-editor-text-dim flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-medium">U</span>
                    </div>
                  )}
                </div>
              ))}
              
              {isAILoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-editor-bg border border-editor-border rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-editor-primary border-t-transparent rounded-full"></div>
                      <span className="text-sm text-editor-text-dim">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-editor-border bg-editor-bg">
              <form id="ai-form" onSubmit={handleAISubmit} className="flex gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAIInput(e.target.value)}
                  placeholder="Ask me to create an application..."
                  className="flex-1 px-3 py-2 bg-editor-surface border border-editor-border rounded-md text-editor-text placeholder:text-editor-text-dim focus:outline-none focus:ring-2 focus:ring-editor-primary"
                  disabled={isAILoading}
                />
                <button
                  type="submit"
                  disabled={!aiInput.trim() || isAILoading}
                  className="px-4 py-2 bg-editor-primary text-white rounded-md hover:bg-editor-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <p className="text-xs text-editor-text-dim mt-2">Ask me to create any type of application</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header with Project Selector and Tools */}
        <div className="h-12 bg-editor-surface border-b border-editor-border flex items-center px-4 justify-between">
          <div className="flex items-center space-x-4">
            <Select value={currentProjectId.toString()} onValueChange={(value) => setCurrentProjectId(parseInt(value))}>
              <SelectTrigger className="w-48 h-8 bg-editor-bg border-editor-border text-editor-text">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projects.map((proj) => (
                  <SelectItem key={proj.id} value={proj.id.toString()}>
                    {proj.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTerminal(!showTerminal)}
              className="h-8 px-3 text-xs bg-editor-bg border-editor-border hover:bg-editor-primary hover:text-white"
            >
              <TerminalIcon className="h-3 w-3 mr-1" />
              Terminal
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="bg-editor-surface border-b border-editor-border h-auto p-0 rounded-none justify-start">
            <TabsTrigger 
              value="preview" 
              className="text-sm px-4 py-2 bg-transparent data-[state=active]:bg-editor-bg data-[state=active]:text-editor-primary border-b-2 border-transparent data-[state=active]:border-editor-primary rounded-none"
            >
              <Play className="h-4 w-4 mr-2" />
              Live Preview
            </TabsTrigger>

            <TabsTrigger 
              value="database" 
              className="text-sm px-4 py-2 bg-transparent data-[state=active]:bg-editor-bg data-[state=active]:text-editor-primary border-b-2 border-transparent data-[state=active]:border-editor-primary rounded-none"
            >
              <Database className="h-4 w-4 mr-2" />
              Database
            </TabsTrigger>
            <TabsTrigger 
              value="deploy" 
              className="text-sm px-4 py-2 bg-transparent data-[state=active]:bg-editor-bg data-[state=active]:text-editor-primary border-b-2 border-transparent data-[state=active]:border-editor-primary rounded-none"
            >
              <Rocket className="h-4 w-4 mr-2" />
              Deploy
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="text-sm px-4 py-2 bg-transparent data-[state=active]:bg-editor-bg data-[state=active]:text-editor-primary border-b-2 border-transparent data-[state=active]:border-editor-primary rounded-none"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <div className="flex-1 flex">
            <TabsContent value="preview" className="flex-1 m-0 p-0">
              <LivePreview
                projectId={currentProjectId}
                isBuilding={isAppBuilding}
                buildingSteps={buildingSteps}
                currentStep={currentBuildStep}
                generatedFiles={generatedAppFiles}
              />
            </TabsContent>

            <TabsContent value="database" className="flex-1 m-0 p-0">
              <DatabaseBuilder projectId={currentProjectId} />
            </TabsContent>

            <TabsContent value="deploy" className="flex-1 m-0 p-0">
              <DeploymentCenter projectId={currentProjectId} />
            </TabsContent>

            <TabsContent value="settings" className="flex-1 m-0 p-0">
              <SettingsPage />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      {/* Terminal Panel */}
      {showTerminal && (
        <div className="h-64 border-t border-editor-border bg-editor-surface">
          <div className="flex items-center justify-between p-2 border-b border-editor-border">
            <h3 className="text-sm font-medium text-editor-text">Terminal</h3>
            <button
              onClick={() => setShowTerminal(false)}
              className="p-1 hover:bg-editor-bg rounded text-editor-text-dim hover:text-editor-text"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
          <Terminal 
            projectId={currentProjectId} 
            isMaximized={isTerminalMaximized}
            onToggleMaximize={() => setIsTerminalMaximized(!isTerminalMaximized)}
          />
        </div>
      )}

      {showQuickStart && (
        <QuickStartTemplates
          onClose={() => setShowQuickStart(false)}
          onSelectTemplate={(prompt) => {
            setAIInput(prompt);
            setShowQuickStart(false);
            setTimeout(() => {
              const form = document.querySelector('#ai-form') as HTMLFormElement;
              if (form) form.requestSubmit();
            }, 100);
          }}
        />
      )}

      {showHelp && (
        <HelpCenter onClose={() => setShowHelp(false)} />
      )}
    </div>
  );
}