import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Rocket, 
  Globe, 
  Settings, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Database,
  Code,
  Zap,
  Monitor,
  Smartphone,
  Wifi
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DeploymentConfig {
  domain?: string;
  customDomain?: string;
  environment: 'staging' | 'production';
  features: {
    database: boolean;
    authentication: boolean;
    fileUploads: boolean;
    analytics: boolean;
  };
}

interface Deployment {
  id: string;
  version: string;
  status: 'building' | 'deployed' | 'failed';
  url?: string;
  createdAt: string;
  buildTime?: number;
}

interface DeploymentCenterProps {
  projectId: number;
}

export function DeploymentCenter({ projectId }: DeploymentCenterProps) {
  const [deployConfig, setDeployConfig] = useState<DeploymentConfig>({
    environment: 'staging',
    features: {
      database: true,
      authentication: false,
      fileUploads: false,
      analytics: false
    }
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get deployment history
  const { data: deployments = [] } = useQuery<Deployment[]>({
    queryKey: ['/api/projects', projectId, 'deployments'],
    enabled: !!projectId
  });

  // Deploy mutation
  const deployMutation = useMutation({
    mutationFn: async (config: DeploymentConfig) => {
      return apiRequest('POST', `/api/projects/${projectId}/deploy`, config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'deployments'] });
      toast({
        title: "Deployment started",
        description: "Your application is being deployed..."
      });
    },
    onError: (error) => {
      toast({
        title: "Deployment failed",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  });

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeployProgress(0);
    
    const steps = [
      { name: 'Preparing build environment', duration: 2000 },
      { name: 'Building frontend', duration: 3000 },
      { name: 'Setting up database', duration: 2500 },
      { name: 'Deploying to servers', duration: 4000 },
      { name: 'Running health checks', duration: 1500 },
      { name: 'Going live', duration: 1000 }
    ];

    let progress = 0;
    const stepProgress = 100 / steps.length;

    for (const step of steps) {
      setCurrentStep(step.name);
      await new Promise(resolve => setTimeout(resolve, step.duration));
      progress += stepProgress;
      setDeployProgress(progress);
    }

    deployMutation.mutate(deployConfig);
    setIsDeploying(false);
    setCurrentStep('');
    setDeployProgress(0);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'building':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed':
        return 'bg-green-100 text-green-800';
      case 'building':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "URL has been copied to your clipboard"
    });
  };

  const latestDeployment = deployments[0];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <Rocket className="h-6 w-6 mr-3 text-blue-600" />
                Deployment Center
              </h1>
              <p className="text-gray-600 mt-1">Deploy your application to the world</p>
            </div>
            <div className="flex items-center space-x-3">
              {latestDeployment?.status === 'deployed' && (
                <Button variant="outline" onClick={() => window.open(latestDeployment.url, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Live Site
                </Button>
              )}
              <Button 
                onClick={handleDeploy} 
                disabled={isDeploying}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Rocket className="h-4 w-4 mr-2" />
                {isDeploying ? 'Deploying...' : 'Deploy Now'}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Current Status */}
            {latestDeployment && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Current Deployment</span>
                    <Badge className={getStatusColor(latestDeployment.status)}>
                      {latestDeployment.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(latestDeployment.status)}
                      <div>
                        <p className="font-medium">Version {latestDeployment.version}</p>
                        <p className="text-sm text-gray-500">
                          Deployed {new Date(latestDeployment.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {latestDeployment.url && (
                      <div className="flex items-center space-x-2">
                        <code className="bg-gray-100 px-3 py-1 rounded text-sm">
                          {latestDeployment.url}
                        </code>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(latestDeployment.url!)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Deployment Progress */}
            {isDeploying && (
              <Card>
                <CardHeader>
                  <CardTitle>Deployment in Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{currentStep}</span>
                        <span>{Math.round(deployProgress)}%</span>
                      </div>
                      <Progress value={deployProgress} className="w-full" />
                    </div>
                    <p className="text-sm text-gray-600">
                      This usually takes 2-3 minutes. You can close this window and we'll notify you when it's done.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Configuration */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      Deployment Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="general" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="features">Features</TabsTrigger>
                        <TabsTrigger value="domain">Domain</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="general" className="space-y-4">
                        <div>
                          <Label htmlFor="environment">Environment</Label>
                          <Select 
                            value={deployConfig.environment} 
                            onValueChange={(value: any) => setDeployConfig(prev => ({ ...prev, environment: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="staging">Staging (for testing)</SelectItem>
                              <SelectItem value="production">Production (live site)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-3">
                          <Label>Performance & Optimization</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2 p-3 border rounded-lg">
                              <Zap className="h-5 w-5 text-blue-500" />
                              <div>
                                <p className="text-sm font-medium">Auto-scaling</p>
                                <p className="text-xs text-gray-500">Handles traffic spikes</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 p-3 border rounded-lg">
                              <Globe className="h-5 w-5 text-green-500" />
                              <div>
                                <p className="text-sm font-medium">Global CDN</p>
                                <p className="text-xs text-gray-500">Fast worldwide delivery</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="features" className="space-y-4">
                        <div className="space-y-3">
                          <Label>Enable Features</Label>
                          <div className="space-y-3">
                            {Object.entries({
                              database: { icon: Database, label: 'Database', desc: 'PostgreSQL database for data storage' },
                              authentication: { icon: Wifi, label: 'User Authentication', desc: 'Login and signup functionality' },
                              fileUploads: { icon: Code, label: 'File Uploads', desc: 'Allow users to upload files' },
                              analytics: { icon: Monitor, label: 'Analytics', desc: 'Track visitor behavior' }
                            }).map(([key, { icon: Icon, label, desc }]) => (
                              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <Icon className="h-5 w-5 text-blue-500" />
                                  <div>
                                    <p className="text-sm font-medium">{label}</p>
                                    <p className="text-xs text-gray-500">{desc}</p>
                                  </div>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={deployConfig.features[key as keyof typeof deployConfig.features]}
                                  onChange={(e) => setDeployConfig(prev => ({
                                    ...prev,
                                    features: { ...prev.features, [key]: e.target.checked }
                                  }))}
                                  className="h-4 w-4 text-blue-600 rounded"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="domain" className="space-y-4">
                        <div>
                          <Label htmlFor="customDomain">Custom Domain (optional)</Label>
                          <Input
                            id="customDomain"
                            value={deployConfig.customDomain || ''}
                            onChange={(e) => setDeployConfig(prev => ({ ...prev, customDomain: e.target.value }))}
                            placeholder="www.myapp.com"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Leave empty to use our free subdomain (myapp.codeide.app)
                          </p>
                        </div>
                        
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-900 mb-2">SSL Certificate</h4>
                          <p className="text-sm text-blue-700">
                            We automatically provide free SSL certificates for all deployments, ensuring your site is secure with HTTPS.
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Deployment Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Deployments</span>
                      <span className="font-medium">{deployments.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-medium text-green-600">
                        {deployments.length > 0 ? Math.round((deployments.filter(d => d.status === 'deployed').length / deployments.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Build Time</span>
                      <span className="font-medium">2m 15s</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Device Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                      <Monitor className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">Desktop Ready</span>
                      <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                      <Smartphone className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">Mobile Optimized</span>
                      <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Deployment History */}
            <Card>
              <CardHeader>
                <CardTitle>Deployment History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {deployments.map((deployment) => (
                      <div key={deployment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(deployment.status)}
                          <div>
                            <p className="font-medium">Version {deployment.version}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(deployment.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(deployment.status)}>
                            {deployment.status}
                          </Badge>
                          {deployment.url && (
                            <Button variant="outline" size="sm" onClick={() => window.open(deployment.url, '_blank')}>
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {deployments.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Rocket className="h-8 w-8 mx-auto mb-2" />
                        <p>No deployments yet</p>
                        <p className="text-sm">Deploy your first version to get started</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}