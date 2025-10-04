import { useState } from "react";
import { Home, Target, Zap, FileText, Settings, Shield, Radar, ListChecks, Database } from "lucide-react";
import { NavLink, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
  { title: "Batch Classifier", url: "/batch-classifier", icon: ListChecks },
];

const adminItems = [
  { title: "Taxonomy", url: "/taxonomy", icon: Database },
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
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar
      className={!open ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <Link to="/" className="hover:opacity-80 transition-opacity">
              M/T Intelligence
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === "/"} className={getNavCls}>
                      <motion.div
                        whileHover={!open ? { scale: 1.1, y: -2 } : {}}
                        whileTap={!open ? { scale: 0.95 } : {}}
                        className="relative group flex items-center w-full"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {open && <span>{item.title}</span>}
                        {!open && (
                          <span className={cn(
                            "absolute left-12 px-2 py-1 rounded text-xs",
                            "bg-popover text-popover-foreground border border-border",
                            "opacity-0 group-hover:opacity-100",
                            "transition-opacity whitespace-nowrap pointer-events-none",
                            "shadow-lg z-50"
                          )}>
                            {item.title}
                          </span>
                        )}
                      </motion.div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground">
            Admin
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <motion.div
                        whileHover={!open ? { scale: 1.1, y: -2 } : {}}
                        whileTap={!open ? { scale: 0.95 } : {}}
                        className="relative group flex items-center w-full"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {open && <span>{item.title}</span>}
                        {!open && (
                          <span className={cn(
                            "absolute left-12 px-2 py-1 rounded text-xs",
                            "bg-popover text-popover-foreground border border-border",
                            "opacity-0 group-hover:opacity-100",
                            "transition-opacity whitespace-nowrap pointer-events-none",
                            "shadow-lg z-50"
                          )}>
                            {item.title}
                          </span>
                        )}
                      </motion.div>
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