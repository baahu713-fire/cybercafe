'use server';

/**
 * @fileOverview Generates personalized food recommendations based on user's order history and dietary preferences.
 *
 * - getFoodRecommendations - A function that generates food recommendations.
 * - FoodRecommendationsInput - The input type for the getFoodRecommendations function.
 * - FoodRecommendationsOutput - The return type for the getFoodRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FoodRecommendationsInputSchema = z.object({
  orderHistory: z.string().describe('The user order history as a stringified JSON array of order objects. Each order object should contain item names and quantities.'),
  dietaryPreferences: z.string().describe('The user dietary preferences, such as vegetarian, vegan, gluten-free, etc.'),
});
export type FoodRecommendationsInput = z.infer<typeof FoodRecommendationsInputSchema>;

const FoodRecommendationsOutputSchema = z.object({
  recommendations: z.string().describe('A list of recommended food items based on the user order history and dietary preferences.'),
});
export type FoodRecommendationsOutput = z.infer<typeof FoodRecommendationsOutputSchema>;

export async function getFoodRecommendations(input: FoodRecommendationsInput): Promise<FoodRecommendationsOutput> {
  return foodRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'foodRecommendationsPrompt',
  input: {schema: FoodRecommendationsInputSchema},
  output: {schema: FoodRecommendationsOutputSchema},
  prompt: `You are a food recommendation expert. You will generate personalized food recommendations based on the user's past order history and dietary preferences.

Order History: {{{orderHistory}}}
Dietary Preferences: {{{dietaryPreferences}}}

Based on this information, what food items would you recommend to the user? Return the recommendations as a list.`, 
});

const foodRecommendationsFlow = ai.defineFlow(
  {
    name: 'foodRecommendationsFlow',
    inputSchema: FoodRecommendationsInputSchema,
    outputSchema: FoodRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
