import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-substitutions.ts';
import '@/ai/flows/recognize-ingredients.ts';
import '@/ai/flows/suggest-recipes.ts';
import '@/ai/flows/suggest-personalized-recipes.ts';
