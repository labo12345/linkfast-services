import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { 
  ShoppingBag, 
  Utensils, 
  Car, 
  Building, 
  ArrowRight, 
  Star, 
  Clock, 
  Shield,
  Zap,
  Users,
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const services = [
    {
      icon: ShoppingBag,
      title: 'Marketplace',
      description: 'Shop from local stores and get products delivered to your door',
      color: 'from-primary to-primary-light',
      href: '/marketplace',
      features: ['Local Products', 'Fast Delivery', 'Secure Payment']
    },
    {
      icon: Utensils,
      title: 'Fast Food',
      description: 'Order from your favorite restaurants with quick delivery',
      color: 'from-gold to-yellow-500',
      href: '/food',
      features: ['Hot Meals', '30min Delivery', 'Live Tracking']
    },
    {
      icon: Car,
      title: 'Taxi & Errands',
      description: 'Get rides and delivery services for all your needs',
      color: 'from-primary to-red-600',
      href: '/taxi',
      features: ['Live Location', 'Safe Rides', 'Errand Service']
    },
    {
      icon: Building,
      title: 'Properties',
      description: 'Find your perfect home or investment property',
      color: 'from-gray-700 to-gray-900',
      href: '/properties',
      features: ['Verified Listings', 'Virtual Tours', 'Direct Contact']
    }
  ];

  const stats = [
    { icon: Users, label: 'Active Users', value: '50K+' },
    { icon: Shield, label: 'Secure Transactions', value: '99.9%' },
    { icon: Zap, label: 'Avg Delivery Time', value: '25min' },
    { icon: MapPin, label: 'Service Areas', value: '20+' },
  ];

  const handleServiceClick = (href: string) => {
    if (!user) {
      navigate('/auth');
    } else {
      navigate(href);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero text-white">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Badge variant="outline" className="border-gold text-gold bg-gold/10">
                  ⚡ Your time is our priority
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Everything You Need,{' '}
                  <span className="text-transparent bg-gradient-gold bg-clip-text">
                    One App
                  </span>
                </h1>
                <p className="text-xl text-gray-200 max-w-lg">
                  QUICKLINK SERVICES connects customers with local stores, restaurants, 
                  drivers and trusted service professionals — fast. Whether you need groceries, 
                  lunch, a ride, a delivery or property options, our platform brings it all 
                  into one secure app.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold px-8"
                  onClick={() => handleServiceClick('/marketplace')}
                >
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-primary font-semibold px-8"
                  onClick={() => navigate('/about')}
                >
                  Learn More
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                {services.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <motion.div
                      key={service.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                      className={`bg-gradient-to-br ${service.color} rounded-2xl p-6 text-white hover:scale-105 transition-transform cursor-pointer shadow-elegant`}
                      onClick={() => handleServiceClick(service.href)}
                    >
                      <Icon className="h-8 w-8 mb-2" />
                      <h3 className="font-semibold text-lg">{service.title}</h3>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="border-t border-white/20 bg-white/10 backdrop-blur">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="text-center">
                    <Icon className="h-8 w-8 mx-auto mb-2 text-gold" />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-gray-200">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Built for <span className="text-primary">Convenience</span>, 
              <span className="text-gold"> Security</span> & 
              <span className="text-primary"> Speed</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose from our comprehensive services designed to save you time and effort
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card 
                    className="h-full hover:shadow-elegant transition-all duration-300 cursor-pointer group border-2 hover:border-primary/20"
                    onClick={() => handleServiceClick(service.href)}
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {service.description}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {service.features.map((feature) => (
                          <div key={feature} className="flex items-center space-x-2 text-sm">
                            <Star className="h-4 w-4 text-gold fill-current" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Button 
                        className="w-full mt-4 bg-gradient-primary hover:opacity-90 group-hover:shadow-glow transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleServiceClick(service.href);
                        }}
                      >
                        {user ? 'Explore' : 'Sign In to Start'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8 max-w-3xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to Experience the Future of Local Services?
            </h2>
            <p className="text-xl opacity-90">
              Join thousands of satisfied customers who trust QUICKLINK SERVICES 
              for all their daily needs. Fast, secure, and reliable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold px-8"
                onClick={() => navigate('/auth')}
              >
                {user ? 'Go to Dashboard' : 'Join QUICKLINK Today'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-primary font-semibold px-8"
                onClick={() => navigate('/contact')}
              >
                Contact Support
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
