import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  ShoppingBag, 
  Car, 
  Building, 
  TrendingUp,
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Driver Management Component
function DriverManagement() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select(`
          *,
          users (
            full_name,
            phone,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (data) {
        setDrivers(data);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyDriver = async (driverId: string) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ is_verified: true })
        .eq('id', driverId);

      if (!error) {
        toast({
          title: "Driver verified",
          description: "Driver has been successfully verified"
        });
        fetchDrivers();
      }
    } catch (error) {
      console.error('Error verifying driver:', error);
      toast({
        title: "Error",
        description: "Failed to verify driver",
        variant: "destructive"
      });
    }
  };

  const unverifyDriver = async (driverId: string) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ is_verified: false })
        .eq('id', driverId);

      if (!error) {
        toast({
          title: "Driver unverified",
          description: "Driver verification has been removed"
        });
        fetchDrivers();
      }
    } catch (error) {
      console.error('Error unverifying driver:', error);
      toast({
        title: "Error",
        description: "Failed to unverify driver",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading drivers...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Driver Management</CardTitle>
      </CardHeader>
      <CardContent>
        {drivers.length === 0 ? (
          <div className="text-center py-8">
            <Car className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Drivers</h3>
            <p className="text-muted-foreground">No drivers have registered yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {drivers.map((driver) => (
              <div key={driver.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Car className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {driver.users?.full_name || 'Unknown Driver'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {driver.users?.phone || 'No phone'}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={driver.is_verified ? 'default' : 'secondary'}>
                          {driver.is_verified ? 'Verified' : 'Unverified'}
                        </Badge>
                        <Badge variant={driver.is_online ? 'default' : 'outline'}>
                          {driver.is_online ? 'Online' : 'Offline'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {driver.is_verified ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => unverifyDriver(driver.id)}
                      >
                        Unverify
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => verifyDriver(driver.id)}
                      >
                        Verify
                      </Button>
                    )}
                  </div>
                </div>
                {(driver.vehicle_type || driver.vehicle_number) && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    <p>Vehicle: {driver.vehicle_type}</p>
                    <p>License: {driver.vehicle_number}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeDrivers: number;
  pendingOrders: number;
  completedOrders: number;
}

interface RecentActivity {
  id: string;
  type: 'order' | 'user' | 'ride' | 'seller';
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
}

export default function Admin() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeDrivers: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch users count
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Fetch orders count and revenue
      const { data: orders, count: ordersCount } = await supabase
        .from('orders')
        .select('total_amount, status', { count: 'exact' });

      // Fetch active drivers
      const { count: driversCount } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true })
        .eq('is_online', true);

      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;
      const completedOrders = orders?.filter(order => order.status === 'delivered').length || 0;

      setStats({
        totalUsers: usersCount || 0,
        totalOrders: ordersCount || 0,
        totalRevenue,
        activeDrivers: driversCount || 0,
        pendingOrders,
        completedOrders
      });

      // Mock recent activity data
      setRecentActivity([
        {
          id: '1',
          type: 'order',
          description: 'New food order from Kerugoya',
          timestamp: '2 minutes ago',
          status: 'pending'
        },
        {
          id: '2',
          type: 'user',
          description: 'New user registration',
          timestamp: '5 minutes ago',
          status: 'success'
        },
        {
          id: '3',
          type: 'ride',
          description: 'Ride completed successfully',
          timestamp: '10 minutes ago',
          status: 'success'
        },
        {
          id: '4',
          type: 'seller',
          description: 'New seller application pending',
          timestamp: '15 minutes ago',
          status: 'pending'
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingBag className="h-4 w-4" />;
      case 'user': return <Users className="h-4 w-4" />;
      case 'ride': return <Car className="h-4 w-4" />;
      case 'seller': return <Building className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground">Please sign in to access the admin panel.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your QUICKLINK SERVICES platform
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <div className="text-2xl font-bold mt-2">{stats.totalUsers.toLocaleString()}</div>
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
                  <ShoppingBag className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Total Orders</span>
                </div>
                <div className="text-2xl font-bold mt-2">{stats.totalOrders.toLocaleString()}</div>
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
                  <DollarSign className="h-5 w-5 text-gold" />
                  <span className="text-sm font-medium">Total Revenue</span>
                </div>
                <div className="text-2xl font-bold mt-2">
                  KES {stats.totalRevenue.toLocaleString()}
                </div>
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
                  <Car className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Active Drivers</span>
                </div>
                <div className="text-2xl font-bold mt-2">{stats.activeDrivers}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center space-x-4 p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {getActivityIcon(activity.type)}
                          {getStatusIcon(activity.status)}
                        </div>
                        
                        <div className="flex-1">
                          <p className="font-medium">{activity.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {activity.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Completed Orders</span>
                    <Badge className="bg-green-100 text-green-800">
                      {stats.completedOrders}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium">Pending Orders</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {stats.pendingOrders}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Success Rate</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Order Management</h3>
                  <p className="text-muted-foreground">
                    Advanced order management features coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">User Management</h3>
                  <p className="text-muted-foreground">
                    User management features coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drivers">
            <DriverManagement />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Activity className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Platform Settings</h3>
                  <p className="text-muted-foreground">
                    Configuration settings coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}