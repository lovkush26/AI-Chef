'use server';

/**
 * @fileOverview Recognizes ingredients from an image.
 *
 * - recognizeIngredients - A function that handles the ingredient recognition process.
 * - RecognizeIngredientsInput - The input type for the recognizeIngredients function.
 * - RecognizeIngredientsOutput - The return type for the recognizeIngredients function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecognizeIngredientsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of ingredients, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RecognizeIngredientsInput = z.infer<typeof RecognizeIngredientsInputSchema>;

const RecognizeIngredientsOutputSchema = z.object({
  ingredients: z.array(z.string()).describe('The list of ingredients identified in the image.'),
});
export type RecognizeIngredientsOutput = z.infer<typeof RecognizeIngredientsOutputSchema>;

export async function recognizeIngredients(input: RecognizeIngredientsInput): Promise<RecognizeIngredientsOutput> {
  return recognizeIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recognizeIngredientsPrompt',
  input: {schema: RecognizeIngredientsInputSchema},
  output: {schema: RecognizeIngredientsOutputSchema},
  prompt: `You are an AI that identifies ingredients from a photo.

  Identify the ingredients in the following photo.

  Photo: {{media url=photoDataUri}}
  Response: Return a list of ingredients, comma separated.
  `,
});

const recognizeIngredientsFlow = ai.defineFlow(
  {
    name: 'recognizeIngredientsFlow',
    inputSchema: RecognizeIngredientsInputSchema,
    outputSchema: RecognizeIngredientsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      ingredients: output!.ingredients,
    };
  }
);
