import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, MessageCircle, Plus, X, Play, ChevronDown, ChevronUp } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
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
  };
  isWaitingForApproval?: boolean;
  isCollapsed?: boolean;
  messageTitle?: string;
}

interface ChatHistory {
  id: string;
  title: string;
  timestamp: number;
  messages: Message[];
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(true);
  const [generatedFiles, setGeneratedFiles] = useState<any[]>([]);
  const messagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      const conversations = await response.json();
      setChatHistories(conversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  // Create new chat
  const createNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    const newChat: ChatHistory = {
      id: newChatId,
      title: 'New Chat',
      timestamp: Date.now(),
      messages: []
    };
    setChatHistories(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    setMessages([]);
  };

  // Load existing chat
  const loadChat = (chatId: string) => {
    const chat = chatHistories.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
    }
  };

  // Save current chat
  const saveCurrentChat = async () => {
    if (currentChatId && messages.length > 0) {
      const title = messages[0]?.content.slice(0, 40) + '...' || 'New Chat';
      
      try {
        await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: currentChatId,
            title,
            messages
          })
        });

        setChatHistories(prev => prev.map(chat => 
          chat.id === currentChatId 
            ? { ...chat, messages, title }
            : chat
        ));
      } catch (error) {
        console.error('Failed to save conversation:', error);
      }
    }
  };

  // Delete chat
  const deleteChat = async (chatId: string) => {
    try {
      await fetch(`/api/conversations/${chatId}`, { method: 'DELETE' });
      setChatHistories(prev => prev.filter(c => c.id !== chatId));
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  // Save chat when messages change
  useEffect(() => {
    const timer = setTimeout(() => {
      saveCurrentChat();
    }, 1000);
    return () => clearTimeout(timer);
  }, [messages]);

  // Handle plan approval
  const handlePlanApproval = async (plan: any) => {
    setMessages(prev => prev.map(msg => 
      msg.plan === plan ? { ...msg, isWaitingForApproval: false } : msg
    ));

    const loadingMessage: Message = {
      role: 'assistant',
      content: 'Building your application...',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await fetch('/api/ai/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: plan.description })
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedFiles(data.files);
        
        const successMessage: Message = {
          role: 'assistant',
          content: `✅ Application built successfully!\n\nGenerated ${data.filesCreated} files:\n${data.files.map((f: any) => `• ${f.name}`).join('\n')}\n\n${data.instructions}`,
          timestamp: Date.now(),
          messageTitle: "Build Complete"
        };
        setMessages(prev => [...prev.slice(0, -1), successMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Failed to build application. Please try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!currentChatId) {
      createNewChat();
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Check if this is an app building request
      const isAppRequest = currentInput.toLowerCase().includes('build') || 
                          currentInput.toLowerCase().includes('create') || 
                          currentInput.toLowerCase().includes('make') ||
                          currentInput.toLowerCase().includes('app') ||
                          currentInput.toLowerCase().includes('application') ||
                          currentInput.toLowerCase().includes('website');

      if (isAppRequest) {
        // Get AI analysis first
        const analysisResponse = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: currentInput })
        });

        const analysisData = await analysisResponse.json();
        
        if (analysisData.success) {
          const analysisMessage: Message = {
            role: 'assistant',
            content: analysisData.message,
            timestamp: Date.now(),
            isCollapsed: true,
            messageTitle: "Initial Analysis"
          };
          setMessages(prev => [...prev, analysisMessage]);

          // Generate plan
          const planResponse = await fetch('/api/ai/generate-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: currentInput })
          });

          const planData = await planResponse.json();
          
          if (planData.success && planData.plan) {
            const planMessage: Message = {
              role: 'assistant',
              content: "Here's the detailed plan I've created:",
              timestamp: Date.now(),
              plan: planData.plan,
              isWaitingForApproval: true
            };
            setMessages(prev => [...prev, planMessage]);
          }
        }
      } else {
        // Regular chat
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: currentInput })
        });

        const data = await response.json();
        
        if (data.success) {
          const assistantMessage: Message = {
            role: 'assistant',
            content: data.message,
            timestamp: Date.now()
          };
          setMessages(prev => [...prev, assistantMessage]);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please ensure your Perplexity API key is configured.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat History Sidebar */}
      {showHistory && (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Chat History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={createNewChat}
              className="w-full bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {chatHistories.length === 0 ? (
              <p className="text-gray-500 text-sm text-center p-4">No previous chats</p>
            ) : (
              <div className="space-y-2">
                {chatHistories.map((chat) => (
                  <div
                    key={chat.id}
                    className={`relative rounded-md transition-colors group ${
                      currentChatId === chat.id ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                  >
                    <div
                      onClick={() => loadChat(chat.id)}
                      className="p-3 cursor-pointer hover:bg-gray-100"
                    >
                      <p className="font-medium text-sm truncate">{chat.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(chat.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {chat.messages.length} messages
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          {!showHistory && (
            <button
              onClick={() => setShowHistory(true)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <MessageCircle className="h-5 w-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-500" />
            <h1 className="text-lg font-semibold">AI Assistant Replica</h1>
          </div>
          <div className="w-10" />
        </div>

        {/* Messages */}
        <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">AI Assistant Ready</p>
              <p className="text-sm">Ask me to create any type of application</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div key={index} className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}>
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
                <div className={`rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white p-3' 
                    : 'bg-white border border-gray-200'
                }`}>
                  {message.messageTitle ? (
                    <div>
                      <button
                        onClick={() => {
                          setMessages(prev => prev.map(msg => 
                            msg === message ? { ...msg, isCollapsed: !msg.isCollapsed } : msg
                          ));
                        }}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
                      >
                        <span className="text-sm font-medium">{message.messageTitle}</span>
                        {message.isCollapsed ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
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
                    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">{message.plan.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{message.plan.name}</h3>
                          <p className="text-xs text-gray-500">{message.plan.type}</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{message.plan.description}</p>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Key Features:</h4>
                          <ul className="space-y-1">
                            {message.plan.features.map((feature, idx) => (
                              <li key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Technologies:</h4>
                          <div className="flex flex-wrap gap-1">
                            {message.plan.technologies.map((tech, idx) => (
                              <span key={idx} className="px-2 py-1 bg-white border rounded text-xs">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Preview:</h4>
                          <div className="bg-white border rounded p-3">
                            <h5 className="font-medium text-sm">{message.plan.preview.title}</h5>
                            <p className="text-xs text-gray-600 mt-1">{message.plan.preview.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {message.plan.preview.sections.map((section, idx) => (
                                <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                                  {section}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {message.isWaitingForApproval && (
                        <div className="flex gap-2 mt-4 pt-4 border-t">
                          <button
                            onClick={() => handlePlanApproval(message.plan)}
                            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center justify-center gap-2"
                          >
                            <Play className="h-4 w-4" />
                            Build This App
                          </button>
                          <button
                            onClick={() => {
                              setMessages(prev => prev.map(msg => 
                                msg === message ? { ...msg, isWaitingForApproval: false } : msg
                              ));
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
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
                <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-medium">U</span>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="bg-white border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me to create an application..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Ask me to create any type of application</p>
        </form>
      </div>
    </div>
  );
}