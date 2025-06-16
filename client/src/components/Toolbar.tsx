import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  FileText, 
  FolderOpen, 
  Save, 
  Bot,
  Code
} from "lucide-react";

interface ToolbarProps {
  onNewFile: () => void;
  onOpenFile: () => void;
  onSaveFile: () => void;
  onRunCode: () => void;
  onToggleAI: () => void;
  isAIOpen: boolean;
}

export function Toolbar({ 
  onNewFile, 
  onOpenFile, 
  onSaveFile, 
  onRunCode, 
  onToggleAI, 
  isAIOpen 
}: ToolbarProps) {
  return (
    <div className="h-10 bg-editor-surface border-b border-editor-border flex items-center px-4 justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Code className="h-4 w-4 text-editor-primary" />
          <span className="font-semibold text-sm">CodeIDE</span>
        </div>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewFile}
            className="h-8 px-2 text-xs hover:bg-editor-bg"
          >
            <FileText className="h-3 w-3 mr-1" />
            New
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenFile}
            className="h-8 px-2 text-xs hover:bg-editor-bg"
          >
            <FolderOpen className="h-3 w-3 mr-1" />
            Open
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSaveFile}
            className="h-8 px-2 text-xs hover:bg-editor-bg"
          >
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          onClick={onRunCode}
          className="h-8 px-3 text-xs bg-editor-primary hover:bg-blue-600 text-white"
        >
          <Play className="h-3 w-3 mr-1" />
          Run
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleAI}
          className={`h-8 px-2 text-xs hover:bg-editor-bg ${isAIOpen ? 'bg-editor-bg' : ''}`}
        >
          <Bot className="h-3 w-3 mr-1" />
          AI Assistant
        </Button>
      </div>
    </div>
  );
}
