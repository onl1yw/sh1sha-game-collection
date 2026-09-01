import {
  Suspense,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from "react";

import { GameCollectionScreen } from "../features/game-collection/GameCollectionScreen";
import { SettingsScreen } from "../features/settings/SettingsScreen";
import { GameErrorBoundary } from "./GameErrorBoundary";
import { GameLoadingScreen } from "./GameLoadingScreen";
import {
  findGameModule,
  gameCatalogState,
  gameModules,
} from "./gameRegistry";
import { createGameStorage } from "./gameStorage";
import { useAppPreferences } from "./preferences/useAppPreferences";

type AppRoute =
  | { screen: "collection" }
  | { screen: "game"; gameId: string };

export function App() {
  const preferences = useAppPreferences();
  const [route, setRoute] = useState<AppRoute>({ screen: "collection" });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsTriggerRef = useRef<HTMLElement | null>(null);
  const settingsScrollRef = useRef({ x: 0, y: 0 });
  const restoreSettingsContextRef = useRef(false);
  const gameStorages = useMemo(
    () => new Map(gameModules.map((game) => [
      game.id,
      createGameStorage(game.id),
    ])),
    [],
  );

  const openSettings = useCallback((
    event?: SyntheticEvent<HTMLElement>,
  ) => {
    settingsTriggerRef.current = event?.currentTarget
      ?? (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null);
    settingsScrollRef.current = { x: window.scrollX, y: window.scrollY };
    setSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    restoreSettingsContextRef.current = true;
    setSettingsOpen(false);
  }, []);

  useLayoutEffect(() => {
    if (settingsOpen || !restoreSettingsContextRef.current) return;

    restoreSettingsContextRef.current = false;
    const trigger = settingsTriggerRef.current;
    const scroll = settingsScrollRef.current;
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    if (window.scrollX !== scroll.x || window.scrollY !== scroll.y) {
      window.scrollTo(scroll.x, scroll.y);
    }
  }, [settingsOpen]);

  let activeScreen: ReactNode = null;
  if (route.screen === "game") {
    const game = findGameModule(route.gameId);
    if (game) {
      const GameApp = game.App;
      activeScreen = (
        <GameErrorBoundary
          key={game.id}
          gameTitle={game.title}
          onExit={() => setRoute({ screen: "collection" })}
        >
          <Suspense fallback={<GameLoadingScreen />}>
            <GameApp
              paused={settingsOpen}
              preferences={{
                showSensitiveContent: preferences.showSensitiveThemes,
                soundEnabled: preferences.soundEnabled && !settingsOpen,
                soundVolume: preferences.soundVolume,
              }}
              storage={gameStorages.get(game.id) ?? null}
              onExit={() => setRoute({ screen: "collection" })}
              onOpenSettings={openSettings}
            />
          </Suspense>
        </GameErrorBoundary>
      );
    }
  }

  if (!activeScreen) {
    activeScreen = <GameCollectionScreen
      games={gameModules.map((game) => ({
        id: game.id,
        title: game.title,
        description: game.description,
        ...(game.continueDescription
          ? { continueDescription: game.continueDescription }
          : {}),
        Icon: game.Icon,
        ...(game.iconTone ? { iconTone: game.iconTone } : {}),
        hasSavedSession: gameCatalogState(
          game,
          gameStorages.get(game.id) ?? null,
        ).hasSavedSession,
      }))}
      onOpenSettings={openSettings}
      onOpenGame={(gameId) => setRoute({ screen: "game", gameId })}
    />;
  }

  return (
    <>
      <div hidden={settingsOpen}>
        {activeScreen}
      </div>
      {settingsOpen ? (
        <SettingsScreen
          colorTheme={preferences.colorTheme}
          showSensitiveThemes={preferences.showSensitiveThemes}
          soundEnabled={preferences.soundEnabled}
          soundVolume={preferences.soundVolume}
          onBack={closeSettings}
          onColorThemeChange={preferences.setColorTheme}
          onSensitiveThemesChange={preferences.setShowSensitiveThemes}
          onSoundEnabledChange={preferences.setSoundEnabled}
          onSoundVolumeChange={preferences.setSoundVolume}
        />
      ) : null}
    </>
  );
}
