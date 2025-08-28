
"use client";

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription as FormDescriptionComponent, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { foodCategories } from '@/lib/data';
import type { FoodItem, Order, OrderStatus, User, UserRole, Portion, TimeOfDay, PasswordResetRequest } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { Edit, Trash2, Search, ArrowUpDown, PlusCircle, X, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const portionSchema = z.object({
    name: z.string().min(1, 'Portion name is required.'),
    price: z.coerce.number().min(0.01, 'Price must be positive.'),
});

const timeOfDaySchema = z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'All Day']);

const foodItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name is too short.'),
  description: z.string().min(10, 'Description is too short.'),
  category: z.string().min(1, 'Category is required.'),
  imageUrl: z.string().url('Must be a valid URL.'),
  ingredients: z.string().min(3, 'Ingredients are required.'),
  availability: z.boolean().default(true),
  availableTimes: z.array(timeOfDaySchema).nonempty('At least one availability time is required.'),
  portions: z.array(portionSchema).nonempty('At least one portion is required.'),
});

const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  role: z.enum(['customer', 'admin', 'superadmin']),
});


type FoodItemFormValues = z.infer<typeof foodItemSchema>;
type UserFormValues = z.infer<typeof userSchema>;

export default function AdminPage() {
    const context = useAppContext();
    
    if (context.currentUser?.role !== 'admin' && context.currentUser?.role !== 'superadmin') {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground">You must be an admin to view this page.</p>
            </div>
        );
    }
    
    const isSuperAdmin = context.currentUser?.role === 'superadmin';

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold font-headline mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground mb-6">Manage food items, orders, and users.</p>

            <Tabs defaultValue="orders">
                <TabsList className={cn("grid w-full", isSuperAdmin ? "grid-cols-4" : "grid-cols-3")}>
                    <TabsTrigger value="orders">Manage Orders</TabsTrigger>
                    <TabsTrigger value="items">Manage Items</TabsTrigger>
                    <TabsTrigger value="users">Manage Users</TabsTrigger>
                    {isSuperAdmin && <TabsTrigger value="requests">Password Requests</TabsTrigger>}
                </TabsList>
                <TabsContent value="orders">
                    <OrderManagement />
                </TabsContent>
                <TabsContent value="items">
                    <ItemManagement />
                </TabsContent>
                 <TabsContent value="users">
                    <UserManagement />
                </TabsContent>
                {isSuperAdmin && (
                    <TabsContent value="requests">
                        <PasswordRequestManagement />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

function OrderManagement() {
    const { orders, updateOrderStatus, settleBill } = useAppContext();
    const orderStatuses: OrderStatus[] = ['Pending', 'Confirmed', 'Delivered', 'Cancelled'];
    const [searchTerm, setSearchTerm] = useState('');
    const [date, setDate] = useState<DateRange | undefined>();
    const [sortConfig, setSortConfig] = useState<{ key: keyof Order, direction: 'asc' | 'desc'}>({ key: 'orderDate', direction: 'desc' });

    const sortedOrders = [...orders].sort((a, b) => {
        if (sortConfig.key === 'orderDate') {
            const dateA = new Date(a.orderDate).getTime();
            const dateB = new Date(b.orderDate).getTime();
            if (dateA < dateB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (dateA > dateB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        }
        return 0;
    });

    const filteredOrders = sortedOrders.filter(order => {
        const matchesSearch = 
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.status.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesDate = 
            !date || !date.from || (
                new Date(order.orderDate) >= date.from &&
                new Date(order.orderDate) <= (date.to || new Date(date.from.getTime() + 24 * 60 * 60 * 1000 -1)) // if only from is selected, check for that day
            );

        return matchesSearch && matchesDate;
    });

    const requestSort = (key: keyof Order) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>View and manage all customer orders.</CardDescription>
                <div className="flex gap-2 mt-2">
                    <div className="relative flex-grow">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by Order ID, User ID, or Status..." 
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from ? (
                            date.to ? (
                                <>
                                {format(date.from, "LLL dd, y")} -{" "}
                                {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                            ) : (
                            <span>Pick a date range</span>
                            )}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                        />
                        </PopoverContent>
                    </Popover>
                    <Button variant="ghost" onClick={() => setDate(undefined)}>Clear Date</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>User ID</TableHead>
                            <TableHead>
                                <Button variant="ghost" onClick={() => requestSort('orderDate')}>
                                    Date <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
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
                                <TableCell>{new Date(order.orderDate).toLocaleString()}</TableCell>
                                <TableCell>₹{order.total.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Select 
                                        onValueChange={(value) => updateOrderStatus(order.id, value as OrderStatus)} 
                                        defaultValue={order.status}
                                        disabled={order.status === 'Settled' || order.status === 'Cancelled'}
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
                                        <Button size="sm" onClick={() => settleBill(order.id)}>Settle Bill</Button>
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

function ItemManagement() {
    const { allFoodItems, addFoodItem, updateFoodItem, deleteFoodItem } = useAppContext();
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
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingItem ? 'Edit' : 'Add'} Food Item</DialogTitle>
                            </DialogHeader>
                            <FoodItemForm 
                                onSave={(itemData) => {
                                    if (editingItem) {
                                        updateFoodItem({ ...itemData, id: editingItem.id });
                                    } else {
                                        addFoodItem(itemData);
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
                                <TableCell>₹{item.portions[0].price.toFixed(2)}</TableCell>
                                <TableCell><Badge variant={item.availability ? 'default' : 'secondary'}>{item.availability ? 'Yes' : 'No'}</Badge></TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the food item.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteFoodItem(item.id)}>Continue</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

const availableTimes: TimeOfDay[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'All Day'];

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
            category: '',
            imageUrl: 'https://picsum.photos/600/400',
            ingredients: '',
            availability: true,
            availableTimes: [],
            portions: [{ name: 'Full', price: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "portions"
    });

    function onSubmit(data: FoodItemFormValues) {
        onSave(data);
        toast({ title: `Item ${initialData ? 'updated' : 'added'} successfully!`});
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
                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                    <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="ingredients" render={({ field }) => (
                    <FormItem><FormLabel>Ingredients (comma-separated)</FormLabel><FormControl><Input placeholder="e.g., Patty, Bun, Lettuce" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <div>
                    <FormLabel>Portions</FormLabel>
                    <div className="space-y-2 mt-2">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2">
                                <FormField
                                    control={form.control}
                                    name={`portions.${index}.name`}
                                    render={({ field }) => <Input placeholder="Portion Name" {...field} />}
                                />
                                <FormField
                                    control={form.control}
                                    name={`portions.${index}.price`}
                                    render={({ field }) => <Input type="number" placeholder="Price" {...field} />}
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                    <X className="h-4 w-4 text-destructive"/>
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ name: '', price: 0 })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Portion
                    </Button>
                    <FormMessage>{form.formState.errors.portions?.message || form.formState.errors.portions?.root?.message}</FormMessage>
                </div>
                
                <FormField
                  control={form.control}
                  name="availableTimes"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Available Times</FormLabel>
                        <FormDescriptionComponent>
                          Select the times of day this item is available.
                        </FormDescriptionComponent>
                      </div>
                      {availableTimes.map((time) => (
                        <FormField
                          key={time}
                          control={form.control}
                          name="availableTimes"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={time}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(time)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, time])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== time
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {time}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

function UserManagement() {
    const { users, currentUser, settleUserBills, addUser, updateUser, deleteUser, changePassword, resetAllPasswords } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { toast } = useToast();
    
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsFormOpen(true);
    }

    const handleAddNew = () => {
        setEditingUser(null);
        setIsFormOpen(true);
    }
    
    const handleDelete = (userId: string) => {
        deleteUser(userId);
    }

    const handleChangePassword = (userId: string) => {
        const newPassword = prompt('Enter the new password:');
        if (newPassword && newPassword.length >= 6) {
            changePassword(userId, newPassword);
            const user = users.find(u => u.id === userId);
            toast({ title: 'Password Changed', description: `Password for ${user?.name} has been updated.`});
        } else if (newPassword) {
            toast({variant: 'destructive', title: 'Password must be at least 6 characters.'});
        }
    }

    const handleResetAllPasswords = () => {
        const newPassword = prompt('Enter the new password for ALL users:');
        if (newPassword && newPassword.length >= 6) {
            resetAllPasswords(newPassword);
            toast({title: 'All passwords have been reset.'});
        } else if (newPassword) {
            toast({variant: 'destructive', title: 'Password must be at least 6 characters.'});
        }
    }

    const roleBadges: Record<UserRole, 'default' | 'destructive' | 'secondary'> = {
        superadmin: 'destructive',
        admin: 'default',
        customer: 'secondary',
    }
    
    return (
        <Card>
            <CardHeader>
                <div className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>View users and manage their accounts.</CardDescription>
                    </div>
                     {currentUser?.role === 'superadmin' && (
                         <div className="flex gap-2">
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">Reset All Passwords</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action will reset the password for EVERY user. This cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleResetAllPasswords}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={handleAddNew}><PlusCircle className="mr-2"/>Add User</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{editingUser ? 'Edit' : 'Add'} User</DialogTitle>
                                    </DialogHeader>
                                    <UserForm
                                        initialData={editingUser}
                                        onSave={(data) => {
                                            if (editingUser) {
                                                updateUser({ ...data, id: editingUser.id });
                                            } else {
                                                addUser(data);
                                            }
                                            setIsFormOpen(false);
                                        }}
                                    />
                                </DialogContent>
                            </Dialog>
                         </div>
                     )}
                </div>
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
                                <TableCell><Badge variant={roleBadges[user.role]}>{user.role}</Badge></TableCell>
                                <TableCell className="text-right space-x-2">
                                    {user.role === 'customer' && (
                                        <Button size="sm" onClick={() => settleUserBills(user.id)}>Settle All Bills</Button>
                                    )}
                                    {currentUser?.role === 'superadmin' && user.id !== currentUser.id && (
                                        <>
                                            <Button variant="ghost" size="icon" onClick={() => handleChangePassword(user.id)}><KeyRound className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}><Edit className="h-4 w-4" /></Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete the user. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(user.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </>
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

function UserForm({ onSave, initialData }: { onSave: (data: UserFormValues) => void; initialData: User | null }) {
  const { toast } = useToast();
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: initialData ? { ...initialData, password: initialData.password || 'password123' } : { name: '', email: '', password: '', role: 'customer' },
  });

  function onSubmit(data: UserFormValues) {
    onSave(data);
    toast({ title: `User ${initialData ? 'updated' : 'added'} successfully!` });
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="e.g., john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save User</Button>
      </form>
    </Form>
  );
}

function PasswordRequestManagement() {
    const { passwordResetRequests, users, resolvePasswordResetRequest } = useAppContext();
    const { toast } = useToast();

    const handleResolve = (request: PasswordResetRequest) => {
        const newPassword = prompt(`Enter new password for ${request.userEmail}:`);
        if (newPassword && newPassword.length >= 6) {
            resolvePasswordResetRequest(request.requestId, newPassword);
            toast({ title: 'Password Reset Successful', description: `Password for ${request.userEmail} has been changed.` });
        } else if (newPassword) {
            toast({ variant: 'destructive', title: 'Password Too Short', description: 'Password must be at least 6 characters.' });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Password Reset Requests</CardTitle>
                <CardDescription>Manage user requests to reset their password.</CardDescription>
            </CardHeader>
            <CardContent>
                {passwordResetRequests.length === 0 ? (
                    <p className="text-muted-foreground">No pending password reset requests.</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Request ID</TableHead>
                                <TableHead>User Email</TableHead>
                                <TableHead>Request Date</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {passwordResetRequests.map(req => (
                                <TableRow key={req.requestId}>
                                    <TableCell>{req.requestId}</TableCell>
                                    <TableCell>{req.userEmail}</TableCell>
                                    <TableCell>{new Date(req.date).toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" onClick={() => handleResolve(req)}>
                                            <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
    

    

    

    