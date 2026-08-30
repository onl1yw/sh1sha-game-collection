import { useMemo } from "react";

import type { GameHostProps } from "../../app/gameModule";
import { AppStatusBanner } from "./app/AppStatusBanner";
import { SpyScreenRouter } from "./app/SpyScreenRouter";
import { SpyGameProvider } from "./app/state/SpyGameProvider";
import { useGame } from "./app/state/useGame";
import { createSpyStorage } from "./infrastructure/storage/createSpyStorage";

export default function SpyGame(props: GameHostProps) {
  const storage = useMemo(
    () => createSpyStorage(props.storage),
    [props.storage],
  );
  return (
    <SpyGameProvider storage={storage}>
      <SpyGameContent {...props} />
    </SpyGameProvider>
  );
}

function SpyGameContent({
  preferences,
  onExit,
  onOpenSettings,
}: GameHostProps) {
  const { state } = useGame();
  return (
    <>
      <AppStatusBanner messages={statusMessages(state)} />
      <SpyScreenRouter
        showSensitiveThemes={preferences.showSensitiveContent}
        onExit={onExit}
        onOpenSettings={onOpenSettings}
      />
    </>
  );
}

function statusMessages(state: ReturnType<typeof useGame>["state"]): string[] {
  const messages: string[] = [];
  if (state.storageWarning) messages.push(state.storageWarning);

  if (state.catalog.themes.length > 0 && state.catalog.errors.length > 0) {
    const ids = state.catalog.errors
      .map((error) => error.themeId)
      .filter((id): id is string => Boolean(id));
    messages.push(
      ids.length > 0
        ? `Часть тематик пропущена: ${ids.join(", ")}. Остальные доступны.`
        : "Часть тематик не загрузилась. Остальные доступны.",
    );
  }
  return messages;
}
