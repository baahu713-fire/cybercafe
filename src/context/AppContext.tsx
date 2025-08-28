"use client";

import type { OrderItem, Order, FoodItem } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { foodItems, userOrders } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

interface AppContextType {
  isAdmin: boolean;
  loginAsAdmin: () => void;
  logout: () => void;
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(userOrders);
  const [allFoodItems, setAllFoodItems] = useState(foodItems);

  const loginAsAdmin = () => {
    setIsAdmin(true);
    toast({ title: 'Admin mode enabled.' });
  };
  const logout = () => {
    setIsAdmin(false);
    toast({ title: 'Admin mode disabled.' });
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
    const newOrder: Order = {
      id: `ORD${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
      items: currentOrder,
      total: currentOrder.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0),
      status: 'Pending',
      orderDate: new Date().toISOString(),
      userId: 'user1'
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
    <AppContext.Provider value={{ isAdmin, loginAsAdmin, logout, currentOrder, addToOrder, removeFromOrder, updateQuantity, clearOrder, placeOrder, orders, settleBill, addFoodItem, allFoodItems }}>
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
