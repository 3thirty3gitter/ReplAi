import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trash2, 
  Maximize2, 
  Minimize2, 
  Terminal as TerminalIcon,
  FileText,
  AlertCircle,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  Code2
} from "lucide-react";

interface TerminalProps {
  projectId: number;
  isMaximized: boolean;
  onToggleMaximize: () => void;
}

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success';
  content: string;
  timestamp: number;
}

interface ExecutionResult {
  output: string;
  error: string;
  status: 'completed' | 'error' | 'timeout';
  executionTime: number;
}

export function Terminal({ projectId, isMaximized, onToggleMaximize }: TerminalProps) {
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    {
      id: '1',
      type: 'success',
      content: 'Welcome to CodeIDE Terminal',
      timestamp: Date.now()
    },
    {
      id: '2',
      type: 'output',
      content: 'Type commands or run code to see output here',
      timestamp: Date.now()
    }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);
  const [outputs, setOutputs] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [codeInput, setCodeInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const supportedLanguages = [
    { id: 'javascript', name: 'JavaScript', example: 'console.log("Hello World!");' },
    { id: 'python', name: 'Python', example: 'print("Hello World!")' },
    { id: 'typescript', name: 'TypeScript', example: 'console.log("Hello World!");' },
    { id: 'html', name: 'HTML', example: '<h1>Hello World!</h1>' },
    { id: 'css', name: 'CSS', example: 'body { color: blue; }' }
  ];

  // Initialize WebSocket connection
  useEffect(() => {
    // Skip WebSocket connection for now - use direct API calls instead
    return () => {
      // Cleanup function
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const addTerminalLine = (type: TerminalLine['type'], content: string) => {
    const newLine: TerminalLine = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: Date.now()
    };
    setTerminalLines(prev => [...prev, newLine]);
  };

  const executeCommand = () => {
    if (!currentCommand.trim() || isExecuting) return;

    addTerminalLine('input', `$ ${currentCommand}`);
    
    // Handle built-in commands
    if (currentCommand.trim() === 'clear') {
      setTerminalLines([]);
      setCurrentCommand('');
      return;
    }

    if (currentCommand.trim() === 'help') {
      addTerminalLine('output', 'Available commands:');
      addTerminalLine('output', '  clear  - Clear terminal');
      addTerminalLine('output', '  help   - Show this help');
      addTerminalLine('output', '  node   - Run JavaScript code');
      addTerminalLine('output', '  python - Run Python code');
      setCurrentCommand('');
      return;
    }

    // For now, just echo the command
    addTerminalLine('output', `Command not recognized: ${currentCommand}`);
    addTerminalLine('output', 'Use the Run button in the toolbar to execute code');
    setCurrentCommand('');
  };

  const runCode = (code: string, language: string) => {
    if (!wsRef.current || isExecuting) return;

    setIsExecuting(true);
    addTerminalLine('input', `$ Running ${language} code...`);

    wsRef.current.send(JSON.stringify({
      type: 'execute_code',
      id: Date.now().toString(),
      projectId,
      code,
      language
    }));
  };

  const executeCode = async (code: string, language: string) => {
    if (!code.trim()) return;

    addTerminalLine('input', `Running ${language} code...`);
    setIsExecuting(true);

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, projectId })
      });

      const result: ExecutionResult = await response.json();
      
      if (result.output) {
        addTerminalLine('output', result.output);
        setOutputs(prev => [...prev, result.output]);
      }
      
      if (result.error) {
        addTerminalLine('error', result.error);
        setProblems(prev => [...prev, result.error]);
      }

      if (result.status === 'completed' && !result.error) {
        addTerminalLine('success', `✓ Executed successfully in ${result.executionTime}ms`);
      }
    } catch (error) {
      addTerminalLine('error', `Error: ${(error as Error).message}`);
    }

    setIsExecuting(false);
  };

  const clearTerminal = () => {
    setTerminalLines([]);
    setOutputs([]);
    setProblems([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand();
    }
  };

  const getLineIcon = (type: TerminalLine['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'success':
        return <div className="h-3 w-3 rounded-full bg-green-500" />;
      case 'input':
        return <TerminalIcon className="h-3 w-3 text-blue-500" />;
      default:
        return <div className="h-3 w-3" />;
    }
  };

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-400';
      case 'success':
        return 'text-green-400';
      case 'input':
        return 'text-blue-400';
      default:
        return 'text-editor-text';
    }
  };

  // Expose runCode method to parent components
  useEffect(() => {
    (window as any).terminalRunCode = runCode;
  }, []);

  return (
    <div className={`bg-editor-bg border-t border-editor-border flex flex-col ${
      isMaximized ? 'h-screen' : 'h-48'
    }`}>
      <div className="flex items-center justify-between px-4 py-2 bg-editor-surface border-b border-editor-border">
        <Tabs defaultValue="terminal" className="flex-1">
          <TabsList className="bg-transparent border-none h-auto p-0 space-x-4">
            <TabsTrigger 
              value="terminal" 
              className="text-sm font-medium text-editor-primary border-b-2 border-editor-primary pb-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-editor-primary"
            >
              Terminal
            </TabsTrigger>
            <TabsTrigger 
              value="output" 
              className="text-sm text-editor-text-dim hover:text-editor-text bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-editor-text"
            >
              Output ({outputs.length})
            </TabsTrigger>
            <TabsTrigger 
              value="problems" 
              className="text-sm text-editor-text-dim hover:text-editor-text bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-editor-text"
            >
              Problems ({problems.length})
            </TabsTrigger>
            <TabsTrigger 
              value="codeRunner" 
              className="text-sm text-editor-text-dim hover:text-editor-text bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-editor-text"
            >
              Code Runner
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center space-x-2">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="text-xs bg-editor-surface border border-editor-border rounded px-2 py-1 text-editor-text"
          >
            {supportedLanguages.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-editor-text-dim hover:text-editor-text"
            onClick={clearTerminal}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-editor-text-dim hover:text-editor-text"
            onClick={onToggleMaximize}
          >
            {isMaximized ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="terminal" className="flex-1 flex flex-col">
        <TabsContent value="terminal" className="flex-1 flex flex-col m-0">
          <ScrollArea className="flex-1 font-mono text-sm" ref={scrollAreaRef}>
            <div className="p-4 space-y-1">
              {terminalLines.map(line => (
                <div key={line.id} className={`flex items-start space-x-2 ${getLineColor(line.type)}`}>
                  <div className="mt-1 flex-shrink-0">
                    {getLineIcon(line.type)}
                  </div>
                  <div className="flex-1 whitespace-pre-wrap break-words">
                    {line.content}
                  </div>
                </div>
              ))}
              
              {isExecuting && (
                <div className="flex items-center space-x-2 text-editor-text-dim">
                  <div className="animate-spin h-3 w-3 border border-editor-primary border-t-transparent rounded-full" />
                  <span>Executing...</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <span className="text-green-400">$</span>
                <Input
                  value={currentCommand}
                  onChange={(e) => setCurrentCommand(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a command..."
                  className="bg-transparent border-none outline-none flex-1 text-editor-text font-mono text-sm p-0 focus:ring-0"
                  disabled={isExecuting}
                />
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="output" className="flex-1 m-0">
          <ScrollArea className="h-full font-mono text-sm">
            <div className="p-4">
              {outputs.length === 0 ? (
                <div className="text-editor-text-dim text-center py-8">
                  <FileText className="h-8 w-8 mx-auto mb-2" />
                  <p>No output yet</p>
                  <p className="text-xs mt-1">Run some code to see output here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {outputs.map((output, index) => (
                    <div key={index} className="text-editor-text whitespace-pre-wrap">
                      {output}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="problems" className="flex-1 m-0">
          <ScrollArea className="h-full font-mono text-sm">
            <div className="p-4">
              {problems.length === 0 ? (
                <div className="text-editor-text-dim text-center py-8">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No problems found</p>
                  <p className="text-xs mt-1">Errors and warnings will appear here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {problems.map((problem, index) => (
                    <div key={index} className="text-red-400 whitespace-pre-wrap">
                      {problem}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="codeRunner" className="flex-1 m-0 flex flex-col">
          <div className="p-4 space-y-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code2 className="h-4 w-4 text-editor-primary" />
                <span className="text-sm font-medium text-editor-text">Code Runner</span>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedLanguage}
                  onChange={(e) => {
                    setSelectedLanguage(e.target.value);
                    const lang = supportedLanguages.find(l => l.id === e.target.value);
                    if (lang) setCodeInput(lang.example);
                  }}
                  className="text-xs bg-editor-surface border border-editor-border rounded px-2 py-1 text-editor-text"
                >
                  {supportedLanguages.map(lang => (
                    <option key={lang.id} value={lang.id}>{lang.name}</option>
                  ))}
                </select>
                <Button
                  onClick={() => executeCode(codeInput, selectedLanguage)}
                  disabled={isExecuting || !codeInput.trim()}
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  {isExecuting ? (
                    <>
                      <Clock className="h-3 w-3 animate-spin" />
                      <span>Running...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" />
                      <span>Run</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder={`Enter ${selectedLanguage} code here...`}
              className="flex-1 bg-editor-surface border border-editor-border rounded p-3 text-editor-text font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-editor-primary"
              style={{ minHeight: '200px' }}
            />

            <div className="text-xs text-editor-text-dim">
              Supports: JavaScript, Python, TypeScript, HTML, CSS
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
