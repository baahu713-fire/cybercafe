
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAppContext } from '@/context/AppContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Minus, Trash2, ShoppingCart, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

export default function OrderSummary() {
  const { currentUser, users, currentOrder, removeFromOrder, updateQuantity, placeOrder } = useAppContext();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [instructions, setInstructions] = useState('');

  const subtotal = currentOrder.reduce((sum, { item, portion, quantity }) => sum + portion.price * quantity, 0);
  const taxes = subtotal * 0.05; // 5% tax
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
    placeOrder(currentUser.id, instructions);
    setInstructions('');
  };

  const handleAdminPlaceOrder = () => {
      if (!selectedUserId) {
           toast({
                variant: 'destructive',
                title: 'No user selected',
                description: 'Please select a user to place the order for.',
            });
            return;
      }
      placeOrder(selectedUserId, instructions);
      setIsDialogOpen(false);
      setSelectedUserId(null);
      setInstructions('');
  }

  const customerUsers = users.filter(u => u.role === 'customer');

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
                {currentOrder.map(({ item, portion, quantity }) => (
                  <div key={`${item.id}-${portion.name}`} className="flex items-center gap-4">
                    <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md object-cover" data-ai-hint={`${item.category.toLowerCase()} food`} />
                    <div className="flex-grow">
                      <p className="font-semibold">{item.name} <span className="text-xs text-muted-foreground">({portion.name})</span></p>
                      <p className="text-sm text-muted-foreground">₹{portion.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, portion.name, quantity - 1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span>{quantity}</span>
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, portion.name, quantity + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeFromOrder(item.id, portion.name)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator className="my-4" />
            <div className="space-y-2">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Taxes (5%)</span><span>₹{taxes.toFixed(2)}</span></div>
                <Separator/>
                <div className="flex justify-between font-bold text-base"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
            </div>
            <div className="mt-4 space-y-2">
                <Label htmlFor="instructions">Special Instructions</Label>
                <Textarea 
                    id="instructions"
                    placeholder="e.g., Make it extra spicy, no onions..." 
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                />
            </div>
          </>
        )}
      </CardContent>
      {currentOrder.length > 0 && (
          <CardFooter>
            {!currentUser ? (
              <Button asChild className="w-full">
                <Link href="/login">Login to Place Order</Link>
              </Button>
            ) : currentUser.role === 'admin' || currentUser.role === 'superadmin' ? (
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                         <Button className="w-full">
                            <User className="mr-2" /> Place Order For User
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Place Order for a Customer</DialogTitle>
                            <DialogDescription>Select a customer to place the current order for.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                           <Select onValueChange={setSelectedUserId} value={selectedUserId ?? undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a customer..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {customerUsers.map(user => (
                                        <SelectItem key={user.id} value={user.id}>{user.name} ({user.email})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button className="w-full" onClick={handleAdminPlaceOrder} disabled={!selectedUserId}>
                                Confirm Order for User
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            ) : (
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handlePlaceOrder}>
                Place Order
              </Button>
            )}
          </CardFooter>
      )}
    </Card>
  );
}
