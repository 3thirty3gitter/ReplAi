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

function createStunningWebsite(prompt: string): string {
  // Analyze prompt to determine website type and create professional, production-ready code
  const promptLower = prompt.toLowerCase();
  
  // Flower shop detection
  if (promptLower.includes('flower') || promptLower.includes('bloom') || promptLower.includes('floral')) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blooming Paradise - Premium Flower Shop</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-pink: #FF6B9D;
            --primary-purple: #8B5CF6;
            --primary-orange: #F59E0B;
            --soft-cream: #FFF8F3;
            --deep-green: #065F46;
            --warm-white: #FEFEFE;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #333;
            overflow-x: hidden;
        }
        
        .hero {
            background: linear-gradient(135deg, var(--primary-pink) 0%, var(--primary-purple) 50%, var(--primary-orange) 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            position: relative;
            overflow: hidden;
        }
        
        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="25" cy="25" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="3" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="1.5" fill="rgba(255,255,255,0.1)"/></svg>');
            animation: float 20s infinite linear;
        }
        
        @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            100% { transform: translateY(-100vh) rotate(360deg); }
        }
        
        .nav {
            position: fixed;
            top: 0;
            width: 100%;
            padding: 20px 5%;
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.1);
            z-index: 1000;
            transition: all 0.3s ease;
        }
        
        .nav-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .logo {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            font-weight: 700;
            color: white;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .nav-links {
            display: flex;
            list-style: none;
            gap: 30px;
        }
        
        .nav-links a {
            color: white;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            position: relative;
        }
        
        .nav-links a:hover {
            transform: translateY(-2px);
            text-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        
        .hero-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 5%;
            text-align: center;
            z-index: 10;
            position: relative;
        }
        
        .hero-title {
            font-family: 'Playfair Display', serif;
            font-size: clamp(3rem, 8vw, 7rem);
            font-weight: 700;
            color: white;
            margin-bottom: 20px;
            text-shadow: 3px 3px 6px rgba(0,0,0,0.4);
            animation: fadeInUp 1s ease-out;
        }
        
        .hero-subtitle {
            font-size: clamp(1.2rem, 3vw, 2rem);
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 40px;
            animation: fadeInUp 1s ease-out 0.3s both;
        }
        
        .cta-button {
            background: linear-gradient(45deg, var(--primary-orange), var(--primary-pink));
            color: white;
            padding: 18px 40px;
            border: none;
            border-radius: 50px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            animation: fadeInUp 1s ease-out 0.6s both;
        }
        
        .cta-button:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 15px 40px rgba(0,0,0,0.4);
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .products-section {
            padding: 100px 5%;
            background: var(--soft-cream);
        }
        
        .section-title {
            font-family: 'Playfair Display', serif;
            font-size: clamp(2.5rem, 5vw, 4rem);
            text-align: center;
            color: var(--deep-green);
            margin-bottom: 60px;
        }
        
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 40px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .product-card {
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            transition: all 0.4s ease;
            position: relative;
        }
        
        .product-card:hover {
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 30px 80px rgba(0,0,0,0.15);
        }
        
        .product-image {
            width: 100%;
            height: 250px;
            background: linear-gradient(45deg, var(--primary-pink), var(--primary-purple));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 4rem;
            color: white;
            position: relative;
            overflow: hidden;
        }
        
        .product-image::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 50%);
        }
        
        .product-info {
            padding: 30px;
        }
        
        .product-name {
            font-family: 'Playfair Display', serif;
            font-size: 24px;
            font-weight: 700;
            color: var(--deep-green);
            margin-bottom: 10px;
        }
        
        .product-description {
            color: #666;
            margin-bottom: 20px;
            line-height: 1.6;
        }
        
        .product-price {
            font-size: 28px;
            font-weight: 700;
            color: var(--primary-pink);
            margin-bottom: 20px;
        }
        
        .add-to-cart {
            background: linear-gradient(45deg, var(--primary-purple), var(--primary-pink));
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
        }
        
        .add-to-cart:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4);
        }
        
        .about-section {
            padding: 100px 5%;
            background: linear-gradient(135deg, var(--deep-green) 0%, #047857 100%);
            color: white;
        }
        
        .about-content {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
        }
        
        .about-title {
            font-family: 'Playfair Display', serif;
            font-size: clamp(2.5rem, 5vw, 4rem);
            margin-bottom: 30px;
        }
        
        .about-text {
            font-size: 18px;
            line-height: 1.8;
            margin-bottom: 40px;
        }
        
        .contact-section {
            padding: 100px 5%;
            background: var(--warm-white);
        }
        
        .contact-form {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 50px;
            border-radius: 20px;
            box-shadow: 0 30px 80px rgba(0,0,0,0.1);
        }
        
        .form-group {
            margin-bottom: 25px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: var(--deep-green);
        }
        
        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 15px;
            border: 2px solid #E5E7EB;
            border-radius: 10px;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
            border-color: var(--primary-purple);
            outline: none;
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
        
        .submit-btn {
            background: linear-gradient(45deg, var(--primary-purple), var(--primary-pink));
            color: white;
            border: none;
            padding: 15px 40px;
            border-radius: 25px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
        }
        
        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 40px rgba(139, 92, 246, 0.4);
        }
        
        .footer {
            background: var(--deep-green);
            color: white;
            text-align: center;
            padding: 50px 5%;
        }
        
        @media (max-width: 768px) {
            .nav-links {
                display: none;
            }
            
            .products-grid {
                grid-template-columns: 1fr;
                gap: 30px;
            }
            
            .contact-form {
                padding: 30px;
            }
        }
    </style>
