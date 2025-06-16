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
  onAppBuilding?: (isBuilding: boolean, steps: string[], currentStep: number) => void;
  onAppGenerated?: (files: Array<{name: string, content: string, language: string, path: string}>) => void;
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
    "Creating HTML foundation...",
    "Adding CSS styling...",
    "Implementing JavaScript functionality...",
    "Adding interactive features...",
    "Optimizing performance...",
    "Final touches and testing..."
  ];

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      console.log('Sending AI request:', { message, code: currentCode, language: currentLanguage, projectId });
      
      // Check if this is an app building request
      const isAppRequest = message.toLowerCase().includes('build') || 
                          message.toLowerCase().includes('create') || 
                          message.toLowerCase().includes('make') ||
                          message.toLowerCase().includes('app') ||
                          message.toLowerCase().includes('website') ||
                          message.toLowerCase().includes('page');

      if (isAppRequest) {
        setIsGenerating(true);
        onAppBuilding?.(true, buildingSteps, 0);

        // Simulate building progress with visual feedback
        for (let i = 0; i < buildingSteps.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 800));
          onAppBuilding?.(true, buildingSteps, i);
        }

        try {
          // Generate the actual app
          const response = await apiRequest('POST', '/api/ai/generate-project', {
            prompt: message,
            projectId,
            projectType: 'web',
            framework: 'vanilla',
            includeTests: false
          });

          const data = await response.json();
          console.log('App generation response:', data);
          
          setIsGenerating(false);
          onAppBuilding?.(false, [], 0);
          
          if (data.success && data.filesCreated > 0) {
            // Fetch the actual file contents for preview
            try {
              const filesResponse = await apiRequest('GET', `/api/projects/${projectId}/files`);
              const allFiles = await filesResponse.json();
              console.log('All files after generation:', allFiles.length);
              
              // Get the most recently created file (should be our generated app)
              const newestFile = allFiles[allFiles.length - 1];
              
              if (newestFile && newestFile.content) {
                const previewFiles = [{
                  name: newestFile.name,
                  content: newestFile.content,
                  language: newestFile.language,
                  path: newestFile.path
                }];
                
                console.log('Setting preview content:', newestFile.content.substring(0, 200));
                onAppGenerated?.(previewFiles);
              } else {
                console.error('No valid file content found for preview');
              }
            } catch (fileError) {
              console.error('Error fetching generated files:', fileError);
            }
          } else {
            console.error('App generation failed or no files created:', data);
          }

          return {
            message: `🎉 Your app is ready! I've built a fully functional ${data.files?.length || 0}-file application based on your request. Check out the live preview to see it in action.`,
            isAppGenerated: true
          };
        } catch (error) {
          setIsGenerating(false);
          onAppBuilding?.(false, [], 0);
          throw error;
        }
      } else {
        // Regular chat response
        try {
          const response = await apiRequest('POST', '/api/ai/chat', {
            message,
            code: currentCode,
            language: currentLanguage,
            projectId
          });
          
          const data = await response.json();
          return data;
        } catch (error) {
          console.error('Error in mutation function:', error);
          throw error;
        }
      }
    },
    onSuccess: (data: any) => {
      console.log('AI Response received:', JSON.stringify(data, null, 2));
      console.log('Data type:', typeof data);
      console.log('Data keys:', data ? Object.keys(data) : 'No keys');
      
      let responseContent = '';
      
      try {
        // Direct check for message field first - this is what the backend returns
        if (data && data.message) {
          responseContent = data.message;
          console.log('Successfully extracted message:', responseContent.substring(0, 100) + '...');
        } else {
          console.error('No message field found in response:', data);
          responseContent = 'I received your message but the response format was unexpected. Please try again.';
        }
      } catch (error) {
        console.error('Error processing response:', error);
        responseContent = 'Sorry, I encountered an issue processing your request. Please try again.';
      }
      
      console.log('Final response content:', responseContent);
      
      const aiMessage: AIMessage = {
        role: 'assistant',
        content: responseContent,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    },
    onError: (error: any) => {
      console.error('AI request error:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Failed to get AI response';
      
      if (error.message?.includes('PERPLEXITY_API_KEY')) {
        errorMessage = 'Perplexity API key is not configured. Please add your API key in Settings.';
      } else if (error.message?.includes('Invalid Perplexity API key')) {
        errorMessage = 'Invalid Perplexity API key. Please check your API key in Settings.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      const aiMessage: AIMessage = {
        role: 'assistant',
        content: errorMessage,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMessage]);

      toast({
        title: "AI Assistant Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const handleSend = () => {
    console.log('handleSend called with input:', input);
    console.log('Mutation pending:', chatMutation.isPending);
    
    if (!input.trim() || chatMutation.isPending) {
      console.log('Early return from handleSend');
      return;
    }

    const userMessage: AIMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };
    
    console.log('Adding user message:', userMessage);
    setMessages(prev => [...prev, userMessage]);
    
    console.log('Triggering mutation with:', input.trim());
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
                  Make sure to configure your Perplexity API key in Settings for AI features to work.
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