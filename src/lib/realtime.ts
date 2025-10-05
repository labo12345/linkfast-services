import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

let ordersChannel: any = null;
let chatChannel: any = null;
let driversChannel: any = null;
let ridesChannel: any = null;

export function subscribeRealtime() {
  console.log("🔄 Setting up real-time subscriptions...");

  // Orders live updates
  ordersChannel = supabase
    .channel("orders-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders" },
      (payload) => {
        console.log("📦 Order updated:", payload.new);
        
        if (payload.eventType === "INSERT") {
          toast({
            title: "New Order Received",
            description: `Order #${payload.new.id.slice(0, 8)} has been placed`,
          });
        } else if (payload.eventType === "UPDATE") {
          if (payload.new.status === "delivered") {
            toast({
              title: "Order Delivered",
              description: "Your order has been successfully delivered!",
            });
          }
        }
        
        // Trigger custom event for components to listen
        window.dispatchEvent(new CustomEvent("order-update", { detail: payload.new }));
      }
    )
    .subscribe();

  // Chat messages
  chatChannel = supabase
    .channel("chat-messages")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "chats" },
      (payload) => {
        console.log("💬 New chat message:", payload.new);
        window.dispatchEvent(new CustomEvent("chat-message", { detail: payload.new }));
      }
    )
    .subscribe();

  // Driver tracking
  driversChannel = supabase
    .channel("drivers-location")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "drivers" },
      (payload) => {
        console.log("🚗 Driver location updated:", payload.new);
        window.dispatchEvent(new CustomEvent("driver-update", { detail: payload.new }));
      }
    )
    .subscribe();

  // Rides tracking
  ridesChannel = supabase
    .channel("rides-status")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "rides" },
      (payload) => {
        console.log("🚕 Ride updated:", payload.new);
        const rideData = payload.new as any;
        
        if (rideData?.status === "accepted") {
          toast({
            title: "Driver Accepted",
            description: "Your ride has been accepted by a driver!",
          });
        } else if (rideData?.status === "arrived") {
          toast({
            title: "Driver Arrived",
            description: "Your driver has arrived at the pickup location",
          });
        } else if (rideData?.status === "completed") {
          toast({
            title: "Ride Completed",
            description: "Thank you for riding with us!",
          });
        }
        
        window.dispatchEvent(new CustomEvent("ride-update", { detail: payload.new }));
      }
    )
    .subscribe();

  console.log("✅ Real-time subscriptions active");
}

export function unsubscribeRealtime() {
  if (ordersChannel) supabase.removeChannel(ordersChannel);
  if (chatChannel) supabase.removeChannel(chatChannel);
  if (driversChannel) supabase.removeChannel(driversChannel);
  if (ridesChannel) supabase.removeChannel(ridesChannel);
  console.log("🔌 Real-time subscriptions disconnected");
}

// Presence tracking for online users
export function trackUserPresence(userId: string, userType: "customer" | "driver" | "seller") {
  const presenceChannel = supabase.channel("user-presence");

  presenceChannel
    .on("presence", { event: "sync" }, () => {
      const state = presenceChannel.presenceState();
      console.log("👥 Online users:", state);
      window.dispatchEvent(new CustomEvent("presence-update", { detail: state }));
    })
    .on("presence", { event: "join" }, ({ key, newPresences }) => {
      console.log("👋 User joined:", key, newPresences);
    })
    .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
      console.log("👋 User left:", key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await presenceChannel.track({
          user_id: userId,
          user_type: userType,
          online_at: new Date().toISOString(),
        });
      }
    });

  return presenceChannel;
}
