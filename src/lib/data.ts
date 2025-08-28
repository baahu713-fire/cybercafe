
import type { FoodItem, Order, User } from './types';

export const foodCategories: string[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'];

export const foodItems: FoodItem[] = [
  {
    id: '1',
    name: 'Masala Dosa',
    description: 'Crispy rice pancake filled with spiced potatoes, served with chutney and sambar.',
    category: 'Breakfast',
    imageUrl: 'https://picsum.photos/600/400',
    ingredients: ['Rice', 'Lentils', 'Potatoes', 'Spices', 'Coconut'],
    availability: true,
    availableTimes: ['Breakfast', 'Snacks'],
    portions: [
      { name: 'Full', price: 150.00 }
    ],
  },
  {
    id: '2',
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice cooked with chicken and a blend of Indian spices.',
    category: 'Lunch',
    imageUrl: 'https://picsum.photos/600/401',
    ingredients: ['Basmati Rice', 'Chicken', 'Yogurt', 'Onion', 'Spices'],
    availability: true,
    availableTimes: ['Lunch', 'Dinner'],
    portions: [
        { name: 'Half', price: 200.00 },
        { name: 'Full', price: 350.00 }
    ],
  },
  {
    id: '3',
    name: 'Paneer Butter Masala',
    description: 'Cottage cheese cubes in a creamy, tangy, and sweet tomato-based gravy.',
    category: 'Dinner',
    imageUrl: 'https://picsum.photos/600/402',
    ingredients: ['Paneer', 'Tomatoes', 'Cream', 'Butter', 'Spices'],
    availability: true,
    availableTimes: ['Lunch', 'Dinner'],
     portions: [
      { name: 'Full', price: 280.00 }
    ],
  },
  {
    id: '4',
    name: 'Vegetable Caesar Salad',
    description: 'Green salad of romaine lettuce and croutons dressed with a vegetarian caesar dressing.',
    category: 'Lunch',
    imageUrl: 'https://picsum.photos/600/403',
    ingredients: ['Romaine Lettuce', 'Croutons', 'Vegetarian Dressing', 'Parmesan Cheese'],
    availability: false,
    availableTimes: ['All Day'],
     portions: [
      { name: 'Full', price: 220.00 }
    ],
  },
  {
    id: '5',
    name: 'Gulab Jamun',
    description: 'Soft, spongy balls made of milk solids, flour & a leavening agent, soaked in sugar syrup.',
    category: 'Snacks',
    imageUrl: 'https://picsum.photos/600/404',
    ingredients: ['Milk Solids (Khoya)', 'Sugar', 'Saffron', 'Cardamom'],
    availability: true,
    availableTimes: ['All Day'],
     portions: [
      { name: '2 pieces', price: 120.00 }
    ],
  },
  {
    id: '6',
    name: 'Masala Chai',
    description: 'Indian tea beverage made by boiling black tea in milk and water with a mixture of aromatic herbs and spices.',
    category: 'Beverages',
    imageUrl: 'https://picsum.photos/600/405',
    ingredients: ['Black Tea', 'Milk', 'Sugar', 'Ginger', 'Cardamom', 'Cinnamon'],
    availability: true,
    availableTimes: ['All Day'],
     portions: [
      { name: 'Regular', price: 80.00 }
    ],
  },
  {
    id: '7',
    name: 'Dal Makhani',
    description: 'A classic Indian dish made with whole black lentils, red kidney beans, butter, and cream.',
    category: 'Dinner',
    imageUrl: 'https://picsum.photos/600/406',
    ingredients: ['Black Lentils', 'Kidney Beans', 'Butter', 'Cream', 'Spices'],
    availability: true,
    availableTimes: ['Lunch', 'Dinner'],
     portions: [
      { name: 'Full', price: 250.00 }
    ],
  },
  {
    id: '8',
    name: 'Samosa Chaat',
    description: 'Crushed samosas topped with yogurt, tamarind and mint chutneys, and spices.',
    category: 'Snacks',
    imageUrl: 'https://picsum.photos/600/407',
    ingredients: ['Samosa', 'Yogurt', 'Tamarind Chutney', 'Mint Chutney', 'Spices'],
    availability: true,
    availableTimes: ['Snacks'],
     portions: [
      { name: 'Full', price: 100.00 }
    ],
  },
];

export const mockUsers: User[] = [
    { id: 'user1', name: 'Alice', email: 'alice@example.com', role: 'customer' },
    { id: 'admin1', name: 'Bob', email: 'bob@example.com', role: 'admin' },
    { id: 'superadmin1', name: 'Charlie', email: 'charlie@example.com', role: 'superadmin' },
];

export const userOrders: Order[] = [
    {
        id: 'ORD001',
        userId: 'user1',
        items: [
            { item: foodItems[0], portion: foodItems[0].portions[0], quantity: 1 },
            { item: foodItems[2], portion: foodItems[2].portions[0], quantity: 1 },
            { item: foodItems[5], portion: foodItems[5].portions[0], quantity: 2 },
        ],
        total: 590.00,
        status: 'Delivered',
        orderDate: '2023-10-26T10:00:00Z',
    },
    {
        id: 'ORD002',
        userId: 'user1',
        items: [
            { item: foodItems[1], portion: foodItems[1].portions[1], quantity: 2 },
        ],
        total: 700.00,
        status: 'Pending',
        orderDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'ORD003',
        userId: 'user1',
        items: [
            { item: foodItems[4], portion: foodItems[4].portions[0], quantity: 1 },
            { item: foodItems[6], portion: foodItems[6].portions[0], quantity: 1 },
        ],
        total: 370.00,
        status: 'Confirmed',
        orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    }
];