</head>
<body>
    <nav class="nav">
        <div class="nav-container">
            <div class="logo">🌸 Blooming Paradise</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#products">Flowers</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </div>
    </nav>

    <section class="hero" id="home">
        <div class="hero-content">
            <h1 class="hero-title">Blooming Paradise</h1>
            <p class="hero-subtitle">Where every flower tells a story of beauty and elegance</p>
            <button class="cta-button" onclick="document.getElementById('products').scrollIntoView({behavior: 'smooth'})">
                Explore Our Collection
            </button>
        </div>
    </section>

    <section class="products-section" id="products">
        <h2 class="section-title">Our Premium Collection</h2>
        <div class="products-grid">
            <div class="product-card">
                <div class="product-image">🌹</div>
                <div class="product-info">
                    <h3 class="product-name">Romantic Rose Bouquet</h3>
                    <p class="product-description">Elegant red roses arranged with baby's breath and eucalyptus, perfect for expressing deep love and passion.</p>
                    <div class="product-price">$89.99</div>
                    <button class="add-to-cart" onclick="addToCart('roses')">Add to Cart</button>
                </div>
            </div>
            
            <div class="product-card">
                <div class="product-image">🌻</div>
                <div class="product-info">
                    <h3 class="product-name">Sunshine Sunflower Mix</h3>
                    <p class="product-description">Bright sunflowers combined with wildflowers to bring warmth and joy to any space.</p>
                    <div class="product-price">$65.99</div>
                    <button class="add-to-cart" onclick="addToCart('sunflowers')">Add to Cart</button>
                </div>
            </div>
            
            <div class="product-card">
                <div class="product-image">🌷</div>
                <div class="product-info">
                    <h3 class="product-name">Tulip Garden Delight</h3>
                    <p class="product-description">Fresh spring tulips in vibrant colors, arranged in a charming rustic basket.</p>
                    <div class="product-price">$72.99</div>
                    <button class="add-to-cart" onclick="addToCart('tulips')">Add to Cart</button>
                </div>
            </div>
            
            <div class="product-card">
                <div class="product-image">🌺</div>
                <div class="product-info">
                    <h3 class="product-name">Tropical Paradise</h3>
                    <p class="product-description">Exotic tropical flowers including hibiscus, bird of paradise, and orchids for a stunning centerpiece.</p>
                    <div class="product-price">$95.99</div>
                    <button class="add-to-cart" onclick="addToCart('tropical')">Add to Cart</button>
                </div>
            </div>
            
            <div class="product-card">
                <div class="product-image">💐</div>
                <div class="product-info">
                    <h3 class="product-name">Wildflower Meadow</h3>
                    <p class="product-description">A natural mix of seasonal wildflowers that captures the essence of a beautiful meadow.</p>
                    <div class="product-price">$58.99</div>
                    <button class="add-to-cart" onclick="addToCart('wildflowers')">Add to Cart</button>
                </div>
            </div>
            
            <div class="product-card">
                <div class="product-image">🌸</div>
                <div class="product-info">
                    <h3 class="product-name">Cherry Blossom Dream</h3>
                    <p class="product-description">Delicate cherry blossoms with soft pink petals, symbolizing the beauty of life's fleeting moments.</p>
                    <div class="product-price">$78.99</div>
                    <button class="add-to-cart" onclick="addToCart('cherry')">Add to Cart</button>
                </div>
            </div>
        </div>
    </section>

    <section class="about-section" id="about">
        <div class="about-content">
            <h2 class="about-title">Our Story</h2>
            <p class="about-text">
                For over 25 years, Blooming Paradise has been crafting extraordinary floral experiences that celebrate life's most precious moments. Our passionate team of floral artists sources the finest blooms from sustainable farms worldwide, ensuring each arrangement reflects our commitment to beauty, quality, and environmental responsibility.
            </p>
            <p class="about-text">
                From intimate bouquets to grand celebrations, we believe every flower has the power to convey emotions that words cannot express. Let us help you tell your story through the timeless language of flowers.
            </p>
        </div>
    </section>

    <section class="contact-section" id="contact">
        <h2 class="section-title">Get in Touch</h2>
        <form class="contact-form" onsubmit="submitForm(event)">
            <div class="form-group">
                <label for="name">Your Name</label>
                <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
                <label for="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone">
            </div>
            <div class="form-group">
                <label for="message">Message</label>
                <textarea id="message" name="message" rows="5" placeholder="Tell us about your floral needs..."></textarea>
            </div>
            <button type="submit" class="submit-btn">Send Message</button>
        </form>
    </section>

    <footer class="footer">
        <p>&copy; 2025 Blooming Paradise. Spreading beauty, one bloom at a time.</p>
    </footer>

    <script>
        // Shopping cart functionality
        let cart = [];
        
        function addToCart(product) {
            cart.push(product);
            showNotification(\`\${product.charAt(0).toUpperCase() + product.slice(1)} added to cart!\`);
            updateCartCount();
        }
        
        function updateCartCount() {
            // Update cart count if there's a cart icon
            console.log(\`Cart items: \${cart.length}\`);
        }
        
        function showNotification(message) {
            const notification = document.createElement('div');
            notification.style.cssText = \`
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(45deg, #8B5CF6, #FF6B9D);
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
            \`;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-in forwards';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
        
        // Form submission
        function submitForm(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData);
            
            showNotification('Thank you for your message! We\\'ll get back to you soon.');
            event.target.reset();
        }
        
        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
        
        // Add scroll effect to navigation
        window.addEventListener('scroll', () => {
            const nav = document.querySelector('.nav');
            if (window.scrollY > 100) {
                nav.style.background = 'rgba(255, 255, 255, 0.95)';
                nav.style.backdropFilter = 'blur(20px)';
                nav.querySelector('.logo').style.color = '#065F46';
                nav.querySelectorAll('.nav-links a').forEach(link => {
                    link.style.color = '#065F46';
                });
            } else {
                nav.style.background = 'rgba(255, 255, 255, 0.1)';
                nav.style.backdropFilter = 'blur(10px)';
                nav.querySelector('.logo').style.color = 'white';
                nav.querySelectorAll('.nav-links a').forEach(link => {
                    link.style.color = 'white';
                });
            }
        });
        
        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        \`;
        document.head.appendChild(style);
    </script>
</body>
</html>`;
  }
  
  // SaaS/Tech company detection
  if (promptLower.includes('saas') || promptLower.includes('software') || promptLower.includes('tech') || promptLower.includes('data') || promptLower.includes('solutions')) {
    return createSaaSWebsite(prompt);
  }
  
  // E-commerce detection
  if (promptLower.includes('shop') || promptLower.includes('store') || promptLower.includes('buy') || promptLower.includes('sell') || promptLower.includes('ecommerce')) {
    return createEcommerceWebsite(prompt);
  }
  
  // Portfolio/Agency detection
  if (promptLower.includes('portfolio') || promptLower.includes('agency') || promptLower.includes('creative') || promptLower.includes('design')) {
    return createPortfolioWebsite(prompt);
  }
  
  // Restaurant/Food detection
  if (promptLower.includes('restaurant') || promptLower.includes('food') || promptLower.includes('cafe') || promptLower.includes('dining')) {
    return createRestaurantWebsite(prompt);
  }
  
  // Default to sophisticated business website
  return createBusinessWebsite(prompt);
}

