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
import restaurantBg from '@/assets/restaurant-bg.jpg';

export default function RestaurantDashboard() {
  const { user } = useAuth();
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
    pendingOrders: 8,
    preparingOrders: 5,
    deliveredOrders: 142,
    totalRevenue: 285000,
    todayRevenue: 12500,
    avgRating: 4.8,
    vipGuests: 12
  });
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
      fetchStats();
    }
  }, [user]);

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

  const fetchStats = async () => {
    setStats({
      totalMenuItems: menuItems.length,
      pendingOrders: 8,
      preparingOrders: 5,
      deliveredOrders: 142,
      totalRevenue: 285000,
      todayRevenue: 12500,
      avgRating: 4.8,
      vipGuests: 12
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
              <div className="space-y-4">
                {[
                  { id: 'ORD-001', customer: 'John Doe', table: '12', status: 'pending', items: 'Pasta Carbonara, Caesar Salad', time: '5 min ago' },
                  { id: 'ORD-002', customer: 'Jane Smith', table: 'Room 305', status: 'preparing', items: 'Grilled Salmon, Wine', time: '12 min ago' },
                  { id: 'ORD-003', customer: 'Mike Johnson', table: '8', status: 'ready', items: 'Steak, Mashed Potatoes', time: '18 min ago' },
                ].map((order) => (
                  <div key={order.id} className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <p className="font-semibold text-white">{order.id}</p>
                          <Badge className={
                            order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            order.status === 'preparing' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          }>
                            {order.status === 'pending' && <Clock3 className="h-3 w-3 mr-1" />}
                            {order.status === 'preparing' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                            {order.status === 'ready' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-white/80">{order.customer} - Table/Room: {order.table}</p>
                        <p className="text-sm text-white/60">{order.items}</p>
                        <p className="text-xs text-white/50">{order.time}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                <h1 className="text-xl font-bold text-white">{restaurant.name || 'Restaurant Name'}</h1>
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

            <div className="flex items-center gap-3 pl-3 border-l border-white/20">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">Manager</p>
                <p className="text-xs text-white/60">{user?.email}</p>
              </div>
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/10">
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