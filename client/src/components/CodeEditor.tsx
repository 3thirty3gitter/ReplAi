import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Lightbulb } from "lucide-react";
import type { File } from "@shared/schema";

interface CodeEditorProps {
  openFiles: File[];
  activeFileId?: number;
  onFileChange: (fileId: number, content: string) => void;
  onFileClose: (fileId: number) => void;
  onFileSelect: (fileId: number) => void;
}

interface AISuggestion {
  id: string;
  title: string;
  description: string;
  confidence: number;
}

export function CodeEditor({
  openFiles,
  activeFileId,
  onFileChange,
  onFileClose,
  onFileSelect
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const activeFile = openFiles.find(file => file.id === activeFileId);

  useEffect(() => {
    if (!editorRef.current) return;

    // Load Monaco Editor
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js';
    script.onload = () => {
      (window as any).require.config({ 
        paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' }
      });
      
      (window as any).require(['vs/editor/editor.main'], () => {
        if (monacoRef.current) {
          monacoRef.current.dispose();
        }

        monacoRef.current = (window as any).monaco.editor.create(editorRef.current, {
          value: activeFile?.content || '// Welcome to CodeIDE\n// Start typing to begin...',
          language: activeFile?.language || 'javascript',
          theme: 'vs-dark',
          fontSize: 14,
          fontFamily: 'Fira Code, Monaco, Consolas, monospace',
          minimap: { enabled: true },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          contextmenu: true,
          quickSuggestions: true,
          suggestOnTriggerCharacters: true
        });

        // Listen for content changes
        monacoRef.current.onDidChangeModelContent(() => {
          if (activeFileId) {
            const content = monacoRef.current.getValue();
            onFileChange(activeFileId, content);
          }
        });

        // Simulate AI suggestions based on context
        monacoRef.current.onDidChangeCursorPosition(() => {
          const content = monacoRef.current.getValue();
          if (content.length > 10 && Math.random() < 0.1) { // 10% chance to show suggestions
            setAiSuggestions([
              {
                id: '1',
                title: 'Add error handling',
                description: 'Consider adding try-catch blocks for better error handling',
                confidence: 0.8
              },
              {
                id: '2',
                title: 'Optimize performance',
                description: 'This function could be optimized for better performance',
                confidence: 0.6
              }
            ]);
            setShowSuggestions(true);
          }
        });
      });
    };

    document.head.appendChild(script);

    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose();
      }
    };
  }, []);

  // Update editor content when active file changes
  useEffect(() => {
    if (monacoRef.current && activeFile) {
      const currentContent = monacoRef.current.getValue();
      if (currentContent !== activeFile.content) {
        monacoRef.current.setValue(activeFile.content || '');
      }
      
      // Update language
      const model = monacoRef.current.getModel();
      if (model) {
        (window as any).monaco.editor.setModelLanguage(model, activeFile.language || 'javascript');
      }
    }
  }, [activeFile]);

  const getFileIcon = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const iconClass = "h-3 w-3";
    
    switch (ext) {
      case 'js':
      case 'jsx':
        return <div className={`${iconClass} bg-yellow-400 rounded`} />;
      case 'ts':
      case 'tsx':
        return <div className={`${iconClass} bg-blue-400 rounded`} />;
      case 'py':
        return <div className={`${iconClass} bg-blue-400 rounded`} />;
      case 'html':
        return <div className={`${iconClass} bg-orange-500 rounded`} />;
      case 'css':
        return <div className={`${iconClass} bg-blue-500 rounded`} />;
      default:
        return <div className={`${iconClass} bg-gray-400 rounded`} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Editor Tabs */}
      <div className="bg-editor-surface border-b border-editor-border flex items-center overflow-x-auto">
        {openFiles.map(file => (
          <div
            key={file.id}
            className={`flex items-center px-4 py-2 border-r border-editor-border text-sm cursor-pointer hover:bg-editor-bg ${
              activeFileId === file.id ? 'bg-editor-bg' : ''
            }`}
            onClick={() => onFileSelect(file.id)}
          >
            {getFileIcon(file)}
            <span className="ml-2">{file.name}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-4 w-4 p-0 hover:text-editor-error"
              onClick={(e) => {
                e.stopPropagation();
                onFileClose(file.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 relative">
        <div ref={editorRef} className="w-full h-full" />
        
        {/* AI Suggestions Overlay */}
        {showSuggestions && aiSuggestions.length > 0 && (
          <Card className="absolute top-4 right-4 w-80 bg-editor-surface border-editor-border shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4 text-editor-primary" />
                  <span className="text-sm font-medium">AI Suggestions</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 text-editor-text-dim hover:text-editor-text"
                  onClick={() => setShowSuggestions(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-xs text-editor-text-dim mb-2">
                Based on your code context:
              </div>
              <div className="space-y-2">
                {aiSuggestions.map(suggestion => (
                  <div
                    key={suggestion.id}
                    className="p-2 bg-editor-bg rounded text-sm cursor-pointer hover:bg-opacity-80 transition-colors"
                    onClick={() => {
                      // Handle suggestion click
                      setShowSuggestions(false);
                    }}
                  >
                    <div className="font-medium">{suggestion.title}</div>
                    <div className="text-xs text-editor-text-dim mt-1">
                      {suggestion.description}
                    </div>
                    <div className="text-xs text-editor-primary mt-1">
                      Confidence: {Math.round(suggestion.confidence * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
