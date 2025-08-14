import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const KEY = "dd_settings_v1";

const defaultSettings = {
  focusGoalMinutes: 60,
  theme: "light", // 'light' | 'dark'
};

export const SettingsContext = createContext({
  settings: defaultSettings,
  setFocusGoal: () => {},
  toggleTheme: () => {},
  setTheme: () => {},
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Apply theme by setting a data-theme on <html>
  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  const setFocusGoal = (minutes) =>
    setSettings((s) => ({
      ...s,
      // Allow custom goal >=1 minute (user requested no restriction to 5-minute steps)
      focusGoalMinutes: Math.max(1, Number(minutes) || 60),
    }));
  const setTheme = (theme) => setSettings((s) => ({ ...s, theme }));
  const toggleTheme = () =>
    setSettings((s) => ({
      ...s,
      theme: s.theme === "dark" ? "light" : "dark",
    }));

  const value = useMemo(
    () => ({ settings, setFocusGoal, setTheme, toggleTheme }),
    [settings]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
