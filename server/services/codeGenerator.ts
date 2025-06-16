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
  const systemPrompt = `You are an expert web developer. Generate complete, functional web applications as single HTML files with embedded CSS and JavaScript.

CRITICAL: You must respond with valid JSON in this EXACT format:
{
  "files": [
    {
      "name": "index.html",
      "path": "/index.html",
      "content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Page Title</title>\n    <style>\n        /* CSS goes here */\n    </style>\n</head>\n<body>\n    <!-- HTML content goes here -->\n    <script>\n        // JavaScript goes here\n    </script>\n</body>\n</html>",
      "language": "html",
      "description": "Complete single-file web application"
    }
  ],
  "instructions": "Open the HTML file in a browser to view the application",
  "nextSteps": ["Review the application", "Test functionality", "Customize as needed"],
  "dependencies": []
}

CRITICAL REQUIREMENTS:
- Create ONE complete HTML file only 
- Embed ALL CSS inside <style> tags in the <head>
- Embed ALL JavaScript inside <script> tags before </body>
- NO external file references or imports
- NO placeholder content - use real, specific content
- Modern, professional design with animations and interactivity
- Fully responsive mobile-first design
- Complete functionality with no missing pieces`;

  const userPrompt = `Create a single HTML file for: ${request.prompt}

Requirements:
- One complete HTML file with embedded CSS and JavaScript
- Beautiful, modern design with responsive layout
- Fully functional interactive elements
- Professional styling and user experience
- Real content (no lorem ipsum or placeholders)
- Mobile-friendly design

Generate the complete HTML file with all styling and functionality embedded.`;

  try {
    const response = await getCodeAssistance({
      code: '',
      language: request.framework || 'javascript',
      prompt: userPrompt,
      context: systemPrompt
    });

    console.log('Raw AI response:', response.suggestion.substring(0, 500));

    // Parse the AI response to extract the JSON
    let generationResult;
    try {
      // Try to parse the suggestion as JSON first
      generationResult = JSON.parse(response.suggestion);
    } catch (parseError) {
      // If direct parsing fails, try to extract JSON from markdown code blocks
      const jsonMatch = response.suggestion.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          generationResult = JSON.parse(jsonMatch[1]);
        } catch (jsonParseError) {
          console.error('Failed to parse extracted JSON:', jsonParseError);
          generationResult = null;
        }
      }
      
      // If still no valid JSON, try to extract HTML content directly
      if (!generationResult) {
        // Look for HTML content patterns in the response
        const htmlMatch = response.suggestion.match(/<!DOCTYPE html[\s\S]*?<\/html>/i);
        if (htmlMatch) {
          generationResult = {
            files: [{
              name: 'index.html',
              path: '/index.html',
              content: htmlMatch[0],
              language: 'html',
              description: 'Generated HTML application'
            }],
            instructions: 'HTML application generated successfully',
            nextSteps: ['Review the application', 'Test functionality'],
            dependencies: []
          };
        } else {
          // Final fallback: create a simple HTML structure
          const simpleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated App</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Application Generated</h1>
        <p>Your request: ${request.prompt}</p>
        <p>The AI generated content but it wasn't in the expected format. Please try again with a more specific request.</p>
    </div>
</body>
</html>`;
          
          generationResult = {
            files: [{
              name: 'index.html',
              path: '/index.html',
              content: simpleHtml,
              language: 'html',
              description: 'Fallback HTML application'
            }],
            instructions: 'Generated a basic HTML structure. Please try again for better results.',
            nextSteps: ['Try a more specific request', 'Review the output'],
            dependencies: []
          };
        }
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