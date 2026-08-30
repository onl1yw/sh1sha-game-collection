import { Suspense, useMemo, useState } from "react";

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
  | { screen: "settings"; returnToGameId: string | null }
  | { screen: "game"; gameId: string };

export function App() {
  const preferences = useAppPreferences();
  const [route, setRoute] = useState<AppRoute>({ screen: "collection" });
  const gameStorages = useMemo(
    () => new Map(gameModules.map((game) => [
      game.id,
      createGameStorage(game.id),
    ])),
    [],
  );

  if (route.screen === "settings") {
    return (
      <SettingsScreen
        colorTheme={preferences.colorTheme}
        showSensitiveThemes={preferences.showSensitiveThemes}
        onBack={() => setRoute(
          route.returnToGameId
            ? { screen: "game", gameId: route.returnToGameId }
            : { screen: "collection" },
        )}
        onColorThemeChange={preferences.setColorTheme}
        onSensitiveThemesChange={preferences.setShowSensitiveThemes}
      />
    );
  }

  if (route.screen === "game") {
    const game = findGameModule(route.gameId);
    if (game) {
      const GameApp = game.App;
      return (
        <GameErrorBoundary
          key={game.id}
          gameTitle={game.title}
          onExit={() => setRoute({ screen: "collection" })}
        >
          <Suspense fallback={<GameLoadingScreen />}>
            <GameApp
              preferences={{
                showSensitiveContent: preferences.showSensitiveThemes,
              }}
              storage={gameStorages.get(game.id) ?? null}
              onExit={() => setRoute({ screen: "collection" })}
              onOpenSettings={() => setRoute({
                screen: "settings",
                returnToGameId: game.id,
              })}
            />
          </Suspense>
        </GameErrorBoundary>
      );
    }
  }

  return (
    <GameCollectionScreen
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
      onOpenSettings={() => setRoute({
        screen: "settings",
        returnToGameId: null,
      })}
      onOpenGame={(gameId) => setRoute({ screen: "game", gameId })}
    />
  );
}
