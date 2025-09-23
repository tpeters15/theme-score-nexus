import { Building2, Settings, Bell, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left side with sidebar trigger */}
          <div className="flex items-center">
            <SidebarTrigger className="mr-4" />
          </div>
          
          {/* Centered logo and description */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-primary rounded-md">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-foreground">Nexus Capital</h1>
              <p className="text-xs text-muted-foreground">Investment Research Platform</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="p-2">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 relative">
              <Bell className="h-4 w-4" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center">
                3
              </Badge>
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Settings className="h-4 w-4" />
            </Button>
            <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs font-medium text-primary-foreground">JD</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}