import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Eye, 
  Code2, 
  Smartphone, 
  Monitor, 
  Tablet,
  Play,
  Pause,
  RotateCcw,
  ExternalLink,
  Maximize2
} from "lucide-react";

interface LivePreviewProps {
  projectId: number;
  isBuilding: boolean;
  buildingSteps: string[];
  currentStep: number;
  generatedFiles: Array<{
    name: string;
    content: string;
    language: string;
    path: string;
  }>;
}

export function LivePreview({ 
  projectId, 
  isBuilding, 
  buildingSteps, 
  currentStep, 
  generatedFiles 
}: LivePreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewContent, setPreviewContent] = useState<string>('');
  const [isPreviewReady, setIsPreviewReady] = useState(false);

  // Generate live preview content from files
  useEffect(() => {
    if (generatedFiles && Array.isArray(generatedFiles) && generatedFiles.length > 0) {
      console.log('Generated files for preview:', generatedFiles);
      
      // Look for HTML content in any file
      let htmlFile = generatedFiles.find(f => f.language === 'html' || f.name.endsWith('.html'));
      
      // If no HTML file, check if any file contains HTML content (common for single-file apps)
      if (!htmlFile) {
        htmlFile = generatedFiles.find(f => 
          f && f.content && (
            f.content.includes('<!DOCTYPE html') || 
            f.content.includes('<html') ||
            f.content.includes('<body')
          )
        );
      }
      
      const cssFile = generatedFiles.find(f => f.language === 'css' || f.name.endsWith('.css'));
      const jsFile = generatedFiles.find(f => (f.language === 'javascript' || f.name.endsWith('.js')) && f !== htmlFile);

      if (htmlFile) {
        let content = htmlFile.content;
        
        // Inject CSS if available and not already included
        if (cssFile && !content.includes(cssFile.content)) {
          content = content.replace(
            '</head>', 
            `<style>${cssFile.content}</style></head>`
          );
        }
        
        // Inject JavaScript if available and not already included
        if (jsFile && !content.includes(jsFile.content)) {
          content = content.replace(
            '</body>', 
            `<script>${jsFile.content}</script></body>`
          );
        }
        
        console.log('Setting preview content:', content.substring(0, 200) + '...');
        setPreviewContent(content);
        setIsPreviewReady(true);
      } else {
        console.log('No HTML content found in generated files');
      }
    }
  }, [generatedFiles]);

  const getViewportSize = () => {
    switch (viewMode) {
      case 'mobile': return { width: '375px', height: '667px' };
      case 'tablet': return { width: '768px', height: '1024px' };
      default: return { width: '100%', height: '100%' };
    }
  };

  const buildingProgress = buildingSteps.length > 0 ? (currentStep / buildingSteps.length) * 100 : 0;

  return (
    <div className="h-full flex flex-col bg-editor-bg relative">

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        {isBuilding ? (
          <div className="text-center space-y-4">
            <div className="animate-spin h-12 w-12 border-4 border-editor-primary border-t-transparent rounded-full mx-auto" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-editor-text">Building Your App</p>
              <p className="text-sm text-editor-text-dim">
                {buildingSteps[currentStep] || 'Starting construction...'}
              </p>
            </div>
          </div>
        ) : !isPreviewReady ? (
          <div className="text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-editor-surface border-2 border-editor-border flex items-center justify-center mx-auto">
              <Eye className="h-6 w-6 text-editor-text-dim" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-editor-text">Ready to Build</p>
              <p className="text-sm text-editor-text-dim">
                Ask the AI assistant to create an app and watch it come to life here
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div 
              className="bg-white border border-editor-border rounded-lg shadow-lg overflow-hidden"
              style={getViewportSize()}
            >
              <iframe
                srcDoc={previewContent}
                className="w-full h-full border-none"
                title="App Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {isPreviewReady && !isBuilding && (
        <div className="p-4 border-t border-editor-border bg-editor-surface">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-green-600 border-green-600">
                App Ready
              </Badge>
              <span className="text-sm text-editor-text-dim">
                {generatedFiles.length} files generated
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
              <Button variant="outline" size="sm">
                <Maximize2 className="h-4 w-4 mr-2" />
                Fullscreen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}