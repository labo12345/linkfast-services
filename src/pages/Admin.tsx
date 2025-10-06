import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  ShoppingBag, 
  Car, 
  Building, 
  CheckCircle, 
  XCircle,
  Search,
  BarChart3,
  Shield,
  AlertCircle,
  Utensils
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Admin() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for various data
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [products, setProducts] = useState([]);
  const [properties, setProperties] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    totalProducts: 0,
    totalProperties: 0,
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
    subscribeToAdminUpdates();
  }, [user, isAdmin, adminLoading, navigate]);

  const subscribeToAdminUpdates = () => {
    // Subscribe to driver changes
    const driversChannel = supabase
      .channel('admin-drivers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, () => {
        fetchAllData();
      })
      .subscribe();

    // Subscribe to product changes
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
      // Fetch users
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      setUsers(usersData || []);

      // Fetch drivers
      const { data: driversData } = await supabase
        .from('drivers')
        .select('*, users!inner(full_name, phone)')
        .order('created_at', { ascending: false });
      setDrivers(driversData || []);

      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select('*, sellers!inner(shop_name)')
        .order('created_at', { ascending: false })
        .limit(50);
      setProducts(productsData || []);

      // Fetch properties
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      setProperties(propertiesData || []);

      // Fetch restaurants
      const { data: restaurantsData } = await supabase
        .from('restaurants')
        .select('*, sellers!inner(shop_name)')
        .order('created_at', { ascending: false });
      setRestaurants(restaurantsData || []);

      // Calculate stats
      setStats({
        totalUsers: usersData?.length || 0,
        totalDrivers: driversData?.length || 0,
        totalProducts: productsData?.length || 0,
        totalProperties: propertiesData?.length || 0,
        pendingApprovals: (driversData?.filter(d => !d.is_verified)?.length || 0) + 
                         (productsData?.filter(p => !p.is_active)?.length || 0)
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const verifyDriver = async (driverId: string, isVerified: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ is_verified: isVerified })
        .eq('id', driverId);

      if (!error) {
        toast({
          title: isVerified ? "Driver Verified" : "Driver Unverified",
          description: `Driver has been ${isVerified ? 'verified' : 'unverified'} successfully`
        });
        fetchAllData();
      }
    } catch (error) {
      console.error('Error verifying driver:', error);
    }
    setLoading(false);
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Manage users, verify listings, and monitor platform activity
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Total Users</span>
                </div>
                <div className="text-2xl font-bold mt-2">{stats.totalUsers}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Car className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Drivers</span>
                </div>
                <div className="text-2xl font-bold mt-2">{stats.totalDrivers}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Products</span>
                </div>
                <div className="text-2xl font-bold mt-2">{stats.totalProducts}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-gold" />
                  <span className="text-sm font-medium">Properties</span>
                </div>
                <div className="text-2xl font-bold mt-2">{stats.totalProperties}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium">Pending</span>
                </div>
                <div className="text-2xl font-bold mt-2">{stats.pendingApprovals}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
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
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Verify Drivers ({drivers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {drivers.map((driver: any) => (
                    <div key={driver.id} className="flex items-center justify-between border rounded-lg p-4">
                      <div className="flex-1">
                        <p className="font-semibold">{driver.users?.full_name || 'No name'}</p>
                        <p className="text-sm text-muted-foreground">
                          {driver.vehicle_type} - {driver.vehicle_number}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={driver.is_verified ? 'default' : 'secondary'}>
                            {driver.is_verified ? 'Verified' : 'Pending'}
                          </Badge>
                          <Badge variant={driver.is_online ? 'default' : 'outline'}>
                            {driver.is_online ? 'Online' : 'Offline'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!driver.is_verified && (
                          <Button
                            size="sm"
                            onClick={() => verifyDriver(driver.id, true)}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verify
                          </Button>
                        )}
                        {driver.is_verified && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => verifyDriver(driver.id, false)}
                            disabled={loading}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Unverify
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
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
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties">
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
          </TabsContent>

          {/* Restaurants Tab */}
          <TabsContent value="restaurants">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
