import { NavLink } from "@/components/NavLink";
import { 
  Home, Users, Car, ShoppingBag, Building, Utensils, 
  CreditCard, BarChart3, Settings, Activity, FileText,
  DollarSign, Package, AlertCircle
} from "lucide-react";
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

const navigationItems = [
  { title: "Dashboard", url: "/admin", icon: Home, end: true },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Drivers", url: "/admin/drivers", icon: Car },
  { title: "Orders", url: "/admin/orders", icon: Package },
  { title: "Products", url: "/admin/products", icon: ShoppingBag },
  { title: "Properties", url: "/admin/properties", icon: Building },
  { title: "Restaurants", url: "/admin/restaurants", icon: Utensils },
  { title: "Transactions", url: "/admin/transactions", icon: DollarSign },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Activity Log", url: "/admin/activity", icon: Activity },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.end}
                      className="flex items-center gap-3 hover:bg-muted/50"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
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
