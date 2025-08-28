"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Star } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useEffect, useState } from 'react';
import type { Order } from '@/lib/types';
import Link from 'next/link';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const feedbackSchema = z.object({
  orderId: z.string().min(1, 'Please select an order.'),
  rating: z.number().min(1, 'Please provide a rating.').max(5),
  comment: z.string().optional(),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

export default function FeedbackPage() {
    const { toast } = useToast();
    const { currentUser, orders, submitFeedback } = useAppContext();
    const [userOrders, setUserOrders] = useState<Order[]>([]);

    useEffect(() => {
        if(currentUser) {
            setUserOrders(orders.filter(o => o.userId === currentUser.id));
        }
    }, [currentUser, orders]);

    const form = useForm<FeedbackFormValues>({
        resolver: zodResolver(feedbackSchema),
        defaultValues: {
            orderId: '',
            rating: 0,
            comment: '',
        },
    });

    const onSubmit = (data: FeedbackFormValues) => {
        if (!currentUser) return;
        submitFeedback({
            ...data,
            id: `fb${Date.now()}`,
            userId: currentUser.id,
            date: new Date().toISOString(),
        });
        toast({
            title: 'Feedback Submitted!',
            description: 'Thank you for your feedback. We appreciate you taking the time.',
        });
        form.reset();
    };

    if (!currentUser || currentUser.role === 'admin') {
         return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold">{currentUser ? "Admins cannot leave feedback" : "Please Login"}</h1>
                <p className="text-muted-foreground mb-4">
                    {currentUser ? "Only customers can provide feedback." : "You need to be logged in to provide feedback."}
                </p>
                {!currentUser && <Button asChild><Link href="/login">Login</Link></Button>}
            </div>
        );
    }
    
    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MessageSquare /> Leave Feedback</CardTitle>
                    <CardDescription>We'd love to hear from you. Please share your experience.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="orderId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Select Order</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an order to review" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {userOrders.map(order => (
                                                    <SelectItem key={order.id} value={order.id}>
                                                        Order #{order.id} - {new Date(order.orderDate).toLocaleDateString()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="rating"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rating</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={cn(
                                                            "h-8 w-8 cursor-pointer transition-colors",
                                                            field.value >= star ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                                                        )}
                                                        onClick={() => field.onChange(star)}
                                                    />
                                                ))}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="comment"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Comment (Optional)</FormLabel>
                                        <FormControl><Textarea placeholder="Tell us more about your experience..." className="min-h-[120px]" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">Submit Feedback</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

    