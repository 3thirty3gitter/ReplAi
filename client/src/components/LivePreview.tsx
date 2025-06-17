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
      
      // Look for React App component
      let appFile = generatedFiles.find(f => 
        f.name === 'App.tsx' || 
        f.name === 'App.jsx' || 
        f.path?.includes('App.tsx') ||
        (f.content && f.content.includes('function App') && f.content.includes('export default App'))
      );
      
      if (appFile) {
        // Create a complete HTML page with the React app
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated App Preview</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
        * { box-sizing: border-box; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        ${appFile.content.replace('export default App', '').replace('export default function App', 'function App')}
        
        function AppWrapper() {
          return React.createElement(App);
        }
        
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(AppWrapper));
    </script>
</body>
</html>`;
        
        console.log('Generated React preview HTML');
        setPreviewContent(htmlContent);
        setIsPreviewReady(true);
      } else {
        // Fallback: look for any HTML content
        let htmlFile = generatedFiles.find(f => 
          f.language === 'html' || 
          f.name.endsWith('.html') ||
          (f.content && (
            f.content.includes('<!DOCTYPE html') || 
            f.content.includes('<html') ||
            f.content.includes('<body')
          ))
        );
        
        if (htmlFile) {
          console.log('Found HTML file for preview');
          setPreviewContent(htmlFile.content);
          setIsPreviewReady(true);
        } else {
          // Create a simple preview showing the generated structure
          const filesList = generatedFiles.map(f => `• ${f.name} (${f.language})`).join('\n');
          const placeholderHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Generated</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 p-8">
    <div class="max-w-2xl mx-auto">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <div class="text-center mb-6">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h1 class="text-2xl font-bold text-gray-900 mb-2">Application Successfully Generated!</h1>
                <p class="text-gray-600">Your full-stack application has been created with the following files:</p>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-6">
                <h3 class="font-semibold text-gray-900 mb-3">Generated Files:</h3>
                <div class="space-y-2 font-mono text-sm">
                    ${generatedFiles.map(f => `
                        <div class="flex items-center space-x-2">
                            <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span class="text-gray-700">${f.name}</span>
                            <span class="text-gray-500">(${f.language})</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="mt-6 text-center">
                <p class="text-sm text-gray-600">
                    Switch to the <strong>Code</strong> tab to view and edit your generated files.
                </p>
            </div>
        </div>
    </div>
</body>
</html>`;
          
          console.log('Created placeholder preview for generated files');
          setPreviewContent(placeholderHTML);
          setIsPreviewReady(true);
        }
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