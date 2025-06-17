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
import { getCodeAssistance, generateCode, explainCode, debugCode } from "./services/perplexity";
import { executeCode } from "./services/codeExecution";
import { generateProjectFiles, createGeneratedFiles, generateSingleFile } from "./services/codeGenerator";
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

  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, code, language, projectId } = z.object({
        message: z.string(),
        code: z.string().optional(),
        language: z.string().optional(),
        projectId: z.number()
      }).parse(req.body);

      if (!process.env.PERPLEXITY_API_KEY) {
        return res.status(500).json({
          success: false,
          message: "Perplexity API key not configured"
        });
      }

      // Build context-aware prompt for Perplexity
      let contextPrompt = `You are an expert software development assistant. Respond helpfully and conversationally to the user's message: "${message}"`;
      
      if (code && language) {
        contextPrompt += `\n\nThe user is working with ${language} code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide relevant assistance based on their code and message.`;
      }

      const perplexityRequest = {
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system" as const,
            content: "You are a helpful software development assistant. Provide clear, concise, and actionable responses to help users with their development tasks."
          },
          {
            role: "user" as const,
            content: contextPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.2,
        top_p: 0.9,
        stream: false
      };

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(perplexityRequest)
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const aiMessage = data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

      res.json({ message: aiMessage });
    } catch (error) {
      console.error('Perplexity chat error:', error);
      res.status(500).json({ 
        success: false,
        message: "Failed to get AI response. Please check that the Perplexity API key is configured."
      });
    }
  });

  // Generate app plan endpoint
  app.post('/api/ai/generate-plan', async (req, res) => {
    try {
      const { prompt } = z.object({
        prompt: z.string()
      }).parse(req.body);

      const { generateAppPlan } = await import('./services/perplexityService');
      const plan = await generateAppPlan(prompt);

      res.json({
        success: true,
        plan: plan
      });
    } catch (error) {
      console.error('Plan generation error:', error);
      res.status(500).json({
        success: false,
        message: (error as Error).message || "Failed to generate app plan"
      });
    }
  });

  // AI Code Generation - Generate complete project files
  app.post('/api/ai/generate-project', async (req, res) => {
    try {
      const { prompt, projectId, projectType, framework, includeTests } = z.object({
        prompt: z.string().min(1),
        projectId: z.number(),
        projectType: z.enum(['web', 'api', 'component', 'full-stack']).optional(),
        framework: z.enum(['react', 'vanilla', 'express', 'next']).optional(),
        includeTests: z.boolean().optional()
      }).parse(req.body);

      const result = await generateProjectFiles({
        prompt,
        projectId,
        projectType,
        framework,
        includeTests
      });

      // Actually create the files in the project
      await createGeneratedFiles(projectId, result.files);

      res.json({
        success: true,
        filesCreated: result.files.length,
        files: result.files.map(f => ({ name: f.name, path: f.path, description: f.description })),
        instructions: result.instructions,
        nextSteps: result.nextSteps,
        dependencies: result.dependencies
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // AI Code Generation - Generate single file
  app.post('/api/ai/generate-file', async (req, res) => {
    try {
      const { prompt, projectId, targetPath, language } = z.object({
        prompt: z.string().min(1),
        projectId: z.number(),
        targetPath: z.string().optional(),
        language: z.string().optional()
      }).parse(req.body);

      const file = await generateSingleFile(projectId, prompt, targetPath, language);

      // Create the file in the project
      await storage.createFile({
        projectId,
        name: file.name,
        path: file.path,
        content: file.content,
        language: file.language,
        isDirectory: false
      });

      res.json({
        success: true,
        file: {
          name: file.name,
          path: file.path,
          description: file.description,
          language: file.language
        }
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/settings', async (req, res) => {
    try {
      const { perplexityApiKey } = z.object({
        perplexityApiKey: z.string().min(1)
      }).parse(req.body);

      // Validate the API key format
      if (!perplexityApiKey.startsWith('pplx-')) {
        return res.status(400).json({ error: 'Invalid Perplexity API key format' });
      }

      // Update the environment variable
      process.env.PERPLEXITY_API_KEY = perplexityApiKey;
      
      res.json({ success: true, message: 'Perplexity API key updated successfully' });
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

  // Database tables routes
  app.get('/api/projects/:projectId/database-tables', async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const tables = await storage.getDataTablesByProject(projectId);
      res.json(tables);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/projects/:projectId/database-tables', async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const tableData = { ...req.body, projectId };
      const table = await storage.createDataTable(tableData);
      res.json(table);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Workflow routes
  app.get('/api/projects/:projectId/workflows', async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const workflows = await storage.getWorkflowsByProject(projectId);
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/projects/:projectId/workflows', async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const workflowData = { ...req.body, projectId };
      const workflow = await storage.createWorkflow(workflowData);
      res.json(workflow);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Deployment routes
  app.get('/api/projects/:projectId/deployments', async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const deployments = await storage.getDeploymentsByProject(projectId);
      res.json(deployments);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/projects/:projectId/deploy', async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const deploymentData = { 
        ...req.body, 
        projectId,
        version: `v${Date.now()}`,
        status: 'building',
        url: `https://project-${projectId}.codeide.app`
      };
      const deployment = await storage.createDeployment(deploymentData);
      
      // Simulate deployment process
      setTimeout(async () => {
        await storage.updateDeployment(deployment.id, { 
          status: 'deployed',
          buildTime: Math.floor(Math.random() * 180) + 60
        });
      }, 5000);
      
      res.json(deployment);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Project templates route
  app.post('/api/projects/from-template', async (req, res) => {
    try {
      const { templateId, name, components, database, workflows } = req.body;
      
      // Create project from template
      const project = await storage.createProject({
        name: `${name} (from template)`,
        description: `Created from ${templateId} template`
      });

      // Create database tables
      for (const table of database) {
        await storage.createDataTable({
          projectId: project.id,
          name: table.name,
          fields: table.fields,
          relationships: []
        });
      }

      // Create workflows
      for (const workflow of workflows) {
        await storage.createWorkflow({
          projectId: project.id,
          name: workflow.name,
          trigger: workflow.trigger,
          steps: workflow.steps,
          isActive: true
        });
      }

      // Create initial files based on template
      await storage.createFile({
        projectId: project.id,
        name: 'index.html',
        path: '/index.html',
        content: `<!DOCTYPE html>
<html>
<head>
    <title>${name}</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <h1>Welcome to ${name}</h1>
    <p>Your application is ready to be customized!</p>
</body>
</html>`,
        language: 'html'
      });

      res.json(project);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  return httpServer;
}
