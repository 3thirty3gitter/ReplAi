import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertProjectSchema, 
  insertFileSchema, 
  insertAIConversationSchema,
  insertCodeExecutionSchema,
  type AIMessage 
} from "@shared/schema";
import { getCodeAssistance, generateCode, explainCode, debugCode } from "./services/openai";
import { executeCode } from "./services/codeExecution";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store WebSocket connections
  const connections = new Map<string, WebSocket>();

  wss.on('connection', (ws) => {
    const connectionId = Math.random().toString(36).substring(7);
    connections.set(connectionId, ws);

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'execute_code':
            const result = await executeCode(message.code, message.language);
            
            // Save execution to storage
            await storage.createCodeExecution({
              projectId: message.projectId,
              code: message.code,
              language: message.language,
              output: result.output,
              error: result.error,
              status: result.status
            });

            ws.send(JSON.stringify({
              type: 'execution_result',
              id: message.id,
              result
            }));
            break;

          case 'ai_message':
            const aiResponse = await getCodeAssistance({
              code: message.code || '',
              language: message.language || 'javascript',
              prompt: message.prompt,
              context: message.context
            });

            // Update AI conversation
            let conversation = await storage.getAIConversation(message.projectId);
            const messages = conversation ? [...(conversation.messages as AIMessage[])] : [];
            
            messages.push({
              role: 'user',
              content: message.prompt,
              timestamp: Date.now()
            });

            messages.push({
              role: 'assistant',
              content: aiResponse.suggestion + '\n\n' + aiResponse.explanation,
              timestamp: Date.now()
            });

            if (conversation) {
              await storage.updateAIConversation(conversation.id, { messages });
            } else {
              await storage.createAIConversation({
                projectId: message.projectId,
                messages
              });
            }

            ws.send(JSON.stringify({
              type: 'ai_response',
              id: message.id,
              response: aiResponse
            }));
            break;
        }
      } catch (error) {
        ws.send(JSON.stringify({
          type: 'error',
          message: (error as Error).message
        }));
      }
    });

    ws.on('close', () => {
      connections.delete(connectionId);
    });
  });

  // Projects API
  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/projects', async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get('/api/projects/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.put('/api/projects/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const projectData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, projectData);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.delete('/api/projects/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProject(id);
      if (!success) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Files API
  app.get('/api/projects/:projectId/files', async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const files = await storage.getFilesByProject(projectId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/projects/:projectId/files', async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const fileData = insertFileSchema.parse({ ...req.body, projectId });
      const file = await storage.createFile(fileData);
      res.json(file);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get('/api/files/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const file = await storage.getFile(id);
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
      res.json(file);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.put('/api/files/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const fileData = insertFileSchema.partial().parse(req.body);
      const file = await storage.updateFile(id, fileData);
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
      res.json(file);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.delete('/api/files/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteFile(id);
      if (!success) {
        return res.status(404).json({ error: 'File not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // AI Assistant API
  app.get('/api/projects/:projectId/ai-conversation', async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const conversation = await storage.getAIConversation(projectId);
      res.json(conversation || { messages: [] });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/ai/generate-code', async (req, res) => {
    try {
      const { prompt, language } = z.object({
        prompt: z.string(),
        language: z.string().optional().default('javascript')
      }).parse(req.body);

      const code = await generateCode(prompt, language);
      res.json({ code });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/ai/explain-code', async (req, res) => {
    try {
      const { code, language } = z.object({
        code: z.string(),
        language: z.string()
      }).parse(req.body);

      const explanation = await explainCode(code, language);
      res.json({ explanation });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/ai/debug-code', async (req, res) => {
    try {
      const { code, language, error } = z.object({
        code: z.string(),
        language: z.string(),
        error: z.string().optional()
      }).parse(req.body);

      const result = await debugCode(code, language, error);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Code Execution API
  app.get('/api/projects/:projectId/executions', async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const executions = await storage.getCodeExecutionsByProject(projectId);
      res.json(executions);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  return httpServer;
}
