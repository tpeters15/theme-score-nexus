import { useState } from "react";
import { Home, Target, Zap, FileText, Settings, Shield, Radar, ListChecks, Database } from "lucide-react";
import { NavLink, useLocation, Link } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Themes", url: "/themes", icon: Target },
  { title: "Regulatory Tracker", url: "/regulatory-tracker", icon: Shield },
  { title: "Signals", url: "/signals", icon: Zap },
  { title: "Research", url: "/research", icon: FileText },
  { title: "Source Monitors", url: "/source-monitors", icon: Radar },
  { title: "Classifier", url: "/classifier", icon: ListChecks },
];

const adminItems = [
  { title: "Taxonomy", url: "/taxonomy", icon: Database },
  { title: "Theme Populator", url: "/admin/theme-populator", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    (isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50") +
    " group relative";

  return (
    <Sidebar
      className={!open ? "w-14" : "w-60"}
      collapsible="icon"
      style={{ overflow: 'visible' }}
    >
      <SidebarContent className="overflow-visible">
        <SidebarGroup className="overflow-visible">
          <SidebarGroupLabel>
            <Link to="/" className="hover:opacity-80 transition-opacity">
              M/T Intelligence
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent className="overflow-visible">
            <SidebarMenu className="overflow-visible">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title} className="overflow-visible">
                  <SidebarMenuButton asChild tooltip={item.title} className="group relative">
                    <NavLink to={item.url} end={item.url === "/"} className={getNavCls}>
                      <item.icon className={open ? "mr-2 h-4 w-4" : "h-6 w-6 transition-transform group-hover:scale-110 -translate-y-0 group-hover:-translate-y-0.5"} />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="overflow-visible">
          <SidebarGroupLabel className="text-xs text-muted-foreground">
            Admin
          </SidebarGroupLabel>
          <SidebarGroupContent className="overflow-visible">
            <SidebarMenu className="overflow-visible">
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title} className="overflow-visible">
                  <SidebarMenuButton asChild tooltip={item.title} className="group relative">
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className={open ? "mr-2 h-4 w-4" : "h-6 w-6 transition-transform group-hover:scale-110 -translate-y-0 group-hover:-translate-y-0.5"} />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}