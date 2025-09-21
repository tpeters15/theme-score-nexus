import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, PlayCircle, Clock, CheckCircle, Zap, TrendingUp, FileText, Activity } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface SignalRun {
  id: string;
  workflow_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  theme_name?: string;
  sector?: string;
  pillar?: string;
  results?: any;
  progress?: number;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  type: 'research' | 'regulatory' | 'market_scan' | 'competitor';
  webhook_url: string;
  required_params: string[];
}

export function SignalsDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [signalRuns, setSignalRuns] = useState<SignalRun[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data for now - will be replaced with Supabase integration
  useEffect(() => {
    // Mock signal runs data
    setSignalRuns([
      {
        id: '1',
        workflow_name: 'Deep Dive Research',
        status: 'completed',
        started_at: '2024-01-15T10:30:00Z',
        completed_at: '2024-01-15T10:45:00Z',
        theme_name: 'Energy Management Software',
        sector: 'Clean Energy Services',
        pillar: 'Energy Transition',
        progress: 100,
        results: {
          market_size: '€5-10 billion',
          growth_rate: '15-20% CAGR',
          key_players: ['Schneider Electric', 'Siemens', 'ABB']
        }
      },
      {
        id: '2',
        workflow_name: 'Regulatory Tracker',
        status: 'running',
        started_at: '2024-01-15T11:00:00Z',
        theme_name: 'EU Green Deal Compliance',
        sector: 'ESG Software',
        pillar: 'Sustainability',
        progress: 65
      },
      {
        id: '3',
        workflow_name: 'Weekly Market Scan',
        status: 'pending',
        started_at: '2024-01-15T11:30:00Z',
        sector: 'FinTech',
        pillar: 'Digital Infrastructure'
      }
    ]);

    // Mock workflow templates
    setWorkflows([
      {
        id: 'deep_dive',
        name: 'Deep Dive Research',
        description: 'Comprehensive PE market research using Perplexity + Claude',
        type: 'research',
        webhook_url: 'https://hooks.n8n.cloud/webhook/deep-dive-research',
        required_params: ['theme_name', 'sector', 'pillar']
      },
      {
        id: 'regulatory_tracker',
        name: 'EU Regulatory Tracker',
        description: 'Track regulatory changes affecting specific sectors',
        type: 'regulatory',
        webhook_url: 'https://hooks.n8n.cloud/webhook/regulatory-tracker',
        required_params: ['sector', 'regulation_type']
      },
      {
        id: 'market_scanner',
        name: 'Weekly Market Scanner',
        description: 'Automated market intelligence gathering',
        type: 'market_scan',
        webhook_url: 'https://hooks.n8n.cloud/webhook/market-scanner',
        required_params: ['sector']
      }
    ]);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'running':
        return <Activity className="w-4 h-4 text-warning animate-pulse" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'running':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const triggerWorkflow = async (workflowId: string, params: Record<string, string>) => {
    setLoading(true);
    try {
      const workflow = workflows.find(w => w.id === workflowId);
      if (!workflow) return;

      // This would call your n8n webhook
      const response = await fetch(workflow.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify(params)
      });

      toast({
        title: "Workflow Triggered",
        description: `${workflow.name} has been started successfully`,
      });

      // Add new run to state (in real implementation, this would come from webhook callback)
      const newRun: SignalRun = {
        id: Date.now().toString(),
        workflow_name: workflow.name,
        status: 'running',
        started_at: new Date().toISOString(),
        ...params,
        progress: 0
      };
      setSignalRuns(prev => [newRun, ...prev]);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to trigger workflow",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Signals Intelligence</h1>
        <p className="text-muted-foreground mt-2">
          AI-powered market intelligence and regulatory tracking workflows
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="runs">Signal Runs</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="triggers">Quick Trigger</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Runs</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {signalRuns.filter(r => r.status === 'running').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {signalRuns.filter(r => r.status === 'completed').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Workflows</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workflows.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94%</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest signal intelligence runs and results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {signalRuns.slice(0, 5).map((run) => (
                  <div key={run.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(run.status)}
                      <div>
                        <h4 className="font-medium">{run.workflow_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {run.theme_name || run.sector} • Started {new Date(run.started_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(run.status)}>
                        {run.status}
                      </Badge>
                      {run.status === 'running' && run.progress && (
                        <div className="w-24">
                          <Progress value={run.progress} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Signal Runs</CardTitle>
              <CardDescription>Complete history of intelligence gathering workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {signalRuns.map((run) => (
                  <Card key={run.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(run.status)}
                          <h3 className="font-semibold">{run.workflow_name}</h3>
                          <Badge className={getStatusColor(run.status)}>
                            {run.status}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1">
                          {run.theme_name && <p><strong>Theme:</strong> {run.theme_name}</p>}
                          {run.sector && <p><strong>Sector:</strong> {run.sector}</p>}
                          {run.pillar && <p><strong>Pillar:</strong> {run.pillar}</p>}
                          <p><strong>Started:</strong> {new Date(run.started_at).toLocaleString()}</p>
                          {run.completed_at && (
                            <p><strong>Completed:</strong> {new Date(run.completed_at).toLocaleString()}</p>
                          )}
                        </div>

                        {run.status === 'running' && run.progress && (
                          <div className="w-48">
                            <Progress value={run.progress} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">{run.progress}% complete</p>
                          </div>
                        )}

                        {run.results && (
                          <div className="mt-3 p-3 bg-muted/5 rounded border">
                            <h4 className="text-sm font-medium mb-2">Key Results:</h4>
                            <div className="text-xs space-y-1">
                              {run.results.market_size && <p><strong>Market Size:</strong> {run.results.market_size}</p>}
                              {run.results.growth_rate && <p><strong>Growth:</strong> {run.results.growth_rate}</p>}
                              {run.results.key_players && (
                                <p><strong>Key Players:</strong> {run.results.key_players.join(', ')}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        {run.status === 'completed' && (
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-1" />
                            View Report
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <Badge variant="outline">{workflow.type}</Badge>
                  </div>
                  <CardDescription>{workflow.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Required Parameters:</h4>
                      <div className="flex flex-wrap gap-1">
                        {workflow.required_params.map((param) => (
                          <Badge key={param} variant="secondary" className="text-xs">
                            {param}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={() => setActiveTab('triggers')}
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Trigger Workflow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="triggers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trigger New Signal Run</CardTitle>
              <CardDescription>Start a new intelligence gathering workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TriggerWorkflowForm 
                workflows={workflows} 
                onTrigger={triggerWorkflow}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TriggerWorkflowForm({ 
  workflows, 
  onTrigger, 
  loading 
}: { 
  workflows: WorkflowTemplate[]; 
  onTrigger: (workflowId: string, params: Record<string, string>) => void;
  loading: boolean;
}) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [params, setParams] = useState<Record<string, string>>({});

  const workflow = workflows.find(w => w.id === selectedWorkflow);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkflow) return;
    
    onTrigger(selectedWorkflow, params);
    setParams({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Select Workflow</label>
        <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a workflow to trigger" />
          </SelectTrigger>
          <SelectContent>
            {workflows.map((workflow) => (
              <SelectItem key={workflow.id} value={workflow.id}>
                {workflow.name} ({workflow.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {workflow && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Parameters</h4>
          {workflow.required_params.map((param) => (
            <div key={param}>
              <label className="text-sm font-medium capitalize">
                {param.replace('_', ' ')}
              </label>
              <Input
                value={params[param] || ''}
                onChange={(e) => setParams(prev => ({ ...prev, [param]: e.target.value }))}
                placeholder={`Enter ${param.replace('_', ' ')}`}
                required
              />
            </div>
          ))}
        </div>
      )}

      <Button 
        type="submit" 
        disabled={!selectedWorkflow || loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Activity className="w-4 h-4 mr-2 animate-spin" />
            Triggering...
          </>
        ) : (
          <>
            <PlayCircle className="w-4 h-4 mr-2" />
            Trigger Workflow
          </>
        )}
      </Button>
    </form>
  );
}