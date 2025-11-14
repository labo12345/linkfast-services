import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminStats } from '@/components/admin/AdminStats';
import { OrdersManagement } from '@/components/admin/OrdersManagement';
import { TransactionsManagement } from '@/components/admin/TransactionsManagement';
import { DriverVerificationDialog } from '@/components/admin/DriverVerificationDialog';
import Analytics from '@/pages/admin/Analytics';
import Activity from '@/pages/admin/Activity';
import Settings from '@/pages/admin/Settings';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Users, ShoppingBag, Car, Building, Utensils, 
  Eye, Shield, AlertCircle, Home
} from 'lucide-react';

export default function Admin() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  
  // State for various data
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [products, setProducts] = useState([]);
  const [properties, setProperties] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    activeDrivers: 0,
    totalProducts: 0,
    totalProperties: 0,
    totalRestaurants: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingApprovals: 0
  });

  useEffect(() => {
    if (adminLoading) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    // If admin, load all data
    fetchAllData();
    const cleanup = subscribeToAdminUpdates();

    // Listen for new driver applications
    const handleNewDriverApplication = (event: any) => {
      toast({
        title: "🚗 New Driver Application",
        description: "A new driver has submitted their application for review",
      });
      fetchAllData();
    };

    window.addEventListener("new-driver-application", handleNewDriverApplication);

    return () => {
      cleanup?.();
      window.removeEventListener("new-driver-application", handleNewDriverApplication);
    };
  }, [user, isAdmin, adminLoading, navigate]);

  const subscribeToAdminUpdates = () => {
    const driversChannel = supabase
      .channel('admin-drivers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, () => {
        fetchAllData();
      })
      .subscribe();

    const productsChannel = supabase
      .channel('admin-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchAllData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(driversChannel);
      supabase.removeChannel(productsChannel);
    };
  };

  const fetchAllData = async () => {
    try {
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      setUsers(usersData || []);

      const { data: driversData } = await supabase
        .from('drivers')
        .select('*, users!inner(full_name, phone)')
        .order('created_at', { ascending: false });
      setDrivers(driversData || []);

      const { data: productsData } = await supabase
        .from('products')
        .select('*, sellers!inner(shop_name)')
        .order('created_at', { ascending: false })
        .limit(50);
      setProducts(productsData || []);

      const { data: propertiesData } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      setProperties(propertiesData || []);

      const { data: restaurantsData } = await supabase
        .from('restaurants')
        .select('*, sellers!inner(shop_name)')
        .order('created_at', { ascending: false });
      setRestaurants(restaurantsData || []);

      const { data: ordersData } = await supabase
        .from('orders')
        .select('total_amount, payment_status')
        .limit(1000);

      const totalRevenue = ordersData
        ?.filter(o => o.payment_status === 'paid')
        .reduce((sum, o) => sum + (parseFloat(o.total_amount?.toString() || '0')), 0) || 0;

      const pendingDrivers = driversData?.filter(d => !d.is_verified)?.length || 0;
      const activeDrivers = driversData?.filter(d => d.is_verified && d.is_online)?.length || 0;
      
      setStats({
        totalUsers: usersData?.length || 0,
        totalDrivers: driversData?.length || 0,
        activeDrivers: activeDrivers,
        totalProducts: productsData?.length || 0,
        totalProperties: propertiesData?.length || 0,
        totalRestaurants: restaurantsData?.length || 0,
        totalOrders: ordersData?.length || 0,
        totalRevenue: totalRevenue,
        pendingApprovals: pendingDrivers + (productsData?.filter(p => !p.is_active)?.length || 0)
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleViewDriver = (driver: any) => {
    setSelectedDriver(driver);
    setDriverDialogOpen(true);
  };

  const toggleProductStatus = async (productId: string, isActive: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !isActive })
        .eq('id', productId);

      if (!error) {
        toast({
          title: "Product Updated",
          description: `Product has been ${!isActive ? 'activated' : 'deactivated'}`
        });
        fetchAllData();
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
    }
    setLoading(false);
  };

  const togglePropertyStatus = async (propertyId: string, isActive: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_active: !isActive })
        .eq('id', propertyId);

      if (!error) {
        toast({
          title: "Property Updated",
          description: `Property has been ${!isActive ? 'activated' : 'deactivated'}`
        });
        fetchAllData();
      }
    } catch (error) {
      console.error('Error toggling property status:', error);
    }
    setLoading(false);
  };

  if (adminLoading || !user || !isAdmin) return null;

  const DashboardOverview = () => (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive platform management and oversight
            </p>
          </div>
        </div>
      </motion.div>
      <AdminStats stats={stats} />
    </div>
  );

  const UsersTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Manage Users ({users.length})
        </CardTitle>
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.filter((u: any) => 
            u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.phone?.includes(searchQuery)
          ).map((user: any) => (
            <div key={user.id} className="flex items-center justify-between border rounded-lg p-4">
              <div>
                <p className="font-semibold">{user.full_name || 'No name'}</p>
                <p className="text-sm text-muted-foreground">{user.phone}</p>
                <Badge variant="outline" className="mt-1">{user.role}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(user.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const DriversTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Pending Driver Applications ({drivers.filter((d: any) => !d.is_verified).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {drivers.filter((d: any) => !d.is_verified).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No pending driver applications</p>
              </div>
            ) : (
              drivers.filter((d: any) => !d.is_verified).map((driver: any) => (
                <div key={driver.id} className="flex items-center justify-between border rounded-lg p-4 bg-orange-50/50">
                  <div className="flex-1">
                    <p className="font-semibold">{driver.users?.full_name || 'No name'}</p>
                    <p className="text-sm text-muted-foreground">
                      {driver.vehicle_type} • {driver.vehicle_number}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Applied: {new Date(driver.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => handleViewDriver(driver)} variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Review Application
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            All Drivers ({drivers.length})
          </CardTitle>
          <Input
            placeholder="Search drivers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm mt-2"
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {drivers
              .filter((d: any) => 
                d.users?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.vehicle_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.vehicle_type?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((driver: any) => (
                <div key={driver.id} className="flex items-center justify-between border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{driver.users?.full_name || 'No name'}</p>
                      <Badge variant={driver.is_verified ? 'default' : 'secondary'} className="text-xs">
                        {driver.is_verified ? 'Verified' : 'Pending'}
                      </Badge>
                      <Badge variant={driver.is_online ? 'default' : 'outline'} className="text-xs">
                        {driver.is_online ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">
                      {driver.vehicle_type} • {driver.vehicle_number}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleViewDriver(driver)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ProductsTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Manage Products ({products.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product: any) => (
            <div key={product.id} className="flex items-center justify-between border rounded-lg p-4">
              <div className="flex-1">
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  Seller: {product.sellers?.shop_name} | Price: KES {product.price?.toLocaleString()}
                </p>
                <Badge variant={product.is_active ? 'default' : 'secondary'} className="mt-1">
                  {product.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <Button
                size="sm"
                variant={product.is_active ? 'outline' : 'default'}
                onClick={() => toggleProductStatus(product.id, product.is_active)}
                disabled={loading}
              >
                {product.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const PropertiesTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Manage Properties ({properties.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {properties.map((property: any) => (
            <div key={property.id} className="flex items-center justify-between border rounded-lg p-4">
              <div className="flex-1">
                <p className="font-semibold">{property.title}</p>
                <p className="text-sm text-muted-foreground">
                  Type: {property.property_type} | Price: KES {property.price?.toLocaleString()}
                </p>
                <Badge variant={property.is_active ? 'default' : 'secondary'} className="mt-1">
                  {property.is_active ? 'Listed' : 'Unlisted'}
                </Badge>
              </div>
              <Button
                size="sm"
                variant={property.is_active ? 'outline' : 'default'}
                onClick={() => togglePropertyStatus(property.id, property.is_active)}
                disabled={loading}
              >
                {property.is_active ? 'Unlist' : 'List'}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const RestaurantsTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          Restaurants ({restaurants.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {restaurants.map((restaurant: any) => (
            <div key={restaurant.id} className="border rounded-lg p-4">
              <p className="font-semibold">{restaurant.name}</p>
              <p className="text-sm text-muted-foreground">
                Cuisine: {restaurant.cuisine_type} | Min Order: KES {restaurant.min_order_amount}
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant={restaurant.is_active ? 'default' : 'secondary'}>
                  {restaurant.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline">
                  Rating: {restaurant.rating || 0}/5
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <DriverVerificationDialog
          driver={selectedDriver}
          open={driverDialogOpen}
          onOpenChange={setDriverDialogOpen}
          onSuccess={fetchAllData}
        />
        
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background px-6 py-4">
            <SidebarTrigger />
            <div className="flex items-center gap-2 flex-1">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Admin Panel</h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </header>

          <main className="flex-1 p-6">
            <Routes>
              <Route index element={<DashboardOverview />} />
              <Route path="users" element={<UsersTab />} />
              <Route path="drivers" element={<DriversTab />} />
              <Route path="orders" element={<OrdersManagement />} />
              <Route path="transactions" element={<TransactionsManagement />} />
              <Route path="products" element={<ProductsTab />} />
              <Route path="properties" element={<PropertiesTab />} />
              <Route path="restaurants" element={<RestaurantsTab />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="activity" element={<Activity />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
