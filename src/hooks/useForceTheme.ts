import { useEffect } from "react";
import { useTheme } from "next-themes";

export function useForceTheme(forcedTheme: "light" | "dark") {
  const { setTheme } = useTheme();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    
    setTheme(forcedTheme);
    
    return () => {
      if (savedTheme) {
        setTheme(savedTheme);
      }
    };
  }, [forcedTheme, setTheme]);
}
