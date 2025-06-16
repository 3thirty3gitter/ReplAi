import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Toolbar } from "@/components/Toolbar";
import { FileExplorer } from "@/components/FileExplorer";
import { CodeEditor } from "@/components/CodeEditor";
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
  ChevronRight
} from "lucide-react";
import type { Project, File } from "@shared/schema";

export default function IDE() {
  const [currentProjectId, setCurrentProjectId] = useState<number>(1); // Default project
  const [openFiles, setOpenFiles] = useState<File[]>([]);
  const [activeFileId, setActiveFileId] = useState<number | undefined>();
  const [isExplorerCollapsed, setIsExplorerCollapsed] = useState(false);
  const [isTerminalMaximized, setIsTerminalMaximized] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Map<number, string>>(new Map());
  const [activeTab, setActiveTab] = useState<string>('code');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [aiMessages, setAIMessages] = useState<Array<{role: 'user' | 'assistant', content: string, timestamp: number, actions?: Array<{type: 'generate-project' | 'generate-file', label: string, data: any}>}>>([]);
  const [aiInput, setAIInput] = useState('');
  const [isAppBuilding, setIsAppBuilding] = useState(false);
  const [buildingSteps, setBuildingSteps] = useState<string[]>([]);
  const [currentBuildStep, setCurrentBuildStep] = useState(0);
  const [generatedAppFiles, setGeneratedAppFiles] = useState<Array<{name: string, content: string, language: string, path: string}>>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current project
  const { data: project } = useQuery<Project>({
    queryKey: ['/api/projects', currentProjectId],
    enabled: !!currentProjectId
  });

  // Get files for current project
  const { data: allFiles = [] } = useQuery<File[]>({
    queryKey: ['/api/projects', currentProjectId, 'files'],
    enabled: !!currentProjectId
  });

  // Save file mutation
  const saveFileMutation = useMutation({
    mutationFn: async ({ fileId, content }: { fileId: number; content: string }) => {
      return apiRequest('PUT', `/api/files/${fileId}`, { content });
    },
    onSuccess: (_, { fileId }) => {
      // Remove from pending changes
      setPendingChanges(prev => {
        const newMap = new Map(prev);
        newMap.delete(fileId);
        return newMap;
      });
      
      // Update file in openFiles
      setOpenFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, content: pendingChanges.get(fileId) || file.content }
          : file
      ));
      
      queryClient.invalidateQueries({ queryKey: ['/api/projects', currentProjectId, 'files'] });
      toast({
        title: "File saved",
        description: "Your changes have been saved successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Save failed",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  });

  // Auto-open first file
  useEffect(() => {
    if (allFiles.length > 0 && openFiles.length === 0) {
      const firstFile = allFiles.find(f => !f.isDirectory);
      if (firstFile) {
        handleFileSelect(firstFile);
      }
    }
  }, [allFiles]);

  const handleFileSelect = (file: File) => {
    // Add to open files if not already open
    if (!openFiles.find(f => f.id === file.id)) {
      setOpenFiles(prev => [...prev, file]);
    }
    setActiveFileId(file.id);
  };

  const handleFileClose = (fileId: number) => {
    setOpenFiles(prev => prev.filter(f => f.id !== fileId));
    
    // If closing active file, switch to another open file
    if (activeFileId === fileId) {
      const remainingFiles = openFiles.filter(f => f.id !== fileId);
      setActiveFileId(remainingFiles.length > 0 ? remainingFiles[0].id : undefined);
    }
    
    // Remove from pending changes
    setPendingChanges(prev => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
  };

  const handleFileChange = (fileId: number, content: string) => {
    // Update pending changes
    setPendingChanges(prev => new Map(prev).set(fileId, content));
    
    // Update open file content immediately for UI responsiveness
    setOpenFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, content } : file
    ));
  };

  const handleSaveFile = () => {
    if (activeFileId && pendingChanges.has(activeFileId)) {
      const content = pendingChanges.get(activeFileId)!;
      saveFileMutation.mutate({ fileId: activeFileId, content });
    }
  };

  const handleSaveAll = () => {
    pendingChanges.forEach((content, fileId) => {
      saveFileMutation.mutate({ fileId, content });
    });
  };

  const handleRunCode = () => {
    const activeFile = openFiles.find(f => f.id === activeFileId);
    if (!activeFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to run",
        variant: "destructive"
      });
      return;
    }

    const content = pendingChanges.get(activeFile.id) || activeFile.content;
    
    // Use the terminal's run function
    if ((window as any).terminalRunCode) {
      (window as any).terminalRunCode(content, activeFile.language);
    }
  };

  const handleNewFile = () => {
    // For now, just show a toast - could implement a modal for file creation
    toast({
      title: "Create new file",
      description: "Use the file explorer to create new files"
    });
  };

  const handleOpenFile = () => {
    // For now, just show a toast - could implement file browser
    toast({
      title: "Open file",
      description: "Use the file explorer to open files"
    });
  };

  const activeFile = openFiles.find(f => f.id === activeFileId);
  const currentCode = activeFile ? (pendingChanges.get(activeFile.id) || activeFile.content) : '';
  const currentLanguage = activeFile?.language || 'javascript';

  // AI Chat handler
  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || isAILoading) return;

    const userMessage = {
      role: 'user' as const,
      content: aiInput,
      timestamp: Date.now()
    };

    setAIMessages(prev => [...prev, userMessage]);
    setAIInput('');
    setIsAILoading(true);

    try {
      const response = await apiRequest('POST', '/api/ai/chat', {
        message: aiInput,
        code: currentCode,
        language: currentLanguage,
        projectId: currentProjectId
      });

      const data = await response.json();

      // Analyze the response to determine if it's a code generation request
      const isCodeRequest = /create|build|generate|make|develop|write.*app|write.*component|write.*function|todo|calculator|game|website|landing|portfolio/i.test(aiInput);
      const actions = isCodeRequest ? [
        {
          type: 'generate-project' as const,
          label: 'Generate Complete Project',
          data: { prompt: aiInput, projectType: 'web', framework: 'react' }
        },
        {
          type: 'generate-file' as const,
          label: 'Generate Single File',
          data: { prompt: aiInput, language: 'javascript' }
        }
      ] : undefined;

      const aiResponse = {
        role: 'assistant' as const,
        content: data.message || 'I received your message but had trouble generating a response.',
        timestamp: Date.now(),
        actions
      };
      setAIMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorMessage = {
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please make sure the OpenAI API key is configured.',
        timestamp: Date.now()
      };
      setAIMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAILoading(false);
    }
  };

  // AI Action Handlers
  const handleGenerateProject = async (actionData: any) => {
    setIsGenerating(true);
    try {
      const response = await apiRequest('POST', '/api/ai/generate-project', {
        prompt: actionData.prompt,
        projectId: currentProjectId,
        projectType: actionData.projectType,
        framework: actionData.framework
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the file explorer to show new files
        queryClient.invalidateQueries({ queryKey: ['/api/projects', currentProjectId, 'files'] });
        
        const successMessage = {
          role: 'assistant' as const,
          content: `✅ Successfully generated ${data.filesCreated} files!\n\n**Files created:**\n${data.files.map((f: any) => `• ${f.name} - ${f.description}`).join('\n')}\n\n**Instructions:**\n${data.instructions}\n\n**Next steps:**\n${data.nextSteps.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}`,
          timestamp: Date.now()
        };
        setAIMessages(prev => [...prev, successMessage]);

        toast({
          title: "Project Generated",
          description: `Created ${data.filesCreated} files successfully`,
        });
      } else {
        throw new Error('Generation failed');
      }
    } catch (error) {
      const errorMessage = {
        role: 'assistant' as const,
        content: `❌ Failed to generate project: ${(error as Error).message}`,
        timestamp: Date.now()
      };
      setAIMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Generation Failed",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFile = async (actionData: any) => {
    setIsGenerating(true);
    try {
      const response = await apiRequest('POST', '/api/ai/generate-file', {
        prompt: actionData.prompt,
        projectId: currentProjectId,
        language: actionData.language
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the file explorer to show new file
        queryClient.invalidateQueries({ queryKey: ['/api/projects', currentProjectId, 'files'] });
        
        const successMessage = {
          role: 'assistant' as const,
          content: `✅ Successfully generated file: **${data.file.name}**\n\nPath: ${data.file.path}\nDescription: ${data.file.description}\n\nThe file has been added to your project and is ready to use!`,
          timestamp: Date.now()
        };
        setAIMessages(prev => [...prev, successMessage]);

        toast({
          title: "File Generated",
          description: `Created ${data.file.name} successfully`,
        });
      } else {
        throw new Error('File generation failed');
      }
    } catch (error) {
      const errorMessage = {
        role: 'assistant' as const,
        content: `❌ Failed to generate file: ${(error as Error).message}`,
        timestamp: Date.now()
      };
      setAIMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Generation Failed",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            if (e.shiftKey) {
              handleSaveAll();
            } else {
              handleSaveFile();
            }
            break;
          case 'r':
            e.preventDefault();
            handleRunCode();
            break;
          case '`':
            e.preventDefault();
            setIsTerminalMaximized(prev => !prev);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFileId, pendingChanges]);

  if (showTemplates) {
    return (
      <ProjectTemplates
        onSelectTemplate={(template) => {
          setShowTemplates(false);
          toast({
            title: "Template selected",
            description: `Creating project from ${template.name} template`
          });
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-editor-bg text-editor-text">
      <Toolbar
        onNewFile={handleNewFile}
        onOpenFile={handleOpenFile}
        onSaveFile={handleSaveFile}
        onRunCode={handleRunCode}
        onToggleAI={() => setIsExplorerCollapsed(!isExplorerCollapsed)}
        isAIOpen={!isExplorerCollapsed}
      />
      
      {/* Enhanced Navigation Tabs */}
      <div className="bg-editor-surface border-b border-editor-border">
        <div className="flex items-center justify-between px-4 py-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="bg-transparent border-none h-auto p-0 space-x-1">

              <TabsTrigger 
                value="code" 
                className="text-sm px-4 py-2 bg-transparent data-[state=active]:bg-editor-bg data-[state=active]:text-editor-primary"
              >
                <Code2 className="h-4 w-4 mr-2" />
                Code Editor
              </TabsTrigger>
              <TabsTrigger 
                value="visual" 
                className="text-sm px-4 py-2 bg-transparent data-[state=active]:bg-editor-bg data-[state=active]:text-editor-primary"
              >
                <Layout className="h-4 w-4 mr-2" />
                Visual Builder
              </TabsTrigger>
              <TabsTrigger 
                value="database" 
                className="text-sm px-4 py-2 bg-transparent data-[state=active]:bg-editor-bg data-[state=active]:text-editor-primary"
              >
                <Database className="h-4 w-4 mr-2" />
                Database
              </TabsTrigger>
              <TabsTrigger 
                value="workflows" 
                className="text-sm px-4 py-2 bg-transparent data-[state=active]:bg-editor-bg data-[state=active]:text-editor-primary"
              >
                <Zap className="h-4 w-4 mr-2" />
                Workflows
              </TabsTrigger>
              <TabsTrigger 
                value="deploy" 
                className="text-sm px-4 py-2 bg-transparent data-[state=active]:bg-editor-bg data-[state=active]:text-editor-primary"
              >
                <Rocket className="h-4 w-4 mr-2" />
                Deploy
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="text-sm px-4 py-2 bg-transparent data-[state=active]:bg-editor-bg data-[state=active]:text-editor-primary"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(true)}
              className="text-xs bg-editor-surface hover:bg-editor-bg border-editor-border"
            >
              <FileText className="h-3 w-3 mr-1" />
              Templates
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHelp(true)}
              className="text-xs bg-editor-surface hover:bg-editor-bg border-editor-border"
            >
              <HelpCircle className="h-3 w-3 mr-1" />
              Help
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <Tabs value={activeTab} className="flex flex-1">
          {/* Code Editor Tab */}
          <TabsContent value="code" className="flex flex-1 m-0">
            <div className="flex flex-1 overflow-hidden">
              {/* Collapsible File Explorer */}
              <div className={`transition-all duration-300 ${isExplorerCollapsed ? 'w-0' : 'w-64'} border-r border-editor-border bg-editor-surface`}>
                {!isExplorerCollapsed && (
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between p-3 border-b border-editor-border">
                      <h3 className="text-sm font-medium text-editor-text">Explorer</h3>
                      <button
                        onClick={() => setIsExplorerCollapsed(true)}
                        className="p-1 hover:bg-editor-bg rounded text-editor-text-dim hover:text-editor-text"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <FileExplorer
                        projectId={currentProjectId}
                        onFileSelect={handleFileSelect}
                        selectedFileId={activeFileId}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Collapsed Explorer Toggle */}
              {isExplorerCollapsed && (
                <div className="w-8 bg-editor-surface border-r border-editor-border flex flex-col items-center py-2">
                  <button
                    onClick={() => setIsExplorerCollapsed(false)}
                    className="p-1 hover:bg-editor-bg rounded text-editor-text-dim hover:text-editor-text mb-2"
                    title="Show Explorer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1 hover:bg-editor-bg rounded text-editor-text-dim hover:text-editor-text"
                    title="Files"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              {/* Code Editor with AI Assistant */}
              <div className="flex flex-1 overflow-hidden">
                <CodeEditor
                  openFiles={openFiles}
                  activeFileId={activeFileId}
                  onFileChange={handleFileChange}
                  onFileClose={handleFileClose}
                  onFileSelect={setActiveFileId}
                />
                
                {/* Permanent AI Assistant Panel */}
                <div className="w-80 border-l border-editor-border bg-editor-surface flex flex-col">
                  <div className="p-3 border-b border-editor-border">
                    <h3 className="text-sm font-medium text-editor-text flex items-center">
                      <Bot className="h-4 w-4 mr-2 text-editor-primary" />
                      AI Assistant
                    </h3>
                    <p className="text-xs text-editor-text-dim">Build anything with AI</p>
                  </div>
                  
                  <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-3" id="chat-messages">
                      <div className="space-y-3">
                        {aiMessages.length === 0 ? (
                          <div className="text-center">
                            <Bot className="h-10 w-10 mx-auto mb-3 text-editor-primary" />
                            <p className="text-xs text-editor-text font-medium mb-2">AI Assistant - Build Anything</p>
                            <p className="text-xs text-editor-text-dim mb-3">Tell me what you want to build!</p>
                            
                            <div className="space-y-2 mb-3">
                              <Button 
                                onClick={() => setShowQuickStart(true)}
                                size="sm"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-xs"
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Browse Templates
                              </Button>
                              
                              <div className="space-y-1">
                                <p className="text-xs text-editor-text-dim font-medium">Try these:</p>
                                {[
                                  "Build a todo app",
                                  "Create a calculator", 
                                  "Make a weather app",
                                  "Build a portfolio"
                                ].map((example, index) => (
                                  <button
                                    key={index}
                                    onClick={() => setAIInput(example)}
                                    className="block w-full text-left px-2 py-1 text-xs bg-editor-bg hover:bg-editor-primary/10 border border-editor-border hover:border-editor-primary/30 rounded transition-colors"
                                  >
                                    <span className="text-editor-primary">"{example}"</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            <div className="text-xs text-editor-text-dim space-y-1">
                              <p>• Complete project generation</p>
                              <p>• Individual file creation</p>
                              <p>• Code help & debugging</p>
                            </div>
                          </div>
                        ) : (
                          aiMessages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[90%] rounded-lg p-2 ${
                                msg.role === 'user' 
                                  ? 'bg-editor-primary text-white' 
                                  : 'bg-editor-bg border border-editor-border text-editor-text'
                              }`}>
                                <p className="text-xs whitespace-pre-wrap">{msg.content}</p>
                                
                                {/* Action Buttons for Code Generation */}
                                {msg.actions && msg.actions.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-editor-border space-y-1">
                                    <p className="text-xs text-editor-text-dim">I can help you build this:</p>
                                    {msg.actions.map((action, actionIndex) => (
                                      <button
                                        key={actionIndex}
                                        onClick={() => {
                                          if (action.type === 'generate-project') {
                                            handleGenerateProject(action.data);
                                          } else if (action.type === 'generate-file') {
                                            handleGenerateFile(action.data);
                                          }
                                        }}
                                        disabled={isGenerating}
                                        className="w-full text-left px-2 py-1 text-xs bg-editor-primary/10 hover:bg-editor-primary/20 border border-editor-primary/30 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                                      >
                                        <span className="text-editor-primary font-medium">{action.label}</span>
                                        {isGenerating ? (
                                          <div className="w-2 h-2 border border-editor-primary border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                          <Play className="h-2 w-2 text-editor-primary" />
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                )}
                                
                                <p className="text-xs opacity-70 mt-1">
                                  {new Date(msg.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                        {isAILoading && (
                          <div className="flex justify-start">
                            <div className="bg-editor-bg border border-editor-border rounded-lg p-2">
                              <div className="flex items-center space-x-1">
                                <div className="w-1 h-1 bg-editor-primary rounded-full animate-bounce"></div>
                                <div className="w-1 h-1 bg-editor-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-1 h-1 bg-editor-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-3 border-t border-editor-border">
                      <form id="ai-form" onSubmit={handleAISubmit} className="flex space-x-2">
                        <input
                          type="text"
                          value={aiInput}
                          onChange={(e) => setAIInput(e.target.value)}
                          placeholder="Ask AI to build something..."
                          className="flex-1 px-2 py-1 text-xs bg-editor-bg border border-editor-border rounded text-editor-text placeholder:text-editor-text-dim focus:outline-none focus:ring-1 focus:ring-editor-primary"
                          disabled={isAILoading || isGenerating}
                        />
                        <button 
                          type="submit"
                          disabled={isAILoading || isGenerating || !aiInput.trim()}
                          className="px-2 py-1 bg-editor-primary text-white rounded hover:bg-editor-primary/80 transition-colors disabled:opacity-50"
                        >
                          <Send className="h-3 w-3" />
                        </button>
                      </form>
                      <p className="text-xs text-editor-text-dim mt-1">Press Enter to send</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Terminal
                projectId={currentProjectId}
                isMaximized={isTerminalMaximized}
                onToggleMaximize={() => setIsTerminalMaximized(!isTerminalMaximized)}
              />
            </div>
          </TabsContent>
          
          {/* Visual Builder Tab */}
          <TabsContent value="visual" className="flex flex-1 m-0">
            <div className="w-full h-full">
              <VisualBuilder projectId={currentProjectId} />
            </div>
          </TabsContent>
          
          {/* Database Builder Tab */}
          <TabsContent value="database" className="flex flex-1 m-0">
            <DatabaseBuilder projectId={currentProjectId} />
          </TabsContent>
          
          {/* Workflow Builder Tab */}
          <TabsContent value="workflows" className="flex flex-1 m-0">
            <WorkflowBuilder projectId={currentProjectId} />
          </TabsContent>
          
          {/* Deployment Center Tab */}
          <TabsContent value="deploy" className="flex flex-1 m-0">
            <DeploymentCenter projectId={currentProjectId} />
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="flex flex-1 m-0">
            <SettingsPage />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Enhanced Status Bar */}
      <div className="h-6 bg-editor-surface border-t border-editor-border flex items-center justify-between px-4 text-xs">
        <div className="flex items-center space-x-4">
          <span className="text-editor-text-dim">
            Project: {project?.name || 'Loading...'}
          </span>
          <span className="text-editor-text-dim">
            Mode: {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-editor-text-dim">Connected</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {activeTab === 'code' && activeFile && (
            <>
              <span className="text-editor-text-dim">
                {activeFile.language?.toUpperCase() || 'PLAINTEXT'}
              </span>
              <span className="text-editor-text-dim">{activeFile.name}</span>
            </>
          )}
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-editor-primary rounded-full"></div>
            <span className="text-editor-primary">AI Ready</span>
          </div>
        </div>
      </div>

      {showQuickStart && (
        <QuickStartTemplates
          onClose={() => setShowQuickStart(false)}
          onSelectTemplate={(prompt) => {
            setAIInput(prompt);
            setShowQuickStart(false);
            // Auto-submit the prompt to generate the project
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
