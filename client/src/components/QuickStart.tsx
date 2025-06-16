import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Play, ArrowRight, Lightbulb } from "lucide-react";

interface QuickStartProps {
  onStartProject: (templateId: string) => void;
}

const quickStartSteps = [
  {
    id: 1,
    title: "Choose a Template",
    description: "Select from pre-built templates like portfolio, business landing page, or blog",
    action: "Browse Templates",
    completed: false
  },
  {
    id: 2,
    title: "Design Your Pages",
    description: "Use the visual builder to drag and drop components like text, images, and forms",
    action: "Open Visual Builder",
    completed: false
  },
  {
    id: 3,
    title: "Set Up Database",
    description: "Create tables to store your data with our visual database designer",
    action: "Create Tables",
    completed: false
  },
  {
    id: 4,
    title: "Get AI Help",
    description: "Ask our AI assistant for coding help, explanations, or debugging",
    action: "Chat with AI",
    completed: false
  },
  {
    id: 5,
    title: "Deploy Your App",
    description: "Launch your application with one-click deployment",
    action: "Deploy",
    completed: false
  }
];

const popularTemplates = [
  {
    id: "personal-portfolio",
    name: "Personal Portfolio",
    difficulty: "Beginner",
    time: "5 min",
    description: "Showcase your work and skills",
    features: ["Project Gallery", "Contact Form", "About Section"]
  },
  {
    id: "business-landing",
    name: "Business Landing",
    difficulty: "Beginner", 
    time: "10 min",
    description: "Professional business website",
    features: ["Lead Capture", "Services", "Testimonials"]
  },
  {
    id: "blog-platform",
    name: "Blog Platform",
    difficulty: "Intermediate",
    time: "20 min", 
    description: "Complete blogging system",
    features: ["Content Management", "Comments", "Categories"]
  }
];

export function QuickStart({ onStartProject }: QuickStartProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const completedSteps = quickStartSteps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / quickStartSteps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-editor-text">Welcome to CodeIDE</h1>
        <p className="text-xl text-editor-text-dim">
          Build full-stack applications without writing code
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-editor-text-dim">
          <Lightbulb className="h-4 w-4" />
          <span>No coding experience required • Visual drag-and-drop builder • AI-powered assistance</span>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5 text-blue-600" />
            <span>Quick Start Guide</span>
          </CardTitle>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress: {completedSteps} of {quickStartSteps.length} steps</span>
              <span>{Math.round(progressPercentage)}% complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {quickStartSteps.map((step) => (
              <div key={step.id} className="flex items-center space-x-3 p-3 rounded-lg bg-white/50">
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{step.title}</h4>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
                <Button size="sm" variant="outline" disabled={step.completed}>
                  {step.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Templates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-editor-text">Start with a Template</h2>
          <Button variant="outline">View All Templates</Button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {popularTemplates.map((template) => (
            <Card 
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge className={getDifficultyColor(template.difficulty)}>
                      {template.difficulty}
                    </Badge>
                    <span className="text-xs text-gray-500">{template.time}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{template.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Includes:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartProject(template.id);
                    }}
                  >
                    Start Building
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Visual Page Builder</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Drag and drop components to build beautiful pages without writing code.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Text, buttons, images, and forms</li>
              <li>• Grid layouts and containers</li>
              <li>• Real-time property editing</li>
              <li>• Mobile-responsive design</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Smart Database Designer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Create and manage your data with an intuitive visual interface.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Visual table creation</li>
              <li>• Multiple field types</li>
              <li>• Relationship mapping</li>
              <li>• Automatic form generation</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Coding Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Get instant help with coding questions and debugging.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Code explanations</li>
              <li>• Bug fixing assistance</li>
              <li>• Feature implementation</li>
              <li>• Best practices guidance</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">One-Click Deployment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Launch your application to the web instantly.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Automatic hosting setup</li>
              <li>• SSL certificates included</li>
              <li>• Custom domain support</li>
              <li>• Performance optimization</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Ready to Build Something Amazing?</h3>
          <p className="text-purple-100 mb-6">
            Join thousands of creators building applications without code
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => onStartProject('personal-portfolio')}>
              Start with Portfolio
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-purple-600">
              Browse All Templates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}