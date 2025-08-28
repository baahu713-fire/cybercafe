"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { foodCategories } from '@/lib/data';
import type { FoodItem, Order } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const foodItemSchema = z.object({
  name: z.string().min(2, 'Name is too short.'),
  description: z.string().min(10, 'Description is too short.'),
  price: z.coerce.number().min(0.01, 'Price must be positive.'),
  category: z.string().min(1, 'Category is required.'),
  imageUrl: z.string().url('Must be a valid URL.'),
  ingredients: z.string().min(3, 'Ingredients are required.'),
  availability: z.boolean().default(true),
});

type FoodItemFormValues = z.infer<typeof foodItemSchema>;

export default function AdminPage() {
    const { isAdmin, orders, settleBill, addFoodItem } = useAppContext();
    
    if (!isAdmin) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground">You must be an admin to view this page.</p>
            </div>
        );
    }
    
    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold font-headline mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground mb-6">Manage food items and orders.</p>

            <Tabs defaultValue="orders">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="orders">Manage Orders</TabsTrigger>
                    <TabsTrigger value="items">Add Food Item</TabsTrigger>
                </TabsList>
                <TabsContent value="orders">
                    <OrderManagement orders={orders} onSettle={settleBill} />
                </TabsContent>
                <TabsContent value="items">
                    <AddFoodItemForm onAddItem={addFoodItem} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function OrderManagement({ orders, onSettle }: { orders: Order[], onSettle: (orderId: string) => void }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>View and manage all customer orders.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map(order => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.id}</TableCell>
                                <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                                <TableCell>${order.total.toFixed(2)}</TableCell>
                                <TableCell><Badge variant={order.status === 'Settled' || order.status === 'Delivered' ? 'default' : 'secondary'}>{order.status}</Badge></TableCell>
                                <TableCell className="text-right">
                                    {order.status !== 'Settled' && (
                                        <Button size="sm" onClick={() => onSettle(order.id)}>Settle Bill</Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function AddFoodItemForm({ onAddItem }: { onAddItem: (item: Omit<FoodItem, 'id'>) => void }) {
    const form = useForm<FoodItemFormValues>({
        resolver: zodResolver(foodItemSchema),
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            category: '',
            imageUrl: 'https://picsum.photos/600/400',
            ingredients: '',
            availability: true
        }
    });

    function onSubmit(data: FoodItemFormValues) {
        const newItem = {
            ...data,
            ingredients: data.ingredients.split(',').map(i => i.trim())
        }
        onAddItem(newItem);
        form.reset();
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Food Item</CardTitle>
                <CardDescription>Fill out the form to add a new item to the menu.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g., Veggie Burger" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="e.g., A delicious veggie burger..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="price" render={({ field }) => (
                                <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="category" render={({ field }) => (
                               <FormItem>
                                 <FormLabel>Category</FormLabel>
                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {foodCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                 <FormMessage />
                               </FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="imageUrl" render={({ field }) => (
                            <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="ingredients" render={({ field }) => (
                            <FormItem><FormLabel>Ingredients (comma-separated)</FormLabel><FormControl><Input placeholder="e.g., Patty, Bun, Lettuce" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="availability" render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                               <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Available for ordering</FormLabel>
                                </div>
                            </FormItem>
                        )} />
                        <Button type="submit">Add Item</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
