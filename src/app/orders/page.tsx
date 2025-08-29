
"use client";

import { useAppContext } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Image from 'next/image';
import type { OrderStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Order } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

const statusVariants: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
    Pending: 'secondary',
    Confirmed: 'secondary',
    Delivered: 'default',
    Cancelled: 'destructive',
    Settled: 'default',
}

function CancelOrderButton({ order }: { order: Order }) {
    const { cancelOrder, currentUser } = useAppContext();
    const [canCancel, setCanCancel] = useState(false);

    useEffect(() => {
        // Only customers should have the cancel option, not admins
        if (currentUser?.role !== 'customer') {
            setCanCancel(false);
            return;
        }

        const orderDate = new Date(order.orderDate);
        const now = new Date();
        const diffInSeconds = (now.getTime() - orderDate.getTime()) / 1000;

        if (order.status === 'Pending' && diffInSeconds < 60) {
            setCanCancel(true);
            const timer = setTimeout(() => {
                setCanCancel(false);
            }, (60 - diffInSeconds) * 1000);
            return () => clearTimeout(timer);
        }
    }, [order, currentUser]);

    if (!canCancel) return null;

    return (
        <Button
            variant="destructive"
            size="sm"
            onClick={() => cancelOrder(order.id)}
            className="mt-4"
        >
            Cancel Order
        </Button>
    );
}


export default function OrdersPage() {
    const { currentUser, orders, users } = useAppContext();
    const [userOrders, setUserOrders] = useState<Order[]>([]);
    
    const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown User';

    useEffect(() => {
        if(currentUser) {
            if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
                // Admins/Superadmins see all orders
                setUserOrders(orders);
            } else {
                // Customers see only their orders
                setUserOrders(orders.filter(o => o.userId === currentUser.id));
            }
        }
    }, [currentUser, orders]);

    if (!currentUser) {
         return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold">Please Login</h1>
                <p className="text-muted-foreground mb-4">You need to be logged in to view your orders.</p>
                <Button asChild>
                    <Link href="/login">Login</Link>
                </Button>
            </div>
        );
    }
    
    const isAdminView = currentUser.role === 'admin' || currentUser.role === 'superadmin';

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold font-headline mb-2">{isAdminView ? 'All Customer Orders' : 'Your Orders'}</h1>
            <p className="text-muted-foreground mb-6">{isAdminView ? 'Review and track all orders placed in the system.' : 'Track your past and current orders.'}</p>
            {userOrders.length === 0 ? (
                <p>You haven't placed any orders yet.</p>
            ) : (
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {userOrders.map(order => (
                         <Card key={order.id} className="overflow-hidden">
                            <AccordionItem value={order.id} className="border-b-0">
                                <AccordionTrigger className="p-4 hover:no-underline hover:bg-secondary/50">
                                    <div className="flex justify-between items-center w-full">
                                        <div className="text-left">
                                            <p className="font-bold">Order #{order.id}</p>
                                            {isAdminView && <p className="text-sm font-medium">For: {getUserName(order.userId)}</p>}
                                            <p className="text-sm text-muted-foreground">{new Date(order.orderDate).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">₹{order.total.toFixed(2)}</p>
                                            <Badge variant={statusVariants[order.status]}>{order.status}</Badge>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 pt-0">
                                    <h4 className="font-semibold mb-2">Order Details</h4>
                                    <div className="space-y-2">
                                        {order.items.map(({ item, portion, quantity }) => (
                                            <div key={`${item.id}-${portion.name}`} className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded-sm object-cover" data-ai-hint="food item" />
                                                    <span>{item.name} <span className="text-xs text-muted-foreground">({portion.name})</span></span>
                                                </div>
                                                <span className="text-muted-foreground">x{quantity}</span>
                                                <span>₹{(portion.price * quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {order.instructions && (
                                        <>
                                            <Separator className="my-4"/>
                                            <h4 className="font-semibold mb-1">Special Instructions</h4>
                                            <p className="text-sm text-muted-foreground">{order.instructions}</p>
                                        </>
                                    )}
                                    <CancelOrderButton order={order} />
                                </AccordionContent>
                            </AccordionItem>
                        </Card>
                    ))}
                </Accordion>
            )}
        </div>
    );
}
