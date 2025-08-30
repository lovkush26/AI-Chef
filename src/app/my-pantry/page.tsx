'use client';

import { useEffect, useState } from 'react';
import { recognizeIngredients } from '@/ai/flows/recognize-ingredients';
import { suggestRecipes } from '@/ai/flows/suggest-recipes';
import { suggestPersonalizedRecipes } from '@/ai/flows/suggest-personalized-recipes';
import { useToast } from '@/hooks/use-toast';
import type { Recipe } from '@/types';
import Header from '@/components/Header';
import IngredientInput from '@/components/IngredientInput';
import RecipeList from '@/components/RecipeList';
import RecipeDetail from '@/components/RecipeDetail';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Heart, UserCheck, ChefHat } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFavorites } from '@/hooks/use-favorites';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

export default function MyPantryPage() {
  const { favorites } = useFavorites();

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [personalizedSuggestions, setPersonalizedSuggestions] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState({ ingredients: false, recipes: false, personalized: false });
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const { toast } = useToast();

  const handleRecognizeIngredients = async (imageDataUri: string) => {
    setIsLoading(prev => ({ ...prev, ingredients: true }));
    setError(null);
    try {
      const { ingredients: recognized } = await recognizeIngredients({ photoDataUri: imageDataUri });
      setIngredients(recognized);
    } catch (e) {
      console.error(e);
      setError('Failed to recognize ingredients. Please try again.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to recognize ingredients. Please try again or enter them manually.',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, ingredients: false }));
    }
  };

  const handleGetRecipes = async (filters: any) => {
    if (ingredients.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Ingredients',
        description: 'Please add some ingredients first.',
      });
      return;
    }

    setIsLoading(prev => ({ ...prev, recipes: true }));
    setError(null);
    setRecipes([]);

    try {
      const result = await suggestRecipes({
        ingredients,
        dietaryPreferences: filters.dietaryPreference === 'none' ? undefined : filters.dietaryPreference,
        cookingTime: filters.cookingTime,
        difficulty: filters.difficulty === 'any' ? undefined : filters.difficulty,
        cuisine: filters.cuisine === 'any' ? undefined : filters.cuisine,
      });
      setRecipes(result.recipes);
      if (result.recipes.length === 0) {
        toast({
          title: 'No Recipes Found',
          description: 'Try adding more ingredients or adjusting your filters for better suggestions.',
        });
      }
    } catch (e) {
      console.error(e);
      setError('Failed to generate recipes. Please try again.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate recipes. Please try again.',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, recipes: false }));
    }
  };
  
  const handleGetPersonalizedSuggestions = async () => {
    if (favorites.length === 0) {
      return;
    }
    setIsLoading(prev => ({ ...prev, personalized: true }));
    try {
      const ratedFavorites = favorites
        .filter(f => f.rating && f.rating > 0)
        .map(f => ({ name: f.name, rating: f.rating as number }));

      if(ratedFavorites.length === 0) {
        setPersonalizedSuggestions([]);
        return;
      }
        
      const result = await suggestPersonalizedRecipes({ favoriteRecipes: ratedFavorites });
      setPersonalizedSuggestions(result.suggestions);
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not get personalized suggestions at this time.',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, personalized: false }));
    }
  };

  useEffect(() => {
    handleGetPersonalizedSuggestions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favorites]);


  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-2xl font-bold text-foreground">
              AI Chef
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <IngredientInput
            onRecognizeIngredients={handleRecognizeIngredients}
            onGetRecipes={handleGetRecipes}
            ingredients={ingredients}
            setIngredients={setIngredients}
            isProcessing={isLoading.ingredients || isLoading.recipes}
          />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <main className="container mx-auto max-w-7xl px-4 py-8">
            <Header />
            <Tabs defaultValue="suggestions" className="mt-8">
              <TabsList className="mb-4 grid grid-cols-3">
                <TabsTrigger value="suggestions">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Suggestions
                </TabsTrigger>
                <TabsTrigger value="for-you">
                  <UserCheck className="mr-2 h-4 w-4" />
                  For You
                </TabsTrigger>
                <TabsTrigger value="favorites">
                  <Heart className="mr-2 h-4 w-4" />
                  Favorites
                </TabsTrigger>
              </TabsList>
              <TabsContent value="suggestions">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-primary" />
                      <h2 className="font-headline text-2xl font-bold">Your Recipe Suggestions</h2>
                    </div>
                  </div>
                  <RecipeList
                    recipes={recipes}
                    isLoading={isLoading.recipes}
                    onSelectRecipe={setSelectedRecipe}
                    emptyState={{
                      title: 'No recipes to show',
                      description: 'Use the sidebar to upload a photo or enter your ingredients and click "Find Recipes".',
                    }}
                  />
                </div>
              </TabsContent>
              <TabsContent value="for-you">
                  <div className="space-y-4">
                      <div className="flex items-center gap-2">
                          <UserCheck className="h-6 w-6 text-primary" />
                          <h2 className="font-headline text-2xl font-bold">Recommended For You</h2>
                      </div>
                      <RecipeList
                          recipes={personalizedSuggestions}
                          isLoading={isLoading.personalized}
                          onSelectRecipe={setSelectedRecipe}
                          emptyState={{
                              title: 'No recommendations yet',
                              description: 'Rate some of your favorite recipes to get personalized suggestions.',
                          }}
                      />
                  </div>
              </TabsContent>
              <TabsContent value="favorites">
                  <div className="space-y-4">
                      <div className="flex items-center gap-2">
                          <Heart className="h-6 w-6 text-destructive" />
                          <h2 className="font-headline text-2xl font-bold">Your Favorite Recipes</h2>
                      </div>
                      <RecipeList
                          recipes={favorites}
                          isLoading={false}
                          onSelectRecipe={setSelectedRecipe}
                          emptyState={{
                              title: 'No favorites yet',
                              description: 'You can save recipes by clicking the heart icon.',
                          }}
                      />
                  </div>
              </TabsContent>
            </Tabs>
        </main>
      </SidebarInset>

      <RecipeDetail
        recipe={selectedRecipe}
        isOpen={!!selectedRecipe}
        onOpenChange={open => !open && setSelectedRecipe(null)}
        availableIngredients={ingredients}
      />
    </>
  );
}
