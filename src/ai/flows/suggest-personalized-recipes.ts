'use server';
/**
 * @fileOverview This file defines the Genkit flow for suggesting personalized recipes based on a user's favorite recipes.
 *
 * - suggestPersonalizedRecipes - A function that takes rated favorite recipes and returns personalized suggestions.
 * - SuggestPersonalizedRecipesInput - The input type for the suggestPersonalizedRecipes function.
 * - SuggestPersonalizedRecipesOutput - The return type for the suggestPersonalizedRecipes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RatedRecipeSchema = z.object({
  name: z.string(),
  rating: z.number().min(1).max(5),
  // We only need the name and rating to get suggestions, but other fields can be added if needed.
});

const SuggestPersonalizedRecipesInputSchema = z.object({
  favoriteRecipes: z
    .array(RatedRecipeSchema)
    .describe('A list of the user\'s favorite recipes with their ratings.'),
});
export type SuggestPersonalizedRecipesInput = z.infer<typeof SuggestPersonalizedRecipesInputSchema>;


const IngredientSchema = z.object({
  name: z.string().describe('The name of the ingredient.'),
  quantity: z.number().describe('The amount of the ingredient.'),
  unit: z.string().describe('The unit of measurement for the quantity (e.g., grams, ml, cups, tbsp).'),
});

const RecipeSchema = z.object({
  name: z.string().describe('The name of the recipe.'),
  ingredients: z.array(IngredientSchema).describe('The ingredients required for the recipe.'),
  instructions: z.string().describe('The cooking instructions for the recipe.'),
  nutritionalInfo: z.string().optional().describe('Nutritional information for the recipe.'),
  servings: z.number().describe('The number of servings the recipe makes.'),
  cookingTime: z.number().describe('The total cooking time in minutes.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty level of the recipe.'),
  rating: z.number().min(1).max(5).optional().describe('User rating for the recipe, from 1 to 5.'),
  imageUrl: z.string().url().describe('A URL for a high-quality image of the recipe.'),
});

const SuggestPersonalizedRecipesOutputSchema = z.object({
  suggestions: z.array(RecipeSchema).describe('A list of personalized recipe suggestions.'),
});
export type SuggestPersonalizedRecipesOutput = z.infer<typeof SuggestPersonalizedRecipesOutputSchema>;


export async function suggestPersonalizedRecipes(
  input: SuggestPersonalizedRecipesInput
): Promise<SuggestPersonalizedRecipesOutput> {
  return suggestPersonalizedRecipesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPersonalizedRecipesPrompt',
  input: {schema: SuggestPersonalizedRecipesInputSchema},
  output: {schema: SuggestPersonalizedRecipesOutputSchema},
  prompt: `You are a recipe recommendation engine. Based on the user's rated favorite recipes, suggest a list of new recipes they might enjoy.

Here are the user's favorite recipes and their ratings (out of 5):
{{#each favoriteRecipes}}
- {{name}} (Rated: {{rating}}/5)
{{/each}}

Please suggest some new and interesting recipes that align with these tastes. For each new recipe, provide all the fields specified in the output schema.
It is mandatory to provide a relevant, high-quality photo URL for the 'imageUrl' field for every recipe from a stock photo website like Unsplash. The image must accurately represent the recipe.
`,
});

const suggestPersonalizedRecipesFlow = ai.defineFlow(
  {
    name: 'suggestPersonalizedRecipesFlow',
    inputSchema: SuggestPersonalizedRecipesInputSchema,
    outputSchema: SuggestPersonalizedRecipesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
