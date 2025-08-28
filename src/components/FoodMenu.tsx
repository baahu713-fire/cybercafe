
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Search, List, LayoutGrid } from 'lucide-react';
import type { FoodItem, Portion } from '@/lib/types';
import { useAppContext } from '@/context/AppContext';
import { foodCategories } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

export default function FoodMenu() {
  const { availableFoodItems, addToOrder } = useAppContext();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categoryFilteredItems = activeCategory === 'All'
    ? availableFoodItems
    : availableFoodItems.filter(item => item.category === activeCategory);

  const filteredItems = categoryFilteredItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToOrder = (item: FoodItem, portion: Portion, quantity: number) => {
    addToOrder(item, portion, quantity);
  };


  return (
    <div>
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
            <div>
                <h1 className="text-4xl font-bold font-headline mb-2">Our Menu</h1>
                <p className="text-muted-foreground">Discover our delicious range of dishes, crafted with the freshest ingredients.</p>
            </div>
            <div className="flex w-full sm:w-auto gap-2">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search for food..." 
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-1">
                    <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
                        <LayoutGrid />
                    </Button>
                     <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
                        <List />
                    </Button>
                </div>
            </div>
        </div>
      
      <Tabs defaultValue="All" onValueChange={setActiveCategory} className="w-full mb-8">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="All">All</TabsTrigger>
          {foodCategories.map(category => (
            <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className={cn(
        "gap-6",
        viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col'
      )}>
        {filteredItems.map((item, index) => (
            viewMode === 'grid' 
            ? <FoodItemCard key={item.id} item={item} onAddToOrder={handleAddToOrder} />
            : <FoodItemList key={item.id} item={item} onAddToOrder={handleAddToOrder} isLast={index === filteredItems.length - 1} />
        ))}
        {filteredItems.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center">No items found.</p>
        )}
      </div>
    </div>
  );
}

function AddToOrderButton({ item, onAddToOrder }: { item: FoodItem; onAddToOrder: (item: FoodItem, portion: Portion, quantity: number) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPortion, setSelectedPortion] = useState<Portion | null>(item.portions.length === 1 ? item.portions[0] : null);

    const handleButtonClick = () => {
        if (item.portions.length === 1) {
            onAddToOrder(item, item.portions[0], 1);
        } else {
            setIsOpen(true);
        }
    };
    
    const handleConfirm = () => {
        if(selectedPortion) {
            onAddToOrder(item, selectedPortion, 1);
            setIsOpen(false);
            setSelectedPortion(item.portions.length === 1 ? item.portions[0] : null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button size="sm" onClick={handleButtonClick} disabled={!item.availability}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add
            </Button>
            {item.portions.length > 1 && (
                 <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Select a portion for {item.name}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <RadioGroup onValueChange={(value) => setSelectedPortion(JSON.parse(value))}>
                            {item.portions.map(portion => (
                                <div key={portion.name} className="flex items-center space-x-2">
                                    <RadioGroupItem value={JSON.stringify(portion)} id={`${item.id}-${portion.name}`} />
                                    <Label htmlFor={`${item.id}-${portion.name}`} className="flex-grow">
                                        {portion.name} - ₹{portion.price.toFixed(2)}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                    <Button onClick={handleConfirm} disabled={!selectedPortion}>Add to Order</Button>
                </DialogContent>
            )}
        </Dialog>
    );
}

function FoodItemCard({ item, onAddToOrder }: { item: FoodItem, onAddToOrder: (item: FoodItem, portion: Portion, quantity: number) => void }) {
  return (
    <Card className="flex flex-col overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl">
      <CardHeader className="p-0 relative">
        <Image
          src={item.imageUrl}
          alt={item.name}
          width={600}
          height={400}
          className="object-cover w-full h-48"
          data-ai-hint={`${item.category.toLowerCase()} food`}
        />
        {!item.availability && (
            <Badge variant="destructive" className="absolute top-2 right-2">Unavailable</Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-headline mb-1">{item.name}</CardTitle>
        <CardDescription className="text-sm h-10 overflow-hidden">{item.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center mt-auto">
        <p className="text-lg font-bold text-primary">₹{item.portions[0].price.toFixed(2)}</p>
        <AddToOrderButton item={item} onAddToOrder={onAddToOrder} />
      </CardFooter>
    </Card>
  );
}

function FoodItemList({ item, onAddToOrder, isLast }: { item: FoodItem, onAddToOrder: (item: FoodItem, portion: Portion, quantity: number) => void, isLast: boolean }) {
    return (
        <>
            <div className="flex items-center gap-4 py-4">
                <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={100}
                    height={100}
                    className="object-cover rounded-lg w-24 h-24"
                    data-ai-hint={`${item.category.toLowerCase()} food`}
                />
                <div className="flex-grow">
                     <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-headline mb-1">{item.name}</CardTitle>
                        <p className="text-lg font-bold text-primary whitespace-nowrap">₹{item.portions[0].price.toFixed(2)}</p>
                     </div>
                    <CardDescription className="text-sm mb-2">{item.description}</CardDescription>
                    {!item.availability && (
                        <Badge variant="destructive">Unavailable</Badge>
                    )}
                </div>
                <div className="self-center ml-4">
                     <AddToOrderButton item={item} onAddToOrder={onAddToOrder} />
                </div>
            </div>
            {!isLast && <Separator />}
        </>
    )
}
