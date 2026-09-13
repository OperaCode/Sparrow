import { createContext, useContext, useState, type ReactNode } from 'react';
import type { SavedAddress } from '@/types';

interface AddressBookContextValue {
  savedAddresses: SavedAddress[];
  addSavedAddress: (address: Omit<SavedAddress, 'id'>) => void;
  removeSavedAddress: (id: string) => void;
}

const AddressBookContext = createContext<AddressBookContextValue>({
  savedAddresses: [],
  addSavedAddress: () => {},
  removeSavedAddress: () => {},
});

export function AddressBookProvider({ children }: { children: ReactNode }) {
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  const addSavedAddress = (address: Omit<SavedAddress, 'id'>) => {
    setSavedAddresses((prev) => [...prev, { ...address, id: `saved-${Date.now()}` }]);
  };

  const removeSavedAddress = (id: string) => {
    setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <AddressBookContext.Provider value={{ savedAddresses, addSavedAddress, removeSavedAddress }}>
      {children}
    </AddressBookContext.Provider>
  );
}

export function useAddressBook() {
  return useContext(AddressBookContext);
}
