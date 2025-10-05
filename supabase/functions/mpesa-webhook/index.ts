import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const MPESA_BASE_URL = "https://sandbox.safaricom.co.ke";
const CONSUMER_KEY = Deno.env.get("MPESA_CONSUMER_KEY") || "XmIraIGZHOwreTB2LYYKGYBCIpttgASC3qdUx0HI4FAKAGmm";
const CONSUMER_SECRET = Deno.env.get("MPESA_CONSUMER_SECRET") || "iLyn05mGNGFJzMvnf5BfTyXlVRzEkXS4lO31ErYTJBK2DeX5APcZcA93DGA8JXGL";
const PASSKEY = Deno.env.get("MPESA_PASSKEY") || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
const SHORTCODE = Deno.env.get("MPESA_SHORTCODE") || "174379";

// Generate Access Token
async function getAccessToken() {
  const credentials = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);
  const res = await fetch(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
  });
  const data = await res.json();
  return data.access_token;
}

// STK Push (Initiate Payment)
async function stkPush(phone: string, amount: number, orderId: string) {
  try {
    const token = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
    const password = btoa(`${SHORTCODE}${PASSKEY}${timestamp}`);

    const payload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: phone,
      PartyB: SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mpesa-webhook`,
      AccountReference: orderId,
      TransactionDesc: "APANDA Payment",
    };

    console.log("📱 Initiating STK Push:", { phone, amount, orderId });

    const res = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${token}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("✅ STK Push Response:", data);
    return data;
  } catch (error) {
    console.error("❌ STK Push Error:", error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Webhook Handler (M-Pesa Callback)
    if (req.method === "POST") {
      const body = await req.json();
      console.log("🔔 M-Pesa Callback Received:", JSON.stringify(body, null, 2));

      const result = body?.Body?.stkCallback;
      
      if (result?.ResultCode === 0) {
        // Payment successful
        const metadata = result.CallbackMetadata?.Item || [];
        const orderId = result.MerchantRequestID;
        const mpesaRef = metadata.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value;
        const amount = metadata.find((i: any) => i.Name === "Amount")?.Value;

        console.log("✅ Payment Successful:", { orderId, mpesaRef, amount });

        // Update order status
        const { error } = await supabase
          .from("orders")
          .update({ 
            payment_status: "completed",
            status: "confirmed"
          })
          .eq("id", orderId);

        if (error) {
          console.error("❌ Database Update Error:", error);
        } else {
          console.log("✅ Order updated successfully");
        }

        // Create transaction record
        await supabase.from("transactions").insert({
          order_id: orderId,
          amount: amount,
          provider: "mpesa",
          status: "completed",
          external_reference: mpesaRef,
          metadata: result
        });

      } else {
        console.log("❌ Payment Failed:", result?.ResultDesc);
      }

      return new Response(JSON.stringify({ success: true }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Frontend-triggered payment (Initiate STK Push)
    if (req.method === "GET") {
      const url = new URL(req.url);
      const phone = url.searchParams.get("phone");
      const amount = Number(url.searchParams.get("amount"));
      const orderId = url.searchParams.get("order_id");

      if (!phone || !amount || !orderId) {
        return new Response(
          JSON.stringify({ error: "Missing required parameters: phone, amount, order_id" }), 
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      const data = await stkPush(phone, amount, orderId);
      
      return new Response(JSON.stringify(data), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    return new Response("Method Not Allowed", { 
      status: 405, 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error("❌ Error in mpesa-webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
