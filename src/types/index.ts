export interface Wishlist {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  created_at: number;
  updated_at: number;
}

export interface WishItem {
  id: string;
  wishlist_id: string;
  title: string;
  description?: string;
  url?: string;
  image_url?: string;
  price?: string;
  priority: number;
  purchased: number;
  created_at: number;
  updated_at: number;
}

export interface CreateWishlistInput {
  title: string;
  description?: string;
}

export interface UpdateWishlistInput {
  title?: string;
  description?: string;
}

export interface CreateWishItemInput {
  title: string;
  description?: string;
  url?: string;
  priority?: number;
}

export interface UpdateWishItemInput {
  title?: string;
  description?: string;
  url?: string;
  image_url?: string;
  price?: string;
  priority?: number;
  purchased?: boolean;
}
