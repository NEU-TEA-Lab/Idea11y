import React, { createContext, useContext, useState } from 'react';
import { NoteMetadata } from '../components/types';
import { useNoteMetadata } from '../hooks/useNoteMetadata';

interface MetadataContextType {
  metadataGlobal: Record<string, NoteMetadata>;
  fetchMetadata: (itemId: string) => Promise<NoteMetadata>;
}

const MetadataContext = createContext<MetadataContextType | undefined>(undefined);

export const MetadataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metadataGlobal, setMetadataGlobal] = useState<Record<string, NoteMetadata>>({});
  const { getMetadata } = useNoteMetadata();

  const fetchMetadata = async (itemId: string) => {
    // if (!metadataGlobal[itemId]) {
      
    // }
    const noteMetadata = await getMetadata(itemId);
      setMetadataGlobal(prev => ({
        ...prev,
        [itemId]: noteMetadata
      }));
    return noteMetadata;
    // return metadataGlobal[itemId];
  };

  return (
    <MetadataContext.Provider value={{ metadataGlobal, fetchMetadata }}>
      {children}
    </MetadataContext.Provider>
  );
};

export const useMetadata = () => {
  const context = useContext(MetadataContext);
  if (!context) {
    throw new Error('useMetadata must be used within a MetadataProvider');
  }
  return context;
};