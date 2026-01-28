export type WishItemImportance = 'must-have' | 'would-love' | 'nice-to-have' | 'not-sure';
export type Currency = 'EUR' | 'GBP' | 'USD';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: number;
  avatar_url?: string;
  name?: string;
  preferred_currency?: Currency;
  email_verified?: number;
  email_verified_at?: number;
  verification_token?: string;
  verification_token_expires?: number;
}

export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

export interface Wishlist {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  is_private: number;
  items_count: number;
  created_at: number;
  updated_at: number;
  followed_at?: number;
  owner_email?: string;
  owner_name?: string;
}

export interface WishItem {
  id: string;
  wishlist_id: string;
  title: string;
  description?: string;
  url?: string;
  image_url?: string;
  price?: string;
  currency?: Currency;
  priority: number;
  quantity: number;
  importance: WishItemImportance;
  purchased: number;
  purchased_quantity: number;
  created_at: number;
  updated_at: number;
}

export interface CreateWishlistInput {
  title: string;
  description?: string;
  is_private?: boolean;
}

export interface UpdateWishlistInput {
  title?: string;
  description?: string;
  is_private?: boolean;
}

export interface CreateWishItemInput {
  title: string;
  description?: string;
  url?: string;
  priority?: number;
  quantity?: number;
  importance?: WishItemImportance;
  price?: string;
  currency?: Currency;
}

export interface UpdateWishItemInput {
  title?: string;
  description?: string;
  url?: string;
  image_url?: string;
  price?: string;
  currency?: Currency;
  priority?: number;
  quantity?: number;
  importance?: WishItemImportance;
  purchased?: boolean;
  purchased_quantity?: number;
}
