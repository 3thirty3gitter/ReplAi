import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Table, 
  Plus, 
  Trash2, 
  Edit, 
  Link, 
  Key,
  Settings,
  Save,
  Eye,
  Code,
  FileText,
  Hash,
  Calendar,
  Mail,
  Lock,
  Globe,
  ToggleLeft,
  Type
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { DataTable, InsertDataTable } from "@shared/schema";

interface Field {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'email' | 'password' | 'url' | 'textarea';
  required: boolean;
  unique: boolean;
  defaultValue?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface Relationship {
  id: string;
  fromTable: string;
  toTable: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  fromField: string;
  toField: string;
}

interface TableSchema {
  id: string;
  name: string;
  fields: Field[];
  relationships: Relationship[];
}

interface DatabaseBuilderProps {
  projectId: number;
}

const fieldTypes = [
  { value: 'text', label: 'Text', icon: Type, description: 'Short text (names, titles)' },
  { value: 'textarea', label: 'Long Text', icon: FileText, description: 'Paragraphs and descriptions' },
  { value: 'number', label: 'Number', icon: Hash, description: 'Integers and decimals' },
  { value: 'boolean', label: 'True/False', icon: ToggleLeft, description: 'Yes/No values' },
  { value: 'date', label: 'Date', icon: Calendar, description: 'Dates and timestamps' },
  { value: 'email', label: 'Email', icon: Mail, description: 'Email addresses' },
  { value: 'password', label: 'Password', icon: Lock, description: 'Encrypted passwords' },
  { value: 'url', label: 'URL', icon: Globe, description: 'Website links' }
];

export function DatabaseBuilder({ projectId }: DatabaseBuilderProps) {
  const [tables, setTables] = useState<TableSchema[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableSchema | null>(null);
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [newTableName, setNewTableName] = useState('');
  const { toast } = useToast();

  const queryClient = useQueryClient();

  // Get existing database tables
  const { data: existingTables = [] } = useQuery<DataTable[]>({
    queryKey: ['/api/projects', projectId, 'database-tables'],
    enabled: !!projectId
  });

  // Save table mutation
  const saveTableMutation = useMutation({
    mutationFn: async (tableData: InsertDataTable) => {
      return apiRequest('POST', `/api/projects/${projectId}/database-tables`, tableData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'database-tables'] });
      toast({
        title: "Table Created",
        description: "Database table has been created successfully!"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create table",
        variant: "destructive"
      });
    }
  });

  const createNewTable = () => {
    if (!newTableName.trim()) return;
    
    const newTable: TableSchema = {
      id: `table_${Date.now()}`,
      name: newTableName,
      fields: [
        {
          id: 'id',
          name: 'id',
          type: 'number',
          required: true,
          unique: true
        }
      ],
      relationships: []
    };
    
    setTables(prev => [...prev, newTable]);
    setSelectedTable(newTable);
    setNewTableName('');
    setIsTableDialogOpen(false);
  };

  const deleteTable = (tableId: string) => {
    setTables(prev => prev.filter(t => t.id !== tableId));
    if (selectedTable?.id === tableId) {
      setSelectedTable(null);
    }
  };

  const addField = () => {
    setEditingField({
      id: `field_${Date.now()}`,
      name: '',
      type: 'text',
      required: false,
      unique: false
    });
    setIsFieldDialogOpen(true);
  };

  const editField = (field: Field) => {
    setEditingField(field);
    setIsFieldDialogOpen(true);
  };

  const saveField = (field: Field) => {
    if (!selectedTable) return;
    
    setTables(prev => prev.map(table => {
      if (table.id === selectedTable.id) {
        const existingFieldIndex = table.fields.findIndex(f => f.id === field.id);
        if (existingFieldIndex >= 0) {
          // Update existing field
          const updatedFields = [...table.fields];
          updatedFields[existingFieldIndex] = field;
          return { ...table, fields: updatedFields };
        } else {
          // Add new field
          return { ...table, fields: [...table.fields, field] };
        }
      }
      return table;
    }));
    
    setSelectedTable(prev => {
      if (!prev) return null;
      const existingFieldIndex = prev.fields.findIndex(f => f.id === field.id);
      if (existingFieldIndex >= 0) {
        const updatedFields = [...prev.fields];
        updatedFields[existingFieldIndex] = field;
        return { ...prev, fields: updatedFields };
      } else {
        return { ...prev, fields: [...prev.fields, field] };
      }
    });
    
    setIsFieldDialogOpen(false);
    setEditingField(null);
  };

  const deleteField = (fieldId: string) => {
    if (!selectedTable) return;
    
    setTables(prev => prev.map(table => 
      table.id === selectedTable.id 
        ? { ...table, fields: table.fields.filter(f => f.id !== fieldId) }
        : table
    ));
    
    setSelectedTable(prev => 
      prev ? { ...prev, fields: prev.fields.filter(f => f.id !== fieldId) } : null
    );
  };

  const saveTableToDatabase = async (table: TableSchema) => {
    const tableData: InsertDataTable = {
      projectId,
      name: table.name,
      fields: table.fields,
      relationships: table.relationships
    };
    
    await saveTableMutation.mutateAsync(tableData);
  };

  const getFieldIcon = (type: string) => {
    const fieldType = fieldTypes.find(ft => ft.value === type);
    return fieldType?.icon || Type;
  };

