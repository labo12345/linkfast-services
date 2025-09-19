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
  Building, 
  Plus, 
  MapPin,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Upload,
  Phone,
  Mail
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function PropertySellerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalViews: 0,
    totalInquiries: 0,
    avgPrice: 0
  });
  const [newProperty, setNewProperty] = useState({
    title: '',
    description: '',
    price: '',
    property_type: '',
    bedrooms: '',
    bathrooms: '',
    size: '',
    contact_phone: '',
    contact_email: '',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    if (user) {
      fetchProperties();
      fetchStats();
    }
  }, [user]);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('seller_id', user?.id);
      
      if (data) {
        setProperties(data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchStats = async () => {
    // Mock stats - replace with actual Supabase queries
    setStats({
      totalProperties: properties.length,
      totalViews: 150,
      totalInquiries: 25,
      avgPrice: 2500000
    });
  };

  const addProperty = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('properties')
        .insert({
          ...newProperty,
          price: parseFloat(newProperty.price),
          bedrooms: parseInt(newProperty.bedrooms) || null,
          bathrooms: parseInt(newProperty.bathrooms) || null,
          latitude: parseFloat(newProperty.latitude) || null,
          longitude: parseFloat(newProperty.longitude) || null,
          seller_id: user?.id
        });

      if (!error) {
        toast({
          title: "Property added",
          description: "Your property has been listed successfully"
        });
        setNewProperty({
          title: '',
          description: '',
          price: '',
          property_type: '',
          bedrooms: '',
          bathrooms: '',
          size: '',
          contact_phone: '',
          contact_email: '',
          latitude: '',
          longitude: ''
        });
        setShowAddProperty(false);
        fetchProperties();
      }
    } catch (error) {
      console.error('Error adding property:', error);
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
              <h1 className="text-3xl font-bold mb-2">Property Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your property listings
              </p>
            </div>
            
            <Button
              onClick={() => setShowAddProperty(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Property
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
                  <Building className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Total Properties</span>
                </div>
                <div className="text-2xl font-bold mt-2">{stats.totalProperties}</div>
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
                  <Eye className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Total Views</span>
                </div>
                <div className="text-2xl font-bold mt-2">{stats.totalViews}</div>
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
                  <Phone className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Inquiries</span>
                </div>
                <div className="text-2xl font-bold mt-2">{stats.totalInquiries}</div>
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
                  <DollarSign className="h-5 w-5 text-gold" />
                  <span className="text-sm font-medium">Avg Price</span>
                </div>
                <div className="text-2xl font-bold mt-2">
                  KES {stats.avgPrice.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Properties Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Your Properties ({properties.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showAddProperty ? (
                <div className="space-y-4 mb-6 p-4 border rounded-lg">
                  <h3 className="font-semibold">Add New Property</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="propertyTitle">Property Title</Label>
                      <Input
                        id="propertyTitle"
                        value={newProperty.title}
                        onChange={(e) => setNewProperty({...newProperty, title: e.target.value})}
                        placeholder="Enter property title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="propertyPrice">Price (KES)</Label>
                      <Input
                        id="propertyPrice"
                        type="number"
                        value={newProperty.price}
                        onChange={(e) => setNewProperty({...newProperty, price: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="propertyType">Property Type</Label>
                      <select
                        id="propertyType"
                        value={newProperty.property_type}
                        onChange={(e) => setNewProperty({...newProperty, property_type: e.target.value})}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Select type</option>
                        <option value="house">House</option>
                        <option value="apartment">Apartment</option>
                        <option value="land">Land</option>
                        <option value="commercial">Commercial</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="propertySize">Size</Label>
                      <Input
                        id="propertySize"
                        value={newProperty.size}
                        onChange={(e) => setNewProperty({...newProperty, size: e.target.value})}
                        placeholder="e.g., 3 bedrooms, 1000 sqft"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bedrooms">Bedrooms</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        value={newProperty.bedrooms}
                        onChange={(e) => setNewProperty({...newProperty, bedrooms: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bathrooms">Bathrooms</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        value={newProperty.bathrooms}
                        onChange={(e) => setNewProperty({...newProperty, bathrooms: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        value={newProperty.contact_phone}
                        onChange={(e) => setNewProperty({...newProperty, contact_phone: e.target.value})}
                        placeholder="Your phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={newProperty.contact_email}
                        onChange={(e) => setNewProperty({...newProperty, contact_email: e.target.value})}
                        placeholder="Your email address"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="propertyDescription">Description</Label>
                    <Textarea
                      id="propertyDescription"
                      value={newProperty.description}
                      onChange={(e) => setNewProperty({...newProperty, description: e.target.value})}
                      placeholder="Describe your property"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addProperty} disabled={loading}>
                      {loading ? 'Adding...' : 'Add Property'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddProperty(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}

              {properties.length > 0 ? (
                <div className="space-y-4">
                  {properties.map((property: any) => (
                    <div key={property.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{property.title}</h3>
                          <p className="text-muted-foreground mb-2">{property.description}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground mb-2">
                            <span>Price: KES {property.price?.toLocaleString()}</span>
                            <span>Type: {property.property_type}</span>
                            {property.bedrooms && <span>{property.bedrooms} bed</span>}
                            {property.bathrooms && <span>{property.bathrooms} bath</span>}
                          </div>
                          <div className="flex gap-2 text-sm">
                            {property.contact_phone && (
                              <Badge variant="outline">
                                <Phone className="h-3 w-3 mr-1" />
                                {property.contact_phone}
                              </Badge>
                            )}
                            {property.contact_email && (
                              <Badge variant="outline">
                                <Mail className="h-3 w-3 mr-1" />
                                {property.contact_email}
                              </Badge>
                            )}
                            <Badge variant={property.is_active ? 'default' : 'secondary'}>
                              {property.is_active ? 'Listed' : 'Unlisted'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No properties listed yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding your first property listing
                  </p>
                  <Button onClick={() => setShowAddProperty(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Property
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}