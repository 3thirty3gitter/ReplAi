import { storage } from "../storage";
import type { Project, File } from "@shared/schema";

export interface ProjectContext {
  project: Project;
  files: File[];
  structure: FileStructure;
  dependencies: string[];
  errors: string[];
  currentFocus?: {
    file?: File;
    line?: number;
    selection?: string;
  };
}

export interface FileStructure {
  directories: string[];
  files: {
    [path: string]: {
      type: string;
      language: string;
      size: number;
      lastModified: Date;
    };
  };
}

export interface UserIntent {
  type: 'create_app' | 'modify_code' | 'debug' | 'explain' | 'generate_feature';
  description: string;
  appType?: string;
  technologies?: string[];
  features?: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  domain: string;
}

export class ContextBuilder {
  async gatherProjectContext(projectId: number): Promise<ProjectContext> {
    const project = await storage.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const files = await storage.getFilesByProject(projectId);
    const structure = this.buildFileStructure(files);
    const dependencies = this.extractDependencies(files);
    const errors = await this.detectErrors(files);

    return {
      project,
      files,
      structure,
      dependencies,
      errors
    };
  }

  analyzeUserIntent(message: string): UserIntent {
    const lowerMessage = message.toLowerCase();
    
    // Detect intent type
    let type: UserIntent['type'] = 'create_app';
    if (lowerMessage.includes('debug') || lowerMessage.includes('error') || lowerMessage.includes('fix')) {
      type = 'debug';
    } else if (lowerMessage.includes('explain') || lowerMessage.includes('what') || lowerMessage.includes('how')) {
      type = 'explain';
    } else if (lowerMessage.includes('add') || lowerMessage.includes('modify') || lowerMessage.includes('change')) {
      type = 'modify_code';
    } else if (lowerMessage.includes('feature') || lowerMessage.includes('function')) {
      type = 'generate_feature';
    }

    // Extract app type and domain
    const appType = this.detectAppType(lowerMessage);
    const domain = this.extractDomain(lowerMessage);
    const technologies = this.detectTechnologies(lowerMessage);
    const features = this.extractFeatures(lowerMessage);
    const complexity = this.assessComplexity(lowerMessage);

    return {
      type,
      description: message,
      appType,
      technologies,
      features,
      complexity,
      domain
    };
  }

  private buildFileStructure(files: File[]): FileStructure {
    const structure: FileStructure = {
      directories: [],
      files: {}
    };

    files.forEach(file => {
      if (file.isDirectory) {
        structure.directories.push(file.path);
      } else {
        structure.files[file.path] = {
          type: this.getFileType(file.name),
          language: file.language || 'text',
          size: file.content?.length || 0,
          lastModified: file.updatedAt || new Date()
        };
      }
    });

    return structure;
  }

  private extractDependencies(files: File[]): string[] {
    const dependencies: Set<string> = new Set();

    files.forEach(file => {
      if (file.name === 'package.json' && file.content) {
        try {
          const pkg = JSON.parse(file.content);
          if (pkg.dependencies) {
            Object.keys(pkg.dependencies).forEach(dep => dependencies.add(dep));
          }
          if (pkg.devDependencies) {
            Object.keys(pkg.devDependencies).forEach(dep => dependencies.add(dep));
          }
        } catch (e) {
          // Invalid JSON
        }
      }
    });

    return Array.from(dependencies);
  }

  private async detectErrors(files: File[]): Promise<string[]> {
    const errors: string[] = [];
    
    // Simple error detection - can be enhanced with actual linting
    files.forEach(file => {
      if (file.content) {
        // Check for common syntax issues
        if (file.language === 'javascript' || file.language === 'typescript') {
          if (file.content.includes('console.error')) {
            errors.push(`Potential error in ${file.name}`);
          }
        }
      }
    });

    return errors;
  }

  private detectAppType(message: string): string {
    const patterns = {
      'e-commerce': ['shop', 'store', 'ecommerce', 'commerce', 'buy', 'sell', 'product', 'cart'],
      'social': ['social', 'chat', 'message', 'feed', 'post', 'friend', 'follow'],
      'dashboard': ['dashboard', 'admin', 'analytics', 'chart', 'metric', 'report'],
      'blog': ['blog', 'article', 'post', 'content', 'news'],
      'portfolio': ['portfolio', 'showcase', 'resume', 'cv', 'profile'],
      'todo': ['todo', 'task', 'manage', 'organize', 'productivity'],
      'game': ['game', 'play', 'score', 'level', 'player'],
      'education': ['learn', 'course', 'lesson', 'quiz', 'education'],
      'finance': ['finance', 'money', 'bank', 'payment', 'budget']
    };

    for (const [type, keywords] of Object.entries(patterns)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        return type;
      }
    }

    return 'web-app';
  }

  private extractDomain(message: string): string {
    const domains = [
      'technology', 'business', 'education', 'health', 'finance', 
      'entertainment', 'travel', 'food', 'fashion', 'sports',
      'real-estate', 'automotive', 'fitness', 'music', 'art'
    ];

    for (const domain of domains) {
      if (message.toLowerCase().includes(domain)) {
        return domain;
      }
    }

    return 'general';
  }

  private detectTechnologies(message: string): string[] {
    const techs = ['react', 'vue', 'angular', 'node', 'express', 'mongodb', 'postgresql', 'mysql'];
    return techs.filter(tech => message.toLowerCase().includes(tech));
  }

  private extractFeatures(message: string): string[] {
    const features: string[] = [];
    const featurePatterns = {
      'authentication': ['login', 'auth', 'user', 'account'],
      'payment': ['payment', 'stripe', 'checkout', 'pay'],
      'search': ['search', 'find', 'filter'],
      'chat': ['chat', 'message', 'communication'],
      'analytics': ['analytics', 'tracking', 'metrics'],
      'api': ['api', 'rest', 'endpoint'],
      'database': ['database', 'storage', 'data'],
      'responsive': ['mobile', 'responsive', 'device']
    };

    for (const [feature, keywords] of Object.entries(featurePatterns)) {
      if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
        features.push(feature);
      }
    }

    return features;
  }

  private assessComplexity(message: string): 'simple' | 'moderate' | 'complex' {
    const complexityIndicators = {
      simple: ['simple', 'basic', 'minimal', 'quick'],
      complex: ['complex', 'advanced', 'enterprise', 'scalable', 'robust', 'comprehensive']
    };

    if (complexityIndicators.complex.some(word => message.toLowerCase().includes(word))) {
      return 'complex';
    }
    
    if (complexityIndicators.simple.some(word => message.toLowerCase().includes(word))) {
      return 'simple';
    }

    return 'moderate';
  }

  private getFileType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const typeMap: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'react',
      'tsx': 'react-typescript',
      'css': 'stylesheet',
      'html': 'markup',
      'json': 'configuration',
      'md': 'documentation'
    };

    return typeMap[ext || ''] || 'text';
  }
}

export const contextBuilder = new ContextBuilder();