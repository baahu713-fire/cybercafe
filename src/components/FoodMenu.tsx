"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle } from 'lucide-react';
import type { FoodItem } from '@/lib/types';
import { useAppContext } from '@/context/AppContext';
import { foodCategories } from '@/lib/data';

export default function FoodMenu() {
  const { allFoodItems, addToOrder } = useAppContext();
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredItems = activeCategory === 'All'
    ? allFoodItems
    : allFoodItems.filter(item => item.category === activeCategory);

  return (
    <div>
      <h1 className="text-4xl font-bold font-headline mb-2">Our Menu</h1>
      <p className="text-muted-foreground mb-6">Discover our delicious range of dishes, crafted with the freshest ingredients.</p>
      
      <Tabs defaultValue="All" onValueChange={setActiveCategory} className="w-full mb-8">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="All">All</TabsTrigger>
          {foodCategories.map(category => (
            <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <FoodItemCard key={item.id} item={item} onAddToOrder={() => addToOrder(item)} />
        ))}
        {filteredItems.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center">No items available in this category.</p>
        )}
      </div>
    </div>
  );
}

function FoodItemCard({ item, onAddToOrder }: { item: FoodItem, onAddToOrder: () => void }) {
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
        <p className="text-lg font-bold text-primary">${item.price.toFixed(2)}</p>
        <Button size="sm" onClick={onAddToOrder} disabled={!item.availability}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}
