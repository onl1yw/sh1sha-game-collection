import { useCallback, useEffect, useLayoutEffect, useState } from "react";

import {
  loadAppPreferences,
  saveAppPreferences,
  type AppPreferences,
  type ColorTheme,
} from "./appPreferences";

export interface AppPreferencesController extends AppPreferences {
  setColorTheme(theme: ColorTheme): void;
  setShowSensitiveThemes(show: boolean): void;
}

export function useAppPreferences(): AppPreferencesController {
  const [preferences, setPreferences] = useState(loadAppPreferences);

  useLayoutEffect(() => {
    document.documentElement.dataset.colorTheme = preferences.colorTheme;
    const themeColor = preferences.colorTheme === "dark" ? "#17191c" : "#f3f1ec";
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", themeColor);
  }, [preferences.colorTheme]);

  useEffect(() => {
    saveAppPreferences(preferences);
  }, [preferences]);

  const setColorTheme = useCallback((colorTheme: ColorTheme) => {
    setPreferences((current) => ({ ...current, colorTheme }));
  }, []);

  const setShowSensitiveThemes = useCallback((showSensitiveThemes: boolean) => {
    setPreferences((current) => ({
      ...current,
      showSensitiveThemes,
    }));
  }, []);

  return {
    ...preferences,
    setColorTheme,
    setShowSensitiveThemes,
  };
}
