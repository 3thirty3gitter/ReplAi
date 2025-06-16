import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Toolbar } from "@/components/Toolbar";
import { FileExplorer } from "@/components/FileExplorer";
import { CodeEditor } from "@/components/CodeEditor";
import { AIAssistant } from "@/components/AIAssistant";
import { Terminal } from "@/components/Terminal";
import { LivePreview } from "@/components/LivePreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  ChevronLeft,
  ChevronRight,
  FolderTree,
  Terminal as TerminalIcon
} from "lucide-react";
import type { Project, File } from "@shared/schema";

export default function IDE() {
  const [currentProjectId, setCurrentProjectId] = useState<number>(1);
  const [openFiles, setOpenFiles] = useState<File[]>([]);
  const [activeFileId, setActiveFileId] = useState<number | undefined>();
  const [isExplorerCollapsed, setIsExplorerCollapsed] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Map<number, string>>(new Map());
  const [activeTab, setActiveTab] = useState<string>('preview');
  const [showTerminal, setShowTerminal] = useState(false);
  const [isAppBuilding, setIsAppBuilding] = useState(false);
  const [buildingSteps, setBuildingSteps] = useState<string[]>([]);
  const [currentBuildStep, setCurrentBuildStep] = useState(0);
  const [generatedAppFiles, setGeneratedAppFiles] = useState<Array<{name: string, content: string, language: string, path: string}>>([]);
  
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
      setPendingChanges(prev => {
        const newMap = new Map(prev);
        newMap.delete(fileId);
        return newMap;
      });
      
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
        title: "Error saving file",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  });

  const activeFile = openFiles.find(file => file.id === activeFileId);
  const currentCode = activeFileId ? (pendingChanges.get(activeFileId) || activeFile?.content || '') : '';
  const currentLanguage = activeFile?.language || 'javascript';

  const handleFileSelect = (file: File) => {
    if (!openFiles.find(f => f.id === file.id)) {
      setOpenFiles(prev => [...prev, file]);
    }
    setActiveFileId(file.id);
  };

  const handleFileChange = (fileId: number, content: string) => {
    setPendingChanges(prev => new Map(prev).set(fileId, content));
  };

  const handleFileClose = (fileId: number) => {
    setOpenFiles(prev => prev.filter(file => file.id !== fileId));
    setPendingChanges(prev => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
    
    if (activeFileId === fileId) {
      const remainingFiles = openFiles.filter(file => file.id !== fileId);
      setActiveFileId(remainingFiles.length > 0 ? remainingFiles[remainingFiles.length - 1].id : undefined);
    }
  };

  const handleAppBuilding = (isBuilding: boolean, steps: string[], currentStep: number) => {
    setIsAppBuilding(isBuilding);
    setBuildingSteps(steps);
    setCurrentBuildStep(currentStep);
  };

  const handleAppGenerated = (files: Array<{name: string, content: string, language: string, path: string}>) => {
    setGeneratedAppFiles(files);
    setActiveTab('preview');
    queryClient.invalidateQueries({ queryKey: ['/api/projects', currentProjectId, 'files'] });
  };

  // Auto-save functionality
  useEffect(() => {
    const interval = setInterval(() => {
      pendingChanges.forEach((content, fileId) => {
        if (content !== openFiles.find(f => f.id === fileId)?.content) {
          saveFileMutation.mutate({ fileId, content });
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [pendingChanges, openFiles, saveFileMutation]);

  return (
    <div className="flex h-screen bg-editor-bg text-editor-text">
      {/* Left Side - AI Assistant (Fixed Width) */}
      <div className="w-96 border-r border-editor-border bg-editor-surface flex flex-col">
        <div className="h-12 bg-editor-surface border-b border-editor-border flex items-center px-4 justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h2 className="text-sm font-semibold text-editor-text">AI Assistant</h2>
          </div>
        </div>
        
        <div className="flex-1">
          <AIAssistant
            projectId={currentProjectId}
            isOpen={true}
            onClose={() => {}}
            currentCode={currentCode}
            currentLanguage={currentLanguage}
            onAppBuilding={handleAppBuilding}
            onAppGenerated={handleAppGenerated}
          />
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

        {/* Navigation Tabs */}
        <div className="bg-editor-surface border-b border-editor-border">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="bg-transparent border-none h-auto p-0 space-x-1 justify-start">
              <TabsTrigger 
                value="preview" 
                className="data-[state=active]:bg-editor-bg data-[state=active]:text-editor-text data-[state=active]:border-b-2 data-[state=active]:border-editor-primary rounded-none px-4 py-2 text-sm"
              >
                Live Preview
              </TabsTrigger>
              <TabsTrigger 
                value="code" 
                className="data-[state=active]:bg-editor-bg data-[state=active]:text-editor-text data-[state=active]:border-b-2 data-[state=active]:border-editor-primary rounded-none px-4 py-2 text-sm"
              >
                Code Editor
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            {/* Live Preview Tab */}
            <TabsContent value="preview" className="flex-1 m-0">
              <LivePreview
                projectId={currentProjectId}
                isBuilding={isAppBuilding}
                buildingSteps={buildingSteps}
                currentStep={currentBuildStep}
                generatedFiles={generatedAppFiles}
              />
            </TabsContent>

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
                  </div>
                )}
                
                {/* Code Editor */}
                <div className="flex flex-1 overflow-hidden">
                  <CodeEditor
                    openFiles={openFiles}
                    activeFileId={activeFileId}
                    onFileChange={handleFileChange}
                    onFileClose={handleFileClose}
                    onFileSelect={setActiveFileId}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Terminal */}
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
              isMaximized={false}
              onToggleMaximize={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
}