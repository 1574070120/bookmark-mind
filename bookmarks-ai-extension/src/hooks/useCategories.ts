import { useState, useCallback } from 'react';
import type { Category } from '../types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  const clearCategories = useCallback(() => {
    setCategories([]);
  }, []);

  return { categories, setCategories, clearCategories };
}
