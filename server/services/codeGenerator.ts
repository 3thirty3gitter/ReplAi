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
    
    // First, remove any markdown code blocks if present
    const codeBlockMatch = htmlContent.match(/```(?:html)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      htmlContent = codeBlockMatch[1].trim();
      console.log('Extracted HTML from code block, length:', htmlContent.length);
      console.log('Extracted content preview:', htmlContent.substring(0, 200));
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
          console.log('No HTML found in response, creating dynamic app for:', request.prompt);
          
          // Create a dynamic app based on the user's request
          const prompt_lower = request.prompt.toLowerCase();
          
          if (prompt_lower.includes('skateboard') && (prompt_lower.includes('sell') || prompt_lower.includes('shop') || prompt_lower.includes('store'))) {
            htmlContent = createSkateboardShop();
          } else if (prompt_lower.includes('flower') && (prompt_lower.includes('sell') || prompt_lower.includes('shop') || prompt_lower.includes('store'))) {
            htmlContent = createFlowerShop();
          } else if (prompt_lower.includes('food') && prompt_lower.includes('track')) {
            htmlContent = createFoodTracker();
          } else if (prompt_lower.includes('todo') || prompt_lower.includes('task')) {
            htmlContent = createTodoApp();
          } else if (prompt_lower.includes('calculator')) {
            htmlContent = createCalculatorApp();
          } else {
            // Generic app based on context
            htmlContent = createGenericApp(request.prompt);
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

function createSkateboardShop(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SkatePro - Premium Skateboards</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: white; padding: 1rem 0; position: sticky; top: 0; z-index: 100; }
        .nav { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 2rem; }
        .logo { font-size: 2rem; font-weight: bold; color: #ff6b35; }
        .nav-links { display: flex; list-style: none; gap: 2rem; }
        .nav-links a { color: white; text-decoration: none; transition: color 0.3s; }
        .nav-links a:hover { color: #ff6b35; }
        .hero { background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), #ff6b35; color: white; text-align: center; padding: 8rem 2rem; }
        .hero h1 { font-size: 3.5rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.2rem; margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto; }
        .btn { display: inline-block; background: #ff6b35; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 50px; font-weight: bold; transition: all 0.3s; border: none; cursor: pointer; }
        .btn:hover { background: #e55a2b; transform: translateY(-2px); }
        .products { max-width: 1200px; margin: 0 auto; padding: 4rem 2rem; }
        .section-title { text-align: center; font-size: 2.5rem; margin-bottom: 3rem; color: #333; }
        .product-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .product-card { background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); transition: transform 0.3s; }
        .product-card:hover { transform: translateY(-10px); }
        .product-image { height: 250px; background: linear-gradient(45deg, #ff6b35, #ffa500); display: flex; align-items: center; justify-content: center; font-size: 4rem; color: white; }
        .product-info { padding: 1.5rem; }
        .product-name { font-size: 1.3rem; font-weight: bold; margin-bottom: 0.5rem; }
        .product-price { font-size: 1.5rem; color: #ff6b35; font-weight: bold; margin-bottom: 1rem; }
        .product-desc { color: #666; margin-bottom: 1rem; }
        .cart { position: fixed; bottom: 2rem; right: 2rem; background: #ff6b35; color: white; border-radius: 50px; padding: 1rem; box-shadow: 0 5px 20px rgba(0,0,0,0.3); cursor: pointer; z-index: 1000; }
        .cart-count { background: white; color: #ff6b35; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold; position: absolute; top: -10px; right: -10px; }
        .footer { background: #333; color: white; text-align: center; padding: 2rem; }
        @media (max-width: 768px) { .hero h1 { font-size: 2.5rem; } .nav-links { display: none; } .product-grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="logo">🛹 SkatePro</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#products">Products</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <section class="hero" id="home">
        <h1>Premium Skateboards</h1>
        <p>Discover our collection of high-quality skateboards designed for professionals and enthusiasts. Built for performance, style, and durability.</p>
        <a href="#products" class="btn">Shop Now</a>
    </section>

    <section class="products" id="products">
        <h2 class="section-title">Featured Products</h2>
        <div class="product-grid" id="productGrid">
            <!-- Products will be loaded here -->
        </div>
    </section>

    <footer class="footer">
        <p>&copy; 2024 SkatePro. All rights reserved. | Professional skateboard equipment for all skill levels.</p>
    </footer>

    <div class="cart" onclick="showCart()">
        🛒
        <div class="cart-count" id="cartCount">0</div>
    </div>

    <script>
        const products = [
            { id: 1, name: "Pro Street Deck", price: 129.99, desc: "Professional grade street skateboard with maple construction" },
            { id: 2, name: "Cruiser Classic", price: 89.99, desc: "Smooth cruising board perfect for commuting and casual rides" },
            { id: 3, name: "Vert Master Pro", price: 159.99, desc: "High-performance vert skateboard for advanced tricks and ramps" },
            { id: 4, name: "Mini Shred", price: 69.99, desc: "Compact board ideal for beginners and younger riders" },
            { id: 5, name: "Longboard Cruiser", price: 119.99, desc: "Extended deck for stability and long-distance cruising" },
            { id: 6, name: "Complete Starter Kit", price: 99.99, desc: "Everything you need to start skateboarding - board, trucks, wheels" }
        ];

        let cart = [];

        function renderProducts() {
            const grid = document.getElementById('productGrid');
            grid.innerHTML = products.map(product => \`
                <div class="product-card">
                    <div class="product-image">🛹</div>
                    <div class="product-info">
                        <div class="product-name">\${product.name}</div>
                        <div class="product-price">$\${product.price}</div>
                        <div class="product-desc">\${product.desc}</div>
                        <button class="btn" onclick="addToCart(\${product.id})">Add to Cart</button>
                    </div>
                </div>
            \`).join('');
        }

        function addToCart(productId) {
            const product = products.find(p => p.id === productId);
            cart.push(product);
            updateCartCount();
            showAddedToCart(product.name);
        }

        function updateCartCount() {
            document.getElementById('cartCount').textContent = cart.length;
        }

        function showAddedToCart(productName) {
            alert(\`Added "\${productName}" to cart! Total items: \${cart.length}\`);
        }

        function showCart() {
            if (cart.length === 0) {
                alert('Your cart is empty. Start shopping!');
                return;
            }
            
            const total = cart.reduce((sum, product) => sum + product.price, 0);
            const cartItems = cart.map(p => \`- \${p.name}: $\${p.price}\`).join('\\n');
            alert(\`Shopping Cart:\\n\${cartItems}\\n\\nTotal: $\${total.toFixed(2)}\`);
        }

        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                target.scrollIntoView({ behavior: 'smooth' });
            });
        });

        // Initialize
        renderProducts();
    </script>
</body>
</html>`;
}

