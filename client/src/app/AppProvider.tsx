"use client";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

interface AppContextType {
  sessionToken: string;
  setSessionToken: Dispatch<SetStateAction<string>>;
}

// Create the context with an initial placeholder value
const AppContext = createContext<AppContextType>({
  sessionToken: "",
  setSessionToken: () => {}, // Default function to avoid errors during initialization
});

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must used within an AppProvider");
  }
  return context;
};

export default function AppProvider({
  children,
  initialSessionToken = ``,
}: {
  children: React.ReactNode;
  initialSessionToken?: string;
}) {
  const [sessionToken, setSessionToken] = useState<string>(initialSessionToken);

  return (
    <AppContext.Provider value={{ sessionToken, setSessionToken }}>
      {children}
    </AppContext.Provider>
  );
}
