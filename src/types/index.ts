export type Category = 'all' | 'mlbb' | 'freefire' | 'pubg' | 'bloodstrike' | 'hok' | 'eafc' | 'genshin' | 'roblox' | 'mobile' | 'pc' | 'voucher' | string;

export interface TopUpPackage {
  id: string;
  name: string;
  price_usd: number;
  cost_usd: number;
  price_khr: number;
  icon?: string;
  bonus?: string;
  popular?: boolean;
}

export interface InputField {
  id: string;
  label_en: string;
  label_km: string;
  placeholder_en: string;
  placeholder_km: string;
  required: boolean;
}

export interface GameProduct {
  id: string;
  slug: string;
  name_en: string;
  name_km: string;
  subtitle_en: string;
  subtitle_km: string;
  category: Category;
  publisher: string;
  region: string;
  thumbnail: string;
  banner: string;
  badge_en?: string;
  badge_km?: string;
  currency_name_en: string;
  currency_name_km: string;
  instant_delivery: boolean;
  fields: InputField[];
  packages: TopUpPackage[];
  guide_en?: string;
  guide_km?: string;
  is_active: boolean;
  is_popular?: boolean;
  is_hot_deal?: boolean;
}

export interface PaymentMethod {
  id: string;
  name_en: string;
  name_km: string;
  category: string;
  icon: string;
  fee_percent: number;
  fee_fixed_usd: number;
  account_name: string;
  account_number: string;
  badge_en?: string;
  badge_km?: string;
  is_active: boolean;
}

export type OrderStatus = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  reference: string;
  user_id?: string;
  game_slug: string;
  game_name_en: string;
  game_name_km: string;
  product_id: string;
  product_name_en: string;
  product_name_km: string;
  player_id: string;
  server_id?: string;
  amount_usd: number;
  amount_khr: number;
  currency: string;
  payment_method_id: string;
  payment_method_name: string;
  status: OrderStatus;
  provider_id?: string;
  provider_order_id?: string;
  delivery_code?: string;
  customer_contact?: string;
  created_at: string;
  updated_at?: string;
}
