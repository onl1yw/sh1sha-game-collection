import type { GameHostProps } from "../../app/gameModule";
import { MafiaScreenRouter } from "./app/MafiaScreenRouter";
import { MafiaGameProvider } from "./app/state/MafiaGameProvider";

export default function MafiaGame(props: GameHostProps) {
  return (
    <MafiaGameProvider
      soundEnabled={props.preferences.soundEnabled}
      soundVolume={props.preferences.soundVolume / 100}
    >
      <MafiaScreenRouter
        onExit={props.onExit}
        onOpenSettings={props.onOpenSettings}
      />
    </MafiaGameProvider>
  );
}
