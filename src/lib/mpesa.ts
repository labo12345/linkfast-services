import { toast } from "@/hooks/use-toast";

const SUPABASE_URL = "https://cktriqnfikxxjfaceato.supabase.co";

export async function payWithMpesa(
  phone: string,
  amount: number,
  orderId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Format phone number to required format (254...)
    const formattedPhone = phone.startsWith("254") 
      ? phone 
      : phone.startsWith("0") 
      ? `254${phone.slice(1)}` 
      : `254${phone}`;

    console.log("📱 Initiating M-Pesa payment:", { formattedPhone, amount, orderId });

    const url = `${SUPABASE_URL}/functions/v1/mpesa-webhook?phone=${formattedPhone}&amount=${amount}&order_id=${orderId}`;
    
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    
    console.log("✅ STK Push Response:", data);

    if (data.ResponseCode === "0") {
      toast({
        title: "Payment Request Sent",
        description: "Please check your phone to complete the payment",
      });
      return { success: true, data };
    } else {
      toast({
        title: "Payment Failed",
        description: data.ResponseDescription || "Failed to initiate payment",
        variant: "destructive",
      });
      return { success: false, error: data.ResponseDescription };
    }
  } catch (error: any) {
    console.error("❌ M-Pesa Payment Error:", error);
    toast({
      title: "Payment Error",
      description: error.message || "Failed to initiate M-Pesa payment",
      variant: "destructive",
    });
    return { success: false, error: error.message };
  }
}

export function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, "");
  
  // Format to Kenyan format (254...)
  if (cleaned.startsWith("254")) {
    return cleaned;
  } else if (cleaned.startsWith("0")) {
    return `254${cleaned.slice(1)}`;
  } else if (cleaned.startsWith("7") || cleaned.startsWith("1")) {
    return `254${cleaned}`;
  }
  
  return cleaned;
}

export function validatePhoneNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  // Kenyan numbers: 254 followed by 9 digits starting with 7 or 1
  return /^254[71]\d{8}$/.test(formatted);
}
