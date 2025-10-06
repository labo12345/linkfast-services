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
            content: `You are Quicklink AI - a helpful assistant for the Quicklink platform, a multi-service marketplace in Kenya.

🎯 Platform Services
- Marketplace (buy/sell products across categories)
- Properties (rent/sale listings)  
- Food Delivery (restaurants & cuisines)
- Taxi Services (local & inter-city rides)
- Errands (shopping, pickup, delivery services)

🧠 Your Role
You are a conversational assistant that helps users by:
- Answering questions about platform services
- Providing information about features and how to use them
- Explaining pricing, policies, and processes
- Helping users understand their options
- Offering guidance on navigating the platform

You do NOT take actions, process orders, or modify data. You only provide helpful information and answer questions.

Be friendly, concise, and helpful. Use Kenyan context (M-Pesa, local areas like Kerugoya, Nairobi, etc.) when relevant.`
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
