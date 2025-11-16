export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chats: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      driver_pricing: {
        Row: {
          base_fare: number
          created_at: string | null
          id: string
          minimum_fare: number
          per_km_rate: number
          per_minute_rate: number
          ride_type: string
          updated_at: string | null
          waiting_charge: number | null
        }
        Insert: {
          base_fare: number
          created_at?: string | null
          id?: string
          minimum_fare: number
          per_km_rate: number
          per_minute_rate: number
          ride_type: string
          updated_at?: string | null
          waiting_charge?: number | null
        }
        Update: {
          base_fare?: number
          created_at?: string | null
          id?: string
          minimum_fare?: number
          per_km_rate?: number
          per_minute_rate?: number
          ride_type?: string
          updated_at?: string | null
          waiting_charge?: number | null
        }
        Relationships: []
      }
      drivers: {
        Row: {
          created_at: string | null
          current_latitude: number | null
          current_longitude: number | null
          id: string
          is_online: boolean | null
          is_verified: boolean | null
          license_number: string
          updated_at: string | null
          user_id: string
          vehicle_number: string
          vehicle_type: string
        }
        Insert: {
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          id?: string
          is_online?: boolean | null
          is_verified?: boolean | null
          license_number: string
          updated_at?: string | null
          user_id: string
          vehicle_number: string
          vehicle_type: string
        }
        Update: {
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          id?: string
          is_online?: boolean | null
          is_verified?: boolean | null
          license_number?: string
          updated_at?: string | null
          user_id?: string
          vehicle_number?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      errand_orders: {
        Row: {
          accepted_at: string | null
          completed_at: string | null
          created_at: string | null
          driver_id: string | null
          errand_id: string
          id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          driver_id?: string | null
          errand_id: string
          id?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          driver_id?: string | null
          errand_id?: string
          id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "errand_orders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "errand_orders_errand_id_fkey"
            columns: ["errand_id"]
            isOneToOne: false
            referencedRelation: "errands"
            referencedColumns: ["id"]
          },
        ]
      }
      errands: {
        Row: {
          budget: number | null
          created_at: string | null
          customer_id: string
          delivery_location: string | null
          description: string
          driver_id: string | null
          id: string
          payment_method: string | null
          payment_status: string | null
          pickup_location: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          created_at?: string | null
          customer_id: string
          delivery_location?: string | null
          description: string
          driver_id?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          pickup_location?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          created_at?: string | null
          customer_id?: string
          delivery_location?: string | null
          description?: string
          driver_id?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          pickup_location?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "errands_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_items: {
        Row: {
          category: string
          condition: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          price: number
          seller_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          condition?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          price: number
          seller_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          condition?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          price?: number
          seller_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          name: string
          preparation_time: number | null
          price: number
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name: string
          preparation_time?: number | null
          price: number
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name?: string
          preparation_time?: number | null
          price?: number
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          menu_item_id: string
          order_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_item_id: string
          order_id: string
          quantity?: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_item_id?: string
          order_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_id: string
          delivery_address: string | null
          delivery_fee: number | null
          driver_id: string | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          restaurant_id: string | null
          status: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          delivery_address?: string | null
          delivery_fee?: number | null
          driver_id?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          restaurant_id?: string | null
          status?: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          delivery_address?: string | null
          delivery_fee?: number | null
          driver_id?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          restaurant_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          images: string[] | null
          is_active: boolean | null
          name: string
          price: number
          seller_id: string
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_active?: boolean | null
          name: string
          price: number
          seller_id: string
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_active?: boolean | null
          name?: string
          price?: number
          seller_id?: string
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          amenities: string[] | null
          area_sqm: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          images: string[] | null
          is_available: boolean | null
          latitude: number | null
          longitude: number | null
          price: number
          property_type: string
          size: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address: string
          amenities?: string[] | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_available?: boolean | null
          latitude?: number | null
          longitude?: number | null
          price: number
          property_type: string
          size?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string
          amenities?: string[] | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_available?: boolean | null
          latitude?: number | null
          longitude?: number | null
          price?: number
          property_type?: string
          size?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          address: string | null
          cover_image: string | null
          created_at: string | null
          cuisine_type: string | null
          delivery_fee: number | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          logo_url: string | null
          min_order_amount: number | null
          name: string
          phone: string | null
          rating: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          cover_image?: string | null
          created_at?: string | null
          cuisine_type?: string | null
          delivery_fee?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          min_order_amount?: number | null
          name: string
          phone?: string | null
          rating?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          cover_image?: string | null
          created_at?: string | null
          cuisine_type?: string | null
          delivery_fee?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          min_order_amount?: number | null
          name?: string
          phone?: string | null
          rating?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      rides: {
        Row: {
          created_at: string | null
          customer_id: string
          distance_km: number | null
          driver_id: string | null
          dropoff_lat: number | null
          dropoff_lng: number | null
          dropoff_location: string
          duration_minutes: number | null
          fare: number | null
          id: string
          payment_method: string | null
          payment_status: string | null
          pickup_address: string | null
          pickup_lat: number | null
          pickup_lng: number | null
          pickup_location: string
          ride_type: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          distance_km?: number | null
          driver_id?: string | null
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          dropoff_location: string
          duration_minutes?: number | null
          fare?: number | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          pickup_address?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          pickup_location: string
          ride_type: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          distance_km?: number | null
          driver_id?: string | null
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          dropoff_location?: string
          duration_minutes?: number | null
          fare?: number | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          pickup_address?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          pickup_location?: string
          ride_type?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rides_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      sellers: {
        Row: {
          business_license: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          shop_description: string | null
          shop_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_license?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          shop_description?: string | null
          shop_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_license?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          shop_description?: string | null
          shop_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          restaurant_id: string
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          restaurant_id: string
          role: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          restaurant_id?: string
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          external_reference: string | null
          id: string
          metadata: Json | null
          order_id: string | null
          phone_number: string | null
          provider: string
          reference: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          external_reference?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          phone_number?: string | null
          provider: string
          reference?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          external_reference?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          phone_number?: string | null
          provider?: string
          reference?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_notification: {
        Args: {
          p_message: string
          p_title: string
          p_type?: string
          p_user_id: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer" | "driver" | "seller" | "restaurant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "customer", "driver", "seller", "restaurant"],
    },
  },
} as const
