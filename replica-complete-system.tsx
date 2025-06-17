import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Play, CheckCircle, Clock, FileText, Code, Database } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  plan?: AppPlan;
  isWaitingForApproval?: boolean;
  isCollapsed?: boolean;
  messageTitle?: string;
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

interface ChatHistory {
  id: string;
  title: string;
  timestamp: number;
  messages: Message[];
}

// Simulated Perplexity API call with proper delays
const callPerplexityAPI = async (prompt: string, context: string = '') => {
  // Simulate real API delay (2-8 seconds like Perplexity)
  await new Promise(resolve => setTimeout(resolve, Math.random() * 6000 + 2000));
  
  return {
    message: `Based on your request for "${prompt}", I'll analyze the requirements and create a comprehensive development plan.`,
    analysis: "Analyzing user requirements, identifying key features, and determining optimal technology stack...",
    plan: null
  };
};

// Generate plan after analysis (separate step)
const generatePlanFromAnalysis = async (userRequest: string): Promise<AppPlan> => {
  // Simulate plan generation delay (3-5 seconds)
  await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 3000));
  
  const lowerRequest = userRequest.toLowerCase();
  
  if (lowerRequest.includes('candy') || lowerRequest.includes('sweet')) {
    return {
      name: "Sweet Treats Store",
      description: "A modern e-commerce platform for candy and confectionery sales",
      type: "E-commerce Website",
      features: [
        "Product catalog with candy categories",
        "Shopping cart and checkout system", 
        "User authentication and profiles",
        "Payment processing integration",
        "Inventory management",
        "Order tracking system",
        "Review and rating system",
        "Mobile-responsive design"
      ],
      technologies: [
        "React.js for frontend",
        "Node.js/Express for backend",
        "PostgreSQL database",
        "Stripe for payments",
        "JWT authentication",
        "Tailwind CSS for styling"
      ],
      preview: {
        title: "Sweet Treats Store",
        description: "A comprehensive candy e-commerce platform with modern design and secure payment processing",
        sections: [
          "Homepage with featured products",
          "Product catalog with filtering",
          "Shopping cart and checkout",
          "User account management",
          "Admin dashboard"
        ]
      }
    };
  }
  
  // Default plan for other requests
  return {
    name: "Custom Web Application",
    description: "A tailored web application built to your specifications",
    type: "Web Application",
    features: [
      "Modern responsive design",
      "User-friendly interface",
      "Database integration",
      "API endpoints",
      "Authentication system"
    ],
    technologies: [
      "React.js",
      "Node.js/Express",
      "PostgreSQL",
      "Tailwind CSS"
    ],
    preview: {
      title: "Custom Web App",
      description: "A modern web application with full-stack functionality",
      sections: [
        "Frontend interface",
        "Backend API",
        "Database schema"
      ]
    }
  };
};

