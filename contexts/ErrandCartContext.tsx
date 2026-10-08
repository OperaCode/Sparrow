import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { CartItemType } from '@/types';

export type ErrandService = 'groceries' | 'food';

export interface ErrandCartLine {
  itemId: string;
  itemType: CartItemType;
  name: string;
  unit: string | null;
  unitPrice: number;
  quantity: number;
}

interface DestinationDetails {
  destinationAddress: string;
  destinationLandmark: string;
  destinationContactName: string;
  destinationContactPhone: string;
}

interface ErrandCartState extends DestinationDetails {
  service: ErrandService | null;
  vendorId: string | null;
  vendorName: string | null;
  items: ErrandCartLine[];
}

const initialState: ErrandCartState = {
  service: null,
  vendorId: null,
  vendorName: null,
  items: [],
  destinationAddress: '',
  destinationLandmark: '',
  destinationContactName: '',
  destinationContactPhone: '',
};

interface ErrandCartContextValue extends ErrandCartState {
  goodsSubtotal: number;
  itemCount: number;
  startService: (service: ErrandService) => void;
  selectVendor: (vendorId: string, vendorName: string) => void;
  getQuantity: (itemId: string) => number;
  addItem: (line: Omit<ErrandCartLine, 'quantity'>) => void;
  incrementItem: (line: Omit<ErrandCartLine, 'quantity'>) => void;
  decrementItem: (itemId: string) => void;
  removeItem: (itemId: string) => void;
  updateDestination: (partial: Partial<DestinationDetails>) => void;
  clearCart: () => void;
}

const ErrandCartContext = createContext<ErrandCartContextValue | null>(null);

export function ErrandCartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ErrandCartState>(initialState);

  const startService = (service: ErrandService) => {
    setState((prev) => (prev.service === service ? prev : { ...initialState, service }));
  };

  const selectVendor = (vendorId: string, vendorName: string) => {
    setState((prev) =>
      prev.vendorId === vendorId ? prev : { ...prev, vendorId, vendorName, items: [] },
    );
  };

  const getQuantity = (itemId: string) => state.items.find((i) => i.itemId === itemId)?.quantity ?? 0;

  const addItem = (line: Omit<ErrandCartLine, 'quantity'>) => {
    setState((prev) => {
      const existing = prev.items.find((i) => i.itemId === line.itemId);
      if (existing) {
        return {
          ...prev,
          items: prev.items.map((i) => (i.itemId === line.itemId ? { ...i, quantity: i.quantity + 1 } : i)),
        };
      }
      return { ...prev, items: [...prev.items, { ...line, quantity: 1 }] };
    });
  };

  const incrementItem = addItem;

  const decrementItem = (itemId: string) => {
    setState((prev) => {
      const existing = prev.items.find((i) => i.itemId === itemId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return { ...prev, items: prev.items.filter((i) => i.itemId !== itemId) };
      }
      return {
        ...prev,
        items: prev.items.map((i) => (i.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i)),
      };
    });
  };

  const removeItem = (itemId: string) => {
    setState((prev) => ({ ...prev, items: prev.items.filter((i) => i.itemId !== itemId) }));
  };

  const updateDestination = (partial: Partial<DestinationDetails>) => {
    setState((prev) => ({ ...prev, ...partial }));
  };

  const clearCart = () => setState(initialState);

  const goodsSubtotal = useMemo(
    () => state.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [state.items],
  );
  const itemCount = useMemo(() => state.items.reduce((sum, i) => sum + i.quantity, 0), [state.items]);

  return (
    <ErrandCartContext.Provider
      value={{
        ...state,
        goodsSubtotal,
        itemCount,
        startService,
        selectVendor,
        getQuantity,
        addItem,
        incrementItem,
        decrementItem,
        removeItem,
        updateDestination,
        clearCart,
      }}
    >
      {children}
    </ErrandCartContext.Provider>
  );
}

export function useErrandCart() {
  const ctx = useContext(ErrandCartContext);
  if (!ctx) throw new Error('useErrandCart must be used within an ErrandCartProvider');
  return ctx;
}
