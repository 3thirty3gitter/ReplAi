import { useState, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Zap, 
  Database, 
  Mail, 
  MessageSquare, 
  Calculator, 
  Calendar, 
  FileText, 
  Settings, 
  Plus, 
  Play, 
  Save, 
  Trash2,
  ArrowRight,
  Clock,
  Webhook,
  Send
} from "lucide-react";

interface WorkflowStep {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

interface WorkflowAction {
  id: string;
  name: string;
  type: string;
  icon: React.ComponentType;
  category: string;
  description: string;
  configFields: Array<{
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'number' | 'boolean';
    options?: string[];
    required?: boolean;
  }>;
}

const workflowActions: WorkflowAction[] = [
  {
    id: 'send_email',
    name: 'Send Email',
    type: 'email',
    icon: Mail,
    category: 'Communication',
    description: 'Send an email to specified recipients',
    configFields: [
      { key: 'to', label: 'To Email', type: 'text', required: true },
      { key: 'subject', label: 'Subject', type: 'text', required: true },
      { key: 'body', label: 'Message', type: 'textarea', required: true }
    ]
  },
  {
    id: 'save_to_database',
    name: 'Save to Database',
    type: 'database',
    icon: Database,
    category: 'Data',
    description: 'Save data to a database table',
    configFields: [
      { key: 'table', label: 'Table', type: 'select', options: [], required: true },
      { key: 'data', label: 'Data (JSON)', type: 'textarea', required: true }
    ]
  },
  {
    id: 'send_notification',
    name: 'Send Notification',
    type: 'notification',
    icon: MessageSquare,
    category: 'Communication',
    description: 'Send a push notification',
    configFields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'message', label: 'Message', type: 'text', required: true },
      { key: 'users', label: 'Target Users', type: 'select', options: ['all', 'specific'], required: true }
    ]
  },
  {
    id: 'calculate',
    name: 'Calculate',
    type: 'math',
    icon: Calculator,
    category: 'Logic',
    description: 'Perform mathematical calculations',
    configFields: [
      { key: 'expression', label: 'Expression', type: 'text', required: true },
      { key: 'variables', label: 'Variables (JSON)', type: 'textarea' }
    ]
  },
  {
    id: 'schedule_task',
    name: 'Schedule Task',
    type: 'schedule',
    icon: Clock,
    category: 'Automation',
    description: 'Schedule a task for later execution',
    configFields: [
      { key: 'delay', label: 'Delay (minutes)', type: 'number', required: true },
      { key: 'action', label: 'Action to Execute', type: 'select', options: [], required: true }
    ]
  },
  {
    id: 'webhook',
    name: 'Call Webhook',
    type: 'webhook',
    icon: Webhook,
    category: 'Integration',
    description: 'Make HTTP request to external service',
    configFields: [
      { key: 'url', label: 'URL', type: 'text', required: true },
      { key: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'], required: true },
      { key: 'headers', label: 'Headers (JSON)', type: 'textarea' },
      { key: 'body', label: 'Body (JSON)', type: 'textarea' }
    ]
  }
];

const triggers = [
  { id: 'button_click', name: 'Button Click', icon: Zap },
  { id: 'form_submit', name: 'Form Submit', icon: FileText },
  { id: 'database_change', name: 'Database Change', icon: Database },
  { id: 'schedule', name: 'Schedule', icon: Calendar },
  { id: 'webhook', name: 'Webhook', icon: Webhook }
];

interface ActionItemProps {
  action: WorkflowAction;
}

