import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  MapPin, 
  Bed, 
  Bath, 
  Phone, 
  Mail,
  Building,
  Heart,
  Share
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  size: string;
  property_type: string;
  images: string[];
  contact_phone: string;
  contact_email: string;
  latitude: number;
  longitude: number;
}

export default function Properties() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_active', true)
        .limit(20);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, '_self');
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = propertyType === 'all' || property.property_type === propertyType;
    
    let matchesPrice = true;
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      matchesPrice = property.price >= min && (max ? property.price <= max : true);
    }
    
    return matchesSearch && matchesType && matchesPrice;
  });

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
          <h1 className="text-3xl font-bold mb-2">Find Properties</h1>
          <p className="text-muted-foreground mb-6">
            Discover your perfect home or investment opportunity
          </p>

          {/* Search and Filters */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger>
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="land">Land</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="0-50000">Under 50K</SelectItem>
                <SelectItem value="50000-100000">50K - 100K</SelectItem>
                <SelectItem value="100000-500000">100K - 500K</SelectItem>
                <SelectItem value="500000-1000000">500K - 1M</SelectItem>
                <SelectItem value="1000000">Above 1M</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Properties Grid */}
        {loading ? (
          <div className="text-center py-8">Loading properties...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-elegant transition-all">
                  <div className="relative">
                    <img
                      src={property.images?.[0] || '/placeholder.svg'}
                      alt={property.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-primary">
                        {property.property_type}
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button variant="secondary" size="sm" className="p-2">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="sm" className="p-2">
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <Badge className="bg-gold text-gold-foreground">
                        KES {property.price.toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{property.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {property.description}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {property.bedrooms && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Bed className="h-4 w-4 mr-1" />
                          {property.bedrooms} bed
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Bath className="h-4 w-4 mr-1" />
                          {property.bathrooms} bath
                        </div>
                      )}
                      {property.size && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Building className="h-4 w-4 mr-1" />
                          {property.size}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleContact(property.contact_phone)}
                        className="flex-1"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEmail(property.contact_email)}
                        className="flex-1"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {filteredProperties.length === 0 && !loading && (
          <div className="text-center py-16">
            <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search filters or check back later for new listings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}