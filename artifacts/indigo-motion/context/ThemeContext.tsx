import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextValue {
  isDark: boolean;
  setIsDark: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue>({ isDark: true, setIsDark: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDarkState] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("im_theme").then((val) => {
      if (val !== null) setIsDarkState(val === "dark");
    });
  }, []);

  const setIsDark = (v: boolean) => {
    setIsDarkState(v);
    AsyncStorage.setItem("im_theme", v ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
