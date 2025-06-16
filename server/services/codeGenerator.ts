import { getCodeAssistance } from './perplexity';
import { storage } from '../storage';
import type { InsertFile } from '@shared/schema';

export interface CodeGenerationRequest {
  prompt: string;
  projectId: number;
  projectType?: 'web' | 'api' | 'component' | 'full-stack';
  framework?: 'react' | 'vanilla' | 'express' | 'next';
  includeTests?: boolean;
}

export interface GeneratedFile {
  name: string;
  path: string;
  content: string;
  language: string;
  description: string;
}

export interface CodeGenerationResponse {
  files: GeneratedFile[];
  instructions: string;
  nextSteps: string[];
  dependencies: string[];
}

export async function generateProjectFiles(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
  const systemPrompt = `You are an expert full-stack developer and architect. Generate complete, production-ready code based on user requirements.

IMPORTANT: Always respond with valid JSON in this exact format:
{
  "files": [
    {
      "name": "filename.ext",
      "path": "/src/components/filename.ext",
      "content": "complete file content here",
      "language": "javascript|typescript|html|css|json",
      "description": "brief description of the file's purpose"
    }
  ],
  "instructions": "clear setup and usage instructions",
  "nextSteps": ["step 1", "step 2", "step 3"],
  "dependencies": ["package1", "package2"]
}

Requirements:
- Generate complete, functional code (no placeholders, TODOs, or comments like "// Add your logic here")
- Include proper error handling, validation, and edge cases
- Add beautiful, responsive CSS styling with modern design
- Use semantic HTML and accessibility best practices
- Include realistic sample data where appropriate
- Ensure all components are fully interactive and functional
- Add proper TypeScript types if using TypeScript
- Include proper state management and data flow
- Add loading states, error states, and empty states where relevant
- Use modern JavaScript/React patterns and best practices
- Include TypeScript types when applicable
- Follow modern best practices
- Create modular, reusable components
- Add proper file structure and organization

For web apps, include:
- HTML structure with semantic elements
- CSS with mobile-first responsive design
- JavaScript with modern ES6+ features
- Proper error handling and user feedback

For React components:
- Functional components with hooks
- TypeScript interfaces
- Proper prop validation
- Responsive design with Tailwind CSS
- Error boundaries where needed

For APIs:
- RESTful endpoints with proper HTTP methods
- Input validation and sanitization
- Error handling middleware
- TypeScript types for requests/responses
- Database schema if needed`;

  const userPrompt = `Project Type: ${request.projectType || 'web'}
Framework: ${request.framework || 'react'}
Include Tests: ${request.includeTests || false}

User Request: ${request.prompt}

Generate a complete, production-ready implementation. Include all necessary files, styling, and functionality.`;

  try {
    const response = await getCodeAssistance({
      code: '',
      language: request.framework || 'javascript',
      prompt: userPrompt,
      context: systemPrompt
    });

    // Parse the AI response to extract the JSON
    let generationResult;
    try {
      // Try to parse the suggestion as JSON first
      generationResult = JSON.parse(response.suggestion);
    } catch (parseError) {
      // If direct parsing fails, try to extract JSON from markdown code blocks
      const jsonMatch = response.suggestion.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        generationResult = JSON.parse(jsonMatch[1]);
      } else {
        // Fallback: create a basic structure from the response
        generationResult = {
          files: [{
            name: 'generated-code.js',
            path: '/src/generated-code.js',
            content: response.suggestion,
            language: 'javascript',
            description: 'Generated code based on user request'
          }],
          instructions: 'Generated code has been created. Review and integrate as needed.',
          nextSteps: ['Review the generated code', 'Test functionality', 'Customize as needed'],
          dependencies: []
        };
      }
    }

    // Validate the response structure
    if (!generationResult.files || !Array.isArray(generationResult.files)) {
      throw new Error('Invalid response format: missing files array');
    }

    return {
      files: generationResult.files,
      instructions: generationResult.instructions || 'Generated files are ready for use.',
      nextSteps: generationResult.nextSteps || ['Review generated code', 'Test functionality'],
      dependencies: generationResult.dependencies || []
    };

  } catch (error) {
    console.error('Code generation error:', error);
    throw new Error(`Failed to generate code: ${(error as Error).message}`);
  }
}

export async function createGeneratedFiles(projectId: number, files: GeneratedFile[]): Promise<void> {
  for (const file of files) {
    const fileData: InsertFile = {
      projectId,
      name: file.name,
      path: file.path,
      content: file.content,
      language: file.language,
      isDirectory: false
    };

    try {
      await storage.createFile(fileData);
    } catch (error) {
      console.error(`Failed to create file ${file.name}:`, error);
      // Continue with other files even if one fails
    }
  }
}

export async function generateSingleFile(
  projectId: number,
  prompt: string,
  targetPath?: string,
  language?: string
): Promise<GeneratedFile> {
  const systemPrompt = `Generate a single, complete file based on the user's request.

IMPORTANT: Respond with valid JSON in this format:
{
  "name": "filename.ext",
  "path": "/path/to/filename.ext",
  "content": "complete file content",
  "language": "javascript|typescript|html|css|json",
  "description": "file description"
}

Requirements:
- Generate complete, functional code
- Include proper error handling
- Follow best practices for the file type
- Add comprehensive comments
- Include responsive design for UI files`;

  const userPrompt = `Target Path: ${targetPath || 'auto-detect'}
Language: ${language || 'auto-detect'}

Request: ${prompt}

Generate a complete, functional file.`;

  try {
    const response = await getCodeAssistance({
      code: '',
      language: language || 'javascript',
      prompt: userPrompt,
      context: systemPrompt
    });

    let fileResult;
    try {
      fileResult = JSON.parse(response.suggestion);
    } catch (parseError) {
      const jsonMatch = response.suggestion.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        fileResult = JSON.parse(jsonMatch[1]);
      } else {
        // Fallback for single file
        const extension = language === 'typescript' ? 'ts' : 
                         language === 'html' ? 'html' :
                         language === 'css' ? 'css' : 'js';
        
        fileResult = {
          name: `generated-file.${extension}`,
          path: targetPath || `/src/generated-file.${extension}`,
          content: response.suggestion,
          language: language || 'javascript',
          description: 'Generated file based on user request'
        };
      }
    }

    return fileResult;

  } catch (error) {
    console.error('Single file generation error:', error);
    throw new Error(`Failed to generate file: ${(error as Error).message}`);
  }
}