import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
  Wifi,
  Shield,
  BarChart3,
  Upload,
  Check,
  X,
  Play,
  Pause,
  RefreshCw
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
  logs?: string;
}

interface DeploymentCenterProps {
  projectId: number;
}

const deploymentSteps = [
  { id: 1, name: 'Preparing Build', description: 'Setting up build environment' },
  { id: 2, name: 'Building Application', description: 'Compiling and optimizing code' },
  { id: 3, name: 'Database Setup', description: 'Configuring database connections' },
  { id: 4, name: 'Asset Optimization', description: 'Optimizing images and static files' },
  { id: 5, name: 'Deployment', description: 'Publishing to production servers' },
  { id: 6, name: 'Health Check', description: 'Verifying deployment status' }
];

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
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [deploymentUrl, setDeploymentUrl] = useState('');

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
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'deployments'] });
      if (data.url) {
        setDeploymentUrl(data.url);
      }
      toast({
        title: "Deployment Successful",
        description: "Your application is now live!"
      });
    },
    onError: (error) => {
      setIsDeploying(false);
      setDeployProgress(0);
      toast({
        title: "Deployment Failed",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  });

  // Simulate deployment progress
  useEffect(() => {
    if (isDeploying) {
      const interval = setInterval(() => {
        setDeployProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          if (newProgress >= 100) {
            setIsDeploying(false);
            clearInterval(interval);
            return 100;
          }
          
          // Update current step based on progress
          const stepIndex = Math.floor((newProgress / 100) * deploymentSteps.length);
          setCurrentStepIndex(stepIndex);
          setCurrentStep(deploymentSteps[stepIndex]?.name || '');
          
          return newProgress;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isDeploying]);

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeployProgress(0);
    setCurrentStepIndex(0);
    setCurrentStep(deploymentSteps[0].name);
    
    try {
      await deployMutation.mutateAsync(deployConfig);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const updateFeature = (feature: keyof DeploymentConfig['features'], enabled: boolean) => {
    setDeployConfig(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: enabled
      }
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "URL copied to clipboard"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'building': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed': return <X className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-green-100 text-green-800';
      case 'building': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const latestDeployment = deployments[0];

  return (
    <div className="h-full bg-editor-bg">
      {/* Header */}
      <div className="p-6 border-b border-editor-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-editor-text flex items-center">
              <Rocket className="h-6 w-6 mr-2" />
              Deployment Center
            </h2>
            <p className="text-editor-text-dim">Deploy your application to the web with one click</p>
          </div>
          <Button 
            size="lg" 
            onClick={handleDeploy}
            disabled={isDeploying || deployMutation.isPending}
          >
            {isDeploying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4 mr-2" />
                Deploy Now
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex h-full">
        {/* Configuration Panel */}
        <div className="w-80 border-r border-editor-border bg-editor-surface">
          <Tabs defaultValue="config" className="h-full">
            <TabsList className="grid w-full grid-cols-2 m-4">
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="p-4 space-y-6">
              <div>
                <Label className="text-sm font-medium">Environment</Label>
                <Select 
                  value={deployConfig.environment} 
                  onValueChange={(value: 'staging' | 'production') => 
                    setDeployConfig(prev => ({ ...prev, environment: value }))
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {deployConfig.environment === 'staging' 
                    ? 'Perfect for testing before going live' 
                    : 'Live production environment'}
                </p>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium mb-4 block">Features</Label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Database</p>
                        <p className="text-xs text-gray-500">Enable data storage</p>
                      </div>
                    </div>
                    <Switch
                      checked={deployConfig.features.database}
                      onCheckedChange={(checked) => updateFeature('database', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Authentication</p>
                        <p className="text-xs text-gray-500">User login system</p>
                      </div>
                    </div>
                    <Switch
                      checked={deployConfig.features.authentication}
                      onCheckedChange={(checked) => updateFeature('authentication', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Upload className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium">File Uploads</p>
                        <p className="text-xs text-gray-500">Allow file uploading</p>
                      </div>
                    </div>
                    <Switch
                      checked={deployConfig.features.fileUploads}
                      onCheckedChange={(checked) => updateFeature('fileUploads', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium">Analytics</p>
                        <p className="text-xs text-gray-500">Track user behavior</p>
                      </div>
                    </div>
                    <Switch
                      checked={deployConfig.features.analytics}
                      onCheckedChange={(checked) => updateFeature('analytics', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">Custom Domain (Optional)</Label>
                <Input
                  className="mt-2"
                  placeholder="example.com"
                  value={deployConfig.customDomain || ''}
                  onChange={(e) => setDeployConfig(prev => ({ ...prev, customDomain: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to use generated domain</p>
              </div>
            </TabsContent>

            <TabsContent value="history" className="p-4">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {deployments.map((deployment) => (
                    <Card key={deployment.id} className="bg-editor-bg">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(deployment.status)}
                            <span className="text-sm font-medium">v{deployment.version}</span>
                          </div>
                          <Badge className={getStatusColor(deployment.status)}>
                            {deployment.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          {new Date(deployment.createdAt).toLocaleString()}
                        </p>
                        {deployment.url && (
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(deployment.url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Visit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(deployment.url!)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Deployment Area */}
        <div className="flex-1 p-6">
          {isDeploying ? (
            /* Deployment Progress */
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center">
                <Rocket className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                <h3 className="text-2xl font-semibold mb-2">Deploying Your Application</h3>
                <p className="text-gray-600">Please wait while we build and deploy your project</p>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-gray-500">{Math.round(deployProgress)}%</span>
                    </div>
                    <Progress value={deployProgress} className="h-3" />
                    <p className="text-sm text-gray-600">Current step: {currentStep}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {deploymentSteps.map((step, index) => (
                  <div key={step.id} className={`flex items-center space-x-3 p-3 rounded-lg ${
                    index < currentStepIndex ? 'bg-green-50' :
                    index === currentStepIndex ? 'bg-blue-50' : 'bg-gray-50'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      index < currentStepIndex ? 'bg-green-500' :
                      index === currentStepIndex ? 'bg-blue-500' : 'bg-gray-300'
                    }`}>
                      {index < currentStepIndex ? (
                        <Check className="h-3 w-3 text-white" />
                      ) : index === currentStepIndex ? (
                        <RefreshCw className="h-3 w-3 text-white animate-spin" />
                      ) : (
                        <span className="text-xs text-white">{step.id}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{step.name}</p>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : latestDeployment?.status === 'deployed' ? (
            /* Successful Deployment */
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
                <h3 className="text-2xl font-semibold mb-2">Application Successfully Deployed!</h3>
                <p className="text-gray-600">Your application is now live and accessible to users</p>
              </div>

              {latestDeployment.url && (
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Live URL</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Input
                            value={latestDeployment.url}
                            readOnly
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            onClick={() => copyToClipboard(latestDeployment.url!)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => window.open(latestDeployment.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Monitor className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="font-medium">Responsive Design</p>
                    <p className="text-xs text-gray-500">Works on all devices</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                    <p className="font-medium">Fast Loading</p>
                    <p className="text-xs text-gray-500">Optimized performance</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="font-medium">Secure HTTPS</p>
                    <p className="text-xs text-gray-500">SSL certificate included</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* Ready to Deploy */
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center">
                <Globe className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-2xl font-semibold mb-2">Ready to Deploy</h3>
                <p className="text-gray-600">Configure your deployment settings and launch your application</p>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">What happens when you deploy:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Code is compiled and optimized for production</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Database tables are created automatically</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>SSL certificate is configured for security</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>CDN is set up for fast global access</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Monitoring and analytics are enabled</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button size="lg" onClick={handleDeploy} disabled={deployMutation.isPending}>
                  <Rocket className="h-5 w-5 mr-2" />
                  Deploy Your Application
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Deployment typically takes 2-3 minutes
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}