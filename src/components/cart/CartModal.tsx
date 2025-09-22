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
    name: string;
    delivery_fee: number;
  };
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

  const handleCheckout = () => {
    if (selectedPayment === 'mpesa') {
      setShowMpesaModal(true);
      return;
    }

    setLoading(true);
    
    // Simulate order processing for other payment methods
    setTimeout(() => {
      toast({
        title: "Order placed!",
        description: "Your order has been placed successfully. You'll receive a confirmation shortly.",
      });
      
      // Clear cart and close modal
      clearCart();
      onClose();
      setLoading(false);
    }, 2000);
  };

  const handleMpesaPaymentComplete = (transactionId: string) => {
    // Process successful M-Pesa payment
    toast({
      title: "Payment successful!",
      description: `Order confirmed. Transaction ID: ${transactionId}`,
    });
    
    // Clear cart and close modals
    clearCart();
    setShowMpesaModal(false);
    onClose();
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