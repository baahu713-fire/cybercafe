"use client";

import { useAppContext } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Image from 'next/image';
import type { OrderStatus } from '@/lib/types';

const statusVariants: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
    Pending: 'secondary',
    Confirmed: 'secondary',
    Delivered: 'default',
    Cancelled: 'destructive',
    Settled: 'default',
}

export default function OrdersPage() {
    const { orders } = useAppContext();

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold font-headline mb-2">Your Orders</h1>
            <p className="text-muted-foreground mb-6">Track your past and current orders.</p>
            {orders.length === 0 ? (
                <p>You haven't placed any orders yet.</p>
            ) : (
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {orders.map(order => (
                         <Card key={order.id} className="overflow-hidden">
                            <AccordionItem value={order.id} className="border-b-0">
                                <AccordionTrigger className="p-4 hover:no-underline hover:bg-secondary/50">
                                    <div className="flex justify-between items-center w-full">
                                        <div className="text-left">
                                            <p className="font-bold">Order #{order.id}</p>
                                            <p className="text-sm text-muted-foreground">{new Date(order.orderDate).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">${order.total.toFixed(2)}</p>
                                            <Badge variant={statusVariants[order.status]}>{order.status}</Badge>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 pt-0">
                                    <h4 className="font-semibold mb-2">Order Details</h4>
                                    <div className="space-y-2">
                                        {order.items.map(({ item, quantity }) => (
                                            <div key={item.id} className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded-sm object-cover" data-ai-hint="food item" />
                                                    <span>{item.name}</span>
                                                </div>
                                                <span className="text-muted-foreground">x{quantity}</span>
                                                <span>${(item.price * quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Card>
                    ))}
                </Accordion>
            )}
        </div>
    );
}
