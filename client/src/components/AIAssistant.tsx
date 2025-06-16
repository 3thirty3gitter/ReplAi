import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Bot, 
  User, 
  Send, 
  X,
  MessageCircle,
  Sparkles,
  AlertCircle,
  Settings
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
}

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export function AIAssistant({ 
  projectId, 
  isOpen, 
  onClose,
  currentCode,
  currentLanguage 
}: AIAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest('POST', '/api/ai/chat', {
        message,
        code: currentCode,
        language: currentLanguage,
        projectId
      });
    },
    onSuccess: (data: any) => {
      const aiMessage: AIMessage = {
        role: 'assistant',
        content: data.message || 'I received your message but couldn\'t generate a response.',
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to get AI response';
      
      if (error.message?.includes('OpenAI API key is not configured')) {
        errorMessage = 'OpenAI API key is not configured. Please add your API key in Settings.';
      } else if (error.message?.includes('Invalid OpenAI API key')) {
        errorMessage = 'Invalid OpenAI API key. Please check your API key in Settings.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "AI Assistant Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(input.trim());
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 h-full bg-editor-surface border-r border-editor-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-editor-border flex items-center justify-between bg-editor-bg">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-editor-primary" />
          <h3 className="font-semibold text-editor-text">AI Assistant</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-editor-text-dim hover:text-editor-text"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-editor-text-dim mx-auto mb-4" />
              <p className="text-editor-text-dim">
                Hi! I'm your AI coding assistant. Ask me anything about your code or request help with programming tasks.
              </p>
              <Alert className="mt-4 border-editor-border bg-editor-bg">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-editor-text-dim">
                  Make sure to configure your OpenAI API key in Settings for AI features to work.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-editor-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[240px] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-editor-primary text-white'
                    : 'bg-editor-bg border border-editor-border text-editor-text'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-editor-text flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-editor-bg" />
                </div>
              )}
            </div>
          ))}

          {chatMutation.isPending && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-editor-primary flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-editor-bg border border-editor-border text-editor-text p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-editor-primary border-t-transparent rounded-full"></div>
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={scrollRef} />
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-editor-border bg-editor-bg">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your code..."
            className="flex-1 bg-editor-surface border-editor-border text-editor-text"
            disabled={chatMutation.isPending}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isPending}
            size="sm"
            className="bg-editor-primary text-white hover:bg-editor-primary/80"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}