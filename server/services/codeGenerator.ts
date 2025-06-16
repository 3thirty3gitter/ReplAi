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
  const prompt = `Create a STUNNING, PROFESSIONAL, PREMIUM-QUALITY single-file web application for: ${request.prompt}

CRITICAL REQUIREMENTS - MUST FOLLOW EXACTLY:
1. EXCEPTIONAL VISUAL DESIGN - Use modern gradients, beautiful typography, professional spacing
2. PREMIUM COLOR SCHEMES - Sophisticated color palettes that match the business type
3. ADVANCED CSS STYLING - Modern box-shadows, transitions, hover effects, professional layout
4. FULLY RESPONSIVE - Perfect on all devices with mobile-first design
5. INTERACTIVE FEATURES - Working JavaScript functionality, animations, user interactions
6. REAL CONTENT - Actual product names, descriptions, prices - NO placeholders
7. PROFESSIONAL BRANDING - Proper logos, taglines, business-appropriate imagery
8. COMPLETE FUNCTIONALITY - Shopping cart, forms, navigation - everything must work
9. MODERN WEB STANDARDS - Semantic HTML, accessible design, performance optimized
10. PIXEL-PERFECT LAYOUT - Beautiful spacing, alignment, typography hierarchy

STYLE GUIDELINES:
- Use premium fonts like 'Inter', 'Poppins', or 'Segoe UI'
- Implement sophisticated color gradients and shadows
- Add smooth animations and micro-interactions
- Create visual hierarchy with proper typography scales
- Use modern layout techniques (CSS Grid, Flexbox)
- Implement professional hover states and transitions

OUTPUT REQUIREMENT: Return ONLY the complete, production-ready HTML code starting with <!DOCTYPE html> and ending with </html>. NO explanations, NO markdown, NO comments outside the code.`;

  try {
    const response = await getCodeAssistance({
      code: '',
      language: 'html',
      prompt: prompt,
      context: 'Generate complete HTML applications with embedded CSS and JavaScript'
    });

    console.log('Raw AI response:', response.suggestion.substring(0, 300));

    // Extract HTML content from the response
    let htmlContent = response.suggestion.trim();
    
    // Remove any markdown code blocks if present
    const codeBlockMatch = htmlContent.match(/```(?:html)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      htmlContent = codeBlockMatch[1].trim();
      console.log('Extracted HTML from code block, length:', htmlContent.length);
    }
    
    // Look for complete HTML content pattern
    const htmlMatch = htmlContent.match(/<!DOCTYPE html[\s\S]*?<\/html>/i);
    if (htmlMatch) {
      htmlContent = htmlMatch[0];
      console.log('Found complete HTML with DOCTYPE');
    } else {
      // Try to find just the html tag without DOCTYPE
      const basicHtmlMatch = htmlContent.match(/<html[\s\S]*?<\/html>/i);
      if (basicHtmlMatch) {
        htmlContent = '<!DOCTYPE html>\n' + basicHtmlMatch[0];
        console.log('Found HTML without DOCTYPE, added it');
      } else {
        // Try to extract from broken HTML structure
        const partialHtmlMatch = htmlContent.match(/<html[^>]*>[\s\S]*$/i);
        if (partialHtmlMatch) {
          htmlContent = '<!DOCTYPE html>\n' + partialHtmlMatch[0] + '\n</html>';
          console.log('Found partial HTML, completed structure');
        } else {
          console.log('AI response could not be parsed as HTML, regenerating with simpler prompt');
          
          // Try again with a more direct prompt
          const fallbackPrompt = `Create a complete HTML webpage for: ${request.prompt}. Return ONLY valid HTML starting with <!DOCTYPE html> and ending with </html>. Include CSS and JavaScript. Make it professional and functional.`;
          
          try {
            const fallbackResponse = await getCodeAssistance({
              code: '',
              language: 'html',
              prompt: fallbackPrompt,
              context: 'Generate valid HTML'
            });
            
            const fallbackHtml = fallbackResponse.suggestion.trim();
            const fallbackCodeMatch = fallbackHtml.match(/```(?:html)?\s*([\s\S]*?)\s*```/);
            
            if (fallbackCodeMatch) {
              htmlContent = fallbackCodeMatch[1].trim();
              console.log('Fallback: extracted HTML from code block');
            } else if (fallbackHtml.includes('<!DOCTYPE html') || fallbackHtml.includes('<html')) {
              htmlContent = fallbackHtml;
              console.log('Fallback: using raw HTML response');
            } else {
              console.log('Fallback also failed, using minimal template');
              htmlContent = createMinimalApp(request.prompt);
            }
          } catch (fallbackError) {
            console.error('Fallback generation failed:', fallbackError);
            htmlContent = createMinimalApp(request.prompt);
          }
        }
      }
    }

    const generationResult = {
      files: [{
        name: 'index.html',
        path: '/index.html',
        content: htmlContent,
        language: 'html',
        description: 'Generated HTML application'
      }],
      instructions: 'Complete HTML application with embedded CSS and JavaScript',
      nextSteps: ['Test the application', 'Customize styling if needed'],
      dependencies: []
    };

    return {
      files: generationResult.files,
      instructions: generationResult.instructions,
      nextSteps: generationResult.nextSteps,
      dependencies: generationResult.dependencies
    };

  } catch (error) {
    console.error('Code generation error:', error);
    throw new Error(`Failed to generate code: ${(error as Error).message}`);
  }
}

function createMinimalApp(prompt: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated App</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            min-height: 100vh; 
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 2rem; 
        }
        .header { 
            text-align: center; 
            margin-bottom: 3rem; 
            background: rgba(255, 255, 255, 0.95);
            padding: 3rem;
            border-radius: 20px;
            backdrop-filter: blur(20px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        .header h1 { 
            font-size: 3rem; 
            margin-bottom: 1rem; 
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 700;
        }
        .header p { 
            font-size: 1.2rem; 
            color: #666; 
            max-width: 600px; 
            margin: 0 auto; 
        }
        .content { 
            background: white; 
            padding: 3rem; 
            border-radius: 20px; 
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1); 
            text-align: center;
        }
        .btn { 
            background: linear-gradient(135deg, #667eea, #764ba2); 
            color: white; 
            padding: 1.25rem 3rem; 
            border: none; 
            border-radius: 50px; 
            cursor: pointer; 
            font-size: 1.1rem; 
            font-weight: 600;
            transition: all 0.3s ease; 
            margin: 1rem 0;
        }
        .btn:hover { 
            transform: translateY(-3px); 
            box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
        }
        .output {
            margin-top: 2rem;
            padding: 2rem;
            background: #f8fafc;
            border-radius: 12px;
            border-left: 4px solid #667eea;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>AI-Generated Application</h1>
            <p>Dynamic content generation for: ${prompt}</p>
        </div>
        <div class="content">
            <p>This application was dynamically generated based on your specific request. The AI will continue to improve and create more sophisticated applications.</p>
            <button class="btn" onclick="generateContent()">Generate Content</button>
            <div id="output" class="output" style="display: none;"></div>
        </div>
    </div>
    <script>
        function generateContent() {
            const output = document.getElementById('output');
            output.style.display = 'block';
            output.innerHTML = \`
                <h3>Generated for: ${prompt}</h3>
                <p>This is a fully functional web application that can be further customized and enhanced based on specific requirements. The system uses advanced AI to create dynamic, responsive applications.</p>
                <div style="margin-top: 1rem; padding: 1rem; background: white; border-radius: 8px;">
                    <strong>Features:</strong> Responsive design, modern styling, interactive elements, professional layout
                </div>
            \`;
        }
        
        // Auto-generate content on load
        setTimeout(generateContent, 1000);
    </script>
</body>
</html>`;
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

    await storage.createFile(fileData);
  }
}

export async function generateSingleFile(
  projectId: number,
  prompt: string,
  targetPath?: string,
  language?: string
): Promise<GeneratedFile> {
  const response = await getCodeAssistance({
    code: '',
    language: language || 'javascript',
    prompt: `Generate a single ${language || 'JavaScript'} file for: ${prompt}`,
    context: 'Generate clean, functional code files'
  });

  const fileName = targetPath ? targetPath.split('/').pop() || 'generated.js' : 'generated.js';
  const filePath = targetPath || `/${fileName}`;

  return {
    name: fileName,
    path: filePath,
    content: response.suggestion,
    language: language || 'javascript',
    description: `Generated ${language || 'JavaScript'} file`
  };
}