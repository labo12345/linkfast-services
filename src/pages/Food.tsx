import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  ShoppingCart, 
  Star, 
  Clock, 
  Utensils,
  Plus,
  Minus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Import food images
import burgerImg from '@/assets/food-burger.webp';
import pizzaImg from '@/assets/food-pizza.webp';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  preparation_time: number;
  category_id: string;
  restaurant: {
    id: string;
    name: string;
    rating: number;
    delivery_fee: number;
  };
}

interface CartItem extends MenuItem {
  quantity: number;
}

export default function Food() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          restaurants!inner(id, name, rating, delivery_fee)
        `)
        .eq('is_available', true)
        .limit(20);

      if (error) throw error;

      const transformedData = data?.map(item => ({
        ...item,
        restaurant: {
          id: item.restaurants.id,
          name: item.restaurants.name,
          rating: item.restaurants.rating,
          delivery_fee: item.restaurants.delivery_fee
        }
      })) || [];

      setMenuItems(transformedData);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    
    toast({
      title: "Added to cart",
      description: `${item.name} added to your cart`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter(item => item.id !== itemId);
    });
  };

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Order Food</h1>
              <p className="text-muted-foreground">
                Delicious meals delivered to your doorstep
              </p>
            </div>
            
            {cartItemsCount > 0 && (
              <Button className="relative">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Cart ({cartItemsCount})
                <Badge className="absolute -top-2 -right-2 bg-red-500">
                  {cartItemsCount}
                </Badge>
              </Button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search restaurants or dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="text-center py-8">Loading delicious food...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-elegant transition-all">
                  <div className="relative">
                    <img
                      src={item.image_url?.includes('burger') ? burgerImg : 
                           item.image_url?.includes('pizza') ? pizzaImg :
                           item.image_url || '/placeholder.svg'}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 right-2 bg-primary">
                      <Star className="h-3 w-3 mr-1" />
                      {item.restaurant.rating}
                    </Badge>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.restaurant.name}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-primary">
                        KES {item.price}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {item.preparation_time} mins
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Utensils className="h-4 w-4 mr-1" />
                        Delivery: KES {item.restaurant.delivery_fee}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {cart.find(cartItem => cartItem.id === item.id) ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-semibold">
                            {cart.find(cartItem => cartItem.id === item.id)?.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addToCart(item)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => addToCart(item)}
                          className="flex-1"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-16">
            <Utensils className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No food items found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or check back later for new items.
            </p>
          </div>
        )}

        {/* Cart Summary */}
        {cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-card border rounded-lg p-4 shadow-lg"
          >
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Cart Total</p>
              <p className="text-xl font-bold">KES {cartTotal}</p>
              <Button className="w-full mt-2">
                Checkout ({cartItemsCount} items)
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}