'use client';
import type { Recipe } from '@/types';
import RecipeCard from './RecipeCard';
import { Skeleton } from '@/components/ui/skeleton';

interface RecipeListProps {
  recipes: Recipe[];
  isLoading: boolean;
  onSelectRecipe: (recipe: Recipe) => void;
  emptyState: {
      title: string;
      description: string;
  }
}

export default function RecipeList({ recipes, isLoading, onSelectRecipe, emptyState }: RecipeListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (recipes.length === 0 && !isLoading) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-12 text-center">
            <h3 className="text-xl font-semibold">{emptyState.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                {emptyState.description}
            </p>
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe, index) => (
        <RecipeCard key={`${recipe.name}-${index}`} recipe={recipe} onSelectRecipe={onSelectRecipe} />
      ))}
    </div>
  );
}