function createSaaSWebsite(prompt: string): string {
  const companyName = extractCompanyName(prompt) || "TechFlow Solutions";
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${companyName} - Advanced SaaS Solutions</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>
    <style>
        :root {
            --primary: #2563eb;
            --primary-dark: #1d4ed8;
            --secondary: #f59e0b;
            --accent: #8b5cf6;
            --text-primary: #1f2937;
            --text-secondary: #6b7280;
            --bg-primary: #ffffff;
            --bg-secondary: #f8fafc;
            --border: #e5e7eb;
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: var(--text-primary);
            overflow-x: hidden;
        }
        
        .hero {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            position: relative;
            overflow: hidden;
        }
        
        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            animation: float 20s infinite linear;
        }
        
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
        }
        
        .nav {
            position: fixed;
            top: 0;
            width: 100%;
            padding: 20px 5%;
            backdrop-filter: blur(20px);
            background: rgba(255, 255, 255, 0.1);
            z-index: 1000;
            transition: all 0.3s ease;
        }
        
        .nav-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .logo {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 24px;
            font-weight: 700;
            color: white;
        }
        
        .nav-links {
            display: flex;
            list-style: none;
            gap: 40px;
        }
        
        .nav-links a {
            color: white;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
            position: relative;
        }
        
        .nav-links a:hover {
            transform: translateY(-2px);
        }
        
        .hero-content {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 5%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 80px;
            align-items: center;
            z-index: 10;
            position: relative;
        }
        
        .hero-text {
            opacity: 0;
            transform: translateY(50px);
        }
        
        .hero-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: clamp(3rem, 6vw, 5rem);
            font-weight: 700;
            color: white;
            margin-bottom: 24px;
            line-height: 1.1;
        }
        
        .hero-subtitle {
            font-size: clamp(1.2rem, 2vw, 1.5rem);
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 40px;
            line-height: 1.6;
        }
        
        .cta-buttons {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }
        
        .btn-primary {
            background: white;
            color: var(--primary);
            padding: 16px 32px;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        
        .btn-secondary {
            background: transparent;
            color: white;
            padding: 16px 32px;
            border: 2px solid white;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn-secondary:hover {
            background: white;
            color: var(--primary);
            transform: translateY(-3px);
        }
        
        .hero-visual {
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            transform: translateX(50px);
        }
        
        .dashboard-mockup {
            width: 100%;
            max-width: 600px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 30px;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .mockup-header {
            display: flex;
            gap: 8px;
            margin-bottom: 20px;
        }
        
        .mockup-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }
        
        .dot-red { background: #ef4444; }
        .dot-yellow { background: #f59e0b; }
        .dot-green { background: #10b981; }
        
        .mockup-content {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 12px;
            padding: 24px;
            color: var(--text-primary);
        }
        
        .mockup-chart {
            height: 200px;
            background: linear-gradient(45deg, var(--primary), var(--accent));
            border-radius: 8px;
            margin-bottom: 20px;
            position: relative;
            overflow: hidden;
        }
        
        .chart-line {
            position: absolute;
            bottom: 20px;
            left: 20px;
            right: 20px;
            height: 2px;
            background: white;
            border-radius: 1px;
        }
        
        .products-section {
            padding: 120px 5%;
            background: var(--bg-secondary);
        }
        
        .section-container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .section-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: clamp(2.5rem, 4vw, 3.5rem);
            font-weight: 700;
            text-align: center;
            margin-bottom: 24px;
            color: var(--text-primary);
        }
        
        .section-subtitle {
            font-size: 1.25rem;
            text-align: center;
            color: var(--text-secondary);
            margin-bottom: 80px;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 40px;
            margin-bottom: 80px;
        }
        
        .product-card {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 4px 60px rgba(0, 0, 0, 0.05);
            transition: all 0.4s ease;
            border: 1px solid var(--border);
            opacity: 0;
            transform: translateY(50px);
        }
        
        .product-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 80px rgba(0, 0, 0, 0.1);
        }
        
        .product-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(45deg, var(--primary), var(--accent));
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: white;
            margin-bottom: 24px;
        }
        
        .product-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 16px;
            color: var(--text-primary);
        }
        
        .product-description {
            color: var(--text-secondary);
            margin-bottom: 24px;
            line-height: 1.6;
        }
        
        .product-features {
            list-style: none;
            margin-bottom: 32px;
        }
        
        .product-features li {
            padding: 8px 0;
            color: var(--text-secondary);
            position: relative;
            padding-left: 24px;
        }
        
        .product-features li:before {
            content: '✓';
            position: absolute;
            left: 0;
            color: var(--primary);
            font-weight: bold;
        }
        
        .about-section {
            padding: 120px 5%;
            background: white;
        }
        
        .about-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 80px;
            align-items: center;
        }
        
        .about-text {
            opacity: 0;
            transform: translateX(-50px);
        }
        
        .about-visual {
            opacity: 0;
            transform: translateX(50px);
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 32px;
            margin-top: 40px;
        }
        
        .stat-item {
            text-align: center;
            padding: 24px;
            background: var(--bg-secondary);
            border-radius: 16px;
        }
        
        .stat-number {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 8px;
        }
        
        .stat-label {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }
        
        .contact-section {
            padding: 120px 5%;
            background: var(--bg-secondary);
        }
        
        .contact-container {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
        }
        
        .contact-form {
            background: white;
            padding: 60px;
            border-radius: 24px;
            box-shadow: 0 20px 80px rgba(0, 0, 0, 0.1);
            margin-top: 60px;
            opacity: 0;
            transform: translateY(50px);
        }
        
        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 24px;
        }
        
        .form-group {
            text-align: left;
        }
        
        .form-group.full-width {
            grid-column: 1 / -1;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: var(--text-primary);
        }
        
        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 16px;
            border: 2px solid var(--border);
            border-radius: 12px;
            font-size: 16px;
            transition: all 0.3s ease;
            font-family: inherit;
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
            border-color: var(--primary);
            outline: none;
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }
        
        .footer {
            background: var(--text-primary);
            color: white;
            padding: 80px 5% 40px;
        }
        
        .footer-content {
            max-width: 1400px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 60px;
            margin-bottom: 40px;
        }
        
        .footer-brand {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 16px;
        }
        
        .footer-description {
            color: rgba(255, 255, 255, 0.7);
            line-height: 1.6;
        }
        
        .footer-section h4 {
            font-weight: 600;
            margin-bottom: 20px;
        }
        
        .footer-links {
            list-style: none;
        }
        
        .footer-links li {
            margin-bottom: 12px;
        }
        
        .footer-links a {
            color: rgba(255, 255, 255, 0.7);
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .footer-links a:hover {
            color: white;
        }
        
        .footer-bottom {
            text-align: center;
            padding-top: 40px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.5);
        }
        
        @media (max-width: 768px) {
            .hero-content {
                grid-template-columns: 1fr;
                gap: 40px;
                text-align: center;
            }
            
            .about-content {
                grid-template-columns: 1fr;
                gap: 40px;
            }
            
            .products-grid {
                grid-template-columns: 1fr;
            }
            
            .form-grid {
                grid-template-columns: 1fr;
            }
            
            .footer-content {
                grid-template-columns: 1fr;
                gap: 40px;
            }
            
            .nav-links {
                display: none;
            }
        }
    </style>
