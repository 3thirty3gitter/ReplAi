import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Code2, 
  Play, 
  Database, 
  Rocket, 
  Bot,
  FolderTree,
  Terminal as TerminalIcon,
  ChevronLeft
} from "lucide-react";
import { CodeEditor } from "@/components/CodeEditor";
import { AIAssistant } from "@/components/AIAssistant";
import { DatabaseBuilder } from "@/components/DatabaseBuilder";
import { DeploymentCenter } from "@/components/DeploymentCenter";
import { Terminal } from "@/components/Terminal";
import { LivePreview } from "@/components/LivePreview";
import { FileExplorer } from "@/components/FileExplorer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Project, File } from "@shared/schema";

export default function IDE() {
  const [currentProjectId, setCurrentProjectId] = useState(1);
  const [activeTab, setActiveTab] = useState<string>('preview');
  const [openFiles, setOpenFiles] = useState<File[]>([]);
  const [activeFileId, setActiveFileId] = useState<number | undefined>();
  const [showFileTree, setShowFileTree] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Map<number, string>>(new Map());
  
  // AI Assistant states
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

  const activeFile = openFiles.find(file => file.id === activeFileId);
  const currentCode = activeFile?.content || '';
  const currentLanguage = activeFile?.language || 'javascript';

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
        description: "Your changes have been saved successfully.",
      });
    }
  });

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
    if (activeFileId === fileId) {
      const remainingFiles = openFiles.filter(file => file.id !== fileId);
      setActiveFileId(remainingFiles.length > 0 ? remainingFiles[0].id : undefined);
    }
  };

  const handleSaveFile = () => {
    if (activeFileId && pendingChanges.has(activeFileId)) {
      const content = pendingChanges.get(activeFileId)!;
      saveFileMutation.mutate({ fileId: activeFileId, content });
    }
  };

  const handleAppBuilding = (isBuilding: boolean, steps: string[], currentStep: number) => {
    setIsAppBuilding(isBuilding);
    setBuildingSteps(steps);
    setCurrentBuildStep(currentStep);
  };

  const handleAppGenerated = (files: Array<{name: string, content: string, language: string, path: string}>) => {
    setGeneratedAppFiles(files);
  };

  return (
    <div className="flex h-screen bg-editor-bg text-editor-text">
      {/* Left Side - AI Assistant (Fixed Width) */}
      <div className="w-96 border-r border-editor-border bg-editor-surface flex flex-col">
        {/* AI Assistant Header */}
        <div className="h-12 bg-editor-surface border-b border-editor-border flex items-center px-4 justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-editor-primary" />
            <h2 className="text-sm font-semibold text-editor-text">AI Assistant</h2>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-editor-text-dim">Ready</span>
          </div>
        </div>
        
        {/* AI Assistant Content */}
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
        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          {/* Navigation Tabs - Full Width with Status */}
          <div className="bg-editor-surface border-b border-editor-border">
            <div className="flex items-center justify-between px-4 py-2">
              <TabsList className="bg-transparent border-none h-auto p-0 space-x-1 justify-start">
                <TabsTrigger 
                  value="preview" 
                  className="text-sm px-4 py-2 bg-transparent data-[state=active]:bg-editor-bg data-[state=active]:text-editor-primary border-b-2 border-transparent data-[state=active]:border-editor-primary rounded-none"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Live Preview
                </TabsTrigger>
                <TabsTrigger 
                  value="code" 
                  className="text-sm px-4 py-2 bg-transparent data-[state=active]:bg-editor-bg data-[state=active]:text-editor-primary border-b-2 border-transparent data-[state=active]:border-editor-primary rounded-none"
                >
                  <Code2 className="h-4 w-4 mr-2" />
                  Code
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
              </TabsList>
              
              {/* Project Selector and Tools */}
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
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFileTree(!showFileTree)}
                    className="h-8 px-3 text-xs bg-editor-bg border-editor-border hover:bg-editor-primary hover:text-white"
                  >
                    <FolderTree className="h-3 w-3 mr-1" />
                    Files
                  </Button>
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
            </div>
            
            {/* Status Info Bar */}
            <div className="px-4 py-1 bg-editor-bg border-t border-editor-border flex items-center justify-between text-xs">
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

          {/* Tab Content */}
          <TabsContent value="preview" className="flex-1 m-0">
            <LivePreview
              projectId={currentProjectId}
              isBuilding={isAppBuilding}
              buildingSteps={buildingSteps}
              currentStep={currentBuildStep}
              generatedFiles={generatedAppFiles}
            />
          </TabsContent>

          <TabsContent value="code" className="flex-1 m-0">
            <div className="flex flex-1 overflow-hidden">
              {showFileTree && (
                <div className="w-64 border-r border-editor-border bg-editor-surface">
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between p-3 border-b border-editor-border">
                      <h3 className="text-sm font-medium text-editor-text">Explorer</h3>
                      <button
                        onClick={() => setShowFileTree(false)}
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
                </div>
              )}
              
              <div className="flex-1 flex flex-col">
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

          <TabsContent value="database" className="flex-1 m-0">
            <DatabaseBuilder projectId={currentProjectId} />
          </TabsContent>

          <TabsContent value="deploy" className="flex-1 m-0">
            <DeploymentCenter projectId={currentProjectId} />
          </TabsContent>
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
            isMaximized={false}
            onToggleMaximize={() => {}}
          />
        </div>
      )}


    </div>
  );
}