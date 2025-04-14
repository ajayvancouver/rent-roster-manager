import { useState } from "react";
import {
  HomeIcon,
  Building2Icon,
  UsersIcon,
  DollarSignIcon,
  WrenchIcon,
  FileTextIcon,
  UserIcon,
  DatabaseIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SidebarProps {
  children: React.ReactNode;
}

const SidebarLayout = ({ children }: SidebarProps) => {
  const { pathname } = useLocation();
  const { userType } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <HomeIcon className="h-4 w-4" />,
    },
    {
      title: "Properties",
      href: "/properties",
      icon: <Building2Icon className="h-4 w-4" />,
    },
    {
      title: "Tenants",
      href: "/tenants",
      icon: <UsersIcon className="h-4 w-4" />,
    },
    {
      title: "Payments",
      href: "/payments",
      icon: <DollarSignIcon className="h-4 w-4" />,
    },
    {
      title: "Maintenance",
      href: "/maintenance",
      icon: <WrenchIcon className="h-4 w-4" />,
    },
    {
      title: "Documents",
      href: "/documents",
      icon: <FileTextIcon className="h-4 w-4" />,
    },
    {
      title: "Account",
      href: "/account",
      icon: <UserIcon className="h-4 w-4" />,
    },
    {
      title: "Database Test",
      href: "/database-test",
      icon: <DatabaseIcon className="h-4 w-4" />,
    },
  ];

  const tenantSidebarItems = [
    {
      title: "Dashboard",
      href: "/tenant/dashboard",
      icon: <HomeIcon className="h-4 w-4" />,
    },
    {
      title: "Property",
      href: "/tenant/property",
      icon: <Building2Icon className="h-4 w-4" />,
    },
    {
      title: "Payments",
      href: "/tenant/payments",
      icon: <DollarSignIcon className="h-4 w-4" />,
    },
    {
      title: "Maintenance",
      href: "/tenant/maintenance",
      icon: <WrenchIcon className="h-4 w-4" />,
    },
    {
      title: "Documents",
      href: "/tenant/documents",
      icon: <FileTextIcon className="h-4 w-4" />,
    },
    {
      title: "Account",
      href: "/tenant/account",
      icon: <UserIcon className="h-4 w-4" />,
    },
  ];

  const filteredSidebarItems = userType === "tenant" ? tenantSidebarItems : sidebarItems;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="outline" size="icon" className="ml-4">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0">
          <div className="flex flex-col h-full">
            <div className="px-4 py-6">
              <Link to="/" className="font-bold text-lg">
                Property Manager
              </Link>
            </div>
            <Separator />
            <nav className="flex flex-col flex-1 px-2 py-4 space-y-1">
              {filteredSidebarItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100",
                    pathname === item.href
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700"
                  )}
                >
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex md:flex-col md:fixed md:inset-y-0",
          "md:z-50 md:w-64",
          "md:bg-gray-100 md:border-r md:border-gray-200",
          isCollapsed ? "md:w-16" : "md:w-64"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3">
            <Link to="/" className="font-bold text-lg">
              Property Manager
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Separator />
          <nav className="flex flex-col flex-1 px-2 py-4 space-y-1">
            {filteredSidebarItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100",
                  pathname === item.href
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-700",
                  isCollapsed ? "justify-center" : ""
                )}
              >
                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                <span className={isCollapsed ? "sr-only" : ""}>{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 p-6">
        {children}
      </div>
    </div>
  );
};

export default SidebarLayout;
