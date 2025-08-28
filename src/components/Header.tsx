"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart, UtensilsCrossed, LogIn, LogOut } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export default function Header() {
  const { isAdmin, loginAsAdmin, logout, currentOrder } = useAppContext();
  const orderItemCount = currentOrder.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold font-headline text-primary">
          <UtensilsCrossed className="h-7 w-7" />
          <span>OrderFlow</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="text-foreground/80 hover:text-primary transition-colors">Menu</Link>
          <Link href="/orders" className="text-foreground/80 hover:text-primary transition-colors">My Orders</Link>
          <Link href="/recommendations" className="text-foreground/80 hover:text-primary transition-colors">Recommendations</Link>
          <Link href="/feedback" className="text-foreground/80 hover:text-primary transition-colors">Feedback</Link>
          {isAdmin && <Link href="/admin" className="text-foreground/80 hover:text-primary transition-colors">Admin</Link>}
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {orderItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{orderItemCount}</span>
            )}
            <span className="sr-only">View Order</span>
          </Button>
          {isAdmin ? (
            <Button onClick={logout} variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Admin Logout
            </Button>
          ) : (
            <Button onClick={loginAsAdmin} variant="outline" size="sm">
              <LogIn className="mr-2 h-4 w-4" />
              Admin Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
