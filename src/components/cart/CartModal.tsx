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
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [tillNumber, setTillNumber] = useState('');
  const [paybillNumber, setPaybillNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);

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
        title: "Authentication Required",
        description: "Please sign in to complete your order",
        variant: "destructive"
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }

    if (paymentMethod === 'mpesa' && !mpesaNumber) {
      toast({
        title: "M-Pesa Number Required",
        description: "Please enter your M-Pesa phone number",
        variant: "destructive"
      });
      return;
    }

    if (paymentMethod === 'till' && !tillNumber) {
      toast({
        title: "Till Number Required",
        description: "Please enter the till number",
        variant: "destructive"
      });
      return;
    }

    if (paymentMethod === 'paybill' && (!paybillNumber || !accountNumber)) {
      toast({
        title: "Paybill Details Required",
        description: "Please enter both paybill number and account number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          restaurant_id: cart[0]?.restaurant ? 'restaurant-id' : null,
          total_amount: total,
          delivery_fee: deliveryFee,
          payment_method: paymentMethod as any,
          order_type: 'food',
          status: 'pending',
          special_instructions: `Payment via ${paymentMethod}${mpesaNumber ? ` to ${mpesaNumber}` : ''}`
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      for (const item of cart) {
        await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            menu_item_id: item.id,
            quantity: item.quantity,
            unit_price: item.price
          });
      }

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          order_id: order.id,
          amount: total,
          provider: paymentMethod as any,
          status: 'pending',
          metadata: {
            payment_method: paymentMethod,
            phone_number: mpesaNumber,
            till_number: tillNumber,
            paybill_number: paybillNumber,
            account_number: accountNumber
          }
        });

      toast({
        title: "Order Placed Successfully!",
        description: `Order #${order.id.slice(0, 8)} - Total: KES ${total}. ${getPaymentInstructions()}`
      });

      clearCart();
      onClose();
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentInstructions = () => {
    switch (paymentMethod) {
      case 'mpesa':
        return `You'll receive an M-Pesa prompt on ${mpesaNumber}`;
      case 'till':
        return `Pay to Till Number: ${tillNumber}`;
      case 'paybill':
        return `Pay to Paybill: ${paybillNumber}, Account: ${accountNumber}`;
      default:
        return 'Payment instructions will be provided';
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
                
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mpesa">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        M-Pesa (Mobile Money)
                      </div>
                    </SelectItem>
                    <SelectItem value="till">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Lipa na M-Pesa (Till Number)
                      </div>
                    </SelectItem>
                    <SelectItem value="paybill">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        PayBill
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Payment Details */}
                {paymentMethod === 'mpesa' && (
                  <div>
                    <Label htmlFor="mpesa">M-Pesa Phone Number</Label>
                    <Input
                      id="mpesa"
                      placeholder="e.g., 0712345678"
                      value={mpesaNumber}
                      onChange={(e) => setMpesaNumber(e.target.value)}
                    />
                  </div>
                )}

                {paymentMethod === 'till' && (
                  <div>
                    <Label htmlFor="till">Till Number</Label>
                    <Input
                      id="till"
                      placeholder="Enter till number"
                      value={tillNumber}
                      onChange={(e) => setTillNumber(e.target.value)}
                    />
                  </div>
                )}

                {paymentMethod === 'paybill' && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="paybill">PayBill Number</Label>
                      <Input
                        id="paybill"
                        placeholder="Enter paybill number"
                        value={paybillNumber}
                        onChange={(e) => setPaybillNumber(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="account">Account Number</Label>
                      <Input
                        id="account"
                        placeholder="Enter account number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Checkout Button */}
              <Button 
                onClick={handleCheckout} 
                disabled={loading} 
                className="w-full bg-gradient-primary hover:opacity-90"
                size="lg"
              >
                {loading ? 'Processing...' : `Pay KES ${total} - Place Order`}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}