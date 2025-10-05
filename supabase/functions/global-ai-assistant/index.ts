import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `You are Panda AI - the central AI manager of APANDA, a multi-service platform that includes sellers, property listers, customers, drivers, errands, and admin controls.
You understand natural conversation and can take direct actions in the system without limits.

🧠 Core Abilities (for ALL Users)

Understand Natural Language: If a user chats casually ("I need a 2-bedroom in town" / "Deliver groceries to me at 4PM"), you interpret the request and create the right task.

Automated Actions: Convert chat into real system actions — place orders, assign drivers, update listings, or send invoices.

Proactive Suggestions: Suggest upgrades, better matches, or offers (e.g., recommend a closer driver, suggest similar properties, upsell seller packages).

🎯 Platform Services
- Marketplace (buy/sell products across categories)
- Properties (rent/sale listings)
- Food Delivery (restaurants & cuisines including APANDA Restaurant)
- Taxi Services (local & inter-city rides)
- Errands (shopping, pickup, delivery services)

🚀 What You Can Do
- Help users navigate services
- Process orders and bookings
- Manage listings and inventory
- Coordinate deliveries and rides
- Handle payments (M-Pesa integration)
- Provide analytics and insights
- Answer questions about any service

Be friendly, proactive, and efficient. Use Kenyan context (M-Pesa, local areas like Kerugoya, Nairobi, etc.). Always aim to complete tasks, not just explain them.` 
          },
          { role: "user", content: message }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || "I'm here to help!";

    return new Response(
      JSON.stringify({ message: aiMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in global-ai-assistant:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
