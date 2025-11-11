import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Car, FileText, Phone, Mail, Calendar, MapPin } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Driver {
  id: string;
  user_id: string;
  vehicle_type: string;
  vehicle_number: string;
  license_number: string;
  vehicle_documents: string[];
  is_verified: boolean;
  is_online: boolean;
  created_at: string;
  current_latitude?: number;
  current_longitude?: number;
  users?: {
    full_name: string;
    phone: string;
  };
}

interface DriverVerificationDialogProps {
  driver: Driver | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DriverVerificationDialog({ driver, open, onOpenChange, onSuccess }: DriverVerificationDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!driver) return null;

  const handleVerify = async (isVerified: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ is_verified: isVerified })
        .eq('id', driver.id);

      if (error) throw error;

      toast({
        title: isVerified ? "Driver Verified" : "Driver Rejected",
        description: `Driver application has been ${isVerified ? 'approved' : 'rejected'} successfully`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating driver:', error);
      toast({
        title: "Error",
        description: "Failed to update driver status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Driver Application Review
          </DialogTitle>
          <DialogDescription>
            Review driver details and verification documents
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Banner */}
          <div className={`p-4 rounded-lg ${driver.is_verified ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'} border`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={driver.is_verified ? 'default' : 'secondary'} className="text-sm">
                  {driver.is_verified ? 'Verified' : 'Pending Verification'}
                </Badge>
                <Badge variant={driver.is_online ? 'default' : 'outline'} className="text-sm">
                  {driver.is_online ? 'Online' : 'Offline'}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                Applied: {new Date(driver.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Personal Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{driver.users?.full_name || 'Not provided'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  {driver.users?.phone || 'Not provided'}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Vehicle Information */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Car className="h-4 w-4" />
              Vehicle Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Vehicle Type</p>
                <p className="font-medium capitalize">{driver.vehicle_type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Registration Number</p>
                <p className="font-medium">{driver.vehicle_number}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">License Number</p>
                <p className="font-medium flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  {driver.license_number}
                </p>
              </div>
              {(driver.current_latitude && driver.current_longitude) && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Current Location</p>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    {driver.current_latitude.toFixed(4)}, {driver.current_longitude.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Documents */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Verification Documents
            </h3>
            {driver.vehicle_documents && driver.vehicle_documents.length > 0 ? (
              <div className="grid gap-3">
                {driver.vehicle_documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Document {index + 1}</span>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <a href={doc} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg bg-muted/50">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No documents uploaded</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!driver.is_verified && (
            <>
              <Separator />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleVerify(false)}
                  disabled={loading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleVerify(true)}
                  disabled={loading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve & Verify
                </Button>
              </div>
            </>
          )}

          {driver.is_verified && (
            <>
              <Separator />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleVerify(false)}
                disabled={loading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Revoke Verification
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
