
export type TimeOfDay = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' | 'All Day';

export interface Portion {
  name: string;
  price: number;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  ingredients: string[];
  availability: boolean;
  availableTimes: TimeOfDay[];
  portions: Portion[];
}

export interface OrderItem {
  item: FoodItem;
  portion: Portion;
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
  instructions?: string;
}

export type UserRole = 'customer' | 'admin' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
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

export interface PasswordResetRequest {
  requestId: string;
  userId: string;
  userEmail: string;
  date: string;
}
