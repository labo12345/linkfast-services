import React, { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  Car, 
  Utensils, 
  Building, 
  Plus,
  Eye,
  TrendingUp,
  Clock,
  MapPin,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect based on user role
  useEffect(() => {
    if (user) {
      const userRole = user.user_metadata?.role || 'customer';
      switch (userRole) {
        case 'driver':
          navigate('/driver-dashboard');
          break;
        case 'seller':
          navigate('/seller-dashboard');
          break;
        case 'restaurant':
          navigate('/restaurant-dashboard');
          break;
        case 'property_seller':
          navigate('/property-dashboard');
          break;
        default:
          // Customer dashboard stays here
          break;
      }
    }
  }, [user, navigate]);

  // Mock user data - in production this would come from Supabase
  const userStats = {
    totalOrders: 12,
    totalSpent: 25670,
    activeRides: 1,
    favoriteItems: 8,
    walletBalance: 1250,
  };

  const recentOrders = [
    {
      id: 1,
      type: 'marketplace',
      title: 'Wireless Headphones',
      seller: 'TechStore Kenya',
      amount: 2500,
      status: 'delivered',
      date: '2025-01-14',
      image: '/placeholder.svg'
    },
    {
      id: 2,
      type: 'food',
      title: 'Pizza Margherita',
      seller: 'Italian Corner',
      amount: 1200,
      status: 'pending',
      date: '2025-01-15',
      image: '/placeholder.svg'
    },
    {
      id: 3,
      type: 'ride',
      title: 'Ride to Westlands',
      seller: 'Driver John',
      amount: 350,
      status: 'completed',
      date: '2025-01-15',
      image: '/placeholder.svg'
    },
  ];

  const quickActions = [
    {
      icon: ShoppingBag,
      title: 'Shop Marketplace',
      description: 'Browse local products',
      href: '/marketplace',
      color: 'from-primary to-primary-light'
    },
    {
      icon: Utensils,
      title: 'Order Food',
      description: 'Get meals delivered',
      href: '/food',
      color: 'from-gold to-yellow-500'
    },
    {
      icon: Car,
      title: 'Book a Ride',
      description: 'Quick transportation',
      href: '/taxi',
      color: 'from-primary to-red-600'
    },
    {
      icon: Building,
      title: 'Find Properties',
      description: 'Homes & investments',
      href: '/properties',
      color: 'from-gray-700 to-gray-900'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'marketplace':
        return <ShoppingBag className="h-4 w-4" />;
      case 'food':
        return <Utensils className="h-4 w-4" />;
      case 'ride':
        return <Car className="h-4 w-4" />;
      default:
        return <ShoppingBag className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's what's happening with your QUICKLINK account
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
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Total Orders</span>
                </div>
                <div className="text-2xl font-bold mt-2">{userStats.totalOrders}</div>
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
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Total Spent</span>
                </div>
                <div className="text-2xl font-bold mt-2">
                  KES {userStats.totalSpent.toLocaleString()}
                </div>
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
                  <Car className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Active Rides</span>
                </div>
                <div className="text-2xl font-bold mt-2">{userStats.activeRides}</div>
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
                  <Star className="h-5 w-5 text-gold" />
                  <span className="text-sm font-medium">Favorites</span>
                </div>
                <div className="text-2xl font-bold mt-2">{userStats.favoriteItems}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-gold">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 rounded-full bg-gold"></div>
                  <span className="text-sm font-medium">Wallet Balance</span>
                </div>
                <div className="text-2xl font-bold mt-2 text-gold">
                  KES {userStats.walletBalance.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.title}
                      variant="outline"
                      className="w-full h-auto p-4 justify-start hover:shadow-elegant transition-all"
                      onClick={() => navigate(action.href)}
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mr-3`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">{action.title}</div>
                        <div className="text-sm text-muted-foreground">{action.description}</div>
                      </div>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Wallet Section */}
            <Card className="bg-gradient-gold text-gold-foreground">
              <CardHeader>
                <CardTitle>Wallet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">
                  KES {userStats.walletBalance.toLocaleString()}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-gold-foreground text-gold-foreground hover:bg-gold-foreground hover:text-gold">
                    Top Up
                  </Button>
                  <Button variant="outline" size="sm" className="border-gold-foreground text-gold-foreground hover:bg-gold-foreground hover:text-gold">
                    Withdraw
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Orders
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <img
                        src={order.image}
                        alt={order.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(order.type)}
                          <span className="font-semibold">{order.title}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          from {order.seller} • {order.date}
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="font-semibold">
                          KES {order.amount.toLocaleString()}
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}