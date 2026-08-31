import { useEffect, useMemo, useReducer, useState } from "react";

import type { GameHostProps } from "../../app/gameModule";
import { AliasScreenRouter } from "./app/AliasScreenRouter";
import { aliasGameReducer } from "./app/state/gameReducer";
import { createInitialSetup } from "./domain/setup";
import type { AliasTheme } from "./domain/theme";
import { HttpAliasThemeRepository } from "./infrastructure/themes/HttpAliasThemeRepository";

export default function AliasGame({
  preferences,
  onExit,
  onOpenSettings,
}: GameHostProps) {
  const repository = useMemo(() => new HttpAliasThemeRepository(), []);
  const [catalog, setCatalog] = useState<{
    status: "loading" | "ready";
    themes: AliasTheme[];
    errors: string[];
  }>({ status: "loading", themes: [], errors: [] });
  const [state, dispatch] = useReducer(
    aliasGameReducer,
    { phase: "setup", setup: createInitialSetup([]) },
  );

  useEffect(() => {
    const controller = new AbortController();
    void repository.loadThemes(controller.signal).then((result) => {
      setCatalog({ status: "ready", themes: result.themes, errors: result.errors });
      dispatch({
        type: "reset-setup",
        setup: createInitialSetup(result.themes.map((theme) => theme.id)),
      });
    });
    return () => controller.abort();
  }, [repository]);

  const visibleThemes = catalog.themes.filter(
    (theme) => preferences.showSensitiveContent || !theme.sensitive,
  );
  return (
    <AliasScreenRouter
      state={state}
      dispatch={dispatch}
      themes={visibleThemes}
      catalogStatus={catalog.status}
      catalogWarnings={catalog.errors}
      onExit={onExit}
      onOpenSettings={onOpenSettings}
    />
  );
}