export default function CompleteReplicaSystem() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isBuildingApp, setIsBuildingApp] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const createNewChat = () => {
    const newChatId = Date.now().toString();
    const newChat: ChatHistory = {
      id: newChatId,
      title: 'New Chat',
      timestamp: Date.now(),
      messages: []
    };
    
    setChatHistory(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    setMessages([]);
  };

  const handleSend = async () => {
    if (!input.trim() || isAnalyzing || isGeneratingPlan || isBuildingApp) return;

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
    const userRequest = input;
    setInput('');

    // Step 1: Analysis Phase (7+ seconds)
    setIsAnalyzing(true);
    
    const analysisMessage: Message = {
      role: 'assistant',
      content: 'Analyzing your request and determining the best approach...',
      timestamp: Date.now(),
      messageTitle: 'Analysis Phase'
    };
    setMessages(prev => [...prev, analysisMessage]);

    try {
      const analysisResult = await callPerplexityAPI(userRequest);
      
      // Update analysis message
      setMessages(prev => prev.map(msg => 
        msg === analysisMessage 
          ? { ...msg, content: analysisResult.analysis }
          : msg
      ));
      
      setIsAnalyzing(false);

      // Step 2: Plan Generation Phase (3+ seconds)  
      setIsGeneratingPlan(true);
      
      const planMessage: Message = {
        role: 'assistant',
        content: 'Creating a comprehensive development plan based on the analysis...',
        timestamp: Date.now(),
        messageTitle: 'Plan Generation'
      };
      setMessages(prev => [...prev, planMessage]);

      const generatedPlan = await generatePlanFromAnalysis(userRequest);
      
      // Update plan message with actual plan
      const finalPlanMessage: Message = {
        role: 'assistant',
        content: `I've created a comprehensive plan for your ${generatedPlan.type.toLowerCase()}. Review the details below and approve when ready to build.`,
        timestamp: Date.now(),
        plan: generatedPlan,
        isWaitingForApproval: true,
        messageTitle: 'Development Plan Ready'
      };
      
      setMessages(prev => [...prev.slice(0, -1), finalPlanMessage]);
      setIsGeneratingPlan(false);

    } catch (error) {
      setIsAnalyzing(false);
      setIsGeneratingPlan(false);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleApprovePlan = async (plan: AppPlan) => {
    setIsBuildingApp(true);
    
    const buildingMessage: Message = {
      role: 'assistant',
      content: `Building your ${plan.name}... This will take a few moments.`,
      timestamp: Date.now(),
      messageTitle: 'Building Application'
    };
    setMessages(prev => [...prev, buildingMessage]);

    // Simulate file generation (fast template-based, 1-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const successMessage: Message = {
      role: 'assistant',
      content: `✅ Successfully built ${plan.name}! Your application includes ${plan.features.length} key features and is ready for deployment.`,
      timestamp: Date.now(),
      messageTitle: 'Build Complete'
    };
    
    setMessages(prev => [...prev.slice(0, -1), successMessage]);
    setIsBuildingApp(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNewChat}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setCurrentChatId(chat.id);
                setMessages(chat.messages);
              }}
              className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                currentChatId === chat.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="font-medium text-sm truncate">{chat.title}</div>
              <div className="text-xs text-gray-500">
                {new Date(chat.timestamp).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-semibold text-gray-800">
            AI Development Assistant
          </h1>
          <p className="text-sm text-gray-600">
            Describe your app idea and I'll analyze, plan, and build it for you
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Ready to build your app?</h3>
              <p>Describe what you want to create and I'll handle the rest</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className="mb-6">
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-blue-600' 
                      : 'bg-gradient-to-r from-purple-600 to-blue-600'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    {message.messageTitle && (
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        {message.messageTitle}
                      </div>
                    )}
                    
                    <div className={`rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-white border border-gray-200'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      
                      {message.plan && (
                        <div className="mt-4 border-t pt-4">
                          <div className="grid gap-4">
                            <div>
                              <h4 className="font-semibold text-lg mb-2">{message.plan.name}</h4>
                              <p className="text-gray-600 mb-3">{message.plan.description}</p>
                              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                {message.plan.type}
                              </span>
                            </div>
                            
                            <div>
                              <h5 className="font-medium mb-2">Key Features:</h5>
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                {message.plan.features.map((feature, idx) => (
                                  <li key={idx}>{feature}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h5 className="font-medium mb-2">Technologies:</h5>
                              <div className="flex flex-wrap gap-2">
                                {message.plan.technologies.map((tech, idx) => (
                                  <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            {message.isWaitingForApproval && (
                              <div className="pt-2 border-t">
                                <p className="text-sm text-gray-600 mb-3">
                                  Ready to build? Approve the plan to start development.
                                </p>
                                <button
                                  onClick={() => handleApprovePlan(message.plan!)}
                                  disabled={isBuildingApp}
                                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                  <Play className="h-4 w-4" />
                                  {isBuildingApp ? 'Building...' : 'Approve Plan & Build App'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* Loading states */}
          {(isAnalyzing || isGeneratingPlan || isBuildingApp) && (
            <div className="mb-6">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                
                <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      {isAnalyzing && 'Analyzing your request...'}
                      {isGeneratingPlan && 'Generating development plan...'}
                      {isBuildingApp && 'Building your application...'}
                    </span>
                  </div>
                  
                  {isAnalyzing && (
                    <div className="mt-2 text-xs text-gray-500">
                      This may take 7+ seconds as I thoroughly analyze your requirements
                    </div>
                  )}
                  {isGeneratingPlan && (
                    <div className="mt-2 text-xs text-gray-500">
                      Creating a comprehensive plan with features and technologies
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe the app you want to create..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isAnalyzing || isGeneratingPlan || isBuildingApp}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isAnalyzing || isGeneratingPlan || isBuildingApp}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            The system will analyze your request (7+ sec), generate a plan (3+ sec), then wait for your approval before building.
          </div>
        </div>
      </div>
    </div>
  );
}