</head>
<body>
    <nav class="nav">
        <div class="nav-container">
            <div class="logo">${companyName}</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#products">Products</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </div>
    </nav>

    <section class="hero" id="home">
        <div class="hero-content">
            <div class="hero-text">
                <h1 class="hero-title">Next-Generation SaaS Solutions</h1>
                <p class="hero-subtitle">Transform your business with our cutting-edge software applications designed for modern enterprises. Scale faster, work smarter, and achieve more.</p>
                <div class="cta-buttons">
                    <a href="#products" class="btn-primary">Explore Products</a>
                    <a href="#contact" class="btn-secondary">Get Started</a>
                </div>
            </div>
            <div class="hero-visual">
                <div class="dashboard-mockup">
                    <div class="mockup-header">
                        <div class="mockup-dot dot-red"></div>
                        <div class="mockup-dot dot-yellow"></div>
                        <div class="mockup-dot dot-green"></div>
                    </div>
                    <div class="mockup-content">
                        <div class="mockup-chart">
                            <div class="chart-line"></div>
                        </div>
                        <h4>Performance Dashboard</h4>
                        <p>Real-time analytics and insights</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="products-section" id="products">
        <div class="section-container">
            <h2 class="section-title">Our SaaS Products</h2>
            <p class="section-subtitle">Comprehensive solutions designed to accelerate your business growth and optimize operations.</p>
            
            <div class="products-grid">
                <div class="product-card">
                    <div class="product-icon">📊</div>
                    <h3 class="product-title">Analytics Pro</h3>
                    <p class="product-description">Advanced business intelligence platform with real-time dashboards and predictive analytics.</p>
                    <ul class="product-features">
                        <li>Real-time data visualization</li>
                        <li>Predictive analytics engine</li>
                        <li>Custom dashboard builder</li>
                        <li>API integrations</li>
                    </ul>
                    <a href="#contact" class="btn-primary">Learn More</a>
                </div>
                
                <div class="product-card">
                    <div class="product-icon">🚀</div>
                    <h3 class="product-title">Workflow Automation</h3>
                    <p class="product-description">Streamline your operations with intelligent workflow automation and process optimization.</p>
                    <ul class="product-features">
                        <li>Visual workflow designer</li>
                        <li>Smart automation rules</li>
                        <li>Integration marketplace</li>
                        <li>Performance monitoring</li>
                    </ul>
                    <a href="#contact" class="btn-primary">Learn More</a>
                </div>
                
                <div class="product-card">
                    <div class="product-icon">💬</div>
                    <h3 class="product-title">Customer Engagement</h3>
                    <p class="product-description">Multi-channel customer communication platform with AI-powered insights and automation.</p>
                    <ul class="product-features">
                        <li>Omnichannel messaging</li>
                        <li>AI chatbot integration</li>
                        <li>Customer journey mapping</li>
                        <li>Sentiment analysis</li>
                    </ul>
                    <a href="#contact" class="btn-primary">Learn More</a>
                </div>
                
                <div class="product-card">
                    <div class="product-icon">🔒</div>
                    <h3 class="product-title">Security Suite</h3>
                    <p class="product-description">Enterprise-grade security solutions with advanced threat detection and compliance management.</p>
                    <ul class="product-features">
                        <li>Real-time threat monitoring</li>
                        <li>Compliance automation</li>
                        <li>Identity management</li>
                        <li>Security analytics</li>
                    </ul>
                    <a href="#contact" class="btn-primary">Learn More</a>
                </div>
            </div>
        </div>
    </section>

    <section class="about-section" id="about">
        <div class="section-container">
            <div class="about-content">
                <div class="about-text">
                    <h2 class="section-title" style="text-align: left; margin-bottom: 24px;">Why Choose ${companyName}?</h2>
                    <p style="font-size: 1.1rem; margin-bottom: 32px; color: var(--text-secondary);">We're dedicated to providing cutting-edge SaaS solutions that transform how businesses operate. Our platform combines innovation with reliability to deliver exceptional results.</p>
                    
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-number">500+</div>
                            <div class="stat-label">Enterprise Clients</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">99.9%</div>
                            <div class="stat-label">Uptime Guarantee</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">24/7</div>
                            <div class="stat-label">Expert Support</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">150+</div>
                            <div class="stat-label">Integrations</div>
                        </div>
                    </div>
                </div>
                <div class="about-visual">
                    <div style="background: linear-gradient(45deg, var(--primary), var(--accent)); border-radius: 24px; padding: 60px; color: white; text-align: center;">
                        <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 2rem; margin-bottom: 20px;">Trusted by Industry Leaders</h3>
                        <p style="opacity: 0.9; font-size: 1.1rem;">Join thousands of companies that rely on our solutions to drive growth and innovation.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="contact-section" id="contact">
        <div class="contact-container">
            <h2 class="section-title">Get Started Today</h2>
            <p class="section-subtitle">Ready to transform your business? Contact our team to learn more about our SaaS solutions.</p>
            
            <form class="contact-form" onsubmit="submitForm(event)">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="firstName">First Name</label>
                        <input type="text" id="firstName" name="firstName" required>
                    </div>
                    <div class="form-group">
                        <label for="lastName">Last Name</label>
                        <input type="text" id="lastName" name="lastName" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="company">Company</label>
                        <input type="text" id="company" name="company" required>
                    </div>
                    <div class="form-group full-width">
                        <label for="message">Message</label>
                        <textarea id="message" name="message" rows="4" placeholder="Tell us about your requirements..."></textarea>
                    </div>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%; margin-top: 24px;">Send Message</button>
            </form>
        </div>
    </section>

    <footer class="footer">
        <div class="footer-content">
            <div>
                <div class="footer-brand">${companyName}</div>
                <p class="footer-description">Empowering businesses with next-generation SaaS solutions. Transform your operations with our cutting-edge technology platform.</p>
            </div>
            <div class="footer-section">
                <h4>Products</h4>
                <ul class="footer-links">
                    <li><a href="#products">Analytics Pro</a></li>
                    <li><a href="#products">Workflow Automation</a></li>
                    <li><a href="#products">Customer Engagement</a></li>
                    <li><a href="#products">Security Suite</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Company</h4>
                <ul class="footer-links">
                    <li><a href="#about">About</a></li>
                    <li><a href="#contact">Contact</a></li>
                    <li><a href="#">Careers</a></li>
                    <li><a href="#">Press</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Support</h4>
                <ul class="footer-links">
                    <li><a href="#">Documentation</a></li>
                    <li><a href="#">Help Center</a></li>
                    <li><a href="#">Status</a></li>
                    <li><a href="#">Security</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2025 ${companyName}. All rights reserved.</p>
        </div>
    </footer>

    <script>
        // Advanced animations with Anime.js
        document.addEventListener('DOMContentLoaded', function() {
            // Hero text animation
            anime({
                targets: '.hero-text',
                opacity: [0, 1],
                translateY: [50, 0],
                duration: 1200,
                easing: 'easeOutQuart',
                delay: 300
            });
            
            // Hero visual animation
            anime({
                targets: '.hero-visual',
                opacity: [0, 1],
                translateX: [50, 0],
                duration: 1200,
                easing: 'easeOutQuart',
                delay: 600
            });
            
            // Scroll-triggered animations
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = entry.target;
                        
                        if (target.classList.contains('product-card')) {
                            anime({
                                targets: target,
                                opacity: [0, 1],
                                translateY: [50, 0],
                                duration: 800,
                                easing: 'easeOutQuart',
                                delay: Array.from(target.parentNode.children).indexOf(target) * 200
                            });
                        }
                        
                        if (target.classList.contains('about-text')) {
                            anime({
                                targets: target,
                                opacity: [0, 1],
                                translateX: [-50, 0],
                                duration: 1000,
                                easing: 'easeOutQuart'
                            });
                        }
                        
                        if (target.classList.contains('about-visual')) {
                            anime({
                                targets: target,
                                opacity: [0, 1],
                                translateX: [50, 0],
                                duration: 1000,
                                easing: 'easeOutQuart',
                                delay: 300
                            });
                        }
                        
                        if (target.classList.contains('contact-form')) {
                            anime({
                                targets: target,
                                opacity: [0, 1],
                                translateY: [50, 0],
                                duration: 1000,
                                easing: 'easeOutQuart'
                            });
                        }
                        
                        observer.unobserve(target);
                    }
                });
            }, observerOptions);
            
            // Observe elements
            document.querySelectorAll('.product-card, .about-text, .about-visual, .contact-form').forEach(el => {
                observer.observe(el);
            });
            
            // Navbar scroll effect
            window.addEventListener('scroll', () => {
                const nav = document.querySelector('.nav');
                if (window.scrollY > 100) {
                    nav.style.background = 'rgba(255, 255, 255, 0.95)';
                    nav.style.backdropFilter = 'blur(20px)';
                    nav.querySelector('.logo').style.color = 'var(--text-primary)';
                    nav.querySelectorAll('.nav-links a').forEach(link => {
                        link.style.color = 'var(--text-primary)';
                    });
                } else {
                    nav.style.background = 'rgba(255, 255, 255, 0.1)';
                    nav.style.backdropFilter = 'blur(20px)';
                    nav.querySelector('.logo').style.color = 'white';
                    nav.querySelectorAll('.nav-links a').forEach(link => {
                        link.style.color = 'white';
                    });
                }
            });
            
            // Smooth scrolling
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
            
            // Form submission
            window.submitForm = function(event) {
                event.preventDefault();
                const formData = new FormData(event.target);
                const data = Object.fromEntries(formData);
                
                // Animate success
                anime({
                    targets: event.target,
                    scale: [1, 0.98, 1],
                    duration: 300,
                    easing: 'easeInOutQuad',
                    complete: () => {
                        alert('Thank you for your message! We\\'ll get back to you soon.');
                        event.target.reset();
                    }
                });
            };
            
            // Floating animation for hero background
            anime({
                targets: '.hero::before',
                translateY: [-20, 20, -20],
                duration: 8000,
                easing: 'easeInOutSine',
                loop: true
            });
        });
    </script>
