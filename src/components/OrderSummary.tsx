"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAppContext } from '@/context/AppContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function OrderSummary() {
  const { currentUser, currentOrder, removeFromOrder, updateQuantity, placeOrder } = useAppContext();
  const { toast } = useToast();

  const subtotal = currentOrder.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0);
  const taxes = subtotal * 0.08;
  const total = subtotal + taxes;

  const handlePlaceOrder = () => {
    if (!currentUser) {
      toast({
        variant: 'destructive',
        title: 'Please log in',
        description: 'You must be logged in to place an order.',
      });
      return;
    }
    placeOrder();
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          Your Order
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentOrder.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            <p>Your order is empty.</p>
            <p className="text-sm">Add items from the menu to get started.</p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[300px] pr-4 -mr-4">
              <div className="space-y-4">
                {currentOrder.map(({ item, quantity }) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md object-cover" data-ai-hint={`${item.category.toLowerCase()} food`} />
                    <div className="flex-grow">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, quantity - 1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span>{quantity}</span>
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, quantity + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeFromOrder(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Taxes (8%)</span><span>${taxes.toFixed(2)}</span></div>
                <Separator/>
                <div className="flex justify-between font-bold text-base"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
          </>
        )}
      </CardContent>
      {currentOrder.length > 0 && (
          <CardFooter>
            {currentUser ? (
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handlePlaceOrder}>
                Place Order
              </Button>
            ) : (
              <Button asChild className="w-full">
                <Link href="/login">Login to Place Order</Link>
              </Button>
            )}
          </CardFooter>
      )}
    </Card>
  );
}
