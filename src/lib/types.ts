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
