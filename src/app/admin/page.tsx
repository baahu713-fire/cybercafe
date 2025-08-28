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
import type { FoodItem, Order, OrderStatus, User } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { Edit, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const foodItemSchema = z.object({
  id: z.string().optional(),
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
    const { currentUser, orders, users, settleBill, updateOrderStatus, addFoodItem, updateFoodItem, deleteFoodItem, settleUserBills } = useAppContext();
    
    if (currentUser?.role !== 'admin') {
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
            <p className="text-muted-foreground mb-6">Manage food items, orders, and users.</p>

            <Tabs defaultValue="orders">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="orders">Manage Orders</TabsTrigger>
                    <TabsTrigger value="items">Manage Items</TabsTrigger>
                    <TabsTrigger value="users">Manage Users</TabsTrigger>
                </TabsList>
                <TabsContent value="orders">
                    <OrderManagement orders={orders} onSettle={settleBill} onUpdateStatus={updateOrderStatus} />
                </TabsContent>
                <TabsContent value="items">
                    <ItemManagement onAddItem={addFoodItem} onUpdateItem={updateFoodItem} onDeleteItem={deleteFoodItem} />
                </TabsContent>
                 <TabsContent value="users">
                    <UserManagement users={users} onSettleUser={settleUserBills} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function OrderManagement({ orders, onSettle, onUpdateStatus }: { orders: Order[], onSettle: (orderId: string) => void, onUpdateStatus: (orderId: string, status: OrderStatus) => void }) {
    const orderStatuses: OrderStatus[] = ['Pending', 'Confirmed', 'Delivered', 'Cancelled', 'Settled'];
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOrders = orders.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>View and manage all customer orders.</CardDescription>
                <div className="relative mt-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by Order ID or User ID..." 
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>User ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOrders.map(order => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.id}</TableCell>
                                <TableCell>{order.userId}</TableCell>
                                <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                                <TableCell>${order.total.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Select 
                                        onValueChange={(value) => onUpdateStatus(order.id, value as OrderStatus)} 
                                        defaultValue={order.status}
                                        disabled={order.status === 'Settled'}
                                    >
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {orderStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className="text-right">
                                    {order.status === 'Delivered' && (
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

function ItemManagement({ onAddItem, onUpdateItem, onDeleteItem }: { onAddItem: (item: Omit<FoodItem, 'id'>) => void, onUpdateItem: (item: FoodItem) => void, onDeleteItem: (itemId: string) => void }) {
    const { allFoodItems } = useAppContext();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = allFoodItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (item: FoodItem) => {
        setEditingItem(item);
        setIsFormOpen(true);
    }

    const handleAddNew = () => {
        setEditingItem(null);
        setIsFormOpen(true);
    }

    const handleDelete = (itemId: string) => {
        if(confirm('Are you sure you want to delete this item?')) {
            onDeleteItem(itemId);
        }
    }
    
    return (
        <Card>
            <CardHeader>
                <div className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle>Food Items</CardTitle>
                        <CardDescription>Manage your menu items.</CardDescription>
                    </div>
                     <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleAddNew}>Add New Item</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingItem ? 'Edit' : 'Add'} Food Item</DialogTitle>
                            </DialogHeader>
                            <FoodItemForm 
                                onSave={(itemData) => {
                                    if (editingItem) {
                                        onUpdateItem({ ...itemData, id: editingItem.id });
                                    } else {
                                        onAddItem(itemData);
                                    }
                                    setIsFormOpen(false);
                                }}
                                initialData={editingItem}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
                 <div className="relative mt-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name or description..." 
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Available</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.category}</TableCell>
                                <TableCell>${item.price.toFixed(2)}</TableCell>
                                <TableCell><Badge variant={item.availability ? 'default' : 'secondary'}>{item.availability ? 'Yes' : 'No'}</Badge></TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function FoodItemForm({ onSave, initialData }: { onSave: (data: FoodItemFormValues) => void, initialData: FoodItem | null }) {
    const { toast } = useToast();
    const form = useForm<FoodItemFormValues>({
        resolver: zodResolver(foodItemSchema),
        defaultValues: initialData ? {
            ...initialData,
            ingredients: initialData.ingredients.join(', ')
        } : {
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
        }
        onSave(newItem);
        toast({ title: `Item ${initialData ? 'updated' : 'added'} successfully!`});
        form.reset();
    }
    
    return (
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <Button type="submit">Save Item</Button>
            </form>
        </Form>
    )
}

function UserManagement({ users, onSettleUser }: { users: User[], onSettleUser: (userId: string) => void }) {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View users and manage their accounts.</CardDescription>
                 <div className="relative mt-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by User ID, name or email..." 
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map(user => (
                            <TableRow key={user.id}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell><Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>{user.role}</Badge></TableCell>
                                <TableCell className="text-right">
                                    {user.role === 'customer' && (
                                        <Button size="sm" onClick={() => onSettleUser(user.id)}>Settle All Bills</Button>
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

    