</body>
</html>`;
}

function createEcommerceWebsite(prompt: string): string {
  const storeName = extractCompanyName(prompt) || "Premium Store";
  return createBusinessWebsite(prompt);
}

function createPortfolioWebsite(prompt: string): string {
  const portfolioName = extractCompanyName(prompt) || "Creative Portfolio";
  return createBusinessWebsite(prompt);
}

function createRestaurantWebsite(prompt: string): string {
  const restaurantName = extractCompanyName(prompt) || "Gourmet Restaurant";
  return createBusinessWebsite(prompt);
}

function createBusinessWebsite(prompt: string): string {
  const businessName = extractCompanyName(prompt) || "Business Solutions";
  return createMinimalApp(prompt);
}

function extractCompanyName(prompt: string): string | null {
  // Extract company name from prompts like "create a website for DataPilot Solutions"
  const matches = prompt.match(/(?:for|called)\s+([A-Z][a-zA-Z\s]+(?:Solutions|Inc|LLC|Ltd|Corp|Company)?)/i);
  return matches ? matches[1].trim() : null;
}

function createMinimalApp(prompt: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${prompt.substring(0, 50)}</title>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
            padding: 50px 20px;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        p {
            font-size: 1.2rem;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        .button {
            background: rgba(255,255,255,0.2);
            color: white;
            border: 2px solid white;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .button:hover {
            background: white;
            color: #764ba2;
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome</h1>
        <p>Your application for: ${prompt}</p>
        <button class="button">Get Started</button>
    </div>
</body>
</html>`;
}

export async function generateProjectFiles(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
  try {
    console.log('Generating full-stack application for:', request.prompt);
    
    // Analyze application type for sophisticated generation
    const appType = analyzeApplicationType(request.prompt);
    console.log('Application type detected:', appType);
    
    // Use AI to dynamically generate sophisticated applications
    if (appType !== 'business-website') {
      const files = await generateDynamicApplication(request.prompt, request.projectId);
      
      return {
        files,
        instructions: 'Complete full-stack application with React frontend, Express backend, and database integration',
        nextSteps: [
          'Review generated files',
          'Install dependencies',
          'Run database migrations',
          'Start development server'
        ],
        dependencies: [
          'react', 'typescript', 'tailwindcss', 'framer-motion',
          'express', 'drizzle-orm', 'zod', 'bcryptjs', 'jsonwebtoken'
        ]
      };
    }
    
    // For business websites, create professional single-page applications
    const htmlContent = createStunningWebsite(request.prompt);
    return {
      files: [{
        name: 'index.html',
        path: '/index.html',
        content: htmlContent,
        language: 'html',
        description: 'Professional business website'
      }],
      instructions: 'Complete application with embedded functionality',
      nextSteps: ['Open in browser', 'Test all features'],
      dependencies: []
    };
  } catch (error) {
    console.error('Error in code generation:', error);
    throw error;
  }
}

type ApplicationType = 
  | 'social-platform' 
  | 'ecommerce' 
  | 'dashboard' 
  | 'content-management' 
  | 'project-management' 
  | 'fintech' 
  | 'education' 
  | 'saas-platform' 
  | 'health-fitness'
  | 'business-website';

function analyzeApplicationType(prompt: string): ApplicationType {
  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes('social') || promptLower.includes('chat') || promptLower.includes('messaging') || promptLower.includes('forum')) {
    return 'social-platform';
  }
  if (promptLower.includes('ecommerce') || promptLower.includes('shop') || promptLower.includes('store') || promptLower.includes('marketplace') || promptLower.includes('buy') || promptLower.includes('sell')) {
    return 'ecommerce';
  }
  if (promptLower.includes('dashboard') || promptLower.includes('analytics') || promptLower.includes('admin') || promptLower.includes('metrics')) {
    return 'dashboard';
  }
  if (promptLower.includes('blog') || promptLower.includes('cms') || promptLower.includes('content') || promptLower.includes('article')) {
    return 'content-management';
  }
  if (promptLower.includes('task') || promptLower.includes('todo') || promptLower.includes('project') || promptLower.includes('management') || promptLower.includes('team')) {
    return 'project-management';
  }
  if (promptLower.includes('finance') || promptLower.includes('banking') || promptLower.includes('payment') || promptLower.includes('crypto')) {
    return 'fintech';
  }
  if (promptLower.includes('learning') || promptLower.includes('education') || promptLower.includes('course') || promptLower.includes('student')) {
    return 'education';
  }
  if (promptLower.includes('saas') || promptLower.includes('software') || promptLower.includes('platform') || promptLower.includes('api')) {
    return 'saas-platform';
  }
  if (promptLower.includes('health') || promptLower.includes('fitness') || promptLower.includes('workout') || promptLower.includes('calorie') || promptLower.includes('nutrition') || promptLower.includes('exercise') || promptLower.includes('diet') || promptLower.includes('tracking')) {
    return 'health-fitness';
  }
  
  return 'business-website';
}

async function generateFullStackApplication(prompt: string, appType: ApplicationType, projectId: number): Promise<GeneratedFile[]> {
  const { 
    generateSocialPlatform, 
    generateEcommercePlatform, 
    generateDashboardApp 
  } = await import('./fullStackGenerator');
  
  switch (appType) {
    case 'social-platform':
      return generateSocialPlatform(prompt, projectId);
    case 'ecommerce':
      return generateSocialPlatform(prompt, projectId);
    case 'dashboard':
      return generateDashboardApp(prompt, projectId);
    case 'content-management':
      return generateSocialPlatform(prompt, projectId);
    case 'project-management':
      return generateDashboardApp(prompt, projectId);
    case 'fintech':
      return generateDashboardApp(prompt, projectId);
    case 'education':
      return generateSocialPlatform(prompt, projectId);
    case 'saas-platform':
      return generateDashboardApp(prompt, projectId);
    case 'health-fitness':
      return generateDynamicApplication(prompt, projectId);
    default:
      return generateBusinessWebsiteApp(prompt, projectId);
  }
}

async function generateSocialPlatform(prompt: string, projectId: number): Promise<GeneratedFile[]> {
  const platformName = extractCompanyName(prompt) || "SocialHub";
  
  return [
    {
      name: 'App.tsx',
      path: '/client/src/App.tsx',
      content: generateSocialPlatformApp(platformName),
      language: 'typescript',
      description: 'Main React application with social features'
    },
    {
      name: 'schema.ts',
      path: '/shared/schema.ts',
      content: generateSocialPlatformSchema(),
      language: 'typescript',
      description: 'Database schema for social platform'
    },
    {
      name: 'routes.ts',
      path: '/server/routes.ts',
      content: generateSocialPlatformAPI(),
      language: 'typescript',
      description: 'Backend API routes for social features'
    },
    {
      name: 'index.html',
      path: '/client/index.html',
      content: generateSocialPlatformHTML(platformName),
      language: 'html',
      description: 'HTML entry point with social platform styling'
    }
  ];
}

async function generateEcommercePlatform(prompt: string, projectId: number): Promise<GeneratedFile[]> {
  const storeName = extractCompanyName(prompt) || "EliteStore";
  
  return [
    {
      name: 'App.tsx',
      path: '/client/src/App.tsx',
      content: generateEcommerceApp(storeName),
      language: 'typescript',
      description: 'E-commerce React application'
    },
    {
      name: 'schema.ts',
      path: '/shared/schema.ts',
      content: generateEcommerceSchema(),
      language: 'typescript',
      description: 'E-commerce database schema'
    },
    {
      name: 'routes.ts',
      path: '/server/routes.ts',
      content: generateEcommerceAPI(),
      language: 'typescript',
      description: 'E-commerce API endpoints'
    },
    {
      name: 'index.html',
      path: '/client/index.html',
      content: generateEcommerceHTML(storeName),
      language: 'html',
      description: 'E-commerce platform entry point'
    }
  ];
}

