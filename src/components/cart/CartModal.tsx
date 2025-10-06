import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Minus, 
  X, 
  ShoppingCart, 
  CreditCard,
  Smartphone,
  Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { MpesaModal } from '@/components/payment/MpesaModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurant?: {
    id?: string;
    name: string;
    delivery_fee: number;
  };
  restaurant_id?: string;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
}

export default function CartModal({ 
  isOpen, 
  onClose, 
  cart, 
  updateQuantity, 
  removeFromCart, 
  clearCart 
}: CartModalProps) {
  const { user } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [showMpesaModal, setShowMpesaModal] = useState(false);

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryFee = cart.length > 0 ? cart[0]?.restaurant?.delivery_fee || 50 : 0;
  const total = subtotal + deliveryFee;

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to place an order",
        variant: "destructive",
      });
      return;
    }

    if (selectedPayment === 'mpesa') {
      setShowMpesaModal(true);
      return;
    }

    setLoading(true);
    
    try {
      // Create order in database
      const restaurantId = cart[0]?.restaurant?.id || cart[0]?.restaurant_id;
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            customer_id: user.id,
            restaurant_id: restaurantId,
            order_type: 'food',
            total_amount: total,
            delivery_fee: deliveryFee,
            payment_method: selectedPayment as 'cash' | 'mpesa' | 'stripe' | 'wallet',
            payment_status: selectedPayment === 'cash' ? 'pending' : 'paid',
            status: 'pending',
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Order placed!",
        description: "Your order has been placed successfully. Track it in your orders.",
      });
      
      clearCart();
      onClose();
    } catch (error) {
      console.error('Order creation error:', error);
      toast({
        title: "Order failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMpesaPaymentComplete = async (transactionId: string) => {
    try {
      const restaurantId = cart[0]?.restaurant?.id || cart[0]?.restaurant_id;
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            customer_id: user?.id,
            restaurant_id: restaurantId,
            order_type: 'food',
            total_amount: total,
            delivery_fee: deliveryFee,
            payment_method: 'mpesa' as const,
            payment_status: 'paid',
            status: 'pending',
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
      }));

      await supabase.from('order_items').insert(orderItems);

      // Record transaction
      await supabase.from('transactions').insert([{
        user_id: user?.id,
        order_id: orderData.id,
        amount: total,
        provider: 'mpesa',
        status: 'completed',
        external_reference: transactionId
      }]);

      toast({
        title: "Payment successful!",
        description: `Order confirmed. Transaction ID: ${transactionId}`,
      });
      
      clearCart();
      setShowMpesaModal(false);
      onClose();
    } catch (error) {
      console.error('M-Pesa order error:', error);
      toast({
        title: "Error",
        description: "Failed to complete order",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart ({cart.reduce((total, item) => total + item.quantity, 0)} items)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cart Items */}
          <div className="space-y-4 max-h-60 overflow-y-auto">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.name}</h4>
                          {item.restaurant && (
                            <p className="text-sm text-muted-foreground">
                              {item.restaurant.name}
                            </p>
                          )}
                          <p className="text-primary font-semibold">
                            KES {item.price} each
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-semibold min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2 pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Subtotal:</span>
                        <span className="font-semibold">KES {item.price * item.quantity}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {cart.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Your cart is empty
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <>
              {/* Order Summary */}
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>KES {subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span>KES {deliveryFee}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span className="text-primary">KES {total}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Payment Method</Label>
                
                <Select value={selectedPayment} onValueChange={setSelectedPayment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mpesa">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        M-Pesa Payment
                      </div>
                    </SelectItem>
                    <SelectItem value="cash">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Cash on Delivery
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Checkout Button */}
              <Button 
                onClick={handleCheckout} 
                disabled={loading} 
                className="w-full bg-gradient-primary hover:opacity-90"
                size="lg"
              >
                {loading ? 'Processing...' : `Place Order - KES ${total}`}
              </Button>
            </>
          )}
        </div>
      </DialogContent>

      <MpesaModal
        isOpen={showMpesaModal}
        onClose={() => setShowMpesaModal(false)}
        amount={total}
        onPaymentComplete={handleMpesaPaymentComplete}
      />
    </Dialog>
  );
}