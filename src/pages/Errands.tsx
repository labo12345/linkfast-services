import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Clock, 
  MapPin,
  CreditCard,
  User,
  Phone,
  CheckCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ErrandService {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  basePrice: number;
  estimatedTime: string;
}

const errandServices: ErrandService[] = [
  {
    id: 'grocery',
    name: 'Grocery Shopping',
    description: 'We shop for your groceries and deliver to your door',
    icon: Package,
    basePrice: 300,
    estimatedTime: '1-2 hours'
  },
  {
    id: 'documents',
    name: 'Document Collection',
    description: 'Pick up and deliver important documents',
    icon: Package,
    basePrice: 200,
    estimatedTime: '30-60 mins'
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy Pickup',
    description: 'Medicine and health product delivery',
    icon: Package,
    basePrice: 250,
    estimatedTime: '45-90 mins'
  },
  {
    id: 'banking',
    name: 'Banking Services',
    description: 'Deposit, withdrawal, and bank errands',
    icon: Package,
    basePrice: 400,
    estimatedTime: '1-2 hours'
  },
  {
    id: 'postal',
    name: 'Postal Services',
    description: 'Post office visits and package collection',
    icon: Package,
    basePrice: 300,
    estimatedTime: '1 hour'
  },
  {
    id: 'custom',
    name: 'Custom Errand',
    description: 'Any other task you need help with',
    icon: Package,
    basePrice: 500,
    estimatedTime: 'Varies'
  }
];

export default function Errands() {
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState<ErrandService | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [errandDetails, setErrandDetails] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);

  const handleServiceSelect = (service: ErrandService) => {
    setSelectedService(service);
  };

  const calculatePrice = () => {
    if (!selectedService) return 0;
    
    let price = selectedService.basePrice;
    if (urgency === 'urgent') price *= 1.5;
    if (urgency === 'express') price *= 2;
    
    return Math.round(price);
  };

  const handleRequestErrand = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to request an errand",
        variant: "destructive",
      });
      return;
    }

    if (!selectedService || !pickupAddress || !errandDetails) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('errand_orders')
        .insert({
          customer_id: user.id,
          service_type: selectedService.id,
          pickup_address: pickupAddress,
          delivery_address: deliveryAddress || null,
          errand_details: errandDetails,
          urgency: urgency,
          total_amount: calculatePrice(),
          payment_method: paymentMethod
        });

      if (!error) {
        toast({
          title: "Errand request submitted!",
          description: "We'll assign someone to help you shortly",
        });
        
        // Reset form
        setSelectedService(null);
        setPickupAddress('');
        setDeliveryAddress('');
        setErrandDetails('');
      } else {
        throw error;
      }
    } catch (error) {
      console.error('Error creating errand order:', error);
      toast({
        title: "Error",
        description: "Failed to submit errand request. Please try again.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

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
          <h1 className="text-3xl font-bold mb-2">Errand Services</h1>
          <p className="text-muted-foreground">
            Let us handle your tasks while you focus on what matters most
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Service Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            {!selectedService ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">Choose Your Service</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {errandServices.map((service, index) => {
                    const Icon = service.icon;
                    return (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card 
                          className="cursor-pointer hover:shadow-elegant transition-all border-2 hover:border-primary"
                          onClick={() => handleServiceSelect(service)}
                        >
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Icon className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{service.name}</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline">KES {service.basePrice}</Badge>
                                  <Badge variant="outline">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {service.estimatedTime}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground">{service.description}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <selectedService.icon className="h-5 w-5" />
                      {selectedService.name}
                    </CardTitle>
                    <Button variant="outline" onClick={() => setSelectedService(null)}>
                      Change Service
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Pickup Address */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Pickup Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
                      <Input
                        placeholder="Where should we start?"
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Delivery Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold h-4 w-4" />
                      <Input
                        placeholder="Where should we deliver? (Optional)"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Errand Details */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Detailed Instructions *
                    </label>
                    <Textarea
                      placeholder="Please provide specific details about what you need..."
                      value={errandDetails}
                      onChange={(e) => setErrandDetails(e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Urgency</label>
                    <Select value={urgency} onValueChange={setUrgency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal (No rush)</SelectItem>
                        <SelectItem value="urgent">Urgent (+50% fee)</SelectItem>
                        <SelectItem value="express">Express (+100% fee)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Payment Method</label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="mpesa">M-Pesa</SelectItem>
                        <SelectItem value="wallet">Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Summary */}
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span>Base Price:</span>
                      <span>KES {selectedService.basePrice}</span>
                    </div>
                    {urgency !== 'normal' && (
                      <div className="flex items-center justify-between mb-2">
                        <span>Urgency Fee:</span>
                        <span>+{urgency === 'urgent' ? '50%' : '100%'}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex items-center justify-between font-bold">
                      <span>Total:</span>
                      <span className="text-primary">KES {calculatePrice()}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleRequestErrand} 
                    disabled={loading || !pickupAddress || !errandDetails}
                    className="w-full"
                  >
                    {loading ? 'Submitting Request...' : 'Request Errand Service'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Contact & Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-white font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Select Service</p>
                    <p className="text-sm text-muted-foreground">
                      Choose the type of errand you need
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-white font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Provide Details</p>
                    <p className="text-sm text-muted-foreground">
                      Give us clear instructions
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-white font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium">We Handle It</p>
                    <p className="text-sm text-muted-foreground">
                      Our team takes care of everything
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Done!</p>
                    <p className="text-sm text-muted-foreground">
                      Task completed to your satisfaction
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Call: 0111679286
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Call: 0717562660
                </Button>
                <div className="text-sm text-muted-foreground text-center pt-2">
                  Available everywhere in Kenya
                  <br />
                  Currently serving Kerugoya
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}