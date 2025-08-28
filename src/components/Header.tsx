"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ShoppingCart, UtensilsCrossed, LogIn, LogOut, Menu, User, Shield } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { currentUser, logout, currentOrder } = useAppContext();
  const orderItemCount = currentOrder.reduce((sum, item) => sum + item.quantity, 0);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  }

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      className="text-foreground/80 hover:text-primary transition-colors"
      onClick={() => setIsSheetOpen(false)}
    >
      {children}
    </Link>
  );

  return (
    <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold font-headline text-primary">
          <UtensilsCrossed className="h-7 w-7" />
          <span>OrderFlow</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <NavLink href="/">Menu</NavLink>
          {currentUser && currentUser.role !== 'admin' && <NavLink href="/orders">My Orders</NavLink>}
          {currentUser && currentUser.role !== 'admin' && <NavLink href="/feedback">Feedback</NavLink>}
          {currentUser?.role === 'admin' && <NavLink href="/admin">Admin</NavLink>}
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {orderItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{orderItemCount}</span>
            )}
            <span className="sr-only">View Order</span>
          </Button>
          <div className="hidden md:flex items-center gap-2">
            {currentUser ? (
              <>
                <span className="text-sm font-medium">Hi, {currentUser.name}</span>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                 <Button asChild variant="outline" size="sm">
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
                 <Button asChild size="sm">
                   <Link href="/register">
                    <User className="mr-2 h-4 w-4" />
                    Register
                  </Link>
                </Button>
              </>
            )}
          </div>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8 text-lg">
                <NavLink href="/">Menu</NavLink>
                {currentUser && currentUser.role !== 'admin' && <NavLink href="/orders">My Orders</NavLink>}
                {currentUser && currentUser.role !== 'admin' && <NavLink href="/feedback">Feedback</NavLink>}
                {currentUser?.role === 'admin' && <NavLink href="/admin">Admin</NavLink>}
                <div className="border-t pt-4 mt-2 flex flex-col gap-2">
                 {currentUser ? (
                    <>
                      <div className="flex items-center gap-2">
                         {currentUser.role === 'admin' ? <Shield/> : <User />}
                        <span>{currentUser.name}</span>
                      </div>
                      <Button onClick={() => { handleLogout(); setIsSheetOpen(false); }} variant="outline">
                        <LogOut className="mr-2" /> Logout
                      </Button>
                    </>
                  ) : (
                    <>
                       <Button asChild variant="outline" onClick={() => setIsSheetOpen(false)}>
                        <Link href="/login">
                          <LogIn className="mr-2" /> Login
                        </Link>
                      </Button>
                       <Button asChild onClick={() => setIsSheetOpen(false)}>
                        <Link href="/register">
                          <User className="mr-2" /> Register
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
