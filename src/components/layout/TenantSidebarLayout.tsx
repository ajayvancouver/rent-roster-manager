
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Building2, 
  CreditCard, 
  Wrench, 
  FileText, 
  UserRound,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  isActive: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, label, path, isActive, onClick }: SidebarItemProps) => {
  return (
    <Link to={path} onClick={onClick}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 pl-2 mb-1",
          isActive 
            ? "bg-sidebar-accent text-sidebar-accent-foreground" 
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )}
      >
        <Icon size={20} />
        <span>{label}</span>
      </Button>
    </Link>
  );
};

interface TenantSidebarLayoutProps {
  children: React.ReactNode;
}

const TenantSidebarLayout = ({ children }: TenantSidebarLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  const navItems = [
    { icon: Home, label: "Dashboard", path: "/tenant" },
    { icon: Building2, label: "My Property", path: "/tenant/property" },
    { icon: CreditCard, label: "Payments", path: "/tenant/payments" },
    { icon: Wrench, label: "Maintenance", path: "/tenant/maintenance" },
    { icon: FileText, label: "Documents", path: "/tenant/documents" },
    { icon: UserRound, label: "Account", path: "/tenant/account" },
  ];

  // Close sidebar on route change when on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleCloseSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Render a different layout for mobile and desktop
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Mobile header with menu button */}
        <header className="bg-sidebar px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-sidebar-foreground"
          >
            <Menu size={24} />
          </Button>
          <h1 className="text-xl font-bold text-sidebar-foreground">Tenant Portal</h1>
          <div className="w-10"></div>
        </header>
        
        {/* Mobile Sidebar as a Sheet */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 bg-sidebar w-[80%] max-w-[300px]">
            <div className="p-4 border-b border-sidebar-border">
              <h1 className="text-xl font-bold text-sidebar-foreground">Tenant Portal</h1>
              <p className="text-sm text-sidebar-foreground/80">Welcome, {user?.email}</p>
            </div>
            
            <nav className="p-4">
              {navItems.map((item) => (
                <SidebarItem
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  path={item.path}
                  isActive={location.pathname === item.path}
                  onClick={handleCloseSidebar}
                />
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        
        {/* Main Content */}
        <main className="flex-1">
          <div className="container mx-auto py-4 px-4">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "bg-sidebar fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground">Tenant Portal</h1>
          <p className="text-sm text-sidebar-foreground/80">Welcome, {user?.email}</p>
        </div>
        
        <nav className="p-4">
          {navItems.map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              isActive={location.pathname === item.path}
            />
          ))}
        </nav>
      </aside>
      
      {/* Desktop Content */}
      <main className="lg:ml-64 flex-1 transition-all duration-300 ease-in-out">
        <header className="bg-background border-b sticky top-0 z-40 w-full">
          <div className="container flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold">Tenant Portal</h1>
          </div>
        </header>
        <div className="container mx-auto py-6 px-4">
          {children}
        </div>
      </main>
    </div>
  );
};

export default TenantSidebarLayout;
