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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Plus,
  Layout,
  Grid,
  Columns,
  Camera,
  CheckSquare,
  Calendar,
  Mail,
  Phone,
  Link,
  Play
} from "lucide-react";

interface ComponentConfig {
  id: string;
  type: string;
  name: string;
  icon: React.ComponentType;
  defaultProps: Record<string, any>;
  category: string;
  description: string;
}

interface DroppedComponent {
  id: string;
  type: string;
  props: Record<string, any>;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface VisualBuilderProps {
  projectId: number;
}

const componentLibrary: ComponentConfig[] = [
  // Basic Components
  {
    id: 'heading',
    type: 'heading',
    name: 'Heading',
    icon: Type,
    defaultProps: { text: 'Your Heading', level: 'h1', color: '#000000', align: 'left' },
    category: 'Basic',
    description: 'Add titles and headings to your page'
  },
  {
    id: 'text',
    type: 'text',
    name: 'Text',
    icon: FileText,
    defaultProps: { text: 'Your text content goes here...', fontSize: '16px', color: '#333333' },
    category: 'Basic',
    description: 'Add paragraphs and text content'
  },
  {
    id: 'button',
    type: 'button',
    name: 'Button',
    icon: Square,
    defaultProps: { text: 'Click Me', variant: 'primary', size: 'medium', action: 'alert' },
    category: 'Basic',
    description: 'Interactive buttons for user actions'
  },
  {
    id: 'image',
    type: 'image',
    name: 'Image',
    icon: Image,
    defaultProps: { src: '', alt: 'Image description', width: '300px', height: '200px' },
    category: 'Basic',
    description: 'Display images and graphics'
  },
  
  // Input Components
  {
    id: 'input',
    type: 'input',
    name: 'Text Input',
    icon: Type,
    defaultProps: { placeholder: 'Enter text...', label: 'Input Label', required: false },
    category: 'Forms',
    description: 'Text input field for user data'
  },
  {
    id: 'textarea',
    type: 'textarea',
    name: 'Text Area',
    icon: FileText,
    defaultProps: { placeholder: 'Enter longer text...', label: 'Textarea Label', rows: 4 },
    category: 'Forms',
    description: 'Multi-line text input'
  },
  {
    id: 'select',
    type: 'select',
    name: 'Dropdown',
    icon: List,
    defaultProps: { label: 'Select Option', options: ['Option 1', 'Option 2', 'Option 3'] },
    category: 'Forms',
    description: 'Dropdown selection menu'
  },
  {
    id: 'checkbox',
    type: 'checkbox',
    name: 'Checkbox',
    icon: CheckSquare,
    defaultProps: { label: 'Check this option', checked: false },
    category: 'Forms',
    description: 'Checkbox for yes/no options'
  },
  
  // Layout Components
  {
    id: 'container',
    type: 'container',
    name: 'Container',
    icon: Layout,
    defaultProps: { padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' },
    category: 'Layout',
    description: 'Container to group other components'
  },
  {
    id: 'grid',
    type: 'grid',
    name: 'Grid Layout',
    icon: Grid,
    defaultProps: { columns: 2, gap: '20px', padding: '20px' },
    category: 'Layout',
    description: 'Grid layout for organizing content'
  },
  {
    id: 'columns',
    type: 'columns',
    name: 'Columns',
    icon: Columns,
    defaultProps: { columns: 3, gap: '20px' },
    category: 'Layout',
    description: 'Column layout for side-by-side content'
  },
  
  // Advanced Components
  {
    id: 'table',
    type: 'table',
    name: 'Data Table',
    icon: Table,
    defaultProps: { 
      headers: ['Name', 'Email', 'Status'], 
      rows: [['John Doe', 'john@example.com', 'Active']]
    },
    category: 'Advanced',
    description: 'Display data in table format'
  },
  {
    id: 'video',
    type: 'video',
    name: 'Video Player',
    icon: Play,
    defaultProps: { src: '', controls: true, width: '100%', height: '300px' },
    category: 'Advanced',
    description: 'Embed video content'
  }
];

const categories = Array.from(new Set(componentLibrary.map(comp => comp.category)));

function ComponentLibraryItem({ component }: { component: ComponentConfig }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: { type: component.type, defaultProps: component.defaultProps },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const IconComponent = component.icon;

  return (
    <div
      ref={drag}
      className={`p-3 border border-editor-border rounded-lg cursor-move hover:bg-editor-bg transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center space-x-2">
        <IconComponent className="h-4 w-4 text-editor-primary" />
        <div className="flex-1">
          <p className="text-sm font-medium text-editor-text">{component.name}</p>
          <p className="text-xs text-editor-text-dim">{component.description}</p>
        </div>
      </div>
    </div>
  );
}

function DroppedComponentRenderer({ component, isSelected, onSelect, onUpdate, onDelete }: {
  component: DroppedComponent;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (props: Record<string, any>) => void;
  onDelete: () => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  const renderComponent = () => {
    switch (component.type) {
      case 'heading':
        return (
          <div
            style={{ 
              color: component.props.color,
              textAlign: component.props.align,
              margin: 0
            }}
          >
            {component.props.level === 'h1' && <h1>{component.props.text}</h1>}
            {component.props.level === 'h2' && <h2>{component.props.text}</h2>}
            {component.props.level === 'h3' && <h3>{component.props.text}</h3>}
          </div>
        );
      
      case 'text':
        return (
          <p style={{ 
            fontSize: component.props.fontSize,
            color: component.props.color,
            margin: 0
          }}>
            {component.props.text}
          </p>
        );
      
      case 'button':
        return (
          <button
            className={`px-4 py-2 rounded ${
              component.props.variant === 'primary' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
            style={{
              fontSize: component.props.size === 'large' ? '18px' : 
                       component.props.size === 'small' ? '12px' : '14px'
            }}
          >
            {component.props.text}
          </button>
        );
      
      case 'image':
        return (
          <div
            style={{
              width: component.props.width,
              height: component.props.height,
              backgroundColor: '#f0f0f0',
              border: '2px dashed #ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {component.props.src ? (
              <img 
                src={component.props.src} 
                alt={component.props.alt}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Camera className="h-8 w-8 text-gray-400" />
            )}
          </div>
        );
      
      case 'input':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">{component.props.label}</label>
            <input
              type="text"
              placeholder={component.props.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required={component.props.required}
            />
          </div>
        );
      
      case 'container':
        return (
          <div
            style={{
              padding: component.props.padding,
              backgroundColor: component.props.backgroundColor,
              borderRadius: component.props.borderRadius,
              border: '2px dashed #ddd',
              minHeight: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span className="text-gray-500">Container - Drop components here</span>
          </div>
        );
      
      default:
        return (
          <div className="p-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-center">
            {component.type} component
          </div>
        );
    }
  };

  return (
    <div
      className={`absolute cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-1 hover:ring-gray-300'
      }`}
      style={{
        left: component.x,
        top: component.y,
        width: component.width,
        height: component.height,
      }}
      onClick={handleClick}
    >
      {renderComponent()}
      {isSelected && (
        <div className="absolute -top-8 -right-8 flex space-x-1">
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

function PropertyPanel({ component, onUpdate }: {
  component: DroppedComponent | null;
  onUpdate: (props: Record<string, any>) => void;
}) {
  if (!component) {
    return (
      <div className="p-4 text-center text-gray-500">
        Select a component to edit its properties
      </div>
    );
  }

  const updateProp = (key: string, value: any) => {
    onUpdate({ ...component.props, [key]: value });
  };

  const renderPropertyInputs = () => {
    switch (component.type) {
      case 'heading':
        return (
          <div className="space-y-4">
            <div>
              <Label>Text</Label>
              <Input
                value={component.props.text}
                onChange={(e) => updateProp('text', e.target.value)}
              />
            </div>
            <div>
              <Label>Level</Label>
              <Select value={component.props.level} onValueChange={(value) => updateProp('level', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">Heading 1</SelectItem>
                  <SelectItem value="h2">Heading 2</SelectItem>
                  <SelectItem value="h3">Heading 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Color</Label>
              <Input
                type="color"
                value={component.props.color}
                onChange={(e) => updateProp('color', e.target.value)}
              />
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label>Text</Label>
              <Textarea
                value={component.props.text}
                onChange={(e) => updateProp('text', e.target.value)}
              />
            </div>
            <div>
              <Label>Font Size</Label>
              <Input
                value={component.props.fontSize}
                onChange={(e) => updateProp('fontSize', e.target.value)}
                placeholder="16px"
              />
            </div>
            <div>
              <Label>Color</Label>
              <Input
                type="color"
                value={component.props.color}
                onChange={(e) => updateProp('color', e.target.value)}
              />
            </div>
          </div>
        );
      
      case 'button':
        return (
          <div className="space-y-4">
            <div>
              <Label>Button Text</Label>
              <Input
                value={component.props.text}
                onChange={(e) => updateProp('text', e.target.value)}
              />
            </div>
            <div>
              <Label>Style</Label>
              <Select value={component.props.variant} onValueChange={(value) => updateProp('variant', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Size</Label>
              <Select value={component.props.size} onValueChange={(value) => updateProp('size', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <Label>Image URL</Label>
              <Input
                value={component.props.src}
                onChange={(e) => updateProp('src', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label>Alt Text</Label>
              <Input
                value={component.props.alt}
                onChange={(e) => updateProp('alt', e.target.value)}
              />
            </div>
            <div>
              <Label>Width</Label>
              <Input
                value={component.props.width}
                onChange={(e) => updateProp('width', e.target.value)}
              />
            </div>
            <div>
              <Label>Height</Label>
              <Input
                value={component.props.height}
                onChange={(e) => updateProp('height', e.target.value)}
              />
            </div>
          </div>
        );
      
      default:
        return <div>No properties available for this component type.</div>;
    }
  };

  return (
    <div className="p-4">
      <h3 className="font-semibold mb-4 capitalize">{component.type} Properties</h3>
      {renderPropertyInputs()}
    </div>
  );
}

export function VisualBuilder({ projectId }: VisualBuilderProps) {
  const [droppedComponents, setDroppedComponents] = useState<DroppedComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('Basic');

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'component',
    drop: (item: { type: string; defaultProps: Record<string, any> }, monitor) => {
      const offset = monitor.getClientOffset();
      const dropAreaRect = document.getElementById('drop-area')?.getBoundingClientRect();
      
      if (offset && dropAreaRect) {
        const x = offset.x - dropAreaRect.left;
        const y = offset.y - dropAreaRect.top;
        
        const newComponent: DroppedComponent = {
          id: `${item.type}-${Date.now()}`,
          type: item.type,
          props: { ...item.defaultProps },
          x: Math.max(0, x - 50),
          y: Math.max(0, y - 25),
          width: 200,
          height: 50,
        };
        
        setDroppedComponents(prev => [...prev, newComponent]);
        setSelectedComponent(newComponent.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const updateComponent = useCallback((id: string, props: Record<string, any>) => {
    setDroppedComponents(prev =>
      prev.map(comp => comp.id === id ? { ...comp, props } : comp)
    );
  }, []);

  const deleteComponent = useCallback((id: string) => {
    setDroppedComponents(prev => prev.filter(comp => comp.id !== id));
    setSelectedComponent(null);
  }, []);

  const selectedComponentData = droppedComponents.find(comp => comp.id === selectedComponent);
  const filteredComponents = componentLibrary.filter(comp => comp.category === activeCategory);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full flex">
        {/* Component Library */}
        <div className="w-80 border-r border-editor-border bg-editor-surface flex flex-col">
          <div className="p-4 border-b border-editor-border">
            <h3 className="font-semibold text-editor-text mb-4">Component Library</h3>
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="grid w-full grid-cols-3">
                {categories.map(category => (
                  <TabsTrigger key={category} value={category} className="text-xs">
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {filteredComponents.map(component => (
                <ComponentLibraryItem key={component.id} component={component} />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-editor-border bg-editor-bg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-editor-text">Visual Builder</h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  <Code className="h-4 w-4 mr-2" />
                  View Code
                </Button>
              </div>
            </div>
          </div>
          
          <div
            ref={drop}
            id="drop-area"
            className={`flex-1 relative bg-white overflow-auto ${
              isOver ? 'bg-blue-50' : ''
            }`}
            onClick={() => setSelectedComponent(null)}
          >
            {droppedComponents.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Layout className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Drag components here to start building</p>
                  <p className="text-sm">Select components from the library on the left</p>
                </div>
              </div>
            ) : (
              droppedComponents.map(component => (
                <DroppedComponentRenderer
                  key={component.id}
                  component={component}
                  isSelected={selectedComponent === component.id}
                  onSelect={() => setSelectedComponent(component.id)}
                  onUpdate={(props) => updateComponent(component.id, props)}
                  onDelete={() => deleteComponent(component.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Property Panel */}
        <div className="w-80 border-l border-editor-border bg-editor-surface">
          <div className="p-4 border-b border-editor-border">
            <h3 className="font-semibold text-editor-text">Properties</h3>
          </div>
          <ScrollArea className="h-full">
            <PropertyPanel
              component={selectedComponentData || null}
              onUpdate={(props) => selectedComponent && updateComponent(selectedComponent, props)}
            />
          </ScrollArea>
        </div>
      </div>
    </DndProvider>
  );
}