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
  Code
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
  { value: 'text', label: 'Text', icon: '📝' },
  { value: 'number', label: 'Number', icon: '🔢' },
  { value: 'boolean', label: 'True/False', icon: '✅' },
  { value: 'date', label: 'Date', icon: '📅' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'password', label: 'Password', icon: '🔒' },
  { value: 'url', label: 'URL', icon: '🔗' },
  { value: 'textarea', label: 'Long Text', icon: '📄' }
];

export function DatabaseBuilder({ projectId }: DatabaseBuilderProps) {
  const [tables, setTables] = useState<TableSchema[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableSchema | null>(null);
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);

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
    }
  });

  const createNewTable = () => {
    const newTable: TableSchema = {
      id: `table_${Date.now()}`,
      name: '',
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
    setSelectedTable(newTable);
    setIsTableDialogOpen(true);
  };

  const saveTable = () => {
    if (selectedTable && selectedTable.name) {
      const existingIndex = tables.findIndex(t => t.id === selectedTable.id);
      if (existingIndex >= 0) {
        setTables(prev => prev.map((t, i) => i === existingIndex ? selectedTable : t));
      } else {
        setTables(prev => [...prev, selectedTable]);
      }
      
      // Save to backend
      saveTableMutation.mutate({
        projectId,
        name: selectedTable.name,
        fields: selectedTable.fields,
        relationships: selectedTable.relationships
      });
      
      setIsTableDialogOpen(false);
    }
  };

  const addField = () => {
    if (selectedTable) {
      const newField: Field = {
        id: `field_${Date.now()}`,
        name: '',
        type: 'text',
        required: false,
        unique: false
      };
      setEditingField(newField);
      setIsFieldDialogOpen(true);
    }
  };

  const saveField = (field: Field) => {
    if (selectedTable) {
      const existingIndex = selectedTable.fields.findIndex(f => f.id === field.id);
      if (existingIndex >= 0) {
        setSelectedTable({
          ...selectedTable,
          fields: selectedTable.fields.map((f, i) => i === existingIndex ? field : f)
        });
      } else {
        setSelectedTable({
          ...selectedTable,
          fields: [...selectedTable.fields, field]
        });
      }
    }
    setIsFieldDialogOpen(false);
    setEditingField(null);
  };

  const deleteField = (fieldId: string) => {
    if (selectedTable) {
      setSelectedTable({
        ...selectedTable,
        fields: selectedTable.fields.filter(f => f.id !== fieldId)
      });
    }
  };

  const generateSQL = () => {
    let sql = '';
    tables.forEach(table => {
      sql += `CREATE TABLE ${table.name} (\n`;
      table.fields.forEach((field, index) => {
        sql += `  ${field.name} `;
        switch (field.type) {
          case 'text':
          case 'email':
          case 'url':
            sql += 'VARCHAR(255)';
            break;
          case 'textarea':
            sql += 'TEXT';
            break;
          case 'number':
            sql += 'INTEGER';
            break;
          case 'boolean':
            sql += 'BOOLEAN';
            break;
          case 'date':
            sql += 'TIMESTAMP';
            break;
          case 'password':
            sql += 'VARCHAR(255)';
            break;
        }
        if (field.required) sql += ' NOT NULL';
        if (field.unique) sql += ' UNIQUE';
        if (field.name === 'id') sql += ' PRIMARY KEY AUTO_INCREMENT';
        if (index < table.fields.length - 1) sql += ',';
        sql += '\n';
      });
      sql += `);\n\n`;
    });
    return sql;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Tables List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Database
            </h2>
            <Button size="sm" onClick={createNewTable}>
              <Plus className="h-4 w-4 mr-1" />
              Table
            </Button>
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {tables.map(table => (
              <Card 
                key={table.id} 
                className={`cursor-pointer transition-colors ${
                  selectedTable?.id === table.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedTable(table)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{table.name || 'Untitled Table'}</h3>
                      <p className="text-sm text-gray-500">{table.fields.length} fields</p>
                    </div>
                    <Table className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Database Builder</h1>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" size="sm">
              <Code className="h-4 w-4 mr-2" />
              SQL
            </Button>
            <Button size="sm">
              <Save className="h-4 w-4 mr-2" />
              Deploy
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {selectedTable ? (
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedTable.name || 'Untitled Table'}</span>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setIsTableDialogOpen(true)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" onClick={addField}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Field
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedTable.fields.map(field => (
                      <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {field.name === 'id' && <Key className="h-4 w-4 text-yellow-500" />}
                            <span className="font-medium">{field.name}</span>
                          </div>
                          <span className="text-sm text-gray-500 px-2 py-1 bg-gray-100 rounded">
                            {fieldTypes.find(t => t.value === field.type)?.label}
                          </span>
                          {field.required && (
                            <span className="text-xs text-red-600 px-2 py-1 bg-red-100 rounded">Required</span>
                          )}
                          {field.unique && (
                            <span className="text-xs text-blue-600 px-2 py-1 bg-blue-100 rounded">Unique</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEditingField(field);
                              setIsFieldDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {field.name !== 'id' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteField(field.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Database className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No table selected</h3>
                <p className="text-gray-500 mb-4">Create a new table or select an existing one to start building your database</p>
                <Button onClick={createNewTable}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Table
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table Dialog */}
      <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTable && tables.find(t => t.id === selectedTable.id) ? 'Edit Table' : 'Create Table'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tableName">Table Name</Label>
              <Input
                id="tableName"
                value={selectedTable?.name || ''}
                onChange={(e) => setSelectedTable(prev => prev ? { ...prev, name: e.target.value } : null)}
                placeholder="users, products, orders..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsTableDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveTable}>
                Save Table
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Field Dialog */}
      <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingField && selectedTable?.fields.find(f => f.id === editingField.id) ? 'Edit Field' : 'Add Field'}
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
  const [editedField, setEditedField] = useState<Field>(field);

  const handleSave = () => {
    if (editedField.name) {
      onSave(editedField);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="fieldName">Field Name</Label>
        <Input
          id="fieldName"
          value={editedField.name}
          onChange={(e) => setEditedField(prev => ({ ...prev, name: e.target.value }))}
          placeholder="name, email, age..."
        />
      </div>

      <div>
        <Label htmlFor="fieldType">Field Type</Label>
        <Select
          value={editedField.type}
          onValueChange={(value) => setEditedField(prev => ({ ...prev, type: value as Field['type'] }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fieldTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                <span className="flex items-center">
                  <span className="mr-2">{type.icon}</span>
                  {type.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="required"
            checked={editedField.required}
            onCheckedChange={(checked) => setEditedField(prev => ({ ...prev, required: !!checked }))}
          />
          <Label htmlFor="required">Required field</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="unique"
            checked={editedField.unique}
            onCheckedChange={(checked) => setEditedField(prev => ({ ...prev, unique: !!checked }))}
          />
          <Label htmlFor="unique">Unique values only</Label>
        </div>
      </div>

      {editedField.type === 'text' && (
        <div>
          <Label htmlFor="defaultValue">Default Value (optional)</Label>
          <Input
            id="defaultValue"
            value={editedField.defaultValue || ''}
            onChange={(e) => setEditedField(prev => ({ ...prev, defaultValue: e.target.value }))}
            placeholder="Enter default value..."
          />
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Field
        </Button>
      </div>
    </div>
  );
}