'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { cuisines } from '@/lib/cuisines';

export interface FilterValues {
    dietaryPreference: string;
    cookingTime: number;
    difficulty: 'any' | 'Easy' | 'Medium' | 'Hard';
    cuisine: string;
}

interface RecipeFiltersProps {
    filters: FilterValues;
    onFilterChange: (filters: FilterValues) => void;
}

export function RecipeFilters({ filters, onFilterChange }: RecipeFiltersProps) {
    const handleValueChange = <K extends keyof FilterValues>(key: K, value: FilterValues[K]) => {
        onFilterChange({ ...filters, [key]: value });
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <Label htmlFor="dietary-pref" className='text-xs'>Dietary Preference</Label>
                    <Select 
                        value={filters.dietaryPreference} 
                        onValueChange={(value) => handleValueChange('dietaryPreference', value)}
                    >
                        <SelectTrigger id="dietary-pref" className="h-9">
                            <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Any</SelectItem>
                            <SelectItem value="vegetarian">Vegetarian</SelectItem>
                            <SelectItem value="vegan">Vegan</SelectItem>
                            <SelectItem value="gluten-free">Gluten-Free</SelectItem>
                            <SelectItem value="dairy-free">Dairy-Free</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="cuisine" className='text-xs'>Cuisine</Label>
                    <Select
                        value={filters.cuisine}
                        onValueChange={(value) => handleValueChange('cuisine', value)}
                    >
                        <SelectTrigger id="cuisine" className="h-9">
                            <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            {cuisines.map(c => <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="difficulty" className='text-xs'>Difficulty</Label>
                     <Select 
                        value={filters.difficulty} 
                        onValueChange={(value: FilterValues['difficulty']) => handleValueChange('difficulty', value)}
                    >
                        <SelectTrigger id="difficulty" className="h-9">
                            <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="cooking-time" className='text-xs'>Max Time: {filters.cookingTime} min</Label>
                    <Slider
                        id="cooking-time"
                        min={10}
                        max={180}
                        step={5}
                        value={[filters.cookingTime]}
                        onValueChange={(value) => handleValueChange('cookingTime', value[0])}
                    />
                </div>
            </div>
        </div>
    );
}
