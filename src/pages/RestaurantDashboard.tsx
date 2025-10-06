import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Utensils, Plus, Clock, TrendingUp, Star, ChefHat, DollarSign, Package,
  Home, ShoppingBag, Users, MessageSquare, UserCog, Calendar, CreditCard,
  BarChart3, Settings, Bell, Search, LogOut, Upload, Menu, X, Wine,
  UtensilsCrossed, Clock3, CheckCircle2, XCircle, Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import restaurantBg from '@/assets/restaurant-bg.jpg';

export default function RestaurantDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [restaurant, setRestaurant] = useState({
    name: '',
    description: '',
    cuisine_type: '',
    logo_url: '',
    cover_image: '',
    min_order_amount: '',
    delivery_fee: '',
    is_active: true
  });
  const [menuItems, setMenuItems] = useState([]);
  const [stats, setStats] = useState({
    totalMenuItems: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    avgRating: 0,
    vipGuests: 0
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItemsByOrder, setOrderItemsByOrder] = useState<Record<string, any[]>>({});
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    preparation_time: '15',
    category_id: '',
    image_url: ''
  });

  useEffect(() => {
    if (user) {
      fetchRestaurant();
      fetchMenuItems();
      fetchOrders();
    }
  }, [user]);

  useEffect(() => {
    if (orders.length > 0 || menuItems.length > 0) {
      calculateStats();
    }
  }, [orders, menuItems]);

  const fetchRestaurant = async () => {
    try {
      const { data: sellerData } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (sellerData) {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('seller_id', sellerData.id)
          .single();
        
        if (data) {
          setRestaurant({
            name: data.name,
            description: data.description || '',
            cuisine_type: data.cuisine_type || '',
            logo_url: data.logo_url || '',
            cover_image: data.cover_image || '',
            min_order_amount: data.min_order_amount?.toString() || '',
            delivery_fee: data.delivery_fee?.toString() || '',
            is_active: data.is_active
          });
        }
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data: sellerData } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (sellerData) {
        const { data: restaurantData } = await supabase
          .from('restaurants')
          .select('id')
          .eq('seller_id', sellerData.id)
          .single();

        if (restaurantData) {
          const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .eq('restaurant_id', restaurantData.id);
          
          if (data) {
            setMenuItems(data);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data: sellerData } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (sellerData) {
        const { data: restaurantData } = await supabase
          .from('restaurants')
          .select('id')
          .eq('seller_id', sellerData.id)
          .single();

        if (restaurantData) {
          const { data: ordersData } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('restaurant_id', restaurantData.id)
            .order('created_at', { ascending: false });
          
          if (ordersData) {
            setOrders(ordersData);
            
            // Setup real-time subscription
            const channel = supabase
              .channel('restaurant-orders')
              .on(
                'postgres_changes',
                {
                  event: '*',
                  schema: 'public',
                  table: 'orders',
                  filter: `restaurant_id=eq.${restaurantData.id}`
                },
                () => {
                  fetchOrders();
                }
              )
              .subscribe();

            return () => {
              supabase.removeChannel(channel);
            };
          }
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const calculateStats = () => {
    const pending = orders.filter(o => o.status === 'pending').length;
    const preparing = orders.filter(o => o.status === 'confirmed').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    
    const totalRev = orders
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
    
    const today = new Date().toISOString().split('T')[0];
    const todayRev = orders
      .filter(o => o.created_at?.startsWith(today) && o.payment_status === 'paid')
      .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
    
    setStats({
      totalMenuItems: menuItems.length,
      pendingOrders: pending,
      preparingOrders: preparing,
      deliveredOrders: delivered,
      totalRevenue: totalRev,
      todayRevenue: todayRev,
      avgRating: 4.5,
      vipGuests: 0
    });
  };

  const handleLogoUpload = async (file: File) => {
    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `restaurants/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('restaurants')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('restaurants')
        .getPublicUrl(filePath);
      
      setRestaurant({ ...restaurant, logo_url: publicUrl });
      
      const { data: sellerData } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (sellerData) {
        await supabase
          .from('restaurants')
          .update({ logo_url: publicUrl })
          .eq('seller_id', sellerData.id);
      }
      
      toast({ title: "Logo updated", description: "Restaurant logo updated successfully" });
    } catch (error) {
      toast({ title: "Upload failed", description: "Failed to upload logo", variant: "destructive" });
    }
    setLoading(false);
  };

  const updateRestaurant = async () => {
    setLoading(true);
    try {
      const { data: sellerData } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (sellerData) {
        const { error } = await supabase
          .from('restaurants')
          .upsert({
            seller_id: sellerData.id,
            name: restaurant.name,
            description: restaurant.description,
            cuisine_type: restaurant.cuisine_type,
            min_order_amount: parseFloat(restaurant.min_order_amount) || 0,
            delivery_fee: parseFloat(restaurant.delivery_fee) || 0,
            is_active: restaurant.is_active
          });

        if (!error) {
          toast({
            title: "Restaurant updated",
            description: "Your restaurant profile has been updated successfully"
          });
        }
      }
    } catch (error) {
      console.error('Error updating restaurant:', error);
    }
    setLoading(false);
  };

  const addMenuItem = async () => {
    setLoading(true);
    try {
      const { data: sellerData } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (sellerData) {
        const { data: restaurantData } = await supabase
          .from('restaurants')
          .select('id')
          .eq('seller_id', sellerData.id)
          .single();

        if (restaurantData) {
          const { error } = await supabase
            .from('menu_items')
            .insert({
              ...newMenuItem,
              price: parseFloat(newMenuItem.price),
              preparation_time: parseInt(newMenuItem.preparation_time),
              restaurant_id: restaurantData.id
            });

          if (!error) {
            toast({
              title: "Menu item added",
              description: "Your menu item has been added successfully"
            });
            setNewMenuItem({
              name: '',
              description: '',
              price: '',
              preparation_time: '15',
              category_id: '',
              image_url: ''
            });
            fetchMenuItems();
          }
        }
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
    }
    setLoading(false);
  };

  if (!user) return null;

  const sidebarItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders' },
    { id: 'menu', icon: UtensilsCrossed, label: 'Menu Management' },
    { id: 'customers', icon: Users, label: 'Customers' },
    { id: 'chat', icon: MessageSquare, label: 'Chat / Messages' },
    { id: 'staff', icon: UserCog, label: 'Staff Management' },
    { id: 'tables', icon: Calendar, label: 'Tables & Reservations' },
    { id: 'billing', icon: CreditCard, label: 'Billing & Payments' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics & Reports' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white/70">Today's Orders</p>
                        <p className="text-3xl font-bold text-white mt-2">{stats.pendingOrders + stats.preparingOrders}</p>
                        <p className="text-xs text-emerald-400 mt-1">+12% from yesterday</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white/70">Today's Revenue</p>
                        <p className="text-3xl font-bold text-white mt-2">KES {stats.todayRevenue.toLocaleString()}</p>
                        <p className="text-xs text-emerald-400 mt-1">Target: KES 15,000</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white/70">Average Rating</p>
                        <p className="text-3xl font-bold text-white mt-2">{stats.avgRating}/5</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`h-3 w-3 ${i <= Math.floor(stats.avgRating) ? 'fill-amber-400 text-amber-400' : 'text-white/30'}`} />
                          ))}
                        </div>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white/70">VIP Guests</p>
                        <p className="text-3xl font-bold text-white mt-2">{stats.vipGuests}</p>
                        <p className="text-xs text-purple-400 mt-1">Special attention</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                        <Wine className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Popular Dishes & Quick Actions */}
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white">Popular Dishes Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {menuItems.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center">
                            <ChefHat className="h-8 w-8 text-amber-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{item.name}</p>
                            <p className="text-sm text-white/60">KES {item.price}</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          {Math.floor(Math.random() * 20) + 10} orders
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={() => setCurrentView('menu')} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Dish
                  </Button>
                  <Button onClick={() => setCurrentView('tables')} variant="outline" className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10">
                    <Calendar className="h-4 w-4 mr-2" />
                    Add Reservation
                  </Button>
                  <Button onClick={() => setCurrentView('staff')} variant="outline" className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10">
                    <UserCog className="h-4 w-4 mr-2" />
                    Staff Assignment
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'orders':
        return (
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Live Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="h-12 w-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <p className="font-semibold text-white text-xs">#{order.id.slice(0, 8)}</p>
                            <Badge className={
                              order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                              order.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                              order.status === 'shipped' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                              order.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                              'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            }>
                              {order.status === 'pending' && <Clock3 className="h-3 w-3 mr-1" />}
                              {order.status === 'confirmed' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                              {order.status === 'shipped' && <Package className="h-3 w-3 mr-1" />}
                              {order.status === 'delivered' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-white/80 text-sm">
                            {order.delivery_address || 'Pickup'}
                          </p>
                          <p className="text-sm text-white/60">
                            {order.order_items?.length || 0} items • KES {order.total_amount}
                          </p>
                          <p className="text-xs text-white/50">
                            {new Date(order.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {order.status === 'pending' && (
                            <Button 
                              size="sm" 
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                              onClick={async () => {
                                await supabase.from('orders').update({ status: 'confirmed' }).eq('id', order.id);
                                toast({ title: "Order accepted", description: "Order is now being prepared" });
                              }}
                            >
                              Accept
                            </Button>
                          )}
                          {order.status === 'confirmed' && (
                            <Button 
                              size="sm" 
                              className="bg-emerald-500 hover:bg-emerald-600 text-white"
                              onClick={async () => {
                                await supabase.from('orders').update({ status: 'shipped' }).eq('id', order.id);
                                toast({ title: "Order ready", description: "Order marked as ready for delivery" });
                              }}
                            >
                              Ready
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'menu':
        return (
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Menu Management</CardTitle>
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Dish
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {menuItems.map((item) => (
                    <Card key={item.id} className="bg-white/5 border-white/10 overflow-hidden hover:bg-white/10 transition-all">
                      <div className="h-40 bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <ChefHat className="h-16 w-16 text-amber-400" />
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-white mb-2">{item.name}</h3>
                        <p className="text-sm text-white/60 mb-3 line-clamp-2">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-amber-400">KES {item.price}</p>
                          <Badge className={item.is_available ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}>
                            {item.is_available ? 'Available' : 'Out of Stock'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-2xl">Restaurant Profile</CardTitle>
                  <Button
                    onClick={updateRestaurant}
                    disabled={loading}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Changes
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-white/80">Restaurant Name</Label>
                    <Input
                      value={restaurant.name}
                      onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      placeholder="Enter restaurant name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white/80">Cuisine Type</Label>
                    <Input
                      value={restaurant.cuisine_type}
                      onChange={(e) => setRestaurant({ ...restaurant, cuisine_type: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      placeholder="e.g., Italian, Chinese, etc."
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-white/80">Description</Label>
                    <Textarea
                      value={restaurant.description}
                      onChange={(e) => setRestaurant({ ...restaurant, description: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 min-h-[100px]"
                      placeholder="Describe your restaurant..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white/80">Minimum Order Amount (KSh)</Label>
                    <Input
                      type="number"
                      value={restaurant.min_order_amount}
                      onChange={(e) => setRestaurant({ ...restaurant, min_order_amount: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white/80">Delivery Fee (KSh)</Label>
                    <Input
                      type="number"
                      value={restaurant.delivery_fee}
                      onChange={(e) => setRestaurant({ ...restaurant, delivery_fee: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-white font-semibold mb-4">Restaurant Status</h3>
                  <div className="flex items-center gap-4">
                    <Badge className={restaurant.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {restaurant.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <p className="text-white/60 text-sm">
                      {restaurant.is_active ? 'Your restaurant is accepting orders' : 'Your restaurant is not accepting orders'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Payment Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/60">Payment integration settings will be available here</p>
              </CardContent>
            </Card>
          </div>
        );

      case 'customers':
        return (
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Customer Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-center py-8">Customer data will appear here as orders are placed</p>
            </CardContent>
          </Card>
        );

      case 'chat':
        return (
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Chat & Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-center py-8">Real-time chat with customers will be available here</p>
            </CardContent>
          </Card>
        );

      case 'staff':
        return (
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Staff Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-center py-8">Add and manage your restaurant staff here</p>
            </CardContent>
          </Card>
        );

      case 'tables':
        return (
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Tables & Reservations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-center py-8">Manage table reservations and seating arrangements</p>
            </CardContent>
          </Card>
        );

      case 'billing':
        return (
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Billing & Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-white/60">Total Revenue: KES {stats.totalRevenue.toLocaleString()}</p>
                <p className="text-white/60">Today's Revenue: KES {stats.todayRevenue.toLocaleString()}</p>
                <p className="text-white/60">Pending Payments: {orders.filter(o => o.payment_status === 'pending').length}</p>
              </div>
            </CardContent>
          </Card>
        );

      case 'analytics':
        return (
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Analytics & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-white/60 text-sm">Total Orders</p>
                  <p className="text-2xl font-bold text-white">{orders.length}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-white/60 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">KES {stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-white/60 text-sm">Menu Items</p>
                  <p className="text-2xl font-bold text-white">{stats.totalMenuItems}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-white/60 text-sm">Avg Rating</p>
                  <p className="text-2xl font-bold text-white">{stats.avgRating}/5</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
            <CardContent className="p-12 text-center">
              <p className="text-white/60 text-lg">This section is under development</p>
              <p className="text-white/40 text-sm mt-2">Coming soon...</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${restaurantBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-2xl bg-white/5 border-b border-white/10 shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-white hover:bg-white/10"
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="relative group cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg group-hover:shadow-amber-500/50 transition-all">
                  {restaurant.logo_url ? (
                    <img src={restaurant.logo_url} alt="Logo" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <Upload className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{restaurant.name || 'APANDA'}</h1>
                <p className="text-xs text-white/60">{restaurant.cuisine_type || 'Premium Dining'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-xl rounded-full px-4 py-2 border border-white/20">
              <Search className="h-4 w-4 text-white/60" />
              <input
                type="text"
                placeholder="Search orders, dishes, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white placeholder:text-white/40 w-64"
              />
            </div>
            
            <Button size="icon" variant="ghost" className="relative text-white hover:bg-white/10">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
            </Button>

            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <Home className="h-5 w-5 mr-2" />
              Home
            </Button>

            <div className="flex items-center gap-3 pl-3 border-l border-white/20">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">Manager</p>
                <p className="text-xs text-white/60">{user?.email}</p>
              </div>
              <Button 
                onClick={() => signOut()} 
                size="icon" 
                variant="ghost" 
                className="text-white hover:bg-white/10"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Layout */}
      <div className="relative z-10 flex">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed lg:sticky top-[73px] left-0 h-[calc(100vh-73px)] w-72 bg-white/5 backdrop-blur-2xl border-r border-white/10 shadow-2xl overflow-y-auto z-30"
            >
              <div className="p-4 space-y-2">
                {sidebarItems.map((item) => (
                  <Button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    variant="ghost"
                    className={`w-full justify-start gap-3 ${
                      currentView === item.id
                        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-white border border-amber-500/30 shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Button>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6 min-h-[calc(100vh-73px)]">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}