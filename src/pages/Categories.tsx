import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  ArrowRight, 
  Package,
  Smartphone,
  Shirt,
  Home,
  Heart,
  Dumbbell
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Import images
import electronicsImg from '@/assets/category-electronics.webp';
import fashionImg from '@/assets/category-fashion.webp';
import homeImg from '@/assets/category-home.webp';

interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
  is_active: boolean;
}

const categoryIcons: Record<string, any> = {
  'Electronics': Smartphone,
  'Fashion': Shirt,
  'Home & Garden': Home,
  'Health & Beauty': Heart,
  'Sports & Fitness': Dumbbell,
};

const categoryImages: Record<string, string> = {
  'Electronics': electronicsImg,
  'Fashion': fashionImg,
  'Home & Garden': homeImg,
};

export default function Categories() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    // Navigate to marketplace with category filter
    navigate(`/marketplace?category=${encodeURIComponent(categoryName)}`);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Shop by Category</h1>
            <p className="text-muted-foreground">
              Discover products across our wide range of categories
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Categories Grid */}
        {loading ? (
          <div className="text-center py-8">Loading categories...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category, index) => {
              const IconComponent = categoryIcons[category.name] || Package;
              const imageUrl = categoryImages[category.name] || category.image_url;
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-elegant transition-all cursor-pointer group h-full">
                    <div 
                      className="relative overflow-hidden rounded-t-lg"
                      onClick={() => handleCategoryClick(category.name)}
                    >
                      <img
                        src={imageUrl}
                        alt={category.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <div className="bg-white/20 backdrop-blur rounded-full p-2 mb-2">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>{category.name}</span>
                        <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        {category.description}
                      </p>
                      
                      <Button 
                        onClick={() => handleCategoryClick(category.name)}
                        className="w-full"
                        variant="outline"
                      >
                        Browse {category.name}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {filteredCategories.length === 0 && !loading && (
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No categories found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or check back later for new categories.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}