  return (
    <div className="h-full bg-editor-bg">
      {/* Header */}
      <div className="p-6 border-b border-editor-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-editor-text flex items-center">
              <Database className="h-6 w-6 mr-2" />
              Database Builder
            </h2>
            <p className="text-editor-text-dim">Design your database tables and relationships visually</p>
          </div>
          <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Table
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Table</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Table Name</Label>
                  <Input
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    placeholder="e.g., users, products, orders"
                  />
                </div>
                <Button onClick={createNewTable} disabled={!newTableName.trim()}>
                  Create Table
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex h-full">
        {/* Tables List */}
        <div className="w-80 border-r border-editor-border bg-editor-surface">
          <div className="p-4 border-b border-editor-border">
            <h3 className="font-semibold text-editor-text">Tables</h3>
          </div>
          <ScrollArea className="h-full p-4">
            <div className="space-y-2">
              {tables.map(table => (
                <Card 
                  key={table.id}
                  className={`cursor-pointer transition-colors ${
                    selectedTable?.id === table.id ? 'ring-2 ring-editor-primary' : ''
                  }`}
                  onClick={() => setSelectedTable(table)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Table className="h-4 w-4 text-editor-primary" />
                        <CardTitle className="text-sm">{table.name}</CardTitle>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            saveTableToDatabase(table);
                          }}
                          disabled={saveTableMutation.isPending}
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTable(table.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-editor-text-dim">
                      {table.fields.length} fields
                    </p>
                  </CardContent>
                </Card>
              ))}
              
              {/* Existing tables from database */}
              {existingTables.map(table => (
                <Card key={table.id} className="opacity-75">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4 text-green-600" />
                        <CardTitle className="text-sm">{table.name}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs">Saved</Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Table Details */}
        <div className="flex-1 flex flex-col">
          {selectedTable ? (
            <>
              {/* Table Header */}
              <div className="p-6 border-b border-editor-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-editor-text">{selectedTable.name}</h3>
                    <p className="text-editor-text-dim">Manage fields and properties</p>
                  </div>
                  <Button onClick={addField}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Field
                  </Button>
                </div>
              </div>

              {/* Fields List */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-3">
                  {selectedTable.fields.map(field => {
                    const FieldIcon = getFieldIcon(field.type);
                    return (
                      <Card key={field.id} className="bg-editor-surface">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <FieldIcon className="h-5 w-5 text-editor-primary" />
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-editor-text">{field.name}</span>
                                  {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                                  {field.unique && <Badge variant="outline" className="text-xs">Unique</Badge>}
                                  {field.name === 'id' && <Key className="h-3 w-3 text-yellow-500" />}
                                </div>
                                <p className="text-sm text-editor-text-dim capitalize">{field.type}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => editField(field)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              {field.name !== 'id' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteField(field.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <Database className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-editor-text mb-2">No Table Selected</h3>
                <p className="text-editor-text-dim">Create a new table or select an existing one to start designing your database</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Field Editor Dialog */}
      <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingField?.name ? 'Edit Field' : 'Add New Field'}
            </DialogTitle>
          </DialogHeader>
          {editingField && (
            <FieldEditor
              field={editingField}
              onSave={saveField}
              onCancel={() => {
                setIsFieldDialogOpen(false);
                setEditingField(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface FieldEditorProps {
  field: Field;
  onSave: (field: Field) => void;
  onCancel: () => void;
}

function FieldEditor({ field, onSave, onCancel }: FieldEditorProps) {
  const [localField, setLocalField] = useState<Field>(field);

  const updateField = (updates: Partial<Field>) => {
    setLocalField(prev => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    if (!localField.name.trim()) return;
    onSave(localField);
  };

  const selectedFieldType = fieldTypes.find(ft => ft.value === localField.type);

  return (
    <div className="space-y-4">
      <div>
        <Label>Field Name</Label>
        <Input
          value={localField.name}
          onChange={(e) => updateField({ name: e.target.value })}
          placeholder="e.g., email, username, price"
        />
      </div>

      <div>
        <Label>Field Type</Label>
        <Select value={localField.type} onValueChange={(value: any) => updateField({ type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fieldTypes.map(fieldType => {
              const IconComponent = fieldType.icon;
              return (
                <SelectItem key={fieldType.value} value={fieldType.value}>
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{fieldType.label}</div>
                      <div className="text-xs text-gray-500">{fieldType.description}</div>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {selectedFieldType && (
          <p className="text-xs text-gray-500 mt-1">{selectedFieldType.description}</p>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={localField.required}
            onCheckedChange={(checked) => updateField({ required: !!checked })}
          />
          <Label className="text-sm">Required</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={localField.unique}
            onCheckedChange={(checked) => updateField({ unique: !!checked })}
          />
          <Label className="text-sm">Unique</Label>
        </div>
      </div>

      {localField.type === 'text' && (
        <div>
          <Label>Default Value (optional)</Label>
          <Input
            value={localField.defaultValue || ''}
            onChange={(e) => updateField({ defaultValue: e.target.value })}
            placeholder="Default text value"
          />
        </div>
      )}

      <div className="flex space-x-2">
        <Button onClick={handleSave} disabled={!localField.name.trim()}>
          Save Field
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}