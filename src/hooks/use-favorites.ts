'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Recipe } from '@/types';
import { useToast } from './use-toast';

const FAVORITES_KEY = 'ai-chef-favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(FAVORITES_KEY);
      if (item) {
        setFavorites(JSON.parse(item));
      }
    } catch (error) {
      console.warn('Could not read favorites from localStorage', error);
    }
  }, []);

  const saveFavorites = (newFavorites: Recipe[]) => {
    try {
      setFavorites(newFavorites);
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.warn('Could not save favorites to localStorage', error);
    }
  };

  const addFavorite = useCallback((recipe: Recipe) => {
    const newFavorites = [...favorites, { ...recipe, rating: 0 }];
    saveFavorites(newFavorites);
    toast({
        title: "Added to favorites!",
        description: `"${recipe.name}" has been saved.`
    });
  }, [favorites, toast]);

  const removeFavorite = useCallback((recipeName: string) => {
    const newFavorites = favorites.filter((fav) => fav.name !== recipeName);
    saveFavorites(newFavorites);
    toast({
        title: "Removed from favorites",
        description: `"${recipeName}" has been removed.`
    });
  }, [favorites, toast]);
  
  const updateRating = useCallback((recipeName: string, rating: number) => {
      const newFavorites = favorites.map(fav => 
          fav.name === recipeName ? { ...fav, rating } : fav
      );
      saveFavorites(newFavorites);
      toast({
          title: "Rating Saved",
          description: `You rated "${recipeName}" ${rating} stars.`
      })
  }, [favorites, toast]);

  const isFavorite = useCallback((recipeName: string) => {
    return favorites.some((fav) => fav.name === recipeName);
  }, [favorites]);

  const getFavorite = useCallback((recipeName: string) => {
      return favorites.find(fav => fav.name === recipeName) || null;
  }, [favorites]);

  return { favorites, addFavorite, removeFavorite, isFavorite, updateRating, getFavorite };
};
