import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Settings as SettingsIcon, Key, Save, Eye, EyeOff } from "lucide-react";

export default function Settings() {
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: { openaiApiKey: string }) => {
      return await apiRequest('POST', '/api/settings', settings);
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your API key has been updated successfully."
      });
      setOpenaiApiKey(''); // Clear the input for security
    },
    onError: (error) => {
      toast({
        title: "Error saving settings",
        description: error.message || "Failed to save settings",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    if (!openaiApiKey.trim()) {
      toast({
        title: "API Key required",
        description: "Please enter your OpenAI API key",
        variant: "destructive"
      });
      return;
    }

    if (!openaiApiKey.startsWith('sk-')) {
      toast({
        title: "Invalid API Key",
        description: "OpenAI API keys should start with 'sk-'",
        variant: "destructive"
      });
      return;
    }

    saveSettingsMutation.mutate({ openaiApiKey });
  };

  return (
    <div className="h-full bg-editor-bg overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-editor-text flex items-center">
            <SettingsIcon className="h-6 w-6 mr-2 text-editor-primary" />
            Settings
          </h1>
          <p className="text-editor-text-dim mt-1">Configure your IDE preferences and API keys</p>
        </div>

        <div className="space-y-6">
          {/* API Configuration */}
          <Card className="bg-editor-surface border-editor-border">
            <CardHeader>
              <CardTitle className="text-editor-text flex items-center">
                <Key className="h-5 w-5 mr-2 text-editor-primary" />
                API Configuration
              </CardTitle>
              <CardDescription className="text-editor-text-dim">
                Configure your API keys for AI features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openai-key" className="text-editor-text">
                  OpenAI API Key
                </Label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Input
                      id="openai-key"
                      type={showApiKey ? "text" : "password"}
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="bg-editor-bg border-editor-border text-editor-text pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-editor-text-dim hover:text-editor-text"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button
                    onClick={handleSave}
                    disabled={saveSettingsMutation.isPending}
                    className="bg-editor-primary text-white hover:bg-editor-primary/80"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saveSettingsMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
                <p className="text-xs text-editor-text-dim">
                  Get your API key from{' '}
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-editor-primary hover:underline"
                  >
                    OpenAI Platform
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Features Info */}
          <Card className="bg-editor-surface border-editor-border">
            <CardHeader>
              <CardTitle className="text-editor-text">AI Features</CardTitle>
              <CardDescription className="text-editor-text-dim">
                What you can do with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-editor-text">Code Generation</h4>
                  <p className="text-sm text-editor-text-dim">
                    Generate code snippets and complete functions based on your descriptions
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-editor-text">Code Explanation</h4>
                  <p className="text-sm text-editor-text-dim">
                    Get detailed explanations of complex code sections
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-editor-text">Debugging Help</h4>
                  <p className="text-sm text-editor-text-dim">
                    Find and fix bugs with AI-powered debugging assistance
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-editor-text">Chat Assistant</h4>
                  <p className="text-sm text-editor-text-dim">
                    Interactive chat for coding questions and project guidance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}