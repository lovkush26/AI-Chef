'use client';
import { useEffect, useState, useMemo } from 'react';
import type { Recipe } from '@/types';
import { suggestSubstitutions } from '@/ai/flows/suggest-substitutions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Lightbulb, Loader2, Heart, Users, Clock, Zap, Star } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Slider } from './ui/slider';
import { Label } from './ui/label';

interface RecipeDetailProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  availableIngredients: string[];
}

const StarRating = ({ rating, onRate }: { rating: number, onRate: (rating: number) => void }) => {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => onRate(star)}>
                    <Star
                        className={cn(
                            "h-5 w-5 cursor-pointer transition-colors",
                            star <= rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300 hover:text-yellow-400"
                        )}
                    />
                </button>
            ))}
        </div>
    );
};

export default function RecipeDetail({ recipe, isOpen, onOpenChange, availableIngredients }: RecipeDetailProps) {
  const [substitutions, setSubstitutions] = useState<Record<string, string[]>>({});
  const [missingIngredients, setMissingIngredients] = useState<string[]>([]);
  const [loadingSubstitutions, setLoadingSubstitutions] = useState(false);
  const { addFavorite, removeFavorite, isFavorite, updateRating, getFavorite } = useFavorites();
  const [servings, setServings] = useState(recipe?.servings || 1);

  const favorite = recipe ? getFavorite(recipe.name) : null;

  useEffect(() => {
    if (recipe) {
      setServings(recipe.servings);
    }
  }, [recipe]);

  useEffect(() => {
    if (!recipe) return;

    const lowercasedAvailable = availableIngredients.map(i => i.toLowerCase());
    const missing = recipe.ingredients.filter(
      (recipeIng) => !lowercasedAvailable.some(availIng => recipeIng.name.toLowerCase().includes(availIng))
    );
    setMissingIngredients(missing.map(ing => ing.name));

    if (missing.length > 0) {
      setLoadingSubstitutions(true);
      suggestSubstitutions({
        missingIngredients: missing.map(ing => ing.name),
        availableIngredients,
        recipeName: recipe.name,
      })
      .then(result => setSubstitutions(result.substitutions))
      .catch(err => console.error("Failed to get substitutions", err))
      .finally(() => setLoadingSubstitutions(false));
    } else {
        setSubstitutions({});
        setLoadingSubstitutions(false);
    }
  }, [recipe, availableIngredients]);

  const servingMultiplier = useMemo(() => {
    if (!recipe || !recipe.servings) return 1;
    return servings / recipe.servings;
  }, [servings, recipe]);

  const handleFavoriteClick = () => {
      if (!recipe) return;
      if (favorite) {
          removeFavorite(recipe.name);
      } else {
          addFavorite(recipe);
      }
  };
  
  const handleRating = (newRating: number) => {
      if (!recipe) return;
      updateRating(recipe.name, newRating);
  };

  if (!recipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6 pr-8">
            <DialogHeader>
              <DialogTitle className="text-3xl font-headline mb-2">{recipe.name}</DialogTitle>
              <DialogDescription asChild>
                 <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{recipe.cookingTime} min</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Zap className="h-4 w-4" />
                        <span>{recipe.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        <span>Serves {recipe.servings}</span>
                    </div>
                 </div>
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 flex items-center gap-4">
                <Button 
                    variant="outline"
                    onClick={handleFavoriteClick}
                >
                    <Heart className={cn("mr-2 h-4 w-4", favorite && "fill-red-500 text-red-500")} />
                    {favorite ? 'Saved to Favorites' : 'Save to Favorites'}
                </Button>
                {favorite && (
                    <StarRating rating={favorite.rating || 0} onRate={handleRating} />
                )}
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-semibold mb-3">Ingredients</h3>
                     <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="servings-slider">Servings: {servings}</Label>
                            <Slider 
                                id="servings-slider"
                                value={[servings]} 
                                onValueChange={(value) => setServings(value[0])}
                                min={1}
                                max={recipe.servings * 4}
                                step={1}
                            />
                        </div>
                        <ul className="space-y-2">
                        {recipe.ingredients.map((ing) => (
                            <li key={ing.name} className="flex items-start">
                            <span className="mr-2 mt-1">-</span>
                            <div>
                                <span>{(ing.quantity * servingMultiplier).toFixed(2).replace(/\.00$/, '')} {ing.unit} {ing.name}</span>
                                {missingIngredients.includes(ing.name) && (
                                    <Badge variant="destructive" className="ml-2 text-xs">Missing</Badge>
                                )}
                            </div>
                            </li>
                        ))}
                        </ul>
                    </div>
                </div>

                <div>
                    {(loadingSubstitutions || Object.keys(substitutions).length > 0) && (
                        <Alert className="bg-primary/10 border-primary/50">
                            <Lightbulb className="h-4 w-4 text-primary" />
                            <AlertTitle className="font-semibold text-primary">Substitution Suggestions</AlertTitle>
                            <AlertDescription>
                                {loadingSubstitutions ? (
                                    <div className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</div>
                                ) : (
                                    <ul className="mt-2 space-y-1 text-sm">
                                        {Object.entries(substitutions).map(([missing, subs]) => (
                                            <li key={missing}>
                                                <strong>{missing}:</strong> {subs.join(', ') || 'No suggestion found'}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>

            <Separator className="my-4" />

            <div>
              <h3 className="text-xl font-semibold mb-3">Instructions</h3>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {recipe.instructions}
              </div>
            </div>
            
            <Separator className="my-4" />

            <div>
              <h3 className="text-xl font-semibold mb-3">Nutritional Information</h3>
              <p className="text-sm text-muted-foreground">{recipe.nutritionalInfo}</p>
            </div>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
