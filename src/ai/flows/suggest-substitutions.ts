'use server';

/**
 * @fileOverview A flow that suggests ingredient substitutions for recipes based on available ingredients.
 *
 * - suggestSubstitutions - A function that suggests ingredient substitutions.
 * - SuggestSubstitutionsInput - The input type for the suggestSubstitutions function.
 * - SuggestSubstitutionsOutput - The return type for the suggestSubstitutions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSubstitutionsInputSchema = z.object({
  missingIngredients: z
    .array(z.string())
    .describe('The list of missing ingredients for a recipe.'),
  availableIngredients: z
    .array(z.string())
    .describe('The list of available ingredients.'),
  recipeName: z.string().describe('The name of the recipe.'),
});
export type SuggestSubstitutionsInput = z.infer<typeof SuggestSubstitutionsInputSchema>;

const SuggestSubstitutionsOutputSchema = z.object({
  substitutions: z.record(z.string(), z.array(z.string())).describe(
    'A map of missing ingredients to a list of suggested substitutions.'
  ),
});
export type SuggestSubstitutionsOutput = z.infer<typeof SuggestSubstitutionsOutputSchema>;

export async function suggestSubstitutions(
  input: SuggestSubstitutionsInput
): Promise<SuggestSubstitutionsOutput> {
  return suggestSubstitutionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSubstitutionsPrompt',
  input: {schema: SuggestSubstitutionsInputSchema},
  output: {schema: SuggestSubstitutionsOutputSchema},
  prompt: `You are a helpful assistant that suggests ingredient substitutions for recipes.

You are given a list of missing ingredients and a list of available ingredients.
For each missing ingredient, suggest one or more suitable substitutions using only ingredients from the provided available ingredients.
If no suitable substitutions are possible with the available ingredients, indicate that no substitution is available.

Recipe Name: {{{recipeName}}}
Missing Ingredients: {{missingIngredients}}
Available Ingredients: {{availableIngredients}}

Substitutions (as a JSON object where each missing ingredient maps to an array of substitutions):
`,
});

const suggestSubstitutionsFlow = ai.defineFlow(
  {
    name: 'suggestSubstitutionsFlow',
    inputSchema: SuggestSubstitutionsInputSchema,
    outputSchema: SuggestSubstitutionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
