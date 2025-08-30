import type { SuggestRecipesOutput } from '@/ai/flows/suggest-recipes';
export type Recipe = SuggestRecipesOutput['recipes'][0];
export type Ingredient = Recipe['ingredients'][0];
