import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, Shield, Database, Zap, Users } from "lucide-react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lov-mermaid': { children: string };
    }
  }
}

export default function ExecutiveSummary() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl print:max-w-none">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-3">Sustainability Intelligence Platform</h1>
        <p className="text-xl text-muted-foreground">Executive Overview</p>
        <p className="text-sm text-muted-foreground mt-2">Automated research and analysis for climate technology investments</p>
      </div>

      {/* Value Proposition Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <Zap className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Time Savings</CardTitle>
            <CardDescription>Automated Processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">150+ hrs/month</div>
            <p className="text-sm text-muted-foreground">Reduced manual research and classification time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Database className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Data Coverage</CardTitle>
            <CardDescription>Comprehensive Tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">40+ themes</div>
            <p className="text-sm text-muted-foreground">Across energy, mobility, and industrial sectors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <TrendingUp className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Signal Processing</CardTitle>
            <CardDescription>Daily Intelligence</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">500+ signals/day</div>
            <p className="text-sm text-muted-foreground">Automatically collected, analyzed, and categorized</p>
          </CardContent>
        </Card>
      </div>

      {/* What It Does */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            What The Platform Does
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 text-lg">Before (Manual Process)</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Manually monitor 20+ news sources daily</li>
                <li>• Spend hours reading and categorizing articles</li>
                <li>• Inconsistent classification across analysts</li>
                <li>• Miss important signals due to volume</li>
                <li>• Research companies one-by-one (4-6 hours each)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-lg">After (Automated Platform)</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Automatically collect from all sources 24/7</li>
                <li>• AI categorizes and scores relevance instantly</li>
                <li>• Consistent taxonomy and classification rules</li>
                <li>• Alert system for high-priority signals</li>
                <li>• Batch classify 100+ companies in minutes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Architecture */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How It Works - Simplified Architecture</CardTitle>
          <CardDescription>Data flows from sources through processing to insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="border rounded-lg p-4 bg-muted/30">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Database className="h-4 w-4" />
                System Flow
              </h4>
              <div className="text-sm">
                <lov-mermaid>{`graph LR
    A[Data Sources] --> B[Collection Layer]
    B --> C[Processing & AI]
    C --> D[Structured Database]
    D --> E[User Interface]
    
    style A fill:#e3f2fd
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style D fill:#e8f5e9
    style E fill:#fce4ec`}</lov-mermaid>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-muted/30">
              <h4 className="font-semibold mb-4">Detailed System Components</h4>
              <div className="text-sm">
                <lov-mermaid>{`graph TB
    subgraph "1. Data Sources"
        A1[News Feeds]
        A2[Research Papers]
        A3[Regulatory Filings]
        A4[Company Websites]
    end
    
    subgraph "2. Automated Collection"
        B1[RSS Scrapers]
        B2[Web Crawlers]
        B3[Document Processors]
    end
    
    subgraph "3. AI Processing"
        C1[Content Extraction]
        C2[Theme Classification]
        C3[Relevance Scoring]
        C4[Company Matching]
    end
    
    subgraph "4. Intelligence Database"
        D1[500+ Daily Signals]
        D2[40+ Themes]
        D3[Company Classifications]
        D4[Research Documents]
    end
    
    subgraph "5. User Applications"
        E1[Dashboard]
        E2[Theme Explorer]
        E3[Signal Tracker]
        E4[Regulatory Monitor]
    end
    
    A1 & A2 & A3 & A4 --> B1 & B2 & B3
    B1 & B2 & B3 --> C1
    C1 --> C2 & C3 & C4
    C2 & C3 & C4 --> D1 & D2 & D3 & D4
    D1 & D2 & D3 & D4 --> E1 & E2 & E3 & E4
    
    style A1 fill:#e3f2fd
    style A2 fill:#e3f2fd
    style A3 fill:#e3f2fd
    style A4 fill:#e3f2fd`}</lov-mermaid>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Capabilities */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Core Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10">Live</Badge>
                Operational Features
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">●</span>
                  <span><strong>Theme Taxonomy:</strong> 40+ sustainability themes organized by sector</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">●</span>
                  <span><strong>Signal Collection:</strong> Automated monitoring of news and research sources</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">●</span>
                  <span><strong>AI Classification:</strong> Automatic company categorization into themes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">●</span>
                  <span><strong>Regulatory Tracking:</strong> Monitor policy changes and compliance deadlines</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">●</span>
                  <span><strong>Research Library:</strong> Centralized document management</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Badge variant="outline" className="bg-yellow-500/10">Roadmap</Badge>
                Coming Soon
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">●</span>
                  <span><strong>Advanced Analytics:</strong> Trend detection and predictive insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">●</span>
                  <span><strong>Custom Alerts:</strong> Personalized notification system</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">●</span>
                  <span><strong>API Access:</strong> Integration with external tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">●</span>
                  <span><strong>Collaboration Tools:</strong> Team annotations and sharing</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Users */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Who Uses This Platform
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Investment Analysts</h4>
              <p className="text-sm text-muted-foreground">Track market trends, identify investment opportunities, monitor portfolio companies</p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Research Teams</h4>
              <p className="text-sm text-muted-foreground">Deep-dive into themes, analyze regulatory impacts, produce intelligence reports</p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Decision Makers</h4>
              <p className="text-sm text-muted-foreground">High-level dashboards, strategic insights, market opportunity assessment</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Foundation */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Technical Foundation</CardTitle>
          <CardDescription>Built for scale and reliability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary mb-1">23</div>
              <div className="text-sm text-muted-foreground">Database Tables</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary mb-1">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime Target</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary mb-1">Cloud</div>
              <div className="text-sm text-muted-foreground">Fully Hosted</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary mb-1">Secure</div>
              <div className="text-sm text-muted-foreground">Role-Based Access</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground print:hidden">
        <p>This summary can be printed or exported as PDF for stakeholder distribution</p>
        <p className="mt-1">Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}
