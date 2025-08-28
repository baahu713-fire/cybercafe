"use client";

import type { OrderItem, Order, FoodItem, User } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { foodItems, userOrders, mockUsers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

interface AppContextType {
  currentUser: User | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  register: (name: string, email: string, password: string) => void;
  currentOrder: OrderItem[];
  addToOrder: (item: OrderItem['item'], quantity?: number) => void;
  removeFromOrder: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearOrder: () => void;
  placeOrder: () => void;
  orders: Order[];
  settleBill: (orderId: string) => void;
  addFoodItem: (item: Omit<FoodItem, 'id'>) => void;
  allFoodItems: FoodItem[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(userOrders);
  const [allFoodItems, setAllFoodItems] = useState(foodItems);

  useEffect(() => {
    // This is a mock persistence layer. In a real app, you'd use localStorage, cookies, or a server session.
    const loggedInUser = sessionStorage.getItem('currentUser');
    if (loggedInUser) {
        setCurrentUser(JSON.parse(loggedInUser));
    }
  }, []);

  const login = (email: string, password: string) => {
    const user = users.find(u => u.email === email); // In a real app, you'd check the password hash
    if (user) {
        setCurrentUser(user);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        toast({ title: `Welcome back, ${user.name}!` });
    } else {
        toast({ variant: 'destructive', title: 'Login Failed', description: 'Invalid email or password.' });
    }
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
    toast({ title: 'You have been logged out.' });
  };
  
  const register = (name: string, email: string, password: string) => {
    if (users.some(u => u.email === email)) {
      toast({ variant: 'destructive', title: 'Registration Failed', description: 'A user with this email already exists.' });
      return;
    }
    const newUser: User = {
      id: `user${users.length + 1}`,
      name,
      email,
      role: 'customer'
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    sessionStorage.setItem('currentUser', JSON.stringify(newUser));
    toast({ title: 'Registration successful!', description: `Welcome, ${name}!` });
  };

  const addToOrder = (item: OrderItem['item'], quantity: number = 1) => {
    setCurrentOrder(prevOrder => {
      const existingItem = prevOrder.find(orderItem => orderItem.item.id === item.id);
      if (existingItem) {
        return prevOrder.map(orderItem =>
          orderItem.item.id === item.id
            ? { ...orderItem, quantity: orderItem.quantity + quantity }
            : orderItem
        );
      }
      return [...prevOrder, { item, quantity }];
    });
    toast({
        title: "Added to order",
        description: `${item.name} has been added to your order.`,
    });
  };

  const removeFromOrder = (itemId: string) => {
    setCurrentOrder(prevOrder => prevOrder.filter(orderItem => orderItem.item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(itemId);
      return;
    }
    setCurrentOrder(prevOrder =>
      prevOrder.map(orderItem =>
        orderItem.item.id === itemId ? { ...orderItem, quantity } : orderItem
      )
    );
  };

  const clearOrder = () => {
    setCurrentOrder([]);
  };

  const placeOrder = () => {
    if (currentOrder.length === 0) {
      toast({
          variant: "destructive",
          title: "Cannot place order",
          description: "Your order is empty.",
      });
      return;
    }
    if(!currentUser) {
         toast({
          variant: "destructive",
          title: "Please log in",
          description: "You must be logged in to place an order.",
      });
      return;
    }
    const newOrder: Order = {
      id: `ORD${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
      items: currentOrder,
      total: currentOrder.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0),
      status: 'Pending',
      orderDate: new Date().toISOString(),
      userId: currentUser.id
    };
    setOrders(prev => [newOrder, ...prev]);
    clearOrder();
    toast({
        title: "Order Placed!",
        description: "Your order has been successfully placed.",
    });
  };
  
  const settleBill = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? {...o, status: 'Settled'} : o));
    toast({
        title: "Bill Settled",
        description: `Order ${orderId} has been marked as settled.`,
    });
  };
  
  const addFoodItem = (item: Omit<FoodItem, 'id'>) => {
    const newItem: FoodItem = {
      ...item,
      id: `${allFoodItems.length + 1}`
    };
    setAllFoodItems(prev => [newItem, ...prev]);
     toast({
        title: "Food Item Added",
        description: `${item.name} has been added to the menu.`,
    });
  }

  return (
    <AppContext.Provider value={{ currentUser, login, logout, register, currentOrder, addToOrder, removeFromOrder, updateQuantity, clearOrder, placeOrder, orders, settleBill, addFoodItem, allFoodItems }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
