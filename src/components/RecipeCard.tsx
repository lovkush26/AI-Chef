'use client';

import { Heart, Eye, Clock, Zap } from 'lucide-react';
import type { Recipe } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/use-favorites';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

interface RecipeCardProps {
  recipe: Recipe;
  onSelectRecipe: (recipe: Recipe) => void;
}

export default function RecipeCard({ recipe, onSelectRecipe }: RecipeCardProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const favorite = isFavorite(recipe.name);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorite) {
      removeFavorite(recipe.name);
    } else {
      addFavorite(recipe);
    }
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl">
      <CardHeader className="relative p-4">
        <CardTitle className="font-headline text-lg">{recipe.name}</CardTitle>
        <Button
          size="icon"
          className={cn(
            "absolute right-3 top-3 rounded-full h-9 w-9 bg-background/70 text-destructive backdrop-blur-sm hover:bg-background/90",
            favorite && "text-red-500 bg-red-100/80 hover:bg-red-200/90"
          )}
          onClick={handleFavoriteClick}
        >
          <Heart className={cn("h-5 w-5", favorite && "fill-current")} />
          <span className="sr-only">Favorite</span>
        </Button>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {recipe.cookingTime} min
            </Badge>
             <Badge variant="outline" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {recipe.difficulty}
            </Badge>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" onClick={() => onSelectRecipe(recipe)}>
          <Eye className="mr-2 h-4 w-4" />
          View Recipe
        </Button>
      </CardFooter>
    </Card>
  );
}
