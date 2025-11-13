import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, Car, ShoppingBag, Building, AlertCircle, 
  DollarSign, TrendingUp, Package, Utensils
} from 'lucide-react';

interface AdminStatsProps {
  stats: {
    totalUsers: number;
    totalDrivers: number;
    totalProducts: number;
    totalProperties: number;
    totalRestaurants: number;
    pendingApprovals: number;
    totalOrders: number;
    totalRevenue: number;
    activeDrivers: number;
  };
}

export function AdminStats({ stats }: AdminStatsProps) {
  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      trend: "+12% from last month"
    },
    {
      title: "Active Drivers",
      value: `${stats.activeDrivers}/${stats.totalDrivers}`,
      icon: Car,
      color: "text-green-600",
      bgColor: "bg-green-100",
      trend: `${stats.totalDrivers} total`
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      trend: "+23% this week"
    },
    {
      title: "Total Revenue",
      value: `KES ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      trend: "+18% from last month"
    },
    {
      title: "Products",
      value: stats.totalProducts,
      icon: ShoppingBag,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      trend: "Active listings"
    },
    {
      title: "Properties",
      value: stats.totalProperties,
      icon: Building,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      trend: "Listed properties"
    },
    {
      title: "Restaurants",
      value: stats.totalRestaurants,
      icon: Utensils,
      color: "text-red-600",
      bgColor: "bg-red-100",
      trend: "Active restaurants"
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals,
      icon: AlertCircle,
      color: "text-rose-600",
      bgColor: "bg-rose-100",
      trend: "Requires action"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.trend}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
