import React from 'react';
import { Header } from '@/components/layout/Header';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Zap, 
  Users, 
  Clock, 
  Star,
  Phone,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Secure & Trusted",
      description: "End-to-end encryption and verified vendors for your peace of mind"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Quick service delivery with real-time tracking and updates"
    },
    {
      icon: Users,
      title: "Community Focused",
      description: "Supporting local businesses and building stronger communities"
    },
    {
      icon: Clock,
      title: "24/7 Available",
      description: "Round-the-clock support and service availability"
    }
  ];

  const services = [
    {
      title: "Marketplace",
      description: "Shop from verified local stores with guaranteed quality and fast delivery."
    },
    {
      title: "Food Delivery",
      description: "Order from restaurants with live tracking and hot meal guarantees."
    },
    {
      title: "Taxi & Errands",
      description: "Reliable transportation and errand services with trusted drivers."
    },
    {
      title: "Property Listings",
      description: "Find your dream home or investment property with verified listings."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">
            About QUICKLINK SERVICES
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Everything You Need,{' '}
            <span className="text-transparent bg-gradient-gold bg-clip-text">
              One Platform
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            QUICKLINK SERVICES is Kenya's premier super-app connecting customers 
            with local businesses, restaurants, drivers, and property listings. 
            We're revolutionizing how people access essential services in their communities.
          </p>
          <Button 
            size="lg"
            className="bg-gradient-primary hover:opacity-90"
            onClick={() => navigate('/auth')}
          >
            Join QUICKLINK Today <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center h-full">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center">
                      <Icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Services Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Our Services</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={service.title} className="hover:shadow-elegant transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-gold fill-current" />
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center bg-muted/50 rounded-2xl p-8"
        >
          <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Have questions or need support? Our team is here to help you 24/7.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-md mx-auto">
            <Button variant="outline" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              0111679286
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              0717562660
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Currently serving Kerugoya and expanding across Kenya</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}