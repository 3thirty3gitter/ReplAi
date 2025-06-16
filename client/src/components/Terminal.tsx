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
  AlertCircle
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'execution_result') {
        const result: ExecutionResult = data.result;
        setIsExecuting(false);
        
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
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
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
          </TabsList>
        </Tabs>
        
        <div className="flex items-center space-x-2">
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
      </Tabs>
    </div>
  );
}
