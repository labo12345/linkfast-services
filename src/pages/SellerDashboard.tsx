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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShoppingBag, 
  Plus, 
  Package,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Upload,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { TransactionsDashboard } from '@/components/transactions/TransactionsDashboard';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [categories, setCategories] = useState([]);
  const [sellerProfile, setSellerProfile] = useState({
    shop_name: '',
    shop_description: '',
    is_verified: false
  });
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    avgRating: 0
  });
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: '',
    images: [],
    featured_image: ''
  });

  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchSellerProfile();
      fetchProducts();
      fetchStats();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (data) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSellerProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (data) {
        setSellerProfile(data);
      }
    } catch (error) {
      console.error('Error fetching seller profile:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data: sellerData } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (sellerData) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', sellerData.id);
        
        if (data) {
          setProducts(data);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchStats = async () => {
    // Mock stats - replace with actual Supabase queries
    setStats({
      totalProducts: 12,
      totalOrders: 45,
      totalRevenue: 125000,
      avgRating: 4.5
    });
  };

  const updateSellerProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('sellers')
        .upsert({
          user_id: user?.id,
          ...sellerProfile
        });

      if (!error) {
        toast({
          title: "Profile updated",
          description: "Your seller profile has been updated successfully"
        });
      }
    } catch (error) {
      console.error('Error updating seller profile:', error);
    }
    setLoading(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setNewProduct({ ...newProduct, featured_image: publicUrl });
      
      toast({
        title: "Image uploaded",
        description: "Product image uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock_quantity || !newProduct.category_id) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including category",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: sellerData } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (sellerData) {
        const productData = {
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          stock_quantity: parseInt(newProduct.stock_quantity),
          category_id: newProduct.category_id,
          seller_id: sellerData.id,
          featured_image: newProduct.featured_image,
          images: newProduct.featured_image ? [newProduct.featured_image] : []
        };

        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (!error) {
          toast({
            title: "Product added successfully!",
            description: "Your product is now live in the marketplace"
          });
          setNewProduct({
            name: '',
            description: '',
            price: '',
            stock_quantity: '',
            category_id: '',
            images: [],
            featured_image: ''
          });
          setShowAddProduct(false);
          fetchProducts();
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
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
              <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your products and track sales
              </p>
            </div>
            
            <Button
              onClick={() => setShowAddProduct(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
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
                  <Package className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Total Products</span>
                </div>
                <div className="text-2xl font-bold mt-2">{stats.totalProducts}</div>
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
                  <ShoppingBag className="h-5 w-5 text-green-600" />
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
                  <TrendingUp className="h-5 w-5 text-gold" />
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
          {/* Shop Profile */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Shop Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="shopName">Shop Name</Label>
                  <Input
                    id="shopName"
                    value={sellerProfile.shop_name}
                    onChange={(e) => setSellerProfile({...sellerProfile, shop_name: e.target.value})}
                    placeholder="Enter your shop name"
                  />
                </div>
                <div>
                  <Label htmlFor="shopDescription">Shop Description</Label>
                  <Textarea
                    id="shopDescription"
                    value={sellerProfile.shop_description}
                    onChange={(e) => setSellerProfile({...sellerProfile, shop_description: e.target.value})}
                    placeholder="Describe your shop and products"
                    rows={3}
                  />
                </div>
                
                {sellerProfile.is_verified && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Verified Seller
                  </Badge>
                )}
                
                <Button onClick={updateSellerProfile} disabled={loading} className="w-full">
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Products Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Your Products ({products.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showAddProduct ? (
                  <div className="space-y-4 mb-6 p-4 border rounded-lg">
                    <h3 className="font-semibold">Add New Product</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="productName">Product Name</Label>
                        <Input
                          id="productName"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                          placeholder="Enter product name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="productPrice">Price (KES)</Label>
                        <Input
                          id="productPrice"
                          type="number"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="productStock">Stock Quantity</Label>
                        <Input
                          id="productStock"
                          type="number"
                          value={newProduct.stock_quantity}
                          onChange={(e) => setNewProduct({...newProduct, stock_quantity: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="productCategory">Category *</Label>
                        <Select
                          value={newProduct.category_id}
                          onValueChange={(value) => setNewProduct({...newProduct, category_id: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category: any) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="productDescription">Description</Label>
                      <Textarea
                        id="productDescription"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                        placeholder="Describe your product"
                        rows={3}
                      />
                    </div>
                    
                    {/* Image Upload */}
                    <div>
                      <Label htmlFor="productImage">Product Image</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="productImage"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('productImage')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                      {newProduct.featured_image && (
                        <div className="mt-2">
                          <img 
                            src={newProduct.featured_image} 
                            alt="Product preview" 
                            className="w-20 h-20 object-cover rounded border"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={addProduct} disabled={loading}>
                        {loading ? 'Adding...' : 'Add Product'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : null}

                {products.length > 0 ? (
                  <div className="space-y-4">
                    {products.map((product: any) => (
                      <div key={product.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <p className="text-muted-foreground mb-2">{product.description}</p>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span>Price: KES {product.price?.toLocaleString()}</span>
                              <span>Stock: {product.stock_quantity}</span>
                              <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                {product.is_active ? 'Active' : 'Inactive'}
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
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No products yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by adding your first product to your shop
                    </p>
                    <Button onClick={() => setShowAddProduct(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Product
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Transactions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <TransactionsDashboard userRole="seller" />
        </motion.div>
      </div>
    </div>
  );
}