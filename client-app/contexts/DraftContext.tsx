import { createContext, useContext, useState, type ReactNode } from 'react';
import type {
  Community,
  ErrandCategory,
  ErrandTier,
  PackageCategory,
  PackageSize,
  PricingStatus,
  ServiceType,
  SpecialPickupTier,
  ZoneTier,
} from '@/types';
import type { ZoneSelection } from '@/lib/pricing';

export interface DeliveryDraft {
  pickupAddress: string;
  pickupLandmark: string;
  pickupContactName: string;
  pickupContactPhone: string;
  pickupLatitude: number | null;
  pickupLongitude: number | null;

  destinationAddress: string;
  destinationLandmark: string;
  destinationContactName: string;
  destinationContactPhone: string;
  destinationLatitude: number | null;
  destinationLongitude: number | null;

  packageCategory: PackageCategory | null;
  packageDescription: string;
  packageSize: PackageSize | null;
  packagePhotoUrl: string | null;

  pickupZone: ZoneSelection;
  destinationZone: ZoneSelection;
  price: number | null;

  serviceType: ServiceType;
  zoneTier: ZoneTier | null;
  pricingStatus: PricingStatus;

  // Special Pickup — "item is somewhere else" (business doc §3.2)
  itemLocation: 'with_me' | 'elsewhere';
  specialPickupZone: ZoneSelection;
  specialPickupTier: SpecialPickupTier | null;
  specialPickupFee: number | null;

  // Errand
  errandCategory: ErrandCategory | null;
  errandTier: ErrandTier | null;
  errandFee: number | null;
  estimatedItemCost: number | null;
}

const initialDraft: DeliveryDraft = {
  pickupAddress: '',
  pickupLandmark: '',
  pickupContactName: '',
  pickupContactPhone: '',
  pickupLatitude: null,
  pickupLongitude: null,
  destinationAddress: '',
  destinationLandmark: '',
  destinationContactName: '',
  destinationContactPhone: '',
  destinationLatitude: null,
  destinationLongitude: null,
  packageCategory: null,
  packageDescription: '',
  packageSize: null,
  packagePhotoUrl: null,
  pickupZone: null,
  destinationZone: null,
  price: null,
  serviceType: 'standard',
  zoneTier: null,
  pricingStatus: 'auto',
  itemLocation: 'with_me',
  specialPickupZone: null,
  specialPickupTier: null,
  specialPickupFee: null,
  errandCategory: null,
  errandTier: null,
  errandFee: null,
  estimatedItemCost: null,
};

interface DraftContextValue {
  draft: DeliveryDraft;
  updateDraft: (partial: Partial<DeliveryDraft>) => void;
  resetDraft: () => void;
}

const DraftContext = createContext<DraftContextValue>({
  draft: initialDraft,
  updateDraft: () => {},
  resetDraft: () => {},
});

export function DraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<DeliveryDraft>(initialDraft);

  const updateDraft = (partial: Partial<DeliveryDraft>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  };

  const resetDraft = () => setDraft(initialDraft);

  return (
    <DraftContext.Provider value={{ draft, updateDraft, resetDraft }}>
      {children}
    </DraftContext.Provider>
  );
}

export function useDraft() {
  return useContext(DraftContext);
}
