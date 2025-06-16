import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Folder, 
  FolderOpen, 
  FilePlus, 
  FolderPlus, 
  RefreshCw,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { File, FileTreeItem } from "@shared/schema";

interface FileExplorerProps {
  projectId: number;
  onFileSelect: (file: File) => void;
  selectedFileId?: number;
}

export function FileExplorer({ projectId, onFileSelect, selectedFileId }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [isCreating, setIsCreating] = useState<{ type: 'file' | 'folder'; parentId?: number } | null>(null);
  const [newItemName, setNewItemName] = useState('');
  
  const queryClient = useQueryClient();

  const { data: files = [], isLoading } = useQuery<File[]>({
    queryKey: ['/api/projects', projectId, 'files'],
    enabled: !!projectId
  });

  const createFileMutation = useMutation({
    mutationFn: async (data: { name: string; isDirectory: boolean; parentId?: number }) => {
      const path = data.parentId 
        ? `/${data.name}` // Simplified path logic
        : `/${data.name}`;
      
      return apiRequest('POST', `/api/projects/${projectId}/files`, {
        name: data.name,
        path,
        isDirectory: data.isDirectory,
        parentId: data.parentId,
        content: data.isDirectory ? '' : '// New file\n',
        language: data.isDirectory ? '' : getLanguageFromExtension(data.name)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'files'] });
      setIsCreating(null);
      setNewItemName('');
    }
  });

  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': return 'javascript';
      case 'jsx': return 'javascript';
      case 'ts': return 'typescript';
      case 'tsx': return 'typescript';
      case 'py': return 'python';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'md': return 'markdown';
      default: return 'plaintext';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.isDirectory) {
      return expandedFolders.has(file.id) ? (
        <FolderOpen className="h-4 w-4 text-editor-primary" />
      ) : (
        <Folder className="h-4 w-4 text-editor-primary" />
      );
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    const iconClass = "h-4 w-4";
    
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
        return <FileText className={`${iconClass} text-editor-text-dim`} />;
    }
  };

  const toggleFolder = (folderId: number) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleCreateItem = () => {
    if (!newItemName.trim() || !isCreating) return;
    
    createFileMutation.mutate({
      name: newItemName.trim(),
      isDirectory: isCreating.type === 'folder',
      parentId: isCreating.parentId
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateItem();
    } else if (e.key === 'Escape') {
      setIsCreating(null);
      setNewItemName('');
    }
  };

  const buildFileTree = (files: File[]): FileTreeItem[] => {
    const tree: FileTreeItem[] = [];
    const fileMap = new Map<number, FileTreeItem>();

    // Create file tree items
    files.forEach(file => {
      const item: FileTreeItem = {
        id: file.id,
        name: file.name,
        path: file.path,
        isDirectory: file.isDirectory,
        parentId: file.parentId || undefined,
        children: []
      };
      fileMap.set(file.id, item);
    });

    // Build tree structure
    fileMap.forEach(item => {
      if (item.parentId && fileMap.has(item.parentId)) {
        const parent = fileMap.get(item.parentId)!;
        if (!parent.children) parent.children = [];
        parent.children.push(item);
      } else {
        tree.push(item);
      }
    });

    return tree;
  };

  const renderFileTree = (items: FileTreeItem[], level = 0) => {
    return items.map(item => (
      <div key={item.id}>
        <div
          className={`flex items-center px-3 py-1 hover:bg-editor-bg cursor-pointer border-l-2 border-transparent hover:border-editor-primary ${
            selectedFileId === item.id ? 'bg-editor-bg border-editor-primary' : ''
          }`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={() => {
            if (item.isDirectory) {
              toggleFolder(item.id);
            } else {
              const file = files.find(f => f.id === item.id);
              if (file) onFileSelect(file);
            }
          }}
        >
          {item.isDirectory && (
            <div className="mr-1">
              {expandedFolders.has(item.id) ? (
                <ChevronDown className="h-3 w-3 text-editor-text-dim" />
              ) : (
                <ChevronRight className="h-3 w-3 text-editor-text-dim" />
              )}
            </div>
          )}
          <div className="mr-2">
            {getFileIcon(files.find(f => f.id === item.id)!)}
          </div>
          <span className="text-sm">{item.name}</span>
        </div>
        {item.isDirectory && expandedFolders.has(item.id) && item.children && (
          <div>
            {renderFileTree(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div className="w-60 bg-editor-surface border-r border-editor-border flex items-center justify-center">
        <div className="text-editor-text-dim">Loading...</div>
      </div>
    );
  }

  const fileTree = buildFileTree(files);

  return (
    <div className="w-60 bg-editor-surface border-r border-editor-border flex flex-col">
      <div className="p-3 border-b border-editor-border">
        <h3 className="text-sm font-medium mb-2">Explorer</h3>
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-editor-bg"
            onClick={() => setIsCreating({ type: 'file' })}
          >
            <FilePlus className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-editor-bg"
            onClick={() => setIsCreating({ type: 'folder' })}
          >
            <FolderPlus className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-editor-bg"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'files'] })}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="py-2">
          {renderFileTree(fileTree)}
          
          {isCreating && (
            <div className="px-3 py-1" style={{ paddingLeft: '12px' }}>
              <div className="flex items-center">
                <div className="mr-2">
                  {isCreating.type === 'folder' ? (
                    <Folder className="h-4 w-4 text-editor-primary" />
                  ) : (
                    <FileText className="h-4 w-4 text-editor-text-dim" />
                  )}
                </div>
                <Input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={handleCreateItem}
                  placeholder={`New ${isCreating.type}...`}
                  className="h-6 text-xs bg-editor-bg border-editor-border"
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
