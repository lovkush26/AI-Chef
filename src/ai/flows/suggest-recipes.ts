'use server';
/**
 * @fileOverview This file defines the Genkit flow for suggesting recipes based on a list of ingredients and other criteria.
 *
 * - suggestRecipes - A function that takes ingredients and preferences as input and returns a list of suggested recipes.
 * - SuggestRecipesInput - The input type for the suggestRecipes function.
 * - SuggestRecipesOutput - The return type for the suggestRecipes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRecipesInputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('A list of ingredients available for the recipe.'),
  dietaryPreferences: z
    .string()
    .optional()
    .describe('Dietary preferences, such as vegetarian, gluten-free, etc.'),
  cookingTime: z
    .number()
    .optional()
    .describe('Maximum cooking time in minutes.'),
  difficulty: z
    .enum(['Easy', 'Medium', 'Hard'])
    .optional()
    .describe('The desired difficulty level of the recipe.'),
  cuisine: z.string().optional().describe('The desired cuisine of the recipe (e.g., Italian, Mexican, etc.).'),
});
export type SuggestRecipesInput = z.infer<typeof SuggestRecipesInputSchema>;

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
});

const SuggestRecipesOutputSchema = z.object({
  recipes: z.array(RecipeSchema).describe('A list of suggested recipes.'),
  reason: z.string().describe('Reasoning why these recipes are suggested.'),
});
export type SuggestRecipesOutput = z.infer<typeof SuggestRecipesOutputSchema>;

export async function suggestRecipes(input: SuggestRecipesInput): Promise<SuggestRecipesOutput> {
  return suggestRecipesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipesPrompt',
  input: {schema: SuggestRecipesInputSchema},
  output: {schema: SuggestRecipesOutputSchema},
  prompt: `You are a world-class chef with a vast internal database of recipes from around the globe. Given the following ingredients and user preferences, suggest a list of recipes.

Ingredients: {{ingredients}}
{{#if dietaryPreferences}}Dietary Preferences: {{dietaryPreferences}}{{/if}}
{{#if cookingTime}}Maximum Cooking Time: {{cookingTime}} minutes{{/if}}
{{#if difficulty}}Difficulty: {{difficulty}}{{/if}}
{{#if cuisine}}Cuisine: {{cuisine}}{{/if}}

For each recipe, provide all the fields specified in the output schema. Ensure ingredient quantities and units are precise.
Recipes:`,
});

const suggestRecipesFlow = ai.defineFlow(
  {
    name: 'suggestRecipesFlow',
    inputSchema: SuggestRecipesInputSchema,
    outputSchema: SuggestRecipesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
