"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getFoodRecommendations } from '@/ai/flows/food-recommendations';
import { useAppContext } from '@/context/AppContext';
import { Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import type { Order } from '@/lib/types';

export default function RecommendationsPage() {
  const { currentUser, orders } = useAppContext();
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [dietaryPreferences, setDietaryPreferences] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

   useEffect(() => {
        if(currentUser) {
            setUserOrders(orders.filter(o => o.userId === currentUser.id));
        }
    }, [currentUser, orders]);

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendations([]);

    const orderHistory = JSON.stringify(
        userOrders.map(o => ({
            id: o.id,
            items: o.items.map(i => ({ name: i.item.name, quantity: i.quantity })),
            total: o.total,
            date: o.orderDate,
        }))
    );
    
    try {
        const result = await getFoodRecommendations({ orderHistory, dietaryPreferences });
        const recs = result.recommendations.split('\n').map(r => r.trim().replace(/^- /, '')).filter(r => r !== '');
        setRecommendations(recs);
    } catch (e) {
        setError('Failed to get recommendations. Please try again.');
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
        <div className="text-center py-20">
            <h1 className="text-2xl font-bold">Please Login</h1>
            <p className="text-muted-foreground mb-4">You need to be logged in to get recommendations.</p>
            <Button asChild>
                <Link href="/login">Login</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-accent" />
            AI Food Recommendations
          </CardTitle>
          <CardDescription>
            Get personalized food recommendations based on your order history and dietary preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="dietary-preferences">Dietary Preferences (optional)</Label>
            <Input
              id="dietary-preferences"
              value={dietaryPreferences}
              onChange={(e) => setDietaryPreferences(e.target.value)}
              placeholder="e.g., vegetarian, gluten-free"
            />
          </div>
          <Button onClick={handleGetRecommendations} disabled={isLoading || userOrders.length === 0} className="w-full">
            {isLoading ? 'Getting Recommendations...' : 'Get Recommendations'}
          </Button>

            {userOrders.length === 0 && (
                <p className="text-sm text-center text-muted-foreground">You need to place at least one order to get recommendations.</p>
            )}

          {isLoading && (
            <div className="space-y-2 pt-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {recommendations.length > 0 && (
            <div className="pt-4">
                <h3 className="font-semibold mb-2">Here are your recommendations:</h3>
                <ul className="list-disc list-inside bg-secondary p-4 rounded-md space-y-1">
                    {recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                    ))}
                </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
