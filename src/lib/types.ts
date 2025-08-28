export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  ingredients: string[];
  availability: boolean;
}

export interface OrderItem {
  item: FoodItem;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled' | 'Settled';

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  orderDate: string;
  userId: string;
}

export type UserRole = 'customer' | 'admin' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Feedback {
  id: string;
  userId: string;
  orderId: string;
  rating: number; // 1-5 stars
  comment?: string;
  date: string;
}
