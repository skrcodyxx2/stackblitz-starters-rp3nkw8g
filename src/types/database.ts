export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          role: 'admin' | 'employee' | 'client';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          is_active: boolean;
          must_change_password: boolean;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          role?: 'admin' | 'employee' | 'client';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          must_change_password?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          role?: 'admin' | 'employee' | 'client';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          must_change_password?: boolean;
        };
      };
      company_settings: {
        Row: {
          id: string;
          name: string;
          slogan: string | null;
          description: string | null;
          address: string | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          logo_url: string | null;
          favicon_url: string | null;
          hero_title: string | null;
          hero_subtitle: string | null;
          hero_image_url: string | null;
          tax_tps: number;
          tax_tvq: number;
          business_hours: any;
          social_media: any;
          privacy_policy: string | null;
          terms_of_service: string | null;
          about_us: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name?: string;
          slogan?: string | null;
          description?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          logo_url?: string | null;
          favicon_url?: string | null;
          hero_title?: string | null;
          hero_subtitle?: string | null;
          hero_image_url?: string | null;
          tax_tps?: number;
          tax_tvq?: number;
          business_hours?: any;
          social_media?: any;
          privacy_policy?: string | null;
          terms_of_service?: string | null;
          about_us?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slogan?: string | null;
          description?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          logo_url?: string | null;
          favicon_url?: string | null;
          hero_title?: string | null;
          hero_subtitle?: string | null;
          hero_image_url?: string | null;
          tax_tps?: number;
          tax_tvq?: number;
          business_hours?: any;
          social_media?: any;
          privacy_policy?: string | null;
          terms_of_service?: string | null;
          about_us?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      menu_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      menu_items: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          price: number | null;
          image_url: string | null;
          ingredients: string[] | null;
          allergens: string[] | null;
          preparation_time: number | null;
          calories: number | null;
          is_available: boolean;
          is_festive: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          price?: number | null;
          image_url?: string | null;
          ingredients?: string[] | null;
          allergens?: string[] | null;
          preparation_time?: number | null;
          calories?: number | null;
          is_available?: boolean;
          is_festive?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          description?: string | null;
          price?: number | null;
          image_url?: string | null;
          ingredients?: string[] | null;
          allergens?: string[] | null;
          preparation_time?: number | null;
          calories?: number | null;
          is_available?: boolean;
          is_festive?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      special_menus: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          image_url: string;
          event_type: string;
          price: number | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          image_url: string;
          event_type: string;
          price?: number | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          image_url?: string;
          event_type?: string;
          price?: number | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      gallery_albums: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          cover_image_url: string | null;
          event_date: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          cover_image_url?: string | null;
          event_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          cover_image_url?: string | null;
          event_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      gallery_images: {
        Row: {
          id: string;
          album_id: string | null;
          image_url: string;
          caption: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          album_id?: string | null;
          image_url: string;
          caption?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          album_id?: string | null;
          image_url?: string;
          caption?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_id: string | null;
          order_number: string;
          status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
          delivery_type: 'delivery' | 'pickup';
          delivery_address: string | null;
          delivery_date: string | null;
          delivery_time: string | null;
          subtotal: number;
          tax_amount: number;
          total_amount: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          order_number: string;
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
          delivery_type?: 'delivery' | 'pickup';
          delivery_address?: string | null;
          delivery_date?: string | null;
          delivery_time?: string | null;
          subtotal?: number;
          tax_amount?: number;
          total_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          order_number?: string;
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
          delivery_type?: 'delivery' | 'pickup';
          delivery_address?: string | null;
          delivery_date?: string | null;
          delivery_time?: string | null;
          subtotal?: number;
          tax_amount?: number;
          total_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string | null;
          menu_item_id: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          special_instructions: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          menu_item_id?: string | null;
          quantity?: number;
          unit_price: number;
          total_price: number;
          special_instructions?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          menu_item_id?: string | null;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          special_instructions?: string | null;
          created_at?: string;
        };
      };
      reservations: {
        Row: {
          id: string;
          customer_id: string | null;
          reservation_number: string;
          event_type: string;
          event_date: string;
          event_time: string | null;
          guest_count: number;
          venue_address: string | null;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          special_requests: string | null;
          estimated_cost: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          reservation_number: string;
          event_type: string;
          event_date: string;
          event_time?: string | null;
          guest_count: number;
          venue_address?: string | null;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          special_requests?: string | null;
          estimated_cost?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          reservation_number?: string;
          event_type?: string;
          event_date?: string;
          event_time?: string | null;
          guest_count?: number;
          venue_address?: string | null;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          special_requests?: string | null;
          estimated_cost?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'admin' | 'employee' | 'client';
      order_status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
      reservation_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
      delivery_type: 'delivery' | 'pickup';
    };
  };
}