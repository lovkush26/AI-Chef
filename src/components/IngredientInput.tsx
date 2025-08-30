'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, ClipboardList, Loader2, Sparkles, Trash2, X, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { commonIngredients } from '@/lib/ingredients';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RecipeFilters, FilterValues } from '@/components/RecipeFilters';
import { cuisines } from '@/lib/cuisines';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from './ui/sidebar';

interface IngredientInputProps {
  onRecognizeIngredients: (imageDataUri: string) => void;
  onGetRecipes: (filters: FilterValues) => void;
  ingredients: string[];
  setIngredients: (ingredients: string[]) => void;
  isProcessing: boolean;
}

export default function IngredientInput({
  onRecognizeIngredients,
  onGetRecipes,
  ingredients,
  setIngredients,
  isProcessing,
}: IngredientInputProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [manualIngredients, setManualIngredients] = useState('');
  const [filters, setFilters] = useState<FilterValues>({
    dietaryPreference: 'none',
    cookingTime: 120,
    difficulty: 'any',
    cuisine: 'any',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        onRecognizeIngredients(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualAdd = () => {
    const newIngredients = manualIngredients
      .split(/,|\n/)
      .map(i => i.trim())
      .filter(i => i);
    
    setIngredients([...new Set([...ingredients, ...newIngredients])]);
    setManualIngredients('');
  };

  const addIngredient = (ingredient: string) => {
    if (!ingredients.includes(ingredient)) {
      setIngredients([...ingredients, ingredient]);
    }
  };

  const removeIngredient = (ingredientToRemove: string) => {
    setIngredients(ingredients.filter(i => i !== ingredientToRemove));
  };
  
  return (
    <div className='flex flex-col gap-4'>
      <SidebarGroup>
        <SidebarGroupLabel>Your Ingredients</SidebarGroupLabel>
        <SidebarGroupContent>
          <Tabs defaultValue="photo">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="photo"><Camera className="mr-2 h-4 w-4" />Photo</TabsTrigger>
              <TabsTrigger value="manual"><ClipboardList className="mr-2 h-4 w-4" />Manual</TabsTrigger>
              <TabsTrigger value="list"><List className="mr-2 h-4 w-4" />List</TabsTrigger>
            </TabsList>
            <TabsContent value="photo" className="mt-4">
              <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-border p-8 text-center">
                {imagePreview ? (
                  <div className="relative">
                    <Image src={imagePreview} alt="Ingredients preview" width={100} height={100} className="rounded-lg object-cover" />
                    <Button variant="destructive" size="icon" className="absolute -right-2 -top-2 h-7 w-7 rounded-full" onClick={() => setImagePreview(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Camera className="h-12 w-12 text-muted-foreground" />
                )}
                <p className="text-xs text-muted-foreground">Upload a photo of your ingredients</p>
                <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                  {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                  {isProcessing ? 'Recognizing...' : 'Select'}
                </Button>
                <Input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  disabled={isProcessing}
                />
              </div>
            </TabsContent>
            <TabsContent value="manual" className="mt-4">
              <div className="space-y-2">
                  <Label htmlFor="manual-ingredients" className='text-xs'>Ingredients</Label>
                  <Textarea
                    id="manual-ingredients"
                    placeholder="chicken, broccoli..."
                    value={manualIngredients}
                    onChange={(e) => setManualIngredients(e.target.value)}
                    rows={3}
                  />
                  <Button size="sm" onClick={handleManualAdd}>Add</Button>
              </div>
            </TabsContent>
            <TabsContent value="list" className="mt-4 max-h-60 overflow-y-auto">
              <Accordion type="multiple" className="w-full">
                {commonIngredients.map(category => (
                  <AccordionItem key={category.name} value={category.name}>
                    <AccordionTrigger className="text-xs font-semibold">{category.name}</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-1">
                        {category.items.map(item => (
                          <Button 
                            key={item} 
                            variant="outline" 
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => addIngredient(item)}
                            disabled={ingredients.includes(item)}
                          >
                            {item}
                          </Button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          </Tabs>

          {ingredients.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-semibold">Current Ingredients:</h3>
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setIngredients([])}>
                  <Trash2 className="mr-2 h-3 w-3" /> Clear
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {ingredients.map(ing => (
                  <Badge key={ing} variant="secondary" className="py-0.5 px-2">
                    {ing}
                    <button onClick={() => removeIngredient(ing)} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </SidebarGroupContent>
      </SidebarGroup>
      
      <SidebarGroup>
        <SidebarGroupLabel>Filters</SidebarGroupLabel>
        <SidebarGroupContent>
          <RecipeFilters filters={filters} onFilterChange={setFilters} />
        </SidebarGroupContent>
      </SidebarGroup>
      
      <div className="p-2 mt-auto">
          <Button
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => onGetRecipes(filters)}
              disabled={isProcessing || ingredients.length === 0}
          >
              {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
              )}
              Find Recipes
          </Button>
      </div>
    </div>
  );
}
