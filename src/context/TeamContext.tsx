import React, { createContext, useContext, useMemo } from 'react';
import { Team } from '../../types';
import { useDatabase } from './DatabaseContext';

interface TeamContextType {
  teams: Team[];
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { db } = useDatabase();
  
  // Memoize teams to only re-render when teams actually change
  const teams = useMemo(() => db.teams, [db.teams]);

  return (
    <TeamContext.Provider value={{ teams }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeams() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeams must be used within a TeamProvider");
  }
  return context;
}
