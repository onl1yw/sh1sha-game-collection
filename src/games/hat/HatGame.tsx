import { useEffect, useMemo, useReducer, useState } from "react";

import type { GameHostProps } from "../../app/gameModule";
import { HatScreenRouter } from "./app/HatScreenRouter";
import { hatGameReducer } from "./app/state/gameReducer";
import { createInitialHatSetup } from "./domain/setup";
import type { HatTheme } from "./domain/theme";
import { HttpHatThemeRepository } from "./infrastructure/themes/HttpHatThemeRepository";

export default function HatGame({
  paused,
  preferences,
  onExit,
  onOpenSettings,
}: GameHostProps) {
  const repository = useMemo(() => new HttpHatThemeRepository(), []);
  const [catalog, setCatalog] = useState<{
    status: "loading" | "ready";
    themes: HatTheme[];
    errors: string[];
  }>({ status: "loading", themes: [], errors: [] });
  const [state, dispatch] = useReducer(
    hatGameReducer,
    { phase: "setup", setup: createInitialHatSetup([]) },
  );

  useEffect(() => {
    const controller = new AbortController();
    void repository.loadThemes(controller.signal).then((result) => {
      setCatalog({ status: "ready", themes: result.themes, errors: result.errors });
      dispatch({
        type: "reset-setup",
        setup: createInitialHatSetup(result.themes
          .filter((theme) => !theme.sensitive)
          .map((theme) => theme.id)),
      });
    });
    return () => controller.abort();
  }, [repository]);

  const visibleThemes = catalog.themes.filter(
    (theme) => preferences.showSensitiveContent || !theme.sensitive,
  );
  return (
    <HatScreenRouter
      state={state}
      dispatch={dispatch}
      themes={visibleThemes}
      catalogStatus={catalog.status}
      catalogWarnings={catalog.errors}
      paused={paused}
      onExit={onExit}
      onOpenSettings={onOpenSettings}
    />
  );
}
