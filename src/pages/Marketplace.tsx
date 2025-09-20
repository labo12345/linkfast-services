import React from 'react';
import { Header } from '@/components/layout/Header';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Star, 
  Heart,
  Grid,
  List,
  SlidersHorizontal
} from 'lucide-react';

export default function Marketplace() {
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');

  // Fetch categories from Supabase
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch products from Supabase
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories!inner(name),
          sellers(shop_name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.categories?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h1 className="text-3xl lg:text-4xl font-bold">
              Shop Local, Support Community
            </h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Discover products from verified local sellers with fast delivery and secure payments
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <h3 className="font-semibold">Search Products</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Categories
              </h3>
              <div className="space-y-2">
                <Button 
                  variant={!selectedCategory ? "default" : "ghost"} 
                  className="w-full justify-between text-left"
                  onClick={() => setSelectedCategory('')}
                >
                  All Products
                  <Badge variant="secondary">{products.length}</Badge>
                </Button>
                {categories.map((category) => {
                  const categoryProducts = products.filter(p => p.category_id === category.id);
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-between text-left"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                      <Badge variant="secondary">{categoryProducts.length}</Badge>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
              <h3 className="font-semibold">Price Range (KES)</h3>
              <div className="space-y-2">
                <Input placeholder="Min price" type="number" />
                <Input placeholder="Max price" type="number" />
                <Button className="w-full bg-gradient-primary">Apply Filter</Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {filteredProducts.length} products found
                </span>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Sort by: Popular
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Popular Products Banner */}
            {filteredProducts.some(p => p.stock_quantity > 100) && (
              <div className="bg-gradient-gold text-gold-foreground rounded-2xl p-6 mb-8">
                <h2 className="text-2xl font-bold mb-2">Popular Products</h2>
                <p className="opacity-90">Best-selling items from verified sellers</p>
              </div>
            )}

            {/* Products Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="group hover:shadow-elegant transition-all duration-300 border-2 hover:border-primary/20">
                    <CardContent className="p-0">
                      <div className="relative">
                        <img
                          src={product.images?.[0] || '/placeholder.svg'}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2 p-2"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        {product.stock_quantity > 100 && (
                          <Badge className="absolute top-2 left-2 bg-gold text-gold-foreground">
                            Popular
                          </Badge>
                        )}
                        {product.stock_quantity === 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-lg">
                            <span className="text-white font-semibold">Out of Stock</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 space-y-3">
                        <div>
                          <Badge variant="secondary" className="text-xs mb-2">
                            {product.categories?.name}
                          </Badge>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            by {product.sellers?.shop_name || 'Unknown Seller'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-gold fill-current" />
                            <span className="text-sm font-medium">4.5</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            ({Math.floor(Math.random() * 200) + 10} reviews)
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="text-2xl font-bold text-primary">
                              KES {Number(product.price).toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Stock: {product.stock_quantity}
                            </div>
                          </div>
                          
                          <Button 
                            className="bg-gradient-primary hover:opacity-90"
                            disabled={product.stock_quantity === 0}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {product.stock_quantity > 0 ? 'Add to Cart' : 'Sold Out'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            {filteredProducts.length > 0 && (
              <div className="text-center pt-8">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="hover:bg-primary hover:text-primary-foreground"
                >
                  Load More Products
                </Button>
              </div>
            )}

            {/* No Results */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or browse our categories
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}