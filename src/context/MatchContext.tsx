import React, { createContext, useContext, useMemo } from 'react';
import { Match, Database } from '../../types';
import { useDatabase } from './DatabaseContext';

interface MatchContextType {
  matches: Match[];
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export function MatchProvider({ children }: { children: React.ReactNode }) {
  const { db } = useDatabase();
  
  // Memoize matches to only re-render when matches actually change
  const matches = useMemo(() => db.matches, [db.matches]);

  return (
    <MatchContext.Provider value={{ matches }}>
      {children}
    </MatchContext.Provider>
  );
}

export function useMatches() {
  const context = useContext(MatchContext);
  if (context === undefined) {
    throw new Error("useMatches must be used within a MatchProvider");
  }
  return context;
}
