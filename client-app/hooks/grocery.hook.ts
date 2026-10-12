import { useEffect, useState } from 'react';
import type { GroceryCategory } from '@/types';
import {
  listCategories,
  listProducts,
  quoteGrocery,
  type GroceryLine,
  type GroceryProductView,
  type GroceryQuote,
} from '@/lib/grocery.api';

export function useGroceryCategories() {
  const [categories, setCategories] = useState<GroceryCategory[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    listCategories().then((result) => {
      if (!active) return;
      if (!result.ok) {
        setFailed(true);
        return;
      }
      setCategories(result.data);
    });
    return () => {
      active = false;
    };
  }, []);

  return { categories, failed };
}

export function useGroceryProducts(categoryId: string) {
  const [products, setProducts] = useState<GroceryProductView[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!categoryId) {
      setFailed(true);
      return;
    }
    let active = true;
    listProducts(categoryId).then((result) => {
      if (!active) return;
      if (!result.ok) {
        setFailed(true);
        return;
      }
      setProducts(result.data);
    });
    return () => {
      active = false;
    };
  }, [categoryId]);

  return { products, failed };
}

export function useGroceryQuote(lines: readonly GroceryLine[]) {
  const key = lines.map((line) => `${line.productId}:${line.quantity}`).join('|');
  const [quote, setQuote] = useState<GroceryQuote | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (key === '') {
      setQuote(null);
      setFailed(false);
      return;
    }
    let active = true;
    setQuote(null);
    setFailed(false);
    quoteGrocery(lines).then((result) => {
      if (!active) return;
      if (!result.ok) {
        setFailed(true);
        return;
      }
      setQuote(result.data);
    });
    return () => {
      active = false;
    };
  }, [key, lines]);

  return { quote, failed };
}
