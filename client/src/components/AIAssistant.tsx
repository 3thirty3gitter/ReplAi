import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bot, User, Send, X, Code, Bug, Lightbulb } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AIMessage } from "@shared/schema";

interface AIAssistantProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
  currentCode?: string;
  currentLanguage?: string;
}

interface AIResponse {
  suggestion: string;
  explanation: string;
  confidence: number;
}

export function AIAssistant({ 
  projectId, 
  isOpen, 
  onClose, 
  currentCode = '', 
  currentLanguage = 'javascript' 
}: AIAssistantProps) {
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  // Load conversation history
  const { data: conversation } = useQuery<{ messages: AIMessage[] }>({
    queryKey: ['/api/projects', projectId, 'ai-conversation'],
    enabled: isOpen && !!projectId
  });

  // Quick action mutations
  const generateCodeMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest('POST', '/api/ai/generate-code', {
        prompt,
        language: currentLanguage
      });
      return response.json();
    },
    onSuccess: (data) => {
      addAIMessage(`Generated code:\n\`\`\`${currentLanguage}\n${data.code}\n\`\`\``);
    }
  });

  const explainCodeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/ai/explain-code', {
        code: currentCode,
        language: currentLanguage
      });
      return response.json();
    },
    onSuccess: (data) => {
      addAIMessage(data.explanation);
    }
  });

  const debugCodeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/ai/debug-code', {
        code: currentCode,
        language: currentLanguage
      });
      return response.json();
    },
    onSuccess: (data: AIResponse) => {
      addAIMessage(`Debug analysis:\n\n${data.explanation}\n\nSuggested fix:\n\`\`\`${currentLanguage}\n${data.suggestion}\n\`\`\``);
    }
  });

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isOpen || !projectId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setIsConnected(true);
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'ai_response':
          const response: AIResponse = data.response;
          const aiMessage = `${response.suggestion}\n\n${response.explanation}`;
          addAIMessage(aiMessage);
          break;
        case 'error':
          addAIMessage(`Error: ${data.message}`);
          break;
      }
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isOpen, projectId]);

  // Load conversation history
  useEffect(() => {
    if (conversation?.messages) {
      setMessages(conversation.messages);
    }
  }, [conversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const addUserMessage = (content: string) => {
    const userMessage: AIMessage = {
      role: 'user',
      content,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);
  };

  const addAIMessage = (content: string) => {
    const aiMessage: AIMessage = {
      role: 'assistant',
      content,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, aiMessage]);
  };

  const sendMessage = () => {
    if (!message.trim() || !isConnected || !wsRef.current) return;

    addUserMessage(message);

    wsRef.current.send(JSON.stringify({
      type: 'ai_message',
      id: Date.now().toString(),
      projectId,
      prompt: message,
      code: currentCode,
      language: currentLanguage,
      context: `Current file: ${currentLanguage} code`
    }));

    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    {
      label: 'Generate Code',
      icon: Code,
      action: () => {
        const prompt = 'Generate a simple function based on the current context';
        addUserMessage(prompt);
        generateCodeMutation.mutate(prompt);
      }
    },
    {
      label: 'Explain Code',
      icon: Lightbulb,
      action: () => {
        if (!currentCode.trim()) {
          addAIMessage('Please select some code in the editor first.');
          return;
        }
        addUserMessage('Please explain this code');
        explainCodeMutation.mutate();
      }
    },
    {
      label: 'Debug Code',
      icon: Bug,
      action: () => {
        if (!currentCode.trim()) {
          addAIMessage('Please select some code in the editor first.');
          return;
        }
        addUserMessage('Help me debug this code');
        debugCodeMutation.mutate();
      }
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-editor-surface border-l border-editor-border flex flex-col">
      <div className="p-3 border-b border-editor-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-4 w-4 text-editor-primary" />
            <h3 className="text-sm font-medium">AI Assistant</h3>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-editor-text-dim hover:text-editor-text"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-editor-border">
        <div className="text-xs text-editor-text-dim mb-2">Quick Actions</div>
        <div className="space-y-1">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8 text-xs hover:bg-editor-bg"
              onClick={action.action}
              disabled={generateCodeMutation.isPending || explainCodeMutation.isPending || debugCodeMutation.isPending}
            >
              <action.icon className="h-3 w-3 mr-2" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-editor-text-dim text-sm">
              <Bot className="h-8 w-8 mx-auto mb-2 text-editor-primary" />
              <p>Hello! I'm your AI coding assistant.</p>
              <p className="mt-1">I can help you with:</p>
              <ul className="mt-2 text-xs space-y-1">
                <li>• Code generation</li>
                <li>• Debugging</li>
                <li>• Code explanations</li>
                <li>• Best practices</li>
              </ul>
            </div>
          )}
          
          {messages.map((msg, index) => (
            <div key={index} className="flex space-x-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                {msg.role === 'assistant' ? (
                  <div className="w-6 h-6 bg-editor-primary rounded-full flex items-center justify-center">
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Card className={`${msg.role === 'assistant' ? 'bg-editor-bg' : 'bg-editor-primary bg-opacity-20'}`}>
                  <CardContent className="p-3">
                    <div className="text-sm whitespace-pre-wrap break-words">
                      {msg.content}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}

          {(generateCodeMutation.isPending || explainCodeMutation.isPending || debugCodeMutation.isPending) && (
            <div className="flex space-x-2">
              <div className="w-6 h-6 bg-editor-primary rounded-full flex items-center justify-center">
                <Bot className="h-3 w-3 text-white animate-pulse" />
              </div>
              <div className="flex-1">
                <Card className="bg-editor-bg">
                  <CardContent className="p-3">
                    <div className="text-sm text-editor-text-dim">
                      AI is thinking...
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-editor-border">
        <div className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask AI for help..."
            className="flex-1 bg-editor-bg border-editor-border text-sm focus:border-editor-primary"
            disabled={!isConnected}
          />
          <Button
            size="sm"
            onClick={sendMessage}
            disabled={!message.trim() || !isConnected}
            className="px-3 bg-editor-primary hover:bg-blue-600 text-white"
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
        <div className="text-xs text-editor-text-dim mt-2">
          {isConnected ? 'Press Enter to send' : 'Connecting...'}
        </div>
      </div>
    </div>
  );
}
