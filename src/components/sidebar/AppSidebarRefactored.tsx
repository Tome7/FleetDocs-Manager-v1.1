import { 
  Car, 
  Users, 
  FileStack, 
  ClipboardCheck, 
  Bell, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  LayoutDashboard
} from "lucide-react";
import tyLogo from "@/components/image/meu-logo.png";
import { useTranslation } from "react-i18next";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Types
interface NavigationItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  alertCount?: number;
  onShowReports: () => void;
}

export function AppSidebarRefactored({ 
  activeTab, 
  onTabChange, 
  alertCount = 0,
  onShowReports,
}: AppSidebarProps) {
  const { t } = useTranslation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Define classes for styling based on theme
  const sidebarBgClass = "bg-white"; // Changed from bg-sidebar to white
  const navItemActiveClass = "bg-primary text-primary-foreground shadow-md font-semibold";
  const navItemInactiveClass = "text-foreground hover:text-primary hover:bg-accent";
  const navItemInactiveAlertClass = "bg-warning/20 text-warning border border-warning/30";

  // Main navigation items
  const navigationItems: NavigationItem[] = [
    { 
      id: "dashboard", 
      title: t('navigation.dashboard') || 'Visão Geral', 
      icon: LayoutDashboard 
    },
    { 
      id: "vehicles", 
      title: t('navigation.vehicles'), 
      icon: Car 
    },
    { 
      id: "drivers", 
      title: t('navigation.drivers'), 
      icon: Users 
    },
    { 
      id: "document-delivery", 
      title: t('navigation.documentDelivery'), 
      icon: FileStack 
    },
    { 
      id: "inspections", 
      title: t('navigation.inspections'), 
      icon: ClipboardCheck 
    },
  ];

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
  };

  return (
    <Sidebar 
      className={cn(
        "border-r border-input transition-all duration-300 ease-out max-w-full",
        sidebarBgClass, // Using dynamic class
        "text-sidebar-foreground",
        "shadow-sm"
      )}
      collapsible="icon"
    >
      {/* Header */}
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
              <img src={tyLogo} alt="T&Y Logo" className="h-6 w-6 object-contain" />
            </div>
            <div className="hidden lg:block animate-fade-in">
              <h2 className="font-bold text-sidebar-foreground text-base tracking-tight">T&Y</h2>
              <p className="text-xs text-sidebar-foreground/70 font-medium">INTERNATIONAL</p>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hidden lg:flex h-7 w-7 absolute top-4 right-3 bg-muted hover:bg-accent text-foreground rounded-full transition-all duration-300"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </SidebarHeader>

      <SidebarContent className="p-3 flex-1">
        {/* Main Navigation */}
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 py-2 mb-1 hidden lg:block">
              {t('navigation.title') || 'Navegação'}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item, index) => {
                const isActive = activeTab === item.id;
                return (
                  <SidebarMenuItem 
                    key={item.id}
                    className="animate-slide-in"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <SidebarMenuButton
                      onClick={() => handleTabChange(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                        isActive 
                          ? navItemActiveClass // Using dynamic class
                          : navItemInactiveClass // Using dynamic class
                      )}
                      tooltip={isCollapsed ? item.title : undefined}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 shrink-0 transition-transform duration-200",
                        !isActive && "group-hover:scale-105"
                      )} />
                      
                      <span className="truncate text-sm hidden lg:inline">
                        {item.title}
                      </span>

                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground hidden lg:block" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 py-2 mb-1 hidden lg:block">
              {t('navigation.tools') || 'Ferramentas'}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {/* Alerts Button */}
              <SidebarMenuItem className="animate-slide-in" style={{ animationDelay: '0.15s' }}>
                <SidebarMenuButton
                  onClick={() => handleTabChange('alerts')}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                    activeTab === 'alerts' 
                      ? "bg-expired text-expired-foreground shadow-md font-semibold" 
                      : alertCount > 0 
                        ? navItemInactiveAlertClass // Using dynamic class
                        : navItemInactiveClass // Using dynamic class
                  )}
                  tooltip={isCollapsed ? (alertCount > 0 ? `${alertCount} Alertas` : 'Alertas') : undefined}
                >
                  <div className="relative">
                    <Bell className={cn(
                      "h-5 w-5 shrink-0",
                      alertCount > 0 && activeTab !== 'alerts' && "animate-pulse"
                    )} />
                    {alertCount > 0 && (
                      <span className={cn(
                        "absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] flex items-center justify-center font-bold",
                        activeTab === 'alerts' 
                          ? "bg-expired-foreground text-expired" 
                          : "bg-warning text-warning-foreground"
                      )}>
                        {alertCount > 99 ? '99+' : alertCount}
                      </span>
                    )}
                  </div>
                  <span className="truncate text-sm hidden lg:inline">
                    {alertCount > 0 ? `${alertCount} Alertas` : 'Alertas'}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Reports Button */}
              <SidebarMenuItem className="animate-slide-in" style={{ animationDelay: '0.18s' }}>
                <SidebarMenuButton
                  onClick={onShowReports}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                    navItemInactiveClass // Using dynamic class
                  )}
                  tooltip={isCollapsed ? t('reports.title') : undefined}
                >
                  <FileText className="h-5 w-5 shrink-0 group-hover:scale-105 transition-transform duration-200" />
                  <span className="truncate text-sm hidden lg:inline">{t('reports.title') || 'Relatórios'}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-border p-4">
        <div className="hidden lg:block text-center">
          <p className="text-[10px] text-muted-foreground font-medium">
            © 2026 T&Y INTERNATIONAL
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-muted-foreground">Sistema Ativo</span>
          </div>
        </div>
        <div className="flex lg:hidden justify-center">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
