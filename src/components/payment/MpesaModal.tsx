import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Building2, 
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MpesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentComplete: (transactionId: string) => void;
}

export function MpesaModal({ isOpen, onClose, amount, onPaymentComplete }: MpesaModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [tillNumber, setTillNumber] = useState('');
  const [paybillNumber, setPaybillNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');

  const handleMpesaPayment = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter your M-Pesa phone number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setPaymentStatus('pending');

    // Simulate M-Pesa API call
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate for demo
      
      if (success) {
        const transactionId = `MP${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        setPaymentStatus('success');
        toast({
          title: "Payment successful!",
          description: `Transaction ID: ${transactionId}`,
        });
        onPaymentComplete(transactionId);
        setTimeout(() => {
          onClose();
          resetForm();
        }, 2000);
      } else {
        setPaymentStatus('failed');
        toast({
          title: "Payment failed",
          description: "Please try again or use a different payment method",
          variant: "destructive",
        });
      }
      setLoading(false);
    }, 3000);
  };

  const handleTillPayment = async () => {
    if (!phoneNumber || !tillNumber) {
      toast({
        title: "Missing information",
        description: "Please enter your phone number and till number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setPaymentStatus('pending');

    setTimeout(() => {
      const success = Math.random() > 0.15;
      
      if (success) {
        const transactionId = `TL${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        setPaymentStatus('success');
        toast({
          title: "Till payment successful!",
          description: `Transaction ID: ${transactionId}`,
        });
        onPaymentComplete(transactionId);
        setTimeout(() => {
          onClose();
          resetForm();
        }, 2000);
      } else {
        setPaymentStatus('failed');
        toast({
          title: "Till payment failed",
          description: "Please verify the till number and try again",
          variant: "destructive",
        });
      }
      setLoading(false);
    }, 2500);
  };

  const handlePaybillPayment = async () => {
    if (!phoneNumber || !paybillNumber || !accountNumber) {
      toast({
        title: "Missing information",
        description: "Please fill in all paybill details",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setPaymentStatus('pending');

    setTimeout(() => {
      const success = Math.random() > 0.1;
      
      if (success) {
        const transactionId = `PB${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        setPaymentStatus('success');
        toast({
          title: "Paybill payment successful!",
          description: `Transaction ID: ${transactionId}`,
        });
        onPaymentComplete(transactionId);
        setTimeout(() => {
          onClose();
          resetForm();
        }, 2000);
      } else {
        setPaymentStatus('failed');
        toast({
          title: "Paybill payment failed",
          description: "Please verify the paybill details and try again",
          variant: "destructive",
        });
      }
      setLoading(false);
    }, 3000);
  };

  const resetForm = () => {
    setPhoneNumber('');
    setTillNumber('');
    setPaybillNumber('');
    setAccountNumber('');
    setPaymentStatus('idle');
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1);
    }
    if (cleaned.startsWith('254')) {
      return cleaned;
    }
    return cleaned;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <Smartphone className="h-5 w-5" />
            M-Pesa Payment
          </DialogTitle>
        </DialogHeader>

        {paymentStatus === 'pending' && (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
            <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
            <p className="text-muted-foreground">Please complete the payment on your phone</p>
            <p className="text-sm text-muted-foreground mt-2">Check your phone for M-Pesa prompt</p>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-green-600">Payment Successful!</h3>
            <p className="text-muted-foreground">Your order has been confirmed</p>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-red-600">Payment Failed</h3>
            <p className="text-muted-foreground">Please try again</p>
            <Button 
              onClick={() => setPaymentStatus('idle')} 
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        )}

        {paymentStatus === 'idle' && (
          <>
            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <Badge className="bg-green-600 text-white">
                  KES {amount.toLocaleString()}
                </Badge>
              </div>
            </div>

            <Tabs defaultValue="mobile" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="mobile" className="text-xs">
                  <Smartphone className="h-4 w-4 mr-1" />
                  Mobile
                </TabsTrigger>
                <TabsTrigger value="till" className="text-xs">
                  <Building2 className="h-4 w-4 mr-1" />
                  Till
                </TabsTrigger>
                <TabsTrigger value="paybill" className="text-xs">
                  <CreditCard className="h-4 w-4 mr-1" />
                  Paybill
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mobile" className="space-y-4">
                <div>
                  <Label htmlFor="phone">M-Pesa Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="0712345678 or 254712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the phone number registered with M-Pesa
                  </p>
                </div>

                <Button 
                  onClick={handleMpesaPayment} 
                  disabled={loading || !phoneNumber}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Processing...' : `Pay KES ${amount.toLocaleString()}`}
                </Button>
              </TabsContent>

              <TabsContent value="till" className="space-y-4">
                <div>
                  <Label htmlFor="phone-till">M-Pesa Phone Number</Label>
                  <Input
                    id="phone-till"
                    placeholder="0712345678 or 254712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="till">Till Number</Label>
                  <Input
                    id="till"
                    placeholder="Enter till number"
                    value={tillNumber}
                    onChange={(e) => setTillNumber(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleTillPayment} 
                  disabled={loading || !phoneNumber || !tillNumber}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Processing...' : `Pay to Till KES ${amount.toLocaleString()}`}
                </Button>
              </TabsContent>

              <TabsContent value="paybill" className="space-y-4">
                <div>
                  <Label htmlFor="phone-paybill">M-Pesa Phone Number</Label>
                  <Input
                    id="phone-paybill"
                    placeholder="0712345678 or 254712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="paybill">Paybill Number</Label>
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

                <Button 
                  onClick={handlePaybillPayment} 
                  disabled={loading || !phoneNumber || !paybillNumber || !accountNumber}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Processing...' : `Pay via Paybill KES ${amount.toLocaleString()}`}
                </Button>
              </TabsContent>
            </Tabs>

            <div className="text-center">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}