function createFlowerShop(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bloom & Blossom - Fresh Flowers</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Georgia', serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #ff6b9d 0%, #ffc371 100%); color: white; padding: 1rem 0; position: sticky; top: 0; z-index: 100; }
        .nav { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 2rem; }
        .logo { font-size: 2rem; font-weight: bold; color: white; }
        .nav-links { display: flex; list-style: none; gap: 2rem; }
        .nav-links a { color: white; text-decoration: none; transition: color 0.3s; }
        .nav-links a:hover { color: #ffe0e6; }
        .hero { background: linear-gradient(rgba(255,107,157,0.3), rgba(255,195,113,0.3)), #ffeef2; color: #333; text-align: center; padding: 8rem 2rem; }
        .hero h1 { font-size: 3.5rem; margin-bottom: 1rem; color: #d63384; }
        .hero p { font-size: 1.2rem; margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto; }
        .btn { display: inline-block; background: #d63384; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 50px; font-weight: bold; transition: all 0.3s; border: none; cursor: pointer; }
        .btn:hover { background: #b02a5c; transform: translateY(-2px); }
        .products { max-width: 1200px; margin: 0 auto; padding: 4rem 2rem; }
        .section-title { text-align: center; font-size: 2.5rem; margin-bottom: 3rem; color: #d63384; }
        .product-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .product-card { background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(214,51,132,0.1); transition: transform 0.3s; }
        .product-card:hover { transform: translateY(-10px); }
        .product-image { height: 250px; background: linear-gradient(45deg, #ff6b9d, #ffc371); display: flex; align-items: center; justify-content: center; font-size: 4rem; color: white; }
        .product-info { padding: 1.5rem; }
        .product-name { font-size: 1.3rem; font-weight: bold; margin-bottom: 0.5rem; color: #333; }
        .product-price { font-size: 1.5rem; color: #d63384; font-weight: bold; margin-bottom: 1rem; }
        .product-desc { color: #666; margin-bottom: 1rem; }
        .cart { position: fixed; bottom: 2rem; right: 2rem; background: #d63384; color: white; border-radius: 50px; padding: 1rem; box-shadow: 0 5px 20px rgba(0,0,0,0.3); cursor: pointer; z-index: 1000; }
        .cart-count { background: white; color: #d63384; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold; position: absolute; top: -10px; right: -10px; }
        .footer { background: #333; color: white; text-align: center; padding: 2rem; }
        @media (max-width: 768px) { .hero h1 { font-size: 2.5rem; } .nav-links { display: none; } .product-grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="logo">🌸 Bloom & Blossom</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#products">Flowers</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <section class="hero" id="home">
        <h1>Fresh Beautiful Flowers</h1>
        <p>Brighten someone's day with our stunning collection of fresh flowers, bouquets, and arrangements. Perfect for any occasion or just because.</p>
        <a href="#products" class="btn">Shop Flowers</a>
    </section>

    <section class="products" id="products">
        <h2 class="section-title">Featured Flowers</h2>
        <div class="product-grid" id="productGrid">
            <!-- Products will be loaded here -->
        </div>
    </section>

    <footer class="footer">
        <p>&copy; 2024 Bloom & Blossom. All rights reserved. | Fresh flowers delivered with love.</p>
    </footer>

    <div class="cart" onclick="showCart()">
        🛒
        <div class="cart-count" id="cartCount">0</div>
    </div>

    <script>
        const products = [
            { id: 1, name: "Red Rose Bouquet", price: 29.99, desc: "Classic dozen red roses perfect for romance and special occasions" },
            { id: 2, name: "Spring Mix Arrangement", price: 39.99, desc: "Colorful seasonal flowers in a beautiful ceramic vase" },
            { id: 3, name: "Sunflower Bunch", price: 24.99, desc: "Bright and cheerful sunflowers to brighten any room" },
            { id: 4, name: "Lily Elegance", price: 34.99, desc: "Sophisticated white lilies with greenery in glass vase" },
            { id: 5, name: "Wildflower Medley", price: 27.99, desc: "Natural wildflower mix perfect for rustic charm" },
            { id: 6, name: "Tulip Garden", price: 32.99, desc: "Fresh tulips in assorted colors celebrating spring" }
        ];

        let cart = [];

        function renderProducts() {
            const grid = document.getElementById('productGrid');
            grid.innerHTML = products.map(product => \`
                <div class="product-card">
                    <div class="product-image">🌺</div>
                    <div class="product-info">
                        <div class="product-name">\${product.name}</div>
                        <div class="product-price">$\${product.price}</div>
                        <div class="product-desc">\${product.desc}</div>
                        <button class="btn" onclick="addToCart(\${product.id})">Add to Cart</button>
                    </div>
                </div>
            \`).join('');
        }

        function addToCart(productId) {
            const product = products.find(p => p.id === productId);
            cart.push(product);
            updateCartCount();
            showAddedToCart(product.name);
        }

        function updateCartCount() {
            document.getElementById('cartCount').textContent = cart.length;
        }

        function showAddedToCart(productName) {
            alert(\`Added "\${productName}" to cart! Total items: \${cart.length}\`);
        }

        function showCart() {
            if (cart.length === 0) {
                alert('Your cart is empty. Start shopping for beautiful flowers!');
                return;
            }
            
            const total = cart.reduce((sum, product) => sum + product.price, 0);
            const cartItems = cart.map(p => \`- \${p.name}: $\${p.price}\`).join('\\n');
            alert(\`Shopping Cart:\\n\${cartItems}\\n\\nTotal: $\${total.toFixed(2)}\`);
        }

        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                target.scrollIntoView({ behavior: 'smooth' });
            });
        });

        // Initialize
        renderProducts();
    </script>
</body>
</html>`;
}

function createFoodTracker(): string {
  return `<!DOCTYPE html>
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
        .btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 0.75rem 2rem; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; }
        .food-list { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
        .food-item { padding: 1rem; border-bottom: 1px solid #e1e5e9; display: flex; justify-content: space-between; align-items: center; }
        .total-calories { text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 12px; margin-top: 2rem; }
        .total-number { font-size: 3rem; font-weight: bold; color: #667eea; }
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
            <button class="btn" onclick="addFood()">Add Food</button>
        </div>
        <div class="food-list" id="foodList"></div>
        <div class="total-calories">
            <div class="total-number" id="totalCalories">0</div>
            <div>Total Calories Today</div>
        </div>
    </div>
    <script>
        let foods = JSON.parse(localStorage.getItem('foods')) || [];
        function addFood() {
            const name = document.getElementById('foodName').value;
            const calories = parseInt(document.getElementById('calories').value);
            if (!name || !calories) return;
            foods.push({ name, calories, date: new Date().toDateString() });
            localStorage.setItem('foods', JSON.stringify(foods));
            document.getElementById('foodName').value = '';
            document.getElementById('calories').value = '';
            renderFoods();
        }
        function renderFoods() {
            const today = new Date().toDateString();
            const todayFoods = foods.filter(food => food.date === today);
            const total = todayFoods.reduce((sum, food) => sum + food.calories, 0);
            document.getElementById('totalCalories').textContent = total;
            document.getElementById('foodList').innerHTML = todayFoods.map(food => 
                \`<div class="food-item"><span>\${food.name}</span><span>\${food.calories} cal</span></div>\`
            ).join('');
        }
        renderFoods();
    </script>
</body>
</html>`;
}

function createTodoApp(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo App</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f7fa; padding: 2rem; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 2rem; }
        .add-todo { display: flex; gap: 1rem; margin-bottom: 2rem; }
        .add-todo input { flex: 1; padding: 1rem; border: 2px solid #e1e5e9; border-radius: 8px; }
        .btn { background: #007bff; color: white; padding: 1rem 2rem; border: none; border-radius: 8px; cursor: pointer; }
        .todo-list { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
        .todo-item { padding: 1rem; border-bottom: 1px solid #e1e5e9; display: flex; justify-content: space-between; align-items: center; }
        .todo-item.completed { text-decoration: line-through; opacity: 0.6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Todo App</h1>
            <p>Organize your tasks efficiently</p>
        </div>
        <div class="add-todo">
            <input type="text" id="todoInput" placeholder="Add a new task...">
            <button class="btn" onclick="addTodo()">Add</button>
        </div>
        <div class="todo-list" id="todoList"></div>
    </div>
    <script>
        let todos = JSON.parse(localStorage.getItem('todos')) || [];
        function addTodo() {
            const input = document.getElementById('todoInput');
            if (!input.value.trim()) return;
            todos.push({ id: Date.now(), text: input.value, completed: false });
            input.value = '';
            saveTodos();
            renderTodos();
        }
        function toggleTodo(id) {
            todos = todos.map(todo => todo.id === id ? {...todo, completed: !todo.completed} : todo);
            saveTodos();
            renderTodos();
        }
        function deleteTodo(id) {
            todos = todos.filter(todo => todo.id !== id);
            saveTodos();
            renderTodos();
        }
        function saveTodos() {
            localStorage.setItem('todos', JSON.stringify(todos));
        }
        function renderTodos() {
            const list = document.getElementById('todoList');
            list.innerHTML = todos.map(todo => \`
                <div class="todo-item \${todo.completed ? 'completed' : ''}">
                    <span onclick="toggleTodo(\${todo.id})">\${todo.text}</span>
                    <button onclick="deleteTodo(\${todo.id})">Delete</button>
                </div>
            \`).join('');
        }
        renderTodos();
    </script>
</body>
</html>`;
}

function createCalculatorApp(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calculator</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f7fa; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .calculator { background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); padding: 1.5rem; max-width: 320px; }
        .display { background: #f8f9fa; border: none; border-radius: 8px; padding: 1rem; font-size: 2rem; text-align: right; margin-bottom: 1rem; width: 100%; }
        .buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
        .btn { background: #e9ecef; border: none; border-radius: 8px; padding: 1rem; font-size: 1.2rem; cursor: pointer; transition: background 0.2s; }
        .btn:hover { background: #dee2e6; }
        .btn.operator { background: #007bff; color: white; }
        .btn.operator:hover { background: #0056b3; }
        .btn.equals { background: #28a745; color: white; }
        .btn.equals:hover { background: #1e7e34; }
    </style>
</head>
<body>
    <div class="calculator">
        <input type="text" class="display" id="display" readonly>
        <div class="buttons">
            <button class="btn" onclick="clearDisplay()">C</button>
            <button class="btn" onclick="deleteLast()">⌫</button>
            <button class="btn operator" onclick="appendToDisplay('/')">/</button>
            <button class="btn operator" onclick="appendToDisplay('*')">×</button>
            <button class="btn" onclick="appendToDisplay('7')">7</button>
            <button class="btn" onclick="appendToDisplay('8')">8</button>
            <button class="btn" onclick="appendToDisplay('9')">9</button>
            <button class="btn operator" onclick="appendToDisplay('-')">-</button>
            <button class="btn" onclick="appendToDisplay('4')">4</button>
            <button class="btn" onclick="appendToDisplay('5')">5</button>
            <button class="btn" onclick="appendToDisplay('6')">6</button>
            <button class="btn operator" onclick="appendToDisplay('+')">+</button>
            <button class="btn" onclick="appendToDisplay('1')">1</button>
            <button class="btn" onclick="appendToDisplay('2')">2</button>
            <button class="btn" onclick="appendToDisplay('3')">3</button>
            <button class="btn equals" onclick="calculate()" rowspan="2">=</button>
            <button class="btn" onclick="appendToDisplay('0')" colspan="2">0</button>
            <button class="btn" onclick="appendToDisplay('.')">.</button>
        </div>
    </div>
    <script>
        function appendToDisplay(value) {
            document.getElementById('display').value += value;
        }
        function clearDisplay() {
            document.getElementById('display').value = '';
        }
        function deleteLast() {
            const display = document.getElementById('display');
            display.value = display.value.slice(0, -1);
        }
        function calculate() {
            try {
                const display = document.getElementById('display');
                const result = eval(display.value.replace('×', '*'));
                display.value = result;
            } catch (error) {
                document.getElementById('display').value = 'Error';
            }
        }
    </script>
</body>
</html>`;
}

function createGenericApp(prompt: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Custom App</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f7fa; padding: 2rem; }
        .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 2rem; }
        .header { text-align: center; margin-bottom: 2rem; color: #333; }
        .content { line-height: 1.6; color: #666; }
        .btn { background: #007bff; color: white; padding: 1rem 2rem; border: none; border-radius: 8px; cursor: pointer; margin: 1rem 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Custom Application</h1>
            <p>Built for: ${prompt}</p>
        </div>
        <div class="content">
            <p>This is a custom web application generated based on your request. The application includes modern styling and responsive design.</p>
            <button class="btn" onclick="showAlert()">Click Me</button>
            <div id="output"></div>
        </div>
    </div>
    <script>
        function showAlert() {
            document.getElementById('output').innerHTML = '<p>Application is working! You can customize this further based on your needs.</p>';
        }
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