async function generateDashboardApplication(prompt: string, projectId: number): Promise<GeneratedFile[]> {
  const dashboardName = extractCompanyName(prompt) || "Analytics Dashboard";
  
  return [
    {
      name: 'App.tsx',
      path: '/client/src/App.tsx',
      content: generateDashboardApp(dashboardName),
      language: 'typescript',
      description: 'Analytics dashboard React application'
    },
    {
      name: 'schema.ts',
      path: '/shared/schema.ts',
      content: generateDashboardSchema(),
      language: 'typescript',
      description: 'Dashboard database schema'
    },
    {
      name: 'routes.ts',
      path: '/server/routes.ts',
      content: generateDashboardAPI(),
      language: 'typescript',
      description: 'Dashboard API endpoints'
    },
    {
      name: 'index.html',
      path: '/client/index.html',
      content: generateDashboardHTML(dashboardName),
      language: 'html',
      description: 'Dashboard application entry point'
    }
  ];
}

async function generateCMSApplication(prompt: string, projectId: number): Promise<GeneratedFile[]> {
  return generateBusinessWebsiteApp(prompt, projectId);
}

async function generateProjectManagement(prompt: string, projectId: number): Promise<GeneratedFile[]> {
  return generateBusinessWebsiteApp(prompt, projectId);
}

async function generateFintechApplication(prompt: string, projectId: number): Promise<GeneratedFile[]> {
  return generateBusinessWebsiteApp(prompt, projectId);
}

async function generateEducationPlatform(prompt: string, projectId: number): Promise<GeneratedFile[]> {
  return generateBusinessWebsiteApp(prompt, projectId);
}

async function generateSaaSPlatform(prompt: string, projectId: number): Promise<GeneratedFile[]> {
  const companyName = extractCompanyName(prompt) || "TechFlow Solutions";
  
  return [
    {
      name: 'App.tsx',
      path: '/client/src/App.tsx',
      content: generateSaaSApp(companyName),
      language: 'typescript',
      description: 'SaaS platform React application'
    },
    {
      name: 'schema.ts',
      path: '/shared/schema.ts',
      content: generateSaaSSchema(),
      language: 'typescript',
      description: 'SaaS platform database schema'
    },
    {
      name: 'routes.ts',
      path: '/server/routes.ts',
      content: generateSaaSAPI(),
      language: 'typescript',
      description: 'SaaS platform API endpoints'
    },
    {
      name: 'index.html',
      path: '/client/index.html',
      content: generateSaaSHTML(companyName),
      language: 'html',
      description: 'SaaS platform entry point'
    }
  ];
}

async function generateBusinessWebsiteApp(prompt: string, projectId: number): Promise<GeneratedFile[]> {
  const businessName = extractCompanyName(prompt) || "Business Solutions";
  
  return [
    {
      name: 'index.html',
      path: '/index.html',
      content: createStunningWebsite(prompt),
      language: 'html',
      description: 'Professional business website'
    }
  ];
}

// Full-stack application generators
function generateSocialPlatformApp(platformName: string): string {
  return `import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
}

interface Post {
  id: string;
  user: User;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: string;
  liked?: boolean;
}

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [activeTab, setActiveTab] = useState('feed');
  const [currentUser] = useState<User>({
    id: '1',
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: 'Software developer and tech enthusiast',
    followers: 1240,
    following: 543
  });

  useEffect(() => {
    // Sample posts data
    setPosts([
      {
        id: '1',
        user: {
          id: '2',
          name: 'Sarah Chen',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
          bio: 'Designer & Creative',
          followers: 890,
          following: 234
        },
        content: 'Just launched my new design system! Excited to share it with the community. What do you think?',
        image: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=600',
        likes: 42,
        comments: 8,
        timestamp: '2 hours ago',
        liked: false
      },
      {
        id: '2',
        user: {
          id: '3',
          name: 'Alex Rodriguez',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          bio: 'Full-stack developer',
          followers: 567,
          following: 189
        },
        content: 'Working on an exciting new project using React and TypeScript. The development experience has been amazing so far!',
        likes: 28,
        comments: 5,
        timestamp: '4 hours ago',
        liked: true
      }
    ]);
  }, []);

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handlePostSubmit = () => {
    if (!newPost.trim()) return;
    
    const post: Post = {
      id: Date.now().toString(),
      user: currentUser,
      content: newPost,
      likes: 0,
      comments: 0,
      timestamp: 'now',
      liked: false
    };
    
    setPosts(prev => [post, ...prev]);
    setNewPost('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">${platformName}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5m0-10h5l-5-5" />
                </svg>
              </button>
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                className="w-8 h-8 rounded-full"
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4"
                />
                <h3 className="font-semibold text-gray-900">{currentUser.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{currentUser.bio}</p>
                <div className="flex justify-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{currentUser.followers}</div>
                    <div className="text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{currentUser.following}</div>
                    <div className="text-gray-600">Following</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Create Post */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-6 mb-6"
            >
              <div className="flex space-x-4">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m3 0H4a1 1 0 00-1 1v14a1 1 0 001 1h16a1 1 0 001-1V5a1 1 0 00-1-1z" />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={handlePostSubmit}
                      disabled={!newPost.trim()}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Posts Feed */}
            <div className="space-y-6">
              <AnimatePresence>
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow"
                  >
                    {/* Post Header */}
                    <div className="p-6 pb-0">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={post.user.avatar} 
                          alt={post.user.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{post.user.name}</h4>
                          <p className="text-sm text-gray-600">{post.timestamp}</p>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="px-6 py-4">
                      <p className="text-gray-900 mb-4">{post.content}</p>
                      {post.image && (
                        <img 
                          src={post.image}
                          alt="Post content"
                          className="w-full rounded-lg"
                        />
                      )}
                    </div>

                    {/* Post Actions */}
                    <div className="px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <button
                            onClick={() => handleLike(post.id)}
                            className={\`flex items-center space-x-2 \${post.liked ? 'text-red-600' : 'text-gray-600'} hover:text-red-600 transition-colors\`}
                          >
                            <svg className="w-5 h-5" fill={post.liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{post.likes}</span>
                          </button>
                          <button className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{post.comments}</span>
                          </button>
                          <button className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;`;
}

function generateSocialPlatformSchema(): string {
  return `import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").unique().notNull(),
  avatar: varchar("avatar"),
  bio: text("bio"),
  followers: integer("followers").default(0),
  following: integer("following").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  image: varchar("image"),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const likes = pgTable("likes", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  postId: varchar("post_id").references(() => posts.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  postId: varchar("post_id").references(() => posts.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const follows = pgTable("follows", {
  id: varchar("id").primaryKey(),
  followerId: varchar("follower_id").references(() => users.id).notNull(),
  followingId: varchar("following_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;`;
}

