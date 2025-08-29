
"use client";

import type { OrderItem, Order, FoodItem, User, OrderStatus, Feedback, UserRole, Portion, TimeOfDay, PasswordResetRequest } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { foodItems, userOrders, mockUsers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

// Helper function to determine the current time of day
const getCurrentTimeOfDay = (): TimeOfDay => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Breakfast';
    if (hour >= 12 && hour < 17) return 'Lunch';
    if (hour >= 17 && hour < 22) return 'Dinner';
    if (hour >= 22 || hour < 5) return 'Snacks'; // Assuming snacks are late night
    return 'All Day'; // Fallback
};


interface AppContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, password: string) => boolean;
  currentOrder: OrderItem[];
  addToOrder: (item: FoodItem, portion: Portion, quantity?: number) => void;
  removeFromOrder: (itemId: string, portionName: string) => void;
  updateQuantity: (itemId: string, portionName: string, quantity: number) => void;
  clearOrder: () => void;
  placeOrder: (userId: string) => void;
  cancelOrder: (orderId: string) => void;
  orders: Order[];
  settleBill: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  settleUserBills: (userId: string) => void;
  addFoodItem: (item: Omit<FoodItem, 'id'>) => void;
  updateFoodItem: (item: FoodItem) => void;
  deleteFoodItem: (itemId: string) => void;
  allFoodItems: FoodItem[];
  availableFoodItems: FoodItem[];
  submitFeedback: (feedback: Feedback) => void;
  feedbacks: Feedback[];
  addUser: (user: Omit<User, 'id' | 'password'> & { password?: string }) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  changePassword: (userId: string) => void;
  resetAllPasswords: () => void;
  requestPasswordReset: (email: string) => boolean;
  resolvePasswordResetRequest: (requestId: string, newPassword: string) => void;
  passwordResetRequests: PasswordResetRequest[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(userOrders);
  const [allFoodItems, setAllFoodItems] = useState(foodItems);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [currentTimeOfDay, setCurrentTimeOfDay] = useState<TimeOfDay | null>(null);
  const [passwordResetRequests, setPasswordResetRequests] = useState<PasswordResetRequest[]>([]);


  useEffect(() => {
    // This is a mock persistence layer. In a real app, you'd use localStorage, cookies, or a server session.
    const loggedInUser = sessionStorage.getItem('currentUser');
    if (loggedInUser) {
        setCurrentUser(JSON.parse(loggedInUser));
    }

    // Set time of day on the client to avoid hydration mismatch
    setCurrentTimeOfDay(getCurrentTimeOfDay());

    // Update time of day periodically
    const timer = setInterval(() => {
        setCurrentTimeOfDay(getCurrentTimeOfDay());
    }, 60000); // Check every minute
    return () => clearInterval(timer);
  }, []);
  
  const availableFoodItems = allFoodItems.filter(item => 
    item.availability && (
        !currentTimeOfDay || // Render all items on server / before hydration
        item.availableTimes.includes('All Day') || 
        item.availableTimes.includes(currentTimeOfDay)
    )
  );

  const login = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        setCurrentUser(user);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        toast({ title: `Welcome back, ${user.name}!` });
        return true;
    } else {
        toast({ variant: 'destructive', title: 'Login Failed', description: 'Invalid email or password.' });
        return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
    toast({ title: 'You have been logged out.' });
  };
  
  const register = (name: string, email: string, password: string): boolean => {
    if (users.some(u => u.email === email)) {
      toast({ variant: 'destructive', title: 'Registration Failed', description: 'A user with this email already exists.' });
      return false;
    }
    const newUser: User = {
      id: `user${users.length + 1}`,
      name,
      email,
      password,
      role: 'customer'
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    sessionStorage.setItem('currentUser', JSON.stringify(newUser));
    toast({ title: 'Registration successful!', description: `Welcome, ${name}!` });
    return true;
  };

  const addToOrder = (item: FoodItem, portion: Portion, quantity: number = 1) => {
    setCurrentOrder(prevOrder => {
      const existingItem = prevOrder.find(orderItem => orderItem.item.id === item.id && orderItem.portion.name === portion.name);
      if (existingItem) {
        return prevOrder.map(orderItem =>
          (orderItem.item.id === item.id && orderItem.portion.name === portion.name)
            ? { ...orderItem, quantity: orderItem.quantity + quantity }
            : orderItem
        );
      }
      return [...prevOrder, { item, portion, quantity }];
    });
    toast({
        title: "Added to order",
        description: `${item.name} (${portion.name}) has been added to your order.`,
    });
  };

  const removeFromOrder = (itemId: string, portionName: string) => {
    setCurrentOrder(prevOrder => prevOrder.filter(orderItem => !(orderItem.item.id === itemId && orderItem.portion.name === portionName)));
  };

  const updateQuantity = (itemId: string, portionName: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(itemId, portionName);
      return;
    }
    setCurrentOrder(prevOrder =>
      prevOrder.map(orderItem =>
        (orderItem.item.id === itemId && orderItem.portion.name === portionName) ? { ...orderItem, quantity } : orderItem
      )
    );
  };

  const clearOrder = () => {
    setCurrentOrder([]);
  };

  const placeOrder = (userId: string) => {
    if (currentOrder.length === 0) {
      toast({
          variant: "destructive",
          title: "Cannot place order",
          description: "Your order is empty.",
      });
      return;
    }

    const subtotal = currentOrder.reduce((sum, { portion, quantity }) => sum + portion.price * quantity, 0);
    const total = subtotal * 1.05; // subtotal + 5% tax

    const newOrder: Order = {
      id: `ORD${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
      items: currentOrder,
      total,
      status: 'Pending',
      orderDate: new Date().toISOString(),
      userId: userId,
    };
    setOrders(prev => [newOrder, ...prev]);
    clearOrder();
    toast({
        title: "Order Placed!",
        description: `Order has been successfully placed for user ${userId}.`,
    });
  };

  const cancelOrder = (orderId: string) => {
      const orderToCancel = orders.find(o => o.id === orderId);
      if (!orderToCancel) return;

      const orderDate = new Date(orderToCancel.orderDate);
      const now = new Date();
      const diffInSeconds = (now.getTime() - orderDate.getTime()) / 1000;

      if (orderToCancel.status === 'Pending' && diffInSeconds < 60) {
          updateOrderStatus(orderId, 'Cancelled');
          toast({ title: 'Order Cancelled', description: `Order ${orderId} has been successfully cancelled.` });
      } else {
          toast({ variant: 'destructive', title: 'Cancellation Failed', description: 'The cancellation window for this order has passed.' });
      }
  };
  
  const settleBill = (orderId: string) => {
    const orderToSettle = orders.find(o => o.id === orderId);
    if (orderToSettle && orderToSettle.status === 'Delivered') {
        updateOrderStatus(orderId, 'Settled');
        toast({
            title: "Bill Settled",
            description: `Order ${orderId} has been marked as settled.`,
        });
    } else {
         toast({
            variant: 'destructive',
            title: "Cannot Settle Bill",
            description: `Order ${orderId} must be in 'Delivered' status to be settled.`,
        });
    }
  };
  
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? {...o, status } : o));
    if (status !== 'Settled' && status !== 'Cancelled') { // Avoid double toast
        toast({
            title: "Order Updated",
            description: `Order ${orderId} status changed to ${status}.`,
        });
    }
  }
  
  const settleUserBills = (userId: string) => {
    setOrders(prev => prev.map(o => (o.userId === userId && o.status === 'Delivered') ? {...o, status: 'Settled'} : o));
    toast({ title: "User Bills Settled", description: `All deliverd bills for user ${userId} have been settled.` });
  }

  const addFoodItem = (item: Omit<FoodItem, 'id'>) => {
    const newItem: FoodItem = {
      ...item,
      id: `food${allFoodItems.length + 1 + Math.random()}`,
      ingredients: (item.ingredients as unknown as string).split(',').map(i => i.trim())
    };
    setAllFoodItems(prev => [newItem, ...prev]);
     toast({
        title: "Food Item Added",
        description: `${newItem.name} has been added to the menu.`,
    });
  }
  
  const updateFoodItem = (item: FoodItem) => {
    const updatedItem = {
      ...item,
      ingredients: Array.isArray(item.ingredients) ? item.ingredients : (item.ingredients as unknown as string).split(',').map(i => i.trim())
    };
    setAllFoodItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    toast({ title: "Food Item Updated", description: `${updatedItem.name} has been updated.` });
  }
  
  const deleteFoodItem = (itemId: string) => {
    setAllFoodItems(prev => prev.filter(i => i.id !== itemId));
    toast({ title: "Food Item Deleted", description: "The food item has been removed from the menu." });
  }
  
  const submitFeedback = (feedback: Feedback) => {
    setFeedbacks(prev => [feedback, ...prev]);
  }

  const addUser = (user: Omit<User, 'id'>) => {
    if (users.some(u => u.email === user.email)) {
      toast({ variant: 'destructive', title: 'Add User Failed', description: 'A user with this email already exists.' });
      return;
    }
    const newUser = { ...user, id: `user${users.length + 1}` };
    setUsers(prev => [...prev, newUser]);
    toast({ title: "User Added", description: `User ${user.name} has been added.`});
  }

  const updateUser = (user: User) => {
    setUsers(prev => prev.map(u => u.id === user.id ? user : u));
    toast({ title: "User Updated", description: `User ${user.name}'s details have been updated.`});
  }

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast({ title: "User Deleted", description: `User has been removed.`});
  }

  const changePassword = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newPassword = prompt(`Enter the new password for ${user.name}:`);
    if (newPassword && newPassword.length >= 6) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPassword } : u));
        toast({ title: 'Password Changed', description: `Password for ${user.name} has been updated.`});
    } else if (newPassword) {
        toast({variant: 'destructive', title: 'Password must be at least 6 characters.'});
    }
  };

  const resetAllPasswords = () => {
    const newPassword = prompt('Enter the new password for ALL users:');
    if (newPassword && newPassword.length >= 6) {
        setUsers(prev => prev.map(u => ({ ...u, password: newPassword })));
        toast({title: 'All passwords have been reset.'});
    } else if (newPassword) {
        toast({variant: 'destructive', title: 'Password must be at least 6 characters.'});
    }
  };

  const requestPasswordReset = (email: string): boolean => {
      const user = users.find(u => u.email === email);
      if (user) {
          const newRequest: PasswordResetRequest = {
              requestId: `req${Date.now()}`,
              userId: user.id,
              userEmail: user.email,
              date: new Date().toISOString(),
          };
          setPasswordResetRequests(prev => [...prev, newRequest]);
          return true;
      }
      return false;
  };

  const resolvePasswordResetRequest = (requestId: string, newPassword: string) => {
      const request = passwordResetRequests.find(r => r.requestId === requestId);
      if (request) {
          setUsers(prev => prev.map(u => u.id === request.userId ? { ...u, password: newPassword } : u));
          setPasswordResetRequests(prev => prev.filter(r => r.requestId !== requestId));
      }
  };

  return (
    <AppContext.Provider value={{ currentUser, users, login, logout, register, currentOrder, addToOrder, removeFromOrder, updateQuantity, clearOrder, placeOrder, cancelOrder, orders, settleBill, updateOrderStatus, settleUserBills, addFoodItem, updateFoodItem, deleteFoodItem, allFoodItems, availableFoodItems, submitFeedback, feedbacks, addUser, updateUser, deleteUser, changePassword, resetAllPasswords, requestPasswordReset, resolvePasswordResetRequest, passwordResetRequests }}>
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
