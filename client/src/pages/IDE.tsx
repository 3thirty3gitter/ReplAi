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
  Bot
} from "lucide-react";
import type { Project, File } from "@shared/schema";

export default function IDE() {
  const [currentProjectId, setCurrentProjectId] = useState<number>(1); // Default project
  const [openFiles, setOpenFiles] = useState<File[]>([]);
  const [activeFileId, setActiveFileId] = useState<number | undefined>();
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isTerminalMaximized, setIsTerminalMaximized] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Map<number, string>>(new Map());
  const [activeTab, setActiveTab] = useState<string>('code');
  const [showTemplates, setShowTemplates] = useState(false);
  
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
        onToggleAI={() => setIsAIOpen(!isAIOpen)}
        isAIOpen={isAIOpen}
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
                value="ai" 
                className="text-sm px-4 py-2 bg-transparent data-[state=active]:bg-editor-bg data-[state=active]:text-editor-primary"
              >
                <Bot className="h-4 w-4 mr-2" />
                AI Assistant
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
            <FileExplorer
              projectId={currentProjectId}
              onFileSelect={handleFileSelect}
              selectedFileId={activeFileId}
            />
            
            <div className="flex-1 flex flex-col">
              <div className="flex flex-1 overflow-hidden">
                <CodeEditor
                  openFiles={openFiles}
                  activeFileId={activeFileId}
                  onFileChange={handleFileChange}
                  onFileClose={handleFileClose}
                  onFileSelect={setActiveFileId}
                />
                
                <AIAssistant
                  projectId={currentProjectId}
                  isOpen={isAIOpen}
                  onClose={() => setIsAIOpen(false)}
                  currentCode={currentCode}
                  currentLanguage={currentLanguage}
                />
              </div>
              
              <Terminal
                projectId={currentProjectId}
                isMaximized={isTerminalMaximized}
                onToggleMaximize={() => setIsTerminalMaximized(!isTerminalMaximized)}
              />
            </div>
          </TabsContent>
          
          {/* AI Assistant Tab */}
          <TabsContent value="ai" className="flex flex-1 m-0">
            <div className="flex-1 flex">
              <AIAssistant
                projectId={currentProjectId}
                isOpen={true}
                onClose={() => setActiveTab('code')}
                currentCode={currentCode}
                currentLanguage={currentLanguage}
              />
            </div>
          </TabsContent>
          
          {/* Visual Builder Tab */}
          <TabsContent value="visual" className="flex flex-1 m-0">
            <VisualBuilder projectId={currentProjectId} />
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
    </div>
  );
}