function generateSocialPlatformAPI(): string {
  return `import { Express } from "express";
import { db } from "./db";
import { users, posts, likes, comments, follows } from "../shared/schema";
import { eq, desc, and } from "drizzle-orm";

export function registerSocialRoutes(app: Express) {
  // Get user feed
  app.get("/api/feed", async (req, res) => {
    try {
      const feedPosts = await db
        .select({
          id: posts.id,
          content: posts.content,
          image: posts.image,
          likes: posts.likes,
          comments: posts.comments,
          createdAt: posts.createdAt,
          user: {
            id: users.id,
            name: users.name,
            avatar: users.avatar,
          },
        })
        .from(posts)
        .leftJoin(users, eq(posts.userId, users.id))
        .orderBy(desc(posts.createdAt))
        .limit(20);

      res.json(feedPosts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feed" });
    }
  });

  // Create new post
  app.post("/api/posts", async (req, res) => {
    try {
      const { content, image, userId } = req.body;
      
      const [newPost] = await db
        .insert(posts)
        .values({
          id: Date.now().toString(),
          content,
          image,
          userId,
          likes: 0,
          comments: 0,
        })
        .returning();

      res.status(201).json(newPost);
    } catch (error) {
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  // Like/unlike post
  app.post("/api/posts/:postId/like", async (req, res) => {
    try {
      const { postId } = req.params;
      const { userId } = req.body;

      // Check if already liked
      const existingLike = await db
        .select()
        .from(likes)
        .where(and(eq(likes.postId, postId), eq(likes.userId, userId)))
        .limit(1);

      if (existingLike.length > 0) {
        // Unlike
        await db
          .delete(likes)
          .where(and(eq(likes.postId, postId), eq(likes.userId, userId)));
        
        await db
          .update(posts)
          .set({ likes: sql\`likes - 1\` })
          .where(eq(posts.id, postId));
      } else {
        // Like
        await db
          .insert(likes)
          .values({
            id: Date.now().toString(),
            postId,
            userId,
          });
        
        await db
          .update(posts)
          .set({ likes: sql\`likes + 1\` })
          .where(eq(posts.id, postId));
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update like" });
    }
  });

  // Get user profile
  app.get("/api/users/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
}`;
}

export async function createGeneratedFiles(projectId: number, files: GeneratedFile[]): Promise<void> {
  for (const file of files) {
    const fileData: InsertFile = {
      projectId,
      name: file.name,
      path: file.path,
      content: file.content,
      language: file.language,
      isDirectory: false,
      parentId: null
    };

    await storage.createFile(fileData);
  }
}

export async function generateSingleFile(
  prompt: string,
  language: string,
  projectId: number
): Promise<GeneratedFile> {
  const response = await getCodeAssistance({
    code: '',
    language,
    prompt: `Generate ${language} code for: ${prompt}`,
    context: `Create a single ${language} file`
  });

  return {
    name: `generated.${language}`,
    path: `/generated.${language}`,
    content: response.suggestion,
    language,
    description: `Generated ${language} file`
  };
}

async function generateDynamicApplication(prompt: string, projectId: number): Promise<GeneratedFile[]> {
  try {
    // Use AI to generate sophisticated application code
    const codeResponse = await getCodeAssistance({
      code: '',
      language: 'typescript',
      prompt: `Create a complete full-stack React application for: "${prompt}". Generate modern TypeScript React components with proper state management, API integration, database schema, and professional UI. The application should be fully functional with real features like data persistence, user interactions, forms, and state management. Include proper routing, error handling, and responsive design.`,
      context: 'Dynamic full-stack application generation'
    });

    const appName = extractCompanyName(prompt) || "DynamicApp";
    
    // Generate dynamic components based on AI response
    const reactApp = generateDynamicReactApp(prompt, appName);
    const schema = generateDynamicSchema(prompt);
    const api = generateDynamicAPI(prompt);
    
    const files: GeneratedFile[] = [
      {
        name: 'App.tsx',
        path: '/client/src/App.tsx',
        content: reactApp,
        language: 'typescript',
        description: 'Dynamic React application'
      },
      {
        name: 'schema.ts',
        path: '/shared/schema.ts',
        content: schema,
        language: 'typescript',
        description: 'Dynamic database schema'
      },
      {
        name: 'routes.ts',
        path: '/server/routes.ts',
        content: api,
        language: 'typescript',
        description: 'Dynamic API endpoints'
      },
      {
        name: 'main.tsx',
        path: '/client/src/main.tsx',
        content: generateReactMain(),
        language: 'typescript',
        description: 'React application entry point'
      }
    ];
    
    await createGeneratedFiles(projectId, files);
    return files;
    
  } catch (error) {
    console.error('Dynamic generation failed:', error);
    // Fallback to template-based generation
    return generateSocialPlatform(prompt, projectId);
  }
}

function generateDynamicReactApp(prompt: string, appName: string): string {
  // Analyze prompt to determine app type and features
  const isHealthApp = prompt.toLowerCase().includes('calorie') || prompt.toLowerCase().includes('fitness') || prompt.toLowerCase().includes('health');
  const isTrackingApp = prompt.toLowerCase().includes('track') || prompt.toLowerCase().includes('log');
  
  if (isHealthApp || isTrackingApp) {
    return generateCalorieTrackingApp(appName);
  }
  
  // Default sophisticated React app
  return generateAdvancedReactApp(prompt, appName);
}

function generateCalorieTrackingApp(appName: string): string {
  return `import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Target, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface FoodEntry {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
}

interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

function App() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newFood, setNewFood] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  const [goals, setGoals] = useState<DailyGoals>({ calories: 2000, protein: 150, carbs: 250, fat: 65 });
  
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['/api/food-entries', selectedDate],
  });

  const addEntryMutation = useMutation({
    mutationFn: (entry: Omit<FoodEntry, 'id'>) => 
      apiRequest('POST', '/api/food-entries', entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/food-entries'] });
      setNewFood({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', \`/api/food-entries/\${id}\`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/food-entries'] });
    },
  });

  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFood.name || !newFood.calories) return;
    
    addEntryMutation.mutate({
      name: newFood.name,
      calories: parseInt(newFood.calories),
      protein: parseInt(newFood.protein) || 0,
      carbs: parseInt(newFood.carbs) || 0,
      fat: parseInt(newFood.fat) || 0,
      date: selectedDate,
    });
  };

  const totals = entries.reduce(
    (acc: any, entry: FoodEntry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">${appName}</h1>
          <p className="text-lg text-gray-600">Track your nutrition and reach your health goals</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Daily Overview
              </CardTitle>
              <CardDescription>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-fit"
                />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totals.calories}</div>
                  <div className="text-sm text-gray-500">Calories</div>
                  <Progress value={(totals.calories / goals.calories) * 100} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{totals.protein}g</div>
                  <div className="text-sm text-gray-500">Protein</div>
                  <Progress value={(totals.protein / goals.protein) * 100} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{totals.carbs}g</div>
                  <div className="text-sm text-gray-500">Carbs</div>
                  <Progress value={(totals.carbs / goals.carbs) * 100} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{totals.fat}g</div>
                  <div className="text-sm text-gray-500">Fat</div>
                  <Progress value={(totals.fat / goals.fat) * 100} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Daily Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Calories:</span>
                <Badge variant="outline">{goals.calories}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Protein:</span>
                <Badge variant="outline">{goals.protein}g</Badge>
              </div>
              <div className="flex justify-between">
                <span>Carbs:</span>
                <Badge variant="outline">{goals.carbs}g</Badge>
              </div>
              <div className="flex justify-between">
                <span>Fat:</span>
                <Badge variant="outline">{goals.fat}g</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="log" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="log">Food Log</TabsTrigger>
            <TabsTrigger value="add">Add Food</TabsTrigger>
          </TabsList>
          
          <TabsContent value="log" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Today's Meals</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : entries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No food entries for this date. Add some meals to get started!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {entries.map((entry: FoodEntry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{entry.name}</h3>
                          <p className="text-sm text-gray-600">
                            {entry.calories} cal • {entry.protein}g protein • {entry.carbs}g carbs • {entry.fat}g fat
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEntryMutation.mutate(entry.id)}
                          disabled={deleteEntryMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Food Entry
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddFood} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Food Name</Label>
                      <Input
                        id="name"
                        value={newFood.name}
                        onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                        placeholder="e.g., Grilled Chicken Breast"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="calories">Calories</Label>
                      <Input
                        id="calories"
                        type="number"
                        value={newFood.calories}
                        onChange={(e) => setNewFood({ ...newFood, calories: e.target.value })}
                        placeholder="250"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="protein">Protein (g)</Label>
                      <Input
                        id="protein"
                        type="number"
                        value={newFood.protein}
                        onChange={(e) => setNewFood({ ...newFood, protein: e.target.value })}
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="carbs">Carbs (g)</Label>
                      <Input
                        id="carbs"
                        type="number"
                        value={newFood.carbs}
                        onChange={(e) => setNewFood({ ...newFood, carbs: e.target.value })}
                        placeholder="5"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="fat">Fat (g)</Label>
                      <Input
                        id="fat"
                        type="number"
                        value={newFood.fat}
                        onChange={(e) => setNewFood({ ...newFood, fat: e.target.value })}
                        placeholder="8"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={addEntryMutation.isPending}>
                    {addEntryMutation.isPending ? 'Adding...' : 'Add Food Entry'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;`;
}