function ActionItem({ action }: ActionItemProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'action',
    item: { type: action.type, ...action },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const Icon = action.icon;

  return (
    <div
      ref={drag}
      className={`p-3 border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium">{action.name}</h4>
          <p className="text-xs text-gray-500 mt-1">{action.description}</p>
        </div>
      </div>
    </div>
  );
}

interface WorkflowCanvasProps {
  steps: WorkflowStep[];
  onDrop: (item: any, position: { x: number; y: number }) => void;
  onStepSelect: (step: WorkflowStep) => void;
  selectedStep?: WorkflowStep;
}

function WorkflowCanvas({ steps, onDrop, onStepSelect, selectedStep }: WorkflowCanvasProps) {
  const [{ isOver }, drop] = useDrop({
    accept: 'action',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      if (offset) {
        onDrop(item, { x: offset.x - 200, y: offset.y - 100 });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const renderStep = (step: WorkflowStep, index: number) => {
    const action = workflowActions.find(a => a.type === step.type);
    if (!action) return null;

    const Icon = action.icon;
    const isSelected = selectedStep?.id === step.id;
    const nextStep = steps[index + 1];

    return (
      <div key={step.id}>
        <div
          className={`absolute cursor-pointer ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
          style={{ left: step.position.x, top: step.position.y }}
          onClick={() => onStepSelect(step)}
        >
          <Card className="w-48">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Icon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">{action.name}</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {Object.keys(step.config).length} config(s)
              </div>
            </CardContent>
          </Card>
        </div>
        
        {nextStep && (
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: step.position.x + 192,
              top: step.position.y + 30,
              width: nextStep.position.x - step.position.x - 192,
              height: 2
            }}
          >
            <div className="w-full h-0.5 bg-gray-300 relative">
              <ArrowRight className="h-4 w-4 text-gray-400 absolute right-0 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={drop}
      className={`relative w-full h-full bg-gray-50 ${
        isOver ? 'bg-blue-50' : ''
      } min-h-[600px] overflow-auto`}
    >
      {steps.map(renderStep)}
      {steps.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Zap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Build your workflow</p>
            <p className="text-sm">Drag actions from the sidebar to create automation</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface StepConfigProps {
  step?: WorkflowStep;
  onUpdate: (id: string, config: Record<string, any>) => void;
  onDelete: (id: string) => void;
}

function StepConfig({ step, onUpdate, onDelete }: StepConfigProps) {
  if (!step) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Settings className="h-8 w-8 mx-auto mb-2" />
        <p>Select a step to configure</p>
      </div>
    );
  }

  const action = workflowActions.find(a => a.type === step.type);
  if (!action) return null;

  const handleConfigChange = (key: string, value: any) => {
    onUpdate(step.id, { ...step.config, [key]: value });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">{action.name} Configuration</h3>
        <Button variant="outline" size="sm" onClick={() => onDelete(step.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        {action.configFields.map(field => (
          <div key={field.key}>
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            {field.type === 'text' ? (
              <Input
                id={field.key}
                value={step.config[field.key] || ''}
                onChange={(e) => handleConfigChange(field.key, e.target.value)}
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            ) : field.type === 'textarea' ? (
              <Textarea
                id={field.key}
                value={step.config[field.key] || ''}
                onChange={(e) => handleConfigChange(field.key, e.target.value)}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                rows={3}
              />
            ) : field.type === 'select' ? (
              <Select
                value={step.config[field.key] || ''}
                onValueChange={(value) => handleConfigChange(field.key, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === 'number' ? (
              <Input
                id={field.key}
                type="number"
                value={step.config[field.key] || ''}
                onChange={(e) => handleConfigChange(field.key, parseInt(e.target.value))}
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

interface WorkflowBuilderProps {
  projectId: number;
}

export function WorkflowBuilder({ projectId }: WorkflowBuilderProps) {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [selectedStep, setSelectedStep] = useState<WorkflowStep>();
  const [stepCounter, setStepCounter] = useState(0);
  const [workflowName, setWorkflowName] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState('');

  const handleDrop = useCallback((item: any, position: { x: number; y: number }) => {
    const newStep: WorkflowStep = {
      id: `step_${stepCounter}`,
      type: item.type,
      name: item.name,
      config: {},
      position
    };
    setSteps(prev => [...prev, newStep]);
    setStepCounter(prev => prev + 1);
  }, [stepCounter]);

  const handleStepSelect = useCallback((step: WorkflowStep) => {
    setSelectedStep(step);
  }, []);

  const handleStepUpdate = useCallback((id: string, config: Record<string, any>) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, config } : step
    ));
    if (selectedStep?.id === id) {
      setSelectedStep(prev => prev ? { ...prev, config } : undefined);
    }
  }, [selectedStep]);

  const handleStepDelete = useCallback((id: string) => {
    setSteps(prev => prev.filter(step => step.id !== id));
    if (selectedStep?.id === id) {
      setSelectedStep(undefined);
    }
  }, [selectedStep]);

  const saveWorkflow = () => {
    // Implementation for saving workflow
    console.log('Saving workflow:', { name: workflowName, trigger: selectedTrigger, steps });
  };

  const testWorkflow = () => {
    // Implementation for testing workflow
    console.log('Testing workflow:', steps);
  };

  const categorizedActions = workflowActions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, WorkflowAction[]>);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-gray-100">
        {/* Actions Sidebar */}
        <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Workflow Actions</h2>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-4">
              {Object.entries(categorizedActions).map(([category, actions]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">{category}</h3>
                  <div className="space-y-2">
                    {actions.map(action => (
                      <ActionItem key={action.id} action={action} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-300 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Workflow name"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="w-48"
                />
                <Select value={selectedTrigger} onValueChange={setSelectedTrigger}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    {triggers.map(trigger => (
                      <SelectItem key={trigger.id} value={trigger.id}>
                        <div className="flex items-center space-x-2">
                          <trigger.icon className="h-4 w-4" />
                          <span>{trigger.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={testWorkflow}>
                <Play className="h-4 w-4 mr-2" />
                Test
              </Button>
              <Button size="sm" onClick={saveWorkflow}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 relative">
            <WorkflowCanvas
              steps={steps}
              onDrop={handleDrop}
              onStepSelect={handleStepSelect}
              selectedStep={selectedStep}
            />
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="w-80 bg-white border-l border-gray-300">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Step Configuration</h2>
          </div>
          <StepConfig
            step={selectedStep}
            onUpdate={handleStepUpdate}
            onDelete={handleStepDelete}
          />
        </div>
      </div>
    </DndProvider>
  );
}