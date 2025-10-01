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
    { icon: ShoppingBag, label: "Active Merchants", value: "2K+" },
    { icon: Users, label: "Happy Customers", value: "3K+" },
    { icon: Car, label: "Drivers Online", value: "100+" },
    { icon: Clock, label: "Support", value: "24/7" },
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
              <div className="grid grid-cols-2 gap-3">
                {services.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <motion.div
                      key={service.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(212, 175, 55, 0.4)' }}
                      transition={{ duration: 0.3 }}
                      className={`bg-gradient-to-br ${service.color} rounded-2xl p-4 text-white cursor-pointer shadow-elegant relative overflow-hidden group`}
                      onClick={() => handleServiceClick(service.href)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Icon className="h-6 w-6 mb-1 relative z-10" />
                      <h3 className="font-semibold text-sm relative z-10">{service.title}</h3>
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

      {/* Animated Showcase Section */}
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
              Discover What's <span className="text-primary">Available</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From delicious meals to dream properties - explore our marketplace
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Properties Showcase */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -10 }}
              className="group cursor-pointer"
              onClick={() => handleServiceClick('/properties')}
            >
              <Card className="overflow-hidden border-2 hover:border-primary/20 transition-all">
                <div className="relative h-48 overflow-hidden">
                  <motion.img 
                    src="/src/assets/property-house.webp"
                    alt="Properties"
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge className="absolute top-4 right-4 bg-gold text-gold-foreground">
                    Properties
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    Find Your Dream Home
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Browse verified listings for houses, apartments, and land
                  </p>
                  <Button className="w-full bg-gradient-primary hover:opacity-90">
                    View Properties <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Food Showcase */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -10 }}
              className="group cursor-pointer"
              onClick={() => handleServiceClick('/food')}
            >
              <Card className="overflow-hidden border-2 hover:border-gold/20 transition-all">
                <div className="relative h-48 overflow-hidden">
                  <motion.img 
                    src="/src/assets/food-burger.webp"
                    alt="Fast Food"
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                    Fast Food
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-gold transition-colors">
                    Delicious Meals Delivered
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Order from top restaurants and enjoy hot meals fast
                  </p>
                  <Button className="w-full bg-gradient-gold hover:opacity-90">
                    Order Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Products Showcase */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -10 }}
              className="group cursor-pointer"
              onClick={() => handleServiceClick('/marketplace')}
            >
              <Card className="overflow-hidden border-2 hover:border-primary/20 transition-all">
                <div className="relative h-48 overflow-hidden">
                  <motion.img 
                    src="/src/assets/category-electronics.webp"
                    alt="Products"
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge className="absolute top-4 right-4 bg-gold text-gold-foreground">
                    Marketplace
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    Shop Local Products
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Discover quality products from verified local sellers
                  </p>
                  <Button className="w-full bg-gradient-primary hover:opacity-90">
                    Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

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

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">Q</span>
                </div>
                <span className="font-bold text-xl text-gold">QUICKLINK</span>
              </div>
              <p className="text-gray-400">
                Everything You Need, One App. Built for convenience, security and speed.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4 text-gold">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/marketplace" className="hover:text-gold transition-colors">Marketplace</a></li>
                <li><a href="/food" className="hover:text-gold transition-colors">Fast Food</a></li>
                <li><a href="/taxi" className="hover:text-gold transition-colors">Taxi & Errands</a></li>
                <li><a href="/properties" className="hover:text-gold transition-colors">Properties</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4 text-gold">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center space-x-2">
                  <span>📞</span>
                  <span>0111679286</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>📞</span>
                  <span>0717562660</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gold" />
                  <span>Everywhere - Currently Kerugoya</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4 text-gold">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-gold transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-gold transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-gold transition-colors">Privacy Policy</a></li>
                <li><span className="text-gold">24/7 Available</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 QUICKLINK SERVICES. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