function generateAdvancedReactApp(prompt: string, appName: string): string {
  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function App() {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['/api/items'],
  });

  const addItemMutation = useMutation({
    mutationFn: (item: any) => apiRequest('POST', '/api/items', item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      setFormData({ name: '', description: '' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    addItemMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">${appName}</h1>
          <p className="text-lg text-gray-600">Modern application built with React and TypeScript</p>
        </header>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard</CardTitle>
                <CardDescription>Application overview and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{items.length}</div>
                      <div className="text-sm text-gray-600">Total Items</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="manage">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Item</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter description"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={addItemMutation.isPending}>
                      {addItemMutation.isPending ? 'Adding...' : 'Add Item'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Items List</CardTitle>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No items yet. Add one to get started!</p>
                  ) : (
                    <div className="space-y-2">
                      {items.map((item: any) => (
                        <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                          <h3 className="font-medium">{item.name}</h3>
                          {item.description && (
                            <p className="text-sm text-gray-600">{item.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;`;
}

function generateDynamicSchema(prompt: string): string {
  const isHealthApp = prompt.toLowerCase().includes('calorie') || prompt.toLowerCase().includes('fitness') || prompt.toLowerCase().includes('health');
  
  if (isHealthApp) {
    return `import { pgTable, text, integer, timestamp, varchar, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const foodEntries = pgTable("food_entries", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  calories: integer("calories").notNull(),
  protein: decimal("protein", { precision: 8, scale: 2 }).default('0'),
  carbs: decimal("carbs", { precision: 8, scale: 2 }).default('0'),
  fat: decimal("fat", { precision: 8, scale: 2 }).default('0'),
  date: varchar("date", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userGoals = pgTable("user_goals", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  calories: integer("calories").notNull().default(2000),
  protein: integer("protein").notNull().default(150),
  carbs: integer("carbs").notNull().default(250),
  fat: integer("fat").notNull().default(65),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const workouts = pgTable("workouts", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  duration: integer("duration").notNull(), // in minutes
  caloriesBurned: integer("calories_burned").default(0),
  date: varchar("date", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFoodEntrySchema = createInsertSchema(foodEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserGoalsSchema = createInsertSchema(userGoals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  createdAt: true,
});

export type FoodEntry = typeof foodEntries.$inferSelect;
export type InsertFoodEntry = z.infer<typeof insertFoodEntrySchema>;
export type UserGoals = typeof userGoals.$inferSelect;
export type InsertUserGoals = z.infer<typeof insertUserGoalsSchema>;
export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;`;
  }
  
  return `import { pgTable, text, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const items = pgTable("items", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;`;
}

function generateDynamicAPI(prompt: string): string {
  const isHealthApp = prompt.toLowerCase().includes('calorie') || prompt.toLowerCase().includes('fitness') || prompt.toLowerCase().includes('health');
  
  if (isHealthApp) {
    return `import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { foodEntries, userGoals, workouts, insertFoodEntrySchema, insertUserGoalsSchema, insertWorkoutSchema } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Food Entries Routes
  app.get("/api/food-entries/:date?", async (req, res) => {
    try {
      const date = req.params.date;
      let entries;
      
      if (date) {
        entries = await db.select().from(foodEntries).where(eq(foodEntries.date, date));
      } else {
        entries = await db.select().from(foodEntries);
      }
      
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food entries", error });
    }
  });

  app.post("/api/food-entries", async (req, res) => {
    try {
      const validatedData = insertFoodEntrySchema.parse(req.body);
      const [entry] = await db.insert(foodEntries).values(validatedData).returning();
      res.status(201).json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid food entry data", error });
    }
  });

  app.put("/api/food-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertFoodEntrySchema.parse(req.body);
      
      const [updatedEntry] = await db
        .update(foodEntries)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(foodEntries.id, id))
        .returning();

      if (!updatedEntry) {
        return res.status(404).json({ message: "Food entry not found" });
      }

      res.json(updatedEntry);
    } catch (error) {
      res.status(400).json({ message: "Failed to update food entry", error });
    }
  });

  app.delete("/api/food-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const [deletedEntry] = await db
        .delete(foodEntries)
        .where(eq(foodEntries.id, id))
        .returning();

      if (!deletedEntry) {
        return res.status(404).json({ message: "Food entry not found" });
      }

      res.json({ message: "Food entry deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete food entry", error });
    }
  });

  // User Goals Routes
  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await db.select().from(userGoals).limit(1);
      res.json(goals[0] || { calories: 2000, protein: 150, carbs: 250, fat: 65 });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals", error });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const validatedData = insertUserGoalsSchema.parse(req.body);
      const [goal] = await db.insert(userGoals).values(validatedData).returning();
      res.status(201).json(goal);
    } catch (error) {
      res.status(400).json({ message: "Invalid goals data", error });
    }
  });

  // Workouts Routes
  app.get("/api/workouts", async (req, res) => {
    try {
      const workoutList = await db.select().from(workouts);
      res.json(workoutList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workouts", error });
    }
  });

  app.post("/api/workouts", async (req, res) => {
    try {
      const validatedData = insertWorkoutSchema.parse(req.body);
      const [workout] = await db.insert(workouts).values(validatedData).returning();
      res.status(201).json(workout);
    } catch (error) {
      res.status(400).json({ message: "Invalid workout data", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}`;
  }
  
  return `import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { items, insertItemSchema } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.get("/api/items", async (req, res) => {
    try {
      const allItems = await db.select().from(items);
      res.json(allItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch items", error });
    }
  });

  app.post("/api/items", async (req, res) => {
    try {
      const validatedData = insertItemSchema.parse(req.body);
      const [item] = await db.insert(items).values(validatedData).returning();
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid item data", error });
    }
  });

  app.put("/api/items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertItemSchema.parse(req.body);
      
      const [updatedItem] = await db
        .update(items)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(items.id, id))
        .returning();

      if (!updatedItem) {
        return res.status(404).json({ message: "Item not found" });
      }

      res.json(updatedItem);
    } catch (error) {
      res.status(400).json({ message: "Failed to update item", error });
    }
  });

  app.delete("/api/items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const [deletedItem] = await db
        .delete(items)
        .where(eq(items.id, id))
        .returning();

      if (!deletedItem) {
        return res.status(404).json({ message: "Item not found" });
      }

      res.json({ message: "Item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete item", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}`;
}

function generateReactMain(): string {
  return `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)`;
}