import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Upload, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function SellerOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shop_name: '',
    shop_description: '',
    business_license: ''
  });

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('sellers')
        .insert([
          {
            user_id: user.id,
            ...formData,
            is_verified: false
          }
        ]);

      if (error) throw error;

      toast({
        title: "Application submitted!",
        description: "Your seller application is under review.",
      });

      navigate('/seller-dashboard');
    } catch (error) {
      console.error('Seller registration error:', error);
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-6 w-6" />
            Start Selling
          </CardTitle>
          <p className="text-muted-foreground">
            Set up your shop and start selling
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Shop Name</Label>
            <Input
              placeholder="Enter your shop name"
              value={formData.shop_name}
              onChange={(e) =>
                setFormData({ ...formData, shop_name: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Shop Description</Label>
            <Textarea
              placeholder="Tell customers about your business"
              value={formData.shop_description}
              onChange={(e) =>
                setFormData({ ...formData, shop_description: e.target.value })
              }
              rows={4}
            />
          </div>

          <div>
            <Label>Business License Number (Optional)</Label>
            <Input
              placeholder="Enter your business license number"
              value={formData.business_license}
              onChange={(e) =>
                setFormData({ ...formData, business_license: e.target.value })
              }
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.shop_name}
            className="w-full"
          >
            {loading ? 'Submitting...' : 'Create Shop'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}