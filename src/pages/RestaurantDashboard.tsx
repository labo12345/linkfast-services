import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Utensils, 
  Plus, 
  Clock,
  TrendingUp,
  Star,
  ChefHat,
  DollarSign,
  Package
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function RestaurantDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showAddMenuItem, setShowAddMenuItem] = useState(false);
  const [restaurant, setRestaurant] = useState({
    name: '',
    description: '',
    cuisine_type: '',
    min_order_amount: '',
    delivery_fee: '',
    is_active: true
  });
  const [menuItems, setMenuItems] = useState([]);
  const [stats, setStats] = useState({
    totalMenuItems: 0,
    totalOrders: 0,
    totalRevenue: 0,
    avgRating: 0
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
    // Mock stats - replace with actual Supabase queries
    setStats({
      totalMenuItems: menuItems.length,
      totalOrders: 28,
      totalRevenue: 85000,
      avgRating: 4.2
    });
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
            setShowAddMenuItem(false);
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Restaurant Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your restaurant and menu items
              </p>
            </div>
            
            <Button
              onClick={() => setShowAddMenuItem(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item
            </Button>
          </div>
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
                  <ChefHat className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Menu Items</span>
                </div>
                <div className="text-2xl font-bold mt-2">{stats.totalMenuItems}</div>
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
                  <Package className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Total Orders</span>
                </div>
                <div className="text-2xl font-bold mt-2">{stats.totalOrders}</div>
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
                  <span className="text-sm font-medium">Revenue</span>
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
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium">Avg Rating</span>
                </div>
                <div className="text-2xl font-bold mt-2">{stats.avgRating}/5</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Restaurant Profile */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Restaurant Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="restaurantName">Restaurant Name</Label>
                  <Input
                    id="restaurantName"
                    value={restaurant.name}
                    onChange={(e) => setRestaurant({...restaurant, name: e.target.value})}
                    placeholder="Enter restaurant name"
                  />
                </div>
                <div>
                  <Label htmlFor="cuisineType">Cuisine Type</Label>
                  <Input
                    id="cuisineType"
                    value={restaurant.cuisine_type}
                    onChange={(e) => setRestaurant({...restaurant, cuisine_type: e.target.value})}
                    placeholder="e.g., Italian, Chinese, Local"
                  />
                </div>
                <div>
                  <Label htmlFor="minOrder">Minimum Order (KES)</Label>
                  <Input
                    id="minOrder"
                    type="number"
                    value={restaurant.min_order_amount}
                    onChange={(e) => setRestaurant({...restaurant, min_order_amount: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryFee">Delivery Fee (KES)</Label>
                  <Input
                    id="deliveryFee"
                    type="number"
                    value={restaurant.delivery_fee}
                    onChange={(e) => setRestaurant({...restaurant, delivery_fee: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={restaurant.description}
                    onChange={(e) => setRestaurant({...restaurant, description: e.target.value})}
                    placeholder="Describe your restaurant"
                    rows={3}
                  />
                </div>
                
                <Button onClick={updateRestaurant} disabled={loading} className="w-full">
                  {loading ? 'Updating...' : 'Update Restaurant'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Menu Items Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  Menu Items ({menuItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showAddMenuItem ? (
                  <div className="space-y-4 mb-6 p-4 border rounded-lg">
                    <h3 className="font-semibold">Add New Menu Item</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="itemName">Item Name</Label>
                        <Input
                          id="itemName"
                          value={newMenuItem.name}
                          onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
                          placeholder="Enter menu item name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="itemPrice">Price (KES)</Label>
                        <Input
                          id="itemPrice"
                          type="number"
                          value={newMenuItem.price}
                          onChange={(e) => setNewMenuItem({...newMenuItem, price: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="prepTime">Preparation Time (minutes)</Label>
                        <Input
                          id="prepTime"
                          type="number"
                          value={newMenuItem.preparation_time}
                          onChange={(e) => setNewMenuItem({...newMenuItem, preparation_time: e.target.value})}
                          placeholder="15"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <select
                          id="category"
                          value={newMenuItem.category_id}
                          onChange={(e) => setNewMenuItem({...newMenuItem, category_id: e.target.value})}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="">Select category</option>
                          <option value="appetizers">Appetizers</option>
                          <option value="main">Main Courses</option>
                          <option value="desserts">Desserts</option>
                          <option value="beverages">Beverages</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="itemDescription">Description</Label>
                      <Textarea
                        id="itemDescription"
                        value={newMenuItem.description}
                        onChange={(e) => setNewMenuItem({...newMenuItem, description: e.target.value})}
                        placeholder="Describe the menu item"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={addMenuItem} disabled={loading}>
                        {loading ? 'Adding...' : 'Add Menu Item'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddMenuItem(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : null}

                {menuItems.length > 0 ? (
                  <div className="space-y-4">
                    {menuItems.map((item: any) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <p className="text-muted-foreground mb-2">{item.description}</p>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span>Price: KES {item.price?.toLocaleString()}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {item.preparation_time}min
                              </span>
                              <Badge variant={item.is_available ? 'default' : 'secondary'}>
                                {item.is_available ? 'Available' : 'Out of Stock'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No menu items yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by adding your first menu item
                    </p>
                    <Button onClick={() => setShowAddMenuItem(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Menu Item
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}