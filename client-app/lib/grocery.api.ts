import type { GroceryCategory } from '@/types';

const root = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface GroceryProductView {
  id: string;
  categoryId: string;
  name: string;
  unit: string;
  priceNaira: number;
}

export interface GroceryQuote {
  goodsNaira: number;
  serviceNaira: number;
  deliveryNaira: number;
  totalNaira: number;
}

export interface GroceryLine {
  productId: string;
  quantity: number;
}

type ApiResult<T> = { ok: true; data: T } | { ok: false };

async function readData<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${root}${path}`, {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
    if (!response.ok) return { ok: false };
    const body = (await response.json()) as { data: T };
    return { ok: true, data: body.data };
  } catch {
    return { ok: false };
  }
}

export function listCategories(): Promise<ApiResult<GroceryCategory[]>> {
  return readData('/api/v1/groceries/categories');
}

export function listProducts(categoryId: string): Promise<ApiResult<GroceryProductView[]>> {
  return readData(`/api/v1/groceries/categories/${categoryId}/products`);
}

export function quoteGrocery(lines: readonly GroceryLine[]): Promise<ApiResult<GroceryQuote>> {
  return readData('/api/v1/groceries/quotes', {
    method: 'POST',
    body: JSON.stringify({ lines }),
  });
}
