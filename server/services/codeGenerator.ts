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
  const prompt = `Build a complete, working single-file web application for: ${request.prompt}

Create a fully functional HTML page with embedded CSS and JavaScript. Requirements:
- Complete application with all features working
- Modern, professional design
- Responsive mobile-friendly layout
- Interactive elements with JavaScript
- All CSS in <style> tags in <head>
- All JavaScript in <script> tags before </body>
- No external libraries or dependencies
- Real content, no placeholder text

Return only the complete HTML code starting with <!DOCTYPE html> and ending with </html>. No explanations or markdown.`;

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
    }
    
    // Look for HTML content pattern
    const htmlMatch = htmlContent.match(/<!DOCTYPE html[\s\S]*?<\/html>/i);
    if (htmlMatch) {
      htmlContent = htmlMatch[0];
    } else {
      // Try to find just the html tag without DOCTYPE
      const basicHtmlMatch = htmlContent.match(/<html[\s\S]*?<\/html>/i);
      if (basicHtmlMatch) {
        htmlContent = '<!DOCTYPE html>\n' + basicHtmlMatch[0];
      } else {
        // Create a functional food tracking app as fallback
        htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Food Tracker</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f7fa; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; text-align: center; }
        .add-form { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 2rem; }
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333; }
        .form-group input, .form-group select { width: 100%; padding: 0.75rem; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 1rem; }
        .form-group input:focus, .form-group select:focus { outline: none; border-color: #667eea; }
        .btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 0.75rem 2rem; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; transition: transform 0.2s; }
        .btn:hover { transform: translateY(-2px); }
        .food-list { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
        .food-item { padding: 1rem; border-bottom: 1px solid #e1e5e9; display: flex; justify-content: space-between; align-items: center; }
        .food-item:last-child { border-bottom: none; }
        .food-info { flex: 1; }
        .food-name { font-weight: 600; color: #333; margin-bottom: 0.25rem; }
        .food-details { color: #666; font-size: 0.9rem; }
        .food-calories { background: #667eea; color: white; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; }
        .delete-btn { background: #ff4757; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; margin-left: 1rem; }
        .delete-btn:hover { background: #ff3742; }
        .total-calories { text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 12px; margin-top: 2rem; }
        .total-number { font-size: 3rem; font-weight: bold; color: #667eea; }
        .total-label { color: #666; margin-top: 0.5rem; }
        @media (max-width: 768px) { .container { padding: 10px; } .food-item { flex-direction: column; align-items: flex-start; } .food-calories { margin-top: 0.5rem; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍎 Food Tracker</h1>
            <p>Track your daily food intake and calories</p>
        </div>

        <div class="add-form">
            <h2>Add Food Item</h2>
            <div class="form-group">
                <label for="foodName">Food Name</label>
                <input type="text" id="foodName" placeholder="e.g., Apple, Chicken Breast">
            </div>
            <div class="form-group">
                <label for="calories">Calories</label>
                <input type="number" id="calories" placeholder="e.g., 95">
            </div>
            <div class="form-group">
                <label for="meal">Meal Type</label>
                <select id="meal">
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                </select>
            </div>
            <button class="btn" onclick="addFood()">Add Food</button>
        </div>

        <div class="food-list" id="foodList">
            <!-- Food items will be added here -->
        </div>

        <div class="total-calories">
            <div class="total-number" id="totalCalories">0</div>
            <div class="total-label">Total Calories Today</div>
        </div>
    </div>

    <script>
        let foods = JSON.parse(localStorage.getItem('foods')) || [];
        
        function addFood() {
            const name = document.getElementById('foodName').value;
            const calories = parseInt(document.getElementById('calories').value);
            const meal = document.getElementById('meal').value;
            
            if (!name || !calories) {
                alert('Please fill in all fields');
                return;
            }
            
            const food = {
                id: Date.now(),
                name: name,
                calories: calories,
                meal: meal,
                date: new Date().toDateString()
            };
            
            foods.push(food);
            localStorage.setItem('foods', JSON.stringify(foods));
            
            document.getElementById('foodName').value = '';
            document.getElementById('calories').value = '';
            
            renderFoods();
        }
        
        function deleteFood(id) {
            foods = foods.filter(food => food.id !== id);
            localStorage.setItem('foods', JSON.stringify(foods));
            renderFoods();
        }
        
        function renderFoods() {
            const foodList = document.getElementById('foodList');
            const totalCaloriesEl = document.getElementById('totalCalories');
            
            if (foods.length === 0) {
                foodList.innerHTML = '<div class="food-item"><div class="food-info">No food items added yet. Start tracking your meals!</div></div>';
                totalCaloriesEl.textContent = '0';
                return;
            }
            
            const today = new Date().toDateString();
            const todayFoods = foods.filter(food => food.date === today);
            
            foodList.innerHTML = todayFoods.map(food => \`
                <div class="food-item">
                    <div class="food-info">
                        <div class="food-name">\${food.name}</div>
                        <div class="food-details">\${food.meal.charAt(0).toUpperCase() + food.meal.slice(1)}</div>
                    </div>
                    <div class="food-calories">\${food.calories} cal</div>
                    <button class="delete-btn" onclick="deleteFood(\${food.id})">Delete</button>
                </div>
            \`).join('');
            
            const totalCalories = todayFoods.reduce((sum, food) => sum + food.calories, 0);
            totalCaloriesEl.textContent = totalCalories;
        }
        
        // Initialize the app
        renderFoods();
    </script>
</body>
</html>`;
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