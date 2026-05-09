import React, { createContext, useContext, useState } from "react";

interface AppContextType {
  hasSeenDisclaimer: boolean;
  setHasSeenDisclaimer: (value: boolean) => void;
}

const AppContext = createContext<AppContextType>({
  hasSeenDisclaimer: false,
  setHasSeenDisclaimer: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hasSeenDisclaimer, setHasSeenDisclaimer] = useState(false);

  return (
    <AppContext.Provider value={{ hasSeenDisclaimer, setHasSeenDisclaimer }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

// Dummy default export to satisfy Expo Router's route requirements
export default function AppContextRoute() {
  return null;
}
