"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getFoodRecommendations } from '@/ai/flows/food-recommendations';
import { useAppContext } from '@/context/AppContext';
import { Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function RecommendationsPage() {
  const { orders } = useAppContext();
  const [dietaryPreferences, setDietaryPreferences] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendations([]);

    const orderHistory = JSON.stringify(
        orders.map(o => ({
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
          <Button onClick={handleGetRecommendations} disabled={isLoading} className="w-full">
            {isLoading ? 'Getting Recommendations...' : 'Get Recommendations'}
          </Button>

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
