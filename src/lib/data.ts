import type { FoodItem, Order, User } from './types';

export const foodCategories: string[] = ['Pizza', 'Pasta', 'Salads', 'Desserts', 'Beverages'];

export const foodItems: FoodItem[] = [
  {
    id: '1',
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato, mozzarella, and basil.',
    price: 12.99,
    category: 'Pizza',
    imageUrl: 'https://picsum.photos/600/400',
    ingredients: ['Dough', 'Tomato Sauce', 'Mozzarella', 'Basil'],
    availability: true,
  },
  {
    id: '2',
    name: 'Pepperoni Pizza',
    description: 'Pizza with spicy pepperoni and mozzarella cheese.',
    price: 14.99,
    category: 'Pizza',
    imageUrl: 'https://picsum.photos/600/401',
    ingredients: ['Dough', 'Tomato Sauce', 'Mozzarella', 'Pepperoni'],
    availability: true,
  },
  {
    id: '3',
    name: 'Spaghetti Carbonara',
    description: 'Pasta with eggs, cheese, pancetta, and pepper.',
    price: 15.50,
    category: 'Pasta',
    imageUrl: 'https://picsum.photos/600/402',
    ingredients: ['Spaghetti', 'Eggs', 'Pecorino Romano', 'Pancetta', 'Black Pepper'],
    availability: true,
  },
  {
    id: '4',
    name: 'Caesar Salad',
    description: 'Green salad of romaine lettuce and croutons dressed with lemon juice, olive oil, and parmesan.',
    price: 10.00,
    category: 'Salads',
    imageUrl: 'https://picsum.photos/600/403',
    ingredients: ['Romaine Lettuce', 'Croutons', 'Caesar Dressing', 'Parmesan Cheese'],
    availability: false,
  },
  {
    id: '5',
    name: 'Tiramisu',
    description: 'Coffee-flavoured Italian dessert.',
    price: 8.50,
    category: 'Desserts',
    imageUrl: 'https://picsum.photos/600/404',
    ingredients: ['Ladyfingers', 'Eggs', 'Sugar', 'Coffee', 'Mascarpone Cheese', 'Cocoa Powder'],
    availability: true,
  },
  {
    id: '6',
    name: 'Coca-Cola',
    description: 'Classic carbonated soft drink.',
    price: 2.50,
    category: 'Beverages',
    imageUrl: 'https://picsum.photos/600/405',
    ingredients: ['Carbonated Water', 'Sugar', 'Caffeine', 'Natural Flavors'],
    availability: true,
  },
  {
    id: '7',
    name: 'Penne Arrabbiata',
    description: 'Spicy pasta with tomato sauce, garlic, and red chili peppers.',
    price: 13.50,
    category: 'Pasta',
    imageUrl: 'https://picsum.photos/600/406',
    ingredients: ['Penne', 'Tomato Sauce', 'Garlic', 'Chili Peppers', 'Olive Oil'],
    availability: true,
  },
  {
    id: '8',
    name: 'Greek Salad',
    description: 'Salad with tomatoes, cucumbers, onion, feta cheese, and olives.',
    price: 11.00,
    category: 'Salads',
    imageUrl: 'https://picsum.photos/600/407',
    ingredients: ['Tomatoes', 'Cucumbers', 'Onion', 'Feta Cheese', 'Olives', 'Olive Oil'],
    availability: true,
  },
];

export const mockUsers: User[] = [
    { id: 'user1', name: 'Alice', email: 'alice@example.com', role: 'customer' },
    { id: 'admin1', name: 'Bob', email: 'bob@example.com', role: 'admin' },
];

export const userOrders: Order[] = [
    {
        id: 'ORD001',
        userId: 'user1',
        items: [
            { item: foodItems[0], quantity: 1 },
            { item: foodItems[2], quantity: 1 },
            { item: foodItems[5], quantity: 2 },
        ],
        total: 33.49,
        status: 'Delivered',
        orderDate: '2023-10-26T10:00:00Z',
    },
    {
        id: 'ORD002',
        userId: 'user1',
        items: [
            { item: foodItems[1], quantity: 2 },
        ],
        total: 29.98,
        status: 'Pending',
        orderDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
];
