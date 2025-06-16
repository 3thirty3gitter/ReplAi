import { useState, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Type, 
  Square, 
  Image, 
  List, 
  Table, 
  FileText, 
  MousePointer,
  Palette,
  Settings,
  Eye,
  Code,
  Trash2,
  Copy,
  Move,
  Plus
} from "lucide-react";

interface ComponentConfig {
  id: string;
  type: string;
  name: string;
  icon: React.ComponentType;
  defaultProps: Record<string, any>;
  category: string;
}

const componentLibrary: ComponentConfig[] = [
  {
    id: 'text',
    type: 'text',
    name: 'Text',
    icon: Type,
    defaultProps: { content: 'Your text here', fontSize: '16px', color: '#000000' },
    category: 'Basic'
  },
  {
    id: 'button',
    type: 'button',
    name: 'Button',
    icon: Square,
    defaultProps: { text: 'Click me', variant: 'primary', size: 'medium' },
    category: 'Basic'
  },
  {
    id: 'image',
    type: 'image',
    name: 'Image',
    icon: Image,
    defaultProps: { src: '', alt: 'Image', width: '300px', height: '200px' },
    category: 'Media'
  },
  {
    id: 'container',
    type: 'container',
    name: 'Container',
    icon: Square,
    defaultProps: { padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' },
    category: 'Layout'
  },
  {
    id: 'form',
    type: 'form',
    name: 'Form',
    icon: FileText,
    defaultProps: { fields: [], submitText: 'Submit' },
    category: 'Input'
  },
  {
    id: 'table',
    type: 'table',
    name: 'Table',
    icon: Table,
    defaultProps: { headers: ['Column 1', 'Column 2'], rows: [] },
    category: 'Display'
  }
];

interface DroppedComponent {
  id: string;
  type: string;
  props: Record<string, any>;
  position: { x: number; y: number };
  children?: DroppedComponent[];
}

interface ComponentItemProps {
  component: ComponentConfig;
}

function ComponentItem({ component }: ComponentItemProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: { type: component.type, ...component.defaultProps },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const Icon = component.icon;

  return (
    <div
      ref={drag}
      className={`p-3 border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center space-x-2">
        <Icon className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium">{component.name}</span>
      </div>
    </div>
  );
}

interface CanvasProps {
  components: DroppedComponent[];
  onDrop: (item: any, position: { x: number; y: number }) => void;
  onSelect: (component: DroppedComponent) => void;
  selectedComponent?: DroppedComponent;
}

function Canvas({ components, onDrop, onSelect, selectedComponent }: CanvasProps) {
  const [{ isOver }, drop] = useDrop({
    accept: 'component',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      if (offset) {
        onDrop(item, { x: offset.x, y: offset.y });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const renderComponent = (component: DroppedComponent) => {
    const isSelected = selectedComponent?.id === component.id;
    const baseClasses = `absolute cursor-pointer ${isSelected ? 'ring-2 ring-blue-500' : ''}`;
    
    switch (component.type) {
      case 'text':
        return (
          <div
            key={component.id}
            className={baseClasses}
            style={{ 
              left: component.position.x, 
              top: component.position.y,
              fontSize: component.props.fontSize,
              color: component.props.color
            }}
            onClick={() => onSelect(component)}
          >
            {component.props.content}
          </div>
        );
      case 'button':
        return (
          <Button
            key={component.id}
            className={baseClasses}
            style={{ left: component.position.x, top: component.position.y }}
            onClick={() => onSelect(component)}
            variant={component.props.variant}
            size={component.props.size}
          >
            {component.props.text}
          </Button>
        );
      case 'container':
        return (
          <div
            key={component.id}
            className={baseClasses}
            style={{
              left: component.position.x,
              top: component.position.y,
              padding: component.props.padding,
              backgroundColor: component.props.backgroundColor,
              borderRadius: component.props.borderRadius,
              minWidth: '200px',
              minHeight: '100px',
              border: '1px dashed #ccc'
            }}
            onClick={() => onSelect(component)}
          >
            <div className="text-gray-500 text-sm">Container</div>
          </div>
        );
      case 'image':
        return (
          <img
            key={component.id}
            className={baseClasses}
            style={{ 
              left: component.position.x, 
              top: component.position.y,
              width: component.props.width,
              height: component.props.height
            }}
            src={component.props.src || 'https://via.placeholder.com/300x200'}
            alt={component.props.alt}
            onClick={() => onSelect(component)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={drop}
      className={`relative w-full h-full bg-white border-2 border-dashed ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      } min-h-[600px] overflow-auto`}
    >
      {components.map(renderComponent)}
      {components.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <MousePointer className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Drag components here to start building</p>
            <p className="text-sm">Choose from the component library on the left</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface PropertyPanelProps {
  component?: DroppedComponent;
  onUpdate: (id: string, props: Record<string, any>) => void;
}

function PropertyPanel({ component, onUpdate }: PropertyPanelProps) {
  const handlePropertyChange = (key: string, value: any) => {
    if (component) {
      onUpdate(component.id, { ...component.props, [key]: value });
    }
  };

  if (!component) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Settings className="h-8 w-8 mx-auto mb-2" />
        <p>Select a component to edit properties</p>
      </div>
    );
  }

  const renderPropertyEditor = () => {
    switch (component.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="content">Text Content</Label>
              <Input
                id="content"
                value={component.props.content}
                onChange={(e) => handlePropertyChange('content', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="fontSize">Font Size</Label>
              <Input
                id="fontSize"
                value={component.props.fontSize}
                onChange={(e) => handlePropertyChange('fontSize', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                type="color"
                value={component.props.color}
                onChange={(e) => handlePropertyChange('color', e.target.value)}
              />
            </div>
          </div>
        );
      case 'button':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="text">Button Text</Label>
              <Input
                id="text"
                value={component.props.text}
                onChange={(e) => handlePropertyChange('text', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="variant">Variant</Label>
              <select
                id="variant"
                className="w-full p-2 border rounded"
                value={component.props.variant}
                onChange={(e) => handlePropertyChange('variant', e.target.value)}
              >
                <option value="default">Default</option>
                <option value="destructive">Destructive</option>
                <option value="outline">Outline</option>
                <option value="secondary">Secondary</option>
                <option value="ghost">Ghost</option>
                <option value="link">Link</option>
              </select>
            </div>
          </div>
        );
      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="src">Image URL</Label>
              <Input
                id="src"
                value={component.props.src}
                onChange={(e) => handlePropertyChange('src', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="alt">Alt Text</Label>
              <Input
                id="alt"
                value={component.props.alt}
                onChange={(e) => handlePropertyChange('alt', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                value={component.props.width}
                onChange={(e) => handlePropertyChange('width', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                value={component.props.height}
                onChange={(e) => handlePropertyChange('height', e.target.value)}
              />
            </div>
          </div>
        );
      default:
        return <p className="text-gray-500">No properties available</p>;
    }
  };

  return (
    <div className="p-4">
      <h3 className="font-medium mb-4">Properties - {component.type}</h3>
      {renderPropertyEditor()}
    </div>
  );
}

interface VisualBuilderProps {
  projectId: number;
}

export function VisualBuilder({ projectId }: VisualBuilderProps) {
  const [components, setComponents] = useState<DroppedComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<DroppedComponent>();
  const [mode, setMode] = useState<'design' | 'preview'>('design');
  const [componentCounter, setComponentCounter] = useState(0);

  const handleDrop = useCallback((item: any, position: { x: number; y: number }) => {
    const newComponent: DroppedComponent = {
      id: `${item.type}_${componentCounter}`,
      type: item.type,
      props: { ...item },
      position,
    };
    setComponents(prev => [...prev, newComponent]);
    setComponentCounter(prev => prev + 1);
  }, [componentCounter]);

  const handleComponentSelect = useCallback((component: DroppedComponent) => {
    setSelectedComponent(component);
  }, []);

  const handlePropertyUpdate = useCallback((id: string, newProps: Record<string, any>) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, props: newProps } : comp
    ));
    if (selectedComponent?.id === id) {
      setSelectedComponent(prev => prev ? { ...prev, props: newProps } : undefined);
    }
  }, [selectedComponent]);

  const handleDeleteComponent = useCallback(() => {
    if (selectedComponent) {
      setComponents(prev => prev.filter(comp => comp.id !== selectedComponent.id));
      setSelectedComponent(undefined);
    }
  }, [selectedComponent]);

  const generateHTML = () => {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Page</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        .container { position: relative; min-height: 100vh; }
    </style>
</head>
<body>
    <div class="container">
`;

    components.forEach(component => {
      switch (component.type) {
        case 'text':
          html += `        <div style="position: absolute; left: ${component.position.x}px; top: ${component.position.y}px; font-size: ${component.props.fontSize}; color: ${component.props.color};">${component.props.content}</div>\n`;
          break;
        case 'button':
          html += `        <button style="position: absolute; left: ${component.position.x}px; top: ${component.position.y}px;">${component.props.text}</button>\n`;
          break;
        case 'image':
          html += `        <img src="${component.props.src}" alt="${component.props.alt}" style="position: absolute; left: ${component.position.x}px; top: ${component.position.y}px; width: ${component.props.width}; height: ${component.props.height};" />\n`;
          break;
      }
    });

    html += `    </div>
</body>
</html>`;

    return html;
  };

  const categorizedComponents = componentLibrary.reduce((acc, component) => {
    if (!acc[component.category]) {
      acc[component.category] = [];
    }
    acc[component.category].push(component);
    return acc;
  }, {} as Record<string, ComponentConfig[]>);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-gray-100">
        {/* Component Library */}
        <div className="w-64 bg-white border-r border-gray-300 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Components</h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4">
              {Object.entries(categorizedComponents).map(([category, items]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">{category}</h3>
                  <div className="space-y-2">
                    {items.map(component => (
                      <ComponentItem key={component.id} component={component} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-300 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold">Visual Builder</h1>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <Button
                  variant={mode === 'design' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('design')}
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Design
                </Button>
                <Button
                  variant={mode === 'preview' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('preview')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {selectedComponent && (
                <>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDeleteComponent}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                </>
              )}
              <Button variant="outline" size="sm">
                <Code className="h-4 w-4 mr-2" />
                Export HTML
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 p-4">
            {mode === 'design' ? (
              <Canvas
                components={components}
                onDrop={handleDrop}
                onSelect={handleComponentSelect}
                selectedComponent={selectedComponent}
              />
            ) : (
              <div className="w-full h-full bg-white border rounded-lg overflow-auto">
                <iframe
                  srcDoc={generateHTML()}
                  className="w-full h-full border-0"
                  title="Preview"
                />
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-80 bg-white border-l border-gray-300">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Properties</h2>
          </div>
          <PropertyPanel
            component={selectedComponent}
            onUpdate={handlePropertyUpdate}
          />
        </div>
      </div>
    </DndProvider>
  );
}