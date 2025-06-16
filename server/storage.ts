import { 
  projects, 
  files, 
  aiConversations, 
  codeExecutions,
  type Project, 
  type InsertProject,
  type File,
  type InsertFile,
  type AIConversation,
  type InsertAIConversation,
  type CodeExecution,
  type InsertCodeExecution
} from "@shared/schema";

export interface IStorage {
  // Projects
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: number): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Files
  createFile(file: InsertFile): Promise<File>;
  getFile(id: number): Promise<File | undefined>;
  getFilesByProject(projectId: number): Promise<File[]>;
  updateFile(id: number, file: Partial<InsertFile>): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;
  getFileByPath(projectId: number, path: string): Promise<File | undefined>;

  // AI Conversations
  createAIConversation(conversation: InsertAIConversation): Promise<AIConversation>;
  getAIConversation(projectId: number): Promise<AIConversation | undefined>;
  updateAIConversation(id: number, conversation: Partial<InsertAIConversation>): Promise<AIConversation | undefined>;

  // Code Executions
  createCodeExecution(execution: InsertCodeExecution): Promise<CodeExecution>;
  getCodeExecution(id: number): Promise<CodeExecution | undefined>;
  updateCodeExecution(id: number, execution: Partial<InsertCodeExecution>): Promise<CodeExecution | undefined>;
  getCodeExecutionsByProject(projectId: number): Promise<CodeExecution[]>;
}

export class MemStorage implements IStorage {
  private projects: Map<number, Project> = new Map();
  private files: Map<number, File> = new Map();
  private aiConversations: Map<number, AIConversation> = new Map();
  private codeExecutions: Map<number, CodeExecution> = new Map();
  private currentProjectId = 1;
  private currentFileId = 1;
  private currentConversationId = 1;
  private currentExecutionId = 1;

  constructor() {
    // Initialize with default project
    this.createDefaultProject();
  }

  private async createDefaultProject() {
    const project = await this.createProject({
      name: "my-project",
      description: "Default project"
    });

    // Create default files
    await this.createFile({
      projectId: project.id,
      name: "index.js",
      path: "/index.js",
      content: `// Welcome to CodeIDE - AI-Powered Development Environment
// This is a fully functional code editor with AI assistance

function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci sequence:");
for (let i = 0; i < 10; i++) {
    console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}

// Try asking the AI assistant for help with:
// - Code optimization
// - Bug fixes
// - Feature implementations
// - Best practices`,
      language: "javascript",
      isDirectory: false,
      parentId: null
    });

    await this.createFile({
      projectId: project.id,
      name: "main.py",
      path: "/main.py",
      content: `# Python example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

if __name__ == "__main__":
    print("Fibonacci sequence:")
    for i in range(10):
        print(f"F({i}) = {fibonacci(i)}")`,
      language: "python",
      isDirectory: false,
      parentId: null
    });

    await this.createFile({
      projectId: project.id,
      name: "index.html",
      path: "/index.html",
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Project</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Welcome to My Project</h1>
    <script src="index.js"></script>
</body>
</html>`,
      language: "html",
      isDirectory: false,
      parentId: null
    });

    await this.createFile({
      projectId: project.id,
      name: "styles.css",
      path: "/styles.css",
      content: `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f0f0f0;
}

h1 {
    color: #333;
    text-align: center;
}`,
      language: "css",
      isDirectory: false,
      parentId: null
    });

    await this.createFile({
      projectId: project.id,
      name: "README.md",
      path: "/README.md",
      content: `# My Project

This is a sample project created in CodeIDE.

## Features

- Code editing with syntax highlighting
- AI-powered code assistance
- Real-time code execution
- File management

## Getting Started

1. Edit the files in the file explorer
2. Use the AI assistant for help
3. Run your code with the Run button
4. View output in the terminal

Happy coding!`,
      language: "markdown",
      isDirectory: false,
      parentId: null
    });
  }

  // Projects
  async createProject(project: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const newProject: Project = {
      ...project,
      id,
      description: project.description || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const existing = this.projects.get(id);
    if (!existing) return undefined;
    
    const updated: Project = {
      ...existing,
      ...project,
      updatedAt: new Date()
    };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Files
  async createFile(file: InsertFile): Promise<File> {
    const id = this.currentFileId++;
    const newFile: File = {
      ...file,
      id,
      content: file.content || "",
      language: file.language || "javascript",
      isDirectory: file.isDirectory || false,
      parentId: file.parentId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.files.set(id, newFile);
    return newFile;
  }

  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getFilesByProject(projectId: number): Promise<File[]> {
    return Array.from(this.files.values()).filter(file => file.projectId === projectId);
  }

  async updateFile(id: number, file: Partial<InsertFile>): Promise<File | undefined> {
    const existing = this.files.get(id);
    if (!existing) return undefined;
    
    const updated: File = {
      ...existing,
      ...file,
      updatedAt: new Date()
    };
    this.files.set(id, updated);
    return updated;
  }

  async deleteFile(id: number): Promise<boolean> {
    return this.files.delete(id);
  }

  async getFileByPath(projectId: number, path: string): Promise<File | undefined> {
    return Array.from(this.files.values()).find(
      file => file.projectId === projectId && file.path === path
    );
  }

  // AI Conversations
  async createAIConversation(conversation: InsertAIConversation): Promise<AIConversation> {
    const id = this.currentConversationId++;
    const newConversation: AIConversation = {
      ...conversation,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.aiConversations.set(id, newConversation);
    return newConversation;
  }

  async getAIConversation(projectId: number): Promise<AIConversation | undefined> {
    return Array.from(this.aiConversations.values()).find(
      conv => conv.projectId === projectId
    );
  }

  async updateAIConversation(id: number, conversation: Partial<InsertAIConversation>): Promise<AIConversation | undefined> {
    const existing = this.aiConversations.get(id);
    if (!existing) return undefined;
    
    const updated: AIConversation = {
      ...existing,
      ...conversation,
      updatedAt: new Date()
    };
    this.aiConversations.set(id, updated);
    return updated;
  }

  // Code Executions
  async createCodeExecution(execution: InsertCodeExecution): Promise<CodeExecution> {
    const id = this.currentExecutionId++;
    const newExecution: CodeExecution = {
      ...execution,
      id,
      createdAt: new Date()
    };
    this.codeExecutions.set(id, newExecution);
    return newExecution;
  }

  async getCodeExecution(id: number): Promise<CodeExecution | undefined> {
    return this.codeExecutions.get(id);
  }

  async updateCodeExecution(id: number, execution: Partial<InsertCodeExecution>): Promise<CodeExecution | undefined> {
    const existing = this.codeExecutions.get(id);
    if (!existing) return undefined;
    
    const updated: CodeExecution = {
      ...existing,
      ...execution
    };
    this.codeExecutions.set(id, updated);
    return updated;
  }

  async getCodeExecutionsByProject(projectId: number): Promise<CodeExecution[]> {
    return Array.from(this.codeExecutions.values()).filter(
      exec => exec.projectId === projectId
    );
  }
}

export const storage = new MemStorage();
